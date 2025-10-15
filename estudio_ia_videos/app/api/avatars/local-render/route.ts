
/**
 * 🎬 API: Local Avatar Render Pipeline
 * Integração do Avatar PT-BR Pipeline no Estúdio IA
 * 
 * Pipeline:
 * 1. Gera áudio com TTS (ElevenLabs/Azure)
 * 2. Processa lip sync e animação
 * 3. Renderiza vídeo final
 * 4. Upload para S3
 * 5. Salva no Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EnhancedTTSService } from '@/lib/enhanced-tts-service';
import { S3UploadEngine } from '@/lib/s3-upload-engine';
import { LocalAvatarRenderer } from '@/lib/local-avatar-renderer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      avatarId, 
      voiceId, 
      resolution = 'HD',
      fps = 30,
      userId 
    } = body;

    // Validação
    if (!text || !avatarId || !voiceId || !userId) {
      return NextResponse.json(
        { error: 'text, avatarId, voiceId e userId são obrigatórios' },
        { status: 400 }
      );
    }

    if (text.length > 800) {
      return NextResponse.json(
        { error: 'Texto muito longo (máximo 800 caracteres)' },
        { status: 400 }
      );
    }

    // ETAPA 1: Criar job no Prisma
    const job = await prisma.avatar3DRenderJob.create({
      data: {
        userId,
        avatarId,
        text,
        audioUrl: '', // Será preenchido após geração do áudio
        resolution,
        fps,
        duration: 0, // Será calculado após TTS
        status: 'queued',
        progress: 0,
        currentStage: 'preparation'
      }
    });

    // ETAPA 2: Gera áudio com TTS (async)
    // Inicia processamento em background
    processAvatarRendering(job.id, text, voiceId, avatarId, resolution, fps)
      .catch(error => {
        console.error(`[Job ${job.id}] Erro no processamento:`, error);
        // Atualiza job com erro
        prisma.avatar3DRenderJob.update({
          where: { id: job.id },
          data: {
            status: 'error',
            error: error.message,
            errorDetails: { stack: error.stack }
          }
        }).catch(console.error);
      });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'Renderização iniciada. Use GET /api/avatars/local-render?jobId=<id> para verificar progresso.'
    });

  } catch (error) {
    console.error('Erro ao iniciar renderização local:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar renderização' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'jobId é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const job = await prisma.avatar3DRenderJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      currentStage: job.currentStage,
      estimatedTime: job.estimatedTime,
      videoUrl: job.videoUrl,
      thumbnail: job.thumbnail,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });

  } catch (error) {
    console.error('Erro ao consultar status do job:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar status' },
      { status: 500 }
    );
  }
}

/**
 * Processa renderização do avatar em background
 */
async function processAvatarRendering(
  jobId: string,
  text: string,
  voiceId: string,
  avatarId: string,
  resolution: string,
  fps: number
) {
  const s3 = new S3UploadEngine();
  const renderer = new LocalAvatarRenderer();

  try {
    // ETAPA 1: Gerar áudio TTS
    await prisma.avatar3DRenderJob.update({
      where: { id: jobId },
      data: {
        status: 'processing',
        progress: 10,
        currentStage: 'audio'
      }
    });

    const ttsResult = await EnhancedTTSService.synthesizeSpeech({
      text,
      language: 'pt-BR',
      voice: voiceId,
      speed: 1.0,
      pitch: 0
    });

    if (!ttsResult.success || !ttsResult.audioUrl) {
      throw new Error('Falha ao gerar áudio TTS');
    }

    // Calcula duração
    const words = text.split(/\s+/).length;
    const duration = Math.ceil((words / 150) * 60 * 1000); // 150 palavras/min

    await prisma.avatar3DRenderJob.update({
      where: { id: jobId },
      data: {
        audioUrl: ttsResult.audioUrl,
        duration,
        progress: 25,
        estimatedTime: Math.ceil(duration / 100) // 100ms de vídeo por segundo
      }
    });

    // ETAPA 2: Processar lip sync e animação
    await prisma.avatar3DRenderJob.update({
      where: { id: jobId },
      data: {
        progress: 40,
        currentStage: 'lipsync'
      }
    });

    const animationData = await renderer.generateLipSync(
      ttsResult.audioUrl,
      text,
      duration
    );

    // ETAPA 3: Renderizar vídeo
    await prisma.avatar3DRenderJob.update({
      where: { id: jobId },
      data: {
        progress: 60,
        currentStage: 'rendering'
      }
    });

    const videoBuffer = await renderer.renderVideo(
      avatarId,
      animationData,
      {
        resolution,
        fps,
        duration
      }
    );

    // ETAPA 4: Upload para S3
    await prisma.avatar3DRenderJob.update({
      where: { id: jobId },
      data: {
        progress: 85,
        currentStage: 'encoding'
      }
    });

    const uploadResult = await s3.uploadFile(
      videoBuffer,
      `avatar_${jobId}_${Date.now()}.mp4`
    );

    if (!uploadResult.success) {
      throw new Error(`Falha no upload S3: ${uploadResult.error}`);
    }

    // ETAPA 5: Finalizar
    await prisma.avatar3DRenderJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        progress: 100,
        currentStage: 'completed',
        videoUrl: uploadResult.url,
        fileSize: uploadResult.size
      }
    });

    console.log(`[Job ${jobId}] ✅ Renderização concluída com sucesso`);

  } catch (error) {
    console.error(`[Job ${jobId}] ❌ Erro:`, error);
    throw error;
  }
}
