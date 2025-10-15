/**
 * 🎨 Watermark Renderer
 * Apply watermarks to videos using FFmpeg
 */

import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs/promises'
import {
  WatermarkConfig,
  WatermarkType,
  WatermarkPosition,
  WatermarkAnimation,
  WatermarkRenderResult,
  POSITION_COORDINATES,
  validateWatermarkConfig,
  ImageWatermarkConfig,
  TextWatermarkConfig,
} from '@/types/watermark.types'

/**
 * Watermark Renderer Class
 */
export class WatermarkRenderer {
  /**
   * Apply watermark to video
   */
  async applyWatermark(
    inputPath: string,
    outputPath: string,
    watermarkConfig: WatermarkConfig,
    onProgress?: (progress: number) => void
  ): Promise<WatermarkRenderResult> {
    const startTime = Date.now()

    // Validate configuration
    const validation = validateWatermarkConfig(watermarkConfig)
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid watermark config: ${validation.errors.join(', ')}`,
        processingTime: Date.now() - startTime,
        watermarkConfig,
      }
    }

    try {
      // Apply watermark based on type
      if (watermarkConfig.type === WatermarkType.TEXT) {
        await this.applyTextWatermark(inputPath, outputPath, watermarkConfig, onProgress)
      } else {
        await this.applyImageWatermark(inputPath, outputPath, watermarkConfig, onProgress)
      }

      return {
        success: true,
        outputPath,
        processingTime: Date.now() - startTime,
        watermarkConfig,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        watermarkConfig,
      }
    }
  }

  /**
   * Apply image watermark using FFmpeg overlay filter
   */
  private async applyImageWatermark(
    inputPath: string,
    outputPath: string,
    config: ImageWatermarkConfig,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Verify watermark image exists
      const watermarkPath = this.resolveImagePath(config.imageUrl)

      // Calculate position
      const position = this.calculateImagePosition(config)

      // Build FFmpeg filter
      const filter = this.buildImageOverlayFilter(config, position)

      console.log(`🎨 Applying image watermark: ${watermarkPath}`)
      console.log(`📍 Position: ${config.position}`)
      console.log(`🔧 Filter: ${filter}`)

      const command = ffmpeg(inputPath)
        .input(watermarkPath)
        .complexFilter([filter])
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-crf 23',
          '-c:a copy',
        ])
        .output(outputPath)

      // Progress tracking
      command.on('progress', (progress) => {
        if (onProgress && progress.percent) {
          onProgress(Math.min(progress.percent, 99))
        }
      })

      command.on('end', () => {
        console.log('✅ Image watermark applied successfully')
        if (onProgress) onProgress(100)
        resolve()
      })

      command.on('error', (error) => {
        console.error('❌ Image watermark error:', error)
        reject(error)
      })

      command.run()
    })
  }

  /**
   * Apply text watermark using FFmpeg drawtext filter
   */
  private async applyTextWatermark(
    inputPath: string,
    outputPath: string,
    config: TextWatermarkConfig,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Calculate position
      const position = this.calculateTextPosition(config)

      // Build FFmpeg filter
      const filter = this.buildTextDrawFilter(config, position)

      console.log(`📝 Applying text watermark: "${config.text}"`)
      console.log(`📍 Position: ${config.position}`)
      console.log(`🔧 Filter: ${filter}`)

      const command = ffmpeg(inputPath)
        .videoFilters(filter)
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-crf 23',
          '-c:a copy',
        ])
        .output(outputPath)

      // Progress tracking
      command.on('progress', (progress) => {
        if (onProgress && progress.percent) {
          onProgress(Math.min(progress.percent, 99))
        }
      })

      command.on('end', () => {
        console.log('✅ Text watermark applied successfully')
        if (onProgress) onProgress(100)
        resolve()
      })

      command.on('error', (error) => {
        console.error('❌ Text watermark error:', error)
        reject(error)
      })

      command.run()
    })
  }

  /**
   * Build FFmpeg overlay filter for image watermark
   */
  private buildImageOverlayFilter(
    config: ImageWatermarkConfig,
    position: { x: string; y: string }
  ): string {
    const parts: string[] = []

    // Scale watermark if needed
    if (config.width !== 'auto' || config.height !== 'auto') {
      const scaleW = config.width === 'auto' ? '-1' : config.width.toString()
      const scaleH = config.height === 'auto' ? '-1' : config.height.toString()
      parts.push(`[1:v]scale=${scaleW}:${scaleH}[wm]`)
    } else {
      parts.push('[1:v]null[wm]')
    }

    // Apply opacity (alpha)
    if (config.opacity < 1) {
      const alpha = config.opacity.toFixed(2)
      parts.push(`[wm]format=rgba,colorchannelmixer=aa=${alpha}[wm_alpha]`)
    } else {
      parts.push('[wm]null[wm_alpha]')
    }

    // Apply animation if configured
    if (config.animation && config.animation.type !== WatermarkAnimation.NONE) {
      const animFilter = this.buildAnimationFilter(config.animation)
      if (animFilter) {
        parts.push(`[wm_alpha]${animFilter}[wm_anim]`)
      } else {
        parts.push('[wm_alpha]null[wm_anim]')
      }
    } else {
      parts.push('[wm_alpha]null[wm_anim]')
    }

    // Overlay on main video
    parts.push(`[0:v][wm_anim]overlay=${position.x}:${position.y}`)

    return parts.join(';')
  }

  /**
   * Build FFmpeg drawtext filter for text watermark
   */
  private buildTextDrawFilter(
    config: TextWatermarkConfig,
    position: { x: string; y: string }
  ): string {
    const style = config.style
    const escapedText = this.escapeText(config.text)

    const parts: string[] = ['drawtext']

    // Font settings
    parts.push(`fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`) // Default font
    parts.push(`text='${escapedText}'`)
    parts.push(`fontsize=${style.fontSize}`)
    parts.push(`fontcolor=${this.hexToFFmpegColor(style.color)}`)

    // Position
    parts.push(`x=${position.x}`)
    parts.push(`y=${position.y}`)

    // Opacity
    if (config.opacity < 1) {
      const alpha = Math.round(config.opacity * 255).toString(16).padStart(2, '0')
      parts.push(`alpha=${alpha}`)
    }

    // Shadow
    if (style.shadow) {
      parts.push(`shadowcolor=${this.hexToFFmpegColor(style.shadow.color)}`)
      parts.push(`shadowx=${style.shadow.offsetX}`)
      parts.push(`shadowy=${style.shadow.offsetY}`)
    }

    // Stroke/Border
    if (style.stroke) {
      parts.push(`bordercolor=${this.hexToFFmpegColor(style.stroke.color)}`)
      parts.push(`borderw=${style.stroke.width}`)
    }

    // Background box
    if (style.background) {
      parts.push(`box=1`)
      parts.push(`boxcolor=${this.hexToFFmpegColor(style.background.color)}`)
      parts.push(`boxborderw=${style.background.padding}`)
    }

    return parts.join(':')
  }

  /**
   * Calculate image watermark position
   */
  private calculateImagePosition(config: ImageWatermarkConfig): { x: string; y: string } {
    const { position, padding, customPosition } = config

    if (position === WatermarkPosition.CUSTOM && customPosition) {
      if (customPosition.unit === '%') {
        const x = `(main_w*${customPosition.x}/100)`
        const y = `(main_h*${customPosition.y}/100)`
        return { x, y }
      } else {
        return {
          x: customPosition.x.toString(),
          y: customPosition.y.toString(),
        }
      }
    }

    // Calculate based on preset position
    const coords = POSITION_COORDINATES[position]
    let x: string
    let y: string

    // X coordinate
    switch (coords.x) {
      case 'left':
        x = padding.left.toString()
        break
      case 'center':
        x = `(main_w-overlay_w)/2`
        break
      case 'right':
        x = `main_w-overlay_w-${padding.right}`
        break
      default:
        x = '0'
    }

    // Y coordinate
    switch (coords.y) {
      case 'top':
        y = padding.top.toString()
        break
      case 'center':
        y = `(main_h-overlay_h)/2`
        break
      case 'bottom':
        y = `main_h-overlay_h-${padding.bottom}`
        break
      default:
        y = '0'
    }

    return { x, y }
  }

  /**
   * Calculate text watermark position
   */
  private calculateTextPosition(config: TextWatermarkConfig): { x: string; y: string } {
    const { position, padding, customPosition } = config

    if (position === WatermarkPosition.CUSTOM && customPosition) {
      if (customPosition.unit === '%') {
        const x = `(w*${customPosition.x}/100)`
        const y = `(h*${customPosition.y}/100)`
        return { x, y }
      } else {
        return {
          x: customPosition.x.toString(),
          y: customPosition.y.toString(),
        }
      }
    }

    // Calculate based on preset position
    const coords = POSITION_COORDINATES[position]
    let x: string
    let y: string

    // X coordinate
    switch (coords.x) {
      case 'left':
        x = padding.left.toString()
        break
      case 'center':
        x = `(w-text_w)/2`
        break
      case 'right':
        x = `w-text_w-${padding.right}`
        break
      default:
        x = '0'
    }

    // Y coordinate
    switch (coords.y) {
      case 'top':
        y = padding.top.toString()
        break
      case 'center':
        y = `(h-text_h)/2`
        break
      case 'bottom':
        y = `h-text_h-${padding.bottom}`
        break
      default:
        y = '0'
    }

    return { x, y }
  }

  /**
   * Build animation filter expression
   */
  private buildAnimationFilter(animation: { type: WatermarkAnimation; duration: number; delay: number }): string | null {
    const { type, duration, delay } = animation

    switch (type) {
      case WatermarkAnimation.FADE_IN:
        return `fade=t=in:st=${delay}:d=${duration}:alpha=1`
      
      case WatermarkAnimation.FADE_OUT:
        return `fade=t=out:st=${delay}:d=${duration}:alpha=1`
      
      case WatermarkAnimation.SLIDE_IN:
        // Slide in from right
        return `overlay=x='if(lt(t,${delay}),W,-min(0,(t-${delay})*W/${duration}-W))':y=0`
      
      case WatermarkAnimation.ZOOM_IN:
        // Zoom from 0 to 100%
        return `scale='min(1,(t-${delay})/${duration})*iw':'min(1,(t-${delay})/${duration})*ih'`
      
      case WatermarkAnimation.PULSE:
        // Pulsating opacity
        return `format=rgba,colorchannelmixer=aa='0.5+0.5*sin(2*PI*t/${duration})'`
      
      default:
        return null
    }
  }

  /**
   * Resolve image path (handle URLs and local paths)
   */
  private resolveImagePath(imageUrl: string): string {
    // If it's a URL, assume it's already accessible or will be downloaded
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // In production, download the image first
      // For now, return as-is (FFmpeg can handle HTTP URLs)
      return imageUrl
    }

    // If it's a local path, resolve relative to project root
    if (imageUrl.startsWith('/')) {
      return path.join(process.cwd(), 'public', imageUrl)
    }

    return imageUrl
  }

  /**
   * Escape text for FFmpeg
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
  }

  /**
   * Convert hex color to FFmpeg color format
   */
  private hexToFFmpegColor(hex: string): string {
    // Handle rgba colors
    if (hex.startsWith('rgba')) {
      return hex
    }

    // Handle hex colors
    if (hex.startsWith('#')) {
      return hex
    }

    return `#${hex}`
  }
}

/**
 * Singleton instance
 */
export const watermarkRenderer = new WatermarkRenderer()
