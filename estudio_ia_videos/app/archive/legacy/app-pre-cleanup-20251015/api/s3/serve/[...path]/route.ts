
/**
 * 🗂️ S3 File Serving API
 * Serve arquivos do S3 com cache e otimizações
 */

import { NextRequest, NextResponse } from 'next/server'
import { S3StorageService } from '@/lib/s3-storage'
import { MetricsService } from '@/lib/metrics-service'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const startTime = Date.now()
  
  try {
    const filePath = params.path.join('/')
    const decodedPath = decodeURIComponent(filePath)
    
    console.log(`📁 Servindo arquivo S3: ${decodedPath}`)
    
    // Verificar se arquivo existe no S3
    const exists = await S3StorageService.fileExists(decodedPath)
    
    if (!exists) {
      console.log(`❌ Arquivo não encontrado: ${decodedPath}`)
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Download do S3
    const downloadResult = await S3StorageService.downloadFile(decodedPath)
    
    if (!downloadResult.success || !downloadResult.buffer) {
      console.error('❌ Erro no download:', downloadResult.error)
      return new NextResponse('Error downloading file', { status: 500 })
    }
    
    // Headers apropriados
    const headers = new Headers()
    headers.set('Content-Type', downloadResult.contentType || 'application/octet-stream')
    headers.set('Content-Length', downloadResult.buffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=3600, immutable')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Accept-Ranges', 'bytes')
    
    // Adicionar headers específicos para vídeos
    if (downloadResult.contentType?.startsWith('video/')) {
      headers.set('Content-Disposition', `inline; filename="${decodedPath.split('/').pop()}"`)
    }
    
    // Registrar métricas
    MetricsService.recordStorageMetrics({
      operation: 'download',
      fileType: getFileType(downloadResult.contentType),
      fileSize: downloadResult.buffer.length,
      success: true,
      processingTime: Date.now() - startTime
    })
    
    console.log(`✅ Arquivo servido: ${decodedPath} (${downloadResult.buffer.length} bytes)`)
    
    return new NextResponse(downloadResult.buffer, { headers })
    
  } catch (error) {
    console.error('❌ Erro ao servir arquivo S3:', error)
    
    MetricsService.recordStorageMetrics({
      operation: 'download',
      fileType: 'image',
      fileSize: 0,
      success: false,
      processingTime: Date.now() - startTime
    })
    
    return new NextResponse('Internal server error', { status: 500 })
  }
}

// URL assinada para acesso temporário
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { expiresIn = 3600 } = await request.json()
    const filePath = params.path.join('/')
    const decodedPath = decodeURIComponent(filePath)
    
    console.log(`🔗 Gerando URL assinada: ${decodedPath}`)
    
    const signedUrl = await S3StorageService.getSignedUrl(decodedPath, expiresIn)
    
    if (!signedUrl) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresIn,
      path: decodedPath
    })
    
  } catch (error) {
    console.error('❌ Erro ao gerar URL assinada:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Determinar tipo de arquivo baseado no Content-Type
function getFileType(contentType?: string): 'audio' | 'video' | 'image' {
  if (!contentType) return 'image' // fallback
  
  if (contentType.startsWith('audio/')) return 'audio'
  if (contentType.startsWith('video/')) return 'video'
  if (contentType.startsWith('image/')) return 'image'
  
  return 'image' // fallback
}
