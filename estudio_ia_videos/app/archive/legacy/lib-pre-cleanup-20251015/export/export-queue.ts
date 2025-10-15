/**
 * Export Queue Manager
 * Gerencia fila de jobs de renderização com processamento assíncrono
 */

import { EventEmitter } from 'events'
import {
  ExportJob,
  ExportStatus,
  ExportProgress,
  RenderTask,
  ExportQueueStatus,
  ExportPhase,
} from '@/types/export.types'
import {
  emitExportProgress,
  emitExportComplete,
  emitExportFailed,
  emitExportCancelled,
} from '@/lib/websocket/export-websocket-helper'

class ExportQueueManager extends EventEmitter {
  private queue: Map<string, ExportJob> = new Map()
  private processing: Map<string, ExportJob> = new Map()
  private completed: Map<string, ExportJob> = new Map() // Guardar jobs completados
  private maxConcurrent: number = 2 // Máximo de jobs simultâneos
  private isProcessing: boolean = false
  private processingInterval?: NodeJS.Timeout

  constructor(autoStart: boolean = true) {
    super()
    if (autoStart) {
      this.startProcessing()
    }
  }

  /**
   * Adiciona job à fila
   */
  addJob(job: ExportJob): void {
    console.log(`[ExportQueue] Adding job ${job.id} to queue`)
    this.queue.set(job.id, job)
    this.emit('job:added', job)
    
    // Só processar automaticamente se o worker estiver rodando
    if (this.isProcessing) {
      this.processNextJob()
    }
  }

  /**
   * Obtém job por ID
   */
  getJob(jobId: string): ExportJob | undefined {
    return this.queue.get(jobId) || this.processing.get(jobId) || this.completed.get(jobId)
  }

  /**
   * Atualiza status do job
   */
  updateJobStatus(jobId: string, status: ExportStatus, data?: Partial<ExportJob>): void {
    const job = this.getJob(jobId)
    if (!job) {
      console.warn(`[ExportQueue] Job ${jobId} not found`)
      return
    }

    job.status = status
    Object.assign(job, data)

    if (status === ExportStatus.PROCESSING) {
      job.startedAt = new Date()
      this.queue.delete(jobId)
      this.processing.set(jobId, job)
    } else if (
      status === ExportStatus.COMPLETED ||
      status === ExportStatus.FAILED ||
      status === ExportStatus.CANCELLED
    ) {
      job.completedAt = new Date()
      this.processing.delete(jobId)
      this.queue.delete(jobId)
      this.completed.set(jobId, job) // Guardar job completado
      this.emit('job:completed', job)
      
      // Emitir eventos via WebSocket
      if (status === ExportStatus.COMPLETED) {
        emitExportComplete(job.userId, job)
      } else if (status === ExportStatus.FAILED) {
        emitExportFailed(job.userId, job.id, job.error || 'Unknown error')
      } else if (status === ExportStatus.CANCELLED) {
        emitExportCancelled(job.userId, job.id)
      }
      
      this.processNextJob()
    }

    this.emit('job:updated', job)
  }

  /**
   * Atualiza progresso do job
   */
  updateJobProgress(
    jobId: string,
    progress: number,
    phase: ExportPhase,
    message: string,
    estimatedTimeRemaining?: number
  ): void {
    const job = this.getJob(jobId)
    if (!job) return

    job.progress = Math.min(100, Math.max(0, progress))
    job.estimatedTimeRemaining = estimatedTimeRemaining

    const progressData: ExportProgress = {
      jobId,
      progress: job.progress,
      currentPhase: phase,
      message,
      estimatedTimeRemaining,
    }

    this.emit('job:progress', progressData)
    
    // Emitir via WebSocket
    emitExportProgress(job.userId, progressData)
  }

  /**
   * Cancela job
   */
  cancelJob(jobId: string): boolean {
    const job = this.getJob(jobId)
    if (!job) return false

    if (job.status === ExportStatus.COMPLETED) {
      return false // Não pode cancelar job completo
    }

    this.updateJobStatus(jobId, ExportStatus.CANCELLED)
    console.log(`[ExportQueue] Job ${jobId} cancelled`)
    return true
  }

