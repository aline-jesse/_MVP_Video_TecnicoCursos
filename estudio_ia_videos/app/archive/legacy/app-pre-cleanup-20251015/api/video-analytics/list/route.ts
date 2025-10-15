
/**
 * ✅ API para Listar Vídeos com Métricas - CONECTADO AO DB REAL
 * Sprint 43 - P1 CORRIGIDO
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Filtro opcional por organização
    let orgFilter = {};
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, currentOrgId: true }
      });
      
      if (user?.currentOrgId) {
        orgFilter = { organizationId: user.currentOrgId };
      }
    }

    // ✅ BUSCAR DADOS REAIS DO BANCO
    const projects = await prisma.project.findMany({
      where: {
        ...orgFilter,
        status: 'COMPLETED',
        videoUrl: { not: null }
      },
      orderBy: {
        views: 'desc'
      },
      take: 50,
      select: {
        id: true,
        name: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        views: true,
        downloads: true,
        createdAt: true,
        updatedAt: true,
        analytics: {
          select: {
            eventType: true,
            eventData: true,
            timestamp: true
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 100
        }
      }
    });

    // Processar métricas para cada vídeo
    const videos = projects.map((project: any) => {
      const analytics = project.analytics || [];
      
      // Calcular sentiment baseado em eventos
      const positiveEvents = analytics.filter((a: any) => 
        a.eventType === 'like' || 
        a.eventType === 'share' ||
        a.eventType === 'complete'
      ).length;
      
      const negativeEvents = analytics.filter((a: any) =>
        a.eventType === 'dislike' ||
        a.eventType === 'skip' ||
        a.eventType === 'error'
      ).length;
      
      const totalEvents = positiveEvents + negativeEvents;
      const sentiment = totalEvents > 0 
        ? parseFloat((positiveEvents / totalEvents).toFixed(2))
        : 0.5; // Neutro por padrão

      // Calcular trend (últimos 7 dias vs 7 dias anteriores)
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const recentViews = analytics.filter((a: any) => 
        a.eventType === 'view' && 
        new Date(a.timestamp) >= last7Days
      ).length;

      const previousViews = analytics.filter((a: any) =>
        a.eventType === 'view' &&
        new Date(a.timestamp) >= previous7Days &&
        new Date(a.timestamp) < last7Days
      ).length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentViews > previousViews * 1.1) {
        trend = 'up';
      } else if (recentViews < previousViews * 0.9) {
        trend = 'down';
      }

      return {
        id: project.id,
        title: project.name,
        videoUrl: project.videoUrl,
        thumbnailUrl: project.thumbnailUrl,
        views: project.views,
        downloads: project.downloads,
        sentiment,
        trend,
        duration: project.duration,
        createdAt: project.createdAt.toISOString().split('T')[0],
        updatedAt: project.updatedAt.toISOString(),
        analytics: {
          total_events: analytics.length,
          positive_events: positiveEvents,
          negative_events: negativeEvents,
          recent_views: recentViews,
          previous_views: previousViews
        }
      };
    });

    return NextResponse.json({
      success: true,
      videos,
      total: videos.length,
      source: 'DATABASE_REAL', // ✅ Marcador de dados reais
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao listar vídeos:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
