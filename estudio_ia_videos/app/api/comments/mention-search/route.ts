
/**
 * 🔍 API: Mention Search
 * Buscar usuários para autocompletar menções
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
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId é obrigatório' }, { status: 400 });
    }

    const users = await commentsService.searchUsersForMention({
      projectId,
      query,
      limit,
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('❌ Erro ao buscar usuários para menção:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}
