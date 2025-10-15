/**
 * Analytics API - Endpoint para Métricas
 * 
 * GET /api/analytics - Retorna todas as métricas do dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getOverallMetrics,
  getDailyStats,
  getProjectStats,
  getRenderStats,
  getTTSStats,
  getEventTypeBreakdown,
  getTrends,
} from '@/lib/analytics/queries';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Autenticação
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Parâmetros de query
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Date range
    const dateRange = startDateParam && endDateParam
      ? {
          startDate: new Date(startDateParam),
          endDate: new Date(endDateParam),
        }
      : {
          startDate: subDays(new Date(), days),
          endDate: new Date(),
        };

    // Buscar todos os dados em paralelo
    const [
      metrics,
      dailyStats,
      projectStats,
      renderStats,
      ttsStats,
      eventBreakdown,
      trends,
    ] = await Promise.all([
      getOverallMetrics(session.user.id, dateRange),
      getDailyStats(session.user.id, days),
      getProjectStats(session.user.id, 10),
      getRenderStats(session.user.id, dateRange),
      getTTSStats(session.user.id, dateRange),
      getEventTypeBreakdown(session.user.id, dateRange),
      getTrends(session.user.id, 7),
    ]);

    // Registrar evento de visualização do dashboard
    await supabase.from('analytics_events').insert({
      user_id: session.user.id,
      event_type: 'view_dashboard',
      metadata: { days, dateRange },
    });

    return NextResponse.json({
      metrics,
      dailyStats,
      projectStats,
      renderStats,
      ttsStats,
      eventBreakdown,
      trends,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}
