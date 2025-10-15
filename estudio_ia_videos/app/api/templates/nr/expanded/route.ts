
/**
 * API: Expanded NR Templates
 * Retorna todos os 15 templates NR (incluindo os 5 novos)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  NEW_NR_TEMPLATES,
  NR_TEMPLATES_METADATA
} from '@/lib/nr-templates/nr-7-9-11-13-15'

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category')
    const search = req.nextUrl.searchParams.get('search')
    const minDuration = req.nextUrl.searchParams.get('minDuration')
    const maxDuration = req.nextUrl.searchParams.get('maxDuration')

    let templates = NEW_NR_TEMPLATES

    // Filtrar por categoria
    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase()
      templates = templates.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.nr.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
      )
    }

    // Filtrar por duração
    if (minDuration) {
      templates = templates.filter(t => t.duration >= parseInt(minDuration))
    }
    if (maxDuration) {
      templates = templates.filter(t => t.duration <= parseInt(maxDuration))
    }

    return NextResponse.json({
      success: true,
      templates,
      metadata: NR_TEMPLATES_METADATA,
      total: templates.length,
      categories: NR_TEMPLATES_METADATA.categories,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao buscar templates NR expandidos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar templates' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { templateId, projectName, customizations } = body

    // Buscar template
    const template = NEW_NR_TEMPLATES.find(t => t.id === templateId)

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // Criar projeto a partir do template
    const newProject = {
      id: `project-${Date.now()}`,
      name: projectName || template.title,
      templateId,
      templateNR: template.nr,
      slides: template.slides,
      customizations,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Projeto criado com sucesso',
      project: newProject
    })
  } catch (error) {
    console.error('Erro ao criar projeto a partir do template:', error)
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    )
  }
}
