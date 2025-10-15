
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * ✅ API de Status de Renderização - CONECTADO AO DB REAL
 * Sprint 43 - P1 CORRIGIDO
 */

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const renderId = searchParams.get('id');

    if (!renderId) {
      return NextResponse.json(
        { success: false, error: 'ID de renderização não fornecido' },
        { status: 400 }
      );
    }

    // ✅ BUSCAR STATUS REAL DO BANCO DE DADOS
    const renderJob = await prisma.renderJob.findUnique({
      where: { id: renderId },
      select: {
        id: true,
        status: true,
        progress: true,
        currentStep: true,
        totalSteps: true,
        startedAt: true,
        completedAt: true,
        processingTime: true,
        errorMessage: true,
        inputData: true,
        outputData: true,
        type: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!renderJob) {
      return NextResponse.json(
        { success: false, error: 'Render job não encontrado' },
        { status: 404 }
      );
    }

    // Calcular tempo estimado de conclusão
    let estimatedCompletion = null;
    if (renderJob.status === 'processing' && renderJob.startedAt) {
      const elapsedTime = Date.now() - renderJob.startedAt.getTime();
      const progressPercentage = renderJob.progress / 100;
      if (progressPercentage > 0) {
        const totalEstimatedTime = elapsedTime / progressPercentage;
        const remainingTime = totalEstimatedTime - elapsedTime;
        estimatedCompletion = new Date(Date.now() + remainingTime).toISOString();
      }
    }

    // Calcular steps completados
    const completedSteps = Math.floor((renderJob.progress / 100) * renderJob.totalSteps);

    // Extrair output URL se disponível
    let outputUrl = null;
    if (renderJob.status === 'completed' && renderJob.outputData) {
      const outputData = renderJob.outputData as any;
      outputUrl = outputData.videoUrl || outputData.fileUrl || outputData.url || null;
    }

    const status = {
      id: renderJob.id,
      status: renderJob.status,
      progress: renderJob.progress,
      current_step: renderJob.currentStep || 'Inicializando...',
      total_steps: renderJob.totalSteps,
      completed_steps: completedSteps,
      started_at: renderJob.startedAt?.toISOString() || null,
      completed_at: renderJob.completedAt?.toISOString() || null,
      estimated_completion: estimatedCompletion,
      processing_time_seconds: renderJob.processingTime,
      output_url: outputUrl,
      error_message: renderJob.errorMessage,
      type: renderJob.type
    };

    return NextResponse.json({
      success: true,
      status,
      source: 'DATABASE_REAL' // ✅ Marcador de dados reais
    });
  } catch (error) {
    console.error('❌ Erro ao buscar status de renderização:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao buscar status de renderização',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
