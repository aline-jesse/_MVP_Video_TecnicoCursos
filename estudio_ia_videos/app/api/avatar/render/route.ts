/**
 * 🎭 Avatar 3D Render API
 * 
 * Endpoints para renderização de avatares 3D com sincronização labial
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  avatar3DRenderEngine,
  Avatar3DConfig,
  RenderSettings,
  AnimationSequence,
  RenderResult
} from '@/lib/avatar/render-engine'
import { Logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const logger = new Logger('AvatarRenderAPI')

// Schema de validação para configuração do avatar
const Avatar3DConfigSchema = z.object({
  modelUrl: z.string().url(),
  animations: z.array(z.string()).optional(),
  blendShapes: z.array(z.object({
    name: z.string(),
    visemeMapping: z.string(),
    intensity: z.number().min(0).max(1),
    smoothing: z.number().min(0).max(1),
    weight: z.number().min(0).max(1)
  })),
  materials: z.array(z.object({
    name: z.string(),
    type: z.enum(['standard', 'physical', 'toon']),
    properties: z.record(z.any())
  })),
  lighting: z.object({
    ambient: z.object({
      color: z.string(),
      intensity: z.number()
    }),
    directional: z.object({
      color: z.string(),
      intensity: z.number(),
      position: z.tuple([z.number(), z.number(), z.number()]),
      castShadow: z.boolean()
    }),
    point: z.object({
      color: z.string(),
      intensity: z.number(),
      position: z.tuple([z.number(), z.number(), z.number()]),
      distance: z.number()
    }).optional()
  }),
  camera: z.object({
    type: z.enum(['perspective', 'orthographic']),
    position: z.tuple([z.number(), z.number(), z.number()]),
    target: z.tuple([z.number(), z.number(), z.number()]),
    fov: z.number().optional(),
    near: z.number(),
    far: z.number()
  }),
  environment: z.object({
    background: z.object({
      type: z.enum(['color', 'gradient', 'image', 'video']),
      value: z.union([z.string(), z.array(z.string())])
    }),
    fog: z.object({
      type: z.enum(['linear', 'exponential']),
      color: z.string(),
      near: z.number(),
      far: z.number()
    }).optional()
  })
})

// Schema para configurações de renderização
const RenderSettingsSchema = z.object({
  width: z.number().min(480).max(4096),
  height: z.number().min(270).max(2160),
  fps: z.number().min(15).max(120),
  quality: z.enum(['low', 'medium', 'high', 'ultra']),
  format: z.enum(['webm', 'mp4', 'gif']),
  codec: z.string().optional(),
  bitrate: z.number().optional()
})

// Schema para sequência de animação
const AnimationSequenceSchema = z.object({
  visemes: z.array(z.object({
    timestamp: z.number(),
    viseme: z.string(),
    intensity: z.number().min(0).max(1),
    duration: z.number()
  })),
  blendShapes: z.array(z.object({
    timestamp: z.number(),
    shapes: z.record(z.number()),
    intensity: z.number().min(0).max(1),
    duration: z.number()
  })),
  emotions: z.array(z.object({
    timestamp: z.number(),
    emotion: z.string(),
    intensity: z.number().min(0).max(1),
    duration: z.number()
  })).optional(),
  camera: z.array(z.object({
    timestamp: z.number(),
    position: z.tuple([z.number(), z.number(), z.number()]),
    target: z.tuple([z.number(), z.number(), z.number()]),
    duration: z.number()
  })).optional(),
  lighting: z.array(z.object({
    timestamp: z.number(),
    intensity: z.number(),
    color: z.string().optional(),
    duration: z.number()
  })).optional()
})

/**
 * POST /api/avatar/render
 * Renderizar vídeo com avatar 3D e sincronização labial
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Validar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Validar dados da requisição
    const body = await request.json()
    
    const avatarConfigResult = Avatar3DConfigSchema.safeParse(body.avatarConfig)
    if (!avatarConfigResult.success) {
      return NextResponse.json(
        { 
          error: 'Configuração do avatar inválida',
          details: avatarConfigResult.error.errors
        },
        { status: 400 }
      )
    }

    const renderSettingsResult = RenderSettingsSchema.safeParse(body.renderSettings)
    if (!renderSettingsResult.success) {
      return NextResponse.json(
        { 
          error: 'Configurações de renderização inválidas',
          details: renderSettingsResult.error.errors
        },
        { status: 400 }
      )
    }

    const animationSequenceResult = AnimationSequenceSchema.safeParse(body.animationSequence)
    if (!animationSequenceResult.success) {
      return NextResponse.json(
        { 
          error: 'Sequência de animação inválida',
          details: animationSequenceResult.error.errors
        },
        { status: 400 }
      )
    }

    const avatarConfig: Avatar3DConfig = avatarConfigResult.data
    const renderSettings: RenderSettings = renderSettingsResult.data
    const animationSequence: AnimationSequence = animationSequenceResult.data

    logger.info('Starting avatar render', {
      userId: user.id,
      avatarModel: avatarConfig.modelUrl,
      renderSettings,
      visemesCount: animationSequence.visemes.length
    })

    // Carregar avatar
    await avatar3DRenderEngine.loadAvatar(avatarConfig)

    // Renderizar vídeo
    const result: RenderResult = await avatar3DRenderEngine.renderVideo(
      animationSequence,
      renderSettings
    )

    // Log da operação
    await supabase.from('render_jobs').update({
      user_id: user.id,
      completed_at: new Date().toISOString(),
      processing_time: Date.now() - startTime
    }).eq('job_id', result.metadata.job_id)

    logger.info('Avatar render completed', {
      userId: user.id,
      jobId: result.metadata.job_id,
      processingTime: Date.now() - startTime,
      videoUrl: result.video_url
    })

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        processing_time: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Avatar render failed', { 
      error: error instanceof Error ? error.message : error,
      processingTime: Date.now() - startTime
    })

    return NextResponse.json(
      { 
        error: 'Falha na renderização do avatar',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/avatar/render
 * Obter status de jobs de renderização e estatísticas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    if (jobId) {
      // Buscar job específico
      const { data: job, error } = await supabase
        .from('render_jobs')
        .select('*')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Job não encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: job
      })
    }

    // Buscar lista de jobs
    let query = supabase
      .from('render_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: jobs, error } = await query

    if (error) {
      throw error
    }

    // Estatísticas
    const { data: stats } = await supabase
      .from('render_jobs')
      .select('status, render_time, quality_score, file_size')
      .eq('user_id', user.id)

    const statistics = {
      total_jobs: stats?.length || 0,
      completed_jobs: stats?.filter(j => j.status === 'completed').length || 0,
      failed_jobs: stats?.filter(j => j.status === 'failed').length || 0,
      average_render_time: stats?.reduce((acc, j) => acc + (j.render_time || 0), 0) / (stats?.length || 1),
      average_quality_score: stats?.reduce((acc, j) => acc + (j.quality_score || 0), 0) / (stats?.length || 1),
      total_file_size: stats?.reduce((acc, j) => acc + (j.file_size || 0), 0) || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        statistics
      }
    })

  } catch (error) {
    logger.error('Failed to get render jobs', { error })

    return NextResponse.json(
      { 
        error: 'Falha ao buscar jobs de renderização',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/avatar/render
 * Cancelar job de renderização
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID é obrigatório' },
        { status: 400 }
      )
    }

    // Validar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Atualizar status do job
    const { data, error } = await supabase
      .from('render_jobs')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('job_id', jobId)
      .eq('user_id', user.id)
      .select()

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Job não encontrado ou não autorizado' },
        { status: 404 }
      )
    }

    logger.info('Render job cancelled', {
      userId: user.id,
      jobId
    })

    return NextResponse.json({
      success: true,
      message: 'Job cancelado com sucesso',
      data: data[0]
    })

  } catch (error) {
    logger.error('Failed to cancel render job', { error })

    return NextResponse.json(
      { 
        error: 'Falha ao cancelar job',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}