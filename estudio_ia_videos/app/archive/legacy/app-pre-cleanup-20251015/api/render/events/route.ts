/**
 * 📡 Server-Sent Events para Notificações de Render
 * Endpoint para streaming de notificações em tempo real
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase/client';

// Manter conexões ativas
const activeConnections = new Map<string, ReadableStreamDefaultController>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID é obrigatório' },
      { status: 400 }
    );
  }

  // Criar stream para Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Armazenar conexão
      activeConnections.set(userId, controller);

      // Enviar evento inicial
      const initialData = {
        type: 'connection_established',
        timestamp: new Date().toISOString(),
        userId
      };

      controller.enqueue(`data: ${JSON.stringify(initialData)}\n\n`);

      // Configurar listener para mudanças no Supabase
      const channel = supabaseClient
        .channel(`user_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'render_jobs',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const notificationData = {
              type: 'render_status_update',
              timestamp: new Date().toISOString(),
              data: payload.new
            };

            try {
              controller.enqueue(`data: ${JSON.stringify(notificationData)}\n\n`);
            } catch (error) {
              console.error('Erro ao enviar notificação SSE:', error);
            }
          }
        )
        .on(
          'broadcast',
          { event: 'render_notification' },
          (payload) => {
            try {
              controller.enqueue(`data: ${JSON.stringify(payload.payload)}\n\n`);
            } catch (error) {
              console.error('Erro ao enviar broadcast SSE:', error);
            }
          }
        )
        .subscribe();

      // Cleanup quando a conexão for fechada
      req.signal.addEventListener('abort', () => {
        activeConnections.delete(userId);
        channel.unsubscribe();
        controller.close();
      });

      // Heartbeat para manter conexão viva
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          activeConnections.delete(userId);
        }
      }, 30000); // 30 segundos

      // Cleanup do heartbeat
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
      });
    },

    cancel() {
      activeConnections.delete(userId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Função utilitária para enviar notificação para usuário específico
async function sendNotificationToUser(userId: string, notification: any) {
  const controller = activeConnections.get(userId);
  if (controller) {
    try {
      controller.enqueue(`data: ${JSON.stringify(notification)}\n\n`);
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação direta:', error);
      activeConnections.delete(userId);
      return false;
    }
  }
  return false;
}

// Endpoint POST para enviar notificações manuais
export async function POST(req: NextRequest) {
  try {
    const { userId, notification } = await req.json();

    if (!userId || !notification) {
      return NextResponse.json(
        { success: false, error: 'userId e notification são obrigatórios' },
        { status: 400 }
      );
    }

    const sent = await sendNotificationToUser(userId, notification);

    return NextResponse.json({
      success: true,
      sent,
      message: sent ? 'Notificação enviada' : 'Usuário não conectado'
    });

  } catch (error) {
    console.error('Erro ao enviar notificação manual:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}