/**
 * Sistema de Cache Inteligente com Redis
 * 
 * Features:
 * - Cache multi-layer (memória + Redis)
 * - Estratégias de invalidação
 * - TTL configurável
 * - Cache warming
 * - Statistics e monitoring
 * - Tag-based invalidation
 * 
 * @module CacheSystem
 */

import Redis from 'ioredis';
import { createHash } from 'crypto';
import { monitoringSystem } from './monitoring-system-real';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CacheOptions {
  ttl?: number; // Time to live em segundos
  tags?: string[]; // Tags para invalidação em grupo
  compress?: boolean; // Compressão de dados grandes
  staleWhileRevalidate?: boolean; // Retorna cache stale enquanto revalida
  namespace?: string; // Namespace para organização
}

export interface CacheEntry<T = any> {
  value: T;
  createdAt: number;
  expiresAt: number;
  tags?: string[];
  hits: number;
  size: number; // Tamanho em bytes
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  missRate: number;
  totalSize: number;
  entries: number;
  avgAccessTime: number;
}

export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'ttl';

// ============================================================================
// CACHE SYSTEM CLASS
// ============================================================================

export class CacheSystem {
  private static instance: CacheSystem;
  private redis: Redis;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private maxMemorySize: number = 100 * 1024 * 1024; // 100MB
  private currentMemorySize: number = 0;
  private strategy: CacheStrategy = 'lru';
  
