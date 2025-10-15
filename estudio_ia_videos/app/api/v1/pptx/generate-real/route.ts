
/**
 * 🎨 API de Geração PPTX Real - Sistema Completo
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateRealPptxFromProject, RealPptxGenerator, PptxGenerationOptions } from '@/lib/pptx-real-generator'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, template, customOptions } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🎨 Iniciando geração PPTX real para projeto:', projectId)

    // Gerar PPTX real usando o sistema completo
    const result = await generateRealPptxFromProject(projectId, {
      template: template || 'corporate',
      ...customOptions
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro na geração PPTX' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      pptxUrl: result.pptxUrl,
      metadata: result.metadata,
      message: 'PPTX real gerado com sucesso!'
    })

  } catch (error) {
    console.error('❌ Erro na API de geração PPTX:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar status do projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        pptxUrl: true,
        status: true,
        processingLog: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    const processingLog = project.processingLog as any

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        hasPptx: !!project.pptxUrl,
        pptxUrl: project.pptxUrl,
        status: project.status,
        pptxGenerated: processingLog?.pptxGenerated || false,
        generatedAt: processingLog?.generatedAt
      }
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status PPTX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Endpoint para geração customizada de PPTX
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { slides, options } = body as { 
      slides: any[], 
      options: PptxGenerationOptions 
    }

    if (!slides || slides.length === 0) {
      return NextResponse.json(
        { error: 'Slides são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`🎨 Gerando PPTX customizado com ${slides.length} slides`)

    const generator = new RealPptxGenerator()
    const result = await generator.generateRealPptx({
      title: options.title || 'Apresentação Customizada',
      slides: slides,
      template: options.template || 'corporate',
      branding: options.branding,
      metadata: options.metadata || {
        author: 'Estúdio IA de Vídeos',
        subject: options.title || 'Apresentação Customizada'
      }
    })

    // Upload manual (já feito internamente na função)
    return NextResponse.json({
      success: true,
      filename: result.filename,
      slideCount: result.slideCount,
      fileSize: result.buffer.length,
      message: 'PPTX customizado gerado com sucesso!'
    })

  } catch (error) {
    console.error('❌ Erro na geração PPTX customizada:', error)
    return NextResponse.json(
      { 
        error: 'Erro na geração customizada',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
