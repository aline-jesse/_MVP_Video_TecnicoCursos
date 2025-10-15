
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { ffmpegComposer } from '@/lib/video/ffmpeg'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      project_id,
      slides_data,
      avatar_videos,
      audio_tracks,
      settings = {}
    } = body

    if (!project_id || !slides_data || !avatar_videos || !audio_tracks) {
      return NextResponse.json(
        { error: 'Missing required data for video composition' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`🎬 Starting final render for project ${project_id}`)
    const startTime = Date.now()

    // Convert base64 data to buffers
    const slides = slides_data.map((slide: any) => ({
      image: Buffer.from(slide.image_base64, 'base64'),
      duration: slide.duration
    }))

    const avatars = avatar_videos.map((avatar: any) => ({
      video: Buffer.from(avatar.video_base64, 'base64'),
      duration: avatar.duration
    }))

    const audios = audio_tracks.map((audio: any) => ({
      audio: Buffer.from(audio.audio_base64, 'base64'),
      duration: audio.duration
    }))

    // Compose final video
    const finalVideoBuffer = await ffmpegComposer.composeVideo(
      slides,
      avatars,
      audios,
      {
        layout: settings.layout || 'pip',
        resolution: settings.resolution || '1080p',
        fps: settings.fps || 30,
        format: settings.format || 'mp4',
        quality: settings.quality || 'high'
      }
    )

    // Validate video
    const validation = await ffmpegComposer.validateVideo(finalVideoBuffer)
    if (!validation.isValid) {
      throw new Error(`Video validation failed: ${validation.errors.join(', ')}`)
    }

    // For MVP, simulate S3 upload
    const videoUrl = `https://storage.example.com/videos/${project_id}/final-${Date.now()}.mp4`
    const processingTime = Date.now() - startTime

    // Update project with final video
    await prisma.project.update({
      where: { id: project_id },
      data: {
        status: 'COMPLETED',
        processingLog: {
          finalRender: {
            videoUrl,
            processingTime,
            validation,
            settings
          }
        }
      }
    })

    // Create video export record
    await prisma.videoExport.create({
      data: {
        projectId: project_id,
        userId: user.id,
        format: settings.format || 'mp4',
        resolution: settings.resolution || '1080p',
        quality: settings.quality || 'high',
        status: 'completed',
        fileUrl: videoUrl,
        fileName: `video-${project_id}.${settings.format || 'mp4'}`,
        fileSize: finalVideoBuffer.length,
        duration: validation.duration
      }
    })

    console.log(`✅ Final render completed in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      video: {
        url: videoUrl,
        download_url: videoUrl,
        duration: validation.duration,
        resolution: validation.resolution,
        format: validation.format,
        file_size: finalVideoBuffer.length
      },
      processing: {
        time_ms: processingTime,
        validation: validation
      },
      project: {
        id: project_id,
        status: 'completed'
      }
    })

  } catch (error) {
    console.error('Final render error:', error)
    
    // Update project status to error (try to extract from request)
    try {
      const bodyForError = await request.json().catch(() => ({}))
      if (bodyForError?.project_id) {
        await prisma.project.update({
          where: { id: bodyForError.project_id },
          data: {
            status: 'ERROR',
            errorMessage: error instanceof Error ? error.message : 'Render failed'
          }
        })
      }
    } catch (dbError) {
      console.error('Failed to update project status:', dbError)
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to render final video',
        details: 'Check FFmpeg configuration and input data'
      },
      { status: 500 }
    )
  }
}

// Get FFmpeg capabilities
export async function GET() {
  try {
    const capabilities = ffmpegComposer.getCapabilities()
    
    return NextResponse.json({
      success: true,
      capabilities
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get FFmpeg capabilities' },
      { status: 500 }
    )
  }
}
