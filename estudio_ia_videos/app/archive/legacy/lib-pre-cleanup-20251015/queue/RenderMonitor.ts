/**
 * 📊 RenderMonitor - Sistema de Monitoramento de Progresso
 * Monitora e reporta o progresso dos jobs de renderização
 */

import { Redis } from 'ioredis';
import { getQueueRedisConnection } from './redis-queue-config';
import { prisma } from '../db';

export interface RenderProgress {
  jobId: string;
  status: string;
  progress: number;
  error?: string;
  startedAt?: Date;
  finishedAt?: Date;
  processingTime?: number;
}

export class RenderMonitor {
  private static instance: RenderMonitor;
  private redis: Redis;
  private subscribers: Map<string, (progress: RenderProgress) => void>;

  private constructor() {
    this.redis = getQueueRedisConnection();
    this.subscribers = new Map();
    this.setupRedisSubscriber();
  }

  public static getInstance(): RenderMonitor {
    if (!RenderMonitor.instance) {
      RenderMonitor.instance = new RenderMonitor();
    }
    return RenderMonitor.instance;
  }

  /**
   * Configura subscriber Redis para eventos de progresso
   */
  private setupRedisSubscriber(): void {
    const subscriber = this.redis.duplicate();

    subscriber.subscribe('render:progress', (err) => {
      if (err) {
        console.error('❌ Erro ao subscrever canal render:progress:', err);
        return;
      }
      console.log('✅ Subscrito ao canal render:progress');
    });

    subscriber.on('message', (channel, message) => {
      if (channel === 'render:progress') {
        try {
          const progress: RenderProgress = JSON.parse(message);
          this.notifySubscribers(progress);
          this.updateDatabase(progress);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem de progresso:', error);
        }
      }
    });
  }

  /**
   * Publica atualização de progresso
   */
  public async publishProgress(progress: RenderProgress): Promise<void> {
    try {
      await this.redis.publish('render:progress', JSON.stringify(progress));
    } catch (error) {
      console.error('❌ Erro ao publicar progresso:', error);
    }
  }

  /**
   * Subscreve para atualizações de progresso de um job específico
   */
  public subscribeToJob(
    jobId: string,
    callback: (progress: RenderProgress) => void
  ): void {
    this.subscribers.set(jobId, callback);
  }

  /**
   * Cancela subscrição de um job
   */
  public unsubscribeFromJob(jobId: string): void {
    this.subscribers.delete(jobId);
  }

  /**
   * Notifica subscribers sobre atualização de progresso
   */
  private notifySubscribers(progress: RenderProgress): void {
    const subscriber = this.subscribers.get(progress.jobId);
    if (subscriber) {
      subscriber(progress);
    }
  }

  /**
   * Atualiza progresso no banco de dados
   */
  private async updateDatabase(progress: RenderProgress): Promise<void> {
    try {
      const updateData: any = {
        status: progress.status,
        progress: progress.progress,
        updatedAt: new Date()
      };

      if (progress.error) {
        updateData.error = progress.error;
      }

      if (progress.startedAt) {
        updateData.startedAt = progress.startedAt;
      }

      if (progress.finishedAt) {
        updateData.finishedAt = progress.finishedAt;
      }

      if (progress.processingTime) {
        updateData.processingTime = progress.processingTime;
      }

      await prisma.renderJob.update({
        where: { id: progress.jobId },
        data: updateData
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso no banco:', error);
    }
  }

  /**
   * Obtém progresso atual de um job
   */
  public async getJobProgress(jobId: string): Promise<RenderProgress | null> {
    try {
      const job = await prisma.renderJob.findUnique({
        where: { id: jobId }
      });

      if (!job) return null;

      return {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error || undefined,
        startedAt: job.startedAt || undefined,
        finishedAt: job.finishedAt || undefined,
        processingTime: job.processingTime || undefined
      };
    } catch (error) {
      console.error('❌ Erro ao obter progresso do job:', error);
      return null;
    }
  }

  /**
   * Lista jobs em progresso
   */
  public async listActiveJobs(): Promise<RenderProgress[]> {
    try {
      const jobs = await prisma.renderJob.findMany({
        where: {
          status: {
            in: ['pending', 'processing']
          }
        }
      });

      return jobs.map(job => ({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error || undefined,
        startedAt: job.startedAt || undefined,
        finishedAt: job.finishedAt || undefined,
        processingTime: job.processingTime || undefined
      }));
    } catch (error) {
      console.error('❌ Erro ao listar jobs ativos:', error);
      return [];
    }
  }

  /**
   * Calcula métricas de performance
   */
  public async getPerformanceMetrics(): Promise<{
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    averageProcessingTime: number;
  }> {
    try {
      const [total, completed, failed, avgTime] = await Promise.all([
        prisma.renderJob.count(),
        prisma.renderJob.count({ where: { status: 'completed' } }),
        prisma.renderJob.count({ where: { status: 'failed' } }),
        prisma.renderJob.aggregate({
          where: { status: 'completed', processingTime: { not: null } },
          _avg: { processingTime: true }
        })
      ]);

      return {
        totalJobs: total,
        completedJobs: completed,
        failedJobs: failed,
        averageProcessingTime: avgTime._avg.processingTime || 0
      };
    } catch (error) {
      console.error('❌ Erro ao calcular métricas:', error);
      return {
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        averageProcessingTime: 0
      };
    }
  }
}