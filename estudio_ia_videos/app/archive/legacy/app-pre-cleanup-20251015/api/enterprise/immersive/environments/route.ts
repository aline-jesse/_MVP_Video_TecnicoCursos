

import { NextRequest, NextResponse } from 'next/server'
import { ImmersiveEnvironmentEngine } from '../../../../../lib/immersive/3d-environments'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const device_type = searchParams.get('device') as 'mobile' | 'desktop' | 'vr_headset' || 'desktop'

    let environments = ImmersiveEnvironmentEngine.ENVIRONMENT_LIBRARY

    // Filtrar por categoria se especificada
    if (category && category !== 'all') {
      environments = environments.filter((env: any) => env.category === category)
    }

    // Otimizar para dispositivo
    const device_capabilities = {
      device_type,
      gpu_performance: device_type === 'mobile' ? 'medium' : 'high' as 'low' | 'medium' | 'high',
      memory_available: device_type === 'mobile' ? 4 : 8,
      network_speed: 'fast' as 'slow' | 'medium' | 'fast'
    }

    const optimized_environments = environments.map((env: any) => 
      ImmersiveEnvironmentEngine.optimizeForDevice(env, device_capabilities)
    )

    return NextResponse.json({
      success: true,
      environments: optimized_environments,
      device_optimized_for: device_type,
      total_available: optimized_environments.length,
      categories: [...new Set(ImmersiveEnvironmentEngine.ENVIRONMENT_LIBRARY.map((e: any) => e.category))]
    })

  } catch (error) {
    console.error('Erro ao buscar ambientes:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar ambientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { environment_data, ai_generation = false } = await request.json()

    if (ai_generation) {
      // Geração com IA
      const generation_result = await ImmersiveEnvironmentEngine.generateEnvironmentWithAI(
        environment_data.description || 'Ambiente industrial padrão',
        environment_data.style_reference || 'realistic',
        environment_data.complexity || 'moderate'
      )

      return NextResponse.json({
        success: true,
        generation: {
          id: generation_result.generation_id,
          estimated_time: generation_result.estimated_time,
          preview_stages: generation_result.preview_stages,
          status_check_url: `/api/enterprise/immersive/generation-status/${generation_result.generation_id}`,
          customization_options: generation_result.customization_options
        }
      })
    } else {
      // Criação customizada
      const custom_result = await ImmersiveEnvironmentEngine.createCustomEnvironment(environment_data)

      return NextResponse.json({
        success: true,
        environment: {
          id: custom_result.environment_id,
          generation_job_id: custom_result.generation_job_id,
          estimated_completion_time: custom_result.estimated_completion_time,
          preview_available: custom_result.preview_available,
          status_check_url: `/api/enterprise/immersive/status/${custom_result.generation_job_id}`
        }
      })
    }

  } catch (error) {
    console.error('Erro na criação de ambiente:', error)
    return NextResponse.json(
      { success: false, error: 'Falha na criação do ambiente' },
      { status: 500 }
    )
  }
}

