
import { NextRequest, NextResponse } from 'next/server'
import { AdvancedVoiceLibrary, VoiceFilter } from '../../../../lib/voice-library-advanced'
import { Analytics } from '../../../../lib/analytics'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Filtros da URL
    const filter: VoiceFilter = {
      gender: searchParams.get('gender')?.split(','),
      region: searchParams.get('region')?.split(','),
      specialty: searchParams.get('specialty')?.split(','),
      tone: searchParams.get('tone')?.split(','),
      premium: searchParams.get('premium') === 'true' ? true : 
               searchParams.get('premium') === 'false' ? false : undefined
    }

    // Limpar filtros vazios
    Object.keys(filter).forEach(key => {
      if (!filter[key as keyof VoiceFilter]) {
        delete filter[key as keyof VoiceFilter]
      }
    })

    // Obter vozes filtradas
    const voices = Object.keys(filter).length > 0 
      ? AdvancedVoiceLibrary.filterVoices(filter)
      : AdvancedVoiceLibrary.getAllVoices()

    // Estatísticas da biblioteca
    const stats = AdvancedVoiceLibrary.getLibraryStats()

    Analytics.track('advanced_voices_loaded', {
      total_voices: voices.length,
      filters_applied: Object.keys(filter),
      premium_requested: filter.premium
    })

    return NextResponse.json({
      success: true,
      voices: voices.map(voice => ({
        ...voice,
        sample_url: AdvancedVoiceLibrary.generateSampleUrl(voice.id)
      })),
      stats,
      total: voices.length,
      filters_applied: filter
    })

  } catch (error) {
    console.error('Error loading advanced voices:', error)
    
    Analytics.track('advanced_voices_error', {
      error_message: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Erro ao carregar biblioteca de vozes avançada' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content_type, nr } = await request.json()
    
    let recommendations = []
    
    if (nr) {
      // Recomendações para NR específica
      recommendations = AdvancedVoiceLibrary.getSpecializedVoicesForNR(nr)
    } else if (content_type) {
      // Recomendações para tipo de conteúdo
      recommendations = AdvancedVoiceLibrary.recommendVoicesForContent(content_type)
    } else {
      // Top vozes gerais
      recommendations = AdvancedVoiceLibrary.getAllVoices().slice(0, 10)
    }

    Analytics.track('voice_recommendations_requested', {
      content_type,
      nr,
      recommendations_count: recommendations.length
    })

    return NextResponse.json({
      success: true,
      recommendations: recommendations.map(voice => ({
        ...voice,
        sample_url: AdvancedVoiceLibrary.generateSampleUrl(voice.id)
      })),
      criteria: { content_type, nr }
    })

  } catch (error) {
    console.error('Error getting voice recommendations:', error)
    
    return NextResponse.json(
      { error: 'Erro ao obter recomendações de voz' },
      { status: 500 }
    )
  }
}
