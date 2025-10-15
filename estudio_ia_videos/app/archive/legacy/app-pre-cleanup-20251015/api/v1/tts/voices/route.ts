import { NextResponse } from 'next/server'
import { listVoices } from '@/lib/tts-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ success: true, voices: listVoices() })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao listar vozes' }, { status: 500 })
  }
}
