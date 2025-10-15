
/**
 * Configuração do Redis para BullMQ
 * Sprint 48 - FASE 2: Render Queue Real
 */

import { Redis } from 'ioredis';

let redisClient: Redis | null = null;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 3;
let isRedisAvailable = false;

export function getRedisConnection(): Redis {
  // Se está em modo mock explícito, usa mock sempre
  if (process.env.REDIS_MOCK_MODE === 'true') {
    console.log('[Redis] Modo mock ativado via REDIS_MOCK_MODE');
    return createMockRedis();
  }

  if (redisClient && redisClient.status === 'ready' && isRedisAvailable) {
    return redisClient;
  }

  // Se já tentou muito, falha completamente - sem fallback para mock
  if (connectionAttempts >= MAX_ATTEMPTS) {
    console.error('[Redis] Máximo de tentativas atingido - Redis é obrigatório');
    throw new Error('Redis connection failed after maximum attempts - no fallback available');
  }

  try {
    connectionAttempts++;

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[Redis] Desistindo após 3 tentativas');
          isRedisAvailable = false;
          return null;
        }
        const delay = Math.min(times * 1000, 3000);
        return delay;
      },
      connectTimeout: 5000,
      lazyConnect: true,
      enableReadyCheck: true,
      enableOfflineQueue: false
    });

    // Eventos
    redisClient.on('error', (err) => {
      console.error('[Redis] Erro:', err.message);
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ [Redis] Conectado');
      connectionAttempts = 0; // Reset no sucesso
      isRedisAvailable = true;
    });

    redisClient.on('ready', () => {
      console.log('✅ [Redis] Pronto');
      isRedisAvailable = true;
    });

    redisClient.on('close', () => {
      console.warn('⚠️ [Redis] Conexão fechada');
      isRedisAvailable = false;
    });

    // Tenta conectar
    redisClient.connect().catch((err) => {
      console.error('[Redis] Erro ao conectar:', err.message);
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    console.error('[Redis] Erro ao criar cliente:', error);
    isRedisAvailable = false;
    return createMockRedis();
  }
}

/**
 * Cria um cliente Redis mock mais robusto para BullMQ
 * Usado quando Redis não está disponível
 */
