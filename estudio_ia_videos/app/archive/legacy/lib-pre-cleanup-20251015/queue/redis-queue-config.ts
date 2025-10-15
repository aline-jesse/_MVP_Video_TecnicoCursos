/**
 * 🔧 Redis Queue Configuration
 * Configurações específicas para o sistema de filas
 */

import Redis from 'ioredis';

let redisClient: Redis | null = null;
let isRedisAvailable = false;
let connectionAttempts = 0;

const REDIS_CONFIG = {
  maxRetries: 3,
  retryDelay: 100,
  maxConnectionAttempts: 5,
  connectionTimeout: 10000,
  commandTimeout: 5000
};

/**
 * Obtém conexão Redis para filas
 */
export function getQueueRedisConnection(): Redis {
  if (redisClient && isRedisAvailable) {
    return redisClient;
  }

  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL não configurada');
  }

  if (connectionAttempts >= REDIS_CONFIG.maxConnectionAttempts) {
    throw new Error('Número máximo de tentativas de conexão excedido');
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: REDIS_CONFIG.maxRetries,
      connectTimeout: REDIS_CONFIG.connectionTimeout,
      commandTimeout: REDIS_CONFIG.commandTimeout,
      retryStrategy: (times) => {
        connectionAttempts++;
        if (times > REDIS_CONFIG.maxRetries) {
          return null;
        }
        return Math.min(times * REDIS_CONFIG.retryDelay, 2000);
      },
      enableOfflineQueue: false
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Queue conectado');
      isRedisAvailable = true;
      connectionAttempts = 0;
    });

    redisClient.on('error', (error) => {
      console.error('❌ Erro na conexão Redis Queue:', error);
      isRedisAvailable = false;
    });

    redisClient.on('close', () => {
      console.warn('⚠️ Conexão Redis Queue fechada');
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Erro ao criar conexão Redis Queue:', error);
    throw error;
  }
}

/**
 * Verifica se Redis está disponível
 */
export async function isQueueRedisReady(): Promise<boolean> {
  try {
    const redis = getQueueRedisConnection();
    if (!redis || redis.status !== 'ready') {
      return false;
    }
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

/**
 * Força reconexão do Redis
 */
export async function reconnectQueueRedis(): Promise<boolean> {
  await closeQueueRedisConnection();
  connectionAttempts = 0;
  isRedisAvailable = false;
  
  try {
    const redis = getQueueRedisConnection();
    return await isQueueRedisReady();
  } catch {
    return false;
  }
}

/**
 * Fecha conexão Redis
 */
export async function closeQueueRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch (error) {
      console.error('❌ Erro ao fechar conexão Redis Queue:', error);
    } finally {
      redisClient = null;
      isRedisAvailable = false;
    }
  }
}

/**
 * Retorna status atual do Redis
 */
export function getQueueRedisStatus(): { 
  available: boolean; 
  attempts: number; 
  status: string;
} {
  return {
    available: isRedisAvailable,
    attempts: connectionAttempts,
    status: redisClient?.status || 'disconnected'
  };
}