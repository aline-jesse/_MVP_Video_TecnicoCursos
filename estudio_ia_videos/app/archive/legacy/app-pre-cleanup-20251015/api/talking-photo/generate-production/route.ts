
/**
 * 🏭 Production Talking Photo Generation
 * API completa para geração de talking photos em produção
 */

import { NextRequest, NextResponse } from 'next/server'
import { QueueService } from '@/lib/queue-service'
import { MetricsService } from '@/lib/metrics-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const {
      text,
      avatarId,
      photoUrl,
      voiceSettings = {},
      videoOptions = {},
      processingMode = 'async' // 'async' | 'sync'
    } = await request.json()
    
    console.log('🏭 Production Talking Photo Request:', {
      textLength: text?.length,
      avatarId,
      processingMode,
      hasCustomPhoto: !!photoUrl
    })
    
    // Validação dos dados
    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Texto é obrigatório'
      }, { status: 400 })
    }
    
    if (!avatarId) {
      return NextResponse.json({
        success: false,
        error: 'Avatar ID é obrigatório'
      }, { status: 400 })
    }
    
    if (text.length > 5000) {
      return NextResponse.json({
        success: false,
        error: 'Texto muito longo (máximo 5000 caracteres)'
      }, { status: 400 })
    }
    
    // Preparar dados do job
    const jobData = {
      text: text.trim(),
      avatarId,
      photoUrl,
      voiceSettings: {
        voice: voiceSettings.voice || 'pt-BR-Neural2-A',
        language: voiceSettings.language || 'pt-BR',
        speed: voiceSettings.speed || 1.0,
        pitch: voiceSettings.pitch || 0.0,
        emotion: voiceSettings.emotion || 'neutral'
      },
      videoOptions: {
        resolution: videoOptions.resolution || '1080p',
        fps: videoOptions.fps || 30,
        format: videoOptions.format || 'mp4',
        background: videoOptions.background,
        effects: videoOptions.effects || []
      },
      metadata: {
        requestTime: new Date().toISOString(),
        clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent')
      }
    }
    
    // Determinar prioridade do job
    const priority = calculateJobPriority(jobData)
    
    if (processingMode === 'async') {
      // Processamento assíncrono (recomendado para produção)
      const jobId = await QueueService.addJob('talking-photo', jobData, priority)
      
      console.log('📋 Job adicionado à fila:', jobId)
      
      // Registrar métricas
      MetricsService.recordMetric('talking_photo.jobs_queued', 1, {
        avatarId,
        resolution: jobData.videoOptions.resolution,
        textLength: text.length.toString()
      })
      
      return NextResponse.json({
        success: true,
        jobId,
        status: 'queued',
        estimatedWaitTime: estimateWaitTime(),
        statusUrl: `/api/talking-photo/status/${jobId}`,
        message: 'Job adicionado à fila de processamento'
      })
      
    } else {
      // Processamento síncrono (para casos especiais)
      console.log('⚡ Processamento síncrono iniciado...')
      
      const result = await MetricsService.measureOperation('talking_photo_sync', async () => {
        return processSynchronously(jobData)
      })
      
      // Registrar métricas
      MetricsService.recordTalkingPhotoMetrics({
        textLength: text.length,
        audioDuration: result.audioDuration || 0,
        videoDuration: result.videoDuration || 0,
        resolution: jobData.videoOptions.resolution,
        processingTime: Date.now() - startTime,
        success: result.success,
        avatarId,
        voice: jobData.voiceSettings.voice
      })
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: 'Falha no processamento'
        }, { status: 500 })
      }
      
      return NextResponse.json({
        ...result,
        processingTime: Date.now() - startTime,
        processingMode: 'sync'
      })
    }
    
  } catch (error) {
    console.error('❌ Erro na API de produção:', error)
    
    // Registrar erro nas métricas
    MetricsService.recordMetric('talking_photo.api_errors', 1, {
      error: error instanceof Error ? error.message : 'unknown'
    })
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Processamento síncrono direto
async function processSynchronously(jobData: any) {
  const { GoogleTTSService } = await import('@/lib/google-tts-service')
  const { TalkingHeadProcessor } = await import('@/lib/talking-head-processor')
  
  console.log('🎙️ Iniciando síntese de voz...')
  
  // 1. TTS com Google Cloud
  const ttsResult = await GoogleTTSService.synthesizeSpeech({
    text: jobData.text,
    voice: jobData.voiceSettings.voice,
    language: jobData.voiceSettings.language,
    speakingRate: jobData.voiceSettings.speed,
    pitch: jobData.voiceSettings.pitch
  })
  
  if (!ttsResult.success || !ttsResult.audioContent) {
    throw new Error(`TTS falhou: ${ttsResult.error}`)
  }
  
  console.log('🎬 Iniciando processamento de vídeo...')
  
  // 2. Processamento de vídeo
  const videoResult = await TalkingHeadProcessor.processVideo({
    avatarId: jobData.avatarId,
    audioUrl: ttsResult.audioUrl!,
    audioBuffer: ttsResult.audioContent,
    resolution: jobData.videoOptions.resolution,
    fps: jobData.videoOptions.fps,
    format: jobData.videoOptions.format
  })
  
  if (!videoResult.success) {
    throw new Error(`Processamento de vídeo falhou: ${videoResult.error}`)
  }
  
  return {
    success: true,
    audioUrl: ttsResult.audioUrl,
    videoUrl: videoResult.videoUrl,
    thumbnailUrl: videoResult.thumbnailUrl,
    audioDuration: ttsResult.duration,
    videoDuration: ttsResult.duration, // Same as audio
    metadata: {
      ttsProvider: 'google-cloud',
      videoProcessor: 'advanced',
      s3VideoKey: videoResult.s3VideoKey,
      s3ThumbnailKey: videoResult.s3ThumbnailKey,
      fileSize: videoResult.fileSize
    }
  }
}

// Calcular prioridade do job
function calculateJobPriority(jobData: any): number {
  let priority = 0
  
  // Texto mais curto = prioridade maior
  if (jobData.text.length < 100) priority += 10
  else if (jobData.text.length < 500) priority += 5
  
  // Resolução menor = prioridade maior
  if (jobData.videoOptions.resolution === '720p') priority += 5
  else if (jobData.videoOptions.resolution === '480p') priority += 10
  
  // Avatar padrão = prioridade maior
  if (!jobData.photoUrl) priority += 3
  
  return priority
}

// Estimar tempo de espera na fila
function estimateWaitTime(): number {
  const stats = QueueService.getQueueStats()
  const avgProcessingTime = 30000 // 30s por job (estimativa)
  
  return stats.pending * avgProcessingTime
}

// Status do job
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const jobId = url.searchParams.get('jobId')
  
  if (!jobId) {
    return NextResponse.json({
      success: false,
      error: 'Job ID é obrigatório'
    }, { status: 400 })
  }
  
  const job = QueueService.getJobStatus(jobId)
  
  if (!job) {
    return NextResponse.json({
      success: false,
      error: 'Job não encontrado'
    }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    jobId: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    attempts: job.attempts,
    error: job.error,
    result: job.result,
    estimatedCompletion: job.status === 'processing' ? 
      new Date(Date.now() + 30000) : // 30s estimation
      null
  })
}
