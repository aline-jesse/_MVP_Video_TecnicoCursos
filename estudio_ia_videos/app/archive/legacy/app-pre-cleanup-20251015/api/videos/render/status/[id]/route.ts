import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/videos/render/status/[id]
 * Verifica o status de um job de renderização
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID é obrigatório' },
        { status: 400 }
      )
    }

    // Simular progresso do job
    const mockProgress = Math.min(100, Math.floor((Date.now() % 60000) / 600))
    const isCompleted = mockProgress >= 95

    const jobStatus = {
      id: jobId,
      status: isCompleted ? 'completed' : 'processing',
      progress: mockProgress,
      message: isCompleted 
        ? 'Renderização concluída com sucesso!' 
        : `Processando... ${mockProgress}%`,
      estimatedTimeRemaining: isCompleted ? 0 : Math.max(0, 60 - mockProgress),
      createdAt: new Date(Date.now() - (mockProgress * 1000)).toISOString(),
      updatedAt: new Date().toISOString(),
      downloadUrl: isCompleted ? `/api/videos/render/download/${jobId}` : null,
      details: {
        currentStep: isCompleted ? 'Finalizado' : 'Renderizando vídeo',
        totalSteps: 5,
        completedSteps: Math.floor(mockProgress / 20),
        outputFormat: 'mp4',
        resolution: '1080p'
      }
    }

    return NextResponse.json({
      success: true,
      data: jobStatus
    })

  } catch (error) {
    console.error('Erro ao verificar status do job:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno ao verificar status',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}