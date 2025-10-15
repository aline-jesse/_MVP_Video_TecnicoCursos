
import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Templates - Lista templates disponíveis para vídeos de NR
 */
export async function GET(request: NextRequest) {
  try {
    // Mock de templates NR para demonstração
    const templates = [
      {
        id: 'nr-12-template',
        title: 'NR-12: Segurança em Máquinas e Equipamentos',
        description: 'Template completo para treinamentos sobre segurança em máquinas',
        category: 'NR-12',
        thumbnail: '/nr12-thumb.jpg',
        duration: '15min',
        slides: 12,
        status: 'active'
      },
      {
        id: 'nr-33-template',
        title: 'NR-33: Segurança em Espaços Confinados',
        description: 'Template para treinamentos sobre trabalho em espaços confinados',
        category: 'NR-33',
        thumbnail: '/nr33-thumb.jpg',
        duration: '20min',
        slides: 15,
        status: 'active'
      },
      {
        id: 'nr-35-template',
        title: 'NR-35: Trabalho em Altura',
        description: 'Template para treinamentos sobre trabalho em altura',
        category: 'NR-35',
        thumbnail: '/nr35-thumb.jpg',
        duration: '18min',
        slides: 14,
        status: 'active'
      }
    ];

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar templates' },
      { status: 500 }
    );
  }
}
