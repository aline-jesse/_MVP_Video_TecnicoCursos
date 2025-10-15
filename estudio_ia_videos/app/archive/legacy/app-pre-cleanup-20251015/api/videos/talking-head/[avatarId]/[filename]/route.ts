
/**
 * 🎬 API para Servir Vídeos Talking Head
 * Serve arquivos de vídeo gerados pelos avatares
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { avatarId: string; filename: string } }
) {
  try {
    const { avatarId, filename } = params
    
    console.log(`🎬 Servindo vídeo talking head: ${avatarId}/${filename}`)
    
    if (!filename || !filename.match(/\.(mp4|webm|mov|avi)$/)) {
      console.error(`❌ Formato de vídeo inválido: ${filename}`)
      return new NextResponse('Invalid video file', { status: 400 })
    }

    if (!avatarId || avatarId.length < 3) {
      console.error(`❌ Avatar ID inválido: ${avatarId}`)
      return new NextResponse('Invalid avatar ID', { status: 400 })
    }

    // Primeiro, tentar buscar no cache
    const { VideoCache } = await import('@/lib/video-cache')
    const videoKey = `${avatarId}/${filename}`
    const cached = VideoCache.get(videoKey)
    
    if (cached) {
      console.log(`✅ Vídeo encontrado no cache: ${videoKey} (${cached.buffer.length} bytes)`)
      
      // Headers apropriados para vídeo
      const headers = new Headers()
      headers.set('Content-Type', cached.contentType)
      headers.set('Content-Length', cached.buffer.length.toString())
      headers.set('Cache-Control', 'public, max-age=600') // Cache por 10 minutos
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('Accept-Ranges', 'bytes')
      
      return new NextResponse(cached.buffer, { headers })
    }

    // Se não encontrado no cache, gerar vídeo placeholder
    console.log(`🔄 Gerando vídeo placeholder: ${avatarId}/${filename}`)
    const videoBuffer = generatePlaceholderVideo(avatarId, filename)
    console.log(`✅ Buffer gerado: ${videoBuffer.length} bytes`)
    
    // Salvar no cache
    const contentType = filename.endsWith('.webm') ? 'video/webm' : 'video/mp4'
    VideoCache.store(videoKey, videoBuffer, contentType, 3000) // 3 segundos de duração padrão
    
    // Headers apropriados para vídeo
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', videoBuffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=600')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Accept-Ranges', 'bytes')
    
    return new NextResponse(videoBuffer, { headers })
    
  } catch (error) {
    console.error('❌ Erro ao servir vídeo:', error)
    return new NextResponse('Error serving video file', { status: 500 })
  }
}

// Gerar vídeo placeholder para demonstração
function generatePlaceholderVideo(avatarId: string, filename: string): Buffer {
  // Para MVP, retornar um MP4 header mínimo válido
  // Em produção, seria o vídeo real gerado com talking heads
  
  const mp4Header = Buffer.from([
    // ftyp box (file type)
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // box size + 'ftyp'
    0x69, 0x73, 0x6f, 0x6d, // major brand 'isom'
    0x00, 0x00, 0x02, 0x00, // minor version
    0x69, 0x73, 0x6f, 0x6d, // compatible brand 'isom'
    0x69, 0x73, 0x6f, 0x32, // compatible brand 'iso2'
    0x61, 0x76, 0x63, 0x31, // compatible brand 'avc1'
    0x6d, 0x70, 0x34, 0x31, // compatible brand 'mp41'
    
    // mdat box (media data) - placeholder
    0x00, 0x00, 0x10, 0x00, 0x6d, 0x64, 0x61, 0x74 // box size + 'mdat'
  ])

  // Gerar dados de vídeo simulados baseados no avatarId
  const dataSize = 4096 + (avatarId.length * 256) // Tamanho baseado no avatar
  const videoData = Buffer.alloc(dataSize)
  
  // Preencher com dados simulados que variam por avatar
  for (let i = 0; i < dataSize; i++) {
    const avatarHash = avatarId.charCodeAt(i % avatarId.length)
    const timeVariation = Math.sin(i / 100) * 127 + 128
    videoData[i] = (avatarHash + timeVariation + i) % 256
  }

  return Buffer.concat([mp4Header, videoData])
}
