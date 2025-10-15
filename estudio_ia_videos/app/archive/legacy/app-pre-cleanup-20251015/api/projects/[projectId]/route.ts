import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

type RouteContext = {
  params: {
    projectId: string
  }
}

function normalizeDate(value: unknown): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const projectId = context.params?.projectId

  if (!projectId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'MISSING_PROJECT_ID', message: 'Project ID is required' }
      },
      { status: 400 }
    )
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        slides: {
          orderBy: { slideNumber: 'asc' }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' }
        },
        { status: 404 }
      )
    }

    const orderedSlides = [...project.slides].sort(
      (a, b) => a.slideNumber - b.slideNumber
    )

    let cumulativeTime = 0

    const slides = orderedSlides.map(slide => {
      const durationSeconds = typeof slide.duration === 'number' ? slide.duration : 5
      const timelineEntry = {
        slideNumber: slide.slideNumber,
        startAt: cumulativeTime,
        duration: durationSeconds
      }
      cumulativeTime += durationSeconds

      return {
        id: slide.id,
        slideNumber: slide.slideNumber,
        title: slide.title,
        content: slide.content,
        notes: slide.slideNotes,
        text: slide.extractedText,
        duration: durationSeconds,
        background: {
          type: slide.backgroundType,
          color: slide.backgroundColor,
          image: slide.backgroundImage
        },
        metrics: slide.slideMetrics,
        images: slide.slideImages,
        elements: slide.elements,
        timeline: timelineEntry
      }
    })

    const timeline = slides.map(slide => slide.timeline)
    const processingLog = (project.processingLog as Record<string, unknown>) || {}

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        status: project.status,
        fileName: project.originalFileName,
        totalSlides: slides.length,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        metadata: project.pptxMetadata,
        stats: {
          totalDuration: cumulativeTime,
          imagesExtracted: project.imagesExtracted,
          autoNarration: project.autoNarration,
          processingCompletedAt: normalizeDate(processingLog.processingCompleted),
          processingStartedAt: normalizeDate(processingLog.processingStarted)
        },
        slides: slides.map(({ timeline: _timeline, ...rest }) => rest),
        timeline
      }
    })
  } catch (error) {
    console.error('Error fetching project details:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROJECT_FETCH_FAILED', message: 'Failed to fetch project details' }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const projectId = context.params?.projectId

  if (!projectId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'MISSING_PROJECT_ID', message: 'Project ID is required' }
      },
      { status: 400 }
    )
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        pptxUrl: true
      }
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' }
        },
        { status: 404 }
      )
    }

    await prisma.slide.deleteMany({ where: { projectId } })
    await prisma.project.delete({ where: { id: projectId } })

    if (project.pptxUrl) {
      const sanitizedPath = project.pptxUrl.replace(/^\/+/, '')
      const absolutePath = path.join(process.cwd(), 'public', sanitizedPath)

      await fs.unlink(absolutePath).catch(() => undefined)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROJECT_DELETE_FAILED', message: 'Failed to delete project' }
      },
      { status: 500 }
    )
  }
}
