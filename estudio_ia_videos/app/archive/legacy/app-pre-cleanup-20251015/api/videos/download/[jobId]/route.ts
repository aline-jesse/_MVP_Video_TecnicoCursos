
/**
 * 🎬 API de Download de Vídeos
 * Endpoint para download de vídeos gerados
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * 📥 GET - Download de vídeo por job ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID é obrigatório'
      }, { status: 400 })
    }

    // Simular busca do vídeo (em produção, buscar no S3/storage)
    const videoUrl = `https://example.com/videos/${jobId}.mp4`
    
    // Em um ambiente real, você redirecionaria para o S3 ou faria stream do arquivo
    return NextResponse.json({
      success: true,
      download_url: videoUrl,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      file_info: {
        job_id: jobId,
        format: 'mp4',
        size: '125MB',
        resolution: '1920x1080',
        duration: '45s',
        quality: 'Premium'
      }
    })

  } catch (error) {
    console.error('Erro no download:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
