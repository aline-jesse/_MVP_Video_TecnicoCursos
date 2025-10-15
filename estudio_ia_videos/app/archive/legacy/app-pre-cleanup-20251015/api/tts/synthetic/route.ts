
import { NextRequest, NextResponse } from 'next/server'

// GET /api/tts/synthetic - Generate synthetic/mock audio for development
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get('text') || ''
    const duration = parseInt(searchParams.get('duration') || '5')

    // For development, return a mock audio response
    // In production, this could generate actual synthetic audio
    
    // Create a simple audio buffer (silence for now)
    const sampleRate = 22050
    const numSamples = Math.floor(duration * sampleRate)
    const buffer = new ArrayBuffer(44 + numSamples * 2) // WAV header + 16-bit samples
    const view = new DataView(buffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + numSamples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, numSamples * 2, true)
    
    // Generate simple sine wave based on text length
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * (200 + text.length * 10) * i / sampleRate) * 0.1
      view.setInt16(44 + i * 2, Math.round(sample * 32767), true)
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error generating synthetic audio:', error)
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 })
  }
}
