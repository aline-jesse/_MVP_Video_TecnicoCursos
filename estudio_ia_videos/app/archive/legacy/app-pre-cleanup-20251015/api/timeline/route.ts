
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * ✅ API de Timeline - CONECTADO AO DB REAL
 * Sprint 43 - P1 CORRIGIDO
 * 
 * Endpoints:
 * POST /api/timeline - Criar/atualizar timeline
 * GET /api/timeline?projectId={id} - Buscar timeline por projectId
 */

// Schemas de validação
const TimelineTrackSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  keyframes: z.array(z.any()),
  locked: z.boolean().optional(),
  visible: z.boolean().optional(),
});

const TimelineSettingsSchema = z.object({
  resolution: z.object({
    width: z.number(),
    height: z.number(),
  }),
  fps: z.number(),
  duration: z.number(),
});

const TimelineDataSchema = z.object({
  tracks: z.array(TimelineTrackSchema),
  settings: TimelineSettingsSchema,
  totalDuration: z.number(),
});

/**
 * GET /api/timeline?projectId={id}
 * Buscar timeline por projectId
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Verificar se o projeto existe e pertence ao usuário
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

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          { organizationId: user.currentOrgId || undefined }
        ]
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Buscar timeline
    const timeline = await prisma.timeline.findUnique({
      where: { projectId }
    });

    if (!timeline) {
      // Retornar timeline vazia se não existir
      return NextResponse.json({
        success: true,
        timeline: null,
        message: 'No timeline found for this project'
      });
    }

    return NextResponse.json({
      success: true,
      timeline: {
        id: timeline.id,
        projectId: timeline.projectId,
        tracks: timeline.tracks,
        settings: timeline.settings,
        totalDuration: timeline.totalDuration,
        version: timeline.version,
        createdAt: timeline.createdAt,
        updatedAt: timeline.updatedAt
      },
      source: 'DATABASE_REAL'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar timeline:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch timeline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/timeline
 * Criar ou atualizar timeline
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, tracks, settings, totalDuration } = body;

    // Validar dados
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Validar estrutura da timeline
    try {
      TimelineDataSchema.parse({ tracks, settings, totalDuration });
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid timeline data',
          details: validationError instanceof Error ? validationError.message : 'Validation failed'
        },
        { status: 400 }
      );
    }

    // Verificar se o projeto existe e pertence ao usuário
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

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          { organizationId: user.currentOrgId || undefined }
        ]
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Criar ou atualizar timeline
    const existingTimeline = await prisma.timeline.findUnique({
      where: { projectId }
    });

    let timeline;
    if (existingTimeline) {
      // Atualizar timeline existente
      timeline = await prisma.timeline.update({
        where: { projectId },
        data: {
          tracks,
          settings,
          totalDuration,
          version: existingTimeline.version + 1,
          updatedAt: new Date()
        }
      });
    } else {
      // Criar nova timeline
      timeline = await prisma.timeline.create({
        data: {
          projectId,
          tracks,
          settings,
          totalDuration,
          version: 1
        }
      });
    }

    return NextResponse.json({
      success: true,
      timeline: {
        id: timeline.id,
        projectId: timeline.projectId,
        tracks: timeline.tracks,
        settings: timeline.settings,
        totalDuration: timeline.totalDuration,
        version: timeline.version,
        createdAt: timeline.createdAt,
        updatedAt: timeline.updatedAt
      },
      action: existingTimeline ? 'updated' : 'created',
      source: 'DATABASE_REAL'
    });
  } catch (error) {
    console.error('❌ Erro ao salvar timeline:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save timeline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/timeline?projectId={id}
 * Deletar timeline
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Verificar se o projeto existe e pertence ao usuário
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

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          { organizationId: user.currentOrgId || undefined }
        ]
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Deletar timeline
    await prisma.timeline.delete({
      where: { projectId }
    });

    return NextResponse.json({
      success: true,
      message: 'Timeline deleted successfully',
      source: 'DATABASE_REAL'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar timeline:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete timeline',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
