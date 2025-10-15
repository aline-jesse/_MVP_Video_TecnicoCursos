
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { vidnozAvatarEngine } from '@/lib/vidnoz-avatar-engine'

/**
 * 📊 API para verificar status do job de renderização
 * GET /api/avatars/hyperreal/status/[jobId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID é obrigatório' },
        { status: 400 }
      )
    }

    const job = await vidnozAvatarEngine.getJobStatus(jobId)

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)

  } catch (error) {
    console.error('Erro ao verificar status do job:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * ❌ Cancelar job de renderização
 * DELETE /api/avatars/hyperreal/status/[jobId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID é obrigatório' },
        { status: 400 }
      )
    }

    const cancelled = await vidnozAvatarEngine.cancelJob(jobId)

    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Não foi possível cancelar o job' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancelado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao cancelar job:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
