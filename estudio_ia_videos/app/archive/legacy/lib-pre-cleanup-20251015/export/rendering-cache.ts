/**
 * 💾 Rendering Cache System
 * Cache processed videos to avoid re-processing
 */

import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import type { ExportSettings } from '@/types/export.types'

/**
 * Cache entry
 */
export interface CacheEntry {
  key: string
  inputHash: string
  settingsHash: string
  outputPath: string
  createdAt: number
  fileSize: number
  duration: number
}

/**
 * Cache metadata
 */
interface CacheMetadata {
  entries: Record<string, CacheEntry>
  totalSize: number
  lastCleanup: number
}

/**
 * Rendering Cache Manager
 */
export class RenderingCache {
  private cacheDir: string
  private metadataFile: string
  private metadata: CacheMetadata
  private maxCacheSize: number = 10 * 1024 * 1024 * 1024 // 10GB
  private maxEntryAge: number = 7 * 24 * 60 * 60 * 1000 // 7 days

  constructor(cacheDir: string = '/tmp/rendering-cache') {
    this.cacheDir = cacheDir
    this.metadataFile = path.join(cacheDir, 'metadata.json')
    this.metadata = {
      entries: {},
      totalSize: 0,
      lastCleanup: Date.now(),
    }
  }

  /**
   * Initialize cache directory and load metadata
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true })

      try {
        const data = await fs.readFile(this.metadataFile, 'utf-8')
        this.metadata = JSON.parse(data)
      } catch {
        // Metadata file doesn't exist, use defaults
        await this.saveMetadata()
      }

      // Cleanup old entries if needed
      if (Date.now() - this.metadata.lastCleanup > 24 * 60 * 60 * 1000) {
        await this.cleanup()
      }
    } catch (error) {
      console.error('Failed to initialize cache:', error)
    }
  }

  /**
   * Generate cache key from input file and settings
   */
  async generateKey(
    inputPath: string,
    settings: ExportSettings
  ): Promise<{ key: string; inputHash: string; settingsHash: string }> {
    // Hash input file content
    const inputHash = await this.hashFile(inputPath)

    // Hash settings (excluding output path and other non-essential fields)
    const settingsHash = this.hashObject({
      format: settings.format,
      resolution: settings.resolution,
      quality: settings.quality,
      fps: settings.fps,
      watermark: settings.watermark,
      videoFilters: settings.videoFilters,
      audioEnhancements: settings.audioEnhancements,
      subtitle: settings.subtitle,
    })

    const key = `${inputHash}_${settingsHash}`

    return { key, inputHash, settingsHash }
  }

  /**
   * Get cached output if exists
   */
  async get(cacheKey: string): Promise<string | null> {
    const entry = this.metadata.entries[cacheKey]

    if (!entry) {
      return null
    }

    // Check if cache file still exists
    try {
      await fs.access(entry.outputPath)

      // Check if entry is not too old
      if (Date.now() - entry.createdAt > this.maxEntryAge) {
        console.log(`🗑️ Cache entry expired: ${cacheKey}`)
        await this.delete(cacheKey)
        return null
      }

      console.log(`✅ Cache hit: ${cacheKey}`)
      return entry.outputPath
    } catch {
      // Cache file was deleted externally
      console.log(`⚠️ Cache file missing: ${cacheKey}`)
      await this.delete(cacheKey)
      return null
    }
  }

  /**
   * Store processed video in cache
   */
  async set(
    cacheKey: string,
    inputHash: string,
    settingsHash: string,
    outputPath: string,
    duration: number
  ): Promise<void> {
    try {
      const stats = await fs.stat(outputPath)

      // Create cache file path
      const cachedFilePath = path.join(
        this.cacheDir,
        `${cacheKey}${path.extname(outputPath)}`
      )

      // Copy output file to cache
      await fs.copyFile(outputPath, cachedFilePath)

      // Add to metadata
      this.metadata.entries[cacheKey] = {
        key: cacheKey,
        inputHash,
        settingsHash,
        outputPath: cachedFilePath,
        createdAt: Date.now(),
        fileSize: stats.size,
        duration,
      }

      this.metadata.totalSize += stats.size

      await this.saveMetadata()

      console.log(`💾 Cached result: ${cacheKey} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`)

      // Cleanup if cache is too large
      if (this.metadata.totalSize > this.maxCacheSize) {
        await this.cleanup()
      }
    } catch (error) {
      console.error('Failed to cache result:', error)
    }
  }

  /**
   * Delete cache entry
   */
  async delete(cacheKey: string): Promise<void> {
    const entry = this.metadata.entries[cacheKey]

    if (entry) {
      try {
        await fs.unlink(entry.outputPath)
      } catch {
        // File already deleted
      }

      this.metadata.totalSize -= entry.fileSize
      delete this.metadata.entries[cacheKey]
      await this.saveMetadata()
    }
  }

  /**
   * Cleanup old entries
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up cache...')

    const now = Date.now()
    const entries = Object.values(this.metadata.entries)

    // Sort by creation time (oldest first)
    entries.sort((a, b) => a.createdAt - b.createdAt)

    let deletedCount = 0
    let freedSpace = 0

    for (const entry of entries) {
      // Delete if too old
      if (now - entry.createdAt > this.maxEntryAge) {
        freedSpace += entry.fileSize
        await this.delete(entry.key)
        deletedCount++
        continue
      }

      // Delete if cache is too large (delete oldest first)
      if (this.metadata.totalSize > this.maxCacheSize) {
        freedSpace += entry.fileSize
        await this.delete(entry.key)
        deletedCount++
      } else {
        break
      }
    }

    this.metadata.lastCleanup = now
    await this.saveMetadata()

    if (deletedCount > 0) {
      console.log(
        `🗑️ Deleted ${deletedCount} cache entries, freed ${(freedSpace / (1024 * 1024)).toFixed(2)} MB`
      )
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number
    totalSize: number
    totalSizeMB: number
    oldestEntry: number | null
    newestEntry: number | null
  } {
    const entries = Object.values(this.metadata.entries)

    return {
      entries: entries.length,
      totalSize: this.metadata.totalSize,
      totalSizeMB: this.metadata.totalSize / (1024 * 1024),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map((e) => e.createdAt)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map((e) => e.createdAt)) : null,
    }
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    console.log('🗑️ Clearing entire cache...')

    for (const key of Object.keys(this.metadata.entries)) {
      await this.delete(key)
    }

    this.metadata = {
      entries: {},
      totalSize: 0,
      lastCleanup: Date.now(),
    }

    await this.saveMetadata()
  }

  /**
   * Save metadata to file
   */
  private async saveMetadata(): Promise<void> {
    try {
      await fs.writeFile(this.metadataFile, JSON.stringify(this.metadata, null, 2))
    } catch (error) {
      console.error('Failed to save cache metadata:', error)
    }
  }

  /**
   * Hash file content using MD5
   */
  private async hashFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5')
      const stream = require('fs').createReadStream(filePath)

      stream.on('data', (data: any) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  /**
   * Hash object using MD5
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort())
    return crypto.createHash('md5').update(str).digest('hex')
  }
}

/**
 * Singleton instance
 */
export const renderingCache = new RenderingCache()
