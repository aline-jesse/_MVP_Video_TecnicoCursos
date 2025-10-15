
/**
 * POST /api/voice/preview
 * Gerar prévia de TTS com voz customizada
 */

import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsService } from '@/lib/voice/elevenlabs-service'
import { captureError } from '@/lib/observability/sentry'

export async function POST(request: NextRequest) {
  try {
    const { voiceId, text } = await request.json()

    if (!voiceId || !text) {
      return NextResponse.json(
        { error: 'voiceId e text obrigatórios' },
        { status: 400 }
      )
    }

    const audio = await ElevenLabsService.generateTTS(voiceId, text)

    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audio.length.toString()
      }
    })
  } catch (error) {
    console.error('Erro ao gerar preview:', error)
    captureError(error as Error, { module: 'voice' })
    return NextResponse.json(
      { error: 'Erro ao gerar preview' },
      { status: 500 }
    )
  }
}
