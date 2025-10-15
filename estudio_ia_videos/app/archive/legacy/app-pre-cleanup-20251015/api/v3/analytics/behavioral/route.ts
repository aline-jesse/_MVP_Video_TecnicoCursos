
/**
 * 📊 API - Analytics Comportamental
 */

import { NextRequest, NextResponse } from 'next/server';


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    const behavioralData = {
      overview: {
        totalUsers: 2847,
        activeUsers: 1923,
        avgSessionTime: 18.5,
        completionRate: 87.3,
        dropoffRate: 12.7,
        engagementScore: 8.4
      },
      heatmapData: [
        {
          section: 'Introdução',
          interactions: 945,
          avgTime: 2.3,
          clicks: 127,
          attention: 89,
          scrollDepth: 95
        },
        {
          section: 'Conceitos Básicos',
          interactions: 823,
          avgTime: 4.7,
          clicks: 234,
          attention: 92,
          scrollDepth: 87
        },
        {
          section: 'Procedimentos',
          interactions: 756,
          avgTime: 6.2,
          clicks: 189,
          attention: 85,
          scrollDepth: 78
        },
        {
          section: 'Quiz Final',
          interactions: 634,
          avgTime: 3.8,
          clicks: 156,
          attention: 87,
          scrollDepth: 92
        }
      ],
      riskPredictions: [
        {
          userId: 'user-1',
          name: 'João Silva',
          department: 'Operações',
          riskScore: 78,
          riskLevel: 'high',
          factors: ['Baixo engajamento', 'Sessões curtas', 'Poucas interações'],
          recommendation: 'Intervenção personalizada recomendada',
          confidence: 0.85
        }
      ],
      insights: [
        {
          type: 'pattern',
          title: 'Horário Otimizado',
          description: 'Usuários entre 9h-11h têm 23% mais engajamento',
          impact: 'high',
          confidence: 0.92
        },
        {
          type: 'opportunity',
          title: 'Conteúdo Prático',
          description: 'Exemplos práticos aumentam interação em 35%',
          impact: 'medium',
          confidence: 0.78
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: behavioralData,
      period,
      generatedAt: new Date()
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar analytics' },
      { status: 500 }
    );
  }
}