  /**
   * Remove job da fila (apenas se PENDING)
   */
  removeJob(jobId: string): boolean {
    const job = this.queue.get(jobId)
    if (!job || job.status !== ExportStatus.PENDING) {
      return false
    }

    this.queue.delete(jobId)
    this.emit('job:removed', job)
    console.log(`[ExportQueue] Job ${jobId} removed`)
    return true
  }

  /**
   * Obtém próximo job da fila
   */
  private getNextJob(): ExportJob | undefined {
    for (const job of this.queue.values()) {
      if (job.status === ExportStatus.PENDING) {
        return job
      }
    }
    return undefined
  }

  /**
   * Processa próximo job se houver capacidade
   */
  private processNextJob(): void {
    if (this.processing.size >= this.maxConcurrent) {
      console.log('[ExportQueue] Max concurrent jobs reached, waiting...')
      return
    }

    const nextJob = this.getNextJob()
    if (!nextJob) {
      console.log('[ExportQueue] No pending jobs in queue')
      return
    }

    this.updateJobStatus(nextJob.id, ExportStatus.PROCESSING)
    this.emit('job:start', nextJob)
    console.log(`[ExportQueue] Starting job ${nextJob.id}`)
  }

  /**
   * Inicia processamento contínuo
   */
  private startProcessing(): void {
    if (this.isProcessing) return

    this.isProcessing = true
    console.log('[ExportQueue] Started processing')

    // Verificar fila a cada 5 segundos
    this.processingInterval = setInterval(() => {
      this.processNextJob()
    }, 5000)
  }

  /**
   * Para processamento
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = undefined
    }
    this.isProcessing = false
    console.log('[ExportQueue] Stopped processing')
  }

  /**
   * Obtém status da fila
   */
  getQueueStatus(): ExportQueueStatus {
    const allJobs = [...this.queue.values(), ...this.processing.values(), ...this.completed.values()]

    return {
      totalJobs: allJobs.length,
      pendingJobs: allJobs.filter((j) => j.status === ExportStatus.PENDING).length,
      processingJobs: allJobs.filter((j) => j.status === ExportStatus.PROCESSING).length,
      completedJobs: allJobs.filter((j) => j.status === ExportStatus.COMPLETED).length,
      failedJobs: allJobs.filter((j) => j.status === ExportStatus.FAILED).length,
    }
  }

  /**
   * Lista todos jobs do usuário
   */
  getUserJobs(userId: string): ExportJob[] {
    const allJobs = [...this.queue.values(), ...this.processing.values(), ...this.completed.values()]
    return allJobs.filter((job) => job.userId === userId)
  }

  /**
   * Lista jobs por projeto
   */
  getProjectJobs(projectId: string): ExportJob[] {
    const allJobs = [...this.queue.values(), ...this.processing.values(), ...this.completed.values()]
    return allJobs.filter((job) => job.projectId === projectId)
  }

  /**
   * Limpa jobs completados antigos (mais de 24h)
   */
  cleanupOldJobs(): number {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    let cleaned = 0

    for (const [jobId, job] of this.queue.entries()) {
      if (
        job.status === ExportStatus.COMPLETED &&
        job.completedAt &&
        job.completedAt < oneDayAgo
      ) {
        this.queue.delete(jobId)
        cleaned++
      }
    }

    console.log(`[ExportQueue] Cleaned ${cleaned} old jobs`)
    return cleaned
  }

  /**
   * Obtém estatísticas da fila
   */
  getStatistics() {
    const allJobs = [...this.queue.values(), ...this.processing.values(), ...this.completed.values()]
    const completedJobs = allJobs.filter((j) => j.status === ExportStatus.COMPLETED)

    const avgDuration =
      completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            if (job.startedAt && job.completedAt) {
              return sum + (job.completedAt.getTime() - job.startedAt.getTime())
            }
            return sum
          }, 0) / completedJobs.length
        : 0

    return {
      totalJobs: allJobs.length,
      queueSize: this.queue.size,
      processing: this.processing.size,
      averageDuration: avgDuration / 1000, // em segundos
      maxConcurrent: this.maxConcurrent,
    }
  }
}

// Singleton instance
let queueManager: ExportQueueManager | null = null

export function getExportQueue(): ExportQueueManager {
  if (!queueManager) {
    queueManager = new ExportQueueManager()
    console.log('[ExportQueue] Queue manager initialized')
  }
  return queueManager
}

export { ExportQueueManager }
