
/**
 * 🔕 SPRINT 39 - Push Unsubscribe API
 * API para remover inscrições de push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Deletar todas as subscriptions do usuário
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Desinscrito de push notifications',
    });
  } catch (error: any) {
    console.error('Erro ao remover push subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
