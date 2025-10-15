

import { NextRequest, NextResponse } from 'next/server'
import { renderQueueManager } from '../../../../lib/render-pipeline/render-queue-system'
import { getServerSession } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const { 
      project_id,
      scenes,
      output_settings,
      priority = 'normal'
    } = body

    // Validate required parameters
    if (!project_id || !scenes || !output_settings) {
      return NextResponse.json(
        { error: 'project_id, scenes, and output_settings are required' },
        { status: 400 }
      )
    }

    // Validate scenes
    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'At least one scene is required' },
        { status: 400 }
      )
    }

    // Calculate estimates
    const estimates = calculateJobEstimates(scenes, output_settings)

    // Prepare job data
    const jobData = {
      user_id: session.user.id || session.user.email,
      project_id,
      type: 'advanced_composition' as const,
      priority: priority as any,
      scenes: scenes.map((scene: any, index: number) => ({
        id: scene.id || `scene-${index}`,
        type: scene.type || 'slide',
        content: scene.content || {},
        duration: scene.duration || 5,
        order: scene.order || index
      })),
      output: {
        resolution: output_settings.resolution || '1080p',
        fps: output_settings.fps || 30,
        format: output_settings.format || 'mp4',
        quality: output_settings.quality || 'standard',
        watermark: output_settings.watermark
      },
      estimates
    }

    // Submit to render queue
    const jobId = await renderQueueManager.submitJob(jobData)

    return NextResponse.json({
      success: true,
      data: {
        job_id: jobId,
        estimates,
        queue_position: await getQueuePosition(jobId),
        eta_minutes: Math.ceil(estimates.render_time / 60)
      }
    })

  } catch (error) {
    console.error('Render job submission error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to submit render job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function calculateJobEstimates(scenes: any[], outputSettings: any): {
  total_cost: number
  render_time: number
  file_size: number
} {
  let totalCost = 0
  let renderTime = 0
  let fileSize = 0

  for (const scene of scenes) {
    const sceneDuration = scene.duration || 5

    // Cost estimation by scene type
    switch (scene.type) {
      case 'video_ai':
        totalCost += sceneDuration * 0.08 // $0.08 per second for AI video
        renderTime += sceneDuration * 2 // 2s render time per second of video
        break
      case 'avatar_3d':
        totalCost += sceneDuration * 0.05 // $0.05 per second for 3D avatar
        renderTime += sceneDuration * 3 // 3s render time per second (lip-sync processing)
        break
      case 'slide':
      case 'image':
        totalCost += 0.01 // Fixed cost for static content
        renderTime += 1 // 1s processing time
        break
      default:
        totalCost += 0.02
        renderTime += 2
    }

    // File size estimation (MB per second)
    const resolution = outputSettings.resolution || '1080p'
    const quality = outputSettings.quality || 'standard'
    
    let mbPerSecond = 1.5 // Base for 720p standard
    if (resolution === '1080p') mbPerSecond = 2.5
    if (resolution === '1440p') mbPerSecond = 4.0
    if (quality === 'high') mbPerSecond *= 1.5
    if (quality === 'premium') mbPerSecond *= 2.0

    fileSize += sceneDuration * mbPerSecond
  }

  // Add base composition cost
  totalCost += 0.10 // Base FFmpeg processing cost
  renderTime += 30 // Base composition time

  return {
    total_cost: parseFloat(totalCost.toFixed(3)),
    render_time: Math.ceil(renderTime),
    file_size: Math.ceil(fileSize)
  }
}

async function getQueuePosition(jobId: string): Promise<number> {
  // Get current queue stats to estimate position
  const stats = await renderQueueManager.getQueueStats()
  return stats.queued + 1 // Simplified queue position
}
