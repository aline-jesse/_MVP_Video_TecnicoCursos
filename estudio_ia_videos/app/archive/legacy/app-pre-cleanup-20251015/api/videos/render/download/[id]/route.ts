import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/videos/render/download/[id]
 * Download do vídeo renderizado
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o job existe e está completo
    const mockProgress = Math.min(100, Math.floor((Date.now() % 60000) / 600))
    const isCompleted = mockProgress >= 95 || force

    if (!isCompleted) {
      return NextResponse.json(
        { 
          error: 'Vídeo ainda não está pronto para download',
          status: 'processing',
          progress: mockProgress,
          message: 'Aguarde a conclusão da renderização'
        },
        { status: 400 }
      )
    }

    // Mock: Simular conteúdo de vídeo
    const mockVideoContent = Buffer.from(`
      Mock Video Content for Job: ${jobId}
      
      Este seria o conteúdo binário do vídeo MP4 renderizado.
      Em produção, aqui seria retornado o arquivo real do vídeo.
      
      Projeto: NR-12 Segurança
      Formato: MP4
      Resolução: 1080p
      Duração: 30 segundos
      
      Gerado em: ${new Date().toISOString()}
    `)

    // Retornar o "vídeo" como download
    return new NextResponse(mockVideoContent, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="nr12-safety-training-${jobId}.mp4"`,
        'Content-Length': mockVideoContent.length.toString(),
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Erro ao fazer download do vídeo:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno no download',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}