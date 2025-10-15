
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { vidnozAvatarEngine, AvatarGenerationOptions } from '@/lib/vidnoz-avatar-engine'

/**
 * 🎬 API para gerar vídeo com avatar hiper-realista
 * POST /api/avatars/hyperreal/generate
 */
export async function POST(request: NextRequest) {
  try {
    const options: AvatarGenerationOptions = await request.json()

    // Validações
    if (!options.avatarId) {
      return NextResponse.json(
        { success: false, error: 'Avatar ID é obrigatório' },
        { status: 400 }
      )
    }

    if (!options.text || options.text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Texto é obrigatório' },
        { status: 400 }
      )
    }

    if (options.text.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Texto muito longo. Máximo 5000 caracteres' },
        { status: 400 }
      )
    }

    // Gerar vídeo
    const renderJob = await vidnozAvatarEngine.generateAvatarVideo(options)

    return NextResponse.json({
      success: true,
      job: renderJob,
      message: 'Geração de avatar iniciada com sucesso'
    })

  } catch (error: any) {
    console.error('Erro na geração de avatar:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro interno na geração de avatar'
      },
      { status: 500 }
    )
  }
}

/**
 * 📋 Listar jobs ativos
 */
export async function GET(request: NextRequest) {
  try {
    // Em produção, buscar do banco de dados
    return NextResponse.json({
      success: true,
      activeJobs: [],
      queueSize: 0,
      message: 'Jobs ativos recuperados'
    })

  } catch (error) {
    console.error('Erro ao listar jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao listar jobs' },
      { status: 500 }
    )
  }
}
