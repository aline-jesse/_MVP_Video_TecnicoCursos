/**
 * 🧠 Intelligent Cache System
 * Sistema de cache inteligente com Redis + fallback em memória
 * Suporte a compressão, invalidação automática e métricas avançadas
 */

import Redis from 'ioredis'
import { LRUCache } from 'lru-cache'
import { gzip, gunzip } from 'zlib'
import { promisify } from 'util'

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

interface CacheOptions {
  ttl?: number
  compress?: boolean
  tags?: string[]
  priority?: 'low' | 'medium' | 'high'
}

interface CacheStats {
  redis: {
    enabled: boolean
    connected: boolean
    hits: number
    misses: number
    errors: number
    memory: string
    keys: number
  }
  memory: {
    enabled: boolean
    hits: number
    misses: number
    size: number
    maxSize: number
  }
  combined: {
    totalHits: number
    totalMisses: number
    hitRate: number
    totalRequests: number
  }
}

class IntelligentCacheService {
  private static instance: IntelligentCacheService
  private redis: Redis | null = null
  private memoryCache: LRUCache<string, any>
  private isRedisEnabled = false
  private isRedisConnected = false
  
  // Métricas
  private redisHits = 0
  private redisMisses = 0
  private redisErrors = 0
  private memoryHits = 0
  private memoryMisses = 0
  
  // Tags para invalidação
  private tagMap = new Map<string, Set<string>>()
  
  private constructor() {
    this.initializeMemoryCache()
    this.initializeRedis()
  }

  static getInstance(): IntelligentCacheService {
    if (!IntelligentCacheService.instance) {
      IntelligentCacheService.instance = new IntelligentCacheService()
    }
    return IntelligentCacheService.instance
  }

  private initializeMemoryCache(): void {
    this.memoryCache = new LRUCache({
      max: 1000, // máximo 1000 itens
      maxSize: 100 * 1024 * 1024, // máximo 100MB
      sizeCalculation: (value) => {
        return JSON.stringify(value).length
      },
      ttl: 1000 * 60 * 60, // 1 hora por padrão
      allowStale: false,
      updateAgeOnGet: true,
      updateAgeOnHas: false,
    })
    
    console.log('✅ Memory cache initialized')
  }

  private initializeRedis(): void {
    try {
      const redisUrl = process.env.REDIS_URL
      
      if (!redisUrl || process.env.REDIS_MOCK_MODE === 'true') {
        console.warn('⚠️ Redis not configured or in mock mode, using memory fallback only')
        return
      }

      this.redis = new Redis(redisUrl, {
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false,
        connectTimeout: 5000,
        commandTimeout: 3000,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('⚠️ Redis connection failed after 3 attempts, using memory fallback')
            return null
          }
          return Math.min(times * 1000, 3000)
        }
      })

      this.redis.on('connect', () => {
        console.log('✅ Redis cache connected')
        this.isRedisEnabled = true
        this.isRedisConnected = true
      })

      this.redis.on('ready', () => {
        console.log('✅ Redis cache ready')
        this.isRedisConnected = true
      })

      this.redis.on('error', (error) => {
        console.warn('⚠️ Redis error:', error.message)
        this.isRedisConnected = false
        this.redisErrors++
      })

      this.redis.on('close', () => {
        console.warn('⚠️ Redis connection closed')
        this.isRedisConnected = false
      })

