
/**
 * 🔄 SPRINT 39 - Sync Manager
 * Gerenciador de sincronização automática offline → online
 */

import { offlineDB } from './indexeddb-manager';

interface SyncOptions {
  autoSync: boolean;
  syncInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number;
}

export class SyncManager {
  private isOnline: boolean = true;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncing: boolean = false;
  private options: SyncOptions = {
    autoSync: true,
    syncInterval: 30000, // 30 segundos
    maxRetries: 3,
    retryDelay: 5000,
  };

  constructor() {
    this.setupNetworkMonitoring();
  }

  async initialize(options?: Partial<SyncOptions>): Promise<void> {
    this.options = { ...this.options, ...options };
    
    await offlineDB.initialize();

    if (this.options.autoSync) {
      this.startAutoSync();
    }

    console.log('✅ Sync Manager inicializado');
  }

  private setupNetworkMonitoring(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('🌐 Voltou online - iniciando sync');
      this.isOnline = true;
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Ficou offline');
      this.isOnline = false;
    });

    this.isOnline = navigator.onLine;
  }

  startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncing) {
        this.syncAll();
      }
    }, this.options.syncInterval);

    console.log('▶️ Auto-sync iniciado');
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏸️ Auto-sync pausado');
    }
  }

  async syncAll(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    if (!this.isOnline) {
      console.log('⚠️ Offline - sync adiado');
      return { success: false, synced: 0, failed: 0, errors: [] };
    }

    if (this.syncing) {
      console.log('⏳ Sync já em andamento');
      return { success: false, synced: 0, failed: 0, errors: [] };
    }

    this.syncing = true;
    console.log('🔄 Iniciando sincronização...');

    const errors: Array<{ id: string; error: string }> = [];
    let synced = 0;
    let failed = 0;

    try {
      const pendingOps = await offlineDB.getPendingSyncOperations();
      console.log(`📋 ${pendingOps.length} operações pendentes`);

      for (const op of pendingOps) {
        try {
          await offlineDB.updateSyncOperation(op.id, { status: 'processing' });

          // Executar operação de sync
          await this.executeSyncOperation(op);

          // Marcar como completa
          await offlineDB.updateSyncOperation(op.id, { status: 'completed' });
          synced++;

          console.log(`✅ Sincronizado: ${op.type} ${op.entity} (${op.id})`);
        } catch (error: any) {
          failed++;
          const errorMsg = error.message || 'Erro desconhecido';
          errors.push({ id: op.id, error: errorMsg });

          // Incrementar retries
          const newRetries = op.retries + 1;

          if (newRetries >= this.options.maxRetries) {
            await offlineDB.updateSyncOperation(op.id, {
              status: 'failed',
              retries: newRetries,
            });
            console.error(`❌ Falhou após ${newRetries} tentativas: ${op.id}`);
          } else {
            await offlineDB.updateSyncOperation(op.id, {
              status: 'pending',
              retries: newRetries,
            });
            console.warn(`⚠️ Retry ${newRetries}/${this.options.maxRetries}: ${op.id}`);
          }
        }
      }

      // Limpar operações completadas antigas
      const cleaned = await offlineDB.clearCompletedSyncOperations();
      console.log(`🧹 ${cleaned} operações completadas removidas`);

      // Atualizar data do último sync
      await offlineDB.saveSetting('lastSyncDate', new Date());

      console.log(`✅ Sync concluído: ${synced} sucesso, ${failed} falhas`);

      return {
        success: failed === 0,
        synced,
        failed,
        errors,
      };
    } catch (error: any) {
      console.error('❌ Erro no sync:', error);
      return {
        success: false,
        synced,
        failed,
        errors: [{ id: 'sync-error', error: error.message }],
      };
    } finally {
      this.syncing = false;
    }
  }

  private async executeSyncOperation(op: any): Promise<void> {
    // Simular chamada API - em produção, usar fetch real
    await new Promise((resolve) => setTimeout(resolve, 500));

    const endpoint = this.getEndpoint(op.entity, op.type);
    
    console.log(`🌐 Sync: ${op.type.toUpperCase()} ${endpoint}`, op.data);

    // Aqui faria o fetch real:
    /*
    const response = await fetch(endpoint, {
      method: this.getMethod(op.type),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(op.data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    */

    // Atualizar status do projeto
    if (op.entity === 'project' && op.type !== 'delete') {
      const project = await offlineDB.getProject(op.data.id);
      if (project) {
        project.syncStatus = 'synced';
        await offlineDB.saveProject(project);
      }
    }
  }

  private getEndpoint(entity: string, type: string): string {
    const base = '/api';
    
    switch (entity) {
      case 'project':
        return type === 'create' ? `${base}/projects` : `${base}/projects/${type}`;
      case 'asset':
        return `${base}/assets`;
      default:
        return base;
    }
  }

  private getMethod(type: string): string {
    switch (type) {
      case 'create':
        return 'POST';
      case 'update':
        return 'PUT';
      case 'delete':
        return 'DELETE';
      default:
        return 'GET';
    }
  }

  async forceSyncNow(): Promise<void> {
    console.log('🔄 Forçando sync imediato...');
    await this.syncAll();
  }

  getStatus(): {
    isOnline: boolean;
    syncing: boolean;
    autoSync: boolean;
  } {
    return {
      isOnline: this.isOnline,
      syncing: this.syncing,
      autoSync: this.syncInterval !== null,
    };
  }
}

export const syncManager = new SyncManager();
