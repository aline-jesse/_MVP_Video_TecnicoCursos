
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { generateTTS, GOOGLE_TTS_VOICES } from '@/lib/google-tts'

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, speed, pitch, volume } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Texto e voz são obrigatórios' },
        { status: 400 }
      )
    }

    const audioUrl = await generateTTS({
      text,
      voiceId,
      speed,
      pitch,
      volume
    })

    return NextResponse.json({
      success: true,
      audioUrl,
      duration: Math.ceil(text.split(/\s+/).length / 2.5), // ~150 words per minute
      message: 'Áudio gerado com sucesso'
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar áudio' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    voices: GOOGLE_TTS_VOICES,
    totalVoices: GOOGLE_TTS_VOICES.length
  })
}
