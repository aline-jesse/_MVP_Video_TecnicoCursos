
/**
 * 🎬 Timeline API - GET Timeline by Project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { projectId } = params;
    
    // Buscar projeto com timeline
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      select: {
        id: true,
        timeline: true,
      },
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Se não houver timeline, criar uma vazia
    if (!project.timeline) {
      const defaultTimeline = {
        id: `timeline_${projectId}`,
        projectId,
        tracks: [],
        duration: 60,
        fps: 30,
        resolution: { width: 1920, height: 1080 },
        currentTime: 0,
        playing: false,
        loop: false,
        zoom: 1,
        scrollPosition: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await prisma.project.update({
        where: { id: projectId },
        data: { timeline: defaultTimeline as any },
      });
      
      return NextResponse.json(defaultTimeline);
    }
    
    return NextResponse.json(project.timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}
