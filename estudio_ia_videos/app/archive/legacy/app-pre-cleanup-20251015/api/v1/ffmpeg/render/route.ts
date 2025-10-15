
/**
 * 🎬 API FFmpeg Render - Iniciar renderização
 */

import { NextRequest, NextResponse } from 'next/server'
import { ffmpegEngine } from '@/lib/ffmpeg-engine'

export async function POST(request: NextRequest) {
  try {
    const { timeline, settings } = await request.json()
    
    if (!timeline || !settings) {
      return NextResponse.json(
        { error: 'Timeline e settings são obrigatórios' },
        { status: 400 }
      )
    }

    const jobId = await ffmpegEngine.createRenderJob({
      type: 'timeline-render',
      input: { timeline },
      output: {
        format: settings.format || 'mp4',
        resolution: settings.resolution || '1080p',
        quality: settings.quality || 'standard',
        fps: settings.fps || 30
      }
    })
    
    return NextResponse.json({
      success: true,
      jobId,
      message: 'Renderização iniciada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao iniciar renderização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const allJobs = await ffmpegEngine.getAllJobs()
    
    return NextResponse.json({
      success: true,
      jobs: allJobs.slice(-20) // Últimos 20 jobs
    })

  } catch (error) {
    console.error('Erro ao obter status da fila:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
