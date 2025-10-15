/**
 * 🔌 API: System Metrics
 * 
 * Endpoint para obter métricas do sistema
 * 
 * @route GET /api/analytics/system
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analytics } from '@/lib/analytics-standalone';

/**
 * GET /api/analytics/system
 * 
 * Obtém métricas do sistema (apenas para admins)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se usuário é admin
    // TODO: Implementar verificação de role
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Acesso negado. Apenas administradores.' },
    //     { status: 403 }
    //   );
    // }

    const metrics = await analytics.getSystemMetrics();

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('❌ Erro ao obter métricas do sistema:', error);
    return NextResponse.json(
      { error: 'Erro ao obter métricas do sistema' },
      { status: 500 }
    );
  }
}
