
/**
 * 💾 REDIS CLIENT - Sprint 44
 * Cliente Redis para cache de TTS, thumbnails e compliance
 */

import { Redis } from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis

  if (!process.env.REDIS_URL) {
    console.warn('⚠️ REDIS_URL não configurado, cache desabilitado')
    return null
  }

  try {
    redis = new Redis(process.env.REDIS_URL, {
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      enableOfflineQueue: false
    })

    redis.on('connect', () => {
      console.log('✓ Redis conectado')
    })

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message)
    })

    return redis
  } catch (error) {
    console.error('Erro ao inicializar Redis:', error)
    return null
  }
}

/**
 * Cache helpers
 */
export class CacheService {
  /**
   * Cache de TTS
   */
  static async getTTS(
    provider: string,
    voiceId: string,
    text: string
  ): Promise<Buffer | null> {
    const client = getRedisClient()
    if (!client) return null

    const key = `tts:${provider}:${voiceId}:${Buffer.from(text).toString('base64').slice(0, 32)}`
    
    try {
      return await client.getBuffer(key)
    } catch (error) {
      console.error('Erro ao ler cache TTS:', error)
      return null
    }
  }

  static async setTTS(
    provider: string,
    voiceId: string,
    text: string,
    audio: Buffer,
    ttl: number = 3600
  ): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    const key = `tts:${provider}:${voiceId}:${Buffer.from(text).toString('base64').slice(0, 32)}`
    
    try {
      await client.setex(key, ttl, audio)
    } catch (error) {
      console.error('Erro ao salvar cache TTS:', error)
    }
  }

  /**
   * Cache de compliance results
   */
  static async getCompliance(projectId: string): Promise<any | null> {
    const client = getRedisClient()
    if (!client) return null

    const key = `compliance:${projectId}`
    
    try {
      const data = await client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Erro ao ler cache compliance:', error)
      return null
    }
  }

  static async setCompliance(
    projectId: string,
    data: any,
    ttl: number = 300
  ): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    const key = `compliance:${projectId}`
    
    try {
      await client.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar cache compliance:', error)
    }
  }

  /**
   * Invalidar cache
   */
  static async invalidate(pattern: string): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(...keys)
      }
    } catch (error) {
      console.error('Erro ao invalidar cache:', error)
    }
  }
}
