
import { NextRequest, NextResponse } from 'next/server'
import { getJobStatus } from '@/lib/queue/setup'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const status = await getJobStatus(jobId)

    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      job_id: jobId,
      status: status.status,
      progress: status.progress,
      result: status.result,
      error: status.error
    })

  } catch (error) {
    console.error('Job status error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get job status',
        details: 'Check job ID and queue configuration'
      },
      { status: 500 }
    )
  }
}
