/**
 * Export Demo Page
 * Página de demonstração do sistema de exportação
 */

'use client'

import React, { useState } from 'react'
import { VideoExportDialog } from '@/components/export/VideoExportDialog'
import { useExportSocket } from '@/hooks/useExportSocket'
import { ExportFormat, ExportResolution, ExportQuality } from '@/types/export.types'

export default function ExportDemoPage() {
  const [showDialog, setShowDialog] = useState(false)
  const [jobHistory, setJobHistory] = useState<any[]>([])
  const [queueStatus, setQueueStatus] = useState<any>(null)

  const userId = 'demo-user-123'
  const projectId = 'demo-project-456'
  const timelineId = 'demo-timeline-789'

  // Mock timeline data
  const mockTimelineData = {
    videoTracks: [
      {
        id: 'track-1',
        clips: [
          {
            id: 'clip-1',
            source: '/demo/video1.mp4',
            startTime: 0,
            duration: 10,
          },
          {
            id: 'clip-2',
            source: '/demo/video2.mp4',
            startTime: 10,
            duration: 15,
          },
        ],
      },
    ],
    audioTracks: [
      {
        id: 'audio-1',
        clips: [
          {
            id: 'audio-clip-1',
            source: '/demo/audio1.mp3',
            startTime: 0,
            duration: 25,
          },
        ],
      },
    ],
  }

  // WebSocket hook
  const { currentProgress, isConnected, startExport } = useExportSocket(userId, {
    onProgress: (progress) => {
      console.log(`Export progress: ${progress.progress}%`, progress.currentPhase)
    },

    onComplete: (data) => {
      console.log('Export complete:', data)
      setJobHistory((prev) => [
        ...prev,
        {
          ...data,
          completedAt: new Date(),
        },
      ])
      fetchQueueStatus()
    },

    onFailed: (data) => {
      console.error('Export failed:', data.error)
      alert(`Export falhou: ${data.error}`)
    },

    onCancelled: (data) => {
      console.log('Export cancelled:', data.jobId)
    },
  })

  // Fetch queue status
  const fetchQueueStatus = async () => {
    try {
      const response = await fetch('/api/v1/export/queue/status')
      const data = await response.json()
      setQueueStatus(data)
    } catch (error) {
      console.error('Failed to fetch queue status:', error)
    }
  }

  // Quick export functions
  const quickExport = async (
    format: ExportFormat,
    resolution: ExportResolution,
    quality: ExportQuality
  ) => {
    try {
      const jobId = await startExport(
        projectId,
        timelineId,
        { format, resolution, quality, fps: 30 },
        mockTimelineData
      )
      console.log('Started quick export:', jobId)
      fetchQueueStatus()
    } catch (error) {
      console.error('Failed to start export:', error)
      alert('Falha ao iniciar exportação')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎬 Export System Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Demonstração completa do sistema de exportação e renderização de vídeos
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              />
              <div>
                <h3 className="font-semibold text-lg">WebSocket Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Conectado - Real-time updates ativos' : 'Desconectado'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchQueueStatus}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              🔄 Atualizar Status
            </button>
          </div>
        </div>

        {/* Queue Status */}
        {queueStatus && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">📊 Status da Fila</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{queueStatus.queue?.totalJobs || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{queueStatus.queue?.pendingJobs || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pendentes</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{queueStatus.queue?.processingJobs || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Processando</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{queueStatus.queue?.completedJobs || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completos</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{queueStatus.queue?.failedJobs || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Falhas</div>
              </div>
            </div>
            {queueStatus.statistics && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tempo médio: <span className="font-semibold">{queueStatus.statistics.averageDuration}s</span> |
                  Max concurrent: <span className="font-semibold">{queueStatus.statistics.maxConcurrent}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Custom Export */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-4">🎨 Exportação Personalizada</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure todas as opções de formato, resolução e qualidade
            </p>
            <button
              onClick={() => setShowDialog(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
            >
              Abrir Configurações Completas
            </button>
          </div>

          {/* Quick Exports */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-4">⚡ Exportações Rápidas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Presets prontos para uso imediato
            </p>
            <div className="space-y-2">
              <button
                onClick={() =>
                  quickExport(ExportFormat.MP4, ExportResolution.HD_720, ExportQuality.LOW)
                }
                className="w-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
              >
                🚀 Preview (720p Low)
              </button>
              <button
                onClick={() =>
                  quickExport(ExportFormat.MP4, ExportResolution.FULL_HD_1080, ExportQuality.HIGH)
                }
                className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
              >
                🎬 Produção (1080p High)
              </button>
              <button
                onClick={() =>
                  quickExport(ExportFormat.WEBM, ExportResolution.FULL_HD_1080, ExportQuality.HIGH)
                }
                className="w-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
              >
                🌐 Web (WebM 1080p)
              </button>
            </div>
          </div>
        </div>

        {/* Current Export Progress */}
        {currentProgress && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">⏳ Exportação em Andamento</h3>
            <div className="space-y-3">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{currentProgress.currentPhase}</span>
                <span className="text-sm font-semibold">{currentProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${currentProgress.progress}%` }}
                />
              </div>
              {currentProgress.message && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentProgress.message}</p>
              )}
              {currentProgress.estimatedTimeRemaining && (
                <p className="text-sm text-gray-500">
                  ⏱️ Tempo restante: ~{Math.round(currentProgress.estimatedTimeRemaining)}s
                </p>
              )}
            </div>
          </div>
        )}

        {/* Export History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-4">📁 Histórico de Exportações</h3>
          {jobHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-5xl mb-2">📦</p>
              <p>Nenhuma exportação ainda</p>
              <p className="text-sm mt-2">Inicie uma exportação para ver o histórico</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobHistory.map((job, i) => (
                <div
                  key={i}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-600 font-semibold">✓ Job {job.jobId}</span>
                      <span className="text-xs bg-green-200 dark:bg-green-800 px-2 py-1 rounded">
                        {new Date(job.completedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Tamanho: {(job.fileSize / 1024 / 1024).toFixed(2)} MB |
                      Duração: {job.duration?.toFixed(1)}s
                    </div>
                  </div>
                  <a
                    href={job.outputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    📥 Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Dialog */}
        {showDialog && (
          <VideoExportDialog
            userId={userId}
            projectId={projectId}
            timelineId={timelineId}
            timelineData={mockTimelineData}
            onClose={() => setShowDialog(false)}
          />
        )}
      </div>
    </div>
  )
}
