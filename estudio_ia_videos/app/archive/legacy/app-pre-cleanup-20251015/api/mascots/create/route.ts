

import { NextRequest, NextResponse } from 'next/server'
import { MascotSystem } from '../../../../lib/mascots/mascot-system'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';
// GET /api/mascots/create - Listar templates de mascotes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const industry = searchParams.get('industry')

    let templates = MascotSystem.MASCOT_TEMPLATES

    // Filtrar por indústria
    if (industry && industry !== 'all') {
      templates = MascotSystem.getRecommendedMascots(industry)
    }

    return NextResponse.json({
      success: true,
      data: templates,
      total: templates.length,
      industries: ['industrial', 'corporativo', 'educacional', 'saude', 'tecnologia', 'geral']
    })

  } catch (error) {
    console.error('Erro ao buscar templates de mascotes:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/mascots/create - Criar mascote personalizado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, customization, generate_custom } = body

    let mascot

    if (generate_custom) {
      // Gerar mascote personalizado com IA
      const { requirements } = body
      
      if (!requirements) {
        return NextResponse.json(
          { success: false, error: 'Requisitos para geração customizada são obrigatórios' },
          { status: 400 }
        )
      }

      mascot = await MascotSystem.generateCustomMascot(requirements)
    } else {
      // Usar template existente com customização
      const template = MascotSystem.MASCOT_TEMPLATES.find(t => t.id === template_id)
      
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template de mascote não encontrado' },
          { status: 404 }
        )
      }

      mascot = {
        ...template,
        id: `${template.id}-custom-${Date.now()}`,
        name: customization.personality?.name || template.name,
        customization
      }
    }

    return NextResponse.json({
      success: true,
      data: mascot,
      message: 'Mascote criado com sucesso',
      preview_url: `/api/mascots/preview/${mascot.id}`
    })

  } catch (error) {
    console.error('Erro ao criar mascote:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

