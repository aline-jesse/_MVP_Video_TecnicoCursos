
/**
 * 🎙️ Google Cloud TTS API
 * Endpoint para síntese de voz com Google Cloud
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleTTSService } from '@/lib/google-tts-service'
import { MetricsService } from '@/lib/metrics-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const {
      text,
      voice = 'pt-BR-Neural2-A',
      language = 'pt-BR',
      audioEncoding = 'MP3',
      speakingRate = 1.0,
      pitch = 0.0,
      volumeGainDb = 0.0
    } = await request.json()
    
    console.log('🎙️ Google Cloud TTS Request:', {
      textLength: text?.length,
      voice,
      language,
      audioEncoding
    })
    
    // Validação
    const validationError = GoogleTTSService.validateConfig({
      text,
      voice,
      language,
      audioEncoding,
      speakingRate,
      pitch,
      volumeGainDb
    })
    
    if (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError
      }, { status: 400 })
    }
    
    // Síntese de voz
    const result = await MetricsService.measureOperation('google_tts_synthesis', async () => {
      return GoogleTTSService.synthesizeSpeech({
        text,
        voice,
        language,
        audioEncoding,
        speakingRate,
        pitch,
        volumeGainDb
      })
    })
    
    // Registrar métricas
    MetricsService.recordTTSMetrics({
      provider: 'google',
      textLength: text.length,
      audioDuration: result.duration || 0,
      processingTime: Date.now() - startTime,
      success: result.success,
      voice
    })
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to synthesize speech'
      }, { status: 500 })
    }
    
    console.log('✅ Google TTS synthesis completed:', {
      audioUrl: result.audioUrl,
      duration: result.duration
    })
    
    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      duration: result.duration,
      voice,
      language,
      metadata: {
        provider: 'google-cloud-tts',
        audioEncoding,
        speakingRate,
        pitch,
        processingTime: Date.now() - startTime
      }
    })
    
  } catch (error) {
    console.error('❌ Google TTS API Error:', error)
    
    MetricsService.recordTTSMetrics({
      provider: 'google',
      textLength: 0,
      audioDuration: 0,
      processingTime: Date.now() - startTime,
      success: false,
      voice: 'unknown'
    })
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Listar vozes disponíveis
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Listando vozes do Google Cloud TTS...')
    
    const voices = await GoogleTTSService.listVoices()
    
    return NextResponse.json({
      success: true,
      voices,
      totalVoices: voices.length,
      provider: 'google-cloud-tts'
    })
    
  } catch (error) {
    console.error('❌ Erro ao listar vozes:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to list voices',
      fallbackVoices: Object.entries(GoogleTTSService.BRAZILIAN_VOICES).map(([name, info]) => ({
        name,
        ...info,
        languageCode: 'pt-BR'
      }))
    }, { status: 500 })
  }
}
