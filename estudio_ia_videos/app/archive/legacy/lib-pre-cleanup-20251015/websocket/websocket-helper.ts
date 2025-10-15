/**
 * Helper para emitir eventos WebSocket de rotas API
 * Permite broadcast de eventos sem acessar diretamente io
 */

import { TimelineEvent } from './timeline-websocket'

// Global io instance (será setado pelo server)
let globalIo: any = null

export function setGlobalIo(io: any) {
  globalIo = io
  console.log('[WebSocket Helper] Global IO instance set')
}

export function getGlobalIo() {
  return globalIo
}

/**
 * Emite evento para todos usuários de um projeto
 */
export function broadcastToProject(
  projectId: string,
  event: TimelineEvent,
  payload: any
) {
  if (!globalIo) {
    console.warn('[WebSocket Helper] IO not initialized, skipping broadcast')
    return
  }

  globalIo.to(`project:${projectId}`).emit(event, {
    ...payload,
    timestamp: new Date().toISOString()
  })

  console.log(`[WebSocket Helper] Broadcasted ${event} to project ${projectId}`)
}

/**
 * Emite evento para usuário específico
 */
export function emitToUser(
  userId: string,
  event: TimelineEvent,
  payload: any
) {
  if (!globalIo) {
    console.warn('[WebSocket Helper] IO not initialized, skipping emit')
    return
  }

  // Buscar socket do usuário (implementar mapeamento se necessário)
  globalIo.emit(event, {
    ...payload,
    userId,
    timestamp: new Date().toISOString()
  })

  console.log(`[WebSocket Helper] Emitted ${event} to user ${userId}`)
}

/**
 * Notifica conflito de lock
 */
export function notifyLockConflict(
  projectId: string,
  trackId: string,
  currentLockHolder: { userId: string; userName: string },
  attemptedBy: { userId: string; userName: string }
) {
  broadcastToProject(projectId, TimelineEvent.CONFLICT, {
    type: 'track_lock',
    trackId,
    currentLockHolder,
    attemptedBy
  })
}

/**
 * Notifica atualização de timeline
 */
export function notifyTimelineUpdate(
  projectId: string,
  userId: string,
  version: number,
  changes: any
) {
  broadcastToProject(projectId, TimelineEvent.TIMELINE_UPDATED, {
    userId,
    version,
    changes
  })
}

/**
 * Notifica operação bulk
 */
export function notifyBulkOperation(
  projectId: string,
  operation: string,
  result: any
) {
  broadcastToProject(projectId, TimelineEvent.BULK_COMPLETE, {
    operation,
    result
  })
}
