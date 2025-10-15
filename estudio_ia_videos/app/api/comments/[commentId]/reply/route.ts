
/**
 * 💬 API: Reply to Comment
 * Responder comentário
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { commentsService } from '@/lib/collab/comments-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { content, mentions } = body;

    if (!content) {
      return NextResponse.json({ error: 'content é obrigatório' }, { status: 400 });
    }

    const reply = await commentsService.replyToComment({
      parentCommentId: params.commentId,
      userId: session.user.id,
      content,
      mentions,
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erro ao responder comentário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao responder comentário' },
      { status: 500 }
    );
  }
}
