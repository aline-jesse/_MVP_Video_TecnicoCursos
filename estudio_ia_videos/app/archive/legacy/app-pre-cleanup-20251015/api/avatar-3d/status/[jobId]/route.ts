
/**
 * API: Status de Job de Avatar 3D
 * GET /api/avatar-3d/status/[jobId]
 * 
 * Retorna o status atual de geração de um avatar
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getAvatarEngine } from '@/lib/vidnoz-avatar-engine-real';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Buscar job
    const engine = getAvatarEngine();
    const job = await engine.getJob(params.jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    // 3. Verificar autorização
    if (job.userId !== session.user.email) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // 4. Retornar status
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        outputUrl: job.outputUrl,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });

  } catch (error: any) {
    console.error('[Avatar API] Error fetching job status:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao buscar status',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
