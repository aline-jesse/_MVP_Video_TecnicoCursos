
/**
 * POST /api/workflow/publish
 * Publicar projeto
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

    const { projectId, overrideCompliance } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId obrigatório' },
        { status: 400 }
      )
    }

    await ReviewEngine.publish(
      projectId,
      session.user.email,
      overrideCompliance || false
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao publicar:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao publicar projeto' },
      { status: 400 }
    )
  }
}
