
/**
 * 📋 API: Review Requests
 * Criar e listar solicitações de revisão
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { reviewWorkflowService } from '@/lib/collab/review-workflow';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, reviewerIds, message, dueDate } = body;

    if (!projectId || !reviewerIds || reviewerIds.length === 0) {
      return NextResponse.json(
        { error: 'projectId e reviewerIds são obrigatórios' },
        { status: 400 }
      );
    }

    const reviewRequest = await reviewWorkflowService.createReviewRequest({
      projectId,
      requesterId: session.user.id,
      reviewerIds,
      message,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return NextResponse.json({ reviewRequest }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erro ao criar solicitação de revisão:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar solicitação de revisão' },
      { status: 500 }
    );
  }
}
