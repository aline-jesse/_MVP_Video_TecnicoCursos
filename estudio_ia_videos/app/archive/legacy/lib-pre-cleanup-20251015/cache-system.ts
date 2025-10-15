
/**
 * Sistema de Cache Inteligente
 * Implementa cache em memória e localStorage para otimização de performance
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  accessed: number
}

interface CacheOptions {
  ttl?: number // Time to live em milliseconds
  maxSize?: number
  persistent?: boolean // Se deve persistir no localStorage
}

class IntelligentCache {
  private memoryCache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutos
  private maxSize = 100
  private readonly storagePrefix = 'estudio_cache_'

  constructor() {
    // Limpar cache expirado na inicialização
    this.cleanExpiredItems()
    
    // Configurar limpeza periódica
    setInterval(() => this.cleanExpiredItems(), 60 * 1000) // A cada minuto
  }

  /**
   * Armazenar item no cache
   */
  set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): void {
    const { ttl = this.defaultTTL, persistent = false } = options
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessed: 0
    }

    // Cache em memória
    this.memoryCache.set(key, cacheItem)

    // Cache persistente se solicitado
    if (persistent && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          this.storagePrefix + key,
          JSON.stringify(cacheItem)
        )
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error)
      }
    }

    // Limitar tamanho do cache
    this.enforceMaxSize()
  }

  /**
   * Recuperar item do cache
   */
  get<T>(key: string): T | null {
    // Verificar cache em memória primeiro
    let cacheItem = this.memoryCache.get(key)

    // Se não estiver em memória, verificar localStorage
    if (!cacheItem && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storagePrefix + key)
        if (stored) {
          cacheItem = JSON.parse(stored)
          // Recarregar no cache em memória
          if (cacheItem) {
            this.memoryCache.set(key, cacheItem)
          }
        }
      } catch (error) {
        console.warn('Erro ao ler do localStorage:', error)
      }
    }

    if (!cacheItem) return null

    // Verificar se expirou
    if (this.isExpired(cacheItem)) {
      this.delete(key)
      return null
    }

    // Atualizar contador de acesso
    cacheItem.accessed++
    this.memoryCache.set(key, cacheItem)

    return cacheItem.data
  }

  /**
   * Verificar se item existe e está válido
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Remover item do cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storagePrefix + key)
    }
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.memoryCache.clear()
    
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  /**
   * Obter estatísticas do cache
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      maxSize: this.maxSize,
      items: Array.from(this.memoryCache.entries()).map(([key, item]) => ({
        key,
        size: JSON.stringify(item.data).length,
        age: Date.now() - item.timestamp,
        accessed: item.accessed,
        ttl: item.ttl
      }))
    }
  }

  /**
   * Cache com callback para dados não encontrados
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, options)
    return data
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private cleanExpiredItems(): void {
    const now = Date.now()
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.delete(key)
      }
    }
  }

  private enforceMaxSize(): void {
    if (this.memoryCache.size <= this.maxSize) return

    // Remover itens menos acessados
    const items = Array.from(this.memoryCache.entries())
      .sort(([,a], [,b]) => a.accessed - b.accessed)

    const toRemove = items.slice(0, items.length - this.maxSize)
    toRemove.forEach(([key]) => this.delete(key))
  }
}

// Instância global do cache
export const cache = new IntelligentCache()

// Cache específico para templates NR
export const nrTemplatesCache = {
  get: (nrType: string) => cache.get(`nr_template_${nrType}`),
  set: (nrType: string, template: any) => 
    cache.set(`nr_template_${nrType}`, template, { 
      ttl: 30 * 60 * 1000, // 30 minutos
      persistent: true 
    }),
  invalidate: (nrType: string) => cache.delete(`nr_template_${nrType}`)
}

// Cache para assets de vídeo
export const videoAssetsCache = {
  get: (assetId: string) => cache.get(`video_asset_${assetId}`),
  set: (assetId: string, asset: any) => 
    cache.set(`video_asset_${assetId}`, asset, { 
      ttl: 60 * 60 * 1000, // 1 hora
      persistent: false 
    }),
  clear: () => {
    const stats = cache.getStats()
    stats.items.forEach(item => {
      if (item.key.startsWith('video_asset_')) {
        cache.delete(item.key)
      }
    })
  }
}

// Cache para configurações do usuário
export const userPreferencesCache = {
  get: () => cache.get('user_preferences'),
  set: (preferences: any) => 
    cache.set('user_preferences', preferences, { 
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      persistent: true 
    }),
  update: (updates: Partial<any>) => {
    const current = userPreferencesCache.get() || {}
    const merged = { ...current, ...updates }
    userPreferencesCache.set(merged)
    return merged
  }
}
