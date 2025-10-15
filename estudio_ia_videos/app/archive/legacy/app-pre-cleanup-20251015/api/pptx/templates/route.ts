import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'

/**
 * 🎨 PPTX Templates API - Biblioteca de Templates
 * Templates profissionais para diferentes tipos de treinamento
 */


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const templates = [
      {
        id: 'corporate_clean',
        name: 'Corporativo Limpo',
        description: 'Template minimalista para apresentações empresariais',
        category: 'Empresarial',
        premium: false,
        usage: 2847,
        rating: 4.8
      },
      {
        id: 'safety_industrial',
        name: 'Segurança Industrial',
        description: 'Especializado em treinamentos de segurança e NRs',
        category: 'Treinamento',
        premium: true,
        usage: 1563,
        rating: 4.9
      }
    ]

    return NextResponse.json({
      success: true,
      templates,
      categories: ['Empresarial', 'Treinamento', 'Tecnologia', 'Saúde']
    })

  } catch (error) {
    console.error('Error getting templates:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { action, templateId, projectId } = await request.json()

    switch (action) {
      case 'apply_template':
        return NextResponse.json({
          success: true,
          message: 'Template aplicado com sucesso',
          projectId,
          templateId
        })

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in templates API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}