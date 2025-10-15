
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const data = await response.json()

    // Format the response for our component
    const formattedVoices = data.voices?.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category || 'premade',
      description: voice.description || `${voice.labels?.gender || 'Unknown'} voice with ${voice.labels?.accent || 'neutral'} accent`,
      preview_url: voice.preview_url,
      labels: {
        gender: voice.labels?.gender || 'Unknown',
        age: voice.labels?.age || 'Unknown', 
        accent: voice.labels?.accent || 'Neutral',
        'use case': voice.labels?.['use case'] || 'General'
      },
      fine_tuning: {
        is_allowed: voice.fine_tuning?.is_allowed || false
      }
    })) || []

    return NextResponse.json({
      voices: formattedVoices,
      count: formattedVoices.length
    })

  } catch (error) {
    console.error('Error fetching voices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    )
  }
}