  // Statistics
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    accessTimes: [] as number[]
  };

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableOfflineQueue: true,
      maxRetriesPerRequest: 3
    });

    this.setupListeners();
    this.startCleanupInterval();
  }

  public static getInstance(): CacheSystem {
    if (!CacheSystem.instance) {
      CacheSystem.instance = new CacheSystem();
    }
    return CacheSystem.instance;
  }

  // ============================================================================
  // CORE CACHE OPERATIONS
  // ============================================================================

  /**
   * Obtém valor do cache (multi-layer: memory -> redis)
   */
  public async get<T = any>(
    key: string,
    options?: { skipMemory?: boolean }
  ): Promise<T | null> {
    const start = Date.now();
    const fullKey = this.buildKey(key);

    try {
      // Layer 1: Memory cache
      if (!options?.skipMemory) {
        const memEntry = this.memoryCache.get(fullKey);
        if (memEntry && !this.isExpired(memEntry)) {
          memEntry.hits++;
          this.stats.hits++;
          monitoringSystem.trackCacheHit();
          this.trackAccessTime(Date.now() - start);
          return memEntry.value as T;
        }
      }

      // Layer 2: Redis cache
      const redisValue = await this.redis.get(fullKey);
      if (redisValue) {
        const entry: CacheEntry<T> = JSON.parse(redisValue);
        
        // Verifica expiração
        if (!this.isExpired(entry)) {
          // Promote para memory cache se houver espaço
          this.setMemoryCache(fullKey, entry);
          
          this.stats.hits++;
          monitoringSystem.trackCacheHit();
          this.trackAccessTime(Date.now() - start);
          return entry.value;
        } else {
          // Remove cache expirado
          await this.delete(key);
        }
      }

      // Cache miss
      this.stats.misses++;
      monitoringSystem.trackCacheMiss();
      this.trackAccessTime(Date.now() - start);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Define valor no cache (multi-layer)
   */
  public async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const fullKey = this.buildKey(key, options.namespace);
    const ttl = options.ttl || 3600; // Default 1 hora
    const now = Date.now();

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: now + (ttl * 1000),
      tags: options.tags,
      hits: 0,
      size: this.estimateSize(value)
    };

    try {
      // Layer 1: Memory cache
      this.setMemoryCache(fullKey, entry);

      // Layer 2: Redis cache
      const serialized = JSON.stringify(entry);
      await this.redis.setex(fullKey, ttl, serialized);

      // Indexa tags para invalidação em grupo
      if (options.tags && options.tags.length > 0) {
        await this.indexTags(fullKey, options.tags);
      }

      this.stats.sets++;
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  /**
   * Deleta valor do cache
   */
  public async delete(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);

    try {
      // Remove de memory cache
      this.deleteMemoryCache(fullKey);

      // Remove de Redis
      const deleted = await this.redis.del(fullKey);
      
      this.stats.deletes++;
      return deleted > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Verifica se chave existe
   */
  public async has(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    
    if (this.memoryCache.has(fullKey)) {
      const entry = this.memoryCache.get(fullKey)!;
      if (!this.isExpired(entry)) return true;
    }

    const exists = await this.redis.exists(fullKey);
    return exists === 1;
  }

  /**
   * Limpa todo o cache
   */
  public async clear(namespace?: string): Promise<void> {
    if (namespace) {
      // Limpa apenas o namespace específico
      const pattern = `cache:${namespace}:*`;
      await this.deleteByPattern(pattern);
      
      // Limpa memory cache do namespace
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(`cache:${namespace}:`)) {
          this.deleteMemoryCache(key);
        }
      }
    } else {
      // Limpa tudo
      this.memoryCache.clear();
      this.currentMemorySize = 0;
      
      await this.deleteByPattern('cache:*');
    }
  }

  // ============================================================================
  // ADVANCED OPERATIONS
  // ============================================================================

  /**
   * Get or Set pattern - retorna cache ou executa função
   */
  public async getOrSet<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Tenta obter do cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Se não existe, executa fetcher
    const value = await fetcher();
    
    // Salva no cache
    await this.set(key, value, options);
    
    return value;
  }

  /**
   * Invalidação por tags
   */
  public async invalidateByTag(tag: string): Promise<number> {
    try {
      const tagKey = `cache:tags:${tag}`;
      const keys = await this.redis.smembers(tagKey);
      
      if (keys.length === 0) return 0;

      // Deleta todas as chaves com essa tag
      const pipeline = this.redis.pipeline();
      for (const key of keys) {
        pipeline.del(key);
        this.deleteMemoryCache(key);
      }
      pipeline.del(tagKey); // Remove o set de tags também

      await pipeline.exec();
      
      return keys.length;
    } catch (error) {
      console.error('Tag invalidation error:', error);
      return 0;
    }
  }

  /**
   * Cache warming - pre-carrega cache
   */
  public async warm<T = any>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    const pipeline = this.redis.pipeline();

    for (const { key, value, options = {} } of entries) {
      const fullKey = this.buildKey(key, options.namespace);
      const ttl = options.ttl || 3600;
      const now = Date.now();

      const entry: CacheEntry<T> = {
        value,
        createdAt: now,
        expiresAt: now + (ttl * 1000),
        tags: options.tags,
        hits: 0,
        size: this.estimateSize(value)
      };

      const serialized = JSON.stringify(entry);
      pipeline.setex(fullKey, ttl, serialized);

      // Adiciona a memory cache se couber
      this.setMemoryCache(fullKey, entry);
    }

    await pipeline.exec();
  }

  /**
   * Incrementa valor numérico
   */
  public async increment(
    key: string,
    amount: number = 1,
    options: CacheOptions = {}
  ): Promise<number> {
    const fullKey = this.buildKey(key, options.namespace);
    const ttl = options.ttl || 3600;

    const result = await this.redis.incrby(fullKey, amount);
    await this.redis.expire(fullKey, ttl);

    return result;
  }

  /**
   * Decrementa valor numérico
   */
  public async decrement(
    key: string,
    amount: number = 1,
    options: CacheOptions = {}
  ): Promise<number> {
    return this.increment(key, -amount, options);
  }

  /**
   * Lista de valores (push)
   */
  public async listPush(
    key: string,
    value: any,
    options: CacheOptions & { prepend?: boolean } = {}
  ): Promise<number> {
    const fullKey = this.buildKey(key, options.namespace);
    const serialized = JSON.stringify(value);
    const ttl = options.ttl || 3600;

    const result = options.prepend
      ? await this.redis.lpush(fullKey, serialized)
      : await this.redis.rpush(fullKey, serialized);

    await this.redis.expire(fullKey, ttl);
    return result;
  }

  /**
   * Lista de valores (get range)
   */
  public async listRange<T = any>(
    key: string,
    start: number = 0,
    end: number = -1,
    namespace?: string
  ): Promise<T[]> {
    const fullKey = this.buildKey(key, namespace);
    const values = await this.redis.lrange(fullKey, start, end);
    
    return values.map(v => JSON.parse(v));
  }

  /**
   * Hash operations - set field
   */
  public async hashSet(
    key: string,
    field: string,
    value: any,
    options: CacheOptions = {}
  ): Promise<void> {
    const fullKey = this.buildKey(key, options.namespace);
    const serialized = JSON.stringify(value);
    const ttl = options.ttl || 3600;

    await this.redis.hset(fullKey, field, serialized);
    await this.redis.expire(fullKey, ttl);
  }

  /**
   * Hash operations - get field
   */
  public async hashGet<T = any>(
    key: string,
    field: string,
    namespace?: string
  ): Promise<T | null> {
    const fullKey = this.buildKey(key, namespace);
    const value = await this.redis.hget(fullKey, field);
    
    return value ? JSON.parse(value) : null;
  }

  /**
   * Hash operations - get all
   */
  public async hashGetAll<T = any>(
    key: string,
    namespace?: string
  ): Promise<Record<string, T>> {
    const fullKey = this.buildKey(key, namespace);
    const hash = await this.redis.hgetall(fullKey);
    
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(hash)) {
      result[field] = JSON.parse(value);
    }
    
    return result;
  }

  // ============================================================================
  // MEMORY CACHE MANAGEMENT
  // ============================================================================

  /**
   * Define no memory cache com verificação de espaço
   */
  private setMemoryCache(key: string, entry: CacheEntry): void {
    // Verifica se há espaço
    if (this.currentMemorySize + entry.size > this.maxMemorySize) {
      this.evictMemoryCache(entry.size);
    }

    // Remove entrada antiga se existir
    const oldEntry = this.memoryCache.get(key);
    if (oldEntry) {
      this.currentMemorySize -= oldEntry.size;
    }

    // Adiciona nova entrada
    this.memoryCache.set(key, entry);
    this.currentMemorySize += entry.size;
  }

  /**
   * Remove do memory cache
   */
  private deleteMemoryCache(key: string): void {
    const entry = this.memoryCache.get(key);
    if (entry) {
      this.currentMemorySize -= entry.size;
      this.memoryCache.delete(key);
      monitoringSystem.trackCacheEviction();
    }
  }

  /**
   * Eviction strategy - remove entradas para liberar espaço
   */
  private evictMemoryCache(neededSize: number): void {
    const entries = Array.from(this.memoryCache.entries());
    
    // Ordena por estratégia
    switch (this.strategy) {
      case 'lru': // Least Recently Used
        entries.sort((a, b) => a[1].hits - b[1].hits);
        break;
      case 'lfu': // Least Frequently Used
        entries.sort((a, b) => a[1].hits - b[1].hits);
        break;
      case 'fifo': // First In First Out
        entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
        break;
      case 'ttl': // Expira primeiro
        entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
        break;
    }

    // Remove até liberar espaço suficiente
    let freedSize = 0;
    for (const [key, entry] of entries) {
      this.deleteMemoryCache(key);
      freedSize += entry.size;
      
      if (freedSize >= neededSize) break;
    }
  }

  // ============================================================================
  // STATISTICS & MONITORING
  // ============================================================================

  /**
   * Obtém estatísticas do cache
   */
  public async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    const missRate = total > 0 ? (this.stats.misses / total) * 100 : 0;
    
    const avgAccessTime = this.stats.accessTimes.length > 0
      ? this.stats.accessTimes.reduce((a, b) => a + b, 0) / this.stats.accessTimes.length
      : 0;

    // Info do Redis
    const redisInfo = await this.redis.dbsize();

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      hitRate,
      missRate,
      totalSize: this.currentMemorySize,
      entries: this.memoryCache.size + redisInfo,
      avgAccessTime
    };
  }

  /**
   * Reseta estatísticas
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      accessTimes: []
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Constrói chave completa com namespace
   */
  private buildKey(key: string, namespace?: string): string {
    if (namespace) {
      return `cache:${namespace}:${key}`;
    }
    return `cache:${key}`;
  }

  /**
   * Verifica se entrada está expirada
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Estima tamanho de um objeto em bytes
   */
  private estimateSize(value: any): number {
    const str = JSON.stringify(value);
    return new Blob([str]).size;
  }

  /**
   * Indexa tags para invalidação
   */
  private async indexTags(key: string, tags: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const tag of tags) {
      const tagKey = `cache:tags:${tag}`;
      pipeline.sadd(tagKey, key);
      pipeline.expire(tagKey, 86400); // Tags expiram em 24h
    }

    await pipeline.exec();
  }

  /**
   * Deleta por padrão
   */
  private async deleteByPattern(pattern: string): Promise<void> {
    const stream = this.redis.scanStream({
      match: pattern,
      count: 100
    });

    const pipeline = this.redis.pipeline();
    let count = 0;

    stream.on('data', (keys: string[]) => {
      for (const key of keys) {
        pipeline.del(key);
        count++;
      }
    });

    await new Promise<void>((resolve, reject) => {
      stream.on('end', () => resolve());
      stream.on('error', reject);
    });

    if (count > 0) {
      await pipeline.exec();
    }
  }

  /**
   * Registra tempo de acesso
   */
  private trackAccessTime(time: number): void {
    this.stats.accessTimes.push(time);
    
    // Mantém apenas últimos 1000
    if (this.stats.accessTimes.length > 1000) {
      this.stats.accessTimes.shift();
    }
  }

  /**
   * Setup de listeners
   */
  private setupListeners(): void {
    this.redis.on('error', (error) => {
      console.error('Redis cache error:', error);
    });

    this.redis.on('reconnecting', () => {
      console.log('Redis cache reconnecting...');
    });
  }

  /**
   * Inicia limpeza automática de entradas expiradas
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now > entry.expiresAt) {
          this.deleteMemoryCache(key);
        }
      }
    }, 60000); // A cada 1 minuto
  }

  /**
   * Cleanup ao encerrar
   */
  public async cleanup(): Promise<void> {
    await this.redis.quit();
    this.memoryCache.clear();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cacheSystem = CacheSystem.getInstance();

// ============================================================================
// DECORATOR HELPER
// ============================================================================

/**
 * Decorator para cachear resultado de métodos
 */
export function Cacheable(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `method:${target.constructor.name}:${propertyKey}:${createHash('md5')
        .update(JSON.stringify(args))
        .digest('hex')}`;

      return cacheSystem.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}
