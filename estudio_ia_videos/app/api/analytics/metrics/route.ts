
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';

/**
 * GET /api/analytics/metrics
 * Retorna métricas agregadas para dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30d'; // 7d, 30d, 90d

    // Calcular data inicial baseado no período
    const now = new Date();
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Queries paralelas para melhor performance
    const [
      totalUploads,
      totalRenders,
      totalDownloads,
      renderJobs,
      recentProjects,
      eventsByDay
    ] = await Promise.all([
      // Total de uploads
      prisma.analyticsEvent.count({
        where: {
          userId,
          category: 'pptx',
          action: 'upload',
          createdAt: { gte: startDate }
        }
      }),

      // Total de renders completos
      prisma.analyticsEvent.count({
        where: {
          userId,
          category: 'render',
          action: 'complete',
          createdAt: { gte: startDate }
        }
      }),

      // Total de downloads
      prisma.analyticsEvent.count({
        where: {
          userId,
          category: 'video',
          action: 'download',
          createdAt: { gte: startDate }
        }
      }),

      // Status dos render jobs
      prisma.renderJob.groupBy({
        by: ['status'],
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        _count: { id: true }
      }),

      // Projetos recentes
      prisma.project.findMany({
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          videoUrl: true
        }
      }),

      // Eventos por dia (para gráfico)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          category,
          COUNT(*) as count
        FROM "AnalyticsEvent"
        WHERE user_id = ${userId}
          AND created_at >= ${startDate}
        GROUP BY DATE(created_at), category
        ORDER BY date DESC
      `
    ]);

    // Calcular taxa de conversão
    const conversionRate = totalUploads > 0 
      ? ((totalRenders / totalUploads) * 100).toFixed(1)
      : '0';

    // Calcular tempo médio de render
    const avgRenderTime = await prisma.analyticsEvent.aggregate({
      where: {
        userId,
        category: 'render',
        action: 'complete',
        duration: { not: null },
        createdAt: { gte: startDate }
      },
      _avg: { duration: true }
    });

    return NextResponse.json({
      period,
      metrics: {
        totalUploads,
        totalRenders,
        totalDownloads,
        conversionRate: parseFloat(conversionRate),
        avgRenderTime: avgRenderTime._avg.duration 
          ? Math.round(avgRenderTime._avg.duration / 1000) // ms para segundos
          : null
      },
      renderJobs: renderJobs.map((item: any) => ({
        status: item.status,
        count: item._count.id
      })),
      recentProjects,
      eventsByDay
    });

  } catch (error: any) {
    console.error('[Analytics Metrics] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
