
import { NextRequest, NextResponse } from 'next/server'
import { VideoProcessor } from '../../../../lib/video-processor'
import { Analytics } from '../../../../lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const { scenes, projectId } = await request.json()
    
    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json(
        { error: 'Cenas são obrigatórias' },
        { status: 400 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID do projeto é obrigatório' },
        { status: 400 }
      )
    }

    Analytics.track('video_preview_requested', {
      project_id: projectId,
      scenes_count: scenes.length,
      total_duration: scenes.reduce((sum: number, scene: any) => sum + (scene.duration || 0), 0)
    })

    // Gerar preview rápido
    const renderJob = await VideoProcessor.generatePreview(scenes, projectId)

    return NextResponse.json({
      success: true,
      jobId: renderJob.id,
      estimatedTime: 5000, // 5 segundos para preview
      status: renderJob.status,
      progress: renderJob.progress
    })

  } catch (error) {
    console.error('Preview Error:', error)
    
    Analytics.track('video_preview_failed', {
      error_message: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Erro na geração do preview' },
      { status: 500 }
    )
  }
}
