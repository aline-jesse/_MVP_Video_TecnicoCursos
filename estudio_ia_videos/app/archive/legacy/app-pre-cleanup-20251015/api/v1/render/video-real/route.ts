
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

interface RenderJob {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  progress: number
  projectData: any
  createdAt: string
  videoUrl?: string
  error?: string
}

// Mock job storage - in production use Redis or database
const renderJobs = new Map<string, RenderJob>()

export async function POST(request: NextRequest) {
  try {
    const { projectData, settings = {} } = await request.json()

    if (!projectData) {
      return NextResponse.json(
        { error: 'Dados do projeto são obrigatórios' },
        { status: 400 }
      )
    }

    const jobId = uuidv4()
    const job: RenderJob = {
      id: jobId,
      status: 'queued',
      progress: 0,
      projectData,
      createdAt: new Date().toISOString()
    }

    renderJobs.set(jobId, job)

    // Start background processing
    processVideoRender(jobId)

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Renderização iniciada'
    })
  } catch (error) {
    console.error('Render error:', error)
    return NextResponse.json(
      { error: 'Erro ao iniciar renderização' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID é obrigatório' },
      { status: 400 }
    )
  }

  const job = renderJobs.get(jobId)
  if (!job) {
    return NextResponse.json(
      { error: 'Job não encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json(job)
}

async function processVideoRender(jobId: string) {
  const job = renderJobs.get(jobId)
  if (!job) return

  try {
    job.status = 'processing'
    
    // Simulate video rendering progress
    for (let progress = 0; progress <= 100; progress += 10) {
      job.progress = progress
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Mock video URL - in production this would be the actual rendered video
    job.videoUrl = `/videos/rendered/${jobId}.mp4`
    job.status = 'completed'
    job.progress = 100

  } catch (error) {
    console.error('Render processing error:', error)
    job.status = 'error'
    job.error = 'Erro durante a renderização'
  }
}
