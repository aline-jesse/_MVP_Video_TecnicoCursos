
/**
 * 🎙️ ElevenLabs TTS Generation API - Production Ready
 * Generate high-quality speech from text
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { elevenLabsProvider } from '@/lib/tts/elevenlabs-provider'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      text,
      voice_id = 'pNInz6obpgDQGcFmaJgB', // Default Adam voice
      model_id = 'eleven_multilingual_v2',
      voice_settings = {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.0,
        use_speaker_boost: true
      },
      output_format = 'mp3_44100_128'
    } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      )
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      )
    }

    console.log(`🎙️ Generating TTS for ${text.length} characters with voice: ${voice_id}`)

    const startTime = Date.now()

    const result = await elevenLabsProvider.generateSpeech({
      voice_id,
      text,
      model_id,
      voice_settings,
      output_format
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'TTS generation failed'
        },
        { status: 500 }
      )
    }

    const processingTime = Date.now() - startTime

    console.log(`✅ TTS generated successfully in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      audio_url: result.audio_url,
      metadata: {
        ...result.metadata,
        processing_time: processingTime,
        text_length: text.length,
        estimated_duration: Math.ceil(text.length / 12), // ~12 chars per second
        generated_at: new Date().toISOString(),
        user_id: session.user.id
      }
    })

  } catch (error) {
    console.error('❌ TTS Generation Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate TTS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Stream endpoint for real-time TTS
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const {
      text,
      voice_id = 'pNInz6obpgDQGcFmaJgB',
      model_id = 'eleven_multilingual_v2',
      voice_settings = {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.0,
        use_speaker_boost: true
      },
      optimize_streaming_latency = 3
    } = body

    if (!text) {
      return new Response('Text is required', { status: 400 })
    }

    console.log(`🎙️ Streaming TTS for: ${text.substring(0, 50)}...`)

    const stream = await elevenLabsProvider.generateSpeechStream({
      voice_id,
      text,
      model_id,
      voice_settings,
      optimize_streaming_latency
    })

    if (!stream) {
      return new Response('Failed to create audio stream', { status: 500 })
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error) {
    console.error('❌ TTS Streaming Error:', error)
    return new Response('Streaming failed', { status: 500 })
  }
}
