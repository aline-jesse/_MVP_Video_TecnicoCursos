

import { NextRequest, NextResponse } from 'next/server'
import { BrazilianRegionalTTS } from '../../../../lib/tts/brazilian-regional-tts'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';
// GET /api/tts/brazilian-voices - Listar vozes regionais brasileiras
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const region = searchParams.get('region')
    const gender = searchParams.get('gender')
    const industry = searchParams.get('industry')
    const content_type = searchParams.get('content_type')
    const target_audience = searchParams.get('target_audience')

    let voices = BrazilianRegionalTTS.REGIONAL_VOICES

    // Filtrar por região
    if (region && region !== 'all') {
      voices = BrazilianRegionalTTS.getVoicesByRegion(region)
    }

    // Filtrar por gênero
    if (gender && gender !== 'all') {
      voices = voices.filter(v => v.characteristics.gender === gender)
    }

    // Filtrar por indústria
    if (industry && industry !== 'all') {
      voices = BrazilianRegionalTTS.getVoicesForIndustry(industry)
    }

    // Recomendar por tipo de conteúdo
    if (content_type && target_audience) {
      voices = BrazilianRegionalTTS.getRecommendedVoiceForContent(content_type, target_audience)
    }

    return NextResponse.json({
      success: true,
      data: voices,
      total: voices.length,
      filters: {
        regions: ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'],
        genders: ['masculino', 'feminino', 'neutro'],
        industries: ['industrial', 'corporativo', 'educacional', 'saude', 'tecnologia'],
        content_types: ['nr', 'treinamento', 'apresentacao', 'marketing', 'educacional']
      }
    })

  } catch (error) {
    console.error('Erro ao buscar vozes regionais:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/tts/brazilian-voices - Gerar fala regional
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice_id, options } = body

    if (!text || !voice_id) {
      return NextResponse.json(
        { success: false, error: 'Texto e ID da voz são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar fala regional
    const speechResult = await BrazilianRegionalTTS.generateRegionalSpeech(
      text,
      voice_id,
      options
    )

    return NextResponse.json({
      success: true,
      data: speechResult,
      message: 'Fala regional gerada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao gerar fala regional:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

