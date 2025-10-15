

import { NextRequest, NextResponse } from 'next/server'
import { GenerativeAIAdvanced } from '../../../../lib/ai/generative-ai-advanced'

// POST /api/ai/generate-content - Gerar conteúdo com IA
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, input, style_preferences, output_format } = body

    // Validar entrada
    if (!type || !input) {
      return NextResponse.json(
        { success: false, error: 'Tipo e dados de entrada são obrigatórios' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'roteiro':
        result = await GenerativeAIAdvanced.generateTrainingScript({
          type,
          input,
          style_preferences: style_preferences || { tone: 'formal', complexity: 'intermediario', interactivity: 'media' },
          output_format: output_format || 'structured'
        })
        break

      case 'avatar_instructions':
        const { script_content, avatar_id, scene_context } = input
        result = await GenerativeAIAdvanced.generateAvatarInstructions(
          script_content,
          avatar_id,
          scene_context
        )
        break

      case 'compliance_check':
        const { content, nr_requirements } = input
        result = await GenerativeAIAdvanced.verifyCompliance(content, nr_requirements)
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de geração não suportado' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Conteúdo gerado com sucesso',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao gerar conteúdo com IA:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/ai/generate-content - Listar modelos disponíveis
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        models: [
          {
            id: 'gpt-4-turbo',
            name: 'GPT-4 Turbo',
            description: 'Modelo mais avançado para geração de conteúdo',
            capabilities: ['roteiro', 'avatar_instructions', 'compliance_check'],
            language_support: ['pt-BR'],
            pricing_tier: 'premium'
          },
          {
            id: 'abacus-ai-route',
            name: 'Abacus.AI RouteLLM',
            description: 'Conjunto de modelos especializados',
            capabilities: ['roteiro', 'avatar_instructions', 'quiz_generation'],
            language_support: ['pt-BR', 'en-US'],
            pricing_tier: 'standard'
          }
        ],
        content_types: [
          { id: 'roteiro', name: 'Roteiro de Treinamento', description: 'Geração automática de roteiros' },
          { id: 'avatar_instructions', name: 'Instruções de Avatar', description: 'Comandos para animação 3D' },
          { id: 'compliance_check', name: 'Verificação de Compliance', description: 'Análise de conformidade com NRs' },
          { id: 'quiz_generation', name: 'Geração de Quiz', description: 'Questões interativas automáticas' }
        ]
      }
    })

  } catch (error) {
    console.error('Erro ao listar modelos de IA:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

