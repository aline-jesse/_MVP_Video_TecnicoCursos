
/**
 * 🎵 API de Geração de Voz Clonada
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { voiceProfileId, text, settings } = await request.json();

    if (!voiceProfileId || !text) {
      return NextResponse.json(
        { error: 'voiceProfileId e text são obrigatórios' },
        { status: 400 }
      );
    }

    // Cria job de geração
    const job = {
      id: `job_${Date.now()}`,
      voiceProfileId,
      text,
      settings: {
        emotion: 'neutral',
        speed: 1.0,
        pitch: 1.0,
        emphasis: [],
        ...settings
      },
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    // Simula processamento em background
    setTimeout(() => {
      job.status = 'processing';
    }, 1000);

    setTimeout(() => {
      job.status = 'completed';
      job.progress = 100;
      (job as any).result = {
        audioUrl: `/api/voice-cloning/audio/${job.id}`,
        duration: estimateAudioDuration(text),
        quality: 0.85 + Math.random() * 0.1,
        similarity: 0.80 + Math.random() * 0.15
      };
    }, 5000);

    return NextResponse.json(job);

  } catch (error) {
    console.error('Erro ao gerar voz:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

function estimateAudioDuration(text: string): number {
  const wordsPerMinute = 165;
  const words = text.split(' ').length;
  return Math.ceil((words / wordsPerMinute) * 60);
}
