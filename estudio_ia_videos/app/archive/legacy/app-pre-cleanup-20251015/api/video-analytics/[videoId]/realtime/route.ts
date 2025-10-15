
/**
 * 📊 API de Dados em Tempo Real para Video Analytics
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;

    // Simulação de dados em tempo real
    const realtimeData = {
      currentViewers: Math.floor(Math.random() * 200) + 50,
      peakViewers: 340,
      averageViewTime: Math.floor(Math.random() * 100) + 250,
      currentRetention: 0.70 + Math.random() * 0.15,
      activeInteractions: Math.floor(Math.random() * 80) + 20,
      sentimentScore: 0.60 + Math.random() * 0.25
    };

    return NextResponse.json(realtimeData);

  } catch (error) {
    console.error('Erro ao buscar dados em tempo real:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
