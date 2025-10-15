
/**
 * GET /api/voice/status?jobId=xxx
 * Verificar status do treinamento
 */

import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsService } from '@/lib/voice/elevenlabs-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'jobId obrigatório' }, { status: 400 })
    }

    const status = await ElevenLabsService.getJobStatus(jobId)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}
