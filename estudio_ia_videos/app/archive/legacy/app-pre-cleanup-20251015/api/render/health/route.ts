
/**
 * API: Render Service Healthcheck
 * Sprint 27 - Production Ready
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check if FFmpeg is available (native system FFmpeg)
    let ffmpegStatus = 'unknown'
    try {
      const { spawn } = require('child_process')
      
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ['-version'])
        
        ffmpeg.on('close', (code) => {
          if (code === 0) {
            ffmpegStatus = 'available'
            resolve(true)
          } else {
            ffmpegStatus = 'unavailable'
            reject(new Error(`FFmpeg exited with code ${code}`))
          }
        })
        
        ffmpeg.on('error', (error) => {
          ffmpegStatus = 'unavailable'
          reject(error)
        })
        
        // Timeout after 5 seconds
        setTimeout(() => {
          ffmpeg.kill()
          ffmpegStatus = 'timeout'
          reject(new Error('FFmpeg check timeout'))
        }, 5000)
      })
    } catch (error) {
      ffmpegStatus = 'unavailable'
      console.error('FFmpeg check failed:', error)
    }

    // Check TTS providers
    const ttsProviders = {
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      azure: !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION),
      google: true // Google TTS is always available via API
    }

    // Check S3 storage
    const s3Status = !!(
      process.env.AWS_BUCKET_NAME && 
      process.env.AWS_FOLDER_PREFIX
    )

    const responseTime = Date.now() - startTime

    const health = {
      status: ffmpegStatus === 'available' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        ffmpeg: ffmpegStatus,
        tts: ttsProviders,
        storage: s3Status ? 'available' : 'unavailable'
      },
      version: '27.0.0',
      sprint: 'Sprint 27 - Production Pipeline'
    }

    const statusCode = health.status === 'healthy' ? 200 : 503

    return NextResponse.json(health, { status: statusCode })

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}
