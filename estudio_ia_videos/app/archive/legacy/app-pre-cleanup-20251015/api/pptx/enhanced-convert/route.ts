
import { NextRequest, NextResponse } from 'next/server'
import { PPTXConverter } from '../../../../lib/pptx-converter'
import { Analytics } from '../../../../lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    Analytics.pptxImportStarted(file.name, file.size)

    // Validar arquivo
    const isValid = PPTXConverter.validatePPTXFile(file.name, file.size)
    if (!isValid) {
      Analytics.pptxImportFailed(file.name, 'Arquivo inválido', Date.now() - startTime)
      return NextResponse.json(
        { error: 'Arquivo inválido. Apenas arquivos PPTX até 50MB são aceitos.' },
        { status: 400 }
      )
    }

    // Converter arquivo para buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Conversão avançada com extração melhorada
    const slides = await PPTXConverter.convertPPTXToSlides(buffer)
    
    // Processar cada slide para otimizar conteúdo
    const optimizedSlides = slides.map(slide => ({
      ...slide,
      // Limpar texto para TTS
      content: slide.content
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\.\,\!\?\-\(\)]/g, '')
        .trim(),
      // Estimar duração baseada no conteúdo
      duration: Math.max(10, Math.ceil(slide.content.length / 150) * 7) // ~150 chars por segundo + buffer
    }))
    
    // Gerar metadados melhorados
    const metadata = {
      ...PPTXConverter.generateFileMetadata(file.name, file.size),
      slidesCount: optimizedSlides.length,
      estimatedDuration: optimizedSlides.reduce((sum, slide) => sum + slide.duration, 0),
      averageSlideLength: Math.round(optimizedSlides.reduce((sum, slide) => sum + slide.content.length, 0) / optimizedSlides.length),
      processingTime: Date.now() - startTime
    }
    
    Analytics.pptxImportCompleted(file.name, optimizedSlides.length, metadata.processingTime)

    return NextResponse.json({
      success: true,
      slides: optimizedSlides,
      metadata,
      message: `${optimizedSlides.length} slides extraídos e otimizados com sucesso`
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('Erro no upload PPTX avançado:', error)
    
    Analytics.track('pptx_enhanced_conversion_failed', {
      error_message: errorMessage
    })

    return NextResponse.json(
      { error: 'Erro interno do servidor durante conversão avançada' },
      { status: 500 }
    )
  }
}
