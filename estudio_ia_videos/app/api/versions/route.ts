
/**
 * POST /api/versions
 * Cria uma nova versão do projeto
 * 
 * GET /api/versions?projectId=xxx
 * Lista versões de um projeto
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { projectId, name, description, projectData } = await req.json()

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'projectId e name são obrigatórios' },
        { status: 400 }
      )
    }

    // Busca projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    // Verifica permissão
    if (project.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Conta versões existentes para incrementar
    const versionCount = await prisma.projectVersion.count({
      where: { projectId }
    })

    // Cria nova versão
    const version = await prisma.projectVersion.create({
      data: {
        projectId,
        userId: (session.user as any).id,
        name,
        description,
        versionNumber: versionCount + 1,
        projectData: projectData || {}
      }
    })

    return NextResponse.json({ version })

  } catch (error) {
    console.error('[VERSIONS_POST_ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao criar versão' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId é obrigatório' },
        { status: 400 }
      )
    }

    // Busca versões
    const versions = await prisma.projectVersion.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { versionNumber: 'desc' }
    })

    return NextResponse.json({ versions })

  } catch (error) {
    console.error('[VERSIONS_GET_ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar versões' },
      { status: 500 }
    )
  }
}
