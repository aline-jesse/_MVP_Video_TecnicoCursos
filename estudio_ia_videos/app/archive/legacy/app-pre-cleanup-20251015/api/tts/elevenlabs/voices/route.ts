
import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Vozes ElevenLabs
 */
export async function GET(request: NextRequest) {
  try {
    // Mock de vozes ElevenLabs
    const voices = [
      {
        voice_id: 'rachel_voice',
        name: 'Rachel',
        gender: 'female',
        language: 'pt-BR',
        accent: 'brasileiro',
        age_range: 'young_adult',
        description: 'Voz feminina jovem, clara e profissional',
        sample_url: '/samples/rachel.mp3'
      },
      {
        voice_id: 'daniel_voice',
        name: 'Daniel',
        gender: 'male',
        language: 'pt-BR',
        accent: 'brasileiro',
        age_range: 'adult',
        description: 'Voz masculina madura, autoritária e confiável',
        sample_url: '/samples/daniel.mp3'
      },
      {
        voice_id: 'julia_voice',
        name: 'Julia',
        gender: 'female',
        language: 'pt-BR',
        accent: 'brasileiro',
        age_range: 'adult',
        description: 'Voz feminina madura, calma e educativa',
        sample_url: '/samples/julia.mp3'
      }
    ];

    return NextResponse.json({
      success: true,
      voices,
      count: voices.length,
      provider: 'elevenlabs'
    });
  } catch (error) {
    console.error('Erro ao buscar vozes ElevenLabs:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar vozes ElevenLabs' },
      { status: 500 }
    );
  }
}
