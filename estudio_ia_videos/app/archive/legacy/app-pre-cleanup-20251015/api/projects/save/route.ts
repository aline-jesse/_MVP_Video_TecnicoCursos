
import { NextRequest, NextResponse } from 'next/server'

/**
 * 💾 API para salvar projetos do editor Animaker
 * Persistência de projetos com dados completos
 */

export async function POST(request: NextRequest) {
  try {
    const { project } = await request.json()
    
    if (!project) {
      return NextResponse.json(
        { error: 'Dados do projeto não fornecidos' },
        { status: 400 }
      )
    }

    // Validar estrutura básica do projeto
    if (!project.id || !project.title || !project.slides) {
      return NextResponse.json(
        { error: 'Estrutura de projeto inválida' },
        { status: 400 }
      )
    }

    console.log(`💾 Salvando projeto: ${project.title}`)
    console.log(`📊 ${project.slides.length} slides, ${project.timeline.totalDuration}s`)
    
    // Em produção, salvar no banco de dados
    // const savedProject = await db.projects.upsert({
    //   where: { id: project.id },
    //   update: {
    //     ...project,
    //     updatedAt: new Date()
    //   },
    //   create: {
    //     ...project,
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   }
    // })
    
    // Mock: Simular salvamento
    const savedProject = {
      ...project,
      metadata: {
        ...project.metadata,
        modified: new Date().toISOString()
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Projeto salvo com sucesso!',
      data: {
        project: savedProject,
        savedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao salvar projeto:', error)
    
    return NextResponse.json(
      {
        error: 'Erro interno ao salvar projeto',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Projects Save API',
    version: '1.0',
    endpoints: {
      save: 'POST /api/projects/save - Salvar projeto completo'
    }
  })
}
