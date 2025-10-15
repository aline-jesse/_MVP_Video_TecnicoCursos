/**
 * Export API Endpoints
 * POST /api/v1/export - Criar novo job de exportação
 * GET /api/v1/export/:jobId - Status do job
 * DELETE /api/v1/export/:jobId - Cancelar job
 * GET /api/v1/export/queue/status - Status da fila
 */

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import {
  ExportJob,
  ExportStatus,
  ExportSettings,
  ExportFormat,
  ExportResolution,
  ExportQuality,
} from '@/types/export.types'
import { getExportQueue } from '@/lib/export/export-queue'

// Helper para validar settings
function validateExportSettings(settings: Partial<ExportSettings>): ExportSettings {
  return {
    format: settings.format || ExportFormat.MP4,
    resolution: settings.resolution || ExportResolution.FULL_HD_1080,
    quality: settings.quality || ExportQuality.HIGH,
    fps: settings.fps || 30,
    bitrate: settings.bitrate,
    codec: settings.codec,
    includeWatermark: settings.includeWatermark ?? false,
  }
}

/**
 * POST /api/v1/export
 * Cria novo job de exportação
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, projectId, timelineId, settings, timelineData } = body

    // Validação básica
    if (!userId || !projectId || !timelineId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, projectId, timelineId' },
        { status: 400 }
      )
    }

    // Criar job
    const jobId = uuidv4()
    const validatedSettings = validateExportSettings(settings || {})

    const job: ExportJob = {
      id: jobId,
      userId,
      projectId,
      timelineId,
      status: ExportStatus.PENDING,
      progress: 0,
      settings: validatedSettings,
      createdAt: new Date(),
    }

    // Adicionar à fila
    const queue = getExportQueue()
    queue.addJob(job)

    console.log(`[Export API] Created job ${jobId} for user ${userId}`)

    return NextResponse.json(
      {
        success: true,
        jobId,
        status: job.status,
        message: 'Export job created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Export API] Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create export job', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/export/:jobId
 * Obtém status do job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const queue = getExportQueue()
    const job = queue.getJob(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Calcular tempo decorrido
    let elapsedTime = 0
    if (job.startedAt) {
      const endTime = job.completedAt || new Date()
      elapsedTime = Math.floor((endTime.getTime() - job.startedAt.getTime()) / 1000)
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        settings: job.settings,
        outputUrl: job.outputUrl,
        fileSize: job.fileSize,
        duration: job.duration,
        error: job.error,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        elapsedTime,
        estimatedTimeRemaining: job.estimatedTimeRemaining,
      },
    })
  } catch (error) {
    console.error('[Export API] Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/export/:jobId
 * Cancela job
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const queue = getExportQueue()
    const success = queue.cancelJob(jobId)

    if (!success) {
      return NextResponse.json(
        { error: 'Job cannot be cancelled (not found or already completed)' },
        { status: 400 }
      )
    }

    console.log(`[Export API] Cancelled job ${jobId}`)

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
    })
  } catch (error) {
    console.error('[Export API] Error cancelling job:', error)
    return NextResponse.json(
      { error: 'Failed to cancel job', details: String(error) },
      { status: 500 }
    )
  }
}
