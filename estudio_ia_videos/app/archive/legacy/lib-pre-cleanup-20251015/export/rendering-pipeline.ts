/**
 * 🎬 Advanced Rendering Pipeline
 * Integra watermark, filters, audio e subtitles na ordem correta
 * Sprint 49 - Integration & Testing
 */

import { watermarkRenderer } from './watermark-renderer'
import { videoFilters } from './video-filters'
import { audioProcessor } from './audio-processor'
import { subtitleRenderer } from './subtitle-renderer'
import { videoValidator } from './video-validator'
import { renderingCache } from './rendering-cache'
import { renderingLogger } from './logger'
import type { ExportSettings } from '@/types/export.types'
import path from 'path'
import fs from 'fs/promises'

/**
 * Pipeline stages
 */
export enum PipelineStage {
  AUDIO_PROCESSING = 'audio_processing',
  VIDEO_FILTERS = 'video_filters',
  WATERMARK = 'watermark',
  SUBTITLES = 'subtitles',
  COMPLETE = 'complete',
}

/**
 * Pipeline progress callback
 */
export interface PipelineProgress {
  stage: PipelineStage
  stageProgress: number // 0-100
  overallProgress: number // 0-100
  message: string
  currentFile?: string
  estimatedTimeRemaining?: number // in seconds
  processingSpeed?: number // frames per second
}

/**
 * Pipeline result
 */
export interface PipelineResult {
  success: boolean
  outputPath: string
  stages: {
    stage: PipelineStage
    duration: number
    success: boolean
    error?: string
  }[]
  totalDuration: number
  validationWarnings?: string[]
  retryAttempts?: number
  cancelled?: boolean
  pausedDuration?: number
}

/**
 * Pipeline state
 */
export enum PipelineState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number // Maximum retry attempts per stage
  baseDelay: number // Base delay in ms (1000 = 1s)
  maxDelay: number // Maximum delay in ms (8000 = 8s)
}

/**
 * Advanced Rendering Pipeline
 */
