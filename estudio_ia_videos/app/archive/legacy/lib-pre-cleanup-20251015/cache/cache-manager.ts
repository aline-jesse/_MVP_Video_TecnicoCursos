/**
 * Intelligent Cache System
 * 
 * Sistema de cache avançado com:
 * - Suporte a Redis e cache em memória
 * - TTL configurável
 * - Invalidação inteligente
 * - Compressão automática
 * - Estatísticas de uso
 */

import { Redis } from 'ioredis';
import { createHash } from 'crypto';
import { compress, decompress } from 'zlib';
import { promisify } from 'util';

const compressAsync = promisify(compress);
const decompressAsync = promisify(decompress);

// ==================== TYPES ====================

export interface CacheConfig {
  useRedis?: boolean;           // Usar Redis (padrão: false)
  redisUrl?: string;            // URL do Redis
  defaultTTL?: number;          // TTL padrão em segundos (padrão: 3600)
  maxMemoryItems?: number;      // Máximo de itens em memória (padrão: 1000)
  compressionThreshold?: number; // Tamanho mínimo para compressão em bytes (padrão: 1024)
  enableStats?: boolean;        // Habilitar estatísticas (padrão: true)
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  compressed: boolean;
  size: number;
  createdAt: number;
  expiresAt: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  totalSize: number;
  itemCount: number;
  compressionSavings: number;
}

export interface CacheOptions {
  ttl?: number;           // TTL específico em segundos
  compress?: boolean;     // Forçar compressão
  tags?: string[];        // Tags para invalidação em grupo
}

// ==================== CACHE MANAGER CLASS ====================

export class CacheManager {
  private config: Required<CacheConfig>;
  private redis?: Redis;
  private memoryCache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private tagIndex: Map<string, Set<string>>; // tag -> keys

  constructor(config?: CacheConfig) {
    this.config = {
      useRedis: config?.useRedis ?? false,
      redisUrl: config?.redisUrl ?? 'redis://localhost:6379',
      defaultTTL: config?.defaultTTL ?? 3600,
      maxMemoryItems: config?.maxMemoryItems ?? 1000,
      compressionThreshold: config?.compressionThreshold ?? 1024,
      enableStats: config?.enableStats ?? true
    };

    this.memoryCache = new Map();
    this.tagIndex = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      totalSize: 0,
      itemCount: 0,
      compressionSavings: 0
    };

    if (this.config.useRedis) {
      this.initializeRedis();
    }

    // Limpar cache expirado a cada minuto
    setInterval(() => this.cleanExpired(), 60000);
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Obtém valor do cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const cacheKey = this.generateKey(key);

