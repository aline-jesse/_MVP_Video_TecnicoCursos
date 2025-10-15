
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { addVideoRenderJob, VideoRenderJobData } from '@/lib/queue/setup'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { project_id, avatar_id = 'avatar-female-1', voice_id = 'br-female-1' } = body

    if (!project_id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
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

    // Get project with slides
    const project = await prisma.project.findUnique({
      where: { 
        id: project_id,
        userId: user.id // Ensure user owns the project
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Extract slides from JSON
    const slidesData = project.slidesData as any[]
    if (!slidesData || !Array.isArray(slidesData)) {
      return NextResponse.json(
        { error: 'Project has no valid slides' },
        { status: 400 }
      )
    }

    // Prepare job data
    const jobData: VideoRenderJobData = {
      projectId: project.id,
      userId: user.id,
      settings: {
        avatar_id,
        voice_id,
        resolution: '1080p',
        format: 'mp4'
      },
      slides: slidesData.map(slide => ({
        id: slide.id || `slide-${slide.order}`,
        title: slide.title || '',
        content: slide.content?.join('\n') || '',
        order: slide.order || 0
      }))
    }

    // Add job to queue
    const job = await addVideoRenderJob('video-render', jobData)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Failed to enqueue video render job' },
        { status: 500 }
      )
    }

    // Update project status
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: 'PROCESSING'
      }
    })

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: 'queued',
        project_id: project.id,
        estimated_duration: slidesData.length * 60 // Rough estimate: 60s per slide
      }
    })

  } catch (error) {
    console.error('Job creation error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create render job',
        details: 'Check project data and queue configuration'
      },
      { status: 500 }
    )
  }
}
