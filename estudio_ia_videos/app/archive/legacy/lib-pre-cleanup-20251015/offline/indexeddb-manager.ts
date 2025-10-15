
/**
 * 🗄️ SPRINT 39 - IndexedDB Manager
 * Sistema offline-first real com IndexedDB para projetos locais
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ProjectData {
  id: string;
  name: string;
  content: any;
  thumbnail?: string;
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
  version: number;
}

interface OfflineAsset {
  id: string;
  projectId: string;
  type: 'image' | 'video' | 'audio' | 'model';
  url: string;
  blob: Blob;
  size: number;
  lastAccessed: Date;
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'project' | 'asset';
  data: any;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retries: number;
}

interface StudioDB extends DBSchema {
  projects: {
    key: string;
    value: ProjectData;
    indexes: {
      'by-sync-status': string;
      'by-modified': Date;
    };
  };
  assets: {
    key: string;
    value: OfflineAsset;
    indexes: {
      'by-project': string;
      'by-type': string;
    };
  };
  syncQueue: {
    key: string;
    value: SyncOperation;
    indexes: {
      'by-status': string;
      'by-timestamp': Date;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

export class IndexedDBManager {
  private db: IDBPDatabase<StudioDB> | null = null;
  private readonly DB_NAME = 'estudio-ia-videos-db';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    try {
      this.db = await openDB<StudioDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // Store: Projects
          if (!db.objectStoreNames.contains('projects')) {
            const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
            projectStore.createIndex('by-sync-status', 'syncStatus');
            projectStore.createIndex('by-modified', 'lastModified');
          }

          // Store: Assets
          if (!db.objectStoreNames.contains('assets')) {
            const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
            assetStore.createIndex('by-project', 'projectId');
            assetStore.createIndex('by-type', 'type');
          }

          // Store: Sync Queue
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncStore.createIndex('by-status', 'status');
            syncStore.createIndex('by-timestamp', 'timestamp');
          }

          // Store: Settings
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        },
      });

      console.log('✅ IndexedDB inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar IndexedDB:', error);
      throw error;
    }
  }

  // ========== PROJECTS ==========

  async saveProject(project: Omit<ProjectData, 'lastModified' | 'version'>): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');

    const existingProject = await this.db.get('projects', project.id);
    const version = existingProject ? existingProject.version + 1 : 1;

    const projectData: ProjectData = {
      ...project,
      lastModified: new Date(),
      version,
    };

    await this.db.put('projects', projectData);

    // Adicionar à fila de sync se necessário
    if (project.syncStatus === 'pending') {
      await this.addToSyncQueue({
        type: existingProject ? 'update' : 'create',
        entity: 'project',
        data: projectData,
      });
    }
  }

  async getProject(id: string): Promise<ProjectData | undefined> {
    if (!this.db) throw new Error('Database não inicializado');
    return await this.db.get('projects', id);
  }

  async getAllProjects(): Promise<ProjectData[]> {
    if (!this.db) throw new Error('Database não inicializado');
    return await this.db.getAll('projects');
  }

  async getProjectsByStatus(status: ProjectData['syncStatus']): Promise<ProjectData[]> {
    if (!this.db) throw new Error('Database não inicializado');
    return await this.db.getAllFromIndex('projects', 'by-sync-status', status);
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');
    
    // Adicionar à fila de sync para deletar remotamente
    await this.addToSyncQueue({
      type: 'delete',
      entity: 'project',
      data: { id },
    });

    // Deletar assets associados
    const assets = await this.db.getAllFromIndex('assets', 'by-project', id);
    for (const asset of assets) {
      await this.db.delete('assets', asset.id);
    }

    // Deletar projeto
    await this.db.delete('projects', id);
  }

  // ========== ASSETS ==========

  async saveAsset(asset: Omit<OfflineAsset, 'lastAccessed'>): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');

    const assetData: OfflineAsset = {
      ...asset,
      lastAccessed: new Date(),
    };

    await this.db.put('assets', assetData);
  }

  async getAsset(id: string): Promise<OfflineAsset | undefined> {
    if (!this.db) throw new Error('Database não inicializado');
    
    const asset = await this.db.get('assets', id);
    
    // Atualizar lastAccessed
    if (asset) {
      asset.lastAccessed = new Date();
      await this.db.put('assets', asset);
    }
    
    return asset;
  }

  async getAssetsByProject(projectId: string): Promise<OfflineAsset[]> {
    if (!this.db) throw new Error('Database não inicializado');
    return await this.db.getAllFromIndex('assets', 'by-project', projectId);
  }

  async deleteAsset(id: string): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');
    await this.db.delete('assets', id);
  }

  async cleanOldAssets(daysOld: number = 30): Promise<number> {
    if (!this.db) throw new Error('Database não inicializado');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const allAssets = await this.db.getAll('assets');
    let deletedCount = 0;
    
    for (const asset of allAssets) {
      if (asset.lastAccessed < cutoffDate) {
        await this.db.delete('assets', asset.id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  // ========== SYNC QUEUE ==========

  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'status' | 'retries'>): Promise<string> {
    if (!this.db) throw new Error('Database não inicializado');

    const syncOp: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...operation,
      timestamp: new Date(),
      status: 'pending',
      retries: 0,
    };

    await this.db.put('syncQueue', syncOp);
    return syncOp.id;
  }

  async getPendingSyncOperations(): Promise<SyncOperation[]> {
    if (!this.db) throw new Error('Database não inicializado');
    return await this.db.getAllFromIndex('syncQueue', 'by-status', 'pending');
  }

  async updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');
    
    const operation = await this.db.get('syncQueue', id);
    if (!operation) return;

    const updated = { ...operation, ...updates };
    await this.db.put('syncQueue', updated);
  }

  async clearCompletedSyncOperations(): Promise<number> {
    if (!this.db) throw new Error('Database não inicializado');
    
    const completed = await this.db.getAllFromIndex('syncQueue', 'by-status', 'completed');
    
    for (const op of completed) {
      await this.db.delete('syncQueue', op.id);
    }
    
    return completed.length;
  }

  // ========== SETTINGS ==========

  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');
    await this.db.put('settings', { key, value });
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database não inicializado');
    const result = await this.db.get('settings', key);
    return result?.value;
  }

  // ========== STATISTICS ==========

  async getStorageStats(): Promise<{
    projects: number;
    assets: number;
    totalSize: number;
    pendingSync: number;
    lastSync?: Date;
  }> {
    if (!this.db) throw new Error('Database não inicializado');

    const projects = await this.db.count('projects');
    const assets = await this.db.getAll('assets');
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    const pendingSync = await this.db.countFromIndex('syncQueue', 'by-status', 'pending');
    const lastSync = await this.getSetting('lastSyncDate');

    return {
      projects,
      assets: assets.length,
      totalSize,
      pendingSync,
      lastSync,
    };
  }

  // ========== MAINTENANCE ==========

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database não inicializado');
    
    await this.db.clear('projects');
    await this.db.clear('assets');
    await this.db.clear('syncQueue');
    await this.db.clear('settings');
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const offlineDB = new IndexedDBManager();
