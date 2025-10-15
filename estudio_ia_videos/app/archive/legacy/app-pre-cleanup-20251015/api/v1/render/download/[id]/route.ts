
/**
 * 📥 API de Download de Vídeo Renderizado
 * GET /api/v1/render/download/[id]
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

    if (job.status !== 'completed') {
      return NextResponse.json(
        { 
          error: 'Vídeo ainda não está pronto',
          status: job.status,
          progress: job.progress
        },
        { status: 400 }
      )
    }

    // Por agora, simular download de vídeo
    // Em produção, seria um stream do arquivo real gerado pelo FFmpeg
    const mockVideoContent = `
      Mock Video Content for Job: ${jobId}
      Project: ${job.projectId}
      Duration: ${job.timeline.totalDuration}s
      Scenes: ${job.timeline.scenes.length}
      Generated: ${job.completedAt}
      
      Este é um arquivo de vídeo simulado.
      Em produção, seria o arquivo MP4 real gerado pelo FFmpeg.
    `

    // Headers para download
    const headers = new Headers()
    headers.set('Content-Type', 'video/mp4')
    headers.set('Content-Disposition', `attachment; filename="video_${jobId}.mp4"`)
    headers.set('Content-Length', mockVideoContent.length.toString())

    return new NextResponse(mockVideoContent, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Download Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao fazer download do vídeo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Informações sobre o arquivo sem fazer download
export async function HEAD(request: NextRequest, { params }: RouteParams) {
  try {
    const jobId = params.id
    const job = videoRenderer.getJobStatus(jobId)
    
    if (!job || job.status !== 'completed') {
      return new NextResponse(null, { status: 404 })
    }

    const headers = new Headers()
    headers.set('Content-Type', 'video/mp4')
    headers.set('Content-Length', '1048576') // 1MB simulado
    headers.set('Last-Modified', job.completedAt?.toUTCString() || new Date().toUTCString())

    return new NextResponse(null, {
      status: 200,
      headers
    })

  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}
