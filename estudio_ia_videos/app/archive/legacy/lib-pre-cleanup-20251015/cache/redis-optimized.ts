/**
 * 🚀 REDIS OPTIMIZED - PRODUCTION READY
 * Sistema Redis otimizado com retry automático, fallback e monitoring
 */

import Redis from 'ioredis'

// 📊 REDIS METRICS
interface RedisMetrics {
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
  connectionAttempts: number
  lastReconnect: number | null
  avgResponseTime: number
  slowQueries: number
}

// 💾 FALLBACK CACHE
class MemoryFallbackCache {
  private cache = new Map<string, { value: any; expires: number }>()
  private maxSize = 1000

  set(key: string, value: any, ttlSeconds: number): void {
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000)
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }
}

// 🎯 REDIS OPTIMIZED SERVICE
export class RedisOptimizedService {
  private static instance: RedisOptimizedService
  private redis: Redis | null = null
  private fallbackCache = new MemoryFallbackCache()
  private isEnabled = false
  private isConnected = false
  private connectionStartTime = 0
  private connectionAttempts = 0
  private lastReconnect: number | null = null
  private lastError: string | null = null

  // Metrics
  private hits = 0
  private misses = 0
  private responseTimes: number[] = []
  private slowQueries = 0

  private constructor() {
    this.initializeRedis()
    this.startHealthMonitoring()
  }

  static getInstance(): RedisOptimizedService {
    if (!RedisOptimizedService.instance) {
      RedisOptimizedService.instance = new RedisOptimizedService()
    }
    return RedisOptimizedService.instance
  }

  // 🔌 INITIALIZE REDIS
  private initializeRedis(): void {
    try {
      const redisUrl = process.env.REDIS_URL
      
      if (!redisUrl || process.env.REDIS_MOCK_MODE === 'true') {
        console.warn('⚠️ Redis not configured or in mock mode, using memory fallback')
        this.isEnabled = false
        return
      }

      this.redis = new Redis(redisUrl, {
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        lazyConnect: false,
        retryStrategy: (times) => {
          this.connectionAttempts++
          
          if (times > 5) {
            console.error(`❌ Redis connection failed after 5 attempts`)
            this.lastError = `Connection timeout after 5 retries`
            return null
          }
          
          const delay = Math.min(times * 1000, 10000)
          console.warn(`🔄 Redis retry attempt ${times}, delay: ${delay}ms`)
          return delay
        },
        reconnectOnError: (err) => {
          console.error('Redis reconnection error:', err.message)
          this.lastError = err.message
          return true
        }
      })

      this.setupEventListeners()
      
    } catch (error: any) {
      console.error('Redis initialization failed:', error.message)
      this.lastError = error.message
      this.isEnabled = false
    }
  }

