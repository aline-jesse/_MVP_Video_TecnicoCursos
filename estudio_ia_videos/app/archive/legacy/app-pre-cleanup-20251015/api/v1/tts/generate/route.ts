
/**
 * 🗣️ API de Geração TTS
 * POST /api/v1/tts/generate
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateTTS, GOOGLE_TTS_VOICES } from '@/lib/google-tts'

export async function POST(request: NextRequest) {
  try {
    const { text, voice, speed = 1.0, pitch = 0, volume = 0 } = await request.json()

    if (!text || !voice) {
      return NextResponse.json(
        { error: 'Texto e voz são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar tamanho do texto (limite do Google TTS)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Texto muito longo. Máximo 5000 caracteres.' },
        { status: 400 }
      )
    }

    const ttsResponse = await generateTTS({
      text,
      voiceId: voice,
      speed,
      pitch,
      volume
    })

    return NextResponse.json({
      success: true,
      audio: ttsResponse,
      costs: {
        characters: text.length,
        estimatedCost: Math.ceil(text.length / 1000000 * 16) // $16 por 1M chars
      }
    })

  } catch (error) {
    console.error('TTS Generation Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao gerar TTS',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const voices = GOOGLE_TTS_VOICES
    
    return NextResponse.json({
      success: true,
      voices,
      totalVoices: voices.length,
      availableLanguages: ['pt-BR'],
      pricing: {
        wavenet: '$16 por 1M caracteres',
        neural2: '$16 por 1M caracteres',
        standard: '$4 por 1M caracteres'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar vozes disponíveis' },
      { status: 500 }
    )
  }
}
