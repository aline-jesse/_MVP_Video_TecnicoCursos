/**
 * 🎬 Sistema de Jobs de Renderização
 * Gerenciamento de fila e processamento de renderização
 */

import { RenderJob, RenderProgress, ExportSettings } from '../types/remotion-types';
import { TimelineProject } from '../types/timeline-types';

interface JobQueue {
  pending: RenderJob[];
  processing: RenderJob[];
  completed: RenderJob[];
  failed: RenderJob[];
}

class RenderJobManager {
  private jobs: Map<string, RenderJob> = new Map();
  private queue: JobQueue = {
    pending: [],
    processing: [],
    completed: [],
    failed: []
  };
  private maxConcurrentJobs = 2;
  private progressCallbacks: Map<string, (progress: RenderProgress) => void> = new Map();

  /**
   * Cria um novo job de renderização
   */
  createJob(
    project: TimelineProject,
    settings: ExportSettings,
    onProgress?: (progress: RenderProgress) => void
  ): RenderJob {
    const job: RenderJob = {
      id: `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: project.id,
      compositionId: this.getCompositionId(settings),
      config: {
        width: this.getResolution(settings).width,
        height: this.getResolution(settings).height,
        fps: 30,
        durationInFrames: Math.ceil((project.duration / 1000) * 30),
        composition: this.getCompositionId(settings)
      },
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Salvar job e callback
    this.jobs.set(job.id, job);
    this.queue.pending.push(job);

    if (onProgress) {
      this.progressCallbacks.set(job.id, onProgress);
    }

    // Processar fila
    this.processQueue();

    return job;
  }

  /**
   * Obtém status de um job
   */
  getJob(jobId: string): RenderJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Lista todos os jobs com filtro opcional
   */
  listJobs(status?: RenderJob['status']): RenderJob[] {
    const allJobs = Array.from(this.jobs.values());
    
    if (status) {
      return allJobs.filter(job => job.status === status);
    }
    
    return allJobs;
  }

  /**
   * Cancela um job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    
    if (!job) return false;
    if (job.status === 'completed' || job.status === 'failed') return false;

    // Remover da fila se ainda não começou
    if (job.status === 'pending') {
      this.queue.pending = this.queue.pending.filter(j => j.id !== jobId);
    }

    // Marcar como falhado
    job.status = 'failed';
    job.error = 'Cancelado pelo usuário';
    job.updatedAt = new Date();

    // Mover para lista de falhados
    this.queue.failed.push(job);
    this.queue.processing = this.queue.processing.filter(j => j.id !== jobId);

    return true;
  }

  /**
   * Remove job da memória
   */
  removeJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    
    if (!job) return false;
    
    // Cancelar se estiver ativo
    if (job.status === 'pending' || job.status === 'processing') {
      this.cancelJob(jobId);
    }

    // Remover de todas as filas
    this.queue.pending = this.queue.pending.filter(j => j.id !== jobId);
    this.queue.processing = this.queue.processing.filter(j => j.id !== jobId);
    this.queue.completed = this.queue.completed.filter(j => j.id !== jobId);
    this.queue.failed = this.queue.failed.filter(j => j.id !== jobId);

    // Remover callback e job
    this.progressCallbacks.delete(jobId);
    this.jobs.delete(jobId);

    return true;
  }

  /**
   * Processa a fila de jobs
   */
  private async processQueue(): Promise<void> {
    // Verificar se há espaço para processar mais jobs
    if (this.queue.processing.length >= this.maxConcurrentJobs) {
      return;
    }

    // Pegar próximo job pendente
    const nextJob = this.queue.pending.shift();
    if (!nextJob) return;

    // Mover para processamento
    nextJob.status = 'processing';
    nextJob.updatedAt = new Date();
    this.queue.processing.push(nextJob);

    try {
      // Processar job
      await this.processJob(nextJob);
      
      // Marcar como concluído
      nextJob.status = 'completed';
      nextJob.progress = 100;
      nextJob.outputUrl = `/api/render/output/${nextJob.id}.mp4`;
      nextJob.updatedAt = new Date();

      // Mover para concluídos
      this.queue.processing = this.queue.processing.filter(j => j.id !== nextJob.id);
      this.queue.completed.push(nextJob);

    } catch (error) {
      // Marcar como falhado
      nextJob.status = 'failed';
      nextJob.error = error instanceof Error ? error.message : 'Erro desconhecido';
      nextJob.updatedAt = new Date();

      // Mover para falhados
      this.queue.processing = this.queue.processing.filter(j => j.id !== nextJob.id);
      this.queue.failed.push(nextJob);
    }

    // Processar próximo job na fila
    setTimeout(() => this.processQueue(), 100);
  }

  /**
   * Processa um job individual
   */
  private async processJob(job: RenderJob): Promise<void> {
    const progressCallback = this.progressCallbacks.get(job.id);
    const totalFrames = job.config.durationInFrames;
    
    // Simular renderização frame por frame
    for (let frame = 0; frame <= totalFrames; frame++) {
      // Verificar se job foi cancelado
      if (job.status === 'failed') {
        throw new Error('Job cancelado');
      }

      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 20));

      // Atualizar progresso
      const percentage = Math.round((frame / totalFrames) * 100);
      job.progress = percentage;

      if (progressCallback) {
        progressCallback({
          frame,
          totalFrames,
          percentage,
          renderedInSeconds: (Date.now() - job.createdAt.getTime()) / 1000,
          estimatedTimeRemaining: frame > 0 
            ? Math.round(((Date.now() - job.createdAt.getTime()) / frame) * (totalFrames - frame) / 1000)
            : undefined
        });
      }
    }
  }

  /**
   * Utilitários
   */
  private getCompositionId(settings: ExportSettings): string {
    // Mapear formato para composição
    switch (settings.format) {
      case 'mp4':
      case 'webm':
        return 'AdvancedVideoComposition';
      case 'gif':
        return 'PreviewComposition';
      default:
        return 'AdvancedVideoComposition';
    }
  }

  private getResolution(settings: ExportSettings): { width: number; height: number } {
    // Resolução baseada na qualidade
    const resolutions = {
      1: { width: 480, height: 270 },
      2: { width: 640, height: 360 },
      3: { width: 854, height: 480 },
      4: { width: 1280, height: 720 },
      5: { width: 1280, height: 720 },
      6: { width: 1920, height: 1080 },
      7: { width: 1920, height: 1080 },
      8: { width: 1920, height: 1080 },
      9: { width: 2560, height: 1440 },
      10: { width: 3840, height: 2160 }
    };

    return resolutions[settings.quality] || { width: 1920, height: 1080 };
  }

  /**
   * Estatísticas da fila
   */
  getQueueStats() {
    return {
      pending: this.queue.pending.length,
      processing: this.queue.processing.length,
      completed: this.queue.completed.length,
      failed: this.queue.failed.length,
      total: this.jobs.size
    };
  }
}

// Instância singleton
export const renderJobManager = new RenderJobManager();