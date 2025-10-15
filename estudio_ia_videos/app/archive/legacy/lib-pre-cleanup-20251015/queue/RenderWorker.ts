/**
 * 🎥 RenderWorker - Processador de Vídeos em Background
 * Worker para processar jobs da fila de renderização
 */

import { RenderQueue, RenderJob } from './RenderQueue';
import { PPTXProcessor } from '../../_Fases_REAL/EXECUTOR_AUTOMATIZADO';
import { prisma } from '../db';
import { getQueueRedisConnection } from './redis-queue-config';

export class RenderWorker {
  private static instance: RenderWorker;
  private queue: RenderQueue;
  private isRunning: boolean = false;
  private currentJob: RenderJob | null = null;
  private pptxProcessor: PPTXProcessor;

  private constructor() {
    this.queue = RenderQueue.getInstance();
    this.pptxProcessor = new PPTXProcessor();
  }

  public static getInstance(): RenderWorker {
    if (!RenderWorker.instance) {
      RenderWorker.instance = new RenderWorker();
    }
    return RenderWorker.instance;
  }

  /**
   * Inicia o worker para processar jobs
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Worker já está em execução');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Worker iniciado');

    while (this.isRunning) {
      try {
        // Obtém próximo job da fila
        this.currentJob = await this.queue.getNextJob();
        
        if (this.currentJob) {
          console.log(`📝 Processando job: ${this.currentJob.id}`);
          await this.processJob(this.currentJob);
        } else {
          // Aguarda 5 segundos antes de verificar novamente
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error('❌ Erro ao processar job:', error);
        if (this.currentJob) {
          await this.handleJobError(this.currentJob.id, error);
        }
      }
    }
  }

  /**
   * Para o worker
   */
  public stop(): void {
    this.isRunning = false;
    console.log('🛑 Worker parado');
  }

  /**
   * Processa um job específico
   */
  private async processJob(job: RenderJob): Promise<void> {
    try {
      // Atualiza status para processing
      await this.queue.updateJobProgress(job.id, 0, 'processing');

      if (job.type === 'presentation') {
        await this.processPresentationJob(job);
      } else {
        await this.processVideoJob(job);
      }

      // Marca job como concluído
      await this.queue.updateJobProgress(job.id, 100, 'completed');
      
      // Notifica conclusão
      await this.notifyJobCompletion(job);

    } catch (error) {
      await this.handleJobError(job.id, error);
    }
  }

  /**
   * Processa job de apresentação (PPTX)
   */
  private async processPresentationJob(job: RenderJob): Promise<void> {
    const { sourceFile } = job.data;

    // Atualiza progresso
    await this.queue.updateJobProgress(job.id, 10);

    // Processa PPTX
    const slides = await this.pptxProcessor.processPPTX(sourceFile);

    // Atualiza progresso
    await this.queue.updateJobProgress(job.id, 50);

    // Salva no banco de dados
    await this.pptxProcessor.saveToDatabase({
      userId: job.data.userId,
      projectId: job.data.projectId,
      slides
    });

    // Atualiza progresso
    await this.queue.updateJobProgress(job.id, 90);
  }

  /**
   * Processa job de vídeo
   */
  private async processVideoJob(job: RenderJob): Promise<void> {
    const { sourceFile, outputFormat, quality, settings } = job.data;

    // TODO: Implementar processamento de vídeo
    // Por enquanto apenas simula o progresso
    for (let progress = 0; progress <= 100; progress += 10) {
      if (!this.isRunning) break;
      await this.queue.updateJobProgress(job.id, progress);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Trata erros no processamento do job
   */
  private async handleJobError(jobId: string, error: any): Promise<void> {
    console.error(`❌ Erro ao processar job ${jobId}:`, error);
    
    await this.queue.updateJobProgress(jobId, 0, 'failed');
    
    // Salva erro no banco de dados
    await prisma.renderJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error.message || 'Erro desconhecido',
        completedAt: new Date()
      }
    });
  }

  /**
   * Notifica conclusão do job
   */
  private async notifyJobCompletion(job: RenderJob): Promise<void> {
    // Salva conclusão no banco de dados
    await prisma.renderJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Publica evento de conclusão no Redis
    const redis = getQueueRedisConnection();
    await redis.publish(
      'render:completed',
      JSON.stringify({
        jobId: job.id,
        userId: job.data.userId,
        projectId: job.data.projectId,
        type: job.type
      })
    );
  }
}