/**
 * 🖥️ Hardware Detection System
 * Detecta capacidades de hardware para otimização adaptativa
 * Sprint 52 - Adaptive Quality Optimizations
 */

import os from 'os'
import { execSync } from 'child_process'

/**
 * GPU Information
 */
export interface GPUInfo {
  name: string
  vendor: string
  vram?: number // MB
  available: boolean
}

/**
 * Hardware Capabilities
 */
export interface HardwareCapabilities {
  cpu: {
    cores: number
    threads: number
    model: string
    speed: number // GHz
  }
  memory: {
    total: number // GB
    free: number // GB
    available: number // GB
  }
  gpu: GPUInfo[]
  platform: string
  arch: string
}

/**
 * Performance Tier
 */
export enum PerformanceTier {
  LOW = 'low', // < 4 cores, < 8GB RAM
  MEDIUM = 'medium', // 4-8 cores, 8-16GB RAM
  HIGH = 'high', // 8-16 cores, 16-32GB RAM
  ULTRA = 'ultra', // > 16 cores, > 32GB RAM
}

/**
 * Quality Preset based on hardware
 */
export interface QualityPreset {
  tier: PerformanceTier
  maxResolution: string
  maxBitrate: number // kbps
  maxFPS: number
  threads: number
  preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow'
  enableGPU: boolean
}

/**
 * Hardware Detector
 */
