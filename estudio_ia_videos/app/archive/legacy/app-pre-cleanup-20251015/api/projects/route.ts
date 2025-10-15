import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_LIMIT = 10

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 50) : DEFAULT_LIMIT

  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        slides: {
          select: {
            id: true,
            slideNumber: true,
            duration: true
          },
          orderBy: { slideNumber: 'asc' }
        }
      }
    })

    const data = projects.map(project => {
      const totalSlides = project.slides.length
      const totalDuration = project.slides.reduce((sum, slide) => {
        const duration = typeof slide.duration === 'number' ? slide.duration : 0
        return sum + duration
      }, 0)

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        fileName: project.originalFileName,
        totalSlides,
        totalDuration,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error listing projects:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROJECT_LIST_FAILED', message: 'Failed to list projects' }
      },
      { status: 500 }
    )
  }
}
