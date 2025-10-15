

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
// import { renderQueueManager } from '../../../../lib/render-pipeline/render-queue-system'
// import { ffmpegProcessor } from '../../../../lib/render-pipeline/ffmpeg-processor'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { project_ids, batch_settings = {} } = body

    // Validate inputs
    if (!Array.isArray(project_ids) || project_ids.length === 0) {
      return NextResponse.json(
        { error: 'project_ids array is required' },
        { status: 400 }
      )
    }

    if (project_ids.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 projects per batch' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate all projects belong to user
    const projects = await prisma.project.findMany({
      where: {
        id: { in: project_ids },
        userId: user.id
      }
    })

    if (projects.length !== project_ids.length) {
      return NextResponse.json(
        { error: 'Some projects not found or not accessible' },
        { status: 404 }
      )
    }

    // Prepare batch jobs
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const jobs = []

    for (const project of projects) {
      const slidesData = project.slidesData as any[]
      
      if (!slidesData || !Array.isArray(slidesData)) {
        continue // Skip invalid projects
      }

      const jobData = {
        user_id: user.id,
        project_id: project.id,
        type: 'batch_composition' as const,
        priority: 'normal' as any,
        batch_id: batchId,
        scenes: slidesData.map((slide: any, index: number) => ({
          id: slide.id || `scene-${index}`,
          type: 'slide' as const,
          content: {
            title: slide.title || '',
            text: slide.content?.join('\n') || slide.content || ''
          },
          duration: slide.duration || 8,
          order: slide.order || index
        })),
        output: {
          resolution: batch_settings.resolution || '1080p',
          fps: batch_settings.fps || 30,
          format: batch_settings.format || 'mp4',
          quality: batch_settings.quality || 'standard',
          batch_watermark: {
            enabled: true,
            type: 'text',
            content: `Batch ${batchId}`,
            position: 'bottom-left'
          }
        },
        estimates: calculateBatchEstimates(slidesData, batch_settings)
      }

      const jobId = `batch-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      jobs.push({
        job_id: jobId,
        project_id: project.id,
        project_name: project.name,
        estimated_duration: Math.ceil(slidesData.length * 8)
      })
    }

    // Create batch record
    await prisma.renderBatch.create({
      data: {
        id: batchId,
        name: `Batch Render ${new Date().toLocaleString()}`,
        userId: user.id,
        projectIds: project_ids,
        batchSettings: batch_settings,
        status: 'processing'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        batch_id: batchId,
        jobs,
        total_projects: projects.length,
        estimated_total_time: jobs.reduce((sum, job) => sum + job.estimated_duration, 0),
        batch_settings
      }
    })

  } catch (error) {
    console.error('Batch render submission error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to submit batch render',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's batch render history
    const batches = await prisma.renderBatch.findMany({
      where: { 
        userId: user.id
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      success: true,
      data: {
        batches: batches.map((batch: any) => ({
          id: batch.id,
          total_jobs: batch.totalJobs,
          status: batch.status,
          created_at: batch.createdAt,
          completed_at: batch.completedAt,
          project_count: batch.projectIds.length,
          settings: batch.settings
        }))
      }
    })

  } catch (error) {
    console.error('Error getting batch history:', error)
    return NextResponse.json(
      { error: 'Failed to get batch history' },
      { status: 500 }
    )
  }
}

function calculateBatchEstimates(slides: any[], settings: any): {
  total_cost: number
  render_time: number
  file_size: number
} {
  const baseCostPerSlide = 0.12
  const baseTimePerSlide = 8
  
  const totalCost = slides.length * baseCostPerSlide
  const renderTime = slides.length * baseTimePerSlide
  const fileSize = slides.length * 2.5 // MB per slide
  
  return {
    total_cost: parseFloat(totalCost.toFixed(3)),
    render_time: Math.ceil(renderTime),
    file_size: Math.ceil(fileSize)
  }
}

