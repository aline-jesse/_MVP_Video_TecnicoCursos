/**
 * 🔊 Audio Enhancement System
 * Process and enhance audio tracks using FFmpeg
 */

import ffmpeg from 'fluent-ffmpeg'

/**
 * Audio enhancement types
 */
export enum AudioEnhancementType {
  NORMALIZE = 'normalize',
  COMPRESSION = 'compression',
  NOISE_REDUCTION = 'noise_reduction',
  FADE_IN = 'fade_in',
  FADE_OUT = 'fade_out',
  EQUALIZER = 'equalizer',
  BASS_BOOST = 'bass_boost',
  TREBLE_BOOST = 'treble_boost',
  VOLUME = 'volume',
  DUCKING = 'ducking',
}

/**
 * Audio enhancement configuration
 */
export interface AudioEnhancementConfig {
  type: AudioEnhancementType
  value: number | object
  enabled: boolean
}

/**
 * Normalization config
 */
export interface NormalizationConfig extends AudioEnhancementConfig {
  type: AudioEnhancementType.NORMALIZE
  value: {
    targetLevel: number // dB, typically -16 to -23
    method: 'peak' | 'rms' | 'ebu'
  }
}

/**
 * Compression config
 */
export interface CompressionConfig extends AudioEnhancementConfig {
  type: AudioEnhancementType.COMPRESSION
  value: {
    threshold: number // dB
    ratio: number // e.g., 4:1 = 4
    attack: number // ms
    release: number // ms
  }
}

/**
 * Noise reduction config
 */
export interface NoiseReductionConfig extends AudioEnhancementConfig {
  type: AudioEnhancementType.NOISE_REDUCTION
  value: {
    strength: number // 0-1
    profile?: string // noise profile file path
  }
}

/**
 * Fade config
 */
export interface FadeConfig extends AudioEnhancementConfig {
  type: AudioEnhancementType.FADE_IN | AudioEnhancementType.FADE_OUT
  value: {
    duration: number // seconds
    curve: 'linear' | 'exponential' | 'logarithmic'
  }
}

/**
 * Equalizer config
 */
export interface EqualizerConfig extends AudioEnhancementConfig {
  type: AudioEnhancementType.EQUALIZER
  value: {
    bass: number // -20 to +20 dB
    mid: number // -20 to +20 dB
    treble: number // -20 to +20 dB
  }
}

/**
 * Ducking config (reduce volume when speaking)
 */
export interface DuckingConfig extends AudioEnhancementConfig {
  type: AudioEnhancementType.DUCKING
  value: {
    threshold: number // dB
    reduction: number // dB
    attack: number // ms
    release: number // ms
  }
}

/**
 * Audio preset
 */
export interface AudioPreset {
  id: string
  name: string
  description: string
  enhancements: AudioEnhancementConfig[]
}

/**
 * Audio Processor Class
 */
