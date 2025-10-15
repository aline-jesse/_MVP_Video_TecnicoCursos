
import crypto from 'crypto'

interface CachedAudio {
  buffer: Buffer
  metadata: {
    voice_id: string
    text: string
    created_at: number
    cost: number
  }
}

export class TTSCache {
  private cache = new Map<string, CachedAudio>()
  private maxCacheSize = 1000 // Max 1000 cached audios
  private cacheTTL = 24 * 60 * 60 * 1000 // 24 hours
  private hitCount = 0
  private missCount = 0

  // Generate cache key from text and voice
  private generateKey(text: string, voiceId: string): string {
    const content = `${text.toLowerCase().trim()}-${voiceId}`
    return crypto.createHash('md5').update(content).digest('hex')
  }

  // Check if audio is cached and not expired
  get(text: string, voiceId: string): Buffer | null {
    const key = this.generateKey(text, voiceId)
    const cached = this.cache.get(key)

    if (!cached) {
      this.missCount++
      return null
    }

    // Check if expired
    const now = Date.now()
    if (now - cached.metadata.created_at > this.cacheTTL) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    this.hitCount++
    console.log(`TTS Cache HIT for key: ${key.substring(0, 8)}...`)
    return cached.buffer
  }

  // Store audio in cache
  set(text: string, voiceId: string, buffer: Buffer, cost: number): void {
    const key = this.generateKey(text, voiceId)
    
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      buffer,
      metadata: {
        voice_id: voiceId,
        text: text.substring(0, 100) + '...', // Store partial text for debugging
        created_at: Date.now(),
        cost
      }
    })

    console.log(`TTS Cache SET for key: ${key.substring(0, 8)}... (${buffer.length} bytes)`)
  }

  // Clean expired entries
  private cleanup(): void {
    const now = Date.now()
    let removedCount = 0

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.metadata.created_at > this.cacheTTL) {
        this.cache.delete(key)
        removedCount++
      }
    }

    console.log(`TTS Cache cleanup: removed ${removedCount} expired entries`)

    // If still full, remove oldest entries
    if (this.cache.size >= this.maxCacheSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].metadata.created_at - b[1].metadata.created_at)
      
      const toRemove = Math.floor(this.maxCacheSize * 0.2) // Remove 20%
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0])
      }
      
      console.log(`TTS Cache cleanup: removed ${toRemove} oldest entries`)
    }
  }

  // Get cache statistics
  getStats(): {
    size: number
    totalCost: number
    oldestEntry: number
    hitRate: number
    hitCount: number
    missCount: number
    totalRequests: number
  } {
    let totalCost = 0
    let oldestTimestamp = Date.now()
    
    for (const cached of this.cache.values()) {
      totalCost += cached.metadata.cost
      oldestTimestamp = Math.min(oldestTimestamp, cached.metadata.created_at)
    }

    const totalRequests = this.hitCount + this.missCount
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0

    return {
      size: this.cache.size,
      totalCost,
      oldestEntry: oldestTimestamp,
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
      hitCount: this.hitCount,
      missCount: this.missCount,
      totalRequests
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    console.log('TTS Cache cleared')
  }
}

// Singleton instance
export const ttsCache = new TTSCache()
