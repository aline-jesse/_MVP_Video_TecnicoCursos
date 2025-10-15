
/**
 * API: Lista de Avatares D-ID
 * GET /api/avatar-3d/avatars
 * 
 * Retorna lista de avatares disponíveis na biblioteca D-ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getDIDClient } from '@/lib/did-client';

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

    // 2. Buscar avatares
    const didClient = getDIDClient();
    const avatars = await didClient.listAvatars();

    console.log(`[Avatar API] ${avatars.length} avatars found`);

    // 3. Retornar lista
    return NextResponse.json({
      success: true,
      avatars,
      mode: didClient.getConfig().mode,
    });

  } catch (error: any) {
    console.error('[Avatar API] Error listing avatars:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao listar avatares',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
