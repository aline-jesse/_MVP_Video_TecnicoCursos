

/**
 * 📁 API para servir arquivos do cache local
 * Serve arquivos armazenados no cache de vídeo/áudio
 */

import { NextRequest, NextResponse } from 'next/server'
import { VideoCache } from '@/lib/video-cache'
import { AudioCache } from '@/lib/audio-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    if (!filename) {
      return new NextResponse('Filename required', { status: 400 })
    }

    console.log(`📁 Servindo arquivo do cache: ${filename}`)

    // Tentar primeiro no cache de vídeo
    let cached = VideoCache.get(filename)
    
    // Se não encontrar, tentar no cache de áudio
    if (!cached) {
      cached = AudioCache.get(filename)
    }

    if (!cached) {
      console.log(`❌ Arquivo não encontrado em nenhum cache: ${filename}`)
      return new NextResponse('File not found', { status: 404 })
    }

    // Determinar headers baseado no content type
    const headers = new Headers()
    headers.set('Content-Type', cached.contentType || 'application/octet-stream')
    headers.set('Content-Length', cached.buffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=300') // Cache por 5 minutos
    headers.set('Access-Control-Allow-Origin', '*')

    // Para arquivos de mídia, adicionar ranges support
    if (cached.contentType?.startsWith('video/') || cached.contentType?.startsWith('audio/')) {
      headers.set('Accept-Ranges', 'bytes')
    }

    console.log(`✅ Servindo ${filename} do cache (${cached.buffer.length} bytes)`)

    return new NextResponse(cached.buffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('❌ Erro ao servir arquivo do cache:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

