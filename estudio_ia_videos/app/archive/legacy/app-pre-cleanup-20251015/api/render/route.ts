/**
 * 🎬 Render Queue API
 * Endpoints para controle da fila de renderização
 */

import { NextRequest, NextResponse } from 'next/server';
import { RenderQueue } from '@/lib/queue/RenderQueue';
import { RenderMonitor } from '@/lib/queue/RenderMonitor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Força dynamic para evitar cache
export const dynamic = 'force-dynamic';

/**
 * Adiciona um novo job à fila
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { projectId, sourceFile, outputFormat, quality, settings } = body;

    if (!projectId || !sourceFile) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Verifica se o projeto existe e pertence ao usuário
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    const queue = RenderQueue.getInstance();
    const jobId = await queue.addJob({
      userId: session.user.id,
      projectId,
      sourceFile,
      outputFormat: outputFormat || 'mp4',
      quality: quality || 'hd',
      settings: settings || {}
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error('❌ Erro ao adicionar job:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Obtém status de um job específico
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      // Lista todos os jobs do usuário
      const jobs = await prisma.renderJob.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ jobs });
    }

    // Verifica se o job pertence ao usuário
    const job = await prisma.renderJob.findFirst({
      where: {
        id: jobId,
        userId: session.user.id
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    const monitor = RenderMonitor.getInstance();
    const progress = await monitor.getJobProgress(jobId);

    return NextResponse.json({ job: progress });
  } catch (error) {
    console.error('❌ Erro ao obter status do job:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Cancela um job em execução
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'ID do job não fornecido' },
        { status: 400 }
      );
    }

    // Verifica se o job pertence ao usuário
    const job = await prisma.renderJob.findFirst({
      where: {
        id: jobId,
        userId: session.user.id
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    const queue = RenderQueue.getInstance();
    const cancelled = await queue.cancelJob(jobId);

    if (!cancelled) {
      return NextResponse.json(
        { error: 'Não foi possível cancelar o job' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao cancelar job:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Pausa/retoma a fila de renderização
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, jobId } = body;

    if (!action || !['pause', 'resume'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      );
    }

    if (!jobId) {
      return NextResponse.json(
        { error: 'ID do job não fornecido' },
        { status: 400 }
      );
    }

    // Verifica se o job pertence ao usuário
    const job = await prisma.renderJob.findFirst({
      where: {
        id: jobId,
        userId: session.user.id
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    // Atualiza status do job
    await prisma.renderJob.update({
      where: { id: jobId },
      data: {
        status: action === 'pause' ? 'paused' : 'pending'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao atualizar status do job:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}