export class AudioProcessor {
  /**
   * Apply audio enhancements
   */
  async processAudio(
    inputPath: string,
    outputPath: string,
    enhancements: AudioEnhancementConfig[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Build filter chain
      const filterChain = this.buildAudioFilterChain(enhancements)

      console.log(`🔊 Applying ${enhancements.length} audio enhancements`)
      console.log(`🔧 Filter chain: ${filterChain}`)

      const command = ffmpeg(inputPath)
        .audioFilters(filterChain)
        .outputOptions(['-c:v copy', '-c:a aac', '-b:a 192k'])
        .output(outputPath)

      command.on('progress', (progress) => {
        if (onProgress && progress.percent) {
          onProgress(Math.min(progress.percent, 99))
        }
      })

      command.on('end', () => {
        console.log('✅ Audio processing complete')
        if (onProgress) onProgress(100)
        resolve()
      })

      command.on('error', (error) => {
        console.error('❌ Audio processing error:', error)
        reject(error)
      })

      command.run()
    })
  }

  /**
   * Build FFmpeg audio filter chain
   */
  private buildAudioFilterChain(enhancements: AudioEnhancementConfig[]): string {
    const activeEnhancements = enhancements.filter((e) => e.enabled)
    if (activeEnhancements.length === 0) return 'anull'

    const filterStrings = activeEnhancements.map((enhancement) =>
      this.buildAudioFilterString(enhancement)
    )
    return filterStrings.join(',')
  }

  /**
   * Build FFmpeg filter string for individual enhancement
   */
  private buildAudioFilterString(enhancement: AudioEnhancementConfig): string {
    switch (enhancement.type) {
      case AudioEnhancementType.NORMALIZE:
        const normValue = enhancement.value as { targetLevel: number; method: string }
        return `loudnorm=I=${normValue.targetLevel}:TP=-1.5:LRA=11`

      case AudioEnhancementType.COMPRESSION:
        const compValue = enhancement.value as {
          threshold: number
          ratio: number
          attack: number
          release: number
        }
        return `acompressor=threshold=${compValue.threshold}dB:ratio=${compValue.ratio}:attack=${compValue.attack}:release=${compValue.release}`

      case AudioEnhancementType.NOISE_REDUCTION:
        const noiseValue = enhancement.value as { strength: number }
        return `afftdn=nf=${noiseValue.strength * 100}`

      case AudioEnhancementType.FADE_IN:
        const fadeInValue = enhancement.value as { duration: number; curve: string }
        return `afade=t=in:st=0:d=${fadeInValue.duration}:curve=${fadeInValue.curve}`

      case AudioEnhancementType.FADE_OUT:
        const fadeOutValue = enhancement.value as { duration: number; curve: string }
        // Note: startTime should be calculated from video duration
        return `afade=t=out:d=${fadeOutValue.duration}:curve=${fadeOutValue.curve}`

      case AudioEnhancementType.EQUALIZER:
        const eqValue = enhancement.value as { bass: number; mid: number; treble: number }
        // 3-band equalizer using equalizer filter
        return `equalizer=f=100:width_type=h:width=100:g=${eqValue.bass},equalizer=f=1000:width_type=h:width=200:g=${eqValue.mid},equalizer=f=10000:width_type=h:width=2000:g=${eqValue.treble}`

      case AudioEnhancementType.BASS_BOOST:
        return `equalizer=f=100:width_type=h:width=100:g=${enhancement.value}`

      case AudioEnhancementType.TREBLE_BOOST:
        return `equalizer=f=10000:width_type=h:width=2000:g=${enhancement.value}`

      case AudioEnhancementType.VOLUME:
        return `volume=${enhancement.value}dB`

      case AudioEnhancementType.DUCKING:
        const duckValue = enhancement.value as {
          threshold: number
          reduction: number
          attack: number
          release: number
        }
        return `sidechaincompress=threshold=${duckValue.threshold}dB:ratio=4:attack=${duckValue.attack}:release=${duckValue.release}`

      default:
        return 'anull'
    }
  }

  /**
   * Get audio presets
   */
  static getPresets(): AudioPreset[] {
    return [
      {
        id: 'podcast',
        name: 'Podcast Profissional',
        description: 'Otimizado para voz clara com redução de ruído',
        enhancements: [
          {
            type: AudioEnhancementType.NORMALIZE,
            value: { targetLevel: -16, method: 'ebu' },
            enabled: true,
          },
          {
            type: AudioEnhancementType.NOISE_REDUCTION,
            value: { strength: 0.5 },
            enabled: true,
          },
          {
            type: AudioEnhancementType.COMPRESSION,
            value: { threshold: -20, ratio: 4, attack: 5, release: 50 },
            enabled: true,
          },
        ],
      },
      {
        id: 'music',
        name: 'Música Dinâmica',
        description: 'Equalização balanceada para música',
        enhancements: [
          {
            type: AudioEnhancementType.NORMALIZE,
            value: { targetLevel: -14, method: 'ebu' },
            enabled: true,
          },
          {
            type: AudioEnhancementType.EQUALIZER,
            value: { bass: 3, mid: 0, treble: 2 },
            enabled: true,
          },
        ],
      },
      {
        id: 'voice-clarity',
        name: 'Clareza Vocal',
        description: 'Enfatiza frequências de voz',
        enhancements: [
          {
            type: AudioEnhancementType.NORMALIZE,
            value: { targetLevel: -18, method: 'rms' },
            enabled: true,
          },
          {
            type: AudioEnhancementType.EQUALIZER,
            value: { bass: -2, mid: 4, treble: 1 },
            enabled: true,
          },
          {
            type: AudioEnhancementType.COMPRESSION,
            value: { threshold: -18, ratio: 3, attack: 10, release: 100 },
            enabled: true,
          },
        ],
      },
      {
        id: 'broadcast',
        name: 'Padrão Broadcast',
        description: 'Normalização para transmissão',
        enhancements: [
          {
            type: AudioEnhancementType.NORMALIZE,
            value: { targetLevel: -23, method: 'ebu' },
            enabled: true,
          },
          {
            type: AudioEnhancementType.COMPRESSION,
            value: { threshold: -24, ratio: 6, attack: 5, release: 50 },
            enabled: true,
          },
        ],
      },
    ]
  }

  /**
   * Create custom enhancement
   */
  static createEnhancement(
    type: AudioEnhancementType,
    value: number | object,
    enabled: boolean = true
  ): AudioEnhancementConfig {
    return {
      type,
      value: value as any,
      enabled,
    }
  }

  /**
   * Analyze audio levels
   */
  async analyzeAudio(filePath: string): Promise<AudioAnalysis> {
    return new Promise((resolve, reject) => {
      let output = ''

      const command = ffmpeg(filePath)
        .outputOptions(['-af', 'volumedetect', '-f', 'null'])
        .output('-')

      command.on('stderr', (line: string) => {
        output += line + '\n'
      })

      command.on('end', () => {
        const analysis = this.parseVolumeDetect(output)
        resolve(analysis)
      })

      command.on('error', (error) => {
        reject(error)
      })

      command.run()
    })
  }

  /**
   * Parse volumedetect output
   */
  private parseVolumeDetect(output: string): AudioAnalysis {
    const meanVolumeMatch = output.match(/mean_volume: (-?\d+\.?\d*) dB/)
    const maxVolumeMatch = output.match(/max_volume: (-?\d+\.?\d*) dB/)

    return {
      meanVolume: meanVolumeMatch ? parseFloat(meanVolumeMatch[1]) : 0,
      maxVolume: maxVolumeMatch ? parseFloat(maxVolumeMatch[1]) : 0,
      needsNormalization: meanVolumeMatch ? parseFloat(meanVolumeMatch[1]) < -20 : false,
    }
  }
}

