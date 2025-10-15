
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';

/**
 * ✅ API DE VERSÕES REAL - Sprint 43
 * Gerenciamento de versões de projetos com persistência DB
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'ProjectId requerido' }, { status: 400 });
    }

    // Buscar versões do projeto
    const versions = await prisma.projectVersion.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      versions: versions.map((version: any) => ({
        id: version.id,
        name: version.name,
        description: version.description,
        versionNumber: version.versionNumber,
        author: {
          id: version.user.id,
          name: version.user.name || 'Usuário',
          email: version.user.email,
          avatar: version.user.image || '/avatars/default.jpg'
        },
        timestamp: version.createdAt.toISOString(),
        isCurrent: version.isCurrent,
        isActive: version.isActive,
        fileSize: version.fileSize ? Number(version.fileSize) : null,
        projectData: version.projectData,
        canvasData: version.canvasData,
        settings: version.settings
      })),
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar versões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar versões', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, name, description, projectData, canvasData, settings } = body;

    if (!projectId || !name) {
      return NextResponse.json({ error: 'ProjectId e name são obrigatórios' }, { status: 400 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    // Obter último versionNumber
    const lastVersion = await prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: 'desc' }
    });

    const versionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Desmarcar versões anteriores como current
    await prisma.projectVersion.updateMany({
      where: { projectId, isCurrent: true },
      data: { isCurrent: false }
    });

    // Criar nova versão
    const version = await prisma.projectVersion.create({
      data: {
        projectId,
        userId: user.id,
        name,
        description: description || null,
        versionNumber,
        projectData: projectData || {},
        canvasData: canvasData || null,
        settings: settings || null,
        isCurrent: true,
        isActive: true,
        fileSize: BigInt(JSON.stringify(projectData || {}).length)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      version: {
        id: version.id,
        name: version.name,
        description: version.description,
        versionNumber: version.versionNumber,
        author: {
          id: version.user.id,
          name: version.user.name || 'Usuário',
          email: version.user.email,
          avatar: version.user.image || '/avatars/default.jpg'
        },
        timestamp: version.createdAt.toISOString(),
        isCurrent: version.isCurrent,
        isActive: version.isActive,
        fileSize: Number(version.fileSize)
      },
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Erro ao criar versão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar versão', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { versionId, action } = body;

    if (!versionId || !action) {
      return NextResponse.json({ error: 'versionId e action são obrigatórios' }, { status: 400 });
    }

    if (action === 'restore') {
      // Buscar versão
      const version = await prisma.projectVersion.findUnique({
        where: { id: versionId }
      });

      if (!version) {
        return NextResponse.json({ error: 'Versão não encontrada' }, { status: 404 });
      }

      // Desmarcar versões anteriores como current
      await prisma.projectVersion.updateMany({
        where: { projectId: version.projectId, isCurrent: true },
        data: { isCurrent: false }
      });

      // Marcar esta versão como current
      const updatedVersion = await prisma.projectVersion.update({
        where: { id: versionId },
        data: { isCurrent: true }
      });

      return NextResponse.json({
        success: true,
        message: 'Versão restaurada com sucesso',
        version: { id: updatedVersion.id, isCurrent: true }
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });

  } catch (error) {
    console.error('❌ Erro ao atualizar versão:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar versão', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
