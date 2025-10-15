
/**
 * 📚 NR Templates API
 * 
 * Retorna todos os templates NR disponíveis
 */

import { NextRequest, NextResponse } from 'next/server'
import { NR_TEMPLATES } from '@/lib/templates/nr-templates-complete'
import { NR_TEMPLATES_EXPANDED } from '@/lib/templates/nr-templates-expanded'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nr = searchParams.get('nr')
  const category = searchParams.get('category')

  try {
    // Combinar templates originais + expandidos
    const allTemplates = [
      ...NR_TEMPLATES,
      ...NR_TEMPLATES_EXPANDED
    ]

    // Filtrar por NR específica
    let filteredTemplates = allTemplates
    if (nr) {
      filteredTemplates = allTemplates.filter(t => 
        t.nr.toLowerCase() === nr.toLowerCase()
      )
    }

    // Filtrar por categoria
    if (category) {
      filteredTemplates = filteredTemplates.filter(t =>
        t.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length,
      categories: Array.from(new Set(allTemplates.map(t => t.category))),
      nrs: Array.from(new Set(allTemplates.map(t => t.nr))).sort()
    })

  } catch (error: any) {
    console.error('Templates API error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar templates', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nr } = body

    if (!nr) {
      return NextResponse.json(
        { error: 'NR é obrigatória' },
        { status: 400 }
      )
    }

    const allTemplates = [
      ...NR_TEMPLATES,
      ...NR_TEMPLATES_EXPANDED
    ]

    const template = allTemplates.find(t => 
      t.nr.toLowerCase() === nr.toLowerCase()
    )

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })

  } catch (error: any) {
    console.error('Templates API error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar template', message: error.message },
      { status: 500 }
    )
  }
}
