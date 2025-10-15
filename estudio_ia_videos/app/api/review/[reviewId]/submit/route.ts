
/**
 * ✅ API: Submit Review
 * Submeter revisão (aprovar/rejeitar/solicitar mudanças)
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
    const { decision, feedback } = body;

    if (!decision || !['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(decision)) {
      return NextResponse.json(
        { error: 'decision inválido (APPROVED, REJECTED, CHANGES_REQUESTED)' },
        { status: 400 }
      );
    }

    await reviewWorkflowService.submitReview({
      reviewRequestId: params.reviewId,
      reviewerId: session.user.id,
      decision,
      feedback,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao submeter revisão:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao submeter revisão' },
      { status: 500 }
    );
  }
}
