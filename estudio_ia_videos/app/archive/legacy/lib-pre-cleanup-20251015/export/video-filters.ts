/**
 * 🎨 Video Filters System
 * Apply visual effects and filters to videos using FFmpeg
 */

import ffmpeg from 'fluent-ffmpeg'

// Re-export types from shared types file
export * from './video-filters-types'
import type {
  VideoFilterType,
  VideoFilterConfig,
  FilterPreset,
  BrightnessContrastFilter,
  SaturationFilter,
  BlurFilter,
  VignetteFilter,
  FadeFilter,
} from './video-filters-types'
import { DEFAULT_FILTER_VALUES, FILTER_PRESETS } from './video-filters-types'

/**
 * Video Filters Class
 */
export class VideoFilters {
  /**
   * Apply filters to video
   */
  async applyFilters(
    inputPath: string,
    outputPath: string,
    filters: VideoFilterConfig[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Build filter chain
      const filterChain = this.buildFilterChain(filters)

      console.log(`🎨 Applying ${filters.length} filters`)
      console.log(`🔧 Filter chain: ${filterChain}`)

      const command = ffmpeg(inputPath)
        .videoFilters(filterChain)
        .outputOptions(['-c:v libx264', '-preset fast', '-crf 23', '-c:a copy'])
        .output(outputPath)

      command.on('progress', (progress) => {
        if (onProgress && progress.percent) {
          onProgress(Math.min(progress.percent, 99))
        }
      })

      command.on('end', () => {
        console.log('✅ Filters applied successfully')
        if (onProgress) onProgress(100)
        resolve()
      })

      command.on('error', (error) => {
        console.error('❌ Filter application error:', error)
        reject(error)
      })

      command.run()
    })
  }

  /**
   * Build FFmpeg filter chain from filter configs
   */
  private buildFilterChain(filters: VideoFilterConfig[]): string {
    const activeFilters = filters.filter((f) => f.enabled)
    if (activeFilters.length === 0) return 'null'

    const filterStrings = activeFilters.map((filter) => this.buildFilterString(filter))
    return filterStrings.join(',')
  }

  /**
   * Build FFmpeg filter string for individual filter
   */
  private buildFilterString(filter: VideoFilterConfig): string {
    switch (filter.type) {
      case VideoFilterType.BRIGHTNESS:
        return `eq=brightness=${filter.value}:contrast=1`

      case VideoFilterType.CONTRAST:
        return `eq=contrast=${(filter.value as number) + 1}:brightness=0`

      case VideoFilterType.SATURATION:
        return `eq=saturation=${filter.value}`

      case VideoFilterType.HUE:
        return `hue=h=${filter.value}`

      case VideoFilterType.BLUR:
        return `boxblur=${filter.value}:1`

      case VideoFilterType.SHARPEN:
        return `unsharp=5:5:${filter.value}:5:5:0.0`

      case VideoFilterType.SEPIA:
        return `colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`

      case VideoFilterType.GRAYSCALE:
        return `hue=s=0`

      case VideoFilterType.VIGNETTE:
        const vignetteValue = filter.value as { angle: number; intensity: number }
        return `vignette=angle=${vignetteValue.angle * (Math.PI / 180)}:intensity=${vignetteValue.intensity}`

      case VideoFilterType.FADE:
        const fadeValue = filter.value as { type: string; startTime: number; duration: number }
        return `fade=t=${fadeValue.type}:st=${fadeValue.startTime}:d=${fadeValue.duration}`

      case VideoFilterType.COLORIZE:
        return `colorbalance=${filter.value}`

      case VideoFilterType.NOISE:
        return `noise=alls=${filter.value}:allf=t+u`

      case VideoFilterType.DENOISE:
        return `hqdn3d=${filter.value}`

      default:
        return 'null'
    }
  }

  /**
   * Get filter presets
   */
  static getPresets(): FilterPreset[] {
    return [
      {
        id: 'cinematic',
        name: 'Cinematográfico',
        description: 'Efeito de filme com vinheta e cores quentes',
        filters: [
          {
            type: VideoFilterType.CONTRAST,
            value: 0.1,
            enabled: true,
          },
          {
            type: VideoFilterType.SATURATION,
            value: 1.2,
            enabled: true,
          },
          {
            type: VideoFilterType.VIGNETTE,
            value: { angle: 90, intensity: 0.3 },
            enabled: true,
          },
        ],
      },
      {
        id: 'vintage',
        name: 'Vintage',
        description: 'Efeito retrô com sépia e vinheta',
        filters: [
          {
            type: VideoFilterType.SEPIA,
            value: 1.0,
            enabled: true,
          },
          {
            type: VideoFilterType.CONTRAST,
            value: 0.2,
            enabled: true,
          },
          {
            type: VideoFilterType.VIGNETTE,
            value: { angle: 90, intensity: 0.5 },
            enabled: true,
          },
        ],
      },
      {
        id: 'vivid',
        name: 'Cores Vibrantes',
        description: 'Cores saturadas e brilhantes',
        filters: [
          {
            type: VideoFilterType.SATURATION,
            value: 1.5,
            enabled: true,
          },
          {
            type: VideoFilterType.CONTRAST,
            value: 0.15,
            enabled: true,
          },
          {
            type: VideoFilterType.SHARPEN,
            value: 1.0,
            enabled: true,
          },
        ],
      },
      {
        id: 'black-white',
        name: 'Preto e Branco',
        description: 'Conversão para preto e branco clássico',
        filters: [
          {
            type: VideoFilterType.GRAYSCALE,
            value: 1.0,
            enabled: true,
          },
          {
            type: VideoFilterType.CONTRAST,
            value: 0.2,
            enabled: true,
          },
        ],
      },
      {
        id: 'soft-blur',
        name: 'Desfoque Suave',
        description: 'Efeito sonhador com desfoque leve',
        filters: [
          {
            type: VideoFilterType.BLUR,
            value: 3,
            enabled: true,
          },
          {
            type: VideoFilterType.BRIGHTNESS,
            value: 0.1,
            enabled: true,
          },
        ],
      },
      {
        id: 'sharp-hd',
        name: 'Nitidez HD',
        description: 'Maior nitidez e contraste',
        filters: [
          {
            type: VideoFilterType.SHARPEN,
            value: 1.5,
            enabled: true,
          },
          {
            type: VideoFilterType.CONTRAST,
            value: 0.1,
            enabled: true,
          },
        ],
      },
    ]
  }

  /**
   * Create custom filter
   */
  static createFilter(
    type: VideoFilterType,
    value: number | string | object,
    enabled: boolean = true
  ): VideoFilterConfig {
    return {
      type,
      value: value as any,
      enabled,
    }
  }

  /**
   * Combine multiple filters into a preset
   */
  static createPreset(
    id: string,
    name: string,
    description: string,
    filters: VideoFilterConfig[]
  ): FilterPreset {
    return {
      id,
      name,
      description,
      filters,
    }
  }
}

/**
 * Singleton instance
 */
export const videoFilters = new VideoFilters()

/**
 * Default filter values
 */
export const DEFAULT_FILTER_VALUES: Record<VideoFilterType, number | object> = {
  [VideoFilterType.BRIGHTNESS]: 0,
  [VideoFilterType.CONTRAST]: 0,
  [VideoFilterType.SATURATION]: 1.0,
  [VideoFilterType.HUE]: 0,
  [VideoFilterType.BLUR]: 0,
  [VideoFilterType.SHARPEN]: 0,
  [VideoFilterType.SEPIA]: 1.0,
  [VideoFilterType.GRAYSCALE]: 1.0,
  [VideoFilterType.VIGNETTE]: { angle: 90, intensity: 0.3 },
  [VideoFilterType.FADE]: { type: 'in', startTime: 0, duration: 1 },
  [VideoFilterType.COLORIZE]: '0:0:0',
  [VideoFilterType.NOISE]: 5,
  [VideoFilterType.DENOISE]: 4,
}
