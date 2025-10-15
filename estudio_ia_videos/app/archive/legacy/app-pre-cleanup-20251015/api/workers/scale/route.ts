
/**
 * ⚙️ SPRINT 39 - Workers Scaling API
 * API para gerenciar auto-scaling de workers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { autoScaler } from '@/lib/scaling/auto-scaler';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Verificar autenticação (permitir todos usuários autenticados)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { count } = await request.json();

    if (typeof count !== 'number' || count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'Count inválido (1-20)' },
        { status: 400 }
      );
    }

    // Em produção, provisionar workers reais
    // Por exemplo: AWS ECS, Kubernetes, etc.
    console.log(`Scaling workers to ${count}`);

    return NextResponse.json({
      success: true,
      workers: count,
      message: `Workers escalados para ${count}`,
    });
  } catch (error: any) {
    console.error('Erro ao escalar workers:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const status = autoScaler.getStatus();

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error('Erro ao obter status dos workers:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
