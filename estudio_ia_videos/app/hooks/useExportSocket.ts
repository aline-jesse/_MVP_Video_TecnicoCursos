/**
 * useExportSocket Hook
 * React hook para monitorar progresso de exportação via WebSocket
 */

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { ExportProgress, ExportJob } from '@/types/export.types'

export interface ExportSocketCallbacks {
  onProgress?: (progress: ExportProgress) => void
  onComplete?: (data: { jobId: string; outputUrl: string; fileSize: number; duration: number }) => void
  onFailed?: (data: { jobId: string; error: string }) => void
  onCancelled?: (data: { jobId: string }) => void
}

export function useExportSocket(userId: string | null, callbacks?: ExportSocketCallbacks) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentProgress, setCurrentProgress] = useState<ExportProgress | null>(null)

  // Conectar ao WebSocket
  useEffect(() => {
    if (!userId) return

    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || '', {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      console.log('[useExportSocket] Connected')
      setIsConnected(true)
      
      // Join user room
      socketInstance.emit('export:join_user', { userId })
    })

    socketInstance.on('disconnect', () => {
      console.log('[useExportSocket] Disconnected')
      setIsConnected(false)
    })

    // Evento: Progresso
    socketInstance.on('export:progress', (progress: ExportProgress) => {
      console.log('[useExportSocket] Progress:', progress.progress)
      setCurrentProgress(progress)
      callbacks?.onProgress?.(progress)
    })

    // Evento: Completo
    socketInstance.on('export:complete', (data: any) => {
      console.log('[useExportSocket] Export complete:', data.jobId)
      setCurrentProgress(null)
      callbacks?.onComplete?.(data)
    })

    // Evento: Falha
    socketInstance.on('export:failed', (data: any) => {
      console.log('[useExportSocket] Export failed:', data.jobId, data.error)
      setCurrentProgress(null)
      callbacks?.onFailed?.(data)
    })

    // Evento: Cancelado
    socketInstance.on('export:cancelled', (data: any) => {
      console.log('[useExportSocket] Export cancelled:', data.jobId)
      setCurrentProgress(null)
      callbacks?.onCancelled?.(data)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [userId])

  // Iniciar exportação
  const startExport = useCallback(async (
    projectId: string,
    timelineId: string,
    settings: any,
    timelineData?: any
  ) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const response = await fetch('/api/v1/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        projectId,
        timelineId,
        settings,
        timelineData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to start export')
    }

    const data = await response.json()
    return data.jobId
  }, [userId])

  // Cancelar exportação
  const cancelExport = useCallback(async (jobId: string) => {
    const response = await fetch(`/api/v1/export/${jobId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to cancel export')
    }

    return response.json()
  }, [])

  // Obter status do job
  const getJobStatus = useCallback(async (jobId: string) => {
    const response = await fetch(`/api/v1/export/${jobId}`)

    if (!response.ok) {
      throw new Error('Failed to get job status')
    }

    const data = await response.json()
    return data.job
  }, [])

  return {
    socket,
    isConnected,
    currentProgress,
    startExport,
    cancelExport,
    getJobStatus,
  }
}
