

import { NextRequest, NextResponse } from 'next/server'
import { VoiceCloningSystem } from '../../../../../lib/voice/voice-cloning-system'

export async function POST(request: NextRequest) {
  try {
    const voice_clone_request = await request.json()

    // Validar dados
    if (!voice_clone_request.audio_samples || voice_clone_request.audio_samples.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Amostras de áudio são obrigatórias' },
        { status: 400 }
      )
    }

    // Analisar qualidade das amostras primeiro
    const analysis = await VoiceCloningSystem.analyzeAudioSamples(
      voice_clone_request.audio_samples
    )

    // Se qualidade for muito baixa, retornar recomendações
    if (analysis.estimated_results.success_probability < 60) {
      return NextResponse.json({
        success: false,
        error: 'Qualidade das amostras insuficiente',
        analysis,
        recommendations: analysis.recommendations
      })
    }

    // Criar clone de voz
    const clone_result = await VoiceCloningSystem.createVoiceClone(voice_clone_request)

    return NextResponse.json({
      success: true,
      clone: {
        id: clone_result.clone_id,
        training_job_id: clone_result.training_job_id,
        estimated_completion: clone_result.estimated_completion,
        samples_processed: clone_result.initial_samples_processed,
        status_check_url: `/api/enterprise/voice-cloning/status/${clone_result.training_job_id}`,
        next_steps: clone_result.next_steps
      },
      analysis
    })

  } catch (error) {
    console.error('Erro na criação do clone de voz:', error)
    return NextResponse.json(
      { success: false, error: 'Falha na criação do clone' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id') || 'demo-user'

    // Buscar vozes do usuário
    const voice_library = await VoiceCloningSystem.getRegionalVoiceLibrary()
    
    // Simular vozes personalizadas do usuário
    const user_voices = [
      {
        id: 'custom-voice-1',
        name: 'Minha Voz Personalizada',
        type: 'custom',
        similarity_score: 89,
        naturalness_score: 85,
        status: 'ready',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      voices: {
        custom_voices: user_voices,
        regional_library: voice_library,
        total_available: user_voices.length + voice_library.length
      }
    })

  } catch (error) {
    console.error('Erro ao buscar vozes:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar vozes' },
      { status: 500 }
    )
  }
}

