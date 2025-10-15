/**
 * 🎚️ Adaptive Quality Optimizer
 * Ajusta qualidade de renderização baseado em hardware e condições do sistema
 * Sprint 52 - Adaptive Quality Optimizations
 */

import { hardwareDetector, PerformanceTier, type QualityPreset } from './hardware-detector'
import type { ExportSettings } from '@/types/export.types'

/**
 * Optimization Strategy
 */
export enum OptimizationStrategy {
  SPEED = 'speed', // Prioriza velocidade
  QUALITY = 'quality', // Prioriza qualidade
  BALANCED = 'balanced', // Equilibrado
  ADAPTIVE = 'adaptive', // Adapta dinamicamente
}

/**
 * Optimized Settings
 */
export interface OptimizedSettings extends ExportSettings {
  optimizationApplied: {
    strategy: OptimizationStrategy
    tier: PerformanceTier
    adjustments: string[]
    originalSettings: Partial<ExportSettings>
  }
}

/**
 * Adaptive Quality Optimizer
 */
export class AdaptiveQualityOptimizer {
  private static instance: AdaptiveQualityOptimizer

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AdaptiveQualityOptimizer {
    if (!AdaptiveQualityOptimizer.instance) {
      AdaptiveQualityOptimizer.instance = new AdaptiveQualityOptimizer()
    }
    return AdaptiveQualityOptimizer.instance
  }

  /**
   * Optimize export settings based on hardware
   */
  async optimize(
    settings: ExportSettings,
    strategy: OptimizationStrategy = OptimizationStrategy.ADAPTIVE
  ): Promise<OptimizedSettings> {
    const preset = await hardwareDetector.getQualityPreset()
    const tier = await hardwareDetector.getPerformanceTier()
    const memoryPressure = await hardwareDetector.getMemoryPressure()

    const optimized = { ...settings }
    const adjustments: string[] = []
    const originalSettings: Partial<ExportSettings> = {}

    // Apply strategy-specific optimizations
    switch (strategy) {
      case OptimizationStrategy.SPEED:
        this.optimizeForSpeed(optimized, preset, adjustments, originalSettings)
        break

      case OptimizationStrategy.QUALITY:
        this.optimizeForQuality(optimized, preset, adjustments, originalSettings)
        break

      case OptimizationStrategy.BALANCED:
        this.optimizeBalanced(optimized, preset, adjustments, originalSettings)
        break

      case OptimizationStrategy.ADAPTIVE:
        if (memoryPressure > 0.8) {
          this.optimizeForSpeed(optimized, preset, adjustments, originalSettings)
          adjustments.push('High memory pressure detected - prioritizing speed')
        } else if (tier === PerformanceTier.ULTRA || tier === PerformanceTier.HIGH) {
          this.optimizeForQuality(optimized, preset, adjustments, originalSettings)
        } else {
          this.optimizeBalanced(optimized, preset, adjustments, originalSettings)
        }
        break
    }

    // Apply tier-specific constraints
    this.applyTierConstraints(optimized, preset, tier, adjustments, originalSettings)

    return {
      ...optimized,
      optimizationApplied: {
        strategy,
        tier,
        adjustments,
        originalSettings,
      },
    }
  }

