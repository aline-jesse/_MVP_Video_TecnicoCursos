
/**
 * API: Get Project by ID
 * GET /api/projects/[projectId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma as db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const projectId = params.id;

    // Get project with slides
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: user.id, // Ensure user owns the project
      },
      include: {
        slides: {
          orderBy: { slideNumber: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type,
        status: project.status,
        totalSlides: project.totalSlides,
        originalFileName: project.originalFileName,
        pptxUrl: project.pptxUrl,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      slides: project.slides.map((slide: any) => ({
        id: slide.id,
        slideNumber: slide.slideNumber,
        title: slide.title,
        content: slide.content,
        duration: slide.duration,
        transition: slide.transition,
        backgroundType: slide.backgroundType,
        backgroundColor: slide.backgroundColor,
        backgroundImage: slide.backgroundImage,
        audioText: slide.audioText,
        elements: slide.elements,
      })),
    });

  } catch (error) {
    console.error('[Get Project] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to load project',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const projectId = params.id;

    // Delete project (cascade will delete slides)
    await db.project.delete({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });

  } catch (error) {
    console.error('[Delete Project] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to delete project',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
