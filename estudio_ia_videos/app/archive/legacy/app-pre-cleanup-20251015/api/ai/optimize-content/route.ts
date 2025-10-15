

import { NextRequest, NextResponse } from 'next/server'
import { advancedAI } from '../../../../lib/advanced-ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { content, context } = body
    
    if (!content) {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    const optimizations = await advancedAI.optimizeContent(content, context || {})

    return NextResponse.json({
      success: true,
      data: {
        suggestions: optimizations,
        analysis: {
          content_length: content.length,
          estimated_improvements: optimizations.length,
          priority_items: optimizations.filter(s => s.priority === 'high').length
        }
      }
    })

  } catch (error) {
    console.error('Erro na otimização de conteúdo:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao otimizar conteúdo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
