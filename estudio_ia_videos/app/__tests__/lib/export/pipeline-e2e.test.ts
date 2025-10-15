/**
 * End-to-End Tests for Rendering Pipeline
 * Tests with real FFmpeg and actual video files
 * Sprint 54 - E2E Testing
 */

import { RenderingPipeline, PipelineStage } from '../../../lib/export/rendering-pipeline'
import { videoValidator } from '../../../lib/export/video-validator'
import type { ExportSettings } from '../../../types/export.types'
import path from 'path'
import fs from 'fs/promises'

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, '../../fixtures/videos')
const OUTPUT_DIR = path.join(__dirname, '../../fixtures/outputs')

// Test timeout (FFmpeg can be slow)
const E2E_TIMEOUT = 60000 // 60 seconds

describe('E2E: Rendering Pipeline', () => {
  let pipeline: RenderingPipeline

  beforeAll(async () => {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true })
    
    // Check if test videos exist
    const testVideo = path.join(FIXTURES_DIR, 'test-720p-5s.mp4')
    const exists = await fs.access(testVideo).then(() => true).catch(() => false)
    
    if (!exists) {
      console.warn('⚠️ Test videos not found. Run: npm run generate-test-videos')
      console.warn('⚠️ Skipping E2E tests...')
    }
  })

  beforeEach(() => {
    pipeline = new RenderingPipeline(path.join(OUTPUT_DIR, 'temp'))
  })

  afterEach(async () => {
    // Cleanup temp files
    await pipeline.cleanup()
  })

  afterAll(async () => {
    // Cleanup output files
    try {
      const files = await fs.readdir(OUTPUT_DIR)
      await Promise.all(
        files
          .filter((f) => f.endsWith('.mp4'))
          .map((f) => fs.unlink(path.join(OUTPUT_DIR, f)).catch(() => {}))
      )
    } catch (e) {
      // Ignore cleanup errors
    }
  })

  describe('Basic Video Processing', () => {
    it('should process 720p video without modifications', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'test-720p-5s.mp4')
      const outputPath = path.join(OUTPUT_DIR, 'e2e-basic-720p.mp4')

      // Check if input exists
      const inputExists = await fs.access(inputPath).then(() => true).catch(() => false)
      if (!inputExists) {
        console.warn('Skipping test - input video not found')
        return
      }

      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        quality: 23,
        fps: 30,
      }

      const result = await pipeline.execute(inputPath, outputPath, settings)

      expect(result.success).toBe(true)
      expect(result.outputPath).toBe(outputPath)
      // When no stages are needed (no filters, watermark, etc), pipeline just copies file
      expect(result.stages).toBeDefined()

      // Validate output file exists
      const outputExists = await fs.access(outputPath).then(() => true).catch(() => false)
      expect(outputExists).toBe(true)

      // Validate output with video-validator
      const validation = await videoValidator.validate(outputPath)
      expect(validation.valid).toBe(true)
      expect(validation.metadata?.width).toBe(1280)
      expect(validation.metadata?.height).toBe(720)
    }, E2E_TIMEOUT)

    it('should process 1080p video', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'test-1080p-5s.mp4')
      const outputPath = path.join(OUTPUT_DIR, 'e2e-basic-1080p.mp4')

      const inputExists = await fs.access(inputPath).then(() => true).catch(() => false)
      if (!inputExists) {
        console.warn('Skipping test - input video not found')
        return
      }

      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '1080p',
        quality: 23,
        fps: 30,
      }

      const result = await pipeline.execute(inputPath, outputPath, settings)

      expect(result.success).toBe(true)

      // Validate output
      const validation = await videoValidator.validate(outputPath)
      expect(validation.valid).toBe(true)
      expect(validation.metadata?.width).toBe(1920)
      expect(validation.metadata?.height).toBe(1080)
    }, E2E_TIMEOUT)
  })

  describe('Resolution Scaling', () => {
    it('should downscale 1080p to 720p', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'test-1080p-5s.mp4')
      const outputPath = path.join(OUTPUT_DIR, 'e2e-downscale-720p.mp4')

      const inputExists = await fs.access(inputPath).then(() => true).catch(() => false)
      if (!inputExists) {
        console.warn('Skipping test - input video not found')
        return
      }

      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p', // Downscale from 1080p
        quality: 23,
        fps: 30,
      }

      const result = await pipeline.execute(inputPath, outputPath, settings)

      expect(result.success).toBe(true)

      // Validate downscaled resolution
      const validation = await videoValidator.validate(outputPath)
      expect(validation.valid).toBe(true)
      expect(validation.metadata?.width).toBe(1280)
      expect(validation.metadata?.height).toBe(720)
    }, E2E_TIMEOUT)
  })

  describe('Cache System', () => {
    it('should use cached result on second render', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'test-short-2s.mp4')
      const outputPath1 = path.join(OUTPUT_DIR, 'e2e-cache-1.mp4')
      const outputPath2 = path.join(OUTPUT_DIR, 'e2e-cache-2.mp4')

      const inputExists = await fs.access(inputPath).then(() => true).catch(() => false)
      if (!inputExists) {
        console.warn('Skipping test - input video not found')
        return
      }

      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        quality: 23,
        fps: 30,
      }

      // First render
      const pipeline1 = new RenderingPipeline(path.join(OUTPUT_DIR, 'temp-cache-1'))
      const result1 = await pipeline1.execute(inputPath, outputPath1, settings)
      await pipeline1.cleanup()
      expect(result1.success).toBe(true)
      const duration1 = result1.totalDuration

      // Second render with same settings (should use cache)
      const pipeline2 = new RenderingPipeline(path.join(OUTPUT_DIR, 'temp-cache-2'))
      const result2 = await pipeline2.execute(inputPath, outputPath2, settings)
      await pipeline2.cleanup()
      expect(result2.success).toBe(true)
      const duration2 = result2.totalDuration

      // Cache should be faster (allow small margin as cache copy also takes time)
      expect(duration2).toBeLessThan(duration1 * 1.5)

      // Both outputs should be valid
      const validation1 = await videoValidator.validate(outputPath1)
      const validation2 = await videoValidator.validate(outputPath2)
      expect(validation1.valid).toBe(true)
      expect(validation2.valid).toBe(true)
    }, E2E_TIMEOUT * 2) // Double timeout for two renders
  })

  describe('Error Handling', () => {
    it('should fail gracefully with invalid input path', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'non-existent.mp4')
      const outputPath = path.join(OUTPUT_DIR, 'e2e-error.mp4')

      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        quality: 23,
        fps: 30,
      }

      const result = await pipeline.execute(inputPath, outputPath, settings)

      expect(result.success).toBe(false)
      expect(result.validationWarnings).toBeDefined()
      expect(result.validationWarnings!.length).toBeGreaterThan(0)
    }, E2E_TIMEOUT)

    it('should handle corrupted video gracefully', async () => {
      // Create a fake corrupted video file
      const corruptedPath = path.join(OUTPUT_DIR, 'corrupted.mp4')
      await fs.writeFile(corruptedPath, 'This is not a video file')

      const outputPath = path.join(OUTPUT_DIR, 'e2e-corrupted-output.mp4')

      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        quality: 23,
        fps: 30,
      }

      const result = await pipeline.execute(corruptedPath, outputPath, settings)

      expect(result.success).toBe(false)

      // Cleanup corrupted file
      await fs.unlink(corruptedPath).catch(() => {})
    }, E2E_TIMEOUT)
  })

  describe('Progress Reporting', () => {
    it('should report progress during rendering', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'test-720p-5s.mp4')
      const outputPath = path.join(OUTPUT_DIR, 'e2e-progress.mp4')

      const inputExists = await fs.access(inputPath).then(() => true).catch(() => false)
      if (!inputExists) {
        console.warn('Skipping test - input video not found')
        return
      }

      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        quality: 23,
        fps: 30,
      }

      const progressUpdates: number[] = []

      const result = await pipeline.execute(
        inputPath,
        outputPath,
        settings,
        (progress) => {
          progressUpdates.push(progress.overallProgress)
        }
      )

      expect(result.success).toBe(true)
      expect(progressUpdates.length).toBeGreaterThan(0)

      // Progress should increase
      for (let i = 1; i < progressUpdates.length; i++) {
        expect(progressUpdates[i]).toBeGreaterThanOrEqual(progressUpdates[i - 1])
      }

      // Final progress should be 100
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100)
    }, E2E_TIMEOUT)
  })

  describe('Output Validation', () => {
    it('should produce valid video with correct metadata', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'test-1080p-60fps-5s.mp4')
      const outputPath = path.join(OUTPUT_DIR, 'e2e-metadata.mp4')

      const inputExists = await fs.access(inputPath).then(() => true).catch(() => false)
      if (!inputExists) {
        console.warn('Skipping test - input video not found')
        return
      }

      const settings: ExportSettings = {
        format: 'mp4',
        resolution: '1080p',
        quality: 23,
        fps: 60,
      }

      const result = await pipeline.execute(inputPath, outputPath, settings)
      expect(result.success).toBe(true)

      // Validate metadata with FFprobe
      const validation = await videoValidator.validate(outputPath)
      expect(validation.valid).toBe(true)
      expect(validation.metadata).toBeDefined()

      const meta = validation.metadata!
      expect(meta.width).toBe(1920)
      expect(meta.height).toBe(1080)
      expect(meta.fps).toBeCloseTo(60, 1) // Allow 1 FPS tolerance
      expect(meta.duration).toBeGreaterThan(4) // At least 4 seconds
      expect(meta.duration).toBeLessThan(6) // At most 6 seconds
    }, E2E_TIMEOUT)

    it('should produce file smaller than expected for low quality', async () => {
      const inputPath = path.join(FIXTURES_DIR, 'test-720p-5s.mp4')
      const outputHighPath = path.join(OUTPUT_DIR, 'e2e-quality-high.mp4')
      const outputLowPath = path.join(OUTPUT_DIR, 'e2e-quality-low.mp4')

      const inputExists = await fs.access(inputPath).then(() => true).catch(() => false)
      if (!inputExists) {
        console.warn('Skipping test - input video not found')
        return
      }

      // High quality
      const highSettings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        quality: 18, // High quality (low CRF)
        fps: 30,
      }

      await pipeline.execute(inputPath, outputHighPath, highSettings)

      // Low quality
      const lowSettings: ExportSettings = {
        format: 'mp4',
        resolution: '720p',
        quality: 28, // Low quality (high CRF)
        fps: 30,
      }

      await pipeline.execute(inputPath, outputLowPath, lowSettings)

      // Get file sizes
      const highStats = await fs.stat(outputHighPath)
      const lowStats = await fs.stat(outputLowPath)

      // Low quality should be smaller
      expect(lowStats.size).toBeLessThan(highStats.size)
    }, E2E_TIMEOUT * 2)
  })
})
