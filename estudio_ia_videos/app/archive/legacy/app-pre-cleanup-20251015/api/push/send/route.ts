
/**
 * 📤 SPRINT 39 - Send Push Notification API
 * API para enviar push notifications (uso interno/admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

// Importação condicional de web-push (opcional)
let webpush: any = null;
try {
  // Apenas importa se o módulo estiver instalado
  webpush = require('web-push');
  
  // Configurar Web Push (em produção, usar env vars)
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:contato@treinx.app',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
} catch (error) {
  console.warn('⚠️ web-push não instalado. Push notifications desabilitadas.');
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se web-push está disponível
    if (!webpush) {
      return NextResponse.json(
        { error: 'Push notifications não estão disponíveis. Instale web-push para habilitar.' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authConfig);
    
    // Verificar autenticação (permitir todos os usuários autenticados)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { userId, title, body, data, icon, actions } = await request.json();

    // Buscar subscriptions do usuário
    const subscriptions = await prisma.pushSubscription.findMany({
      where: userId ? { userId } : {},
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhuma subscription encontrada',
      });
    }

    // Enviar para todas as subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh,
          },
        };

        const payload = JSON.stringify({
          title,
          body,
          icon: icon || '/icon-192.png',
          badge: '/icon-72.png',
          data,
          actions,
        });

        return webpush.sendNotification(pushSubscription, payload);
      })
    );

    const sent = results.filter((r: any) => r.status === 'fulfilled').length;
    const failed = results.filter((r: any) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscriptions.length,
    });
  } catch (error: any) {
    console.error('Erro ao enviar push notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
