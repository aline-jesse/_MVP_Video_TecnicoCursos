/**
 * 🗄️ Video Rendering Cache System
 * 
 * Sistema de cache inteligente para otimizar renderização de vídeos
 * - Cache de resultados de renderização
 * - Hash baseado em conteúdo e configurações
 * - Limpeza automática com LRU
 * - Validação de cache
 * - Estatísticas de uso
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// ==================== TYPES ====================

export interface CacheEntry {
  key: string;
  inputHash: string;
  settingsHash: string;
  outputPath: string;
  metadata: {
    duration: number;
    fileSize: number;
    resolution: string;
    format: string;
  };
  created: Date;
  lastAccessed: Date;
  accessCount: number;
  expiresAt?: Date;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageAccessTime: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

export interface CacheOptions {
  maxSize?: number;           // Tamanho máximo em bytes (padrão: 5GB)
  maxEntries?: number;        // Número máximo de entradas (padrão: 100)
  ttl?: number;              // Time to live em segundos (padrão: 7 dias)
  cacheDir?: string;         // Diretório de cache
  cleanupInterval?: number;  // Intervalo de limpeza em ms (padrão: 1 hora)
}

// ==================== CONSTANTS ====================

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  maxSize: 5 * 1024 * 1024 * 1024, // 5GB
  maxEntries: 100,
  ttl: 7 * 24 * 60 * 60, // 7 dias
  cacheDir: path.join(process.cwd(), 'tmp', 'video-cache'),
  cleanupInterval: 60 * 60 * 1000 // 1 hora
};

// ==================== RENDERING CACHE CLASS ====================

export class RenderingCache {
  private options: Required<CacheOptions>;
  private entries: Map<string, CacheEntry>;
  private hits: number = 0;
  private misses: number = 0;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options?: CacheOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.entries = new Map();
    this.initialize();
  }

  /**
   * Inicializa o cache
   */
  private async initialize(): Promise<void> {
    try {
      // Criar diretório de cache
      await fs.mkdir(this.options.cacheDir, { recursive: true });

      // Carregar entradas existentes
      await this.loadEntries();

      // Iniciar limpeza automática
      this.startCleanupSchedule();

      console.log(`✅ Cache inicializado: ${this.entries.size} entradas`);
    } catch (error) {
      console.error('❌ Erro ao inicializar cache:', error);
    }
  }

  /**
   * Carregar entradas do cache do disco
   */
  private async loadEntries(): Promise<void> {
    try {
      const metadataPath = path.join(this.options.cacheDir, 'metadata.json');
      const exists = await fs.access(metadataPath).then(() => true).catch(() => false);

      if (!exists) return;

      const data = await fs.readFile(metadataPath, 'utf-8');
      const entries = JSON.parse(data);

      for (const entry of entries) {
        // Converter strings para Date
        entry.created = new Date(entry.created);
        entry.lastAccessed = new Date(entry.lastAccessed);
        if (entry.expiresAt) {
          entry.expiresAt = new Date(entry.expiresAt);
        }

        // Verificar se arquivo ainda existe
        const fileExists = await fs.access(entry.outputPath).then(() => true).catch(() => false);
        if (fileExists) {
          this.entries.set(entry.key, entry);
        }
      }
    } catch (error) {
      console.error('⚠️ Erro ao carregar entradas do cache:', error);
    }
  }

  /**
   * Salvar entradas do cache no disco
   */
  private async saveEntries(): Promise<void> {
    try {
      const metadataPath = path.join(this.options.cacheDir, 'metadata.json');
      const entries = Array.from(this.entries.values());
      await fs.writeFile(metadataPath, JSON.stringify(entries, null, 2));
    } catch (error) {
      console.error('⚠️ Erro ao salvar entradas do cache:', error);
    }
  }

  /**
   * Gerar hash de um objeto
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
  }

  /**
   * Gerar hash de arquivo
   */
  private async hashFile(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(buffer as any).digest('hex').substring(0, 16);
  }

  /**
   * Gerar chave de cache
   */
  async generateCacheKey(inputPath: string, settings: any): Promise<{
    key: string;
    inputHash: string;
    settingsHash: string;
  }> {
    const inputHash = await this.hashFile(inputPath);
    const settingsHash = this.hashObject(settings);
    const key = `${inputHash}_${settingsHash}`;

    return { key, inputHash, settingsHash };
  }

  /**
   * Verificar se entrada existe e é válida
   */
  async get(key: string): Promise<CacheEntry | null> {
    const entry = this.entries.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Verificar se expirou
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      await this.delete(key);
      this.misses++;
      return null;
    }

    // Verificar se arquivo existe
    const fileExists = await fs.access(entry.outputPath).then(() => true).catch(() => false);
    if (!fileExists) {
      await this.delete(key);
      this.misses++;
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.lastAccessed = new Date();
    entry.accessCount++;
    this.hits++;

    await this.saveEntries();

    return entry;
  }

  /**
   * Adicionar entrada ao cache
   */
  async set(
    key: string,
    inputHash: string,
    settingsHash: string,
    outputPath: string,
    metadata: CacheEntry['metadata']
  ): Promise<void> {
    // Verificar limites antes de adicionar
    await this.enforceLimits();

    const entry: CacheEntry = {
      key,
      inputHash,
      settingsHash,
      outputPath,
      metadata,
      created: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      expiresAt: new Date(Date.now() + this.options.ttl * 1000)
    };

    this.entries.set(key, entry);
    await this.saveEntries();

    console.log(`✅ Cache salvo: ${key} (${(metadata.fileSize / 1024 / 1024).toFixed(2)}MB)`);
  }

  /**
   * Remover entrada do cache
   */
  async delete(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;

    try {
      // Remover arquivo
      await fs.unlink(entry.outputPath).catch(() => {});
      
      // Remover entrada
      this.entries.delete(key);
      await this.saveEntries();

      console.log(`🗑️ Cache removido: ${key}`);
    } catch (error) {
      console.error(`❌ Erro ao remover cache ${key}:`, error);
    }
  }

  /**
   * Limpar todo o cache
   */
  async clear(): Promise<void> {
    const keys = Array.from(this.entries.keys());
    
    for (const key of keys) {
      await this.delete(key);
    }

    console.log('🗑️ Cache totalmente limpo');
  }

  /**
   * Enforçar limites de tamanho e quantidade
   */
  private async enforceLimits(): Promise<void> {
    // Verificar número de entradas
    if (this.entries.size >= this.options.maxEntries) {
      await this.evictLRU(1);
    }

    // Verificar tamanho total
    const totalSize = await this.getTotalSize();
    if (totalSize >= this.options.maxSize) {
      // Remover 10% das entradas menos usadas
      const toRemove = Math.ceil(this.entries.size * 0.1);
      await this.evictLRU(toRemove);
    }
  }

  /**
   * Remover N entradas menos recentemente usadas (LRU)
   */
  private async evictLRU(count: number): Promise<void> {
    const entries = Array.from(this.entries.values());
    
    // Ordenar por último acesso (menos recente primeiro)
    entries.sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());

    // Remover as N primeiras
    const toRemove = entries.slice(0, count);
    
    for (const entry of toRemove) {
      await this.delete(entry.key);
    }

    console.log(`🗑️ ${count} entradas removidas por LRU`);
  }

  /**
   * Limpeza de entradas expiradas
   */
  async cleanup(): Promise<void> {
    const now = new Date();
    const keys = Array.from(this.entries.keys());
    let removed = 0;

    for (const key of keys) {
      const entry = this.entries.get(key);
      if (!entry) continue;

      // Remover se expirou
      if (entry.expiresAt && entry.expiresAt < now) {
        await this.delete(key);
        removed++;
        continue;
      }

      // Verificar se arquivo ainda existe
      const fileExists = await fs.access(entry.outputPath).then(() => true).catch(() => false);
      if (!fileExists) {
        await this.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Limpeza automática: ${removed} entradas removidas`);
    }
  }

  /**
   * Iniciar agendamento de limpeza
   */
  private startCleanupSchedule(): void {
    this.cleanupTimer = setInterval(
      () => this.cleanup(),
      this.options.cleanupInterval
    );
  }

  /**
   * Parar agendamento de limpeza
   */
  stopCleanupSchedule(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Obter tamanho total do cache
   */
  private async getTotalSize(): Promise<number> {
    const entries = Array.from(this.entries.values());
    return entries.reduce((sum, entry) => sum + entry.metadata.fileSize, 0);
  }

  /**
   * Obter estatísticas do cache
   */
  async getStats(): Promise<CacheStats> {
    const entries = Array.from(this.entries.values());
    const totalSize = await this.getTotalSize();
    const totalRequests = this.hits + this.misses;

    return {
      totalEntries: this.entries.size,
      totalSize,
      hitRate: totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.misses / totalRequests) * 100 : 0,
      averageAccessTime: 0, // TODO: Implementar tracking de tempo
      oldestEntry: entries.length > 0 
        ? new Date(Math.min(...entries.map(e => e.created.getTime())))
        : undefined,
      newestEntry: entries.length > 0
        ? new Date(Math.max(...entries.map(e => e.created.getTime())))
        : undefined
    };
  }

  /**
   * Obter informações formatadas do cache
   */
  async getInfo(): Promise<string> {
    const stats = await this.getStats();
    const totalSizeMB = (stats.totalSize / 1024 / 1024).toFixed(2);
    const maxSizeMB = (this.options.maxSize / 1024 / 1024).toFixed(2);

    return `
📊 Cache Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entries: ${stats.totalEntries} / ${this.options.maxEntries}
Size: ${totalSizeMB}MB / ${maxSizeMB}MB
Hit Rate: ${stats.hitRate.toFixed(2)}%
Miss Rate: ${stats.missRate.toFixed(2)}%
Oldest Entry: ${stats.oldestEntry?.toLocaleString() || 'N/A'}
Newest Entry: ${stats.newestEntry?.toLocaleString() || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  /**
   * Destruir cache (limpar e parar timers)
   */
  async destroy(): Promise<void> {
    this.stopCleanupSchedule();
    await this.saveEntries();
  }
}

// ==================== SINGLETON INSTANCE ====================

export const renderingCache = new RenderingCache();

export default RenderingCache;
