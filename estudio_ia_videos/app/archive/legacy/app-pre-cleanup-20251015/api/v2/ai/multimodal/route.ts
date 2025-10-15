
/**
 * 🧠 API IA Multimodal - Sprint 9
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const analysisType = formData.get('analysisType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    // Simular análise multimodal
    const analysis = {
      id: `multimodal_${Date.now()}`,
      timestamp: new Date().toISOString(),
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      results: {
        visual: {
          objectsDetected: Math.floor(Math.random() * 20) + 5,
          safetyScore: 0.7 + Math.random() * 0.3,
          sceneClassification: 'industrial_workspace',
          qualityMetrics: {
            brightness: 0.8,
            contrast: 0.7,
            sharpness: 0.9
          }
        },
        audio: {
          transcription: 'Bem-vindos ao treinamento de segurança do trabalho...',
          sentimentScore: 0.85,
          clarityScore: 0.92,
          emotionDetected: 'professional',
          languageDetected: 'pt-BR'
        },
        correlation: {
          visualAudio: 0.89,
          overallCoherence: 0.87
        }
      },
      insights: [
        'Excelente aderência às normas de segurança',
        'Alto potencial de engajamento detectado',
        'Qualidade técnica superior à média',
        'Recomenda-se manter este padrão de conteúdo'
      ],
      safetyScore: 0.92,
      engagementScore: 0.87,
      qualityScore: 0.94,
      processingTime: 2500 + Math.random() * 2000
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro na análise multimodal:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const analysisId = searchParams.get('id');

    if (analysisId) {
      // Retornar análise específica
      const analysis = {
        id: analysisId,
        status: 'completed',
        results: {
          visual: { safetyScore: 0.89 },
          audio: { sentimentScore: 0.82 },
          correlation: 0.86
        }
      };

      return NextResponse.json(analysis);
    }

    // Listar análises recentes
    const recentAnalyses = [
      {
        id: 'analysis_001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'multimodal',
        file: 'treinamento_nr10.mp4',
        status: 'completed',
        scores: { safety: 0.92, engagement: 0.87, quality: 0.94 }
      },
      {
        id: 'analysis_002',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'computer_vision',
        file: 'procedimento_altura.mp4',
        status: 'completed',
        scores: { safety: 0.78, engagement: 0.82, quality: 0.85 }
      }
    ];

    return NextResponse.json({ analyses: recentAnalyses });
  } catch (error) {
    console.error('Erro ao buscar análises:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
