import { NextRequest, NextResponse } from 'next/server'
import { synthesizeToFile } from '@/lib/tts-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, speed, pitch, volume } = await request.json()
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Campo "text" é obrigatório' }, { status: 400 })
    }

    const result = await synthesizeToFile({ text, voiceId, speed, pitch, volume })
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao sintetizar TTS' }, { status: 500 })
  }
}