export class HardwareDetector {
  private static instance: HardwareDetector
  private capabilities: HardwareCapabilities | null = null
  private lastDetection: number = 0
  private detectionCacheTTL = 60000 // 1 minute

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): HardwareDetector {
    if (!HardwareDetector.instance) {
      HardwareDetector.instance = new HardwareDetector()
    }
    return HardwareDetector.instance
  }

  /**
   * Detect hardware capabilities
   */
  async detect(): Promise<HardwareCapabilities> {
    const now = Date.now()

    // Return cached if fresh
    if (this.capabilities && now - this.lastDetection < this.detectionCacheTTL) {
      return this.capabilities
    }

    const cpuInfo = os.cpus()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()

    this.capabilities = {
      cpu: {
        cores: os.cpus().length,
        threads: os.cpus().length, // Approximation (real threads would need OS-specific detection)
        model: cpuInfo[0]?.model || 'Unknown',
        speed: cpuInfo[0]?.speed / 1000 || 0, // Convert MHz to GHz
      },
      memory: {
        total: Math.round(totalMemory / (1024 * 1024 * 1024)), // Convert to GB
        free: Math.round(freeMemory / (1024 * 1024 * 1024)),
        available: Math.round(freeMemory / (1024 * 1024 * 1024)),
      },
      gpu: await this.detectGPU(),
      platform: os.platform(),
      arch: os.arch(),
    }

    this.lastDetection = now
    return this.capabilities
  }

  /**
   * Detect GPU availability
   */
  private async detectGPU(): Promise<GPUInfo[]> {
    const gpus: GPUInfo[] = []

    try {
      if (process.platform === 'win32') {
        // Windows: Try to detect NVIDIA GPU via nvidia-smi
        try {
          const output = execSync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader', {
            encoding: 'utf-8',
            timeout: 5000,
          })

          const lines = output.trim().split('\n')
          for (const line of lines) {
            const [name, vramStr] = line.split(',')
            const vram = parseInt(vramStr?.trim() || '0')

            gpus.push({
              name: name.trim(),
              vendor: 'NVIDIA',
              vram: vram,
              available: true,
            })
          }
        } catch {
          // nvidia-smi not available
        }

        // Try AMD GPU detection
        try {
          const output = execSync('wmic path win32_VideoController get name', {
            encoding: 'utf-8',
            timeout: 5000,
          })

          const lines = output.trim().split('\n').slice(1) // Skip header
          for (const line of lines) {
            const name = line.trim()
            if (name && name.toLowerCase().includes('amd')) {
              gpus.push({
                name: name,
                vendor: 'AMD',
                available: true,
              })
            }
          }
        } catch {
          // wmic failed
        }
      } else if (process.platform === 'darwin') {
        // macOS: Try to detect GPU via system_profiler
        try {
          const output = execSync('system_profiler SPDisplaysDataType', {
            encoding: 'utf-8',
            timeout: 5000,
          })

          // Parse GPU info from output
          const gpuMatch = output.match(/Chipset Model: (.+)/g)
          if (gpuMatch) {
            for (const match of gpuMatch) {
              const name = match.replace('Chipset Model: ', '').trim()
              gpus.push({
                name: name,
                vendor: name.includes('AMD') ? 'AMD' : name.includes('NVIDIA') ? 'NVIDIA' : 'Intel',
                available: true,
              })
            }
          }
        } catch {
          // system_profiler failed
        }
      } else {
        // Linux: Try lspci
        try {
          const output = execSync('lspci | grep -i vga', {
            encoding: 'utf-8',
            timeout: 5000,
          })

          const lines = output.trim().split('\n')
          for (const line of lines) {
            const name = line.split(':').slice(2).join(':').trim()
            gpus.push({
              name: name,
              vendor: name.includes('NVIDIA')
                ? 'NVIDIA'
                : name.includes('AMD')
                  ? 'AMD'
                  : 'Intel',
              available: true,
            })
          }
        } catch {
          // lspci failed
        }
      }
    } catch (error) {
      console.warn('GPU detection failed:', error)
    }

    // If no GPU detected, add integrated/software fallback
    if (gpus.length === 0) {
      gpus.push({
        name: 'Software Encoding',
        vendor: 'CPU',
        available: false,
      })
    }

    return gpus
  }

  /**
   * Determine performance tier based on hardware
   */
  async getPerformanceTier(): Promise<PerformanceTier> {
    const hw = await this.detect()

    const cores = hw.cpu.cores
    const ram = hw.memory.total

    // Tier based on cores and RAM
    if (cores >= 16 && ram >= 32) {
      return PerformanceTier.ULTRA
    } else if (cores >= 8 && ram >= 16) {
      return PerformanceTier.HIGH
    } else if (cores >= 4 && ram >= 8) {
      return PerformanceTier.MEDIUM
    } else {
      return PerformanceTier.LOW
    }
  }

  /**
   * Get recommended quality preset
   */
  async getQualityPreset(): Promise<QualityPreset> {
    const tier = await this.getPerformanceTier()
    const hw = await this.detect()
    const hasGPU = hw.gpu.some((g) => g.available)

    switch (tier) {
      case PerformanceTier.ULTRA:
        return {
          tier,
          maxResolution: '4k',
          maxBitrate: 20000,
          maxFPS: 60,
          threads: Math.min(hw.cpu.cores, 16),
          preset: hasGPU ? 'faster' : 'medium',
          enableGPU: hasGPU,
        }

      case PerformanceTier.HIGH:
        return {
          tier,
          maxResolution: '1440p',
          maxBitrate: 12000,
          maxFPS: 60,
          threads: Math.min(hw.cpu.cores, 8),
          preset: hasGPU ? 'fast' : 'faster',
          enableGPU: hasGPU,
        }

      case PerformanceTier.MEDIUM:
        return {
          tier,
          maxResolution: '1080p',
          maxBitrate: 8000,
          maxFPS: 30,
          threads: Math.min(hw.cpu.cores, 4),
          preset: hasGPU ? 'veryfast' : 'fast',
          enableGPU: hasGPU,
        }

      case PerformanceTier.LOW:
      default:
        return {
          tier,
          maxResolution: '720p',
          maxBitrate: 4000,
          maxFPS: 30,
          threads: Math.min(hw.cpu.cores, 2),
          preset: 'ultrafast',
          enableGPU: false, // Disable GPU on low-end systems to avoid overhead
        }
    }
  }

  /**
   * Get memory pressure (0-1)
   */
  async getMemoryPressure(): Promise<number> {
    const hw = await this.detect()
    const usedMemory = hw.memory.total - hw.memory.free
    return Math.min(usedMemory / hw.memory.total, 1)
  }

  /**
   * Check if system can handle given settings
   */
  async canHandle(resolution: string, bitrate: number, fps: number): Promise<boolean> {
    const preset = await this.getQualityPreset()

    // Resolution check
    const resolutionScore = {
      '4k': 4,
      '1440p': 3,
      '1080p': 2,
      '720p': 1,
      '480p': 0,
    }

    const requestedScore = resolutionScore[resolution as keyof typeof resolutionScore] || 0
    const maxScore = resolutionScore[preset.maxResolution as keyof typeof resolutionScore] || 0

    if (requestedScore > maxScore) {
      return false
    }

    // Bitrate check
    if (bitrate > preset.maxBitrate) {
      return false
    }

    // FPS check
    if (fps > preset.maxFPS) {
      return false
    }

    // Memory pressure check
    const pressure = await this.getMemoryPressure()
    if (pressure > 0.9) {
      return false // System under high memory pressure
    }

    return true
  }

  /**
   * Get system status summary
   */
  async getStatus(): Promise<{
    tier: PerformanceTier
    preset: QualityPreset
    capabilities: HardwareCapabilities
    memoryPressure: number
  }> {
    const tier = await this.getPerformanceTier()
    const preset = await this.getQualityPreset()
    const capabilities = await this.detect()
    const memoryPressure = await this.getMemoryPressure()

    return {
      tier,
      preset,
      capabilities,
      memoryPressure,
    }
  }
}

// Export singleton instance
export const hardwareDetector = HardwareDetector.getInstance()
