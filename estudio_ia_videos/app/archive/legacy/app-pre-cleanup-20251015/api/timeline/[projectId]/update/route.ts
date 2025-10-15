
/**
 * 🎬 Timeline API - UPDATE Timeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { projectId } = params;
    const timeline = await req.json();
    
    // Verificar se o projeto pertence ao usuário
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Atualizar timeline
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        timeline: {
          ...timeline,
          updatedAt: new Date(),
        },
      },
      select: {
        timeline: true,
      },
    });
    
    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        userId: session.user.id,
        category: 'timeline',
        action: 'update',
        label: projectId,
        metadata: {
          projectId,
          tracksCount: timeline.tracks?.length || 0,
          duration: timeline.duration || 0,
        },
      },
    });
    
    return NextResponse.json(updated.timeline);
  } catch (error) {
    console.error('Error updating timeline:', error);
    return NextResponse.json(
      { error: 'Failed to update timeline' },
      { status: 500 }
    );
  }
}