    try {
      // Tentar Redis primeiro se habilitado
      if (this.redis) {
        const redisValue = await this.redis.get(cacheKey);
        if (redisValue) {
          this.incrementHits();
          return this.deserialize(redisValue);
        }
      }

      // Tentar memória
      const entry = this.memoryCache.get(cacheKey);
      if (entry) {
        if (this.isExpired(entry)) {
          await this.delete(key);
          this.incrementMisses();
          return null;
        }

        entry.hits++;
        entry.lastAccessed = Date.now();
        this.incrementHits();

        return entry.compressed 
          ? await this.decompressValue(entry.value)
          : entry.value;
      }

      this.incrementMisses();
      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      this.incrementMisses();
      return null;
    }
  }

  /**
   * Define valor no cache
   */
  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const cacheKey = this.generateKey(key);
    const ttl = options?.ttl ?? this.config.defaultTTL;
    const now = Date.now();

    try {
      // Serializar valor
      const serialized = this.serialize(value);
      const size = Buffer.byteLength(serialized);

      // Decidir se comprime
      const shouldCompress = options?.compress ?? (size >= this.config.compressionThreshold);
      const finalValue = shouldCompress 
        ? await this.compressValue(value)
        : value;

      // Salvar no Redis se habilitado
      if (this.redis) {
        await this.redis.setex(cacheKey, ttl, this.serialize(finalValue));
      }

      // Salvar em memória
      const entry: CacheEntry<T> = {
        key: cacheKey,
        value: finalValue,
        compressed: shouldCompress,
        size,
        createdAt: now,
        expiresAt: now + (ttl * 1000),
        hits: 0,
        lastAccessed: now
      };

      this.memoryCache.set(cacheKey, entry);

      // Gerenciar tags
      if (options?.tags) {
        this.indexTags(cacheKey, options.tags);
      }

      // Evitar overflow de memória
      this.evictIfNeeded();

      // Atualizar estatísticas
      this.incrementSets();
      this.updateStats();

    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  /**
   * Remove valor do cache
   */
  async delete(key: string): Promise<boolean> {
    const cacheKey = this.generateKey(key);

    try {
      let deleted = false;

      if (this.redis) {
        const result = await this.redis.del(cacheKey);
        deleted = result > 0;
      }

      if (this.memoryCache.has(cacheKey)) {
        this.memoryCache.delete(cacheKey);
        deleted = true;
      }

      if (deleted) {
        this.incrementDeletes();
        this.updateStats();
      }

      return deleted;

    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Verifica se chave existe
   */
  async has(key: string): Promise<boolean> {
    const cacheKey = this.generateKey(key);

    if (this.redis) {
      const exists = await this.redis.exists(cacheKey);
      if (exists) return true;
    }

    const entry = this.memoryCache.get(cacheKey);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Limpa cache por tags
   */
  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let deleted = 0;
    for (const key of keys) {
      const success = await this.delete(key);
      if (success) deleted++;
    }

    this.tagIndex.delete(tag);
    return deleted;
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    if (this.redis) {
      await this.redis.flushdb();
    }

    this.memoryCache.clear();
    this.tagIndex.clear();
    this.resetStats();
  }

  /**
   * Obtém ou define valor (cache-aside pattern)
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Fecha conexões
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  // ==================== PRIVATE METHODS ====================

  private initializeRedis(): void {
    try {
      this.redis = new Redis(this.config.redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3
      });

      this.redis.on('error', (err) => {
        console.error('Redis error:', err);
      });

      this.redis.on('connect', () => {
        console.log('Redis connected successfully');
      });

    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.config.useRedis = false;
    }
  }

  private generateKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  private serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  private deserialize<T>(value: string): T {
    return JSON.parse(value);
  }

  private async compressValue<T>(value: T): Promise<Buffer> {
    const serialized = this.serialize(value);
    return await compressAsync(Buffer.from(serialized));
  }

  private async decompressValue(compressed: Buffer): Promise<any> {
    const decompressed = await decompressAsync(compressed);
    return this.deserialize(decompressed.toString());
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private cleanExpired(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.memoryCache.delete(key));
  }

  private evictIfNeeded(): void {
    if (this.memoryCache.size <= this.config.maxMemoryItems) {
      return;
    }

    // LRU eviction: remover item menos recentemente acessado
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  private indexTags(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  private updateStats(): void {
    let totalSize = 0;
    let originalSize = 0;

    for (const entry of this.memoryCache.values()) {
      const entrySize = entry.compressed
        ? Buffer.byteLength(entry.value)
        : entry.size;
      
      totalSize += entrySize;
      originalSize += entry.size;
    }

    this.stats.totalSize = totalSize;
    this.stats.itemCount = this.memoryCache.size;
    this.stats.compressionSavings = originalSize - totalSize;
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
  }

  private incrementHits(): void {
    if (this.config.enableStats) {
      this.stats.hits++;
    }
  }

  private incrementMisses(): void {
    if (this.config.enableStats) {
      this.stats.misses++;
    }
  }

  private incrementSets(): void {
    if (this.config.enableStats) {
      this.stats.sets++;
    }
  }

  private incrementDeletes(): void {
    if (this.config.enableStats) {
      this.stats.deletes++;
    }
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      totalSize: 0,
      itemCount: 0,
      compressionSavings: 0
    };
  }
}

// ==================== SINGLETON INSTANCE ====================

let cacheInstance: CacheManager | null = null;

/**
 * Obtém instância singleton do cache
 */
export function getCache(config?: CacheConfig): CacheManager {
  if (!cacheInstance) {
    cacheInstance = new CacheManager(config);
  }
  return cacheInstance;
}

/**
 * Reseta instância singleton (útil para testes)
 */
export async function resetCache(): Promise<void> {
  if (cacheInstance) {
    await cacheInstance.close();
    cacheInstance = null;
  }
}

// ==================== DECORATORS ====================

/**
 * Decorator para cache de métodos
 */
export function Cacheable(options?: CacheOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = getCache();
      const key = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      return cache.getOrSet(
        key,
        () => originalMethod.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}

export default CacheManager;
