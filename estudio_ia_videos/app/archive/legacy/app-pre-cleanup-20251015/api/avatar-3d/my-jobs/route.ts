
/**
 * API: Meus Jobs de Avatar 3D
 * GET /api/avatar-3d/my-jobs
 * 
 * Retorna todos os jobs de avatar do usuário atual
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getAvatarEngine } from '@/lib/vidnoz-avatar-engine-real';

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Buscar jobs do usuário
    const engine = getAvatarEngine();
    const jobs = await engine.getUserJobs(session.user.email);

    // 3. Retornar lista
    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
        id: job.id,
        avatarId: job.avatarId,
        status: job.status,
        progress: job.progress,
        outputUrl: job.outputUrl,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      })),
    });

  } catch (error: any) {
    console.error('[Avatar API] Error fetching user jobs:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao buscar jobs',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
