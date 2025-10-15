

/**
 * 👄 API de Sincronização Labial
 * Processamento avançado de lip-sync para avatares 3D
 */

import { NextRequest, NextResponse } from 'next/server';


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioData, text, avatarId, realTime = false } = body;

    // Validação
    if (!text || !avatarId) {
      return NextResponse.json(
        { success: false, error: 'Texto e Avatar ID são obrigatórios' },
        { status: 400 }
      );
    }

    // Simular análise de áudio para lip sync
    const phonemes = analyzeTextForPhonemes(text);
    const lipSyncData = generateLipSyncData(phonemes, text.length);
    const facialExpressions = generateFacialExpressions(text);

    const response = {
      success: true,
      lipSyncData: {
        phonemes: lipSyncData.phonemes,
        timing: lipSyncData.timing,
        intensity: lipSyncData.intensity,
        accuracy: 92 + Math.random() * 8, // 92-100% accuracy
        fps: realTime ? 60 : 30
      },
      facialData: {
        expressions: facialExpressions,
        eyeMovements: generateEyeMovements(text.length),
        headMovements: generateHeadMovements(text.length)
      },
      metadata: {
        processedAt: new Date().toISOString(),
        avatarId,
        textAnalysis: {
          wordCount: text.split(' ').length,
          sentenceCount: text.split(/[.!?]+/).length,
          avgWordLength: text.split(' ').reduce((acc: number, word: string) => acc + word.length, 0) / text.split(' ').length
        },
        performance: {
          processingTime: Math.random() * 500 + 100, // 100-600ms
          memoryUsage: Math.random() * 50 + 20, // 20-70MB
          accuracy: 92 + Math.random() * 8
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API de lip sync:', error);
    return NextResponse.json(
      { success: false, error: 'Erro no processamento de lip sync' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID é obrigatório' },
        { status: 400 }
      );
    }

    // Simular dados da sessão de lip sync
    const sessionData = {
      success: true,
      sessionId,
      status: 'active',
      lipSyncStatus: {
        isActive: true,
        currentPhoneme: 'ah',
        intensity: Math.random() * 100,
        accuracy: 95.2,
        fps: 60,
        latency: Math.random() * 10 + 5 // 5-15ms
      },
      realTimeData: {
        audioLevel: Math.random() * 100,
        pitch: 200 + Math.random() * 300,
        formants: [
          500 + Math.random() * 300,
          1200 + Math.random() * 500,
          2400 + Math.random() * 600
        ]
      }
    };

    return NextResponse.json(sessionData);

  } catch (error) {
    console.error('Erro ao buscar sessão de lip sync:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares
function analyzeTextForPhonemes(text: string) {
  // Mapeamento simplificado de texto para fonemas em português
  const phonemeMapping: { [key: string]: string } = {
    'a': 'ah', 'e': 'eh', 'i': 'ih', 'o': 'oh', 'u': 'uh',
    'b': 'b', 'p': 'p', 'm': 'm', 'f': 'f', 'v': 'v',
    'l': 'l', 'r': 'r', 's': 's', 't': 't', 'n': 'n',
    'ã': 'an', 'õ': 'on', 'ç': 's', 'nh': 'ny', 'lh': 'ly'
  };

  const phonemes = [];
  for (let char of text.toLowerCase()) {
    if (phonemeMapping[char]) {
      phonemes.push({
        phoneme: phonemeMapping[char],
        original: char,
        category: getPhonemeCategory(phonemeMapping[char])
      });
    }
  }

  return phonemes;
}

function generateLipSyncData(phonemes: any[], textLength: number) {
  const duration = Math.ceil(textLength / 15); // ~15 caracteres por segundo
  const timePerPhoneme = duration / phonemes.length;

  return {
    phonemes: phonemes.map(p => p.phoneme),
    timing: phonemes.map((phoneme, idx) => ({
      phoneme: phoneme.phoneme,
      startTime: idx * timePerPhoneme,
      endTime: (idx + 1) * timePerPhoneme,
      intensity: getPhonemeIntensity(phoneme.phoneme),
      category: phoneme.category
    })),
    intensity: phonemes.map(() => 0.3 + Math.random() * 0.7)
  };
}

function generateFacialExpressions(text: string) {
  const expressions = [];
  const words = text.split(' ');
  
  // Detectar palavras que podem indicar expressões
  const expressionKeywords = {
    'sorriso': ['bem', 'ótimo', 'excelente', 'parabéns', 'sucesso'],
    'sério': ['atenção', 'cuidado', 'importante', 'risco', 'perigo'],
    'pensativo': ['vamos', 'considere', 'imagine', 'pense'],
    'surpreso': ['incrível', 'impressionante', 'uau', 'nossa']
  };

  let currentTime = 0;
  const wordsPerSecond = 2.5;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    let expression = 'neutro';

    for (const [expr, keywords] of Object.entries(expressionKeywords)) {
      if (keywords.some(keyword => word.includes(keyword))) {
        expression = expr;
        break;
      }
    }

    if (expression !== 'neutro') {
      expressions.push({
        type: expression,
        startTime: currentTime,
        duration: 2,
        intensity: 0.6 + Math.random() * 0.4
      });
    }

    currentTime += 1 / wordsPerSecond;
  }

  return expressions;
}

function generateEyeMovements(textLength: number) {
  const movements = [];
  const duration = Math.ceil(textLength / 15);
  const numMovements = Math.ceil(duration / 2); // Movimento a cada 2 segundos

  for (let i = 0; i < numMovements; i++) {
    movements.push({
      type: ['look_left', 'look_right', 'look_up', 'blink'][Math.floor(Math.random() * 4)],
      startTime: i * 2,
      duration: 0.5 + Math.random() * 0.5,
      intensity: 0.3 + Math.random() * 0.4
    });
  }

  return movements;
}

function generateHeadMovements(textLength: number) {
  const movements = [];
  const duration = Math.ceil(textLength / 15);
  const numMovements = Math.ceil(duration / 3); // Movimento a cada 3 segundos

  for (let i = 0; i < numMovements; i++) {
    movements.push({
      type: ['nod', 'slight_turn_left', 'slight_turn_right', 'tilt'][Math.floor(Math.random() * 4)],
      startTime: i * 3,
      duration: 1 + Math.random() * 1,
      intensity: 0.2 + Math.random() * 0.3
    });
  }

  return movements;
}

function getPhonemeCategory(phoneme: string) {
  const vowels = ['ah', 'eh', 'ih', 'oh', 'uh', 'an', 'on'];
  const consonants = ['b', 'p', 'm', 'f', 'v', 'l', 'r', 's', 't', 'n', 'ny', 'ly'];
  
  if (vowels.includes(phoneme)) return 'vowel';
  if (consonants.includes(phoneme)) return 'consonant';
  return 'other';
}

function getPhonemeIntensity(phoneme: string) {
  // Intensidades diferentes para tipos de fonemas
  const intensityMap: { [key: string]: number } = {
    'ah': 0.8, 'eh': 0.7, 'ih': 0.6, 'oh': 0.9, 'uh': 0.5,
    'b': 0.7, 'p': 0.8, 'm': 0.6, 'f': 0.4, 'v': 0.5,
    'l': 0.5, 'r': 0.6, 's': 0.4, 't': 0.7, 'n': 0.5
  };

  return intensityMap[phoneme] || 0.5;
}
