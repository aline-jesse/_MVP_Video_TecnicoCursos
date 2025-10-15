import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { slides, config } = await request.json()

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json({ error: 'Slides são obrigatórios' }, { status: 400 })
    }

    // Simular criação de projeto de vídeo
    const projectId = `pptx_project_${Date.now()}`
    
    // Converter slides PPTX para timeline de vídeo
    const timeline = {
      totalDuration: slides.reduce((total: number, slide: any) => total + (slide.duration || 5), 0),
      scenes: slides.map((slide: any, index: number) => ({
        id: `scene_${index + 1}`,
        slideId: slide.id,
        title: slide.title,
        content: slide.content,
        duration: slide.duration || 5,
        transition: slide.transition || 'fade',
        background: slide.imageUrl || '#ffffff',
        elements: [
          {
            type: 'text',
            content: slide.title,
            position: { x: 50, y: 20 },
            size: { width: 80, height: 15 },
            style: {
              fontSize: 32,
              fontWeight: 'bold',
              color: '#333333',
              textAlign: 'center'
            }
          },
          {
            type: 'text',
            content: slide.content,
            position: { x: 10, y: 40 },
            size: { width: 80, height: 50 },
            style: {
              fontSize: 18,
              color: '#666666',
              textAlign: 'left'
            }
          }
        ],
        audio: slide.narrationText ? {
          narration: null, // Será preenchido pelo TTS
          narrationText: slide.narrationText,
          backgroundMusic: null,
          volume: 0.8
        } : undefined
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        timeline,
        status: 'ready',
        totalSlides: slides.length,
        estimatedRenderTime: Math.ceil(timeline.totalDuration * 0.3), // 30% do tempo do vídeo
        config: {
          width: config?.width || 1920,
          height: config?.height || 1080,
          fps: config?.fps || 30,
          quality: config?.quality || 'high',
          format: config?.format || 'mp4'
        }
      }
    })

  } catch (error) {
    console.error('PPTX to Video Error:', error)
    return NextResponse.json(
      { error: 'Erro ao converter PPTX para vídeo' },
      { status: 500 }
    )
  }
}