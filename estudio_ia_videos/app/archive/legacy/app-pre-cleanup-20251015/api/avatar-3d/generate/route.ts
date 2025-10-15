
/**
 * API: Geração de Avatar 3D REAL
 * POST /api/avatar-3d/generate
 * 
 * Gera vídeo real com avatar usando D-ID API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getAvatarEngine } from '@/lib/vidnoz-avatar-engine-real';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Parse do body
    const body = await request.json();
    const {
      avatarId,
      scriptText,
      voiceId = 'pt-BR-FranciscaNeural',
      voiceProvider = 'azure',
    } = body;

    // 3. Validações
    if (!avatarId || !scriptText) {
      return NextResponse.json(
        { error: 'avatarId e scriptText são obrigatórios' },
        { status: 400 }
      );
    }

    if (scriptText.length > 10000) {
      return NextResponse.json(
        { error: 'Script muito longo (máximo 10.000 caracteres)' },
        { status: 400 }
      );
    }

    // 4. Iniciar geração
    const engine = getAvatarEngine();
    const job = await engine.generateAvatar({
      avatarId,
      scriptText,
      voiceId,
      voiceProvider,
      userId: session.user.email,
    });

    console.log('[Avatar API] Generation started:', {
      jobId: job.id,
      userId: session.user.email,
      avatarId,
    });

    // 5. Retornar job info
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt,
      },
    });

  } catch (error: any) {
    console.error('[Avatar API] Error generating avatar:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao gerar avatar',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
