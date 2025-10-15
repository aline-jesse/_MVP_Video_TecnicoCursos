
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';

/**
 * ✅ API DE COMENTÁRIOS REAL - Sprint 43
 * Gerenciamento de comentários em projetos com persistência DB
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

    // Buscar comentários do projeto
    const comments = await prisma.projectComment.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        replies: {
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      comments: comments.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        position: comment.position ? JSON.parse(comment.position) : null,
        author: {
          id: comment.user.id,
          name: comment.user.name || 'Usuário',
          email: comment.user.email,
          avatar: comment.user.image || '/avatars/default.jpg',
          role: 'member'
        },
        timestamp: comment.createdAt.toISOString(),
        status: comment.isResolved ? 'resolved' : 'pending',
        replies: comment.replies.map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          author: {
            id: reply.user.id,
            name: reply.user.name || 'Usuário',
            email: reply.user.email,
            avatar: reply.user.image || '/avatars/default.jpg'
          },
          timestamp: reply.createdAt.toISOString(),
          reactions: []
        })),
        reactions: [],
        mentions: [],
        isPrivate: false
      })),
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar comentários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comentários', details: error instanceof Error ? error.message : 'Unknown' },
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
    const { projectId, content, position, parentId } = body;

    if (!projectId || !content) {
      return NextResponse.json({ error: 'ProjectId e content são obrigatórios' }, { status: 400 });
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

    // Criar comentário
    const comment = await prisma.projectComment.create({
      data: {
        projectId,
        userId: user.id,
        content,
        position: position ? JSON.stringify(position) : null,
        parentId: parentId || null
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
      comment: {
        id: comment.id,
        content: comment.content,
        position: comment.position ? JSON.parse(comment.position) : null,
        author: {
          id: comment.user.id,
          name: comment.user.name || 'Usuário',
          email: comment.user.email,
          avatar: comment.user.image || '/avatars/default.jpg',
          role: 'member'
        },
        timestamp: comment.createdAt.toISOString(),
        status: 'pending',
        replies: [],
        reactions: [],
        mentions: [],
        isPrivate: false
      },
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Erro ao criar comentário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar comentário', details: error instanceof Error ? error.message : 'Unknown' },
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
    const { commentId, action, userId } = body;

    if (!commentId || !action) {
      return NextResponse.json({ error: 'commentId e action são obrigatórios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (action === 'resolve') {
      const comment = await prisma.projectComment.update({
        where: { id: commentId },
        data: {
          isResolved: true,
          resolvedBy: user.id,
          resolvedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Comentário marcado como resolvido',
        comment: { id: comment.id, status: 'resolved' }
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });

  } catch (error) {
    console.error('❌ Erro ao atualizar comentário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar comentário', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
