
/**
 * 📊 API: Review Statistics
 * Estatísticas de revisões
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { reviewWorkflowService } from '@/lib/collab/review-workflow';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate e endDate são obrigatórios' },
        { status: 400 }
      );
    }

    const stats = await reviewWorkflowService.getReviewStats({
      organizationId: organizationId || undefined,
      userId: session.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas de revisão:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
