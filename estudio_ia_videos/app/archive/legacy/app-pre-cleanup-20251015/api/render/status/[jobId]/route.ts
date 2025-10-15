

import { NextRequest, NextResponse } from 'next/server'
import { renderQueueManager } from '../../../../../lib/render-pipeline/render-queue-system'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Get job progress
    const progress = renderQueueManager.getJobProgress(jobId)
    
    if (!progress) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: progress
    })

  } catch (error) {
    console.error('Error getting job status:', error)
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    // Cancel job
    const cancelled = await renderQueueManager.cancelJob(jobId)
    
    if (!cancelled) {
      return NextResponse.json(
        { error: 'Job cannot be cancelled or not found' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling job:', error)
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    )
  }
}
