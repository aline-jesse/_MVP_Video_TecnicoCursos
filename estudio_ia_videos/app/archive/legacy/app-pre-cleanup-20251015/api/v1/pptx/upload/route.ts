
/**
 * 📤 API: Upload PPTX Funcional
 * 
 * Endpoint melhorado para upload, validação e processamento de arquivos PPTX
 * Integra com processador real e TTS service
 */

import { NextRequest, NextResponse } from 'next/server'
import { processPPTXFile, validatePPTXFile } from '@/lib/pptx-processor'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = path.join(process.cwd(), 'temp', 'uploads')

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [PPTX Upload API] Iniciando upload...')

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectName = formData.get('projectName') as string || 'Projeto sem nome'
    
    // Validações de entrada
    if (!file) {
      console.log('❌ [PPTX Upload API] Nenhum arquivo enviado')
      return NextResponse.json({ 
        success: false,
        error: 'Nenhum arquivo enviado' 
      }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pptx')) {
      console.log('❌ [PPTX Upload API] Formato inválido:', file.name)
      return NextResponse.json({ 
        success: false,
        error: 'Apenas arquivos PPTX são aceitos' 
      }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      console.log('❌ [PPTX Upload API] Arquivo muito grande:', file.size)
      return NextResponse.json({ 
        success: false,
        error: 'Arquivo muito grande (máximo 50MB)' 
      }, { status: 400 })
    }

    console.log(`📁 [PPTX Upload API] Arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Criar diretório de upload se não existir
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Salvar arquivo temporário
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    
    await writeFile(filePath, buffer)
    console.log(`💾 [PPTX Upload API] Arquivo salvo: ${filePath}`)

    // Validar arquivo PPTX
    console.log('🔍 [PPTX Upload API] Validando arquivo...')
    const validation = await validatePPTXFile(filePath)
    if (!validation.valid) {
      // Remover arquivo inválido
      const fs = await import('fs')
      fs.unlinkSync(filePath)
      console.log('❌ [PPTX Upload API] Validação falhou:', validation.error)
      return NextResponse.json({ 
        success: false, 
        error: validation.error 
      }, { status: 400 })
    }

    // Processar PPTX
    console.log('⚙️ [PPTX Upload API] Processando slides...')
    const result = await processPPTXFile(filePath, file.name)
    
    if (!result.success) {
      // Remover arquivo se processamento falhou
      const fs = await import('fs')
      fs.unlinkSync(filePath)
      console.log('❌ [PPTX Upload API] Processamento falhou:', result.error)
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

    console.log(`✅ [PPTX Upload API] Processamento concluído: ${result.slides.length} slides`)

    // Preparar resposta completa
    const response = {
      success: true,
      projectId: `pptx_${timestamp}`,
      projectName,
      filename: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      metadata: result.metadata,
      slides: result.slides,
      thumbnails: result.thumbnails,
      totalSlides: result.slides.length,
      estimatedDuration: result.slides.reduce((total, slide) => total + slide.duration, 0),
      processingTime: Date.now() - timestamp
    }

    // Limpar arquivo temporário após processamento
    const fs = await import('fs')
    try {
      fs.unlinkSync(filePath)
    } catch (error) {
      console.warn('⚠️ [PPTX Upload API] Erro ao limpar arquivo temporário:', error)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ [PPTX Upload API] Erro interno:', error)
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'test') {
    return NextResponse.json({
      success: true,
      message: 'API de upload PPTX funcionando corretamente',
      timestamp: new Date().toISOString(),
      version: 'v1.0',
      maxFileSize: '50MB',
      supportedFormats: ['.pptx'],
      features: [
        'Validação completa de arquivos',
        'Extração de slides e conteúdo',
        'Processamento de metadados',
        'Geração de thumbnails',
        'Logs detalhados',
        'Cleanup automático'
      ]
    })
  }

  return NextResponse.json({ 
    success: false,
    error: 'Método não suportado. Use POST para upload.' 
  }, { status: 405 })
}

