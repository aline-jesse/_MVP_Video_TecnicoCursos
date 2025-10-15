import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: {
    projectId: string
    slideId: string
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const projectId = context.params?.projectId
  const slideId = context.params?.slideId

  if (!projectId || !slideId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Project ID and Slide ID are required' }
      },
      { status: 400 }
    )
  }

  let body: {
    duration?: number | null
    transition?: string | null
    background?: { type?: string | null; color?: string | null; image?: string | null }
    notes?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_BODY', message: 'Invalid JSON body' } },
      { status: 400 }
    )
  }

  try {
    const slide = await prisma.slide.findFirst({
      where: {
        id: slideId,
        projectId
      }
    })

    if (!slide) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'SLIDE_NOT_FOUND', message: 'Slide not found for this project' }
        },
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = {}

    if (typeof body.duration === 'number' && Number.isFinite(body.duration)) {
      updates.duration = Math.max(0.1, body.duration)
    }

    if (typeof body.transition === 'string') {
      updates.transition = body.transition
    }

    if (body.notes !== undefined) {
      updates.slideNotes = body.notes ?? null
    }

    if (body.background) {
      updates.backgroundType =
        typeof body.background.type === 'string' ? body.background.type : slide.backgroundType
      updates.backgroundColor =
        body.background.color !== undefined ? body.background.color : slide.backgroundColor
      updates.backgroundImage =
        body.background.image !== undefined ? body.background.image : slide.backgroundImage
    }

    const updatedSlide = await prisma.slide.update({
      where: { id: slide.id },
      data: updates
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedSlide.id,
        duration: updatedSlide.duration,
        transition: updatedSlide.transition,
        notes: updatedSlide.slideNotes,
        background: {
          type: updatedSlide.backgroundType,
          color: updatedSlide.backgroundColor,
          image: updatedSlide.backgroundImage
        }
      }
    })
  } catch (error) {
    console.error('Error updating slide:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SLIDE_UPDATE_FAILED', message: 'Failed to update slide' }
      },
      { status: 500 }
    )
  }
}
