import { MonitoringService } from '../monitoring/monitoring-service';
import { EventEmitter } from 'events';

// Interfaces para o sistema de cache
export interface CacheConfig {
  memory: {
    maxSize: number; // MB
    maxEntries: number;
    ttl: number; // segundos
  };
  redis: {
    enabled: boolean;
    host: string;
    port: number;
    password?: string;
    db: number;
    ttl: number;
  };
  file: {
    enabled: boolean;
    directory: string;
    maxSize: number; // MB
    ttl: number;
    compression: boolean;
  };
  strategies: {
    eviction: 'lru' | 'lfu' | 'fifo' | 'ttl';
    promotion: boolean;
    prefetch: boolean;
    compression: boolean;
  };
}

export interface CacheEntry {
  key: string;
  value: any;
  metadata: {
    createdAt: Date;
    lastAccessed: Date;
    accessCount: number;
    size: number;
    ttl: number;
    tags: string[];
    compressed: boolean;
  };
}

export interface CacheStats {
  memory: {
    hits: number;
    misses: number;
    hitRate: number;
    entries: number;
    size: number; // bytes
    maxSize: number;
  };
  redis: {
    hits: number;
    misses: number;
    hitRate: number;
    entries: number;
    connected: boolean;
  };
  file: {
    hits: number;
    misses: number;
    hitRate: number;
    entries: number;
    size: number; // bytes
    maxSize: number;
  };
  overall: {
    hits: number;
    misses: number;
    hitRate: number;
    totalEntries: number;
    avgResponseTime: number;
    throughput: number; // ops/sec
  };
}

export interface CacheOperation {
  type: 'get' | 'set' | 'delete' | 'clear';
  key: string;
  layer: 'memory' | 'redis' | 'file';
  timestamp: Date;
  duration: number;
  success: boolean;
  size?: number;
}

// Configuração padrão
const DEFAULT_CONFIG: CacheConfig = {
  memory: {
    maxSize: 256, // 256MB
    maxEntries: 10000,
    ttl: 3600 // 1 hora
  },
  redis: {
    enabled: true,
    host: 'localhost',
    port: 6379,
    db: 0,
    ttl: 86400 // 24 horas
  },
  file: {
    enabled: true,
    directory: './cache/files',
    maxSize: 1024, // 1GB
    ttl: 604800, // 7 dias
    compression: true
  },
  strategies: {
    eviction: 'lru',
    promotion: true,
    prefetch: false,
    compression: true
  }
};

export class IntelligentCacheSystem extends EventEmitter {
  private static instance: IntelligentCacheSystem;
  private config: CacheConfig;
  private monitoring: MonitoringService;
  
  // Cache de memória
  private memoryCache: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = []; // Para LRU
  private accessCount: Map<string, number> = new Map(); // Para LFU
  
  // Estatísticas
  private stats: CacheStats = {
    memory: { hits: 0, misses: 0, hitRate: 0, entries: 0, size: 0, maxSize: 0 },
    redis: { hits: 0, misses: 0, hitRate: 0, entries: 0, connected: false },
    file: { hits: 0, misses: 0, hitRate: 0, entries: 0, size: 0, maxSize: 0 },
    overall: { hits: 0, misses: 0, hitRate: 0, totalEntries: 0, avgResponseTime: 0, throughput: 0 }
  };
  
  // Operações recentes para métricas
  private recentOperations: CacheOperation[] = [];
  private operationTimes: number[] = [];

  private constructor(config: Partial<CacheConfig> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.monitoring = MonitoringService.getInstance();
    this.initializeCache();
    this.startMaintenanceLoop();
  }

  public static getInstance(config?: Partial<CacheConfig>): IntelligentCacheSystem {
    if (!IntelligentCacheSystem.instance) {
      IntelligentCacheSystem.instance = new IntelligentCacheSystem(config);
    }
    return IntelligentCacheSystem.instance;
  }

