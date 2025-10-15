/**
 * API Route: Queue Management
 * Endpoints para gerenciamento de filas de processamento
 * @route /api/queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { createResilientQueue } from '@/lib/queue/queue-manager';

// Instância compartilhada da fila (singleton)
let queueManager: ReturnType<typeof createResilientQueue> | null = null;

function getQueueManager() {
  if (!queueManager) {
    queueManager = createResilientQueue('video-processing');
    
    // Registrar processadores de exemplo
    queueManager.registerProcessor('video:render', async (job) => {
      console.log('Processing video render:', job.id);
      // Simulação de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { videoUrl: 'https://example.com/video.mp4' };
    });

    queueManager.registerProcessor('video:transcode', async (job) => {
      console.log('Processing video transcode:', job.id);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { formats: ['mp4', 'webm'] };
    });
  }
  return queueManager;
}

/**
 * POST /api/queue
 * Adiciona novo job à fila
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, priority, maxAttempts } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data' },
        { status: 400 }
      );
    }

    const queue = getQueueManager();
    const job = await queue.addJob(type, data, {
      priority,
      maxAttempts,
    });

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        type: job.type,
        status: job.status,
        priority: job.priority,
        createdAt: job.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Queue add error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to add job',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/queue
 * Obtém status da fila ou job específico
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    const queue = getQueueManager();

    // Se solicitou job específico
    if (jobId) {
      const job = await queue.getJob(jobId);
      
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ job });
    }

    // Retorna métricas da fila
    const metrics = await queue.getMetrics();

    return NextResponse.json({
      metrics,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Queue get error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get queue status',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/queue
 * Pausa ou limpa a fila
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const queue = getQueueManager();

    if (action === 'pause') {
      queue.pause();
      return NextResponse.json({ success: true, message: 'Queue paused' });
    }

    if (action === 'cleanup') {
      const cleaned = await queue.cleanup();
      return NextResponse.json({ 
        success: true, 
        message: `Cleaned ${cleaned} jobs` 
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: pause, cleanup' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Queue delete error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to perform action',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/queue
 * Retoma processamento da fila
 */
export async function PATCH(request: NextRequest) {
  try {
    const queue = getQueueManager();
    queue.resume();

    return NextResponse.json({ 
      success: true, 
      message: 'Queue resumed' 
    });
  } catch (error) {
    console.error('Queue resume error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to resume queue',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
