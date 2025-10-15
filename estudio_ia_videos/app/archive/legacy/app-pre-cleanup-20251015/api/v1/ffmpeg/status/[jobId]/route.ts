
/**
 * 🎬 API FFmpeg Status - Status de job específico
 */

import { NextRequest, NextResponse } from 'next/server'
import { ffmpegEngine } from '@/lib/ffmpeg-engine'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    const job = await ffmpegEngine.getJobStatus(jobId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      job
    })

  } catch (error) {
    console.error('Erro ao obter status do job:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params
    const success = await ffmpegEngine.cancelJob(jobId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Job não encontrado ou não pôde ser cancelado' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancelado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao cancelar job:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
