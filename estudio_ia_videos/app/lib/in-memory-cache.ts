/**
 * Cache simples em memória para ambientes sem Redis.
 */

interface CacheEntry {
  value: unknown
  expiresAt: number
}

interface CacheOptions {
  ttl?: number
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null
  private readonly defaultTtl: number

  constructor(ttlMs = 30000) {
    this.defaultTtl = ttlMs
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.value as T
  }

  set(key: string, value: unknown, ttlMs?: number): void {
    const ttl = typeof ttlMs === 'number' ? ttlMs : this.defaultTtl
    this.cache.set(key, {
      value,
      expiresAt: ttl > 0 ? Date.now() + ttl : 0
    })
  }

  setex(key: string, seconds: number, value: unknown): void {
    this.set(key, value, seconds * 1000)
  }

  del(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  disconnect(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt > 0 && now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

let singleton: InMemoryCache | null = null

export default function getInMemoryCache(options: CacheOptions = {}): InMemoryCache {
  if (!singleton) {
    singleton = new InMemoryCache(options.ttl)
  }
  return singleton
}
