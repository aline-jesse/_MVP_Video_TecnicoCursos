
/**
 * 🎵 API para Servir Áudios Gerados
 * Serve arquivos de áudio gerados pelo TTS
 */

import { NextRequest, NextResponse } from 'next/server'
import { RealTTSService } from '@/lib/real-tts-service'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    console.log(`🎵 Servindo áudio: ${filename}`)
    
    if (!filename || !filename.match(/\.(mp3|wav|ogg)$/)) {
      console.error(`❌ Formato de arquivo inválido: ${filename}`)
      return new NextResponse('Invalid audio file', { status: 400 })
    }

    // Primeiro, tentar buscar no cache
    const { AudioCache } = await import('@/lib/audio-cache')
    const cached = AudioCache.get(filename)
    
    if (cached) {
      console.log(`✅ Áudio encontrado no cache: ${filename} (${cached.buffer.length} bytes)`)
      
      // Headers apropriados
      const headers = new Headers()
      headers.set('Content-Type', cached.contentType)
      headers.set('Content-Length', cached.buffer.length.toString())
      headers.set('Cache-Control', 'public, max-age=300') // Cache por 5 minutos
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('Accept-Ranges', 'bytes')
      
      return new NextResponse(cached.buffer, { headers })
    }

    // Se não encontrado no cache, gerar áudio sintético on-demand
    console.log(`🔄 Gerando áudio sintético on-demand: ${filename}`)
    
    // Extrair parâmetros do filename se houver
    const isMP3 = filename.endsWith('.mp3')
    const duration = 3000 // 3 segundos padrão
    const text = 'Áudio sintético gerado para demonstração do talking photo'
    
    // Gerar buffer de áudio
    const audioBuffer = generateSyntheticAudioBuffer(text, duration, isMP3)
    console.log(`✅ Buffer gerado: ${audioBuffer.length} bytes`)
    
    // Salvar no cache
    const contentType = isMP3 ? 'audio/mpeg' : 'audio/wav'
    AudioCache.store(filename, audioBuffer, contentType, duration)
    
    // Headers apropriados
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', audioBuffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=300') // Cache por 5 minutos
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Accept-Ranges', 'bytes')
    
    return new NextResponse(audioBuffer, { headers })
    
  } catch (error) {
    console.error('❌ Erro ao servir áudio:', error)
    return new NextResponse('Error serving audio file', { status: 500 })
  }
}

// Gerar buffer de áudio sintético
function generateSyntheticAudioBuffer(text: string, duration: number, isMP3: boolean): Buffer {
  const sampleRate = 44100
  const samples = Math.floor(duration * sampleRate / 1000)
  
  if (isMP3) {
    // Para MP3, retornar header mínimo + dados de áudio simulados
    const mp3Header = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, // MP3 frame header (MPEG-1 Layer 3, 128kbps, 44.1kHz)
      0x00, 0x00, 0x00, 0x00  // Padding
    ])
    
    const audioData = Buffer.alloc(Math.floor(samples / 32)) // Compressão simulada
    
    // Gerar dados de áudio sintético comprimido
    for (let i = 0; i < audioData.length; i++) {
      const charIndex = Math.floor((i / audioData.length) * text.length)
      const char = text.charCodeAt(charIndex) || 65
      audioData[i] = (char + i) % 256
    }
    
    return Buffer.concat([mp3Header, audioData])
  } else {
    // WAV header
    const wavHeader = Buffer.alloc(44)
    
    // WAV file header
    wavHeader.write('RIFF', 0)
    wavHeader.writeUInt32LE(36 + samples * 2, 4) // File size
    wavHeader.write('WAVE', 8)
    wavHeader.write('fmt ', 12)
    wavHeader.writeUInt32LE(16, 16) // Subchunk size
    wavHeader.writeUInt16LE(1, 20)  // Audio format (PCM)
    wavHeader.writeUInt16LE(1, 22)  // Channels (mono)
    wavHeader.writeUInt32LE(sampleRate, 24) // Sample rate
    wavHeader.writeUInt32LE(sampleRate * 2, 28) // Byte rate
    wavHeader.writeUInt16LE(2, 32)  // Block align
    wavHeader.writeUInt16LE(16, 34) // Bits per sample
    wavHeader.write('data', 36)
    wavHeader.writeUInt32LE(samples * 2, 40) // Data size
    
    // Audio data
    const audioData = Buffer.alloc(samples * 2) // 16-bit samples
    let frequency = 220 // Hz
    let phase = 0
    
    for (let i = 0; i < samples; i++) {
      // Modular frequência baseada no caractere do texto
      if (i % (sampleRate / 10) === 0) { // Mudar a cada 0.1s
        const charIndex = Math.floor((i / samples) * text.length)
        const char = text.charCodeAt(charIndex) || 65
        frequency = 200 + (char % 300) // 200-500 Hz
      }
      
      // Gerar onda senoidal com envelope
      const envelope = Math.sin((i / samples) * Math.PI) * 0.3 // Fade in/out
      const sample = Math.sin(phase) * envelope * 16383
      
      audioData.writeInt16LE(Math.floor(sample), i * 2)
      
      phase += (2 * Math.PI * frequency) / sampleRate
      if (phase > 2 * Math.PI) phase -= 2 * Math.PI
    }
    
    return Buffer.concat([wavHeader, audioData])
  }
}
