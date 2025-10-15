/**
 * Export Worker
 * Processa jobs da fila de renderização
 */

import { getExportQueue } from './export-queue'
import { createRenderer, FFmpegRenderer } from './ffmpeg-renderer'
import { ExportJob, ExportStatus, ExportPhase } from '@/types/export.types'
import path from 'path'

class ExportWorker {
  private renderer: FFmpegRenderer
  private isRunning: boolean = false

  constructor() {
    this.renderer = createRenderer()
    this.setupListeners()
  }

  /**
   * Configura listeners da fila
   */
  private setupListeners(): void {
    const queue = getExportQueue()

    queue.on('job:start', (job: ExportJob) => {
      this.processJob(job).catch((error) => {
        console.error(`[ExportWorker] Job ${job.id} failed:`, error)
        queue.updateJobStatus(job.id, ExportStatus.FAILED, {
          error: String(error),
        })
      })
    })

    console.log('[ExportWorker] Listeners configured')
  }

  /**
   * Processa job de exportação
   */
  private async processJob(job: ExportJob): Promise<void> {
    console.log(`[ExportWorker] Processing job ${job.id}`)
    const queue = getExportQueue()

    try {
      // Definir caminho de saída
      const outputDir = path.join(process.cwd(), 'public', 'exports', job.userId)
      const outputFilename = `${job.projectId}_${job.timelineId}_${Date.now()}.${job.settings.format}`
      const outputPath = path.join(outputDir, outputFilename)

      // Renderizar vídeo
      await this.renderer.renderVideo({
        jobId: job.id,
        timelineData: job.timelineData || { videoTracks: [], audioTracks: [] },
        settings: job.settings,
        outputPath,

        onProgress: (progress, phase, message) => {
          queue.updateJobProgress(job.id, progress, phase, message)
        },

        onComplete: (outputPath, fileSize, duration) => {
          const outputUrl = `/exports/${job.userId}/${outputFilename}`
          queue.updateJobStatus(job.id, ExportStatus.COMPLETED, {
            outputUrl,
            fileSize,
            duration,
          })
        },

        onError: (error) => {
          queue.updateJobStatus(job.id, ExportStatus.FAILED, {
            error,
          })
        },
      })
    } catch (error) {
      console.error(`[ExportWorker] Error processing job ${job.id}:`, error)
      queue.updateJobStatus(job.id, ExportStatus.FAILED, {
        error: String(error),
      })
    }
  }

  /**
   * Inicia worker
   */
  start(): void {
    if (this.isRunning) {
      console.log('[ExportWorker] Already running')
      return
    }

    this.isRunning = true
    console.log('[ExportWorker] Started')
  }

  /**
   * Para worker
   */
  stop(): void {
    this.isRunning = false
    console.log('[ExportWorker] Stopped')
  }
}

// Singleton instance
let worker: ExportWorker | null = null

export function startExportWorker(): void {
  if (!worker) {
    worker = new ExportWorker()
    worker.start()
    console.log('[ExportWorker] Worker initialized and started')
  }
}

export function stopExportWorker(): void {
  if (worker) {
    worker.stop()
    console.log('[ExportWorker] Worker stopped')
  }
}

export { ExportWorker }
