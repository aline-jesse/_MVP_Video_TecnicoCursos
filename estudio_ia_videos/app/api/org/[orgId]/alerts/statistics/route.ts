
/**
 * 📊 API: Alert Statistics
 * GET /api/org/{orgId}/alerts/statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getOrgContext } from '@/lib/multi-tenancy/org-context';
import { alertManager } from '@/lib/alerts/alert-manager';

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const orgContext = await getOrgContext(session.user.id, params.orgId);
    if (!orgContext) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: startDate, endDate' },
        { status: 400 }
      );
    }

    const statistics = await alertManager.getAlertStatistics(
      params.orgId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({ statistics });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de alertas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}

