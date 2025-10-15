
/**
 * 📊 Dashboard Stats API
 * Retorna estatísticas gerais do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Buscar estatísticas em paralelo
    const [
      uploads,
      renders,
      downloads,
      totalProjects,
      activeRenders,
      completedToday,
    ] = await Promise.all([
      // Total de uploads
      prisma.analyticsEvent.count({
        where: {
          userId,
          category: 'pptx',
          action: 'upload',
        },
      }),
      
      // Total de renders completos
      prisma.analyticsEvent.count({
        where: {
          userId,
          category: 'render',
          action: 'complete',
        },
      }),
      
      // Total de downloads
      prisma.analyticsEvent.count({
        where: {
          userId,
          category: 'video',
          action: 'download',
        },
      }),
      
      // Total de projetos
      prisma.project.count({
        where: { userId },
      }),
      
      // Renders ativos (projetos em processamento)
      prisma.project.count({
        where: {
          userId,
          status: 'PROCESSING',
        },
      }),
      
      // Renders completos hoje
      prisma.analyticsEvent.count({
        where: {
          userId,
          category: 'render',
          action: 'complete',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);
    
    const stats = {
      uploads,
      renders,
      downloads,
      totalProjects,
      activeRenders,
      completedToday,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
