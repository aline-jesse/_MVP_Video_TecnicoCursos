
/**
 * FFmpeg Professional Service
 * Real video rendering using FFmpeg.wasm
 */

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export interface RenderSettings {
  width: number
  height: number
  fps: number
  quality: 'low' | 'medium' | 'high' | 'ultra' | '4k' | '8k'
  format: 'mp4' | 'webm' | 'avi' | 'mov'
  codec: 'h264' | 'h265' | 'vp9' | 'prores'
  bitrate?: string
  audioCodec: 'aac' | 'mp3' | 'opus'
  audioBitrate?: string
}

export interface RenderProgress {
  phase: 'preparing' | 'rendering' | 'encoding' | 'finalizing'
  progress: number
  currentFrame?: number
  totalFrames?: number
  timeElapsed: number
  timeRemaining?: number
  currentStep: string
}

export class FFmpegService {
  private ffmpeg: FFmpeg
  private loaded = false
  private onProgressCallback?: (progress: RenderProgress) => void
  private startTime = 0

  constructor() {
    this.ffmpeg = new FFmpeg()
  }

  async initialize(): Promise<void> {
    if (this.loaded) return

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
      
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      this.loaded = true
      console.log('✅ FFmpeg initialized successfully')
    } catch (error) {
      console.error('❌ FFmpeg initialization failed:', error)
      throw new Error('Failed to initialize FFmpeg')
    }
  }

  setProgressCallback(callback: (progress: RenderProgress) => void): void {
    this.onProgressCallback = callback
  }

  private reportProgress(phase: RenderProgress['phase'], progress: number, step: string): void {
    if (this.onProgressCallback) {
      const timeElapsed = Date.now() - this.startTime
      const timeRemaining = progress > 0 ? (timeElapsed / progress * (100 - progress)) : undefined

      this.onProgressCallback({
        phase,
        progress,
        timeElapsed,
        timeRemaining,
        currentStep: step
      })
    }
  }

  private getQualitySettings(quality: RenderSettings['quality']): Partial<RenderSettings> {
    const presets = {
      low: { width: 854, height: 480, fps: 24, bitrate: '800k', audioBitrate: '96k' },
      medium: { width: 1280, height: 720, fps: 30, bitrate: '2500k', audioBitrate: '128k' },
      high: { width: 1920, height: 1080, fps: 30, bitrate: '5000k', audioBitrate: '192k' },
      ultra: { width: 1920, height: 1080, fps: 60, bitrate: '8000k', audioBitrate: '256k' },
      '4k': { width: 3840, height: 2160, fps: 30, bitrate: '15000k', audioBitrate: '320k' },
      '8k': { width: 7680, height: 4320, fps: 24, bitrate: '45000k', audioBitrate: '512k' }
    }
    return presets[quality]
  }

  private getCodecSettings(codec: RenderSettings['codec'], format: RenderSettings['format']): string[] {
    const codecMap = {
      h264: ['-c:v', 'libx264', '-preset', 'medium', '-profile:v', 'high'],
      h265: ['-c:v', 'libx265', '-preset', 'medium', '-profile:v', 'main'],
      vp9: ['-c:v', 'libvpx-vp9', '-b:v', '2M'],
      prores: ['-c:v', 'prores_ks', '-profile:v', '3']
    }

    const formatSettings = {
      mp4: ['-movflags', '+faststart'],
      webm: ['-f', 'webm'],
      avi: ['-f', 'avi'],
      mov: ['-f', 'mov']
    }

    return [...(codecMap[codec] || codecMap.h264), ...(formatSettings[format] || [])]
  }

  async renderVideo(
    frameImages: Blob[],
    audioBlob: Blob | null,
    settings: RenderSettings,
    duration: number
  ): Promise<Uint8Array> {
    if (!this.loaded) {
      throw new Error('FFmpeg not initialized')
    }

    this.startTime = Date.now()
    
    try {
      this.reportProgress('preparing', 0, 'Preparando assets...')

      // Write frame images to FFmpeg filesystem
      for (let i = 0; i < frameImages.length; i++) {
        const filename = `frame_${i.toString().padStart(6, '0')}.png`
        await this.ffmpeg.writeFile(filename, await fetchFile(frameImages[i]))
        
        const progress = (i / frameImages.length) * 30 // 30% for preparing
        this.reportProgress('preparing', progress, `Preparando frame ${i + 1}/${frameImages.length}`)
      }

      // Write audio if available
      if (audioBlob) {
        await this.ffmpeg.writeFile('audio.mp3', await fetchFile(audioBlob))
        this.reportProgress('preparing', 40, 'Audio preparado')
      }

      this.reportProgress('rendering', 50, 'Iniciando renderização...')

      // Get quality and codec settings
      const qualityPreset = this.getQualitySettings(settings.quality)
      const codecSettings = this.getCodecSettings(settings.codec, settings.format)
      
      const finalSettings = { ...settings, ...qualityPreset }
      
      // Build FFmpeg command
      const command = [
        '-framerate', finalSettings.fps.toString(),
        '-i', 'frame_%06d.png',
        ...(audioBlob ? ['-i', 'audio.mp3'] : []),
        ...codecSettings,
        '-vf', `scale=${finalSettings.width}:${finalSettings.height}`,
        '-b:v', finalSettings.bitrate || '5000k',
        ...(audioBlob ? ['-c:a', finalSettings.audioCodec, '-b:a', finalSettings.audioBitrate || '192k'] : []),
        '-t', duration.toString(),
        '-pix_fmt', 'yuv420p',
        '-y',
        `output.${settings.format}`
      ]

      console.log('🎬 FFmpeg command:', command.join(' '))

      // Set up progress tracking
      this.ffmpeg.on('progress', ({ progress, time }) => {
        const renderProgress = 50 + (progress * 40) // 40% for rendering
        this.reportProgress('rendering', renderProgress, `Renderizando... ${Math.round(progress * 100)}%`)
      })

      // Execute FFmpeg command
      await this.ffmpeg.exec(command)

      this.reportProgress('encoding', 95, 'Finalizando vídeo...')

      // Read the output file
      const outputData = await this.ffmpeg.readFile(`output.${settings.format}`)
      
      this.reportProgress('finalizing', 100, 'Vídeo renderizado com sucesso!')

      // Clean up files
      await this.cleanup(frameImages.length, audioBlob !== null)

      return outputData as Uint8Array

    } catch (error) {
      console.error('❌ FFmpeg rendering error:', error)
      throw new Error(`Rendering failed: ${error}`)
    }
  }

  private async cleanup(frameCount: number, hasAudio: boolean): Promise<void> {
    try {
      // Remove frame files
      for (let i = 0; i < frameCount; i++) {
        const filename = `frame_${i.toString().padStart(6, '0')}.png`
        await this.ffmpeg.deleteFile(filename)
      }

      // Remove audio file if exists
      if (hasAudio) {
        await this.ffmpeg.deleteFile('audio.mp3')
      }

      console.log('🧹 FFmpeg cleanup completed')
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error)
    }
  }

  async getVideoInfo(videoBlob: Blob): Promise<{
    duration: number
    width: number
    height: number
    fps: number
    codec: string
    bitrate: string
  }> {
    if (!this.loaded) {
      throw new Error('FFmpeg not initialized')
    }

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoBlob))
    await this.ffmpeg.exec(['-i', 'input.mp4', '-hide_banner'])
    
    // Parse ffmpeg output for video info
    // This is a simplified version - in production you'd parse the actual output
    return {
      duration: 60,
      width: 1920,
      height: 1080,
      fps: 30,
      codec: 'H.264',
      bitrate: '5000k'
    }
  }

  isLoaded(): boolean {
    return this.loaded
  }

  async terminate(): Promise<void> {
    if (this.loaded) {
      this.ffmpeg.terminate()
      this.loaded = false
    }
  }
}

// Export singleton instance
export const ffmpegService = new FFmpegService()
