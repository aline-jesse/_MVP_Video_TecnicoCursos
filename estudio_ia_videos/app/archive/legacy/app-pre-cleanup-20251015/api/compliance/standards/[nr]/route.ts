
/**
 * API: Detalhes de uma NR específica
 * GET /api/compliance/standards/[nr]
 * 
 * Retorna detalhes completos de uma norma regulamentadora
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getComplianceEngine } from '@/lib/nr-compliance-engine';

export async function GET(
  request: NextRequest,
  { params }: { params: { nr: string } }
) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Buscar norma
    const engine = getComplianceEngine();
    const standard = engine.getStandard(params.nr);

    if (!standard) {
      return NextResponse.json(
        { error: `Norma ${params.nr} não encontrada` },
        { status: 404 }
      );
    }

    // 3. Retornar detalhes
    return NextResponse.json({
      success: true,
      standard,
    });

  } catch (error: any) {
    console.error('[Compliance API] Error fetching standard:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao buscar norma',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
