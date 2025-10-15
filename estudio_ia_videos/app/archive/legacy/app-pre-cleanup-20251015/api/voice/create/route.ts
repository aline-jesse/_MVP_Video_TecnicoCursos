
/**
 * POST /api/voice/create
 * Criar voz customizada com ElevenLabs
 */

import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsService } from '@/lib/voice/elevenlabs-service'
import { captureError } from '@/lib/observability/sentry'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    
    if (!name) {
      return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
    }

    const samples: Buffer[] = []
    let i = 0
    while (formData.has(`sample${i}`)) {
      const file = formData.get(`sample${i}`) as File
      const arrayBuffer = await file.arrayBuffer()
      samples.push(Buffer.from(arrayBuffer))
      i++
    }

    if (samples.length < 3) {
      return NextResponse.json(
        { error: 'Mínimo 3 amostras necessárias' },
        { status: 400 }
      )
    }

    const job = await ElevenLabsService.createVoice(name, samples)

    return NextResponse.json(job)
  } catch (error) {
    console.error('Erro ao criar voz:', error)
    captureError(error as Error, { module: 'voice' })
    return NextResponse.json(
      { error: 'Erro ao criar voz customizada' },
      { status: 500 }
    )
  }
}
