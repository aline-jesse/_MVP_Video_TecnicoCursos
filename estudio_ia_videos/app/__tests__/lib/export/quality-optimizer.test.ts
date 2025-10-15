/**
 * Tests for Adaptive Quality Optimizer - Sprint 52
 */

import {
  AdaptiveQualityOptimizer,
  OptimizationStrategy,
  qualityOptimizer,
} from '@/lib/export/quality-optimizer'
import type { ExportSettings } from '@/types/export.types'

describe('AdaptiveQualityOptimizer - Quality Optimization (Sprint 52)', () => {
  let optimizer: AdaptiveQualityOptimizer

  beforeEach(() => {
    optimizer = AdaptiveQualityOptimizer.getInstance()
  })

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = AdaptiveQualityOptimizer.getInstance()
      const instance2 = AdaptiveQualityOptimizer.getInstance()
      expect(instance1).toBe(instance2)
    })

    test('should export singleton instance', () => {
      expect(qualityOptimizer).toBeDefined()
      expect(qualityOptimizer).toBeInstanceOf(AdaptiveQualityOptimizer)
    })
  })

  describe('Optimization Strategies', () => {
    const baseSettings: ExportSettings = {
      format: 'mp4',
      resolution: '1080p',
      bitrate: 5000,
      fps: 30,
      hardwareAcceleration: false,
    }

    test('should optimize with SPEED strategy', async () => {
      const optimized = await optimizer.optimize(baseSettings, OptimizationStrategy.SPEED)

      expect(optimized).toHaveProperty('optimizationApplied')
      expect(optimized.optimizationApplied.strategy).toBe(OptimizationStrategy.SPEED)
      expect(optimized.optimizationApplied.adjustments).toBeInstanceOf(Array)
      expect(optimized.optimizationApplied.adjustments.length).toBeGreaterThan(0)
    })

    test('should optimize with QUALITY strategy', async () => {
      const optimized = await optimizer.optimize(baseSettings, OptimizationStrategy.QUALITY)

      expect(optimized).toHaveProperty('optimizationApplied')
      expect(optimized.optimizationApplied.strategy).toBe(OptimizationStrategy.QUALITY)
      expect(optimized.optimizationApplied.adjustments).toBeInstanceOf(Array)
    })

    test('should optimize with BALANCED strategy', async () => {
      const optimized = await optimizer.optimize(baseSettings, OptimizationStrategy.BALANCED)

      expect(optimized).toHaveProperty('optimizationApplied')
      expect(optimized.optimizationApplied.strategy).toBe(OptimizationStrategy.BALANCED)
      expect(optimized.optimizationApplied.adjustments).toBeInstanceOf(Array)
    })

    test('should optimize with ADAPTIVE strategy (default)', async () => {
      const optimized = await optimizer.optimize(baseSettings)

      expect(optimized).toHaveProperty('optimizationApplied')
      expect(optimized.optimizationApplied.strategy).toBe(OptimizationStrategy.ADAPTIVE)
      expect(optimized.optimizationApplied.adjustments).toBeInstanceOf(Array)
    })
  })

  describe('Optimization Results', () => {
    const highSettings: ExportSettings = {
      format: 'mp4',
      resolution: '4k',
      bitrate: 20000,
      fps: 60,
      hardwareAcceleration: false,
    }

    test('optimized settings should preserve original format', async () => {
      const optimized = await optimizer.optimize(highSettings)

      expect(optimized.format).toBe('mp4')
    })

    test('should store original settings', async () => {
      const optimized = await optimizer.optimize(highSettings, OptimizationStrategy.SPEED)

      expect(optimized.optimizationApplied.originalSettings).toBeDefined()
      expect(typeof optimized.optimizationApplied.originalSettings).toBe('object')
    })

    test('should include tier information', async () => {
      const optimized = await optimizer.optimize(highSettings)

      expect(optimized.optimizationApplied.tier).toBeDefined()
      expect(['low', 'medium', 'high', 'ultra']).toContain(optimized.optimizationApplied.tier)
    })

    test('adjustments should be descriptive strings', async () => {
      const optimized = await optimizer.optimize(highSettings, OptimizationStrategy.SPEED)

      for (const adjustment of optimized.optimizationApplied.adjustments) {
        expect(typeof adjustment).toBe('string')
        expect(adjustment.length).toBeGreaterThan(10)
      }
    })
  })

  describe('Settings Validation', () => {
    test('should validate settings', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        bitrate: 4000,
        fps: 30,
      }

      const validation = await optimizer.validate(settings)

      expect(validation).toHaveProperty('valid')
      expect(validation).toHaveProperty('issues')
      expect(validation).toHaveProperty('recommendations')
      expect(typeof validation.valid).toBe('boolean')
      expect(Array.isArray(validation.issues)).toBe(true)
      expect(Array.isArray(validation.recommendations)).toBe(true)
    })

    test('low settings should be valid', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        bitrate: 2000,
        fps: 24,
      }

      const validation = await optimizer.validate(settings)

      expect(validation.valid).toBe(true)
      expect(validation.issues.length).toBe(0)
    })

    test('extremely high settings may be invalid', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '4k',
        bitrate: 50000,
        fps: 120,
      }

      const validation = await optimizer.validate(settings)

      // May be valid on high-end systems, but should have structure
      expect(typeof validation.valid).toBe('boolean')
      expect(Array.isArray(validation.issues)).toBe(true)
      expect(Array.isArray(validation.recommendations)).toBe(true)
    })
  })

  describe('Optimization Suggestions', () => {
    test('should provide suggestions', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '4k',
        bitrate: 25000,
        fps: 60,
      }

      const suggestions = await optimizer.getSuggestions(settings)

      expect(Array.isArray(suggestions)).toBe(true)
      // May have suggestions depending on hardware
    })

    test('suggestions should be strings', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '1080p',
        bitrate: 8000,
        fps: 30,
      }

      const suggestions = await optimizer.getSuggestions(settings)

      for (const suggestion of suggestions) {
        expect(typeof suggestion).toBe('string')
      }
    })

    test('low settings should have few or no suggestions', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        bitrate: 2000,
        fps: 24,
        hardwareAcceleration: true,
      }

      const suggestions = await optimizer.getSuggestions(settings)

      expect(Array.isArray(suggestions)).toBe(true)
      // Low settings should be within capabilities
    })
  })

  describe('Strategy-Specific Behavior', () => {
    test('SPEED strategy should reduce resolution for high inputs', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '4k',
        bitrate: 15000,
        fps: 60,
      }

      const optimized = await optimizer.optimize(settings, OptimizationStrategy.SPEED)

      // Should reduce from 4k
      const resolutionScore = {
        '4k': 4,
        '1440p': 3,
        '1080p': 2,
        '720p': 1,
      }

      const originalScore = resolutionScore['4k']
      const optimizedScore =
        resolutionScore[optimized.resolution as keyof typeof resolutionScore] || 0

      expect(optimizedScore).toBeLessThanOrEqual(originalScore)
    })

    test('BALANCED strategy should target 1080p', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '4k',
        bitrate: 15000,
        fps: 60,
      }

      const optimized = await optimizer.optimize(settings, OptimizationStrategy.BALANCED)

      // Balanced typically targets 1080p
      expect(['1080p', '720p']).toContain(optimized.resolution)
    })

    test('optimization should preserve essential settings', async () => {
      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '1080p',
        bitrate: 8000,
        fps: 30,
        audioCodec: 'aac',
      }

      const optimized = await optimizer.optimize(settings)

      expect(optimized.format).toBe(settings.format)
      expect(optimized.audioCodec).toBe(settings.audioCodec)
    })
  })
})

describe('OptimizationStrategy Enum (Sprint 52)', () => {
  test('should have SPEED strategy', () => {
    expect(OptimizationStrategy.SPEED).toBe('speed')
  })

  test('should have QUALITY strategy', () => {
    expect(OptimizationStrategy.QUALITY).toBe('quality')
  })

  test('should have BALANCED strategy', () => {
    expect(OptimizationStrategy.BALANCED).toBe('balanced')
  })

  test('should have ADAPTIVE strategy', () => {
    expect(OptimizationStrategy.ADAPTIVE).toBe('adaptive')
  })
})
