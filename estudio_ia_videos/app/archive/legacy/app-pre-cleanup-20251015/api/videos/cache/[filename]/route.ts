
/**
 * 🎬 Video Cache Serving API
 * Serve vídeos do cache local quando S3 não está disponível
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    console.log(`🎬 Servindo vídeo do cache: ${filename}`)
    
    if (!filename || !filename.match(/\.(mp4|webm|mov|avi|jpg|jpeg|png|webp)$/)) {
      console.error(`❌ Formato de arquivo inválido: ${filename}`)
      return new NextResponse('Invalid file format', { status: 400 })
    }

    // Buscar no cache de vídeo
    const { VideoCache } = await import('@/lib/video-cache')
    const cached = VideoCache.get(filename)
    
    if (!cached) {
      console.log(`❌ Arquivo não encontrado no cache: ${filename}`)
      return new NextResponse('File not found', { status: 404 })
    }

    console.log(`✅ Arquivo encontrado no cache: ${filename} (${cached.buffer.length} bytes)`)
    
    // Headers apropriados
    const headers = new Headers()
    headers.set('Content-Type', cached.contentType)
    headers.set('Content-Length', cached.buffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=300') // Cache por 5 minutos
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Accept-Ranges', 'bytes')
    
    // Para vídeos, adicionar header de disposição
    if (cached.contentType.startsWith('video/')) {
      headers.set('Content-Disposition', `inline; filename="${filename}"`)
    }
    
    return new NextResponse(cached.buffer, { headers })
    
  } catch (error) {
    console.error('❌ Erro ao servir arquivo do cache:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