  // 📡 SETUP EVENT LISTENERS
  private setupEventListeners(): void {
    if (!this.redis) return

    this.redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
      this.isEnabled = true
      this.isConnected = true
      this.connectionStartTime = Date.now()
      this.lastError = null
    })

    this.redis.on('ready', () => {
      console.log('✅ Redis ready to accept commands')
    })

    this.redis.on('error', (error) => {
      console.error('❌ Redis error:', error.message)
      this.lastError = error.message
      this.isConnected = false
    })

    this.redis.on('close', () => {
      console.warn('⚠️ Redis connection closed')
      this.isConnected = false
    })

    this.redis.on('reconnecting', () => {
      this.lastReconnect = Date.now()
      console.log('🔄 Redis reconnecting...')
    })

    this.redis.on('end', () => {
      console.warn('⚠️ Redis connection ended')
      this.isConnected = false
    })
  }

  // 🔍 GET WITH FALLBACK
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now()

    try {
      if (this.isEnabled && this.redis && this.isConnected) {
        const value = await this.redis.get(key)
        this.recordResponseTime(Date.now() - startTime)
        
        if (value) {
          this.hits++
          return JSON.parse(value) as T
        } else {
          this.misses++
          return null
        }
      }
    } catch (error: any) {
      console.error('Redis GET error:', error.message)
      this.lastError = error.message
    }

    // Fallback to memory cache
    const fallbackValue = this.fallbackCache.get(key)
    if (fallbackValue) {
      this.hits++
      return fallbackValue as T
    }

    this.misses++
    return null
  }

  // 💾 SET WITH FALLBACK
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    const startTime = Date.now()

    try {
      if (this.isEnabled && this.redis && this.isConnected) {
        const serialized = JSON.stringify(value)
        await this.redis.setex(key, ttlSeconds, serialized)
        this.recordResponseTime(Date.now() - startTime)
        
        // Also store in fallback cache
        this.fallbackCache.set(key, value, ttlSeconds)
        return true
      }
    } catch (error: any) {
      console.error('Redis SET error:', error.message)
      this.lastError = error.message
    }

    // Fallback to memory cache
    this.fallbackCache.set(key, value, ttlSeconds)
    return false
  }

  // 🗑️ DELETE WITH FALLBACK
  async delete(key: string): Promise<boolean> {
    try {
      if (this.isEnabled && this.redis && this.isConnected) {
        await this.redis.del(key)
      }
    } catch (error: any) {
      console.error('Redis DELETE error:', error.message)
      this.lastError = error.message
    }

    this.fallbackCache.delete(key)
    return true
  }

  // 🏥 HEALTH CHECK
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    if (!this.isEnabled || !this.redis || !this.isConnected) {
      return { 
        healthy: false, 
        error: this.lastError || 'Redis not connected' 
      }
    }

    try {
      const startTime = Date.now()
      const result = await this.redis.ping()
      const latency = Date.now() - startTime

      return {
        healthy: result === 'PONG',
        latency
      }
    } catch (error: any) {
      return {
        healthy: false,
        error: error.message
      }
    }
  }

  // 📊 GET COMPREHENSIVE STATS
  async getStats(): Promise<RedisMetrics> {
    const totalRequests = this.hits + this.misses
    const hitRate = totalRequests > 0 ? Math.round((this.hits / totalRequests) * 10000) / 100 : 0

    const baseStats: RedisMetrics = {
      enabled: this.isEnabled,
      connected: this.isConnected,
      keys: 0,
      memory: '0',
      hitRate,
      hits: this.hits,
      misses: this.misses,
      totalRequests,
      uptime: this.connectionStartTime ? Date.now() - this.connectionStartTime : 0,
      lastError: this.lastError,
      connectionAttempts: this.connectionAttempts,
      lastReconnect: this.lastReconnect,
      avgResponseTime: this.getAverageResponseTime(),
      slowQueries: this.slowQueries
    }

    if (!this.isEnabled || !this.redis || !this.isConnected) {
      return baseStats
    }

    try {
      const keys = await this.redis.dbsize()
      const info = await this.redis.info('memory')
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/)
      const memory = memoryMatch ? memoryMatch[1].trim() : '0'

      return {
        ...baseStats,
        keys,
        memory
      }
    } catch (error: any) {
      console.error('Redis STATS error:', error.message)
      this.lastError = error.message
      return baseStats
    }
  }

  // 📈 RECORD RESPONSE TIME
  private recordResponseTime(time: number): void {
    this.responseTimes.push(time)
    
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift()
    }

    if (time > 100) {
      this.slowQueries++
    }
  }

  // 📊 GET AVERAGE RESPONSE TIME
  private getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0
    
    const sum = this.responseTimes.reduce((a, b) => a + b, 0)
    return Math.round(sum / this.responseTimes.length)
  }

  // 🔄 START HEALTH MONITORING
  private startHealthMonitoring(): void {
    setInterval(async () => {
      if (this.isEnabled && this.redis && !this.isConnected) {
        console.warn('🔄 Redis health check: attempting reconnection')
        try {
          await this.redis.ping()
        } catch (error) {
          // Connection will be handled by retry strategy
        }
      }
    }, 30000) // Check every 30 seconds
  }
}

// 🚀 EXPORT SINGLETON
export const redisOptimized = RedisOptimizedService.getInstance()
export default redisOptimized