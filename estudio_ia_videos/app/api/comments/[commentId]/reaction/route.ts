
/**
 * 👍 API: Comment Reactions
 * Adicionar reações a comentários
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
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'emoji é obrigatório' }, { status: 400 });
    }

    await commentsService.addReaction({
      commentId: params.commentId,
      userId: session.user.id,
      emoji,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao adicionar reação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao adicionar reação' },
      { status: 500 }
    );
  }
}
