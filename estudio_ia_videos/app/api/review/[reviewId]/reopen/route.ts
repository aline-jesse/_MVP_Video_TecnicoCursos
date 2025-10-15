
/**
 * 🔓 API: Reopen Project
 * Reabrir projeto para edição
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
    const { projectId, reason } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId é obrigatório' }, { status: 400 });
    }

    await reviewWorkflowService.reopenForEditing({
      projectId,
      userId: session.user.id,
      reason,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao reabrir projeto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao reabrir projeto' },
      { status: 500 }
    );
  }
}
