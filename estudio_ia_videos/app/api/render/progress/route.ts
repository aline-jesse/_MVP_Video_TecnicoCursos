/**
 * 🎬 API de Progress Stream
 * Endpoint para streaming de progresso em tempo real
 */

import { NextRequest } from 'next/server';
import { renderJobManager } from '../../../../lib/render/job-manager';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return new Response('Job ID é obrigatório', { status: 400 });
  }

  // Verificar se job existe
  const job = renderJobManager.getJob(jobId);
  if (!job) {
    return new Response('Job não encontrado', { status: 404 });
  }

  // Configurar Server-Sent Events
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Função para enviar dados
      const sendUpdate = () => {
        const currentJob = renderJobManager.getJob(jobId);
        
        if (!currentJob) {
          controller.close();
          return;
        }

        const data = {
          id: currentJob.id,
          status: currentJob.status,
          progress: currentJob.progress,
          error: currentJob.error,
          outputUrl: currentJob.outputUrl,
          updatedAt: currentJob.updatedAt
        };

        const sseData = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(sseData));

        // Parar se job terminou
        if (currentJob.status === 'completed' || currentJob.status === 'failed') {
          setTimeout(() => controller.close(), 1000);
          return;
        }

        // Próxima atualização
        setTimeout(sendUpdate, 1000);
      };

      // Iniciar streaming
      sendUpdate();
    },

    cancel() {
      console.log('Progress stream cancelado para job:', jobId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}