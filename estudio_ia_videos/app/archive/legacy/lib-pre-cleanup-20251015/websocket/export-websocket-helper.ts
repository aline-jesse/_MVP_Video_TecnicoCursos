/**
 * Export WebSocket Helper
 * Helpers para emitir eventos de progresso de exportação
 */

import { getGlobalIo } from './websocket-helper'
import { TimelineEvent } from './timeline-websocket'
import { ExportProgress, ExportJob } from '@/types/export.types'

/**
 * Emite progresso de exportação para usuário
 */
export function emitExportProgress(userId: string, progress: ExportProgress): void {
  const io = getGlobalIo()
  if (!io) {
    console.warn('[ExportWebSocket] IO not initialized')
    return
  }

  io.to(`user:${userId}`).emit(TimelineEvent.EXPORT_PROGRESS, progress)
  console.log(`[ExportWebSocket] Progress emitted to user ${userId}: ${progress.progress}%`)
}

/**
 * Emite conclusão de exportação
 */
export function emitExportComplete(userId: string, job: ExportJob): void {
  const io = getGlobalIo()
  if (!io) return

  io.to(`user:${userId}`).emit(TimelineEvent.EXPORT_COMPLETE, {
    jobId: job.id,
    outputUrl: job.outputUrl,
    fileSize: job.fileSize,
    duration: job.duration,
  })

  console.log(`[ExportWebSocket] Export complete emitted to user ${userId}`)
}

/**
 * Emite falha de exportação
 */
export function emitExportFailed(userId: string, jobId: string, error: string): void {
  const io = getGlobalIo()
  if (!io) return

  io.to(`user:${userId}`).emit(TimelineEvent.EXPORT_FAILED, {
    jobId,
    error,
  })

  console.log(`[ExportWebSocket] Export failed emitted to user ${userId}`)
}

/**
 * Emite cancelamento de exportação
 */
export function emitExportCancelled(userId: string, jobId: string): void {
  const io = getGlobalIo()
  if (!io) return

  io.to(`user:${userId}`).emit(TimelineEvent.EXPORT_CANCELLED, {
    jobId,
  })

  console.log(`[ExportWebSocket] Export cancelled emitted to user ${userId}`)
}
