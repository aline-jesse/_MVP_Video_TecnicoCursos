
/**
 * SPRINT 34 - BACKGROUND SYNC
 * Background synchronization for PWA
 */

export interface SyncTask {
  id: string;
  type: 'upload' | 'render' | 'update';
  data: any;
  priority: number;
  createdAt: Date;
}

/**
 * Background Sync Manager
 */
export class BackgroundSyncManager {
  private serviceWorkerRegistration?: ServiceWorkerRegistration;

  /**
   * Initialize background sync
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
  }

  /**
   * Register a sync task
   */
  async registerSync(tag: string): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      await this.init();
    }

    // @ts-ignore - SyncManager might not be in types yet
    if ('sync' in this.serviceWorkerRegistration) {
      try {
        // @ts-ignore
        await this.serviceWorkerRegistration.sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
        // Fallback to immediate sync
        await this.syncNow(tag);
      }
    } else {
      console.warn('Background Sync API not supported, syncing immediately');
      await this.syncNow(tag);
    }
  }

  /**
   * Sync immediately (fallback)
   */
  private async syncNow(tag: string): Promise<void> {
    // Implementation depends on the sync type
    console.log('Performing immediate sync for:', tag);
    
    // Trigger sync event manually
    if (this.serviceWorkerRegistration?.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'SYNC_NOW',
        tag,
      });
    }
  }

  /**
   * Schedule periodic sync (for Pro users)
   */
  async schedulePeriodicSync(tag: string, minInterval: number = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      await this.init();
    }

    // @ts-ignore - PeriodicSyncManager might not be in types yet
    if ('periodicSync' in this.serviceWorkerRegistration) {
      try {
        // @ts-ignore
        await this.serviceWorkerRegistration.periodicSync.register(tag, {
          minInterval,
        });
        console.log('Periodic sync registered:', tag);
      } catch (error) {
        console.error('Periodic sync registration failed:', error);
      }
    } else {
      console.warn('Periodic Sync API not supported');
    }
  }

  /**
   * Get sync tags
   */
  async getSyncTags(): Promise<string[]> {
    if (!this.serviceWorkerRegistration) {
      await this.init();
    }

    // @ts-ignore
    if ('sync' in this.serviceWorkerRegistration) {
      // @ts-ignore
      const tags = await this.serviceWorkerRegistration.sync.getTags();
      return tags;
    }

    return [];
  }

  /**
   * Queue task for background sync
   */
  async queueTask(task: Omit<SyncTask, 'id' | 'createdAt'>): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const fullTask: SyncTask = {
      id: taskId,
      ...task,
      createdAt: new Date(),
    };

    // Store task in IndexedDB
    const { getOfflineManager } = await import('./offline-manager');
    const offlineManager = getOfflineManager();
    await offlineManager.addToSyncQueue({
      id: taskId,
      type: 'update',
      resourceType: 'project',
      resourceId: task.data?.projectId || 'unknown',
      data: fullTask,
    });

    // Register sync
    await this.registerSync(`sync-${task.type}`);

    return taskId;
  }
}

/**
 * Background sync task handlers
 */
export const syncHandlers = {
  /**
   * Handle upload sync
   */
  handleUpload: async (data: any): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('projectId', data.projectId);

      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error('Upload sync failed:', error);
      return false;
    }
  },

  /**
   * Handle render sync
   */
  handleRender: async (data: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/render/submit-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.error('Render sync failed:', error);
      return false;
    }
  },

  /**
   * Handle update sync
   */
  handleUpdate: async (data: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/projects/${data.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
      });

      return response.ok;
    } catch (error) {
      console.error('Update sync failed:', error);
      return false;
    }
  },
};

// Global singleton
let backgroundSyncManager: BackgroundSyncManager | null = null;

export function getBackgroundSyncManager(): BackgroundSyncManager {
  if (!backgroundSyncManager) {
    backgroundSyncManager = new BackgroundSyncManager();
  }
  return backgroundSyncManager;
}
