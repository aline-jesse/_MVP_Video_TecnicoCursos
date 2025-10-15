

/**
 * 🤖 API de Fala para Avatares 3D
 * Geração de áudio com sincronização labial
 */

import { NextRequest, NextResponse } from 'next/server';
import { avatar3DHyperPipeline } from '@/lib/avatar-3d-pipeline';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { avatarId, text, voiceSettings, lipSyncEnabled, expressionsEnabled } = body;

    // Validação
    if (!avatarId || !text) {
      return NextResponse.json(
        { success: false, error: 'Avatar ID e texto são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o avatar existe no pipeline hiper-realista
    const avatar = avatar3DHyperPipeline.getAvatar(avatarId);
    if (!avatar) {
      return NextResponse.json(
        { success: false, error: 'Avatar hiper-realista não encontrado' },
        { status: 404 }
      );
    }

    // Simular processamento TTS + Lip Sync
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Usar pipeline hiper-realista para lip sync
    const lipSyncResult = await avatar3DHyperPipeline.generateHyperRealisticLipSync(
      avatarId,
      'mock_audio_file.wav', // Em produção, gerar arquivo de áudio real
      text
    );

    // Simular análise de texto para duração
    const wordsCount = text.split(' ').length;
    const estimatedDuration = Math.ceil(wordsCount / (voiceSettings?.speed || 2.5)); // WPM aproximado

    // Simular URL de áudio gerado
    const audioUrl = `/api/v4/avatars/audio/${sessionId}.mp3`;

    const response = {
      success: true,
      sessionId,
      voiceId: `voice_${avatarId}_${voiceSettings?.emotion || 'neutral'}`,
      duration: estimatedDuration,
      audioUrl,
      lipSyncData: {
        phonemes: lipSyncResult.lipSyncData.map(item => item.phoneme),
        timing: lipSyncResult.lipSyncData,
        expressions: expressionsEnabled ? generateExpressions(text, estimatedDuration) : [],
        accuracy: lipSyncResult.accuracy,
        processingTime: lipSyncResult.processingTime
      },
      metadata: {
        avatarId,
        avatarName: avatar.name,
        avatarQuality: avatar.quality,
        textLength: text.length,
        wordsCount,
        voiceSettings,
        features: {
          lipSync: lipSyncEnabled,
          expressions: expressionsEnabled,
          realTime: true,
          hyperRealistic: true,
          lipSyncEngine: avatar.voiceSync.lipSyncEngine,
          supportedLanguages: avatar.voiceSync.supportedLanguages
        },
        pipeline: {
          engine: 'Unreal Engine 5',
          lipSyncAccuracy: avatar.features.lipSyncAccuracy,
          facialDetails: avatar.features.facialDetails,
          microExpressions: avatar.features.microExpressions
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API de fala:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares
function generatePhonemes(text: string) {
  const phonemeMap: { [key: string]: string[] } = {
    'a': ['ah'], 'e': ['eh'], 'i': ['ih'], 'o': ['oh'], 'u': ['uh'],
    'b': ['b'], 'p': ['p'], 'm': ['m'], 'f': ['f'], 'v': ['v'],
    'l': ['l'], 'r': ['r'], 's': ['s'], 't': ['t'], 'n': ['n']
  };

  const phonemes = [];
  for (let char of text.toLowerCase()) {
    if (phonemeMap[char]) {
      phonemes.push(...phonemeMap[char]);
    }
  }

  return phonemes;
}

function generateTiming(phonemes: string[], duration: number) {
  const timing = [];
  const timePerPhoneme = duration / phonemes.length;

  for (let i = 0; i < phonemes.length; i++) {
    timing.push({
      phoneme: phonemes[i],
      startTime: i * timePerPhoneme,
      endTime: (i + 1) * timePerPhoneme,
      intensity: 0.5 + Math.random() * 0.5
    });
  }

  return timing;
}

function generateExpressions(text: string, duration: number) {
  const expressions = [];
  const expressionTypes = ['neutro', 'sorriso', 'pensativo', 'explicativo'];
  const numExpressions = Math.ceil(duration / 3); // Uma expressão a cada 3 segundos

  for (let i = 0; i < numExpressions; i++) {
    expressions.push({
      type: expressionTypes[Math.floor(Math.random() * expressionTypes.length)],
      startTime: i * 3,
      duration: 2 + Math.random() * 2,
      intensity: 0.3 + Math.random() * 0.7
    });
  }

  return expressions;
}
