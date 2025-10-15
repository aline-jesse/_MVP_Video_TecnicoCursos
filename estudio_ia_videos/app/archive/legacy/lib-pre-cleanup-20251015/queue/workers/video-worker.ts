/**
 * 🎬 VIDEO WORKER - FASE 2 - Sistema Real
 * Worker especializado para renderização de vídeos com FFmpeg real
 */

import { Worker, Job } from 'bullmq';
import { redisConfig } from '../redis-config';
import { prisma } from '@/lib/prisma';
import { FFmpegRenderService, RenderSlide, RenderConfig, RenderResult } from '@/lib/render/ffmpeg-render-service';

export interface VideoJobData {
  projectId: string;
  slides: RenderSlide[];
  config: RenderConfig;
  userId?: string;
}

export interface VideoJobResult extends RenderResult {
  // Herda todas as propriedades de RenderResult
}

export class VideoWorker {
  private worker: Worker<VideoJobData, VideoJobResult> | null = null;
  private renderService: FFmpegRenderService;
  private isInitialized = false;

  constructor() {
    this.renderService = new FFmpegRenderService();
    this.initialize();
  }

  /**
   * Inicializa o worker de vídeo
   */
  private async initialize(): Promise<void> {
    try {
      // Inicializar serviço de renderização
      await this.renderService.initialize();
      
      const redis = await redisConfig.getRedisConnection();
      
      this.worker = new Worker<VideoJobData, VideoJobResult>(
        'videoQueue',
        this.processVideoJob.bind(this),
        {
          connection: redis,
          concurrency: 2, // Máximo 2 renderizações simultâneas
          limiter: {
            max: 5, // Máximo 5 jobs por minuto
            duration: 60000,
          },
        }
      );

      this.setupEventHandlers();
      this.isInitialized = true;
      
      console.log('✅ [VideoWorker] Worker de vídeo inicializado com FFmpeg');
    } catch (error) {
      console.error('❌ [VideoWorker] Erro na inicialização:', error);
      throw error;
    }
  }

  /**
   * Configura event handlers do worker
   */
  private setupEventHandlers(): void {
    if (!this.worker) return;

    this.worker.on('ready', () => {
      console.log('🚀 [VideoWorker] Pronto para processar jobs');
    });

    this.worker.on('active', (job: Job) => {
      console.log(`🎬 [VideoWorker] Processando job ${job.id} - Projeto: ${job.data.projectId}`);
    });

    this.worker.on('completed', async (job: Job, result: VideoJobResult) => {
      console.log(`✅ [VideoWorker] Job ${job.id} concluído com sucesso`);
      if (result.success) {
        await this.updateProjectStatus(job.data.projectId, 'completed', result);
      }
    });

    this.worker.on('failed', async (job: Job | undefined, err: Error) => {
      console.error(`❌ [VideoWorker] Job ${job?.id} falhou:`, err.message);
      if (job) {
        await this.updateProjectStatus(job.data.projectId, 'failed', { error: err.message });
      }
    });

    this.worker.on('progress', (job: Job, progress: number) => {
      console.log(`📊 [VideoWorker] Job ${job.id} progresso: ${progress}%`);
    });

    this.worker.on('stalled', (jobId: string) => {
      console.warn(`⚠️ [VideoWorker] Job ${jobId} travado, será reprocessado`);
    });

    this.worker.on('error', (err: Error) => {
      console.error('❌ [VideoWorker] Erro no worker:', err);
    });
  }

