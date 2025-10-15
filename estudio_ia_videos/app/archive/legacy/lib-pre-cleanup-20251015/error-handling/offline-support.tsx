/**
 * Offline Support utilities for client-side usage.
 * Provides a singleton OfflineManager, React hook helpers and UI indicator.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { errorLogger } from './error-logger';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
  url?: string;
  method?: HttpMethod;
}

interface OfflineData {
  projects: unknown[];
  templates: unknown[];
  userSettings: unknown;
  lastSync: number;
}

type OfflineCacheKey = keyof OfflineData;

const STORAGE_KEYS = {
  queue: 'offline-action-queue',
  data: 'offline-data-cache',
} as const;

const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3_000;

function now(): number {
  return Date.now();
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

class OfflineManager {
  private static instance: OfflineManager | null = null;

  private isOnline =
    typeof navigator !== 'undefined' ? navigator.onLine : true;

  private actionQueue: QueuedAction[] = [];
  private syncInProgress = false;
  private offlineData: OfflineData = {
    projects: [],
    templates: [],
    userSettings: {},
    lastSync: 0,
  };

  private constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    this.restoreState();
    this.registerListeners();
    this.checkStorageQuota().catch((error) => {
      errorLogger.logWarning('Failed to check storage quota', {
        component: 'OfflineManager',
        error,
      });
    });
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  destroy(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('beforeunload', this.syncBeforeUnload);
  }

  get online(): boolean {
    return this.isOnline;
  }

  get offline(): boolean {
    return !this.isOnline;
  }

  getCachedData<T extends OfflineCacheKey>(key: T): OfflineData[T] {
    return this.offlineData[key];
  }

  cacheData<T extends OfflineCacheKey>(
    key: T,
    value: OfflineData[T],
  ): void {
    this.offlineData[key] = value;
    this.offlineData.lastSync = now();
    this.persistState();
  }

  queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): void {
    const newAction: QueuedAction = {
      id: `${now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now(),
      retries: 0,
      maxRetries: action.maxRetries ?? MAX_RETRIES,
      ...action,
    };

    this.actionQueue.push(newAction);

    if (this.actionQueue.length > MAX_QUEUE_SIZE) {
      this.actionQueue.shift();
    }

    this.persistState();

    if (this.isOnline) {
      this.flushQueue().catch((error) => {
        errorLogger.logError({
          message: 'Failed to flush queue immediately after enqueue',
          error,
          context: { component: 'OfflineManager' },
        });
      });
    }
  }

  async flushQueue(): Promise<void> {
    if (this.syncInProgress || !this.actionQueue.length) {
      return;
    }

    this.syncInProgress = true;

    try {
      while (this.actionQueue.length && this.isOnline) {
        const action = this.actionQueue[0];

        try {
          await this.dispatchAction(action);
          this.actionQueue.shift();
        } catch (error) {
          action.retries += 1;

          const shouldRetry = action.retries <= action.maxRetries;

          errorLogger.logWarning('Failed to dispatch queued action', {
            component: 'OfflineManager',
            action: {
              id: action.id,
              type: action.type,
              retries: action.retries,
              maxRetries: action.maxRetries,
            },
            error,
          });

          if (!shouldRetry) {
            this.actionQueue.shift();
          } else {
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY_MS),
            );
          }
        }
      }
    } finally {
      this.persistState();
      this.syncInProgress = false;
    }
  }

  private async dispatchAction(action: QueuedAction): Promise<void> {
    if (!action.url || !action.method) {
      // If no HTTP endpoint is provided, assume the action is handled elsewhere.
      return Promise.resolve();
    }

    const response = await fetch(action.url, {
      method: action.method,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: action.payload ? JSON.stringify(action.payload) : undefined,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to dispatch offline action. Status: ${response.status}`,
      );
    }
  }

  private registerListeners(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('beforeunload', this.syncBeforeUnload);
  }

  private restoreState(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const queue = safeParse<QueuedAction[]>(
      localStorage.getItem(STORAGE_KEYS.queue),
      [],
    );

    const cachedData = safeParse<OfflineData>(
      localStorage.getItem(STORAGE_KEYS.data),
      this.offlineData,
    );

    this.actionQueue = Array.isArray(queue) ? queue : [];
    this.offlineData = { ...this.offlineData, ...cachedData };
  }

  private persistState(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(
      STORAGE_KEYS.queue,
      JSON.stringify(this.actionQueue),
    );
    localStorage.setItem(
      STORAGE_KEYS.data,
      JSON.stringify(this.offlineData),
    );
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    this.showNotification('Estudio IA', 'Conexao restaurada! Sincronizando dados...');
    this.flushQueue().catch((error) => {
      errorLogger.logError({
        message: 'Failed to flush queue after going online',
        error,
        context: { component: 'OfflineManager' },
      });
    });
    this.syncCachedData().catch((error) => {
      errorLogger.logWarning('Failed to sync cached data', {
        component: 'OfflineManager',
        error,
      });
    });
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    this.showNotification(
      'Estudio IA',
      'Voce esta offline. Alteracoes serao sincronizadas quando possivel.',
    );
  };

  private syncBeforeUnload = (): void => {
    if (!this.isOnline || !this.actionQueue.length) {
      return;
    }

    const payload = JSON.stringify({
      actions: this.actionQueue.slice(0, 10),
    });

    try {
      navigator.sendBeacon('/api/sync', payload);
    } catch (error) {
      errorLogger.logWarning('Failed to sync queue on beforeunload', {
        component: 'OfflineManager',
        error,
      });
    }
  };

  private async checkStorageQuota(): Promise<void> {
    if (
      typeof navigator === 'undefined' ||
      !navigator.storage ||
      !navigator.storage.estimate
    ) {
      return;
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage =
        estimate.usage && estimate.quota
          ? (estimate.usage / estimate.quota) * 100
          : 0;

      if (usage > 80) {
        errorLogger.logWarning('Storage quota above 80%', {
          component: 'OfflineManager',
          usagePercent: usage,
        });
      } else {
        errorLogger.logDebug('Storage quota OK', {
          component: 'OfflineManager',
          usagePercent: usage,
        });
      }
    } catch (error) {
      errorLogger.logWarning('Storage estimate failed', {
        component: 'OfflineManager',
        error,
      });
    }
  }

  private async syncCachedData(): Promise<void> {
    try {
      const [projects, templates, settings] = await Promise.allSettled([
        fetch('/api/projects', { headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/templates', { headers: { 'Cache-Control': 'no-cache' } }),
        fetch('/api/user/settings', {
          headers: { 'Cache-Control': 'no-cache' },
        }),
      ]);

      if (projects.status === 'fulfilled' && projects.value.ok) {
        this.cacheData('projects', await projects.value.json());
      }

      if (templates.status === 'fulfilled' && templates.value.ok) {
        this.cacheData('templates', await templates.value.json());
      }

      if (settings.status === 'fulfilled' && settings.value.ok) {
        this.cacheData('userSettings', await settings.value.json());
      }
    } catch (error) {
      errorLogger.logWarning('Failed syncing cached datasets', {
        component: 'OfflineManager',
        error,
      });
    }
  }

  private showNotification(title: string, body: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
      });
    }
  }
}

export const offlineManager =
  typeof window !== 'undefined' ? OfflineManager.getInstance() : null;

export function useOfflineStatus() {
  const managerRef = useRef(offlineManager);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) {
      return;
    }

    const updateStatus = () => setIsOffline(manager.offline);
    updateStatus();

    const interval = window.setInterval(updateStatus, 2_000);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const queueAction = useCallback(
    (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => {
      managerRef.current?.queueAction(action);
    },
    [],
  );

  const getCachedData = useCallback(
    <T extends OfflineCacheKey>(key: T): OfflineData[T] | null => {
      return managerRef.current?.getCachedData(key) ?? null;
    },
    [],
  );

  const value = useMemo(
    () => ({
      isOffline,
      isOnline: !isOffline,
      queueAction,
      getCachedData,
    }),
    [getCachedData, isOffline, queueAction],
  );

  return value;
}

export function OfflineIndicator() {
  const { isOffline } = useOfflineStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-yellow-900">
      Modo offline ativado. Suas alteracoes serao sincronizadas quando a conexao
      for restaurada.
    </div>
  );
}
