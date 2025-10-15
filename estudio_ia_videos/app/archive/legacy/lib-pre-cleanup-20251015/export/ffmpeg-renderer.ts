/**
 * FFmpeg Video Renderer
 * Processa timeline e renderiza vídeo usando FFmpeg
 */

import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import {
  ExportSettings,
  ExportFormat,
  ExportPhase,
  RESOLUTION_CONFIGS,
  QUALITY_CONFIGS,
  CODEC_CONFIGS,
} from '@/types/export.types'

export interface RenderOptions {
  jobId: string
  timelineData: any
  settings: ExportSettings
  outputPath: string
  onProgress?: (progress: number, phase: ExportPhase, message: string) => void
  onComplete?: (outputPath: string, fileSize: number, duration: number) => void
  onError?: (error: string) => void
}

export class FFmpegRenderer {
  private ffmpegPath: string = 'ffmpeg' // Assume FFmpeg no PATH

  /**
   * Renderiza vídeo completo
   */
  async renderVideo(options: RenderOptions): Promise<void> {
    const { jobId, timelineData, settings, outputPath, onProgress, onComplete, onError } =
      options

    try {
      console.log(`[FFmpegRenderer] Starting render for job ${jobId}`)

      // Fase 1: Inicialização
      onProgress?.(0, ExportPhase.INITIALIZING, 'Preparando arquivos...')
      await this.prepareWorkspace(jobId)

      // Fase 2: Processamento de vídeo
      onProgress?.(10, ExportPhase.PROCESSING_VIDEO, 'Processando faixas de vídeo...')
      const videoInputs = await this.processVideoTracks(jobId, timelineData, settings)

      // Fase 3: Processamento de áudio
      onProgress?.(40, ExportPhase.PROCESSING_AUDIO, 'Processando faixas de áudio...')
      const audioInputs = await this.processAudioTracks(jobId, timelineData, settings)

      // Fase 4: Mesclagem
      onProgress?.(60, ExportPhase.MERGING, 'Mesclando vídeo e áudio...')
      const mergedFile = await this.mergeVideoAudio(jobId, videoInputs, audioInputs, settings)

      // Fase 5: Encoding final
      onProgress?.(80, ExportPhase.ENCODING, 'Codificando vídeo final...')
      await this.encodeVideo(mergedFile, outputPath, settings, (progress) => {
        const encodingProgress = 80 + (progress / 100) * 15 // 80-95%
        onProgress?.(encodingProgress, ExportPhase.ENCODING, `Codificando: ${progress}%`)
      })

      // Fase 6: Finalização
      onProgress?.(95, ExportPhase.FINALIZING, 'Finalizando...')
      const fileStats = await fs.stat(outputPath)
      const duration = await this.getVideoDuration(outputPath)

      await this.cleanupWorkspace(jobId)

      onProgress?.(100, ExportPhase.FINALIZING, 'Concluído!')
      onComplete?.(outputPath, fileStats.size, duration)

      console.log(`[FFmpegRenderer] Render completed for job ${jobId}`)
    } catch (error) {
      console.error(`[FFmpegRenderer] Render failed for job ${jobId}:`, error)
      onError?.(String(error))
      await this.cleanupWorkspace(jobId).catch(() => {})
      throw error
    }
  }

  /**
   * Prepara workspace temporário
   */
  private async prepareWorkspace(jobId: string): Promise<void> {
    const workspacePath = this.getWorkspacePath(jobId)
    await fs.mkdir(workspacePath, { recursive: true })
    console.log(`[FFmpegRenderer] Workspace created: ${workspacePath}`)
  }

  /**
   * Processa faixas de vídeo
   */
  private async processVideoTracks(
    jobId: string,
    timelineData: any,
    settings: ExportSettings
  ): Promise<string[]> {
    const workspacePath = this.getWorkspacePath(jobId)
    const videoInputs: string[] = []

    // Simplificação: Assume que timelineData.videoTracks contém clips
    const videoTracks = timelineData.videoTracks || []

    for (let i = 0; i < videoTracks.length; i++) {
      const track = videoTracks[i]
      const trackOutputPath = path.join(workspacePath, `video_track_${i}.mp4`)

      // Processar clips da track
      await this.processVideoClips(track.clips, trackOutputPath, settings)
      videoInputs.push(trackOutputPath)
    }

    return videoInputs
  }

  /**
   * Processa clips de vídeo individuais
   */
  private async processVideoClips(
    clips: any[],
    outputPath: string,
    settings: ExportSettings
  ): Promise<void> {
    if (!clips || clips.length === 0) {
      throw new Error('No video clips to process')
    }

    // Simplificação: Concatenar clips
    const filterComplex = this.buildVideoFilterChain(clips, settings)
    const resolution = RESOLUTION_CONFIGS[settings.resolution]

    const args = [
      ...clips.flatMap((clip: any) => ['-i', clip.source]), // Inputs
      '-filter_complex',
      filterComplex,
      '-s',
      `${resolution.width}x${resolution.height}`,
      '-r',
      String(settings.fps),
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast', // Fast para intermediário
      '-crf',
      '18',
      '-y',
      outputPath,
    ]

    await this.runFFmpeg(args)
  }

