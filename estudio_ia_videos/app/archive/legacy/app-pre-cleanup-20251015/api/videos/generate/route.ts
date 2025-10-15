
import { NextRequest, NextResponse } from 'next/server'
import { AIVideoService, SlideData, VideoConfig } from '../../../../lib/ai-services'

export async function POST(request: NextRequest) {
  try {
    const { slides, config }: { slides: SlideData[], config: VideoConfig } = await request.json()
    
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'Slides são obrigatórios' },
        { status: 400 }
      )
    }

    // Processar slides e gerar vídeos
    const processedSlides = await AIVideoService.processSlides(slides, config)
    
    // Para o MVP, simulamos a geração do vídeo final
    const finalVideo = await AIVideoService.generateAvatarVideo(
      slides.map(slide => `${slide.title}. ${slide.content}`).join(' '),
      config
    )

    // Simular salvamento no banco de dados
    const videoProject = {
      id: `project_${Date.now()}`,
      name: `Vídeo NR-12 - ${new Date().toLocaleDateString('pt-BR')}`,
      slides: processedSlides,
      config,
      finalVideo,
      status: 'completed',
      createdAt: new Date().toISOString(),
      totalDuration: slides.reduce((sum, slide) => sum + slide.duration, 0)
    }

    return NextResponse.json({
      success: true,
      project: videoProject,
      message: 'Vídeo gerado com sucesso!'
    })

  } catch (error) {
    console.error('Erro na geração de vídeo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