/**
 * Audio analysis result
 */
export interface AudioAnalysis {
  meanVolume: number
  maxVolume: number
  needsNormalization: boolean
}

/**
 * Singleton instance
 */
export const audioProcessor = new AudioProcessor()

/**
 * Default enhancement values
 */
export const DEFAULT_ENHANCEMENT_VALUES: Record<AudioEnhancementType, number | object> = {
  [AudioEnhancementType.NORMALIZE]: { targetLevel: -16, method: 'ebu' },
  [AudioEnhancementType.COMPRESSION]: { threshold: -20, ratio: 4, attack: 5, release: 50 },
  [AudioEnhancementType.NOISE_REDUCTION]: { strength: 0.5 },
  [AudioEnhancementType.FADE_IN]: { duration: 1, curve: 'linear' },
  [AudioEnhancementType.FADE_OUT]: { duration: 1, curve: 'linear' },
  [AudioEnhancementType.EQUALIZER]: { bass: 0, mid: 0, treble: 0 },
  [AudioEnhancementType.BASS_BOOST]: 5,
  [AudioEnhancementType.TREBLE_BOOST]: 5,
  [AudioEnhancementType.VOLUME]: 0,
  [AudioEnhancementType.DUCKING]: { threshold: -30, reduction: -10, attack: 10, release: 100 },
}
