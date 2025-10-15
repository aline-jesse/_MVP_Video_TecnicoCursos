
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '../../../lib/auth/auth-config'
import { prisma } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    // Permitir busca sem autenticação para ambiente de desenvolvimento
    const isDev = process.env.NODE_ENV === 'development'
    
    if (!session && !isDev) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar projetos
    const projects = await prisma.project.findMany({
      where: {
        ...(session?.user?.email && { userId: session.user.email }),
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnailUrl: true,
        updatedAt: true,
        status: true
      }
    })

    // Buscar templates NR (se houver)
    const templates = await prisma.nRTemplate?.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true
      }
    }).catch(() => [])

    return NextResponse.json({
      projects,
      templates: templates || [],
      query,
      total: projects.length + (templates?.length || 0)
    })
  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar busca', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
