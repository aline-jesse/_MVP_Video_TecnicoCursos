/**
 * 🎬 API de Renderização - Cancel
 * DELETE /api/render/cancel/[jobId] - Cancelar renderização
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createRenderQueue, cancelJob } from '@/lib/queue/render-queue'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId

    // Autenticação
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Buscar job no banco
    const { data: job, error: jobError } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', session.user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Verificar se pode ser cancelado
    if (job.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed job' },
        { status: 400 }
      )
    }

    if (job.status === 'failed' || job.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Job already terminated' },
        { status: 400 }
      )
    }

    // Cancelar na fila
    const queue = createRenderQueue()
    const cancelled = await cancelJob(queue, jobId)

    if (!cancelled) {
      console.warn(`Job ${jobId} not found in queue, updating DB only`)
    }

    // Atualizar no banco
    await supabase
      .from('render_jobs')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    // Registrar analytics
    await supabase.from('analytics_events').insert({
      user_id: session.user.id,
      event_type: 'render_cancelled',
      event_data: {
        jobId,
        projectId: job.project_id,
        progress: job.progress,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: 'cancelled',
      },
    })

  } catch (error) {
    console.error('Error cancelling render:', error)
    
    return NextResponse.json(
      { error: 'Failed to cancel render' },
      { status: 500 }
    )
  }
}
