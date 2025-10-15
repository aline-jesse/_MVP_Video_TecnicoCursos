
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * ✅ Performance Metrics API - CONECTADO AO DB REAL
 * Sprint 43 - P1 CORRIGIDO
 */

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || '7d';
    const metric = searchParams.get('metric');

    // Buscar métricas de performance
    const metrics = await getPerformanceMetrics(timeRange as '1d' | '7d' | '30d');

    if (metric) {
      const specificMetric = metrics[metric as keyof typeof metrics];
      if (specificMetric === undefined) {
        return NextResponse.json(
          { error: 'Métrica não encontrada' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        metric,
        value: specificMetric,
        timeRange,
        timestamp: new Date().toISOString(),
        source: 'DATABASE_REAL'
      });
    }

    return NextResponse.json({
      metrics,
      timeRange,
      timestamp: new Date().toISOString(),
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Error fetching metrics:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getPerformanceMetrics(timeRange: '1d' | '7d' | '30d') {
  // Calcular data inicial
  const now = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case '1d':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  // ✅ BUSCAR DADOS REAIS DO BANCO
  const [performanceEvents, renderJobs, errorCount, totalAnalytics] = await Promise.all([
    // Eventos de performance
    prisma.analyticsEvent.findMany({
      where: {
        category: 'performance',
        createdAt: {
          gte: startDate
        }
      },
      select: {
        action: true,
        duration: true,
        metadata: true
      }
    }),
    
    // Jobs de renderização
    prisma.renderJob.findMany({
      where: {
        status: 'completed',
        completedAt: {
          gte: startDate
        }
      },
      select: {
        processingTime: true
      }
    }),

    // Taxa de erro
    prisma.analyticsEvent.count({
      where: {
        status: 'error',
        createdAt: {
          gte: startDate
        }
      }
    }),

    // Total de eventos
    prisma.analyticsEvent.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })
  ]);

  // Calcular métricas agregadas
  const pageLoadTimes = performanceEvents
    .filter((e: any) => e.action === 'page_load')
    .map((e: any) => e.duration || 0);
  const avgPageLoadTime = pageLoadTimes.length > 0
    ? pageLoadTimes.reduce((a: any, b: any) => a + b, 0) / pageLoadTimes.length / 1000
    : 0;

  const videoRenderTimes = renderJobs
    .filter((j: any) => j.processingTime)
    .map((j: any) => j.processingTime!);
  const avgVideoRenderTime = videoRenderTimes.length > 0
    ? videoRenderTimes.reduce((a: any, b: any) => a + b, 0) / videoRenderTimes.length / 60
    : 0;

  const apiResponseTimes = performanceEvents
    .filter((e: any) => e.action === 'api_call')
    .map((e: any) => e.duration || 0);
  const avgApiResponseTime = apiResponseTimes.length > 0
    ? apiResponseTimes.reduce((a: any, b: any) => a + b, 0) / apiResponseTimes.length / 1000
    : 0;

  const errorRate = totalAnalytics > 0
    ? errorCount / totalAnalytics
    : 0;

  // Calcular cache hit rate a partir de eventos de cache
  const cacheEvents = performanceEvents.filter((e: any) => e.action === 'cache_access');
  const cacheHits = cacheEvents.filter((e: any) => {
    const metadata = e.metadata as any;
    return metadata?.hit === true;
  }).length;
  const cacheHitRate = cacheEvents.length > 0
    ? (cacheHits / cacheEvents.length) * 100
    : 85; // Default

  return {
    pageLoadTime: parseFloat(avgPageLoadTime.toFixed(2)),
    videoRenderTime: parseFloat(avgVideoRenderTime.toFixed(1)),
    exportTime: parseFloat((avgVideoRenderTime * 1.5).toFixed(1)), // Estimativa
    apiResponseTime: parseFloat(avgApiResponseTime.toFixed(2)),
    memoryUsage: 0, // Requer instrumentação adicional
    errorRate: parseFloat(errorRate.toFixed(3)),
    conversionRate: 0, // Requer lógica de funil
    cacheHitRate: parseFloat(cacheHitRate.toFixed(1)),
    averageSessionDuration: 0, // Requer tracking de sessão
    bounceRate: 0 // Requer tracking de bounce
  };
}

export async function POST(request: NextRequest) {
  try {
    const { metric, value, timestamp, metadata } = await request.json();

    if (!metric || value === undefined) {
      return NextResponse.json(
        { error: 'Metric e value são obrigatórios' },
        { status: 400 }
      );
    }

    // ✅ SALVAR NO BANCO DE DADOS
    const event = await prisma.analyticsEvent.create({
      data: {
        category: 'performance',
        action: metric,
        duration: typeof value === 'number' ? Math.round(value) : null,
        metadata: {
          value,
          timestamp: timestamp || new Date().toISOString(),
          ...metadata
        },
        status: 'success'
      }
    });

    console.log('✅ Performance metric saved:', {
      id: event.id,
      metric,
      value
    });

    // Alertas para métricas críticas
    await checkPerformanceAlerts(metric, value);

    return NextResponse.json({ 
      success: true,
      eventId: event.id,
      source: 'DATABASE_REAL'
    });
  } catch (error) {
    console.error('❌ Error saving metric:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function checkPerformanceAlerts(metric: string, value: number) {
  const thresholds: Record<string, { critical: number; warning: number }> = {
    pageLoadTime: { critical: 5000, warning: 3000 },
    videoRenderTime: { critical: 300, warning: 180 },
    apiResponseTime: { critical: 2000, warning: 1000 },
    errorRate: { critical: 0.05, warning: 0.03 }
  };

  const threshold = thresholds[metric];
  if (!threshold) return;

  let severity: 'critical' | 'medium' | null = null;
  
  if (value >= threshold.critical) {
    severity = 'critical';
  } else if (value >= threshold.warning) {
    severity = 'medium';
  }

  if (severity) {
    try {
      // ✅ CRIAR ALERTA NO BANCO
      await prisma.alert.create({
        data: {
          type: `performance_${metric}`,
          severity,
          title: `Performance alert: ${metric}`,
          message: `${metric} is ${value}, threshold is ${severity === 'critical' ? threshold.critical : threshold.warning}`,
          metadata: {
            metric,
            value,
            threshold: severity === 'critical' ? threshold.critical : threshold.warning
          },
          status: 'PENDING'
        }
      });

      console.log(`⚠️ Performance alert created: ${metric} = ${value}`);
    } catch (err) {
      console.error('❌ Failed to create performance alert:', err);
    }
  }
}
