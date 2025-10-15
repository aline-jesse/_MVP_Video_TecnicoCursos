
/**
 * 🎬 Render Jobs API
 * Lista jobs de render do usuário
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
    
    // Buscar eventos de render
    const renderEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId: session.user.id,
        category: 'render',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    // Transformar eventos em jobs
    const jobs = renderEvents.map((event: any) => {
      const metadata = event.metadata as any;
      
      return {
        id: event.id,
        projectId: metadata?.projectId || event.label || 'unknown',
        status: event.action === 'start' ? 'processing' 
              : event.action === 'complete' ? 'completed'
              : event.action === 'error' ? 'failed'
              : 'pending',
        progress: metadata?.progress || (event.action === 'complete' ? 100 : 0),
        startedAt: event.action === 'start' ? event.createdAt.toISOString() : undefined,
        completedAt: event.action === 'complete' ? event.createdAt.toISOString() : undefined,
      };
    });
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching render jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch render jobs' },
      { status: 500 }
    );
  }
}
