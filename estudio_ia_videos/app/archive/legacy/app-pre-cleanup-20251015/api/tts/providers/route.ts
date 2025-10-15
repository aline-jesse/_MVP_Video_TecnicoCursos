
import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Providers TTS - Lista providers disponíveis
 */
export async function GET(request: NextRequest) {
  try {
    const providers = [
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'Vozes ultra-realistas com IA',
        status: 'active',
        languages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR'],
        features: ['voice_cloning', 'emotion_control', 'multilingual'],
        pricing: 'premium'
      },
      {
        id: 'azure',
        name: 'Microsoft Azure Speech',
        description: 'TTS robusto e escalável',
        status: 'active',
        languages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'],
        features: ['ssml', 'neural_voices', 'custom_voice'],
        pricing: 'standard'
      },
      {
        id: 'google',
        name: 'Google Cloud Text-to-Speech',
        description: 'Vozes naturais do Google',
        status: 'active',
        languages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'ja-JP', 'zh-CN'],
        features: ['wavenet', 'ssml', 'custom_voice'],
        pricing: 'standard'
      }
    ];

    return NextResponse.json({
      success: true,
      providers,
      count: providers.length,
      default_provider: 'elevenlabs'
    });
  } catch (error) {
    console.error('Erro ao buscar providers TTS:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar providers TTS' },
      { status: 500 }
    );
  }
}