  /**
   * Processa job de renderização de vídeo - FASE 2 REAL
   */
  private async processVideoJob(job: Job<VideoJobData, VideoJobResult>): Promise<VideoJobResult> {
    const { projectId, slides, config, userId } = job.data;
    
    try {
      console.log(`🎬 [VideoWorker] Processando vídeo do projeto ${projectId} - ${slides.length} slides`);
      
      // Atualizar progresso inicial
      await job.updateProgress(0);
      
      // 1. Validar dados do job
      await this.validateJobData(job.data);
      await job.updateProgress(10);
      
      // 2. Configurar callback de progresso
      this.renderService.setProgressCallback((progress) => {
        // Mapear progresso do FFmpeg para progresso do job (10% a 95%)
        const jobProgress = 10 + (progress.progress * 0.85);
        job.updateProgress(Math.min(jobProgress, 95));
        
        console.log(`📊 [VideoWorker] ${progress.phase}: ${progress.progress}% - ${progress.message}`);
      });
      
      await job.updateProgress(15);
      
      // 3. Renderizar vídeo usando FFmpegRenderService REAL
      console.log(`🚀 [VideoWorker] Iniciando renderização real com FFmpeg...`);
      const result = await this.renderService.renderVideo(slides, config, projectId);
      
      await job.updateProgress(100);
      
      if (result.success) {
        console.log(`✅ [VideoWorker] Vídeo renderizado com sucesso!`);
        console.log(`📹 URL do vídeo: ${result.videoUrl}`);
        console.log(`🖼️ URL do thumbnail: ${result.thumbnailUrl}`);
        console.log(`⏱️ Duração: ${result.duration}s`);
        console.log(`📊 Tamanho: ${result.fileSize} bytes`);
        
        return result;
      } else {
        throw new Error(result.error || 'Erro na renderização');
      }
      
    } catch (error) {
      console.error(`❌ [VideoWorker] Erro ao processar vídeo:`, error);
      
      await this.updateProjectStatus(projectId, 'failed', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      
      return {
        success: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Valida dados do job - FASE 2
   */
  private async validateJobData(data: VideoJobData): Promise<void> {
    if (!data.projectId) {
      throw new Error('ID do projeto é obrigatório');
    }

    if (!data.slides || data.slides.length === 0) {
      throw new Error('Pelo menos um slide é obrigatório');
    }

    if (!data.config) {
      throw new Error('Configuração de renderização é obrigatória');
    }

    // Validar configuração específica
    if (!data.config.width || !data.config.height) {
      throw new Error('Dimensões do vídeo são obrigatórias');
    }

    if (!data.config.fps || data.config.fps <= 0) {
      throw new Error('FPS deve ser maior que zero');
    }

    // Validar slides
    for (const slide of data.slides) {
      if (!slide.id) {
        throw new Error('ID do slide é obrigatório');
      }
      
      if (!slide.duration || slide.duration <= 0) {
        throw new Error(`Duração do slide ${slide.id} deve ser maior que zero`);
      }
    }

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new Error('Projeto não encontrado');
    }
  }

  /**
   * Atualiza status do projeto
   */
  private async updateProjectStatus(
    projectId: string,
    status: string,
    metadata?: any
  ): Promise<void> {
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status,
          ...(metadata && { metadata }),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ [VideoWorker] Erro ao atualizar status:', error);
    }
  }

  /**
   * Obtém estatísticas do worker
   */
  public async getStats(): Promise<{
    isInitialized: boolean;
    isRunning: boolean;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
  }> {
    if (!this.worker) {
      return {
        isInitialized: false,
        isRunning: false,
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
      };
    }

    try {
      const waiting = await this.worker.getWaiting();
      const active = await this.worker.getActive();
      const completed = await this.worker.getCompleted();
      const failed = await this.worker.getFailed();

      return {
        isInitialized: this.isInitialized,
        isRunning: !this.worker.closing,
        activeJobs: active.length,
        completedJobs: completed.length,
        failedJobs: failed.length,
      };
    } catch (error) {
      console.error('❌ [VideoWorker] Erro ao obter estatísticas:', error);
      return {
        isInitialized: this.isInitialized,
        isRunning: false,
        activeJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
      };
    }
  }

  /**
   * Para o worker
   */
  public async stop(): Promise<void> {
    if (this.worker) {
      console.log('🛑 [VideoWorker] Parando worker...');
      await this.worker.close();
      this.worker = null;
      this.isInitialized = false;
      console.log('✅ [VideoWorker] Worker parado');
    }
  }

  /**
   * Reinicia o worker
   */
  public async restart(): Promise<void> {
    await this.stop();
    await this.initialize();
  }

  /**
   * Verifica se o worker está saudável
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    details: {
      initialized: boolean;
      running: boolean;
      renderServiceAvailable: boolean;
      redisConnected: boolean;
    };
  }> {
    const details = {
      initialized: this.isInitialized,
      running: this.worker ? !this.worker.closing : false,
      renderServiceAvailable: false,
      redisConnected: false,
    };

    try {
      // Verificar RenderService
      const renderStats = await this.renderService.getStats();
      details.renderServiceAvailable = true;

      // Verificar Redis
      const redisStatus = await redisConfig.getRedisStatus();
      details.redisConnected = redisStatus.connected;

    } catch (error) {
      console.error('❌ [VideoWorker] Erro no health check:', error);
    }

    const healthy = details.initialized && details.running && details.renderServiceAvailable && details.redisConnected;

    return { healthy, details };
  }
}