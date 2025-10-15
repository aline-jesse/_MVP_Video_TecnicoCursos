
/**
 * 📊 API: Publish Project
 * Publicar projeto após aprovação
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { reviewWorkflowService } from '@/lib/collab/review-workflow';

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId é obrigatório' }, { status: 400 });
    }

    await reviewWorkflowService.publishProject({
      projectId,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao publicar projeto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao publicar projeto' },
      { status: 500 }
    );
  }
}
