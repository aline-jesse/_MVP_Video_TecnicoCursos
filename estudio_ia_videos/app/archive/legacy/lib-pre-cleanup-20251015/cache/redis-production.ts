
/**
 * 🔄 Redis Production Service
 * Sprint 29 - Production-ready Redis with metrics, monitoring and security
 */

import Redis from 'ioredis'

export interface RedisStats {
  enabled: boolean
  connected: boolean
  keys: number
  memory: string
  hitRate: number
  hits: number
  misses: number
  totalRequests: number
  uptime: number
  lastError: string | null
}

class RedisProductionService {
  private static instance: RedisProductionService
  private redis: Redis | null = null
  private isEnabled: boolean = false
  private isConnected: boolean = false
  private hits: number = 0
  private misses: number = 0
  private lastError: string | null = null
  private connectionStartTime: number = Date.now()

  private constructor() {
    this.initializeRedis()
  }

  static getInstance(): RedisProductionService {
    if (!RedisProductionService.instance) {
      RedisProductionService.instance = new RedisProductionService()
    }
    return RedisProductionService.instance
  }

  /**
   * Initialize Redis with production settings
   */
  private initializeRedis(): void {
    try {
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING
      const redisPassword = process.env.REDIS_PASSWORD
      
      if (!redisUrl) {
        console.warn('⚠️ REDIS_URL not configured, using in-memory fallback')
        this.isEnabled = false
        return
      }

      // Production-ready configuration
      this.redis = new Redis(redisUrl, {
        password: redisPassword,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: true,
        connectTimeout: 10000,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('⚠️ Redis connection failed after 3 attempts')
            this.lastError = 'Connection timeout after 3 retries'
            return null
          }
          const delay = Math.min(times * 100, 2000)
          return delay
        },
        reconnectOnError: (err) => {
          console.error('Redis reconnection error:', err.message)
          return true
        }
      })

      this.redis.on('connect', () => {
        console.log('✅ Redis cache connected (production mode)')
        this.isEnabled = true
        this.isConnected = true
        this.connectionStartTime = Date.now()
        this.lastError = null
      })

      this.redis.on('ready', () => {
        console.log('✅ Redis ready to accept commands')
        this.isConnected = true
      })

      this.redis.on('error', (error) => {
        console.warn('⚠️ Redis error:', error.message)
        this.lastError = error.message
        this.isConnected = false
      })

      this.redis.on('close', () => {
        console.warn('⚠️ Redis connection closed')
        this.isConnected = false
      })

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...')
        this.isConnected = false
      })

    } catch (error: any) {
      console.warn('⚠️ Redis initialization failed:', error.message)
      this.isEnabled = false
      this.lastError = error.message
    }
  }

  /**
   * Get value from cache with hit/miss tracking
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redis || !this.isConnected) {
      this.misses++
      return null
    }

    try {
      const value = await this.redis.get(key)
      
      if (!value) {
        this.misses++
        return null
      }

      this.hits++
      return JSON.parse(value) as T
    } catch (error: any) {
      console.error('Redis GET error:', error)
      this.lastError = error.message
      this.misses++
      return null
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 604800): Promise<boolean> {
    if (!this.isEnabled || !this.redis || !this.isConnected) {
      return false
    }

    try {
      const serialized = JSON.stringify(value)
      await this.redis.setex(key, ttlSeconds, serialized)
      return true
    } catch (error: any) {
      console.error('Redis SET error:', error)
      this.lastError = error.message
      return false
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.redis || !this.isConnected) {
      return false
    }

    try {
      await this.redis.del(key)
      return true
    } catch (error: any) {
      console.error('Redis DELETE error:', error)
      this.lastError = error.message
      return false
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.redis || !this.isConnected) {
      return false
    }

    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error: any) {
      console.error('Redis EXISTS error:', error)
      this.lastError = error.message
      return false
    }
  }

  /**
   * Clear all cache (use with caution in production)
   */
  async clear(): Promise<boolean> {
    if (!this.isEnabled || !this.redis || !this.isConnected) {
      return false
    }

    try {
      await this.redis.flushdb()
      console.log('⚠️ Redis cache cleared')
      return true
    } catch (error: any) {
      console.error('Redis CLEAR error:', error)
      this.lastError = error.message
      return false
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  async getStats(): Promise<RedisStats> {
    const baseStats: RedisStats = {
      enabled: this.isEnabled,
      connected: this.isConnected,
      keys: 0,
      memory: '0',
      hitRate: 0,
      hits: this.hits,
      misses: this.misses,
      totalRequests: this.hits + this.misses,
      uptime: Date.now() - this.connectionStartTime,
      lastError: this.lastError
    }

    if (!this.isEnabled || !this.redis || !this.isConnected) {
      return baseStats
    }

    try {
      // Get database size
      const keys = await this.redis.dbsize()
      
      // Get memory info
      const info = await this.redis.info('memory')
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/)
      const memory = memoryMatch ? memoryMatch[1].trim() : '0'

      // Calculate hit rate
      const totalRequests = this.hits + this.misses
      const hitRate = totalRequests > 0 
        ? Math.round((this.hits / totalRequests) * 10000) / 100 
        : 0

      return {
        ...baseStats,
        keys,
        memory,
        hitRate
      }
    } catch (error: any) {
      console.error('Redis STATS error:', error)
      this.lastError = error.message
      return baseStats
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    if (!this.isEnabled || !this.redis) {
      return { 
        healthy: false, 
        latency: 0, 
        error: 'Redis not enabled' 
      }
    }

    try {
      const start = Date.now()
      await this.redis.ping()
      const latency = Date.now() - start

      return {
        healthy: true,
        latency
      }
    } catch (error: any) {
      return {
        healthy: false,
        latency: 0,
        error: error.message
      }
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0
    this.misses = 0
    this.lastError = null
    console.log('📊 Redis statistics reset')
  }
}

export const redisProduction = RedisProductionService.getInstance()
