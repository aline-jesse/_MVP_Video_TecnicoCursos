
/**
 * 💬 API: Comment by ID
 * Operações em comentário específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { commentsService } from '@/lib/collab/comments-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await commentsService.deleteComment({
      commentId: params.commentId,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao deletar comentário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar comentário' },
      { status: 500 }
    );
  }
}
