
/**
 * ✅ API de Aprovação de Checkpoints
 * Aprova etapas específicas do pipeline de avatar
 */

import { NextRequest, NextResponse } from 'next/server'
import { avatar3DHyperOrchestrator } from '@/lib/orchestrator/avatar-3d-hyperreal-orchestrator'

export const dynamic = 'force-dynamic'

/**
 * ✅ POST - Aprovar checkpoint específico
 */
export async function POST(request: NextRequest) {
  try {
    const { job_id, stage, approve } = await request.json()

    if (!job_id || !stage || typeof approve !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'job_id, stage e approve são obrigatórios'
      }, { status: 400 })
    }

    if (!approve) {
      return NextResponse.json({
        success: false,
        message: 'Checkpoint rejeitado. Ajuste os parâmetros e tente novamente.'
      })
    }

    const approved = await avatar3DHyperOrchestrator.approveCheckpoint(job_id, stage)

    if (!approved) {
      return NextResponse.json({
        success: false,
        error: 'Não foi possível aprovar o checkpoint. Verifique o job_id e stage.'
      }, { status: 400 })
    }

    // Obter status atualizado
    const updatedStatus = await avatar3DHyperOrchestrator.getJobStatus(job_id)

    return NextResponse.json({
      success: true,
      message: `Checkpoint '${stage}' aprovado com sucesso`,
      job_status: updatedStatus
    })

  } catch (error) {
    console.error('Erro na aprovação:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