      // Tentar conectar
      this.redis.connect().catch((error) => {
        console.warn('⚠️ Redis connection failed:', error.message)
        this.isRedisEnabled = false
      })

    } catch (error: any) {
      console.warn('⚠️ Redis initialization failed:', error.message)
      this.isRedisEnabled = false
    }
  }

  /**
   * Get value from cache (Redis first, then memory fallback)
   */
  async get<T>(key: string): Promise<T | null> {
    // Tentar Redis primeiro
    if (this.isRedisEnabled && this.redis && this.isRedisConnected) {
      try {
        const value = await this.redis.get(key)
        if (value) {
          this.redisHits++
          
          // Verificar se está comprimido
          if (value.startsWith('gzip:')) {
            const compressed = Buffer.from(value.slice(5), 'base64')
            const decompressed = await gunzipAsync(compressed)
            return JSON.parse(decompressed.toString()) as T
          }
          
          return JSON.parse(value) as T
        }
        this.redisMisses++
      } catch (error: any) {
        console.error('Redis GET error:', error.message)
        this.redisErrors++
      }
    }

    // Fallback para memory cache
    const memoryValue = this.memoryCache.get(key)
    if (memoryValue !== undefined) {
      this.memoryHits++
      return memoryValue as T
    }
    
    this.memoryMisses++
    return null
  }

  /**
   * Set value in cache with intelligent storage
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    const {
      ttl = 3600,
      compress = false,
      tags = [],
      priority = 'medium'
    } = options

    let success = false

    // Armazenar tags para invalidação
    if (tags.length > 0) {
      for (const tag of tags) {
        if (!this.tagMap.has(tag)) {
          this.tagMap.set(tag, new Set())
        }
        this.tagMap.get(tag)!.add(key)
      }
    }

    // Tentar Redis primeiro
    if (this.isRedisEnabled && this.redis && this.isRedisConnected) {
      try {
        let serialized = JSON.stringify(value)
        
        // Comprimir se necessário (para valores grandes)
        if (compress || serialized.length > 1024) {
          const compressed = await gzipAsync(Buffer.from(serialized))
          serialized = 'gzip:' + compressed.toString('base64')
        }
        
        await this.redis.setex(key, ttl, serialized)
        success = true
      } catch (error: any) {
        console.error('Redis SET error:', error.message)
        this.redisErrors++
      }
    }

    // Sempre armazenar no memory cache como fallback
    const memoryTtl = Math.min(ttl * 1000, 1000 * 60 * 60) // máximo 1 hora
    this.memoryCache.set(key, value, { ttl: memoryTtl })

    return success
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    let success = false

    // Remover do Redis
    if (this.isRedisEnabled && this.redis && this.isRedisConnected) {
      try {
        await this.redis.del(key)
        success = true
      } catch (error: any) {
        console.error('Redis DELETE error:', error.message)
        this.redisErrors++
      }
    }

    // Remover do memory cache
    this.memoryCache.delete(key)

    // Remover das tags
    for (const [tag, keys] of this.tagMap.entries()) {
      keys.delete(key)
      if (keys.size === 0) {
        this.tagMap.delete(tag)
      }
    }

    return success
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let deletedCount = 0

    for (const tag of tags) {
      const keys = this.tagMap.get(tag)
      if (keys) {
        for (const key of keys) {
          await this.delete(key)
          deletedCount++
        }
        this.tagMap.delete(tag)
      }
    }

    return deletedCount
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    let success = false

    // Limpar Redis
    if (this.isRedisEnabled && this.redis && this.isRedisConnected) {
      try {
        await this.redis.flushdb()
        success = true
      } catch (error: any) {
        console.error('Redis CLEAR error:', error.message)
        this.redisErrors++
      }
    }

    // Limpar memory cache
    this.memoryCache.clear()
    this.tagMap.clear()

    return success
  }

  /**
   * Get comprehensive cache statistics
   */
  async getStats(): Promise<CacheStats> {
    let redisKeys = 0
    let redisMemory = '0'

    if (this.isRedisEnabled && this.redis && this.isRedisConnected) {
      try {
        redisKeys = await this.redis.dbsize()
        const info = await this.redis.info('memory')
        const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/)
        redisMemory = memoryMatch ? memoryMatch[1].trim() : '0'
      } catch (error: any) {
        console.error('Redis STATS error:', error.message)
      }
    }

    const totalHits = this.redisHits + this.memoryHits
    const totalMisses = this.redisMisses + this.memoryMisses
    const totalRequests = totalHits + totalMisses
    const hitRate = totalRequests > 0 ? Math.round((totalHits / totalRequests) * 10000) / 100 : 0

    return {
      redis: {
        enabled: this.isRedisEnabled,
        connected: this.isRedisConnected,
        hits: this.redisHits,
        misses: this.redisMisses,
        errors: this.redisErrors,
        memory: redisMemory,
        keys: redisKeys
      },
      memory: {
        enabled: true,
        hits: this.memoryHits,
        misses: this.memoryMisses,
        size: this.memoryCache.size,
        maxSize: this.memoryCache.max as number
      },
      combined: {
        totalHits,
        totalMisses,
        hitRate,
        totalRequests
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ redis: boolean; memory: boolean; overall: boolean }> {
    let redisHealth = false

    if (this.isRedisEnabled && this.redis && this.isRedisConnected) {
      try {
        await this.redis.ping()
        redisHealth = true
      } catch (error) {
        redisHealth = false
      }
    }

    const memoryHealth = this.memoryCache !== null
    const overallHealth = redisHealth || memoryHealth

    return {
      redis: redisHealth,
      memory: memoryHealth,
      overall: overallHealth
    }
  }

  /**
   * Cache with automatic fallback and retry
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Tentar obter do cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Cache miss - buscar dados
    const data = await fetcher()
    
    // Armazenar no cache
    await this.set(key, data, options)
    
    return data
  }
}

// Export singleton instance
export const intelligentCache = IntelligentCacheService.getInstance()

// Export types
export type { CacheOptions, CacheStats }

/**
 * Simple in-memory caches with synchronous API
 * These are lightweight wrappers intended for UI/preview flows that use
 * get/set calls synchronously (without await). They do NOT use Redis.
 *
 * Note: Keep these exports to satisfy existing imports like:
 *   import { pptxCache, templateCache, renderCache } from '../cache/intelligent-cache'
 */
interface SimpleCacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  averageAccessTime: number
}

