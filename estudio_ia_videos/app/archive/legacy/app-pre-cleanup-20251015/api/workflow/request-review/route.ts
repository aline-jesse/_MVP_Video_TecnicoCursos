
/**
 * POST /api/workflow/request-review
 * Solicitar revisão de projeto
 */

import { NextRequest, NextResponse } from 'next/server'
import { ReviewEngine } from '@/lib/workflow/review-engine'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { projectId, reviewers, message } = await request.json()

    if (!projectId || !reviewers || reviewers.length === 0) {
      return NextResponse.json(
        { error: 'projectId e reviewers obrigatórios' },
        { status: 400 }
      )
    }

    const reviewRequest = await ReviewEngine.requestReview(
      projectId,
      session.user.email,
      reviewers,
      message
    )

    return NextResponse.json(reviewRequest)
  } catch (error) {
    console.error('Erro ao solicitar revisão:', error)
    return NextResponse.json(
      { error: 'Erro ao solicitar revisão' },
      { status: 500 }
    )
  }
}
