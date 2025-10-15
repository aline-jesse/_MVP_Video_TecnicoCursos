/**
 * Unit Tests for Rendering Pipeline - Sprint 51
 * Tests: Pause/Cancel/Resume + ETA Calculation
 * Focus: Test state management and control methods independently
 */

import { RenderingPipeline, PipelineState } from '@/lib/export/rendering-pipeline'

describe('RenderingPipeline - State Management (Sprint 51)', () => {
  let pipeline: RenderingPipeline

  beforeEach(() => {
    pipeline = new RenderingPipeline()
  })

  describe('State Initialization', () => {
    test('should initialize with IDLE state', () => {
      expect(pipeline.getState()).toBe(PipelineState.IDLE)
    })
  })

  describe('Pause Control', () => {
    test('should change state to PAUSED when pause() is called on RUNNING pipeline', () => {
      // Set to RUNNING first
      ;(pipeline as any).state = PipelineState.RUNNING
      
      pipeline.pause()
      expect(pipeline.getState()).toBe(PipelineState.PAUSED)
    })

    test('should not change state when pause() called on IDLE pipeline', () => {
      expect(pipeline.getState()).toBe(PipelineState.IDLE)
      
      pipeline.pause()
      expect(pipeline.getState()).toBe(PipelineState.IDLE)
    })

    test('should allow multiple pause() calls on RUNNING pipeline', () => {
      ;(pipeline as any).state = PipelineState.RUNNING
      
      pipeline.pause()
      expect(pipeline.getState()).toBe(PipelineState.PAUSED)
      
      pipeline.pause()
      expect(pipeline.getState()).toBe(PipelineState.PAUSED)
    })
  })

  describe('Resume Control', () => {
    test('should resume from PAUSED state', () => {
      // Set to PAUSED first
      ;(pipeline as any).state = PipelineState.PAUSED
      ;(pipeline as any).pausedAt = Date.now()
      
      pipeline.resume()
      expect(pipeline.getState()).toBe(PipelineState.RUNNING)
    })

    test('should not affect non-paused pipeline', () => {
      expect(pipeline.getState()).toBe(PipelineState.IDLE)
      pipeline.resume()
      expect(pipeline.getState()).toBe(PipelineState.IDLE)
    })
  })

  describe('Cancel Control', () => {
    test('should change state to CANCELLED when cancel() is called on RUNNING pipeline', () => {
      ;(pipeline as any).state = PipelineState.RUNNING
      
      pipeline.cancel()
      expect(pipeline.getState()).toBe(PipelineState.CANCELLED)
    })

    test('should allow cancel from PAUSED', () => {
      ;(pipeline as any).state = PipelineState.PAUSED
      
      pipeline.cancel()
      expect(pipeline.getState()).toBe(PipelineState.CANCELLED)
    })

    test('should not change IDLE state when cancel() called', () => {
      expect(pipeline.getState()).toBe(PipelineState.IDLE)
      pipeline.cancel()
      expect(pipeline.getState()).toBe(PipelineState.IDLE)
    })
  })

  describe('State Transitions', () => {
    test('should transition RUNNING → PAUSED → RUNNING → CANCELLED', () => {
      ;(pipeline as any).state = PipelineState.RUNNING
      expect(pipeline.getState()).toBe(PipelineState.RUNNING)
      
      pipeline.pause()
      expect(pipeline.getState()).toBe(PipelineState.PAUSED)
      
      pipeline.resume()
      expect(pipeline.getState()).toBe(PipelineState.RUNNING)
      
      pipeline.cancel()
      expect(pipeline.getState()).toBe(PipelineState.CANCELLED)
    })

    test('should transition PAUSED → CANCELLED directly', () => {
      ;(pipeline as any).state = PipelineState.PAUSED
      
      pipeline.cancel()
      expect(pipeline.getState()).toBe(PipelineState.CANCELLED)
    })
  })

  describe('getState Method', () => {
    test('should return current state', () => {
      expect(pipeline.getState()).toBe(PipelineState.IDLE)
      
      ;(pipeline as any).state = PipelineState.RUNNING
      expect(pipeline.getState()).toBe(PipelineState.RUNNING)
      
      ;(pipeline as any).state = PipelineState.PAUSED
      expect(pipeline.getState()).toBe(PipelineState.PAUSED)
    })
  })
})

describe('RenderingPipeline - ETA Calculation (Sprint 51)', () => {
  let pipeline: RenderingPipeline

  beforeEach(() => {
    pipeline = new RenderingPipeline()
  })

  describe('calculateETA Method', () => {
    test('should have calculateETA method', () => {
      expect(typeof (pipeline as any).calculateETA).toBe('function')
    })

    test('should return number when called with valid arguments', () => {
      const eta = (pipeline as any).calculateETA('audio_processing', 0.5, 4, 0)
      expect(typeof eta).toBe('number')
      expect(eta).toBeGreaterThanOrEqual(0)
    })

    test('should calculate ETA based on current progress', () => {
      const eta = (pipeline as any).calculateETA('audio_processing', 0.75, 4, 0)
      expect(typeof eta).toBe('number')
      expect(eta).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateAverageStageTime Method', () => {
    test('should have calculateAverageStageTime method', () => {
      expect(typeof (pipeline as any).calculateAverageStageTime).toBe('function')
    })

    test('should return number when called', () => {
      const avgTime = (pipeline as any).calculateAverageStageTime()
      expect(typeof avgTime).toBe('number')
      expect(avgTime).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('RenderingPipeline - checkPauseOrCancel Method (Sprint 51)', () => {
  let pipeline: RenderingPipeline

  beforeEach(() => {
    pipeline = new RenderingPipeline()
  })

  test('should have checkPauseOrCancel method', () => {
    expect(typeof (pipeline as any).checkPauseOrCancel).toBe('function')
  })

  test('should return true when state is RUNNING', async () => {
    ;(pipeline as any).state = PipelineState.RUNNING
    const result = await (pipeline as any).checkPauseOrCancel()
    expect(result).toBe(true)
  })

  test('should return false when state is CANCELLED', async () => {
    ;(pipeline as any).state = PipelineState.CANCELLED
    const result = await (pipeline as any).checkPauseOrCancel()
    expect(result).toBe(false)
  })

  test('should wait while PAUSED and return true when resumed', async () => {
    ;(pipeline as any).state = PipelineState.PAUSED
    
    // Resume after short delay
    setTimeout(() => {
      ;(pipeline as any).state = PipelineState.RUNNING
    }, 100)
    
    const result = await (pipeline as any).checkPauseOrCancel()
    expect(result).toBe(true)
  }, 500)
})

describe('RenderingPipeline - PipelineState Enum (Sprint 51)', () => {
  test('should have IDLE state', () => {
    expect(PipelineState.IDLE).toBe('idle')
  })

  test('should have RUNNING state', () => {
    expect(PipelineState.RUNNING).toBe('running')
  })

  test('should have PAUSED state', () => {
    expect(PipelineState.PAUSED).toBe('paused')
  })

  test('should have CANCELLED state', () => {
    expect(PipelineState.CANCELLED).toBe('cancelled')
  })

  test('should have COMPLETED state', () => {
    expect(PipelineState.COMPLETED).toBe('completed')
  })

  test('should have FAILED state', () => {
    expect(PipelineState.FAILED).toBe('failed')
  })
})

