
/**
 * 📤 API de Upload de Amostras de Áudio
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const voiceProfileId = formData.get('voiceProfileId') as string;
    const transcription = formData.get('transcription') as string;

    if (!audioFile || !voiceProfileId) {
      return NextResponse.json(
        { error: 'Arquivo de áudio e voiceProfileId são obrigatórios' },
        { status: 400 }
      );
    }

    // Valida arquivo
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Formato não suportado. Use MP3, WAV ou M4A.' },
        { status: 400 }
      );
    }

    // Simula upload para S3
    const cloudStoragePath = `voice-samples/${Date.now()}-${audioFile.name}`;
    
    const sample = {
      id: `sample_${Date.now()}`,
      voiceProfileId,
      fileName: audioFile.name,
      duration: 30, // Simulado
      quality: 0.85,
      transcription: transcription || 'Transcrição automática...',
      uploadedAt: new Date().toISOString(),
      cloudStoragePath
    };

    console.log(`📤 Amostra de áudio salva: ${sample.fileName}`);
    return NextResponse.json(sample);

  } catch (error) {
    console.error('Erro ao fazer upload da amostra:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
