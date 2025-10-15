
/**
 * API: Generate TTS Audio
 * Multi-provider with fallback
 */

import { NextRequest, NextResponse } from 'next/server';
import { ttsMultiProvider, TTSRequest } from '@/lib/tts/tts-multi-provider';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: TTSRequest = await request.json();
    
    // Validate input
    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (body.text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    console.log(`[TTS] Generating audio for user ${session.user.email}`);
    console.log(`[TTS] Text length: ${body.text.length} characters`);
    console.log(`[TTS] Provider: ${body.provider || 'auto'}`);

    // Generate speech
    const result = await ttsMultiProvider.generateSpeech(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate speech' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      duration: result.duration,
      provider: result.provider,
      cached: result.cached || false
    });

  } catch (error: any) {
    console.error('[TTS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Get available voices
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as 'elevenlabs' | 'azure' | 'google' | null;

    if (!provider) {
      const { TTSMultiProvider } = await import('@/lib/tts/tts-multi-provider');
      return NextResponse.json({
        elevenlabs: TTSMultiProvider.getAvailableVoices('elevenlabs'),
        azure: TTSMultiProvider.getAvailableVoices('azure'),
        google: TTSMultiProvider.getAvailableVoices('google')
      });
    }

    const { TTSMultiProvider } = await import('@/lib/tts/tts-multi-provider');
    const voices = TTSMultiProvider.getAvailableVoices(provider);
    return NextResponse.json({ voices });

  } catch (error: any) {
    console.error('[TTS] Error fetching voices:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
