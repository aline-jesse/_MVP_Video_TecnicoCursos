
/**
 * 📊 Talking Photo Job Status API
 * Status específico de jobs de talking photo
 */

import { NextRequest, NextResponse } from 'next/server'
import { QueueService } from '@/lib/queue-service'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    
    console.log(`📊 Consultando status do job: ${jobId}`)
    
    const job = QueueService.getJobStatus(jobId)
    
    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Job não encontrado'
      }, { status: 404 })
    }
    
    // Calcular progresso estimado
    const progress = calculateProgress(job)
    const estimatedTimeRemaining = estimateTimeRemaining(job)
    
    const response = {
      success: true,
      jobId: job.id,
      status: job.status,
      progress,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      attempts: job.attempts,
      maxRetries: 3,
      estimatedTimeRemaining,
      error: job.error,
      result: job.result,
      metadata: {
        type: job.type,
        priority: job.priority,
        textLength: job.data?.text?.length || 0,
        avatarId: job.data?.avatarId,
        resolution: job.data?.videoOptions?.resolution || '1080p'
      }
    }
    
    // Se concluído, incluir URLs dos arquivos
    if (job.status === 'completed' && job.result) {
      response.result = {
        audioUrl: job.result.audioUrl,
        videoUrl: job.result.videoUrl,
        thumbnailUrl: job.result.thumbnailUrl,
        duration: job.result.duration,
        processingTime: job.result.processingTime,
        metadata: job.result.metadata
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Erro ao consultar status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Cancelar job específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    
    console.log(`❌ Cancelando job: ${jobId}`)
    
    const success = QueueService.cancelJob(jobId)
    
    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Cannot cancel job (may be processing or already completed)'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
      jobId
    })
    
  } catch (error) {
    console.error('❌ Erro ao cancelar job:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Calcular progresso estimado baseado no status e tempo
function calculateProgress(job: any): number {
  switch (job.status) {
    case 'pending':
      return 0
    case 'processing':
      // Estimar progresso baseado no tempo de processamento
      const processingTime = Date.now() - job.updatedAt.getTime()
      const estimatedTotal = 30000 // 30 segundos estimados
      return Math.min(90, Math.floor((processingTime / estimatedTotal) * 100))
    case 'completed':
      return 100
    case 'failed':
      return 0
    default:
      return 0
  }
}

// Estimar tempo restante
function estimateTimeRemaining(job: any): number {
  if (job.status === 'completed' || job.status === 'failed') {
    return 0
  }
  
  if (job.status === 'pending') {
    // Estimar baseado na posição na fila
    const queueStats = QueueService.getQueueStats()
    const avgProcessingTime = 30000 // 30s por job
    return queueStats.pending * avgProcessingTime
  }
  
  if (job.status === 'processing') {
    const processingTime = Date.now() - job.updatedAt.getTime()
    const estimatedTotal = 30000 // 30s estimados
    return Math.max(0, estimatedTotal - processingTime)
  }
  
  return 0
}
