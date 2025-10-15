

import { NextRequest, NextResponse } from 'next/server'
import { videoGenerationManager } from '../../../../lib/video-generation/video-provider-adapter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      prompt, 
      duration, 
      seed, 
      guidance_scale, 
      fps, 
      resolution, 
      style, 
      aspect_ratio,
      preferred_provider 
    } = body

    // Validate required parameters
    if (!prompt || !duration) {
      return NextResponse.json(
        { error: 'Prompt and duration are required' },
        { status: 400 }
      )
    }

    if (duration > 15) {
      return NextResponse.json(
        { error: 'Maximum duration is 15 seconds for AI video generation' },
        { status: 400 }
      )
    }

    // Estimate cost before generation
    const estimatedCost = videoGenerationManager.estimateCost({
      prompt,
      duration,
      resolution: resolution || '720p'
    }, preferred_provider)

    console.log(`Generating AI video - Estimated cost: $${estimatedCost.toFixed(3)}`)

    // Generate video
    const result = await videoGenerationManager.generateVideo({
      prompt,
      duration: parseFloat(duration),
      seed: seed ? parseInt(seed) : undefined,
      guidance_scale: guidance_scale ? parseFloat(guidance_scale) : undefined,
      fps: fps ? parseInt(fps) : undefined,
      resolution: resolution || '720p',
      style: style || 'realistic',
      aspect_ratio: aspect_ratio || '16:9'
    }, preferred_provider)

    return NextResponse.json({
      success: true,
      data: result,
      cost: {
        estimated: estimatedCost,
        actual: result.generation_time * 0.05 // Approximate actual cost
      }
    })

  } catch (error) {
    console.error('AI video generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get available providers and their capabilities
    const providers = videoGenerationManager.getAvailableProviders()
    
    return NextResponse.json({
      success: true,
      data: {
        providers,
        supported_formats: ['mp4', 'webm'],
        max_duration: Math.max(...providers.map(p => p.maxDuration)),
        supported_resolutions: ['720p', '1080p', '1440p'],
        supported_styles: ['realistic', 'animated', 'cartoon']
      }
    })
    
  } catch (error) {
    console.error('Error getting video generation info:', error)
    return NextResponse.json(
      { error: 'Failed to get video generation info' },
      { status: 500 }
    )
  }
}
