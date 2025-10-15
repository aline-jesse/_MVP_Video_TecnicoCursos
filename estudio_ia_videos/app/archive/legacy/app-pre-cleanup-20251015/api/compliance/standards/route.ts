
/**
 * API: Lista de Normas Regulamentadoras
 * GET /api/compliance/standards
 * 
 * Retorna lista de todas as NRs disponíveis
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getComplianceEngine } from '@/lib/nr-compliance-engine';

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Buscar normas
    const engine = getComplianceEngine();
    const standards = engine.listAvailableStandards();

    console.log(`[Compliance API] ${standards.length} standards found`);

    // 3. Retornar lista
    return NextResponse.json({
      success: true,
      standards,
    });

  } catch (error: any) {
    console.error('[Compliance API] Error listing standards:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao listar normas',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
