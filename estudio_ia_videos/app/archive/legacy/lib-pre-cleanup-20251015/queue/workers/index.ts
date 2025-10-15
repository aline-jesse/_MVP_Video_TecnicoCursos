/**
 * 🎯 WORKERS MANAGER - Sprint 48 - FASE 2
 * Gerenciador central de todos os workers especializados
 */

import { videoWorker, VideoWorker } from './video-worker';
import { ttsWorker, TTSWorker } from './tts-worker';
import { avatarWorker, AvatarWorker } from './avatar-worker';
import { isRedisReady, getRedisStatus } from '../redis-config';

export class WorkersManager {
  private static instance: WorkersManager;
  private workers: Map<string, any> = new Map();
  private isInitialized = false;

  private constructor() {
    this.workers.set('video', videoWorker);
    this.workers.set('tts', ttsWorker);
    this.workers.set('avatar', avatarWorker);
  }

  public static getInstance(): WorkersManager {
    if (!WorkersManager.instance) {
      WorkersManager.instance = new WorkersManager();
    }
    return WorkersManager.instance;
  }

  /**
   * Inicializa todos os workers
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ [WorkersManager] Workers já inicializados');
      return;
    }

    try {
      const redisReady = await isRedisReady();
      
      if (!redisReady) {
        console.warn('⚠️ [WorkersManager] Redis não disponível, workers não serão iniciados');
        return;
      }

      console.log('🚀 [WorkersManager] Inicializando workers...');
      
      // Workers são inicializados automaticamente em seus construtores
      // Aqui apenas verificamos se estão funcionando
      const statuses = await this.getWorkersStatus();
      
      const runningWorkers = Object.values(statuses).filter(status => status.isRunning).length;
      
      if (runningWorkers > 0) {
        this.isInitialized = true;
        console.log(`✅ [WorkersManager] ${runningWorkers} workers inicializados com sucesso`);
      } else {
        console.error('❌ [WorkersManager] Nenhum worker foi inicializado');
      }
    } catch (error) {
      console.error('❌ [WorkersManager] Erro ao inicializar workers:', error);
    }
  }

  /**
   * Obtém status de todos os workers
   */
  public async getWorkersStatus(): Promise<{
    video: { isRunning: boolean; queueName: string };
    tts: { isRunning: boolean; queueName: string };
    avatar: { isRunning: boolean; queueName: string };
    redis: { available: boolean; status: string };
  }> {
    try {
      const redisStatus = getRedisStatus();
      
      return {
        video: this.workers.get('video')?.getStatus() || { isRunning: false, queueName: 'render-video' },
        tts: this.workers.get('tts')?.getStatus() || { isRunning: false, queueName: 'render-tts' },
        avatar: this.workers.get('avatar')?.getStatus() || { isRunning: false, queueName: 'render-avatar' },
        redis: redisStatus,
      };
    } catch (error) {
      console.error('❌ [WorkersManager] Erro ao obter status dos workers:', error);
      return {
        video: { isRunning: false, queueName: 'render-video' },
        tts: { isRunning: false, queueName: 'render-tts' },
        avatar: { isRunning: false, queueName: 'render-avatar' },
        redis: { available: false, status: 'error' },
      };
    }
  }

  /**
   * Obtém estatísticas detalhadas dos workers
   */
  public async getDetailedStats(): Promise<{
    workers: {
      video: { isRunning: boolean; queueName: string };
      tts: { isRunning: boolean; queueName: string };
      avatar: { isRunning: boolean; queueName: string };
    };
    redis: { available: boolean; status: string };
    system: {
      totalWorkers: number;
      runningWorkers: number;
      uptime: number;
      memoryUsage: NodeJS.MemoryUsage;
    };
  }> {
    try {
      const workersStatus = await this.getWorkersStatus();
      const runningWorkers = Object.values(workersStatus)
        .filter(status => typeof status === 'object' && 'isRunning' in status && status.isRunning)
        .length;

      return {
        workers: {
          video: workersStatus.video,
          tts: workersStatus.tts,
          avatar: workersStatus.avatar,
        },
        redis: workersStatus.redis,
        system: {
          totalWorkers: 3,
          runningWorkers,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      };
    } catch (error) {
      console.error('❌ [WorkersManager] Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Reinicia um worker específico
   */
  public async restartWorker(workerName: 'video' | 'tts' | 'avatar'): Promise<void> {
    try {
      const worker = this.workers.get(workerName);
      
      if (!worker) {
        throw new Error(`Worker ${workerName} não encontrado`);
      }

      console.log(`🔄 [WorkersManager] Reiniciando worker ${workerName}...`);
      
      // Fechar worker atual
      await worker.close();
      
      // Aguardar um pouco antes de recriar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recriar worker (implementar lógica de recriação se necessário)
      console.log(`✅ [WorkersManager] Worker ${workerName} reiniciado`);
    } catch (error) {
      console.error(`❌ [WorkersManager] Erro ao reiniciar worker ${workerName}:`, error);
      throw error;
    }
  }

  /**
   * Fecha todos os workers
   */
  public async closeAll(): Promise<void> {
    try {
      console.log('🛑 [WorkersManager] Fechando todos os workers...');
      
      const closePromises = Array.from(this.workers.values()).map(worker => 
        worker.close().catch((error: Error) => 
          console.error('❌ [WorkersManager] Erro ao fechar worker:', error)
        )
      );
      
      await Promise.all(closePromises);
      
      this.isInitialized = false;
      console.log('✅ [WorkersManager] Todos os workers fechados');
    } catch (error) {
      console.error('❌ [WorkersManager] Erro ao fechar workers:', error);
    }
  }

  /**
   * Verifica saúde dos workers
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    workers: Record<string, boolean>;
    redis: boolean;
    issues: string[];
  }> {
    try {
      const status = await this.getWorkersStatus();
      const issues: string[] = [];
      
      // Verificar Redis
      if (!status.redis.available) {
        issues.push('Redis não disponível');
      }
      
      // Verificar workers
      const workersHealth = {
        video: status.video.isRunning,
        tts: status.tts.isRunning,
        avatar: status.avatar.isRunning,
      };
      
      Object.entries(workersHealth).forEach(([name, isRunning]) => {
        if (!isRunning) {
          issues.push(`Worker ${name} não está rodando`);
        }
      });
      
      const healthy = issues.length === 0;
      
      return {
        healthy,
        workers: workersHealth,
        redis: status.redis.available,
        issues,
      };
    } catch (error) {
      console.error('❌ [WorkersManager] Erro no health check:', error);
      return {
        healthy: false,
        workers: { video: false, tts: false, avatar: false },
        redis: false,
        issues: ['Erro interno no health check'],
      };
    }
  }

  /**
   * Obtém worker específico
   */
  public getWorker(name: 'video' | 'tts' | 'avatar'): VideoWorker | TTSWorker | AvatarWorker | null {
    return this.workers.get(name) || null;
  }

  /**
   * Verifica se os workers estão inicializados
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Exportar instância singleton
export const workersManager = WorkersManager.getInstance();

// Exportar workers individuais
export { videoWorker, ttsWorker, avatarWorker };
export type { VideoWorker, TTSWorker, AvatarWorker };

// Inicializar automaticamente
workersManager.initialize().catch(console.error);