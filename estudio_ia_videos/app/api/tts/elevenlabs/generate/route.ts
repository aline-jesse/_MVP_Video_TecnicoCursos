
import { NextRequest, NextResponse } from 'next/server'
import ElevenLabsService from '@/lib/elevenlabs-service'

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id, model_id, voice_settings } = await request.json()

    // Validações
    if (!text || !voice_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Texto e voice_id são obrigatórios'
        },
        { status: 400 }
      )
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Texto muito longo. Máximo 5000 caracteres.'
        },
        { status: 400 }
      )
    }

    const elevenLabsService = ElevenLabsService.getInstance()
    
    const audioBuffer = await elevenLabsService.generateSpeech({
      text,
      voice_id,
      model_id: model_id || 'eleven_multilingual_v2',
      voice_settings: voice_settings || {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
      }
    })

    // Converter ArrayBuffer para Buffer
    const buffer = Buffer.from(audioBuffer)

    // Retornar o áudio como resposta
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `attachment; filename="tts-${voice_id}-${Date.now()}.mp3"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar TTS:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao gerar áudio TTS',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
