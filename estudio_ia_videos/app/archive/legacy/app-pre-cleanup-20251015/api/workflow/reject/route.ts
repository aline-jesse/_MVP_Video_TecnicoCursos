
/**
 * POST /api/workflow/reject
 * Reprovar projeto
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

    const { reviewRequestId, comments } = await request.json()

    if (!reviewRequestId || !comments) {
      return NextResponse.json(
        { error: 'reviewRequestId e comments obrigatórios' },
        { status: 400 }
      )
    }

    await ReviewEngine.reject(reviewRequestId, session.user.email, comments)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao reprovar:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao reprovar projeto' },
      { status: 500 }
    )
  }
}