export class RenderingPipeline {
  private tempDir: string
  private stageResults: PipelineResult['stages'] = []
  private startTime: number = 0
  private retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 8000,
  }
  private totalRetries: number = 0
  
  // State management
  private state: PipelineState = PipelineState.IDLE
  private pausedAt: number = 0
  private pausedDuration: number = 0
  
  // ETA calculation
  private stageStartTimes: Map<PipelineStage, number> = new Map()
  private stageProgressHistory: Map<PipelineStage, Array<{ progress: number; timestamp: number }>> = new Map()

  constructor(tempDir: string = '/tmp/rendering-pipeline') {
    this.tempDir = tempDir
  }

  /**
   * Execute full rendering pipeline
   * 
   * Pipeline order:
   * 1. Audio processing (normalize, compress, EQ, etc.)
   * 2. Video filters (brightness, contrast, saturation, etc.)
   * 3. Watermark (logo/text overlay)
   * 4. Subtitles (burn-in)
   * 
   * @param inputPath - Path to input video
   * @param outputPath - Path to output video
   * @param settings - Export settings with advanced options
   * @param onProgress - Progress callback
   */
  async execute(
    inputPath: string,
    outputPath: string,
    settings: ExportSettings,
    onProgress?: (progress: PipelineProgress) => void
  ): Promise<PipelineResult> {
    this.startTime = Date.now()
    this.stageResults = []
    this.totalRetries = 0
    this.pausedDuration = 0
    this.state = PipelineState.RUNNING
    this.stageProgressHistory.clear()
    this.stageStartTimes.clear()

    try {
      // STEP 1: Validate input video
      onProgress?.({
        stage: PipelineStage.AUDIO_PROCESSING,
        stageProgress: 0,
        overallProgress: 0,
        message: 'Validando arquivo de entrada...',
      })

      const validation = await videoValidator.validate(inputPath)

      if (!validation.valid) {
        this.state = PipelineState.FAILED
        return {
          success: false,
          outputPath: '',
          stages: [],
          totalDuration: Date.now() - this.startTime,
          validationWarnings: validation.errors,
        }
      }

      // Log validation warnings
      if (validation.warnings.length > 0) {
        renderingLogger.warn('Avisos de validação', {
          metadata: { warnings: validation.warnings },
        })
      }

      // Log metadata
      if (validation.metadata) {
        const meta = validation.metadata
        renderingLogger.info('Metadados do vídeo detectados', {
          metadata: {
            resolution: `${meta.width}x${meta.height}`,
            fps: meta.fps.toFixed(2),
            duration: meta.duration.toFixed(2),
            codec: meta.videoCodec,
            size: `${(meta.size / (1024 * 1024)).toFixed(2)} MB`,
          },
        })
      }

      // STEP 2: Check cache
      await renderingCache.initialize()

      const cacheKeyData = await renderingCache.generateKey(inputPath, settings)
      const cachedOutput = await renderingCache.get(cacheKeyData.key)

      if (cachedOutput) {
        renderingLogger.info('Usando resultado cacheado', {
          metadata: { cacheKey: cacheKeyData.key },
        })

        // Copy cached file to output
        await fs.copyFile(cachedOutput, outputPath)

        onProgress?.({
          stage: PipelineStage.COMPLETE,
          stageProgress: 100,
          overallProgress: 100,
          message: 'Usando resultado cacheado!',
          currentFile: outputPath,
        })

        return {
          success: true,
          outputPath,
          stages: [],
          totalDuration: Date.now() - this.startTime,
          validationWarnings: validation.warnings,
          retryAttempts: 0,
        }
      }

      // Ensure temp directory exists
      await fs.mkdir(this.tempDir, { recursive: true })

      // Determine which stages to run
      const hasAudio = settings.audioEnhancements && settings.audioEnhancements.length > 0
      const hasFilters = settings.videoFilters && settings.videoFilters.length > 0
      const hasWatermark = settings.watermark !== undefined && settings.watermark !== null
      const hasSubtitles = settings.subtitle?.enabled === true

      const totalStages = [hasAudio, hasFilters, hasWatermark, hasSubtitles].filter(Boolean).length
      let completedStages = 0

      let currentFile = inputPath

      // Stage 1: Audio Processing
      if (hasAudio && settings.audioEnhancements) {
        const stageStart = Date.now()
        const tempAudioFile = path.join(this.tempDir, `audio-${Date.now()}.mp4`)

        renderingLogger.stageStart('Audio Processing', {
          file: tempAudioFile,
          metadata: { enhancements: settings.audioEnhancements.length },
        })

        try {
          // Check pause/cancel before starting
          if (!(await this.checkPauseOrCancel())) {
            throw new Error('Pipeline cancelado pelo usuário')
          }

          onProgress?.({
            stage: PipelineStage.AUDIO_PROCESSING,
            stageProgress: 0,
            overallProgress: (completedStages / totalStages) * 100,
            message: 'Processando áudio...',
            currentFile: tempAudioFile,
          })

          // Execute with retry
          await this.executeWithRetry(
            () => audioProcessor.processAudio(
              currentFile,
              tempAudioFile,
              settings.audioEnhancements!,
              async (progress) => {
                // Check pause/cancel during processing
                if (!(await this.checkPauseOrCancel())) {
                  throw new Error('Pipeline cancelado pelo usuário')
                }

                const eta = this.calculateETA(
                  PipelineStage.AUDIO_PROCESSING,
                  progress,
                  totalStages,
                  completedStages
                )

                onProgress?.({
                  stage: PipelineStage.AUDIO_PROCESSING,
                  stageProgress: progress,
                  overallProgress: ((completedStages + progress / 100) / totalStages) * 100,
                  message: `Processando áudio: ${progress}%`,
                  currentFile: tempAudioFile,
                  estimatedTimeRemaining: eta,
                })
              }
            ),
            'Processamento de áudio',
            (progress) => {
              const eta = this.calculateETA(
                PipelineStage.AUDIO_PROCESSING,
                progress,
                totalStages,
                completedStages
              )

              onProgress?.({
                stage: PipelineStage.AUDIO_PROCESSING,
                stageProgress: progress,
                overallProgress: (completedStages / totalStages) * 100,
                message: 'Processando áudio...',
                currentFile: tempAudioFile,
                estimatedTimeRemaining: eta,
              })
            }
          )

          this.stageResults.push({
            stage: PipelineStage.AUDIO_PROCESSING,
            duration: Date.now() - stageStart,
            success: true,
          })

          renderingLogger.stageComplete('Audio Processing', Date.now() - stageStart, {
            file: tempAudioFile,
          })

          // Move to next stage
          if (currentFile !== inputPath) {
            await fs.unlink(currentFile) // Clean up previous temp file
          }
          currentFile = tempAudioFile
          completedStages++
        } catch (error) {
          renderingLogger.stageFailed('Audio Processing', error, {
            file: tempAudioFile,
          })

          this.stageResults.push({
            stage: PipelineStage.AUDIO_PROCESSING,
            duration: Date.now() - stageStart,
            success: false,
            error: String(error),
          })
          throw new Error(`Audio processing failed: ${error}`)
        }
      }

      // Stage 2: Video Filters
      if (hasFilters && settings.videoFilters) {
        const stageStart = Date.now()
        const tempFiltersFile = path.join(this.tempDir, `filters-${Date.now()}.mp4`)

        renderingLogger.stageStart('Video Filters', {
          file: tempFiltersFile,
          metadata: { filters: settings.videoFilters.length },
        })

        try {
          onProgress?.({
            stage: PipelineStage.VIDEO_FILTERS,
            stageProgress: 0,
            overallProgress: (completedStages / totalStages) * 100,
            message: 'Aplicando filtros...',
            currentFile: tempFiltersFile,
          })

          await videoFilters.applyFilters(
            currentFile,
            tempFiltersFile,
            settings.videoFilters,
            (progress) => {
              onProgress?.({
                stage: PipelineStage.VIDEO_FILTERS,
                stageProgress: progress,
                overallProgress: ((completedStages + progress / 100) / totalStages) * 100,
                message: `Aplicando filtros: ${progress}%`,
                currentFile: tempFiltersFile,
              })
            }
          )

          this.stageResults.push({
            stage: PipelineStage.VIDEO_FILTERS,
            duration: Date.now() - stageStart,
            success: true,
          })

          renderingLogger.stageComplete('Video Filters', Date.now() - stageStart, {
            file: tempFiltersFile,
          })

          if (currentFile !== inputPath) {
            await fs.unlink(currentFile)
          }
          currentFile = tempFiltersFile
          completedStages++
        } catch (error) {
          renderingLogger.stageFailed('Video Filters', error, {
            file: tempFiltersFile,
          })

          this.stageResults.push({
            stage: PipelineStage.VIDEO_FILTERS,
            duration: Date.now() - stageStart,
            success: false,
            error: String(error),
          })
          throw new Error(`Video filters failed: ${error}`)
        }
      }

      // Stage 3: Watermark
      if (hasWatermark && settings.watermark) {
        const stageStart = Date.now()
        const tempWatermarkFile = path.join(this.tempDir, `watermark-${Date.now()}.mp4`)

        renderingLogger.stageStart('Watermark', {
          file: tempWatermarkFile,
          metadata: { type: settings.watermark.type },
        })

        try {
          onProgress?.({
            stage: PipelineStage.WATERMARK,
            stageProgress: 0,
            overallProgress: (completedStages / totalStages) * 100,
            message: 'Adicionando marca d\'água...',
            currentFile: tempWatermarkFile,
          })

          await watermarkRenderer.applyWatermark(
            currentFile,
            tempWatermarkFile,
            settings.watermark,
            (progress) => {
              onProgress?.({
                stage: PipelineStage.WATERMARK,
                stageProgress: progress,
                overallProgress: ((completedStages + progress / 100) / totalStages) * 100,
                message: `Adicionando marca d'água: ${progress}%`,
                currentFile: tempWatermarkFile,
              })
            }
          )

          this.stageResults.push({
            stage: PipelineStage.WATERMARK,
            duration: Date.now() - stageStart,
            success: true,
          })

          renderingLogger.stageComplete('Watermark', Date.now() - stageStart, {
            file: tempWatermarkFile,
          })

          if (currentFile !== inputPath) {
            await fs.unlink(currentFile)
          }
          currentFile = tempWatermarkFile
          completedStages++
        } catch (error) {
          renderingLogger.stageFailed('Watermark', error, {
            file: tempWatermarkFile,
          })

          this.stageResults.push({
            stage: PipelineStage.WATERMARK,
            duration: Date.now() - stageStart,
            success: false,
            error: String(error),
          })
          throw new Error(`Watermark failed: ${error}`)
        }
      }

      // Stage 4: Subtitles
      if (hasSubtitles && settings.subtitle) {
        const stageStart = Date.now()
        const tempSubtitlesFile = path.join(this.tempDir, `subtitles-${Date.now()}.mp4`)

        renderingLogger.stageStart('Subtitles', {
          file: tempSubtitlesFile,
          metadata: { burnIn: settings.subtitle.burnIn },
        })

        try {
          onProgress?.({
            stage: PipelineStage.SUBTITLES,
            stageProgress: 0,
            overallProgress: (completedStages / totalStages) * 100,
            message: 'Adicionando legendas...',
            currentFile: tempSubtitlesFile,
          })

          await subtitleRenderer.renderSubtitles(
            currentFile,
            tempSubtitlesFile,
            {
              burnIn: settings.subtitle.burnIn,
              subtitleSource: settings.subtitle.source!,
              font: settings.subtitle.style ? {
                family: settings.subtitle.style.fontName,
                size: settings.subtitle.style.fontSize,
                color: settings.subtitle.style.primaryColor,
                outlineColor: settings.subtitle.style.outlineColor || '#000000',
                outlineWidth: settings.subtitle.style.outline,
              } : undefined,
            },
            (progress) => {
              onProgress?.({
                stage: PipelineStage.SUBTITLES,
                stageProgress: progress,
                overallProgress: ((completedStages + progress / 100) / totalStages) * 100,
                message: `Adicionando legendas: ${progress}%`,
                currentFile: tempSubtitlesFile,
              })
            }
          )

          this.stageResults.push({
            stage: PipelineStage.SUBTITLES,
            duration: Date.now() - stageStart,
            success: true,
          })

          renderingLogger.stageComplete('Subtitles', Date.now() - stageStart, {
            file: tempSubtitlesFile,
          })

          if (currentFile !== inputPath) {
            await fs.unlink(currentFile)
          }
          currentFile = tempSubtitlesFile
          completedStages++
        } catch (error) {
          renderingLogger.stageFailed('Subtitles', error, {
            file: tempSubtitlesFile,
          })

          this.stageResults.push({
            stage: PipelineStage.SUBTITLES,
            duration: Date.now() - stageStart,
            success: false,
            error: String(error),
          })
          throw new Error(`Subtitles failed: ${error}`)
        }
      }

      // Move final file to output path
      await fs.rename(currentFile, outputPath)

      onProgress?.({
        stage: PipelineStage.COMPLETE,
        stageProgress: 100,
        overallProgress: 100,
        message: 'Renderização concluída!',
        currentFile: outputPath,
      })

      // Cache the result
      const processingDuration = Date.now() - this.startTime - this.pausedDuration
      await renderingCache.set(
        cacheKeyData.key,
        cacheKeyData.inputHash,
        cacheKeyData.settingsHash,
        outputPath,
        processingDuration
      )

      this.state = PipelineState.COMPLETED

      renderingLogger.info('Pipeline concluído com sucesso', {
        metadata: {
          stages: this.stageResults.length,
          totalDuration: processingDuration,
          pausedDuration: this.pausedDuration,
          retries: this.totalRetries,
        },
      })

      return {
        success: true,
        outputPath,
        stages: this.stageResults,
        totalDuration: processingDuration,
        validationWarnings: validation.warnings,
        retryAttempts: this.totalRetries,
        pausedDuration: this.pausedDuration,
      }
    } catch (error) {
      renderingLogger.error('Pipeline falhou', {
        error,
        metadata: {
          stages: this.stageResults.length,
          duration: Date.now() - this.startTime - this.pausedDuration,
        },
      })

      // Check if error was due to cancellation
      const errorMessage = String(error)
      const wasCancelledByError = errorMessage.includes('cancelado') || errorMessage.includes('cancelled')

      // Set final state (use type assertion to bypass flow analysis)
      if (wasCancelledByError) {
        this.state = PipelineState.CANCELLED
      } else if (![PipelineState.COMPLETED, PipelineState.FAILED, PipelineState.CANCELLED].includes(this.state as PipelineState)) {
        this.state = PipelineState.FAILED
      }

      // Determine if cancelled
      const wasCancelled = this.state === PipelineState.CANCELLED || wasCancelledByError

      return {
        success: false,
        outputPath: '',
        stages: this.stageResults,
        totalDuration: Date.now() - this.startTime - this.pausedDuration,
        retryAttempts: this.totalRetries,
        cancelled: wasCancelled,
        pausedDuration: this.pausedDuration,
      }
    }
  }

  /**
   * Clean up temp files
   */
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir)
      await Promise.all(
        files.map((file) => fs.unlink(path.join(this.tempDir, file)).catch(() => {}))
      )
      renderingLogger.debug('Limpeza de arquivos temporários concluída', {
        metadata: { filesRemoved: files.length },
      })
    } catch (error) {
      renderingLogger.error('Falha na limpeza de arquivos temporários', { error })
    }
  }

  /**
   * Execute function with retry and exponential backoff
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    stageName: string,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    let lastError: any

    for (let attempt = 0; attempt < this.retryConfig.maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        this.totalRetries++

        // Don't retry on last attempt
        if (attempt < this.retryConfig.maxAttempts - 1) {
          // Calculate delay with exponential backoff
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt),
            this.retryConfig.maxDelay
          )

          renderingLogger.warn('Tentativa de retry', {
            metadata: {
              stage: stageName,
              attempt: attempt + 1,
              maxAttempts: this.retryConfig.maxAttempts,
              delay,
            },
          })

          onProgress?.(0) // Reset progress for retry
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Pause the current rendering process
   */
  pause(): void {
    if (this.state === PipelineState.RUNNING) {
      this.state = PipelineState.PAUSED
      this.pausedAt = Date.now()
      renderingLogger.info('Pipeline pausado')
    }
  }

  /**
   * Resume the paused rendering process
   */
  resume(): void {
    if (this.state === PipelineState.PAUSED) {
      this.pausedDuration += Date.now() - this.pausedAt
      this.state = PipelineState.RUNNING
      renderingLogger.info('Pipeline retomado', {
        metadata: { pausedDuration: this.pausedDuration },
      })
    }
  }

  /**
   * Cancel the current rendering process
   */
  cancel(): void {
    if (this.state === PipelineState.RUNNING || this.state === PipelineState.PAUSED) {
      this.state = PipelineState.CANCELLED
      renderingLogger.warn('Pipeline cancelado pelo usuário')
    }
  }

  /**
   * Get current pipeline state
   */
  getState(): PipelineState {
    return this.state
  }

  /**
   * Check if pipeline should continue
   */
  private async checkPauseOrCancel(): Promise<boolean> {
    // Wait while paused (check in loop for state changes)
    while (true) {
      const currentState = this.state
      
      // Return false if cancelled
      if (currentState === PipelineState.CANCELLED) {
        return false
      }
      
      // Break loop if not paused
      if (currentState !== PipelineState.PAUSED) {
        break
      }
      
      // Sleep while paused
      await this.sleep(100)
    }

    // Continue only if running (not cancelled, completed, or failed)
    return [
      PipelineState.RUNNING,
      PipelineState.IDLE
    ].includes(this.state)
  }

  /**
   * Calculate estimated time remaining (ETA)
   */
  private calculateETA(
    stage: PipelineStage,
    currentProgress: number,
    totalStages: number,
    completedStages: number
  ): number {
    // Record progress
    if (!this.stageProgressHistory.has(stage)) {
      this.stageProgressHistory.set(stage, [])
      this.stageStartTimes.set(stage, Date.now())
    }

    const history = this.stageProgressHistory.get(stage)!
    history.push({ progress: currentProgress, timestamp: Date.now() })

    // Keep only last 10 samples
    if (history.length > 10) {
      history.shift()
    }

    // Need at least 2 samples to calculate speed
    if (history.length < 2) {
      return 0
    }

    // Calculate processing speed (progress per second)
    const firstSample = history[0]
    const lastSample = history[history.length - 1]
    const progressDiff = lastSample.progress - firstSample.progress
    const timeDiff = (lastSample.timestamp - firstSample.timestamp) / 1000 // seconds

    if (timeDiff === 0 || progressDiff === 0) {
      return 0
    }

    const progressPerSecond = progressDiff / timeDiff

    // Calculate remaining time for current stage
    const stageRemaining = (100 - currentProgress) / progressPerSecond

    // Estimate remaining stages time based on average
    const avgStageTime = this.calculateAverageStageTime()
    const remainingStages = totalStages - completedStages - 1
    const remainingStagesTime = remainingStages * avgStageTime

    return Math.ceil(stageRemaining + remainingStagesTime)
  }

  /**
   * Calculate average stage time from completed stages
   */
  private calculateAverageStageTime(): number {
    if (this.stageResults.length === 0) {
      return 30 // Default estimate: 30 seconds per stage
    }

    const totalTime = this.stageResults.reduce((sum, stage) => sum + stage.duration, 0)
    return totalTime / this.stageResults.length / 1000 // Convert to seconds
  }
}

/**
 * Singleton instance
 */
export const renderingPipeline = new RenderingPipeline()