  // Método principal para buscar dados
  public async get(key: string, tags?: string[]): Promise<any> {
    const startTime = Date.now();
    
    try {
      // 1. Tentar cache de memória
      const memoryResult = await this.getFromMemory(key);
      if (memoryResult !== null) {
        this.recordOperation('get', key, 'memory', startTime, true);
        this.stats.memory.hits++;
        this.updateOverallStats();
        return memoryResult;
      }
      this.stats.memory.misses++;

      // 2. Tentar Redis
      if (this.config.redis.enabled) {
        const redisResult = await this.getFromRedis(key);
        if (redisResult !== null) {
          // Promover para cache de memória
          if (this.config.strategies.promotion) {
            await this.setToMemory(key, redisResult);
          }
          this.recordOperation('get', key, 'redis', startTime, true);
          this.stats.redis.hits++;
          this.updateOverallStats();
          return redisResult;
        }
        this.stats.redis.misses++;
      }

      // 3. Tentar cache de arquivo
      if (this.config.file.enabled) {
        const fileResult = await this.getFromFile(key);
        if (fileResult !== null) {
          // Promover para Redis e memória
          if (this.config.strategies.promotion) {
            if (this.config.redis.enabled) {
              await this.setToRedis(key, fileResult);
            }
            await this.setToMemory(key, fileResult);
          }
          this.recordOperation('get', key, 'file', startTime, true);
          this.stats.file.hits++;
          this.updateOverallStats();
          return fileResult;
        }
        this.stats.file.misses++;
      }

      // Cache miss em todas as camadas
      this.recordOperation('get', key, 'memory', startTime, false);
      this.updateOverallStats();
      return null;

    } catch (error) {
      this.recordOperation('get', key, 'memory', startTime, false);
      this.monitoring.logEvent('cache_get_error', { key, error: (error as Error).message });
      throw error;
    }
  }

