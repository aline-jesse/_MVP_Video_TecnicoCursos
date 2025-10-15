/**
 * 🔍 Video File Validator
 * Validates input video files before processing
 */

import fs from 'fs/promises'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'

/**
 * Supported video formats
 */
export const SUPPORTED_FORMATS = [
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',
  '.flv',
  '.wmv',
  '.m4v',
]

/**
 * Video validation result
 */
export interface VideoValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  metadata?: {
    format: string
    duration: number
    width: number
    height: number
    fps: number
    videoCodec: string
    audioCodec: string
    bitrate: number
    size: number
  }
}

/**
 * Video File Validator
 */
export class VideoValidator {
  /**
   * Validate video file
   */
  async validate(filePath: string): Promise<VideoValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if file exists
    try {
      await fs.access(filePath, fs.constants.R_OK)
    } catch {
      errors.push('Arquivo não encontrado ou sem permissão de leitura')
      return { valid: false, errors, warnings }
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase()
    if (!SUPPORTED_FORMATS.includes(ext)) {
      errors.push(
        `Formato não suportado: ${ext}. Formatos suportados: ${SUPPORTED_FORMATS.join(', ')}`
      )
    }

    // Check file size
    try {
      const stats = await fs.stat(filePath)
      const sizeInMB = stats.size / (1024 * 1024)

      if (stats.size === 0) {
        errors.push('Arquivo vazio (0 bytes)')
      } else if (sizeInMB > 5000) {
        warnings.push(`Arquivo muito grande (${sizeInMB.toFixed(2)} MB). Processamento pode ser lento.`)
      }
    } catch (error) {
      errors.push(`Erro ao ler informações do arquivo: ${error}`)
    }

    // If basic validation failed, return early
    if (errors.length > 0) {
      return { valid: false, errors, warnings }
    }

    // Probe video metadata using FFmpeg
    try {
      const metadata = await this.probeVideo(filePath)

      // Validate video stream exists
      if (!metadata.videoCodec) {
        errors.push('Nenhum stream de vídeo encontrado')
      }

      // Validate duration
      if (metadata.duration <= 0) {
        errors.push('Duração do vídeo inválida')
      } else if (metadata.duration > 7200) {
        warnings.push('Vídeo muito longo (>2h). Processamento pode ser muito lento.')
      }

      // Validate resolution
      if (metadata.width <= 0 || metadata.height <= 0) {
        errors.push('Resolução do vídeo inválida')
      } else if (metadata.width > 7680 || metadata.height > 4320) {
        warnings.push('Resolução muito alta (>8K). Processamento pode ser muito lento.')
      }

      // Validate codecs
      const supportedVideoCodecs = ['h264', 'h265', 'hevc', 'vp8', 'vp9', 'av1', 'mpeg4']
      if (metadata.videoCodec && !supportedVideoCodecs.includes(metadata.videoCodec.toLowerCase())) {
        warnings.push(`Codec de vídeo ${metadata.videoCodec} pode requerer recodificação`)
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata,
      }
    } catch (error) {
      errors.push(`Erro ao analisar metadados do vídeo: ${error}`)
      return { valid: false, errors, warnings }
    }
  }

  /**
   * Probe video metadata using FFmpeg
   */
  private async probeVideo(filePath: string): Promise<VideoValidationResult['metadata']> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err)
          return
        }

        const videoStream = metadata.streams.find((s) => s.codec_type === 'video')
        const audioStream = metadata.streams.find((s) => s.codec_type === 'audio')

        if (!videoStream) {
          reject(new Error('No video stream found'))
          return
        }

        resolve({
          format: metadata.format.format_name || 'unknown',
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          fps: this.parseFps(videoStream.r_frame_rate || '0/1'),
          videoCodec: videoStream.codec_name || 'unknown',
          audioCodec: audioStream?.codec_name || 'none',
          bitrate: typeof metadata.format.bit_rate === 'number' 
            ? metadata.format.bit_rate 
            : parseInt(metadata.format.bit_rate || '0', 10),
          size: typeof metadata.format.size === 'number'
            ? metadata.format.size
            : parseInt(metadata.format.size || '0', 10),
        })
      })
    })
  }

  /**
   * Parse FPS from string like "30/1" to number
   */
  private parseFps(fpsString: string): number {
    const [num, den] = fpsString.split('/').map(Number)
    return den > 0 ? num / den : 0
  }
}

/**
 * Singleton instance
 */
export const videoValidator = new VideoValidator()
