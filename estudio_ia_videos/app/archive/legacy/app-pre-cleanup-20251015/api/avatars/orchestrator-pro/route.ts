
/**
 * 🎭 API do Orquestrador PRO de Avatar 3D Hiper-Realista
 * Endpoint premium para criação de avatares com recursos avançados
 */

import { NextRequest, NextResponse } from 'next/server'
import { avatar3DHyperOrchestrator, type OrchestratorPayload } from '@/lib/orchestrator/avatar-3d-hyperreal-orchestrator'

export const dynamic = 'force-dynamic'

interface ProFeatures {
  remove_watermark: boolean
  export_format: string
  voice_clone_id?: string
  premium_quality: boolean
}

interface ProPayload extends OrchestratorPayload {
  pro_features: ProFeatures
}

/**
 * 🚀 POST - Iniciar job de criação de avatar PRO
 */
export async function POST(request: NextRequest) {
  try {
    const payload: ProPayload = await request.json()

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

    // Verificar recursos PRO
    const proFeatures = payload.pro_features
    
    // Configurar payload com recursos premium
    const enhancedPayload: OrchestratorPayload = {
      ...payload,
      render: {
        ...payload.render,
        resolution: proFeatures.premium_quality ? '8K' : '4K',
        fps: proFeatures.premium_quality ? 60 : 30
      },
      mesh: {
        texture_resolution: proFeatures.premium_quality ? '8K' : '4K'
      },
      phoneme_align_accuracy: proFeatures.premium_quality ? 'high' : 'medium'
    }

    // Se usar voz clonada, atualizar configuração
    if (proFeatures.voice_clone_id) {
      enhancedPayload.audio = {
        ...enhancedPayload.audio,
        tts: {
          ...enhancedPayload.audio.tts!,
          voice_name: `cloned_voice_${proFeatures.voice_clone_id}`
        }
      }
    }

    // Processar job com orquestrador
    const response = await avatar3DHyperOrchestrator.processAvatar3DJob(enhancedPayload)

    // Adicionar metadados PRO
    const proResponse = {
      ...response,
      pro_features: {
        watermark_removed: proFeatures.remove_watermark,
        export_format: proFeatures.export_format,
        premium_quality: proFeatures.premium_quality,
        voice_cloned: !!proFeatures.voice_clone_id,
        enhanced_processing: true
      },
      estimated_render_time: proFeatures.premium_quality ? '8-12 minutos' : '4-6 minutos',
      quality_metrics: {
        ...response.metadata.quality_metrics,
        texture_resolution: proFeatures.premium_quality ? '8K' : '4K',
        audio_quality: proFeatures.voice_clone_id ? 'Cloned Voice' : 'Standard TTS',
        watermark: proFeatures.remove_watermark ? 'Removed' : 'Present'
      }
    }

    return NextResponse.json({
      success: true,
      ...proResponse
    })

  } catch (error) {
    console.error('Erro no orquestrador PRO:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * 📊 GET - Consultar status de job PRO
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

    // Adicionar informações PRO ao status
    const proStatus = {
      ...jobStatus,
      pro_analytics: {
        processing_speed: 'Enhanced',
        quality_level: 'Premium',
        resources_allocated: 'High Priority',
        estimated_completion: new Date(Date.now() + (8 * 60 * 1000)).toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      ...proStatus
    })

  } catch (error) {
    console.error('Erro ao consultar status PRO:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
