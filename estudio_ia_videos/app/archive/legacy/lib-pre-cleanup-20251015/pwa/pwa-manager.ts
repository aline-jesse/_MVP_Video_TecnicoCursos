
/**
 * 🔧 SPRINT 39 - PWA Manager
 * Gerenciador central do PWA
 */

import { offlineDB } from '@/lib/offline/indexeddb-manager';
import { syncManager } from '@/lib/offline/sync-manager';
import { pushManager } from '@/lib/notifications/push-manager';

export class PWAManager {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Inicializar IndexedDB
      await offlineDB.initialize();
      console.log('✅ IndexedDB inicializado');

      // Inicializar Sync Manager
      await syncManager.initialize({
        autoSync: true,
        syncInterval: 30000, // 30s
        maxRetries: 3,
      });
      console.log('✅ Sync Manager inicializado');

      // Inicializar Push Notifications
      const pushSupported = await pushManager.initialize();
      if (pushSupported) {
        console.log('✅ Push Notifications suportadas');
      }

      this.initialized = true;
      console.log('✅ PWA totalmente inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar PWA:', error);
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    return await pushManager.requestPermission();
  }

  async getOfflineStatus() {
    return await offlineDB.getStorageStats();
  }

  async forceSyncNow() {
    await syncManager.forceSyncNow();
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const pwaManager = new PWAManager();
