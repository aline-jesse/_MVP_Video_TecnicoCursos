
/**
 * 📊 API de Status de Renderização
 * GET /api/v1/render/status/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { videoRenderer } from '@/lib/video-renderer'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const jobId = params.id
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'ID do job é obrigatório' },
        { status: 400 }
      )
    }

    const job = videoRenderer.getJobStatus(jobId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      )
    }

    // Calcular tempo estimado restante
    const estimatedTimeRemaining = job.status === 'processing' 
      ? Math.ceil((100 - job.progress) * job.timeline.totalDuration * 0.005) // 0.5% por ponto de progresso
      : 0

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        projectId: job.projectId,
        status: job.status,
        progress: job.progress,
        outputUrl: job.outputUrl,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        estimatedTimeRemaining,
        timeline: {
          totalDuration: job.timeline.totalDuration,
          scenesCount: job.timeline.scenes.length,
          hasNarration: job.timeline.scenes.some(s => s.audio?.narration),
          hasMusic: job.timeline.scenes.some(s => s.audio?.backgroundMusic)
        },
        renderOptions: job.options
      }
    })

  } catch (error) {
    console.error('Get Job Status Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar status do job',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const jobId = params.id
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'ID do job é obrigatório' },
        { status: 400 }
      )
    }

    const cancelled = videoRenderer.cancelJob(jobId)
    
    if (!cancelled) {
      return NextResponse.json(
        { error: 'Job não pode ser cancelado (não existe ou não está processando)' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancelado com sucesso'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao cancelar job' },
      { status: 500 }
    )
  }
}
