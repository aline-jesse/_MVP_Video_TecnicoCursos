
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'

interface VideoLayer {
  type: 'slide' | 'avatar' | 'audio'
  source: string | Buffer
  duration: number
  position?: { x: number; y: number; width: number; height: number }
}

interface CompositionOptions {
  layout: 'pip' | 'side-by-side' | 'fullscreen'
  resolution: '720p' | '1080p' | '4k'
  fps: number
  format: 'mp4' | 'webm'
  quality: 'low' | 'medium' | 'high'
}

export class FFmpegComposer {
  private tempDir = '/tmp/video-composer'

  constructor() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  async composeVideo(
    slides: Array<{ image: Buffer; duration: number }>,
    avatarVideos: Array<{ video: Buffer; duration: number }>,
    audioTracks: Array<{ audio: Buffer; duration: number }>,
    options: CompositionOptions
  ): Promise<Buffer> {
    
    console.log(`🎬 Starting video composition with ${slides.length} slides...`)
    
    try {
      // For MVP, create a simple composition
      const outputPath = path.join(this.tempDir, `output-${Date.now()}.${options.format}`)
      
      // Get video dimensions
      const dimensions = this.getResolutionDimensions(options.resolution)
      
      // Create placeholder video for MVP
      const videoBuffer = await this.createPlaceholderVideo(
        slides.length,
        options,
        outputPath
      )
      
      console.log(`✅ Video composition completed: ${videoBuffer.length} bytes`)
      
      // Clean up temp file
      try {
        fs.unlinkSync(outputPath)
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError)
      }
      
      return videoBuffer
      
    } catch (error) {
      console.error('FFmpeg composition error:', error)
      throw new Error(`Video composition failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async createPlaceholderVideo(
    slideCount: number,
    options: CompositionOptions,
    outputPath: string
  ): Promise<Buffer> {
    
    return new Promise((resolve, reject) => {
      const dimensions = this.getResolutionDimensions(options.resolution)
      
      // Create a simple test pattern video
      ffmpeg()
        .input(`color=c=blue:size=${dimensions.width}x${dimensions.height}:duration=${slideCount * 3}:rate=${options.fps}`)
        .inputFormat('lavfi')
        .videoCodec('libx264')
        .audioCodec('aac')
        .format(options.format)
        .outputOptions([
          '-preset fast',
          '-crf 23',
          '-pix_fmt yuv420p'
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine)
        })
        .on('progress', (progress) => {
          console.log(`FFmpeg progress: ${Math.round(progress.percent || 0)}%`)
        })
        .on('end', () => {
          try {
            const videoBuffer = fs.readFileSync(outputPath)
            resolve(videoBuffer)
          } catch (error) {
            reject(error)
          }
        })
        .on('error', (error) => {
          reject(error)
        })
        .save(outputPath)
    })
  }

  private getResolutionDimensions(resolution: string): { width: number; height: number } {
    switch (resolution) {
      case '720p':
        return { width: 1280, height: 720 }
      case '1080p':
        return { width: 1920, height: 1080 }
      case '4k':
        return { width: 3840, height: 2160 }
      default:
        return { width: 1920, height: 1080 }
    }
  }

  // Compose slide + avatar in specified layout
  async composeSlideWithAvatar(
    slideImage: Buffer,
    avatarVideo: Buffer,
    audio: Buffer,
    layout: CompositionOptions['layout'],
    duration: number
  ): Promise<Buffer> {
    
    console.log(`🎨 Composing slide with avatar (${layout} layout)`)
    
    // For MVP, return placeholder composition
    const composition = {
      slide: slideImage.length,
      avatar: avatarVideo.length,
      audio: audio.length,
      layout,
      duration,
      timestamp: Date.now()
    }
    
    return Buffer.from(JSON.stringify(composition) + '-composed-video-data')
  }

  // Add transitions between scenes
  async addTransitions(
    videoSegments: Buffer[],
    transitionType: 'fade' | 'cut' | 'crossfade' = 'fade',
    transitionDuration: number = 0.5
  ): Promise<Buffer> {
    
    console.log(`🔄 Adding ${transitionType} transitions between ${videoSegments.length} segments`)
    
    // For MVP, concatenate segments with metadata
    const result = {
      segments: videoSegments.length,
      transition: transitionType,
      duration: transitionDuration,
      totalSize: videoSegments.reduce((sum, segment) => sum + segment.length, 0)
    }
    
    return Buffer.from(JSON.stringify(result) + '-with-transitions')
  }

  // Validate final video
  async validateVideo(videoBuffer: Buffer): Promise<{
    isValid: boolean
    duration: number
    resolution: string
    format: string
    hasAudio: boolean
    errors: string[]
  }> {
    
    const errors: string[] = []
    
    // Basic validation for MVP
    if (videoBuffer.length === 0) {
      errors.push('Video buffer is empty')
    }
    
    if (videoBuffer.length < 1000) {
      errors.push('Video buffer too small - possible corruption')
    }
    
    return {
      isValid: errors.length === 0,
      duration: 10, // Placeholder
      resolution: '1920x1080',
      format: 'mp4',
      hasAudio: true,
      errors
    }
  }

  // Get FFmpeg info
  getCapabilities() {
    return {
      supportedFormats: ['mp4', 'webm', 'avi', 'mov'],
      supportedCodecs: {
        video: ['libx264', 'libx265', 'libvpx-vp9'],
        audio: ['aac', 'opus', 'mp3']
      },
      maxResolution: '4k',
      hardwareAcceleration: false, // Enable in production
      parallelProcessing: true
    }
  }

  // Clean temporary files
  async cleanup() {
    try {
      const files = fs.readdirSync(this.tempDir)
      for (const file of files) {
        const filePath = path.join(this.tempDir, file)
        const stats = fs.statSync(filePath)
        
        // Remove files older than 1 hour
        if (Date.now() - stats.mtime.getTime() > 60 * 60 * 1000) {
          fs.unlinkSync(filePath)
        }
      }
      console.log('🧹 FFmpeg temp files cleaned')
    } catch (error) {
      console.warn('FFmpeg cleanup warning:', error)
    }
  }
}

// Singleton instance
export const ffmpegComposer = new FFmpegComposer()
