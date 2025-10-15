
/**
 * ✅ API: Resolve Comment
 * Resolver/reabrir comentário
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
    const { resolve, resolutionNote } = body;

    if (resolve) {
      await commentsService.resolveComment({
        commentId: params.commentId,
        userId: session.user.id,
        resolutionNote,
      });
    } else {
      await commentsService.reopenComment({
        commentId: params.commentId,
        userId: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao resolver/reabrir comentário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao resolver/reabrir comentário' },
      { status: 500 }
    );
  }
}