  /**
   * Optimize for maximum speed
   */
  private optimizeForSpeed(
    settings: ExportSettings,
    preset: QualityPreset,
    adjustments: string[],
    original: Partial<ExportSettings>
  ): void {
    // Resolution
    if (settings.resolution && this.getResolutionScore(settings.resolution) > 2) {
      original.resolution = settings.resolution
      settings.resolution = '1080p'
      adjustments.push('Reduced resolution to 1080p for faster encoding')
    }

    // Bitrate
    if (settings.bitrate && settings.bitrate > 8000) {
      original.bitrate = settings.bitrate
      settings.bitrate = 8000
      adjustments.push('Reduced bitrate to 8000 kbps for faster encoding')
    }

    // FPS
    if (settings.fps && settings.fps > 30) {
      original.fps = settings.fps
      settings.fps = 30
      adjustments.push('Reduced FPS to 30 for faster encoding')
    }

    // Use GPU if available
    if (preset.enableGPU && !settings.hardwareAcceleration) {
      original.hardwareAcceleration = settings.hardwareAcceleration
      settings.hardwareAcceleration = true
      adjustments.push('Enabled hardware acceleration for speed')
    }

    // Disable heavy filters
    if (settings.filters && settings.filters.length > 0) {
      const heavyFilters = settings.filters.filter(
        (f) => f.type === 'denoise' || f.type === 'sharpen'
      )
      if (heavyFilters.length > 0) {
        original.filters = [...settings.filters]
        settings.filters = settings.filters.filter(
          (f) => f.type !== 'denoise' && f.type !== 'sharpen'
        )
        adjustments.push('Disabled heavy filters (denoise, sharpen) for speed')
      }
    }

    adjustments.push('Applied SPEED optimization strategy')
  }

  /**
   * Optimize for maximum quality
   */
  private optimizeForQuality(
    settings: ExportSettings,
    preset: QualityPreset,
    adjustments: string[],
    original: Partial<ExportSettings>
  ): void {
    // Resolution (keep high if hardware allows)
    if (settings.resolution && this.getResolutionScore(settings.resolution) < 3) {
      if (this.getResolutionScore(preset.maxResolution) >= 3) {
        original.resolution = settings.resolution
        settings.resolution = '1440p'
        adjustments.push('Increased resolution to 1440p for better quality')
      }
    }

    // Bitrate (increase if hardware allows)
    if (settings.bitrate && settings.bitrate < preset.maxBitrate * 0.8) {
      original.bitrate = settings.bitrate
      settings.bitrate = Math.round(preset.maxBitrate * 0.8)
      adjustments.push(`Increased bitrate to ${settings.bitrate} kbps for better quality`)
    }

    // FPS (keep high if hardware allows)
    if (settings.fps && settings.fps < preset.maxFPS && preset.maxFPS >= 60) {
      original.fps = settings.fps
      settings.fps = 60
      adjustments.push('Increased FPS to 60 for smoother video')
    }

    // Disable hardware acceleration for better quality (software encoding)
    if (settings.hardwareAcceleration) {
      original.hardwareAcceleration = settings.hardwareAcceleration
      settings.hardwareAcceleration = false
      adjustments.push('Disabled hardware acceleration for better quality (software encoding)')
    }

    adjustments.push('Applied QUALITY optimization strategy')
  }

  /**
   * Optimize for balanced speed/quality
   */
  private optimizeBalanced(
    settings: ExportSettings,
    preset: QualityPreset,
    adjustments: string[],
    original: Partial<ExportSettings>
  ): void {
    // Resolution (target 1080p)
    if (settings.resolution && settings.resolution !== '1080p') {
      original.resolution = settings.resolution
      settings.resolution = '1080p'
      adjustments.push('Set resolution to 1080p for balanced quality/speed')
    }

    // Bitrate (moderate)
    if (settings.bitrate) {
      const targetBitrate = 8000
      if (settings.bitrate !== targetBitrate) {
        original.bitrate = settings.bitrate
        settings.bitrate = targetBitrate
        adjustments.push('Set bitrate to 8000 kbps for balanced quality/speed')
      }
    }

    // FPS (30 for balance)
    if (settings.fps && settings.fps !== 30) {
      original.fps = settings.fps
      settings.fps = 30
      adjustments.push('Set FPS to 30 for balanced quality/speed')
    }

    // Use GPU if available for balance
    if (preset.enableGPU && !settings.hardwareAcceleration) {
      original.hardwareAcceleration = settings.hardwareAcceleration
      settings.hardwareAcceleration = true
      adjustments.push('Enabled hardware acceleration for balanced encoding')
    }

    adjustments.push('Applied BALANCED optimization strategy')
  }