  /**
   * Constrói filter chain para vídeo
   */
  private buildVideoFilterChain(clips: any[], settings: ExportSettings): string {
    // Simplificação: Concatenar clips sem transições complexas
    const filters: string[] = []

    clips.forEach((clip, index) => {
      filters.push(`[${index}:v]scale=${RESOLUTION_CONFIGS[settings.resolution].width}:${RESOLUTION_CONFIGS[settings.resolution].height}[v${index}]`)
    })

    const concatInputs = clips.map((_, i) => `[v${i}]`).join('')
    filters.push(`${concatInputs}concat=n=${clips.length}:v=1:a=0[outv]`)

    return filters.join(';')
  }

  /**
   * Processa faixas de áudio
   */
  private async processAudioTracks(
    jobId: string,
    timelineData: any,
    settings: ExportSettings
  ): Promise<string[]> {
    const workspacePath = this.getWorkspacePath(jobId)
    const audioInputs: string[] = []

    const audioTracks = timelineData.audioTracks || []

    for (let i = 0; i < audioTracks.length; i++) {
      const track = audioTracks[i]
      const trackOutputPath = path.join(workspacePath, `audio_track_${i}.aac`)

      await this.processAudioClips(track.clips, trackOutputPath, settings)
      audioInputs.push(trackOutputPath)
    }

    return audioInputs
  }

  /**
   * Processa clips de áudio
   */
  private async processAudioClips(
    clips: any[],
    outputPath: string,
    settings: ExportSettings
  ): Promise<void> {
    if (!clips || clips.length === 0) return

    const args = [
      ...clips.flatMap((clip: any) => ['-i', clip.source]),
      '-filter_complex',
      `concat=n=${clips.length}:v=0:a=1[outa]`,
      '-map',
      '[outa]',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-y',
      outputPath,
    ]

    await this.runFFmpeg(args)
  }

  /**
   * Mescla vídeo e áudio
   */
  private async mergeVideoAudio(
    jobId: string,
    videoInputs: string[],
    audioInputs: string[],
    settings: ExportSettings
  ): Promise<string> {
    const workspacePath = this.getWorkspacePath(jobId)
    const mergedPath = path.join(workspacePath, 'merged.mp4')

    const inputs = [...videoInputs, ...audioInputs]

    const args = [
      ...inputs.flatMap((input) => ['-i', input]),
      '-c:v',
      'copy',
      '-c:a',
      'copy',
      '-y',
      mergedPath,
    ]

    await this.runFFmpeg(args)
    return mergedPath
  }

  /**
   * Codifica vídeo final com settings
   */
  private async encodeVideo(
    inputPath: string,
    outputPath: string,
    settings: ExportSettings,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const resolution = RESOLUTION_CONFIGS[settings.resolution]
    const quality = QUALITY_CONFIGS[settings.quality]
    const codec = CODEC_CONFIGS[settings.format]

    const args = [
      '-i',
      inputPath,
      '-c:v',
      codec.video,
      '-crf',
      String(quality.crf),
      '-preset',
      quality.preset,
      '-s',
      `${resolution.width}x${resolution.height}`,
      '-r',
      String(settings.fps),
      '-b:v',
      settings.bitrate || `${resolution.bitrate}k`,
      '-c:a',
      codec.audio,
      '-b:a',
      '192k',
      '-y',
      outputPath,
    ]

    await this.runFFmpeg(args, (progress) => {
      onProgress?.(progress)
    })
  }

  /**
   * Executa comando FFmpeg
   */
  private runFFmpeg(args: string[], onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[FFmpegRenderer] Running: ffmpeg ${args.join(' ')}`)

      const ffmpeg = spawn(this.ffmpegPath, args)
      let duration = 0
      let lastProgress = 0

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString()

        // Parse duration
        const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/)
        if (durationMatch) {
          duration =
            parseInt(durationMatch[1]) * 3600 +
            parseInt(durationMatch[2]) * 60 +
            parseInt(durationMatch[3])
        }

        // Parse progress
        const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/)
        if (timeMatch && duration > 0) {
          const currentTime =
            parseInt(timeMatch[1]) * 3600 +
            parseInt(timeMatch[2]) * 60 +
            parseInt(timeMatch[3])
          const progress = Math.min(100, Math.floor((currentTime / duration) * 100))

          if (progress > lastProgress) {
            lastProgress = progress
            onProgress?.(progress)
          }
        }
      })

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`))
        }
      })

      ffmpeg.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * Obtém duração do vídeo
   */
  private async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        videoPath,
      ])

      let output = ''
      ffprobe.stdout.on('data', (data) => {
        output += data.toString()
      })

      ffprobe.on('close', (code) => {
        if (code === 0) {
          resolve(parseFloat(output.trim()))
        } else {
          reject(new Error('Failed to get video duration'))
        }
      })
    })
  }

  /**
   * Limpa workspace temporário
   */
  private async cleanupWorkspace(jobId: string): Promise<void> {
    const workspacePath = this.getWorkspacePath(jobId)
    await fs.rm(workspacePath, { recursive: true, force: true })
    console.log(`[FFmpegRenderer] Workspace cleaned: ${workspacePath}`)
  }

  /**
   * Obtém caminho do workspace
   */
  private getWorkspacePath(jobId: string): string {
    return path.join(process.cwd(), 'tmp', 'render', jobId)
  }
}

// Factory function
export function createRenderer(): FFmpegRenderer {
  return new FFmpegRenderer()
}
