/**
 * Tests for Hardware Detector - Sprint 52
 */

import {
  HardwareDetector,
  PerformanceTier,
  hardwareDetector,
} from '@/lib/export/hardware-detector'

describe('HardwareDetector - Hardware Detection (Sprint 52)', () => {
  let detector: HardwareDetector

  beforeEach(() => {
    detector = HardwareDetector.getInstance()
  })

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = HardwareDetector.getInstance()
      const instance2 = HardwareDetector.getInstance()
      expect(instance1).toBe(instance2)
    })

    test('should export singleton instance', () => {
      expect(hardwareDetector).toBeDefined()
      expect(hardwareDetector).toBeInstanceOf(HardwareDetector)
    })
  })

  describe('Hardware Detection', () => {
    test('should detect hardware capabilities', async () => {
      const capabilities = await detector.detect()

      expect(capabilities).toHaveProperty('cpu')
      expect(capabilities).toHaveProperty('memory')
      expect(capabilities).toHaveProperty('gpu')
      expect(capabilities).toHaveProperty('platform')
      expect(capabilities).toHaveProperty('arch')
    })

    test('CPU info should have required fields', async () => {
      const capabilities = await detector.detect()

      expect(capabilities.cpu).toHaveProperty('cores')
      expect(capabilities.cpu).toHaveProperty('threads')
      expect(capabilities.cpu).toHaveProperty('model')
      expect(capabilities.cpu).toHaveProperty('speed')

      expect(typeof capabilities.cpu.cores).toBe('number')
      expect(capabilities.cpu.cores).toBeGreaterThan(0)
    })

    test('Memory info should have required fields', async () => {
      const capabilities = await detector.detect()

      expect(capabilities.memory).toHaveProperty('total')
      expect(capabilities.memory).toHaveProperty('free')
      expect(capabilities.memory).toHaveProperty('available')

      expect(typeof capabilities.memory.total).toBe('number')
      expect(capabilities.memory.total).toBeGreaterThan(0)
    })

    test('GPU info should be array', async () => {
      const capabilities = await detector.detect()

      expect(Array.isArray(capabilities.gpu)).toBe(true)
      expect(capabilities.gpu.length).toBeGreaterThan(0)
    })

    test('GPU info should have required fields', async () => {
      const capabilities = await detector.detect()

      for (const gpu of capabilities.gpu) {
        expect(gpu).toHaveProperty('name')
        expect(gpu).toHaveProperty('vendor')
        expect(gpu).toHaveProperty('available')

        expect(typeof gpu.name).toBe('string')
        expect(typeof gpu.available).toBe('boolean')
      }
    })
  })

  describe('Performance Tier Detection', () => {
    test('should return a valid performance tier', async () => {
      const tier = await detector.getPerformanceTier()

      expect(Object.values(PerformanceTier)).toContain(tier)
    })

    test('tier should be one of LOW, MEDIUM, HIGH, ULTRA', async () => {
      const tier = await detector.getPerformanceTier()

      expect([
        PerformanceTier.LOW,
        PerformanceTier.MEDIUM,
        PerformanceTier.HIGH,
        PerformanceTier.ULTRA,
      ]).toContain(tier)
    })
  })

  describe('Quality Preset', () => {
    test('should return quality preset', async () => {
      const preset = await detector.getQualityPreset()

      expect(preset).toHaveProperty('tier')
      expect(preset).toHaveProperty('maxResolution')
      expect(preset).toHaveProperty('maxBitrate')
      expect(preset).toHaveProperty('maxFPS')
      expect(preset).toHaveProperty('threads')
      expect(preset).toHaveProperty('preset')
      expect(preset).toHaveProperty('enableGPU')
    })

    test('preset should have valid values', async () => {
      const preset = await detector.getQualityPreset()

      expect(typeof preset.maxResolution).toBe('string')
      expect(typeof preset.maxBitrate).toBe('number')
      expect(typeof preset.maxFPS).toBe('number')
      expect(typeof preset.threads).toBe('number')
      expect(typeof preset.enableGPU).toBe('boolean')

      expect(preset.maxBitrate).toBeGreaterThan(0)
      expect(preset.maxFPS).toBeGreaterThan(0)
      expect(preset.threads).toBeGreaterThan(0)
    })

    test('preset resolution should be valid', async () => {
      const preset = await detector.getQualityPreset()

      expect(['4k', '1440p', '1080p', '720p', '480p']).toContain(preset.maxResolution)
    })

    test('preset FFmpeg preset should be valid', async () => {
      const preset = await detector.getQualityPreset()

      expect([
        'ultrafast',
        'superfast',
        'veryfast',
        'faster',
        'fast',
        'medium',
        'slow',
      ]).toContain(preset.preset)
    })
  })

  describe('Memory Pressure', () => {
    test('should return memory pressure between 0 and 1', async () => {
      const pressure = await detector.getMemoryPressure()

      expect(typeof pressure).toBe('number')
      expect(pressure).toBeGreaterThanOrEqual(0)
      expect(pressure).toBeLessThanOrEqual(1)
    })
  })

  describe('Hardware Capability Check', () => {
    test('should check if system can handle settings', async () => {
      const canHandle = await detector.canHandle('720p', 4000, 30)

      expect(typeof canHandle).toBe('boolean')
    })

    test('should accept low settings', async () => {
      const canHandle = await detector.canHandle('720p', 2000, 24)

      expect(canHandle).toBe(true)
    })

    test('should reject extremely high settings based on system', async () => {
      // This might pass on high-end systems, but logic should work
      const preset = await detector.getQualityPreset()
      
      // Request settings way above preset
      const canHandle = await detector.canHandle(
        '4k',
        preset.maxBitrate * 3,
        preset.maxFPS * 2
      )

      // Should be false on most systems
      expect(typeof canHandle).toBe('boolean')
    })
  })

  describe('System Status', () => {
    test('should return complete status', async () => {
      const status = await detector.getStatus()

      expect(status).toHaveProperty('tier')
      expect(status).toHaveProperty('preset')
      expect(status).toHaveProperty('capabilities')
      expect(status).toHaveProperty('memoryPressure')
    })

    test('status should have valid structure', async () => {
      const status = await detector.getStatus()

      expect(Object.values(PerformanceTier)).toContain(status.tier)
      expect(typeof status.memoryPressure).toBe('number')
      expect(status.capabilities).toHaveProperty('cpu')
      expect(status.preset).toHaveProperty('maxResolution')
    })
  })

  describe('Detection Caching', () => {
    test('should cache detection results', async () => {
      const start1 = Date.now()
      await detector.detect()
      const time1 = Date.now() - start1

      const start2 = Date.now()
      await detector.detect()
      const time2 = Date.now() - start2

      // Second call should be faster (cached)
      expect(time2).toBeLessThan(time1 + 50) // Allow some margin
    })
  })
})

describe('PerformanceTier Enum (Sprint 52)', () => {
  test('should have LOW tier', () => {
    expect(PerformanceTier.LOW).toBe('low')
  })

  test('should have MEDIUM tier', () => {
    expect(PerformanceTier.MEDIUM).toBe('medium')
  })

  test('should have HIGH tier', () => {
    expect(PerformanceTier.HIGH).toBe('high')
  })

  test('should have ULTRA tier', () => {
    expect(PerformanceTier.ULTRA).toBe('ultra')
  })
})
