
/**
 * 🖼️ API para Servir Thumbnails de Vídeo
 * Serve miniaturas dos vídeos gerados
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { avatarId: string; filename: string } }
) {
  try {
    const { avatarId, filename } = params
    
    console.log(`🖼️ Servindo thumbnail: ${avatarId}/${filename}`)
    
    if (!filename || !filename.match(/\.(jpg|jpeg|png|webp)$/)) {
      console.error(`❌ Formato de imagem inválido: ${filename}`)
      return new NextResponse('Invalid image file', { status: 400 })
    }

    if (!avatarId || avatarId.length < 3) {
      console.error(`❌ Avatar ID inválido: ${avatarId}`)
      return new NextResponse('Invalid avatar ID', { status: 400 })
    }

    // Primeiro, tentar buscar no cache
    const { VideoCache } = await import('@/lib/video-cache')
    const thumbnailKey = `${avatarId}/${filename}`
    const cached = VideoCache.get(thumbnailKey)
    
    if (cached) {
      console.log(`✅ Thumbnail encontrado no cache: ${thumbnailKey} (${cached.buffer.length} bytes)`)
      
      // Headers apropriados para imagem
      const headers = new Headers()
      headers.set('Content-Type', cached.contentType)
      headers.set('Content-Length', cached.buffer.length.toString())
      headers.set('Cache-Control', 'public, max-age=1200') // Cache por 20 minutos
      headers.set('Access-Control-Allow-Origin', '*')
      
      return new NextResponse(cached.buffer, { headers })
    }

    // Se não encontrado no cache, gerar thumbnail placeholder
    console.log(`🔄 Gerando thumbnail placeholder: ${avatarId}/${filename}`)
    const imageBuffer = generatePlaceholderThumbnail(avatarId, filename)
    console.log(`✅ Buffer gerado: ${imageBuffer.length} bytes`)
    
    // Salvar no cache
    const contentType = filename.endsWith('.png') ? 'image/png' : 
                       filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
    VideoCache.store(thumbnailKey, imageBuffer, contentType, 0)
    
    // Headers apropriados para imagem
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', imageBuffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=1200')
    headers.set('Access-Control-Allow-Origin', '*')
    
    return new NextResponse(imageBuffer, { headers })
    
  } catch (error) {
    console.error('❌ Erro ao servir thumbnail:', error)
    return new NextResponse('Error serving thumbnail', { status: 500 })
  }
}

// Gerar thumbnail placeholder
function generatePlaceholderThumbnail(avatarId: string, filename: string): Buffer {
  // Para MVP, gerar uma imagem JPEG simples (1x1 pixel colorido)
  // Em produção, seria o thumbnail real do vídeo gerado
  
  // JPEG header mínimo para 1x1 pixel
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xDB, 0x00, 0x43, 0x01, 0x09, 0x09,
    0x09, 0x0C, 0x0B, 0x0C, 0x18, 0x0D, 0x0D, 0x18, 0x32, 0x21, 0x1C, 0x21,
    0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32,
    0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32,
    0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32,
    0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32,
    0x32, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01,
    0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00,
    0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10,
    0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00,
    0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00
  ])

  // Cor baseada no avatarId (para distinguir thumbnails)
  const avatarHash = avatarId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colorByte = (avatarHash % 200) + 55 // Garantir cores visíveis
  
  const jpegData = Buffer.from([colorByte, 0xFF, 0xD9]) // Pixel + fim do JPEG
  
  return Buffer.concat([jpegHeader, jpegData])
}
