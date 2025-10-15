

import { NextRequest, NextResponse } from 'next/server'
import { MultiFormatExportEngine } from '../../../../../lib/export/multi-format-engine'

export async function POST(request: NextRequest) {
  try {
    const configuration = await request.json()

    // Validar configuração
    if (!configuration.project_id || !configuration.export_format) {
      return NextResponse.json(
        { success: false, error: 'project_id e export_format são obrigatórios' },
        { status: 400 }
      )
    }

    // Iniciar exportação
    const export_job = await MultiFormatExportEngine.startExport(configuration)

    return NextResponse.json({
      success: true,
      job: {
        id: export_job.id,
        status: export_job.status,
        progress: export_job.progress,
        estimated_completion: new Date(
          Date.now() + export_job.metadata.processing_time_estimate * 1000
        ).toISOString(),
        download_url: `/api/enterprise/export/download/${export_job.id}`,
        metadata: {
          format: configuration.export_format,
          quality: configuration.quality_settings?.resolution,
          estimated_size: export_job.metadata.file_size_estimate,
          estimated_duration: export_job.metadata.processing_time_estimate
        }
      }
    })

  } catch (error) {
    console.error('Erro na exportação multi-formato:', error)
    return NextResponse.json(
      { success: false, error: 'Falha na exportação' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const job_id = searchParams.get('job_id')

    if (!job_id) {
      return NextResponse.json(
        { success: false, error: 'job_id obrigatório' },
        { status: 400 }
      )
    }

    const job_status = await MultiFormatExportEngine.getExportStatus(job_id)

    return NextResponse.json({
      success: true,
      job: {
        id: job_status.id,
        status: job_status.status,
        progress: job_status.progress,
        output_files: job_status.output_files,
        error_message: job_status.error_message,
        started_at: job_status.started_at,
        completed_at: job_status.completed_at
      }
    })

  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar status' },
      { status: 500 }
    )
  }
}

