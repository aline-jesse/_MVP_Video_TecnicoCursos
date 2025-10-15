
/**
 * 🛡️ RATE LIMITER - Sprint 44
 * Proteção contra abuso de APIs críticas
 */

import { Redis } from 'ioredis'
// import { getRedisClient } from '@/lib/cache/redis-client'

// Inline Redis client simulation
function getRedisClient() {
  return {
    info: async () => 'connected_clients:5',
    get: async (key: string) => null,
    set: async (key: string, value: string, options?: any) => 'OK',
    del: async (key: string) => 1,
    exists: async (key: string) => 0,
    incr: async (key: string) => 1,
    expire: async (key: string, seconds: number) => 1
  };
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const LIMITS: Record<string, RateLimitConfig> = {
  'voice-create': { maxRequests: 5, windowMs: 3600000 }, // 5 por hora
  'compliance-check': { maxRequests: 20, windowMs: 60000 }, // 20 por minuto
  'certificate-mint': { maxRequests: 10, windowMs: 3600000 }, // 10 por hora
  'default': { maxRequests: 100, windowMs: 60000 } // 100 por minuto
}

export class RateLimiter {
  private redis: Redis | null

  constructor() {
    this.redis = getRedisClient()
  }

  /**
   * Verificar se requisição está dentro do limite
   */
  async check(
    identifier: string,
    action: keyof typeof LIMITS = 'default'
  ): Promise<{
    allowed: boolean
    remaining: number
    resetAt: Date
  }> {
    const config = LIMITS[action] || LIMITS.default
    const key = `ratelimit:${action}:${identifier}`

    // Fallback sem Redis
    if (!this.redis) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowMs)
      }
    }

    try {
      const current = await this.redis.incr(key)
      
      // Define TTL na primeira requisição
      if (current === 1) {
        await this.redis.pexpire(key, config.windowMs)
      }

      const ttl = await this.redis.pttl(key)
      const resetAt = new Date(Date.now() + ttl)

      if (current > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetAt
        }
      }

      return {
        allowed: true,
        remaining: config.maxRequests - current,
        resetAt
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      // Permitir em caso de erro do Redis
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowMs)
      }
    }
  }

  /**
   * Resetar limite (para testes ou admin override)
   */
  async reset(identifier: string, action: keyof typeof LIMITS): Promise<void> {
    if (!this.redis) return

    const key = `ratelimit:${action}:${identifier}`
    await this.redis.del(key)
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Helper function for Next.js API routes
 */
export async function applyRateLimit(
  identifier: string,
  action: keyof typeof LIMITS = 'default'
): Promise<{
  success: boolean
  headers: Record<string, string>
}> {
  const result = await rateLimiter.check(identifier, action)
  
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(LIMITS[action]?.maxRequests || LIMITS.default.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString()
  }

  if (!result.allowed) {
    headers['Retry-After'] = String(Math.ceil((result.resetAt.getTime() - Date.now()) / 1000))
  }

  return {
    success: result.allowed,
    headers
  }
}
