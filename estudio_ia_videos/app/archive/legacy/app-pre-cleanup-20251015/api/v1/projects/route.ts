
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth/api-auth'
import { prisma } from '@/lib/database/prisma'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereCondition: any = {
      userId: session.user.id
    }

    if (status) {
      whereCondition.status = status
    }

    const projects = await prisma.project.findMany({
      where: whereCondition,
      include: {
        videoExports: {
          where: { status: 'completed' },
          orderBy: { createdAt: "desc" },
          take: 1
        },
        _count: {
          select: {
            videoExports: true
          }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset
    })

    const total = await prisma.project.count({
      where: whereCondition
    })

    return NextResponse.json({
      projects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, type = 'pptx' } = body

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        type,
        userId: session.user.id,
        status: "DRAFT"
      }
    })

    return NextResponse.json({ project }, { status: 201 })

  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
