
/**
 * 📊 SPRINT 39 - Workers Metrics API
 * API para receber e processar métricas dos workers
 */

import { NextRequest, NextResponse } from 'next/server';
import { autoScaler } from '@/lib/scaling/auto-scaler';

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json();

    // Atualizar auto-scaler com novas métricas
    await autoScaler.updateMetrics(metrics);

    return NextResponse.json({
      success: true,
      message: 'Métricas atualizadas',
    });
  } catch (error: any) {
    console.error('Erro ao processar métricas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
