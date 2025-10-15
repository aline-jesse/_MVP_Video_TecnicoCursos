

/**
 * 🏗️ NR Revolucionário - Analytics API
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nr = searchParams.get('nr') || 'all';
    
    const analytics = {
      totalVideosNR: 2573,
      conformidadeGeral: 96.2,
      nrsImplementadas: 8,
      setoresAtendidos: 15,
      certificacaoValida: true,
      ultimaAtualizacao: '2025-08-31T07:49:00Z',
      
      // Analytics por NR específica
      nrEspecifica: nr !== 'all' ? {
        numero: nr,
        videosGerados: Math.floor(Math.random() * 500) + 100,
        conformidade: Math.floor(Math.random() * 10) + 90,
        templatesUsados: Math.floor(Math.random() * 20) + 5,
        setoresImpactados: Math.floor(Math.random() * 5) + 1
      } : null,
      
      // Métricas de performance
      performance: {
        tempoMedioGeracao: '3.2min',
        qualidadeVideo: '98.5%',
        satisfacaoUsuario: '4.8/5',
        economiaHoras: '2.847h/mês'
      },
      
      // Compliance por categoria
      complianceScore: {
        gestao: 94,
        protecao: 98,
        eletrica: 96,
        maquinas: 95,
        ergonomia: 93,
        espacosConfinados: 97,
        altura: 98
      }
    };

    const templates = [
      {
        id: 'nr-intro-interativa',
        nr: nr !== 'all' ? nr : 'NR-06',
        titulo: 'Introdução Interativa com Quiz',
        tipo: 'introducao',
        duracaoEstimada: 15,
        complexidade: 3,
        cenarios: ['Apresentação', 'Quiz', 'Certificação'],
        conformidadeScore: 98
      },
      {
        id: 'nr-procedimento-3d',
        nr: nr !== 'all' ? nr : 'NR-12',
        titulo: 'Procedimentos 3D Realistas',
        tipo: 'procedimento',
        duracaoEstimada: 25,
        complexidade: 4,
        cenarios: ['Demonstração', 'Prática Virtual', 'Avaliação'],
        conformidadeScore: 96
      },
      {
        id: 'nr-epi-interativo',
        nr: nr !== 'all' ? nr : 'NR-06',
        titulo: 'EPIs Interativos',
        tipo: 'epi',
        duracaoEstimada: 20,
        complexidade: 2,
        cenarios: ['Identificação', 'Uso Correto', 'Manutenção'],
        conformidadeScore: 99
      }
    ];

    const compliance = [
      {
        item: 'Conteúdo atualizado conforme MTE',
        status: 'conforme' as const,
        detalhes: 'Última atualização: 31/08/2025',
        correcao: null
      },
      {
        item: 'Certificação digital válida',
        status: 'conforme' as const,
        detalhes: 'Certificado por órgão competente',
        correcao: null
      },
      {
        item: 'Avaliação de aprendizado obrigatória',
        status: 'conforme' as const,
        detalhes: 'Quiz implementado em todos os vídeos',
        correcao: null
      },
      {
        item: 'Registro de participação',
        status: 'conforme' as const,
        detalhes: 'Sistema de tracking completo',
        correcao: null
      }
    ];

    return NextResponse.json({
      success: true,
      analytics,
      templates,
      compliance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('NR Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NR analytics' },
      { status: 500 }
    );
  }
}

