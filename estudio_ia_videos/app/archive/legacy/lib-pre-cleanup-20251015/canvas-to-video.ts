
/**
 * Canvas to Video Converter
 * Converts Fabric.js canvas frames to video using FFmpeg
 */

import html2canvas from 'html2canvas'
import { ffmpegService, RenderSettings } from './ffmpeg-service'

export interface CanvasFrame {
  canvas: any // Fabric.js Canvas
  duration: number // in seconds
  transition?: {
    type: 'fade' | 'slide' | 'zoom' | 'none'
    duration: number
  }
}

export interface VideoScene {
  id: string
  name: string
  frames: CanvasFrame[]
  totalDuration: number
  audioTrack?: {
    url: string
    offset: number
    volume: number
  }
}

export class CanvasToVideoConverter {
  private renderSettings: RenderSettings = {
    width: 1920,
    height: 1080,
    fps: 30,
    quality: 'high',
    format: 'mp4',
    codec: 'h264',
    audioCodec: 'aac'
  }

  constructor(settings?: Partial<RenderSettings>) {
    if (settings) {
      this.renderSettings = { ...this.renderSettings, ...settings }
    }
  }

  async convertSceneToVideo(
    scene: VideoScene,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    try {
      console.log('🎬 Starting scene conversion:', scene.name)

      // Initialize FFmpeg
      await ffmpegService.initialize()

      // Generate frames from canvas scenes
      const frameImages = await this.generateFrameImages(scene, onProgress)
      
      // Load audio if available
      let audioBlob: Blob | null = null
      if (scene.audioTrack) {
        audioBlob = await this.loadAudio(scene.audioTrack.url)
      }

      // Set up progress tracking
      ffmpegService.setProgressCallback((progress) => {
        onProgress?.(50 + (progress.progress / 2)) // Second half of progress
      })

      // Render video using FFmpeg
      const videoData = await ffmpegService.renderVideo(
        frameImages,
        audioBlob,
        this.renderSettings,
        scene.totalDuration
      )

      console.log('✅ Scene conversion completed')
      return videoData

    } catch (error) {
      console.error('❌ Scene conversion failed:', error)
      throw error
    }
  }

  private async generateFrameImages(
    scene: VideoScene,
    onProgress?: (progress: number) => void
  ): Promise<Blob[]> {
    const frames: Blob[] = []
    const totalFrames = Math.ceil(scene.totalDuration * this.renderSettings.fps)
    
    let currentTime = 0
    let frameIndex = 0

    console.log(`🎞️ Generating ${totalFrames} frames at ${this.renderSettings.fps}fps`)

    for (const sceneFrame of scene.frames) {
      const frameDuration = sceneFrame.duration
      const framesForThisScene = Math.ceil(frameDuration * this.renderSettings.fps)

      // Render each frame for this scene
      for (let i = 0; i < framesForThisScene; i++) {
        const progress = (frameIndex / totalFrames) * 50 // First half of progress

        // Update canvas if needed (for animations)
        await this.updateCanvasForFrame(sceneFrame.canvas, currentTime, frameDuration)

        // Capture canvas as image
        const imageBlob = await this.captureCanvasFrame(sceneFrame.canvas)
        frames.push(imageBlob)

        currentTime += 1 / this.renderSettings.fps
        frameIndex++

        onProgress?.(progress)
      }
    }

    return frames
  }

  private async captureCanvasFrame(canvas: any): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Get canvas element
      const canvasEl = canvas.getElement()
      
      // Convert to blob
      canvasEl.toBlob((blob: Blob | null) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to capture canvas frame'))
        }
      }, 'image/png')
    })
  }

  private async updateCanvasForFrame(
    canvas: any,
    currentTime: number,
    totalDuration: number
  ): Promise<void> {
    // Apply animations based on timeline
    const objects = canvas.getObjects()
    
    for (const obj of objects) {
      // Apply fade in/out animations
      if (obj.opacity !== undefined) {
        const fadeInDuration = 0.5 // 500ms fade in
        const fadeOutStart = totalDuration - 0.5 // Start fade out 500ms before end

        if (currentTime < fadeInDuration) {
          obj.set('opacity', currentTime / fadeInDuration)
        } else if (currentTime > fadeOutStart) {
          const fadeOutProgress = (currentTime - fadeOutStart) / 0.5
          obj.set('opacity', 1 - fadeOutProgress)
        } else {
          obj.set('opacity', 1)
        }
      }

      // Apply slide animations
      if ((obj as any).animation) {
        const animation = (obj as any).animation
        if (animation.type === 'slide') {
          const progress = currentTime / totalDuration
          const startX = animation.startX || 0
          const endX = animation.endX || obj.left || 0
          
          obj.set('left', startX + (endX - startX) * progress)
        }
      }
    }

    canvas.renderAll()
  }

  private async loadAudio(url: string): Promise<Blob> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load audio: ${response.statusText}`)
    }
    return await response.blob()
  }

  async captureHTMLElement(element: HTMLElement): Promise<Blob> {
    const canvas = await html2canvas(element, {
      width: this.renderSettings.width,
      height: this.renderSettings.height,
      backgroundColor: '#ffffff',
      scale: 1
    })

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to capture HTML element'))
        }
      }, 'image/png')
    })
  }

  updateRenderSettings(settings: Partial<RenderSettings>): void {
    this.renderSettings = { ...this.renderSettings, ...settings }
  }

  getRenderSettings(): RenderSettings {
    return { ...this.renderSettings }
  }
}
