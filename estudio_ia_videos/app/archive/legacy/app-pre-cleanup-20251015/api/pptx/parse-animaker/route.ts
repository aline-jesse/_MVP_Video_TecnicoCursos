
import { NextRequest, NextResponse } from 'next/server'
import { PPTXParserAnimaker } from '@/lib/pptx-parser-animaker'

/**
 * 🔧 API para parsing PPTX estilo Animaker
 * Converte PPTX em projeto editável com elementos interativos
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando parsing PPTX Animaker...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!file.name.endsWith('.pptx') && !file.name.endsWith('.ppt')) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use .pptx ou .ppt' },
        { status: 400 }
      )
    }

    // Validar tamanho (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 100MB' },
        { status: 400 }
      )
    }

    console.log(`📁 Processando: ${file.name} (${file.size} bytes)`)
    
    // Converter para buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Processar com parser Animaker
    const startTime = Date.now()
    const project = await PPTXParserAnimaker.parseBuffer(buffer, file.name)
    const processingTime = Date.now() - startTime
    
    console.log(`✅ Parsing concluído em ${processingTime}ms`)
    console.log(`📊 Resultado: ${project.slides.length} slides, ${project.assets.images.length} imagens`)
    
    return NextResponse.json({
      success: true,
      message: '🎉 Parsing PPTX concluído com sucesso!',
      data: {
        project,
        stats: {
          fileName: file.name,
          fileSize: file.size,
          processingTime,
          slidesCount: project.slides.length,
          elementsCount: project.slides.reduce((acc, slide) => acc + slide.elements.length, 0),
          imagesCount: project.assets.images.length,
          totalDuration: project.timeline.totalDuration
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no parsing PPTX:', error)
    
    return NextResponse.json(
      {
        error: 'Erro interno no parsing PPTX',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PPTX Parser Animaker API',
    version: '1.0',
    endpoints: {
      parse: 'POST /api/pptx/parse-animaker - Upload e parse de arquivo PPTX'
    },
    supportedFormats: ['.pptx', '.ppt'],
    maxFileSize: '100MB',
    features: [
      'Extração de elementos interativos',
      'Timeline multicamadas',
      'Preservação de posicionamento',
      'Animações e transições',
      'Assets organizados',
      'Metadados completos'
    ]
  })
}
