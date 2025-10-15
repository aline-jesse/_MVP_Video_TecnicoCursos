
/**
 * 🎙️ ElevenLabs Voices API - Production Ready
 * Get available voices from ElevenLabs API
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { elevenLabsProvider } from '@/lib/tts/elevenlabs-provider'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🎙️ Fetching ElevenLabs voices...')

    const voices = await elevenLabsProvider.getVoices()

    // Categorize voices for better UX
    const categorizedVoices = {
      portuguese: voices.filter(v => 
        v.labels?.accent?.includes('portuguese') ||
        v.labels?.accent?.includes('brazilian') ||
        v.name.toLowerCase().includes('portuguese') ||
        v.name.toLowerCase().includes('brasil')
      ),
      english: voices.filter(v => 
        v.labels?.accent?.includes('american') ||
        v.labels?.accent?.includes('british') ||
        v.labels?.accent?.includes('australian')
      ),
      spanish: voices.filter(v => 
        v.labels?.accent?.includes('spanish') ||
        v.labels?.accent?.includes('mexican')
      ),
      cloned: voices.filter(v => v.category === 'cloned'),
      professional: voices.filter(v => v.category === 'professional'),
      all: voices
    }

    // Add recommended voices for Safety Training
    const recommendedForSafety = voices
      .filter(v => 
        v.labels?.use_case?.includes('narration') ||
        v.labels?.description?.includes('clear') ||
        v.labels?.age === 'middle_aged'
      )
      .slice(0, 5)

    const response = {
      success: true,
      total_voices: voices.length,
      voices: categorizedVoices,
      recommended_for_safety: recommendedForSafety,
      metadata: {
        fetched_at: new Date().toISOString(),
        api_status: voices.length > 0 ? 'connected' : 'limited',
        categories: {
          portuguese: categorizedVoices.portuguese.length,
          english: categorizedVoices.english.length,
          spanish: categorizedVoices.spanish.length,
          cloned: categorizedVoices.cloned.length,
          professional: categorizedVoices.professional.length
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error fetching ElevenLabs voices:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch voices',
        voices: { all: [] },
        metadata: {
          fetched_at: new Date().toISOString(),
          api_status: 'error',
          error_details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { voice_id } = await request.json()

    if (!voice_id) {
      return NextResponse.json(
        { error: 'voice_id is required' },
        { status: 400 }
      )
    }

    console.log(`🎙️ Fetching voice details for: ${voice_id}`)

    const voice = await elevenLabsProvider.getVoice(voice_id)

    if (!voice) {
      return NextResponse.json(
        { error: 'Voice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      voice,
      metadata: {
        fetched_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error fetching voice details:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch voice details',
        metadata: {
          error_details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}
