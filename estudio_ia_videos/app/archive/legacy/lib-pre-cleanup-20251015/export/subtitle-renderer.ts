/**
 * 🎬 Subtitle Renderer
 * Burn subtitles into video using FFmpeg
 */

import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs/promises'
import {
  SubtitleFile,
  SubtitleFormat,
  SubtitleRenderOptions,
  DEFAULT_SUBTITLE_RENDER_OPTIONS,
} from '@/types/subtitle.types'
import { SubtitleParser } from './subtitle-parser'

export interface SubtitleRenderResult {
  success: boolean
  outputPath?: string
  error?: string
  processingTime: number
}

export class SubtitleRenderer {
  /**
   * Burn subtitles into video
   */
  async renderSubtitles(
    inputPath: string,
    outputPath: string,
    options: SubtitleRenderOptions,
    onProgress?: (progress: number) => void
  ): Promise<SubtitleRenderResult> {
    const startTime = Date.now()

    try {
      // Prepare subtitle file
      const subtitlePath = await this.prepareSubtitleFile(options)

      // Apply subtitles using FFmpeg
      await this.applySubtitlesFFmpeg(inputPath, outputPath, subtitlePath, options, onProgress)

      // Cleanup temporary subtitle file if created
      if (typeof options.subtitleSource !== 'string' || !options.subtitleSource.endsWith('.srt')) {
        await fs.unlink(subtitlePath).catch(() => {})
      }

      return {
        success: true,
        outputPath,
        processingTime: Date.now() - startTime,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Prepare subtitle file for FFmpeg
   */
  private async prepareSubtitleFile(options: SubtitleRenderOptions): Promise<string> {
    // If source is already a file path, use it directly
    if (typeof options.subtitleSource === 'string') {
      // Check if it's a file path
      try {
        await fs.access(options.subtitleSource)
        return options.subtitleSource
      } catch {
        // Treat as subtitle content
        const tempPath = path.join('/tmp', `subtitle_${Date.now()}.srt`)
        await fs.writeFile(tempPath, options.subtitleSource, 'utf-8')
        return tempPath
      }
    }

    // Convert SubtitleFile to SRT format
    const subtitleFile = options.subtitleSource as SubtitleFile
    const srtContent = SubtitleParser.convert(subtitleFile, SubtitleFormat.SRT)
    
    const tempPath = path.join('/tmp', `subtitle_${Date.now()}.srt`)
    await fs.writeFile(tempPath, srtContent, 'utf-8')
    
    return tempPath
  }

  /**
   * Apply subtitles using FFmpeg subtitles filter
   */
  private async applySubtitlesFFmpeg(
    inputPath: string,
    outputPath: string,
    subtitlePath: string,
    options: SubtitleRenderOptions,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const mergedOptions = { ...DEFAULT_SUBTITLE_RENDER_OPTIONS, ...options }
      
      // Build subtitle filter
      const filter = this.buildSubtitleFilter(subtitlePath, mergedOptions)

      console.log(`📝 Applying subtitles from: ${subtitlePath}`)
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
        console.log('✅ Subtitles applied successfully')
        if (onProgress) onProgress(100)
        resolve()
      })

      command.on('error', (error) => {
        console.error('❌ Subtitle rendering error:', error)
        reject(error)
      })

      command.run()
    })
  }

  /**
   * Build FFmpeg subtitle filter
   */
  private buildSubtitleFilter(
    subtitlePath: string,
    options: SubtitleRenderOptions
  ): string {
    const parts: string[] = []

    // Escape subtitle path for FFmpeg
    const escapedPath = subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:')

    // Base subtitles filter
    parts.push(`subtitles=${escapedPath}`)

    // Font settings
    if (options.font) {
      parts.push(`force_style='FontName=${options.font.family}`)
      parts.push(`FontSize=${options.font.size}`)
      parts.push(`PrimaryColour=${this.colorToASS(options.font.color)}`)
      parts.push(`OutlineColour=${this.colorToASS(options.font.outlineColor)}`)
      parts.push(`Outline=${options.font.outlineWidth}`)
      
      if (options.shadow?.enabled) {
        parts.push(`Shadow=2`)
      }
      
      // Alignment (ASS format)
      let alignment = 2 // Bottom center by default
      if (options.position?.alignment === 'top') {
        alignment = 8
      } else if (options.position?.alignment === 'center') {
        alignment = 5
      }
      parts.push(`Alignment=${alignment}`)
      
      if (options.position?.marginV) {
        parts.push(`MarginV=${options.position.marginV}`)
      }
      
      parts.push(`'`)
    }

    return parts.join(':')
  }

  /**
   * Alternative method using drawtext filter (more control)
   */
  private buildDrawtextFilter(
    subtitles: SubtitleFile,
    options: SubtitleRenderOptions
  ): string {
    const filters: string[] = []

    // Create a drawtext filter for each subtitle cue
    subtitles.cues.forEach((cue) => {
      const text = cue.text.replace(/'/g, "\\'").replace(/\n/g, ' ')
      
      const filter = [
        'drawtext',
        `text='${text}'`,
        `fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf`,
        `fontsize=${options.font?.size || 24}`,
        `fontcolor=${options.font?.color || 'white'}`,
        `x=(w-text_w)/2`, // Center horizontally
        `y=h-th-${options.position?.marginV || 20}`, // Position from bottom
        `enable='between(t,${cue.startTime},${cue.endTime})'`, // Time range
      ]

      // Add border/outline
      if (options.font?.outlineWidth) {
        filter.push(`borderw=${options.font.outlineWidth}`)
        filter.push(`bordercolor=${options.font.outlineColor || 'black'}`)
      }

      // Add shadow
      if (options.shadow?.enabled) {
        filter.push(`shadowcolor=black@0.5`)
        filter.push(`shadowx=${options.shadow.offsetX || 2}`)
        filter.push(`shadowy=${options.shadow.offsetY || 2}`)
      }

      filters.push(filter.join(':'))
    })

    return filters.join(',')
  }

  /**
   * Convert hex color to ASS color format
   */
  private colorToASS(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '')

    // ASS uses BGR instead of RGB, with alpha
    // Format: &HAABBGGRR
    if (hex.length === 6) {
      const r = hex.substring(0, 2)
      const g = hex.substring(2, 4)
      const b = hex.substring(4, 6)
      return `&H00${b}${g}${r}`
    }

    // Default to white
    return '&H00FFFFFF'
  }

  /**
   * Extract subtitles from video (if embedded)
   */
  async extractSubtitles(
    inputPath: string,
    outputPath: string,
    format: SubtitleFormat = SubtitleFormat.SRT
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const extension = format === SubtitleFormat.VTT ? 'vtt' : 'srt'
      const outputFile = outputPath || `${inputPath}.${extension}`

      ffmpeg(inputPath)
        .outputOptions([
          '-map 0:s:0', // First subtitle stream
          `-c:s ${format === SubtitleFormat.VTT ? 'webvtt' : 'srt'}`,
        ])
        .output(outputFile)
        .on('end', () => {
          console.log('✅ Subtitles extracted successfully')
          resolve(outputFile)
        })
        .on('error', (error) => {
          console.error('❌ Subtitle extraction error:', error)
          reject(error)
        })
        .run()
    })
  }

  /**
   * Generate auto-subtitles using speech recognition (placeholder)
   */
  async generateAutoSubtitles(
    inputPath: string,
    language: string = 'pt-BR'
  ): Promise<SubtitleFile> {
    // TODO: Integrate with speech-to-text service (Whisper, Google Speech, etc.)
    console.log(`🎤 Generating auto-subtitles for ${inputPath} in ${language}`)
    
    // For now, return empty subtitle file
    return {
      format: SubtitleFormat.SRT,
      cues: [],
      metadata: {
        language,
        title: 'Auto-generated subtitles',
      },
    }
  }
}

/**
 * Singleton instance
 */
export const subtitleRenderer = new SubtitleRenderer()
