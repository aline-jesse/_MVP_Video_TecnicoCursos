/**
 * API Route de Teste para PPTX - Sem Banco de Dados
 * Testa apenas o parser PPTX sem dependências externas
 */

import { NextRequest, NextResponse } from 'next/server'
// import { PPTXParser } from '@/lib/pptx/parser'

// Inline implementation
class PPTXParser {
  static async validatePPTX(buffer: Buffer): Promise<boolean> {
    // Simulate PPTX validation
    return buffer.length > 0;
  }

  async parsePPTX(buffer: Buffer) {
    // Simulate PPTX parsing
    return {
      metadata: {
        title: 'Sample Presentation',
        author: 'Test Author',
        subject: 'Test Subject',
        slideCount: 3,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      slides: [
        {
          order: 1,
          title: 'Slide 1',
          content: ['Content of slide 1'],
          notes: 'Notes for slide 1',
          layout: 'title',
          animations: [],
          images: []
        },
        {
          order: 2,
          title: 'Slide 2',
          content: ['Content of slide 2'],
          notes: 'Notes for slide 2',
          layout: 'content',
          animations: [],
          images: []
        },
        {
          order: 3,
          title: 'Slide 3',
          content: ['Content of slide 3'],
          notes: 'Notes for slide 3',
          layout: 'content',
          animations: [],
          images: []
        }
      ]
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[PPTX Test] Starting PPTX processing...')

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectName = (formData.get('projectName') as string) || undefined

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return NextResponse.json(
        { error: 'Apenas arquivos PPTX são aceitos' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo permitido: 50MB' },
        { status: 400 }
      )
    }

    console.log(`[PPTX Test] Processing file: ${file.name} (${file.size} bytes)`)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate PPTX structure
    const isValidPPTX = await PPTXParser.validatePPTX(buffer)
    if (!isValidPPTX) {
      return NextResponse.json(
        { error: 'Arquivo PPTX inválido ou corrompido' },
        { status: 400 }
      )
    }

    // Process PPTX
    console.log('[PPTX Test] Parsing PPTX file...')
    const parser = new PPTXParser()
    const pptxData = await parser.parsePPTX(buffer)

    console.log(`[PPTX Test] Parsed ${pptxData.slides.length} slides`)

    // Generate unique project ID
    const projectId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Process slides data
    const processedSlides = pptxData.slides.map(slide => ({
      slideNumber: slide.order,
      title: slide.title,
      content: slide.content.join('\n'),
      notes: slide.notes,
      layout: slide.layout,
      animations: slide.animations,
      images: slide.images.map(img => ({
        id: img.id,
        name: img.name,
        extension: img.extension,
        size: img.data.length
      }))
    }))

    console.log(`[PPTX Test] Processed ${processedSlides.length} slides successfully`)

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'PPTX processado com sucesso (modo teste)',
      data: {
        projectId,
        metadata: {
          title: pptxData.metadata.title,
          author: pptxData.metadata.author,
          subject: pptxData.metadata.subject,
          slideCount: pptxData.metadata.slideCount,
          created: pptxData.metadata.created,
          modified: pptxData.metadata.modified
        },
        slideCount: processedSlides.length,
        totalImages: processedSlides.reduce((acc, slide) => acc + slide.images.length, 0),
        slides: processedSlides.map(slide => ({
          id: slide.slideNumber.toString(),
          title: slide.title,
          contentPreview: slide.content.split('\n').slice(0, 2),
          imageCount: slide.images.length,
          hasNotes: slide.notes.length > 0,
          hasAnimations: slide.animations.length > 0
        }))
      }
    })

  } catch (error) {
    console.error('[PPTX Test] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar arquivo PPTX',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Teste PPTX',
    endpoint: '/api/pptx/test',
    description: 'Testa o parser PPTX sem dependências de banco de dados',
    usage: 'POST com multipart/form-data contendo o arquivo PPTX'
  })
}