function createMockRedis(): Redis {
  const mockStorage = new Map<string, any>();
  const mockStreams = new Map<string, any[]>();
  const mockHashes = new Map<string, Map<string, any>>();
  const mockSets = new Map<string, Set<any>>();
  const mockZSets = new Map<string, Map<any, number>>();

  return {
    status: 'ready',
    
    // Basic operations
    get: async (key: string) => mockStorage.get(key) || null,
    set: async (key: string, value: any) => {
      mockStorage.set(key, value);
      return 'OK';
    },
    del: async (...keys: string[]) => {
      let deleted = 0;
      keys.forEach(key => {
        if (mockStorage.delete(key)) deleted++;
        mockStreams.delete(key);
        mockHashes.delete(key);
        mockSets.delete(key);
        mockZSets.delete(key);
      });
      return deleted;
    },
    keys: async (pattern: string) => {
      return Array.from(mockStorage.keys()).filter(key => 
        pattern === '*' || key.includes(pattern.replace('*', ''))
      );
    },
    ping: async () => 'PONG',
    
    // Event handlers
    on: () => {},
    once: () => {},
    emit: () => false,
    
    // Connection
    connect: async () => {},
    disconnect: async () => {},
    quit: async () => {},
    duplicate: () => createMockRedis(),
    
    // Stream operations (BullMQ)
    xadd: async (stream: string, id: string, ...args: any[]) => {
      if (!mockStreams.has(stream)) {
        mockStreams.set(stream, []);
      }
      const entry = { id: id === '*' ? `${Date.now()}-0` : id, data: args };
      mockStreams.get(stream)!.push(entry);
      return entry.id;
    },
    xread: async (...args: any[]) => {
      return [];
    },
    xdel: async (stream: string, ...ids: string[]) => {
      const streamData = mockStreams.get(stream);
      if (!streamData) return 0;
      let deleted = 0;
      ids.forEach(id => {
        const index = streamData.findIndex(entry => entry.id === id);
        if (index !== -1) {
          streamData.splice(index, 1);
          deleted++;
        }
      });
      return deleted;
    },
    xlen: async (stream: string) => {
      return mockStreams.get(stream)?.length || 0;
    },
    xrange: async (stream: string, start: string, end: string) => {
      return mockStreams.get(stream) || [];
    },
    
    // Hash operations
    hset: async (key: string, field: string, value: any) => {
      if (!mockHashes.has(key)) {
        mockHashes.set(key, new Map());
      }
      const hash = mockHashes.get(key)!;
      const isNew = !hash.has(field);
      hash.set(field, value);
      return isNew ? 1 : 0;
    },
    hget: async (key: string, field: string) => {
      return mockHashes.get(key)?.get(field) || null;
    },
    hgetall: async (key: string) => {
      const hash = mockHashes.get(key);
      if (!hash) return {};
      const result: any = {};
      hash.forEach((value, field) => {
        result[field] = value;
      });
      return result;
    },
    hdel: async (key: string, ...fields: string[]) => {
      const hash = mockHashes.get(key);
      if (!hash) return 0;
      let deleted = 0;
      fields.forEach(field => {
        if (hash.delete(field)) deleted++;
      });
      return deleted;
    },
    
    // Set operations
    sadd: async (key: string, ...members: any[]) => {
      if (!mockSets.has(key)) {
        mockSets.set(key, new Set());
      }
      const set = mockSets.get(key)!;
      let added = 0;
      members.forEach(member => {
        if (!set.has(member)) {
          set.add(member);
          added++;
        }
      });
      return added;
    },
    srem: async (key: string, ...members: any[]) => {
      const set = mockSets.get(key);
      if (!set) return 0;
      let removed = 0;
      members.forEach(member => {
        if (set.delete(member)) removed++;
      });
      return removed;
    },
    smembers: async (key: string) => {
      return Array.from(mockSets.get(key) || []);
    },
    
    // Sorted set operations
    zadd: async (key: string, score: number, member: any) => {
      if (!mockZSets.has(key)) {
        mockZSets.set(key, new Map());
      }
      const zset = mockZSets.get(key)!;
      const isNew = !zset.has(member);
      zset.set(member, score);
      return isNew ? 1 : 0;
    },
    zrem: async (key: string, ...members: any[]) => {
      const zset = mockZSets.get(key);
      if (!zset) return 0;
      let removed = 0;
      members.forEach(member => {
        if (zset.delete(member)) removed++;
      });
      return removed;
    },
    zrange: async (key: string, start: number, stop: number) => {
      const zset = mockZSets.get(key);
      if (!zset) return [];
      return Array.from(zset.keys()).slice(start, stop + 1);
    },
    zcard: async (key: string) => {
      return mockZSets.get(key)?.size || 0;
    },
    
    // Script operations
    eval: async (script: string, numKeys: number, ...args: any[]) => {
      // Mock implementation for BullMQ scripts
      return null;
    },
    evalsha: async (sha: string, numKeys: number, ...args: any[]) => {
      return null;
    },

    // Additional BullMQ methods
    multi: () => ({
      exec: async () => [],
      hset: () => {},
      zadd: () => {},
      del: () => {},
      xadd: () => {}
    }),
    pipeline: () => ({
      exec: async () => [],
      hset: () => {},
      zadd: () => {},
      del: () => {},
      xadd: () => {}
    })
  } as any;
}

/**
 * Fecha conexão Redis
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✅ [Redis] Conexão fechada');
    } catch (error) {
      console.error('[Redis] Erro ao fechar:', error);
    } finally {
      redisClient = null;
      connectionAttempts = 0;
      isRedisAvailable = false;
    }
  }
}

/**
 * Verifica se Redis está disponível
 */
export async function isRedisReady(): Promise<boolean> {
  try {
    const redis = getRedisConnection();
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
export async function reconnectRedis(): Promise<boolean> {
  await closeRedisConnection();
  connectionAttempts = 0;
  isRedisAvailable = false;
  
  try {
    const redis = getRedisConnection();
    return await isRedisReady();
  } catch {
    return false;
  }
}

/**
 * Retorna status atual do Redis
 */
export function getRedisStatus(): { available: boolean; attempts: number; status: string } {
  return {
    available: isRedisAvailable,
    attempts: connectionAttempts,
    status: redisClient?.status || 'disconnected'
  };
}
