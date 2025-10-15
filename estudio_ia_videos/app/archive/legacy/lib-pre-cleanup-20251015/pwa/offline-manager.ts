
/**
 * SPRINT 34 - PWA OFFLINE MANAGER
 * IndexedDB-based offline editing and synchronization
 */

export interface OfflineProject {
  id: string;
  name: string;
  data: any;
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  version: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resourceType: 'project' | 'slide' | 'asset';
  resourceId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

/**
 * IndexedDB wrapper for offline storage
 */
export class OfflineManager {
  private dbName = 'estudio-ia-videos-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB only available in browser'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          projectStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('type', 'type', { unique: false });
        }

        // Assets cache store
        if (!db.objectStoreNames.contains('assets')) {
          const assetsStore = db.createObjectStore('assets', { keyPath: 'url' });
          assetsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Save project offline
   */
  async saveProject(project: OfflineProject): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.put({
        ...project,
        lastModified: new Date(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get project from offline storage
   */
  async getProject(id: string): Promise<OfflineProject | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all offline projects
   */
  async getAllProjects(): Promise<OfflineProject[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Delete project from offline storage
   */
  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.put({
        ...item,
        timestamp: new Date(),
        retryCount: 0,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all items in sync queue
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Clear sync queue item
   */
  async clearQueueItem(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(): Promise<{ success: number; failed: number }> {
    const queue = await this.getSyncQueue();
    let success = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await this.syncItem(item);
        await this.clearQueueItem(item.id);
        success++;
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
        failed++;
        
        // Update retry count
        if (item.retryCount < 3) {
          await this.addToSyncQueue({
            ...item,
            id: `${item.id}_retry_${item.retryCount + 1}`,
          });
        }
      }
    }

    return { success, failed };
  }

  /**
   * Sync a single item to server
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const endpoint = `/api/${item.resourceType}s/${item.type === 'create' ? '' : item.resourceId}`;
    const method = item.type === 'delete' ? 'DELETE' : item.type === 'create' ? 'POST' : 'PUT';

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: item.type !== 'delete' ? JSON.stringify(item.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  /**
   * Cache asset for offline use
   */
  async cacheAsset(url: string, blob: Blob): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.put({
        url,
        blob,
        timestamp: new Date(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get cached asset
   */
  async getCachedAsset(url: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      const request = store.get(url);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.blob || null);
    });
  }

  /**
   * Clear old cached assets
   */
  async clearOldAssets(days: number = 7): Promise<void> {
    if (!this.db) await this.init();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffDate));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}

// Global singleton
let offlineManager: OfflineManager | null = null;

export function getOfflineManager(): OfflineManager {
  if (!offlineManager) {
    offlineManager = new OfflineManager();
  }
  return offlineManager;
}