  // Método principal para armazenar dados
  public async set(
    key: string, 
    value: any, 
    ttl?: number, 
    tags: string[] = []
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const finalTtl = ttl || this.config.memory.ttl;
      const entry: CacheEntry = {
        key,
        value,
        metadata: {
          createdAt: new Date(),
          lastAccessed: new Date(),
          accessCount: 0,
          size: this.calculateSize(value),
          ttl: finalTtl,
          tags,
          compressed: false
        }
      };

      // Comprimir se necessário
      if (this.config.strategies.compression && entry.metadata.size > 1024) {
        entry.value = await this.compress(value);
        entry.metadata.compressed = true;
      }

      // Armazenar em todas as camadas
      await this.setToMemory(key, entry);
      
      if (this.config.redis.enabled) {
        await this.setToRedis(key, entry, this.config.redis.ttl);
      }
      
      if (this.config.file.enabled) {
        await this.setToFile(key, entry, this.config.file.ttl);
      }

      this.recordOperation('set', key, 'memory', startTime, true, entry.metadata.size);
      this.updateStats();
      
      this.emit('cacheSet', { key, size: entry.metadata.size, tags });

    } catch (error) {
      this.recordOperation('set', key, 'memory', startTime, false);
      this.monitoring.logEvent('cache_set_error', { key, error: (error as Error).message });
      throw error;
    }
  }

  // Deletar entrada do cache
  public async delete(key: string): Promise<boolean> {
    const startTime = Date.now();
    let deleted = false;
    
    try {
      // Deletar de todas as camadas
      if (this.memoryCache.has(key)) {
        this.memoryCache.delete(key);
        this.removeFromAccessOrder(key);
        this.accessCount.delete(key);
        deleted = true;
      }

      if (this.config.redis.enabled) {
        await this.deleteFromRedis(key);
      }

      if (this.config.file.enabled) {
        await this.deleteFromFile(key);
      }

      this.recordOperation('delete', key, 'memory', startTime, deleted);
      this.updateStats();
      
      if (deleted) {
        this.emit('cacheDelete', { key });
      }

      return deleted;

    } catch (error) {
      this.recordOperation('delete', key, 'memory', startTime, false);
      this.monitoring.logEvent('cache_delete_error', { key, error: (error as Error).message });
      throw error;
    }
  }

  // Limpar cache por tags
  public async deleteByTags(tags: string[]): Promise<number> {
    let deletedCount = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      const hasTag = tags.some(tag => entry.metadata.tags.includes(tag));
      if (hasTag) {
        await this.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Limpar todo o cache
  public async clear(): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.memoryCache.clear();
      this.accessOrder = [];
      this.accessCount.clear();

      if (this.config.redis.enabled) {
        await this.clearRedis();
      }

      if (this.config.file.enabled) {
        await this.clearFiles();
      }

      this.recordOperation('clear', 'all', 'memory', startTime, true);
      this.resetStats();
      
      this.emit('cacheClear');

    } catch (error) {
      this.recordOperation('clear', 'all', 'memory', startTime, false);
      this.monitoring.logEvent('cache_clear_error', { error: (error as Error).message });
      throw error;
    }
  }

  // Obter estatísticas
  public getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  // Obter configuração
  public getConfig(): CacheConfig {
    return { ...this.config };
  }

  // Atualizar configuração
  public updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = this.mergeConfig(newConfig);
    this.emit('configUpdated', this.config);
  }

  // Métodos privados para cache de memória
  private async getFromMemory(key: string): Promise<any> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // Verificar TTL
    const now = new Date();
    const age = (now.getTime() - entry.metadata.createdAt.getTime()) / 1000;
    if (age > entry.metadata.ttl) {
      this.memoryCache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.metadata.lastAccessed = now;
    entry.metadata.accessCount++;
    this.updateAccessOrder(key);

    // Descomprimir se necessário
    if (entry.metadata.compressed) {
      return await this.decompress(entry.value);
    }

    return entry.value;
  }

  private async setToMemory(key: string, entry: CacheEntry | any): Promise<void> {
    // Se não é uma CacheEntry, criar uma
    if (!entry.metadata) {
      entry = {
        key,
        value: entry,
        metadata: {
          createdAt: new Date(),
          lastAccessed: new Date(),
          accessCount: 0,
          size: this.calculateSize(entry),
          ttl: this.config.memory.ttl,
          tags: [],
          compressed: false
        }
      };
    }

    // Verificar limites de memória
    await this.ensureMemorySpace(entry.metadata.size);

    this.memoryCache.set(key, entry);
    this.updateAccessOrder(key);
  }

  // Métodos simulados para Redis
  private async getFromRedis(key: string): Promise<any> {
    // Simular latência do Redis
    await this.delay(5);
    return null; // Implementação simulada
  }

  private async setToRedis(key: string, value: any, ttl?: number): Promise<void> {
    await this.delay(5);
    // Implementação simulada
  }

  private async deleteFromRedis(key: string): Promise<void> {
    await this.delay(5);
    // Implementação simulada
  }

  private async clearRedis(): Promise<void> {
    await this.delay(10);
    // Implementação simulada
  }

  // Métodos simulados para cache de arquivo
  private async getFromFile(key: string): Promise<any> {
    await this.delay(20);
    return null; // Implementação simulada
  }

  private async setToFile(key: string, value: any, ttl?: number): Promise<void> {
    await this.delay(20);
    // Implementação simulada
  }

  private async deleteFromFile(key: string): Promise<void> {
    await this.delay(20);
    // Implementação simulada
  }

  private async clearFiles(): Promise<void> {
    await this.delay(50);
    // Implementação simulada
  }

  // Gerenciamento de espaço em memória
  private async ensureMemorySpace(requiredSize: number): Promise<void> {
    const currentSize = this.getCurrentMemorySize();
    const maxSize = this.config.memory.maxSize * 1024 * 1024; // MB para bytes

    if (currentSize + requiredSize > maxSize || this.memoryCache.size >= this.config.memory.maxEntries) {
      await this.evictEntries(requiredSize);
    }
  }

  private async evictEntries(requiredSize: number): Promise<void> {
    const strategy = this.config.strategies.eviction;
    let freedSize = 0;

    switch (strategy) {
      case 'lru':
        // Remover menos recentemente usados
        while (freedSize < requiredSize && this.accessOrder.length > 0) {
          const oldestKey = this.accessOrder[0];
          const entry = this.memoryCache.get(oldestKey);
          if (entry) {
            freedSize += entry.metadata.size;
            await this.delete(oldestKey);
          } else {
            this.accessOrder.shift();
          }
        }
        break;

      case 'lfu':
        // Remover menos frequentemente usados
        const sortedByFrequency = Array.from(this.memoryCache.entries())
          .sort((a, b) => a[1].metadata.accessCount - b[1].metadata.accessCount);
        
        for (const [key, entry] of sortedByFrequency) {
          if (freedSize >= requiredSize) break;
          freedSize += entry.metadata.size;
          await this.delete(key);
        }
        break;

      case 'fifo':
        // Remover primeiro a entrar
        const sortedByAge = Array.from(this.memoryCache.entries())
          .sort((a, b) => a[1].metadata.createdAt.getTime() - b[1].metadata.createdAt.getTime());
        
        for (const [key, entry] of sortedByAge) {
          if (freedSize >= requiredSize) break;
          freedSize += entry.metadata.size;
          await this.delete(key);
        }
        break;

      case 'ttl':
        // Remover por TTL (mais próximos de expirar)
        const now = new Date();
        const sortedByTTL = Array.from(this.memoryCache.entries())
          .map(([key, entry]) => ({
            key,
            entry,
            timeToExpire: entry.metadata.ttl - ((now.getTime() - entry.metadata.createdAt.getTime()) / 1000)
          }))
          .sort((a, b) => a.timeToExpire - b.timeToExpire);
        
        for (const { key, entry } of sortedByTTL) {
          if (freedSize >= requiredSize) break;
          freedSize += entry.metadata.size;
          await this.delete(key);
        }
        break;
    }
  }

  // Métodos auxiliares
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private calculateSize(value: any): number {
    return JSON.stringify(value).length * 2; // Estimativa em bytes
  }

  private getCurrentMemorySize(): number {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.metadata.size;
    }
    return totalSize;
  }

  private async compress(value: any): Promise<string> {
    // Simulação de compressão
    await this.delay(1);
    return JSON.stringify(value);
  }

  private async decompress(value: string): Promise<any> {
    // Simulação de descompressão
    await this.delay(1);
    return JSON.parse(value);
  }

  private recordOperation(
    type: CacheOperation['type'],
    key: string,
    layer: CacheOperation['layer'],
    startTime: number,
    success: boolean,
    size?: number
  ): void {
    const operation: CacheOperation = {
      type,
      key,
      layer,
      timestamp: new Date(),
      duration: Date.now() - startTime,
      success,
      size
    };

    this.recentOperations.push(operation);
    this.operationTimes.push(operation.duration);

    // Manter apenas as últimas 1000 operações
    if (this.recentOperations.length > 1000) {
      this.recentOperations.shift();
      this.operationTimes.shift();
    }
  }

  private updateStats(): void {
    // Atualizar estatísticas de memória
    this.stats.memory.entries = this.memoryCache.size;
    this.stats.memory.size = this.getCurrentMemorySize();
    this.stats.memory.maxSize = this.config.memory.maxSize * 1024 * 1024;
    this.stats.memory.hitRate = this.calculateHitRate(this.stats.memory.hits, this.stats.memory.misses);

    // Atualizar estatísticas do Redis
    this.stats.redis.hitRate = this.calculateHitRate(this.stats.redis.hits, this.stats.redis.misses);

    // Atualizar estatísticas de arquivo
    this.stats.file.hitRate = this.calculateHitRate(this.stats.file.hits, this.stats.file.misses);

    this.updateOverallStats();
  }

  private updateOverallStats(): void {
    this.stats.overall.hits = this.stats.memory.hits + this.stats.redis.hits + this.stats.file.hits;
    this.stats.overall.misses = this.stats.memory.misses + this.stats.redis.misses + this.stats.file.misses;
    this.stats.overall.hitRate = this.calculateHitRate(this.stats.overall.hits, this.stats.overall.misses);
    this.stats.overall.totalEntries = this.stats.memory.entries + this.stats.redis.entries + this.stats.file.entries;
    
    // Calcular tempo médio de resposta
    if (this.operationTimes.length > 0) {
      this.stats.overall.avgResponseTime = this.operationTimes.reduce((a, b) => a + b, 0) / this.operationTimes.length;
    }

    // Calcular throughput (operações por segundo)
    const recentOps = this.recentOperations.filter(op => 
      Date.now() - op.timestamp.getTime() < 60000 // Últimos 60 segundos
    );
    this.stats.overall.throughput = recentOps.length;
  }

  private calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? hits / total : 0;
  }

  private resetStats(): void {
    this.stats = {
      memory: { hits: 0, misses: 0, hitRate: 0, entries: 0, size: 0, maxSize: this.config.memory.maxSize * 1024 * 1024 },
      redis: { hits: 0, misses: 0, hitRate: 0, entries: 0, connected: false },
      file: { hits: 0, misses: 0, hitRate: 0, entries: 0, size: 0, maxSize: this.config.file.maxSize * 1024 * 1024 },
      overall: { hits: 0, misses: 0, hitRate: 0, totalEntries: 0, avgResponseTime: 0, throughput: 0 }
    };
  }

  private mergeConfig(config: Partial<CacheConfig>): CacheConfig {
    return {
      memory: { ...DEFAULT_CONFIG.memory, ...config.memory },
      redis: { ...DEFAULT_CONFIG.redis, ...config.redis },
      file: { ...DEFAULT_CONFIG.file, ...config.file },
      strategies: { ...DEFAULT_CONFIG.strategies, ...config.strategies }
    };
  }

  private initializeCache(): void {
    this.stats.memory.maxSize = this.config.memory.maxSize * 1024 * 1024;
    this.stats.file.maxSize = this.config.file.maxSize * 1024 * 1024;
    
    // Simular conexão com Redis
    this.stats.redis.connected = this.config.redis.enabled;
  }

  private startMaintenanceLoop(): void {
    // Executar limpeza a cada 5 minutos
    setInterval(() => {
      this.performMaintenance();
    }, 5 * 60 * 1000);
  }

  private async performMaintenance(): Promise<void> {
    try {
      // Limpar entradas expiradas
      const now = new Date();
      const expiredKeys: string[] = [];

      for (const [key, entry] of this.memoryCache.entries()) {
        const age = (now.getTime() - entry.metadata.createdAt.getTime()) / 1000;
        if (age > entry.metadata.ttl) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        await this.delete(key);
      }

      this.emit('maintenanceCompleted', { expiredKeys: expiredKeys.length });

    } catch (error) {
      this.monitoring.logEvent('cache_maintenance_error', { error: (error as Error).message });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}