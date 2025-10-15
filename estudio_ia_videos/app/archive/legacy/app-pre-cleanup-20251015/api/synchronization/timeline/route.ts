

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { slideAvatarSyncController, SyncConfiguration } from '@/lib/synchronization/slide-avatar-sync'

export const dynamic = 'force-dynamic'

// POST /api/synchronization/timeline - Gerar timeline de sincronização
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { slides, narrationResults, avatarConfig, syncConfig } = body

    if (!slides || !narrationResults) {
      return NextResponse.json(
        { success: false, error: 'Slides e resultados de narração são obrigatórios' },
        { status: 400 }
      )
    }

    // Configurar sincronizador
    if (syncConfig) {
      slideAvatarSyncController.updateSyncConfiguration(syncConfig)
    }

    // Gerar timeline
    const timeline = slideAvatarSyncController.generateSyncTimeline(
      slides,
      narrationResults,
      avatarConfig || {
        enabled: true,
        gesturesEnabled: true,
        expressionsEnabled: true,
        lipSyncEnabled: true
      }
    )

    const stats = slideAvatarSyncController.getTimelineStats()

    return NextResponse.json({
      success: true,
      data: {
        timeline,
        stats,
        configuration: syncConfig
      },
      message: `Timeline gerada: ${stats.totalSlides} slides, ${Math.round(stats.totalDuration / 60)}min`
    })

  } catch (error) {
    console.error('Erro na geração de timeline:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}

// GET /api/synchronization/timeline - Obter timeline atual
export async function GET() {
  try {
    const timeline = slideAvatarSyncController.getTimeline()
    const stats = slideAvatarSyncController.getTimelineStats()

    return NextResponse.json({
      success: true,
      data: {
        timeline,
        stats,
        isActive: timeline.length > 0
      }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao obter timeline' },
      { status: 500 }
    )
  }
}

// PUT /api/synchronization/timeline - Atualizar configuração
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { syncConfig } = body

    if (!syncConfig) {
      return NextResponse.json(
        { success: false, error: 'Configuração de sincronização é obrigatória' },
        { status: 400 }
      )
    }

    slideAvatarSyncController.updateSyncConfiguration(syncConfig)

    return NextResponse.json({
      success: true,
      message: 'Configuração de sincronização atualizada',
      data: { syncConfig }
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar configuração' },
      { status: 500 }
    )
  }
}

