
/**
 * 🎭 API do Orquestrador de Avatar 3D Hiper-Realista
 * Endpoint principal para criação de avatares com pipeline completo
 */

import { NextRequest, NextResponse } from 'next/server'
import { avatar3DHyperOrchestrator, type OrchestratorPayload } from '@/lib/orchestrator/avatar-3d-hyperreal-orchestrator'

export const dynamic = 'force-dynamic'

/**
 * 🚀 POST - Iniciar job de criação de avatar hiper-realista
 */
export async function POST(request: NextRequest) {
  try {
    const payload: OrchestratorPayload = await request.json()

    // Validação básica
    if (!payload.job_id) {
      return NextResponse.json({
        success: false,
        error: 'job_id é obrigatório'
      }, { status: 400 })
    }

    if (!payload.primary_image_url && (!payload.input_images || payload.input_images.length === 0)) {
      return NextResponse.json({
        success: false,
        error: 'primary_image_url ou input_images são obrigatórios'
      }, { status: 400 })
    }

    // Processar job
    const response = await avatar3DHyperOrchestrator.processAvatar3DJob(payload)

    return NextResponse.json({
      success: true,
      ...response
    })

  } catch (error) {
    console.error('Erro no orquestrador:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * 📊 GET - Consultar status de job
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('job_id')

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'job_id é obrigatório'
      }, { status: 400 })
    }

    const jobStatus = await avatar3DHyperOrchestrator.getJobStatus(jobId)

    if (!jobStatus) {
      return NextResponse.json({
        success: false,
        error: 'Job não encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      ...jobStatus
    })

  } catch (error) {
    console.error('Erro ao consultar status:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
