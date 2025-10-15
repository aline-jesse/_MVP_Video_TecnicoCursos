
/**
 * 🎬 API para Servir Vídeos Fallback
 * Serve vídeos de fallback quando há erro na geração
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    if (!filename || !filename.match(/\.(mp4|webm)$/)) {
      return new NextResponse('Invalid video file', { status: 400 })
    }

    console.log(`Serving fallback video: ${filename}`)
    
    // Gerar vídeo de fallback
    const videoBuffer = generateFallbackVideo()
    
    // Headers
    const headers = new Headers()
    headers.set('Content-Type', 'video/mp4')
    headers.set('Content-Length', videoBuffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=1800') // Cache por 30 min
    headers.set('Access-Control-Allow-Origin', '*')
    
    return new NextResponse(videoBuffer, { headers })
    
  } catch (error) {
    console.error('Error serving fallback video:', error)
    return new NextResponse('Error serving video', { status: 500 })
  }
}

function generateFallbackVideo(): Buffer {
  // MP4 básico de fallback
  return Buffer.from([
    // ftyp
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
    0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
    0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31,
    // mdat mínimo
    0x00, 0x00, 0x00, 0x08, 0x6d, 0x64, 0x61, 0x74
  ])
}
