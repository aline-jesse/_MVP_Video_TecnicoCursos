
/**
 * 📊 API: Comment Statistics
 * Estatísticas de comentários
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { commentsService } from '@/lib/collab/comments-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId é obrigatório' }, { status: 400 });
    }

    const stats = await commentsService.getCommentStats(projectId);

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas de comentários:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
