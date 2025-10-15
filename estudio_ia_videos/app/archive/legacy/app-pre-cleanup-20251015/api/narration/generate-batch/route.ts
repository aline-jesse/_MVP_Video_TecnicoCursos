

import { NextRequest, NextResponse } from 'next/server'
import { PPTXTTSIntegration } from '../../../../lib/pptx/pptx-tts-integration'

export async function POST(request: NextRequest) {
  try {
    const { slides, voiceConfig, options } = await request.json()
    
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'Slides não fornecidos ou formato inválido' },
        { status: 400 }
      )
    }

    if (!voiceConfig || !voiceConfig.voiceId) {
      return NextResponse.json(
        { error: 'Configuração de voz não fornecida' },
        { status: 400 }
      )
    }

    // Validate voice configuration
    const defaultVoiceConfig = {
      voiceId: voiceConfig.voiceId,
      language: voiceConfig.language || 'pt-BR',
      speed: voiceConfig.speed || 1.0,
      pitch: voiceConfig.pitch || 1.0
    }

    // Generate batch narration with progress tracking
    const results = await PPTXTTSIntegration.generateBatchNarration(
      slides,
      defaultVoiceConfig
    )

    // Calculate summary metrics
    const summary = {
      totalSlides: slides.length,
      successfulSlides: results.length,
      totalDuration: results.reduce((sum, result) => sum + result.totalDuration, 0),
      totalCost: results.reduce((sum, result) => sum + result.cost, 0),
      averageDurationPerSlide: results.length > 0 ? 
        results.reduce((sum, result) => sum + result.totalDuration, 0) / results.length : 0
    }

    return NextResponse.json({
      success: true,
      results,
      summary,
      message: `Narração gerada para ${results.length} de ${slides.length} slides`
    })

  } catch (error) {
    console.error('Error in batch narration generation:', error)
    return NextResponse.json(
      { error: 'Erro interno durante geração de narração' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return TTS cache statistics
    const cacheStats = PPTXTTSIntegration.getCacheStats()
    
    return NextResponse.json({
      success: true,
      cacheStats
    })

  } catch (error) {
    console.error('Error getting narration stats:', error)
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas de narração' },
      { status: 500 }
    )
  }
}
