
import { NextRequest, NextResponse } from 'next/server'
import { Upload } from '@aws-sdk/lib-storage'
import { S3Client } from '@aws-sdk/client-s3'

// AWS S3 Client (use hosted storage config)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice_id, voice_settings, model_id = 'eleven_multilingual_v2' } = body

    if (!text || !voice_id) {
      return NextResponse.json(
        { error: 'Text and voice_id are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    // Call ElevenLabs TTS API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings: voice_settings || {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    const audioData = Buffer.from(audioBuffer)

    // Upload to S3
    const filename = `${process.env.AWS_FOLDER_PREFIX}tts-audio/${Date.now()}-${voice_id}.mp3`
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: filename,
        Body: audioData,
        ContentType: 'audio/mpeg'
      }
    })
    
    const uploadResult = await upload.done()

    // Generate public URL  
    const audioUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`

    // Estimate duration (rough calculation based on characters)
    const estimatedDuration = Math.max(1, Math.floor(text.length * 0.08)) // ~80ms per character

    return NextResponse.json({
      audio_url: audioUrl,
      duration: estimatedDuration,
      text,
      voice_id,
      voice_settings,
      model_id,
      filename,
      file_size: audioData.length,
      created_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating TTS:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate speech',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
