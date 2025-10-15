/**
 * 🔴 Redis Client Configuration
 * Cliente Redis para BullMQ e cache
 */

import { Redis } from 'ioredis'

let redisClient: Redis | null = null

/**
 * Obter instância do Redis (singleton)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null, // Necessário para BullMQ
      enableReadyCheck: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    redisClient.on('error', (error) => {
      console.error('Redis error:', error)
    })

    redisClient.on('connect', () => {
      console.log('✅ Redis connected')
    })
  }

  return redisClient
}

/**
 * Verificar conexão Redis
 */
export async function checkRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient()
    await client.ping()
    return true
  } catch (error) {
    console.error('Redis connection check failed:', error)
    return false
  }
}

/**
 * Fechar conexão Redis
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}
