import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';

/**
 * ✅ API de Analytics Dashboard - CONECTADO AO DB REAL
 * Sprint 43 - P1 CORRIGIDO
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, currentOrgId: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Filtros por organização (se multi-tenancy estiver ativo)
    const orgFilter = user.currentOrgId ? { organizationId: user.currentOrgId } : {};

    // 1️⃣ OVERVIEW - Dados gerais
    const [
      totalProjects,
      completedProjects,
      totalVideoExports,
      successfulExports,
      failedRenders,
      totalRenderJobs
    ] = await Promise.all([
      prisma.project.count({ where: orgFilter }),
      prisma.project.count({ where: { ...orgFilter, status: 'COMPLETED' } }),
      prisma.videoExport.count({ where: { project: orgFilter } }),
      prisma.videoExport.count({ where: { project: orgFilter, status: 'completed' } }),
      prisma.renderJob.count({ where: { status: 'error' } }),
      prisma.renderJob.count()
    ]);

    // Calcular tempo total de renderização (em horas)
    const renderStats = await prisma.renderJob.aggregate({
      where: { status: 'completed' },
      _sum: { processingTime: true },
      _avg: { processingTime: true }
    });

    const totalRenderTimeHours = (renderStats._sum.processingTime || 0) / 3600;
    const avgRenderTimeMinutes = (renderStats._avg.processingTime || 0) / 60;

    // Calcular storage (em GB) - soma dos tamanhos de arquivos
    const storageStats = await prisma.videoExport.aggregate({
      where: { status: 'completed' },
      _sum: { fileSize: true }
    });
    const totalStorageGb = Number(storageStats._sum.fileSize || BigInt(0)) / (1024 ** 3);

    // 2️⃣ PERÍODO - Comparação mensal
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [videosThisMonth, videosLastMonth] = await Promise.all([
      prisma.videoExport.count({
        where: {
          project: orgFilter,
          status: 'completed',
          createdAt: { gte: startOfThisMonth }
        }
      }),
      prisma.videoExport.count({
        where: {
          project: orgFilter,
          status: 'completed',
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        }
      })
    ]);

    const growthPercentage = videosLastMonth > 0
      ? ((videosThisMonth - videosLastMonth) / videosLastMonth) * 100
      : videosThisMonth > 0 ? 100 : 0;

    // 3️⃣ TTS USAGE - Buscar de AIGeneration
    const ttsStats = await prisma.aIGeneration.groupBy({
      by: ['provider'],
      where: {
        type: 'text_to_speech',
        status: 'completed'
      },
      _count: { id: true },
      _sum: { duration: true }
    });

    const ttsUsage = {
      elevenlabs: {
        requests: ttsStats.find((s: any) => s.provider === 'elevenlabs')?._count.id || 0,
        minutes: Math.round((ttsStats.find((s: any) => s.provider === 'elevenlabs')?._sum.duration || 0) / 60)
      },
      azure: {
        requests: ttsStats.find((s: any) => s.provider === 'azure')?._count.id || 0,
        minutes: Math.round((ttsStats.find((s: any) => s.provider === 'azure')?._sum.duration || 0) / 60)
      },
      google: {
        requests: ttsStats.find((s: any) => s.provider === 'google')?._count.id || 0,
        minutes: Math.round((ttsStats.find((s: any) => s.provider === 'google')?._sum.duration || 0) / 60)
      }
    };

    // 4️⃣ TOP TEMPLATES - Buscar NRTemplates mais usados
    const topTemplates = await prisma.nRTemplate.findMany({
      orderBy: { usageCount: 'desc' },
      take: 5,
      select: {
        id: true,
        nr: true,
        title: true,
        usageCount: true
      }
    });

    // 5️⃣ RENDER STATS
    const successRate = totalRenderJobs > 0
      ? parseFloat(((successfulExports / totalRenderJobs) * 100).toFixed(1))
      : 100;

    const analytics = {
      overview: {
        total_projects: totalProjects,
        total_videos_rendered: successfulExports,
        total_render_time_hours: parseFloat(totalRenderTimeHours.toFixed(2)),
        total_storage_gb: parseFloat(totalStorageGb.toFixed(2))
      },
      period: {
        videos_this_month: videosThisMonth,
        videos_last_month: videosLastMonth,
        growth_percentage: parseFloat(growthPercentage.toFixed(1))
      },
      tts_usage: ttsUsage,
      top_templates: topTemplates.map((t: any) => ({
        id: t.id,
        name: t.title,
        usage_count: t.usageCount
      })),
      render_stats: {
        avg_render_time_minutes: parseFloat(avgRenderTimeMinutes.toFixed(1)),
        success_rate: successRate,
        failed_renders: failedRenders
      }
    };

    return NextResponse.json({
      success: true,
      analytics,
      generated_at: new Date().toISOString(),
      source: 'DATABASE_REAL' // ✅ Marcador de dados reais
    });
  } catch (error) {
    console.error('❌ Erro ao buscar analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
