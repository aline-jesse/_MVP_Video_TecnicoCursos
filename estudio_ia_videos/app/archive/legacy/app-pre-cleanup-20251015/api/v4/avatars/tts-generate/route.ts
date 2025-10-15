

/**
 * 🎙️ API de Geração TTS para Avatares
 * Text-to-Speech Neural com Lip Sync
 */

import { NextRequest, NextResponse } from 'next/server';


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, settings, avatarId } = body;

    // Validação
    if (!text || !settings || !avatarId) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros obrigatórios: text, settings, avatarId' },
        { status: 400 }
      );
    }

    // Simular análise de texto
    const textAnalysis = analyzeText(text);
    
    // Simular geração TTS neural
    const audioGeneration = await generateNeuralTTS(text, settings);
    
    // Gerar dados de sincronização labial
    const lipSyncData = generateAdvancedLipSync(text, audioGeneration.duration, settings);
    
    // Gerar animações faciais
    const facialAnimations = generateFacialAnimations(text, textAnalysis, settings);

    const response = {
      success: true,
      audioData: {
        url: audioGeneration.url,
        duration: audioGeneration.duration,
        format: 'wav',
        sampleRate: 44100,
        bitRate: 320,
        channels: 1
      },
      lipSyncData: {
        phonemes: lipSyncData.phonemes,
        timing: lipSyncData.timing,
        intensity: lipSyncData.intensity,
        accuracy: lipSyncData.accuracy,
        fps: 60
      },
      facialData: {
        expressions: facialAnimations.expressions,
        eyeMovements: facialAnimations.eyes,
        headMovements: facialAnimations.head,
        blinkPattern: facialAnimations.blinks
      },
      metadata: {
        avatarId,
        textAnalysis,
        settings,
        generatedAt: new Date().toISOString(),
        processingTime: audioGeneration.processingTime,
        quality: {
          naturalness: 96,
          clarity: 98,
          lipSyncAccuracy: 94,
          emotionalExpression: 92
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na geração TTS:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'voices';

    switch (type) {
      case 'voices':
        return NextResponse.json({
          success: true,
          voices: [
            {
              id: 'pt-BR-Neural-Francisca',
              name: 'Francisca',
              language: 'pt-BR',
              gender: 'female',
              age: 'adult',
              style: 'professional',
              premium: false,
              samples: ['/samples/francisca-1.mp3', '/samples/francisca-2.mp3']
            },
            {
              id: 'pt-BR-Neural-Antonio',
              name: 'Antonio',
              language: 'pt-BR',
              gender: 'male',
              age: 'adult',
              style: 'friendly',
              premium: false,
              samples: ['/samples/antonio-1.mp3', '/samples/antonio-2.mp3']
            },
            {
              id: 'pt-BR-Neural-Brenda',
              name: 'Brenda',
              language: 'pt-BR',
              gender: 'female',
              age: 'young',
              style: 'energetic',
              premium: true,
              samples: ['/samples/brenda-1.mp3', '/samples/brenda-2.mp3']
            }
          ]
        });

      case 'engines':
        return NextResponse.json({
          success: true,
          engines: [
            {
              id: 'neural',
              name: 'Neural TTS',
              description: 'IA neural de última geração',
              features: ['lip-sync', 'emotions', 'real-time'],
              premium: false
            },
            {
              id: 'neural-pro',
              name: 'Neural TTS Pro',
              description: 'Versão profissional com voice cloning',
              features: ['lip-sync', 'emotions', 'real-time', 'voice-cloning', 'custom-training'],
              premium: true
            }
          ]
        });

      case 'languages':
        return NextResponse.json({
          success: true,
          languages: [
            { code: 'pt-BR', name: 'Português (Brasil)', voices: 8, premium: 4 },
            { code: 'en-US', name: 'English (US)', voices: 12, premium: 8 },
            { code: 'es-ES', name: 'Español (España)', voices: 6, premium: 4 },
            { code: 'fr-FR', name: 'Français (France)', voices: 4, premium: 3 },
            { code: 'de-DE', name: 'Deutsch (Deutschland)', voices: 4, premium: 2 },
            { code: 'it-IT', name: 'Italiano (Italia)', voices: 3, premium: 2 }
          ]
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo não reconhecido' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erro na API TTS:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares
function analyzeText(text: string) {
  const words = text.split(' ');
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    characterCount: text.length,
    avgWordsPerSentence: Math.round(words.length / sentences.length),
    avgWordLength: Math.round(words.reduce((acc, word) => acc + word.length, 0) / words.length),
    complexity: calculateComplexity(text),
    emotions: detectEmotions(text),
    keyPhrases: extractKeyPhrases(text)
  };
}

function calculateComplexity(text: string) {
  const words = text.split(' ');
  const complexWords = words.filter(word => word.length > 6).length;
  const complexity = (complexWords / words.length) * 100;
  
  if (complexity < 15) return 'simple';
  if (complexity < 30) return 'medium';
  return 'complex';
}

function detectEmotions(text: string) {
  const emotionKeywords = {
    positive: ['ótimo', 'excelente', 'fantástico', 'maravilhoso', 'sucesso'],
    negative: ['problema', 'erro', 'ruim', 'difícil', 'perigo'],
    neutral: ['informação', 'dados', 'processo', 'sistema', 'método']
  };

  const emotions: string[] = [];
  const lowerText = text.toLowerCase();

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      emotions.push(emotion);
    }
  }

  return emotions.length > 0 ? emotions : ['neutral'];
}

function extractKeyPhrases(text: string) {
  // Extrair frases-chave para ajustar expressões
  const phrases = text.split(/[.!?]+/).filter(s => s.trim());
  return phrases.slice(0, 3).map(phrase => phrase.trim());
}

async function generateNeuralTTS(text: string, settings: any) {
  // Simular geração de TTS
  const duration = Math.ceil(text.length / 15); // ~15 caracteres por segundo
  const processingTime = Math.random() * 2000 + 1000; // 1-3 segundos

  return {
    url: `/api/v4/avatars/audio/generated_${Date.now()}.wav`,
    duration,
    processingTime,
    quality: 'high'
  };
}

function generateAdvancedLipSync(text: string, duration: number, settings: any) {
  // Análise fonética avançada
  const phonemes = text.toLowerCase().split('').map(char => {
    const phonemeMap: { [key: string]: string } = {
      'a': 'ah', 'e': 'eh', 'i': 'ih', 'o': 'oh', 'u': 'uh',
      'b': 'b', 'p': 'p', 'm': 'm', 'f': 'f', 'v': 'v',
      'l': 'l', 'r': 'r', 's': 's', 't': 't', 'n': 'n'
    };
    return phonemeMap[char] || 'sil'; // silence
  }).filter(p => p !== 'sil');

  const timing = phonemes.map((phoneme, idx) => ({
    phoneme,
    startTime: (idx / phonemes.length) * duration,
    endTime: ((idx + 1) / phonemes.length) * duration,
    intensity: getPhonemeIntensity(phoneme, settings.emotion),
    confidence: 0.85 + Math.random() * 0.15
  }));

  return {
    phonemes,
    timing,
    intensity: timing.map(t => t.intensity),
    accuracy: 94 + Math.random() * 6
  };
}

function generateFacialAnimations(text: string, analysis: any, settings: any) {
  const duration = Math.ceil(text.length / 15);
  
  return {
    expressions: generateExpressionSequence(text, duration, settings.emotion),
    eyes: generateEyeAnimations(duration),
    head: generateHeadAnimations(duration, analysis.complexity),
    blinks: generateBlinkPattern(duration)
  };
}

function generateExpressionSequence(text: string, duration: number, emotion: string) {
  const expressions: any[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const timePerSentence = duration / sentences.length;

  sentences.forEach((sentence, idx) => {
    const baseExpression = getExpressionForEmotion(emotion);
    const sentimentExpression = getSentimentExpression(sentence);
    
    expressions.push({
      type: sentimentExpression || baseExpression,
      startTime: idx * timePerSentence,
      duration: timePerSentence * 0.8,
      intensity: 0.4 + Math.random() * 0.4,
      transition: 'smooth'
    });
  });

  return expressions;
}

function generateEyeAnimations(duration: number) {
  const animations = [];
  const numBlinks = Math.ceil(duration / 3); // Piscar a cada 3 segundos aproximadamente

  for (let i = 0; i < numBlinks; i++) {
    animations.push({
      type: 'blink',
      startTime: i * 3 + Math.random() * 2,
      duration: 0.15,
      intensity: 1.0
    });
  }

  // Adicionar movimentos oculares ocasionais
  const numEyeMovements = Math.ceil(duration / 5);
  for (let i = 0; i < numEyeMovements; i++) {
    animations.push({
      type: ['look_left', 'look_right', 'look_up'][Math.floor(Math.random() * 3)],
      startTime: i * 5 + Math.random() * 3,
      duration: 1 + Math.random() * 2,
      intensity: 0.3 + Math.random() * 0.4
    });
  }

  return animations.sort((a, b) => a.startTime - b.startTime);
}

function generateHeadAnimations(duration: number, complexity: string) {
  const animations = [];
  const intensityMultiplier = complexity === 'complex' ? 1.2 : complexity === 'simple' ? 0.8 : 1.0;
  
  const numNods = Math.ceil(duration / 4);
  for (let i = 0; i < numNods; i++) {
    animations.push({
      type: 'nod',
      startTime: i * 4 + Math.random() * 2,
      duration: 0.8,
      intensity: (0.3 + Math.random() * 0.3) * intensityMultiplier
    });
  }

  return animations;
}

function generateBlinkPattern(duration: number) {
  const blinks = [];
  const avgBlinkInterval = 3; // 3 segundos
  let currentTime = Math.random() * 2; // Começar aleatoriamente

  while (currentTime < duration) {
    blinks.push({
      startTime: currentTime,
      duration: 0.1 + Math.random() * 0.1, // 0.1-0.2s
      intensity: 1.0
    });
    currentTime += avgBlinkInterval + (Math.random() - 0.5) * 2; // Variação natural
  }

  return blinks;
}

function getPhonemeIntensity(phoneme: string, emotion: string) {
  const baseIntensity: { [key: string]: number } = {
    'ah': 0.8, 'eh': 0.7, 'ih': 0.6, 'oh': 0.9, 'uh': 0.5,
    'b': 0.7, 'p': 0.8, 'm': 0.6, 'f': 0.4, 'v': 0.5
  };

  const emotionMultiplier: { [key: string]: number } = {
    'neutral': 1.0,
    'happy': 1.2,
    'excited': 1.4,
    'sad': 0.8,
    'angry': 1.3,
    'calm': 0.9,
    'professional': 1.1
  };

  return (baseIntensity[phoneme] || 0.5) * (emotionMultiplier[emotion] || 1.0);
}

function getExpressionForEmotion(emotion: string) {
  const expressionMap: { [key: string]: string } = {
    'neutral': 'neutral',
    'happy': 'smile',
    'excited': 'smile',
    'sad': 'sad',
    'angry': 'frown',
    'calm': 'peaceful',
    'professional': 'confident'
  };

  return expressionMap[emotion] || 'neutral';
}

function getSentimentExpression(sentence: string) {
  const positiveWords = ['ótimo', 'excelente', 'bom', 'sucesso', 'parabéns'];
  const negativeWords = ['problema', 'erro', 'cuidado', 'atenção', 'perigo'];
  
  const lowerSentence = sentence.toLowerCase();
  
  if (positiveWords.some(word => lowerSentence.includes(word))) {
    return 'smile';
  }
  
  if (negativeWords.some(word => lowerSentence.includes(word))) {
    return 'concerned';
  }
  
  return null; // Usar expressão base
}
