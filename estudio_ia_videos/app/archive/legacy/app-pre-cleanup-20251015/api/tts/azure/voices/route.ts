
import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Vozes Azure
 */
export async function GET(request: NextRequest) {
  try {
    const voices = [
      {
        voice_id: 'pt-BR-FranciscaNeural',
        name: 'Francisca (Neural)',
        gender: 'female',
        language: 'pt-BR',
        accent: 'brasileiro',
        style: ['cheerful', 'empathetic', 'calm'],
        description: 'Voz neural feminina brasileira com múltiplos estilos'
      },
      {
        voice_id: 'pt-BR-AntonioNeural',
        name: 'Antonio (Neural)',
        gender: 'male',
        language: 'pt-BR',
        accent: 'brasileiro',
        style: ['cheerful', 'calm'],
        description: 'Voz neural masculina brasileira'
      }
    ];

    return NextResponse.json({
      success: true,
      voices,
      count: voices.length,
      provider: 'azure'
    });
  } catch (error) {
    console.error('Erro ao buscar vozes Azure:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar vozes Azure' },
      { status: 500 }
    );
  }
}
