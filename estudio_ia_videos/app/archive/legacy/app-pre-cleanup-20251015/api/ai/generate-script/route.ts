

import { NextRequest, NextResponse } from 'next/server'
import { advancedAI } from '../../../../lib/advanced-ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { nr, topics, duration, audience, company_context } = body
    
    if (!nr || !topics || !duration || !audience) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: nr, topics, duration, audience' },
        { status: 400 }
      )
    }

    const script = await advancedAI.generateNRScript({
      nr,
      topics,
      duration: parseInt(duration),
      audience,
      company_context
    })

    return NextResponse.json({
      success: true,
      data: script
    })

  } catch (error) {
    console.error('Erro na geração de script:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar roteiro',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
