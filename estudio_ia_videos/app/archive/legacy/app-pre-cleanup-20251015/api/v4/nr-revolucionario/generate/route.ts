

/**
 * 🏗️ NR Revolucionário - Video Generation API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { nr, template, aiEnhanced } = await request.json();
    
    if (!nr || !template) {
      return NextResponse.json(
        { success: false, error: 'NR e template são obrigatórios' },
        { status: 400 }
      );
    }

    // Simular processo de geração avançado
    const jobId = `nr_video_${Date.now()}`;
    
    const videoConfig = {
      nr,
      template,
      aiEnhanced,
      features: {
        compliance: true,
        interactiveQuiz: true,
        realScenarios: true,
        adaptiveContent: aiEnhanced,
        certification: true,
        multiLanguage: false // Foco em português brasileiro
      },
      estimatedDuration: getEstimatedDuration(nr, template),
      outputFormat: ['MP4-HD', 'MP4-4K', 'WebM'],
      accessibility: {
        subtitles: true,
        audioDescription: true,
        signLanguage: false // Pode ser adicionado
      }
    };

    return NextResponse.json({
      success: true,
      jobId,
      videoConfig,
      message: `Iniciando geração de vídeo ${nr} com template ${template}`,
      estimatedTime: '3-5 minutos',
      features: [
        'IA especializada em regulamentações brasileiras',
        'Conformidade automática com MTE',
        'Cenários baseados em casos reais',
        'Quiz de certificação integrado',
        'Adaptação por setor industrial'
      ]
    });

  } catch (error) {
    console.error('NR Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate NR video' },
      { status: 500 }
    );
  }
}

function getEstimatedDuration(nr: string, template: string): number {
  const baseDurations: Record<string, number> = {
    'NR-01': 25,
    'NR-05': 30,
    'NR-06': 20,
    'NR-10': 45,
    'NR-12': 50,
    'NR-17': 35,
    'NR-33': 55,
    'NR-35': 40
  };
  
  const templateMultipliers: Record<string, number> = {
    'auto': 1.0,
    'template': 1.0,
    'Introdução Interativa': 1.2,
    'Procedimentos 3D': 1.5,
    'EPIs Interativos': 1.1,
    'Emergências Realistas': 1.8,
    'Ergonomia Prática': 1.3,
    'Avaliação Gamificada': 1.4
  };
  
  const baseDuration = baseDurations[nr] || 30;
  const multiplier = templateMultipliers[template] || 1.0;
  
  return Math.round(baseDuration * multiplier);
}

