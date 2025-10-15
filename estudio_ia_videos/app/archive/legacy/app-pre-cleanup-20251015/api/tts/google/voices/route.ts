
import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Vozes Google Cloud
 */
export async function GET(request: NextRequest) {
  try {
    const voices = [
      {
        voice_id: 'pt-BR-Wavenet-A',
        name: 'Wavenet A',
        gender: 'female',
        language: 'pt-BR',
        accent: 'brasileiro',
        type: 'WaveNet',
        description: 'Voz feminina brasileira WaveNet'
      },
      {
        voice_id: 'pt-BR-Wavenet-B',
        name: 'Wavenet B',
        gender: 'male',
        language: 'pt-BR',
        accent: 'brasileiro',
        type: 'WaveNet',
        description: 'Voz masculina brasileira WaveNet'
      }
    ];

    return NextResponse.json({
      success: true,
      voices,
      count: voices.length,
      provider: 'google'
    });
  } catch (error) {
    console.error('Erro ao buscar vozes Google:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar vozes Google' },
      { status: 500 }
    );
  }
}
