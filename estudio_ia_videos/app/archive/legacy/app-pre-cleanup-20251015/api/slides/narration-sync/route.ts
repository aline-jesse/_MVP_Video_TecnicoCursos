

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { slideNarrationService } from '@/lib/tts/slide-narration-service'
import { slideAvatarSyncController } from '@/lib/synchronization/slide-avatar-sync'

export const dynamic = 'force-dynamic'

// POST /api/slides/narration-sync - Sistema completo de sincronização slide + narração + avatar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      slides,
      voiceConfig,
      avatarConfig,
      syncSettings,
      projectId = `project_${Date.now()}`
    } = body

    // Validações
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lista de slides é obrigatória' },
        { status: 400 }
      )
    }

    if (!voiceConfig?.voiceId) {
      return NextResponse.json(
        { success: false, error: 'Configuração de voz é obrigatória' },
        { status: 400 }
      )
    }

    console.log(`🎬 Iniciando sincronização completa para projeto ${projectId}`)
    console.log(`📊 ${slides.length} slides, voz: ${voiceConfig.voiceId}`)

    const startTime = Date.now()

    try {
      // PASSO 1: Gerar narração para todos os slides
      console.log('🎤 Etapa 1: Gerando narração...')
      
      const narrationRequests = slides.map((slide: any, index: number) => ({
        slideId: slide.id || `slide_${index}`,
        slideNumber: slide.slideNumber || index + 1,
        title: slide.title || '',
        content: slide.content || slide.bullets || [],
        notes: slide.notes || '',
        voiceConfig: {
          voiceId: voiceConfig.voiceId,
          speed: voiceConfig.speed || 1.0,
          pitch: voiceConfig.pitch || 1.0,
          emotion: voiceConfig.emotion || 'neutro',
          regional_expressions: voiceConfig.regional_expressions || false
        },
        syncWithAvatar: avatarConfig?.enabled || false,
        targetDuration: slide.duration || 15
      }))

      const narrationResults = await slideNarrationService.generateBatchNarration(
        narrationRequests,
        (progress) => {
          console.log(`📈 Progresso narração: ${progress.completedSlides}/${progress.totalSlides}`)
        }
      )

      // PASSO 2: Ajustar duração dos slides baseado na narração (se habilitado)
      console.log('⏱️ Etapa 2: Ajustando timing dos slides...')
      
      const adjustedSlides = syncSettings?.autoAdjustTiming 
        ? await adjustSlideTiming(slides, narrationResults)
        : slides

      // PASSO 3: Gerar timeline de sincronização
      console.log('🎯 Etapa 3: Gerando timeline de sincronização...')
      
      const syncConfiguration = {
        autoTransition: syncSettings?.autoTransition ?? true,
        waitForNarrationComplete: syncSettings?.waitForNarrationComplete ?? true,
        avatarGesturesEnabled: avatarConfig?.gesturesEnabled ?? true,
        lipSyncPrecision: syncSettings?.lipSyncPrecision || 'high',
        transitionDelay: syncSettings?.transitionDelay || 1000,
        gestureIntensity: avatarConfig?.gestureIntensity || 0.7
      }
      
      slideAvatarSyncController.updateSyncConfiguration(syncConfiguration)
      
      const timeline = slideAvatarSyncController.generateSyncTimeline(
        adjustedSlides,
        narrationResults,
        avatarConfig
      )

      // PASSO 4: Calcular estatísticas finais
      const processingTime = Date.now() - startTime
      const totalDuration = timeline.reduce((sum, slide) => sum + slide.duration, 0)
      const totalCost = narrationResults.reduce((sum, result) => sum + result.cost, 0)
      const successfulSlides = narrationResults.filter(r => r.segments.length > 0).length
      const avgQuality = narrationResults.reduce((sum, r) => sum + r.quality.pronunciation_score, 0) / narrationResults.length

      const finalResult = {
        projectId,
        slides: adjustedSlides,
        narrationResults,
        timeline,
        summary: {
          totalSlides: slides.length,
          successfulSlides,
          failedSlides: slides.length - successfulSlides,
          totalDuration: Math.round(totalDuration),
          totalCost: Math.round(totalCost * 100) / 100,
          averageQuality: Math.round(avgQuality * 100) / 100,
          processingTime,
          syncConfiguration,
          generatedAt: new Date().toISOString()
        }
      }

      console.log(`✅ Sincronização completa em ${processingTime}ms`)
      console.log(`📊 Resumo: ${successfulSlides}/${slides.length} slides, ${Math.round(totalDuration)}s, R$ ${totalCost.toFixed(2)}`)

      return NextResponse.json({
        success: true,
        data: finalResult,
        message: `Sincronização completa: ${successfulSlides}/${slides.length} slides processados com sucesso`
      })

    } catch (processingError) {
      console.error('❌ Erro no processamento:', processingError)
      
      return NextResponse.json(
        {
          success: false,
          error: processingError instanceof Error ? processingError.message : 'Erro no processamento',
          details: 'Erro durante a geração de narração ou sincronização',
          processing_time: Date.now() - startTime
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Erro na API de sincronização:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}

/**
 * Ajustar timing dos slides baseado na duração da narração
 */
async function adjustSlideTiming(slides: any[], narrationResults: any[]): Promise<any[]> {
  return slides.map((slide, index) => {
    const narration = narrationResults[index]
    
    if (narration && narration.totalDuration > 0) {
      // Adicionar 2 segundos de buffer para transição
      const adjustedDuration = Math.ceil(narration.totalDuration) + 2
      
      console.log(`⏱️ Slide ${index + 1}: ${slide.duration}s → ${adjustedDuration}s`)
      
      return {
        ...slide,
        duration: adjustedDuration,
        original_duration: slide.duration,
        adjusted_by_narration: true
      }
    }
    
    return slide
  })
}

// GET /api/slides/narration-sync - Obter configurações e status
export async function GET() {
  try {
    const timelineStats = slideAvatarSyncController.getTimelineStats()
    const cacheStats = slideNarrationService.getCacheStats()

    return NextResponse.json({
      success: true,
      data: {
        service_status: 'online',
        timeline_stats: timelineStats,
        cache_stats: cacheStats,
        capabilities: {
          max_slides: 50,
          supported_formats: ['mp3', 'wav'],
          sync_precision: 'high',
          avatar_integration: true,
          regional_voices: true,
          auto_timing: true
        },
        pricing: {
          narration_per_slide: 'R$ 0.15 - R$ 0.45',
          sync_processing: 'R$ 0.05 por slide',
          avatar_lip_sync: 'Incluído'
        }
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao obter status' },
      { status: 500 }
    )
  }
}

