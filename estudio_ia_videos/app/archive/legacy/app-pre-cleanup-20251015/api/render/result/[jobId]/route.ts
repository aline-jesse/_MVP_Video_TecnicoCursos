
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar render job
    const renderJob = await prisma.renderJob.findUnique({
      where: { id: jobId },
    });

    if (!renderJob) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    // Se completo, retornar URL do vídeo
    if (renderJob.status === 'completed') {
      const outputData = renderJob.outputData as any;
      return NextResponse.json({
        success: true,
        status: 'completed',
        videoUrl: outputData?.videoUrl || null,
        metadata: outputData,
      });
    }

    // Se ainda processando
    if (renderJob.status === 'processing' || renderJob.status === 'pending') {
      return NextResponse.json({
        success: true,
        status: renderJob.status,
        progress: renderJob.progress || 0,
      });
    }

    // Se falhou
    if (renderJob.status === 'failed') {
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: renderJob.errorMessage || 'Erro desconhecido',
      });
    }

    return NextResponse.json({
      success: true,
      status: renderJob.status,
    });

  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar resultado' },
      { status: 500 }
    );
  }
}
