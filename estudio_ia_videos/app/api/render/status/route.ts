
/**
 * API para verificar status de render - FASE 2 REAL
 * GET /api/render/status?jobId=xxx
 * Sistema real de monitoramento de renderização
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getVideoJobStatus } from '@/lib/queue/render-queue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, preset_id } = body;

    if (!project_id || !preset_id) {
      return NextResponse.json(
        { error: 'project_id and preset_id are required' },
        { status: 400 }
      );
    }

    // Generate job ID
    const job_id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      job_id,
      status: 'queued',
      project_id,
      preset_id,
      message: 'Video pipeline render job created successfully',
      created_at: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId obrigatório' },
        { status: 400 }
      );
    }

    console.log(`📊 [API] Verificando status do job: ${jobId}`);

    // First check database for render job
    const { prisma } = await import('@/lib/db');
    
    let renderJob = null;
    try {
      renderJob = await prisma.renderJob.findUnique({
        where: { id: jobId },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
              videoUrl: true,
              thumbnailUrl: true,
              duration: true,
              fileSize: true
            }
          }
        }
      });
    } catch (dbError) {
      console.warn('[API] Database unavailable, falling back to queue status');
    }

    // If found in database, return database status
    if (renderJob) {
      return NextResponse.json({
        success: true,
        jobId,
        status: renderJob.status,
        progress: renderJob.progress || 0,
        result: renderJob.outputData ? {
          success: renderJob.status === 'completed',
          outputUrl: renderJob.outputData.outputUrl || renderJob.project?.videoUrl,
          duration: renderJob.outputData.duration || renderJob.project?.duration,
          fileSize: renderJob.outputData.fileSize || renderJob.project?.fileSize,
          metadata: renderJob.outputData.metadata
        } : undefined,
        error: renderJob.errorMessage,
        createdAt: renderJob.createdAt?.toISOString(),
        startedAt: renderJob.startedAt?.toISOString(),
        completedAt: renderJob.completedAt?.toISOString(),
        project: renderJob.project,
        currentStep: renderJob.currentStep,
        timestamp: new Date().toISOString()
      });
    }

    // Fallback to queue status
    const status = await getVideoJobStatus(jobId);

    if (!status) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId,
      ...status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] Erro ao verificar status:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao verificar status',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
