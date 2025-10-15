
/**
 * GET /api/workflow/history?projectId=xxx
 * Histórico de revisões
 */

import { NextRequest, NextResponse } from 'next/server'
import { ReviewEngine } from '@/lib/workflow/review-engine'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId obrigatório' },
        { status: 400 }
      )
    }

    const history = await ReviewEngine.getReviewHistory(projectId)

    return NextResponse.json(history)
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    )
  }
}