class SimpleLocalCache {
  private cache: LRUCache<string, any>
  private hits = 0
  private misses = 0
  private accessTimeSum = 0
  private accessCount = 0
  private totalSizeBytes = 0
  private tagMap = new Map<string, Set<string>>()

  constructor(options?: { maxEntries?: number; maxSizeBytes?: number }) {
    const { maxEntries = 1000, maxSizeBytes = 50 * 1024 * 1024 } = options || {}
    this.cache = new LRUCache<string, any>({
      max: maxEntries,
      maxSize: maxSizeBytes,
      sizeCalculation: (value) => {
        try {
          return JSON.stringify(value).length
        } catch {
          // Fallback if value is not serializable
          return 0
        }
      },
      ttl: 1000 * 60 * 60, // default TTL: 1 hour
      allowStale: false,
      updateAgeOnGet: true,
      updateAgeOnHas: false,
    })
  }

  get<T>(key: string): T | null {
    const t0 = Date.now()
    const value = this.cache.get(key)
    const t1 = Date.now()

    this.accessTimeSum += (t1 - t0)
    this.accessCount += 1

    if (value !== undefined) {
      this.hits += 1
      return value as T
    }
    this.misses += 1
    return null
  }

  set(key: string, value: any, options: CacheOptions = {}): boolean {
    const { ttl = 3600, tags = [] } = options

    // Track size change
    const prev = this.cache.get(key)
    if (prev !== undefined) {
      try {
        this.totalSizeBytes -= JSON.stringify(prev).length
      } catch {}
    }
    try {
      this.totalSizeBytes += JSON.stringify(value).length
    } catch {}

    // Maintain tag map
    if (tags.length > 0) {
      for (const tag of tags) {
        if (!this.tagMap.has(tag)) this.tagMap.set(tag, new Set())
        this.tagMap.get(tag)!.add(key)
      }
    }

    // Set with TTL (ms) capped at 1 hour
    const memoryTtl = Math.min(ttl * 1000, 1000 * 60 * 60)
    this.cache.set(key, value, { ttl: memoryTtl })
    return true
  }

  delete(key: string): boolean {
    const existing = this.cache.get(key)
    if (existing !== undefined) {
      try {
        this.totalSizeBytes -= JSON.stringify(existing).length
      } catch {}
    }
    const removed = this.cache.delete(key)
    // Remove from tag maps
    for (const [tag, keys] of this.tagMap.entries()) {
      if (keys.has(key)) {
        keys.delete(key)
        if (keys.size === 0) this.tagMap.delete(tag)
      }
    }
    return removed
  }

  clear(): boolean {
    this.cache.clear()
    this.tagMap.clear()
    this.totalSizeBytes = 0
    this.hits = 0
    this.misses = 0
    this.accessTimeSum = 0
    this.accessCount = 0
    return true
  }

  invalidateByTags(tags: string[]): number {
    let removed = 0
    for (const tag of tags) {
      const keys = this.tagMap.get(tag)
      if (keys) {
        for (const key of keys) {
          if (this.delete(key)) removed += 1
        }
        this.tagMap.delete(tag)
      }
    }
    return removed
  }

  getStats(): SimpleCacheStats {
    const requests = this.hits + this.misses
    const hitRate = requests > 0 ? this.hits / requests : 0
    const averageAccessTime = this.accessCount > 0 ? this.accessTimeSum / this.accessCount : 0
    return {
      totalEntries: this.cache.size,
      totalSize: this.totalSizeBytes,
      hitRate,
      averageAccessTime,
    }
  }
}

// Named simple caches used across the app
export const pptxCache = new SimpleLocalCache({ maxEntries: 1000, maxSizeBytes: 50 * 1024 * 1024 })
export const templateCache = new SimpleLocalCache({ maxEntries: 2000, maxSizeBytes: 50 * 1024 * 1024 })
export const renderCache = new SimpleLocalCache({ maxEntries: 2000, maxSizeBytes: 100 * 1024 * 1024 })