  /**
   * Apply tier-specific constraints
   */
  private applyTierConstraints(
    settings: ExportSettings,
    preset: QualityPreset,
    tier: PerformanceTier,
    adjustments: string[],
    original: Partial<ExportSettings>
  ): void {
    // Resolution constraint
    const currentScore = this.getResolutionScore(settings.resolution || '1080p')
    const maxScore = this.getResolutionScore(preset.maxResolution)

    if (currentScore > maxScore) {
      original.resolution = settings.resolution
      settings.resolution = preset.maxResolution
      adjustments.push(
        `Resolution limited to ${preset.maxResolution} due to ${tier} tier hardware`
      )
    }

    // Bitrate constraint
    if (settings.bitrate && settings.bitrate > preset.maxBitrate) {
      original.bitrate = settings.bitrate
      settings.bitrate = preset.maxBitrate
      adjustments.push(`Bitrate limited to ${preset.maxBitrate} kbps due to ${tier} tier hardware`)
    }

    // FPS constraint
    if (settings.fps && settings.fps > preset.maxFPS) {
      original.fps = settings.fps
      settings.fps = preset.maxFPS
      adjustments.push(`FPS limited to ${preset.maxFPS} due to ${tier} tier hardware`)
    }

    // GPU constraint
    if (settings.hardwareAcceleration && !preset.enableGPU) {
      original.hardwareAcceleration = settings.hardwareAcceleration
      settings.hardwareAcceleration = false
      adjustments.push('Hardware acceleration disabled - GPU not available or not recommended')
    }
  }

  /**
   * Get resolution score (higher = better)
   */
  private getResolutionScore(resolution: string): number {
    const scores: Record<string, number> = {
      '4k': 4,
      '1440p': 3,
      '1080p': 2,
      '720p': 1,
      '480p': 0,
    }
    return scores[resolution] ?? 2
  }

  /**
   * Validate if settings are within hardware capabilities
   */
  async validate(settings: ExportSettings): Promise<{
    valid: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    const canHandle = await hardwareDetector.canHandle(
      settings.resolution || '1080p',
      settings.bitrate || 5000,
      settings.fps || 30
    )

    if (!canHandle) {
      issues.push('Current settings may exceed hardware capabilities')
      recommendations.push('Consider using adaptive optimization')

      const preset = await hardwareDetector.getQualityPreset()
      recommendations.push(`Recommended: ${preset.maxResolution} @ ${preset.maxFPS} fps`)
      recommendations.push(`Max bitrate: ${preset.maxBitrate} kbps`)
    }

    const memoryPressure = await hardwareDetector.getMemoryPressure()
    if (memoryPressure > 0.9) {
      issues.push('High memory pressure detected')
      recommendations.push('Close other applications or reduce video resolution')
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations,
    }
  }

  /**
   * Get optimization suggestions
   */
  async getSuggestions(settings: ExportSettings): Promise<string[]> {
    const suggestions: string[] = []
    const preset = await hardwareDetector.getQualityPreset()
    const tier = await hardwareDetector.getPerformanceTier()

    // Resolution suggestions
    const currentScore = this.getResolutionScore(settings.resolution || '1080p')
    const maxScore = this.getResolutionScore(preset.maxResolution)

    if (currentScore > maxScore) {
      suggestions.push(
        `Your ${tier} tier hardware is optimized for ${preset.maxResolution} - consider reducing resolution`
      )
    }

    // Bitrate suggestions
    if (settings.bitrate && settings.bitrate > preset.maxBitrate * 1.2) {
      suggestions.push(
        `Bitrate may be too high for real-time encoding - recommended max: ${preset.maxBitrate} kbps`
      )
    }

    // GPU suggestions
    if (!settings.hardwareAcceleration && preset.enableGPU) {
      suggestions.push('GPU acceleration is available - enable for faster encoding')
    }

    // FPS suggestions
    if (settings.fps && settings.fps > preset.maxFPS) {
      suggestions.push(`High FPS may cause encoding delays - recommended max: ${preset.maxFPS}`)
    }

    return suggestions
  }
}

// Export singleton instance
export const qualityOptimizer = AdaptiveQualityOptimizer.getInstance()
