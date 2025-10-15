

/**
 * 🎭 API Mock para simular arquivos
 * Fallback quando nem S3 nem cache estão disponíveis
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    if (!filename) {
      return new NextResponse('Filename required', { status: 400 })
    }

    console.log(`🎭 Servindo arquivo mock: ${filename}`)

    // Determinar tipo de arquivo baseado na extensão
    const extension = filename.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    let mockData = ''

    switch (extension) {
      case 'pptx':
      case 'ppt':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        mockData = 'MOCK_PPTX_DATA_' + Date.now()
        break
      case 'pdf':
        contentType = 'application/pdf'
        mockData = 'MOCK_PDF_DATA_' + Date.now()
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        mockData = 'MOCK_IMAGE_DATA_' + Date.now()
        break
      case 'mp4':
        contentType = 'video/mp4'
        mockData = 'MOCK_VIDEO_DATA_' + Date.now()
        break
      case 'mp3':
        contentType = 'audio/mpeg'
        mockData = 'MOCK_AUDIO_DATA_' + Date.now()
        break
      default:
        mockData = 'MOCK_FILE_DATA_' + Date.now()
    }

    // Criar buffer mock
    const buffer = Buffer.from(mockData, 'utf-8')

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', buffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=60') // Cache por 1 minuto
    headers.set('X-Mock-File', 'true')
    headers.set('Access-Control-Allow-Origin', '*')

    console.log(`✅ Servindo arquivo mock ${filename} (${buffer.length} bytes)`)

    return new NextResponse(buffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('❌ Erro ao servir arquivo mock:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

