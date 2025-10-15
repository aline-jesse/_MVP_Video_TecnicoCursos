

/**
 * 🔄 Redis Cache Service
 * Cache para TTS, renderização e outros serviços
 */

import Redis from 'ioredis';

class RedisCacheService {
  private static instance: RedisCacheService;
  private redis: Redis | null = null;
  private isEnabled: boolean = false;

  private constructor() {
    this.initializeRedis();
  }

  static getInstance(): RedisCacheService {
    if (!RedisCacheService.instance) {
      RedisCacheService.instance = new RedisCacheService();
    }
    return RedisCacheService.instance;
  }

  private initializeRedis(): void {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('⚠️ Redis connection failed after 3 attempts');
            return null;
          }
          return Math.min(times * 100, 2000);
        }
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis cache connected');
        this.isEnabled = true;
      });

      this.redis.on('error', (error) => {
        console.warn('⚠️ Redis error:', error.message);
        this.isEnabled = false;
      });

    } catch (error) {
      console.warn('⚠️ Redis not available, using in-memory fallback');
      this.isEnabled = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 604800): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Redis CLEAR error:', error);
      return false;
    }
  }

  /**
   * Get cache stats
   */
  async getStats(): Promise<{ enabled: boolean; keys: number; memory: string }> {
    if (!this.isEnabled || !this.redis) {
      return { enabled: false, keys: 0, memory: '0' };
    }

    try {
      const keys = await this.redis.dbsize();
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : '0';

      return {
        enabled: true,
        keys,
        memory
      };
    } catch (error) {
      console.error('Redis STATS error:', error);
      return { enabled: false, keys: 0, memory: '0' };
    }
  }
}

export const redisCache = RedisCacheService.getInstance();
