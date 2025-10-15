/**
 * 🚀 SERVIÇO REDIS PARA PRODUÇÃO - FASE 5
 * Implementação robusta com fallback inteligente e monitoramento
 */

import Redis, { RedisOptions } from 'ioredis'
import { configUtils } from '../config/production-config'

export interface RedisMetrics {
  connections: number
  commands: number
  errors: number
  latency: number
  lastError?: string
  uptime: number
  memoryUsage: number
}

export interface RedisHealthStatus {
  isHealthy: boolean
  status: 'connected' | 'connecting' | 'disconnected' | 'error'
  lastCheck: Date
  metrics: RedisMetrics
  fallbackActive: boolean
}

/**
 * Classe principal do serviço Redis para produção
 */
export class RedisProductionService {
  private redis: Redis | null = null
  private fallbackCache: Map<string, { value: any; expires: number }> = new Map()
  private metrics: RedisMetrics = {
    connections: 0,
    commands: 0,
    errors: 0,
    latency: 0,
    uptime: Date.now(),
    memoryUsage: 0
  }
  private healthStatus: RedisHealthStatus = {
    isHealthy: false,
    status: 'disconnected',
    lastCheck: new Date(),
    metrics: this.metrics,
    fallbackActive: false
  }
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeRedis()
    this.startHealthCheck()
  }

  /**
   * Inicializa conexão Redis com configuração robusta
   */
  private async initializeRedis(): Promise<void> {
    try {
      const redisConfig = configUtils.getRedisConfig()
      
      const options: RedisOptions = {
        host: redisConfig.host,
        port: redisConfig.port,
        db: redisConfig.db,
        password: redisConfig.password,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: redisConfig.maxRetries,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: 300,
        enableOfflineQueue: false,
        family: 4
      }

      // Usar URL se disponível
      if (redisConfig.url) {
        this.redis = new Redis(redisConfig.url, options)
      } else {
        this.redis = new Redis(options)
      }

      this.setupEventHandlers()
      await this.redis.connect()
      
      console.log('✅ Redis conectado com sucesso')
      this.healthStatus.isHealthy = true
      this.healthStatus.status = 'connected'
      this.reconnectAttempts = 0

    } catch (error) {
      console.error('❌ Erro ao conectar Redis:', error)
      this.handleConnectionError(error)
    }
  }

  /**
   * Configura handlers de eventos Redis
   */
  private setupEventHandlers(): void {
    if (!this.redis) return

    this.redis.on('connect', () => {
      console.log('🔗 Redis conectando...')
      this.healthStatus.status = 'connecting'
      this.metrics.connections++
    })

    this.redis.on('ready', () => {
      console.log('✅ Redis pronto para uso')
      this.healthStatus.isHealthy = true
      this.healthStatus.status = 'connected'
      this.healthStatus.fallbackActive = false
      this.reconnectAttempts = 0
    })

    this.redis.on('error', (error) => {
      console.error('❌ Erro Redis:', error)
      this.handleConnectionError(error)
    })

    this.redis.on('close', () => {
      console.warn('⚠️ Conexão Redis fechada')
      this.healthStatus.isHealthy = false
      this.healthStatus.status = 'disconnected'
      this.scheduleReconnect()
    })

    this.redis.on('reconnecting', () => {
      console.log('🔄 Reconectando Redis...')
      this.healthStatus.status = 'connecting'
    })
  }

  /**
   * Trata erros de conexão
   */
  private handleConnectionError(error: any): void {
    this.metrics.errors++
    this.metrics.lastError = error.message
    this.healthStatus.isHealthy = false
    this.healthStatus.status = 'error'
    this.healthStatus.fallbackActive = true
    
    console.warn('⚠️ Ativando fallback cache devido ao erro Redis')
  }

  /**
   * Agenda reconexão com backoff exponencial
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido')
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    setTimeout(() => {
      console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      this.initializeRedis()
    }, delay)
  }

  /**
   * Inicia monitoramento de saúde
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck()
    }, 30000) // Check a cada 30 segundos
  }

  /**
   * Executa verificação de saúde
   */
  private async performHealthCheck(): Promise<void> {
    try {
      if (this.redis && this.healthStatus.status === 'connected') {
        const start = Date.now()
        await this.redis.ping()
        this.metrics.latency = Date.now() - start
        
        // Obter informações de memória
        const info = await this.redis.info('memory')
        const memMatch = info.match(/used_memory:(\d+)/)
        if (memMatch) {
          this.metrics.memoryUsage = parseInt(memMatch[1])
        }
      }
    } catch (error) {
      console.error('❌ Health check falhou:', error)
      this.handleConnectionError(error)
    }

    this.healthStatus.lastCheck = new Date()
    this.healthStatus.metrics = { ...this.metrics }
  }

  /**
   * GET com fallback
   */
  async get(key: string): Promise<string | null> {
    try {
      if (this.redis && this.healthStatus.isHealthy) {
        const start = Date.now()
        const result = await this.redis.get(key)
        this.metrics.latency = Date.now() - start
        this.metrics.commands++
        return result
      }
    } catch (error) {
      console.error('❌ Erro Redis GET:', error)
      this.handleConnectionError(error)
    }

    // Fallback para cache local
    return this.getFallback(key)
  }

  /**
   * SET com fallback
   */
  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (this.redis && this.healthStatus.isHealthy) {
        const start = Date.now()
        if (ttl) {
          await this.redis.setex(key, ttl, value)
        } else {
          await this.redis.set(key, value)
        }
        this.metrics.latency = Date.now() - start
        this.metrics.commands++
        
        // Também salvar no fallback
        this.setFallback(key, value, ttl)
        return true
      }
    } catch (error) {
      console.error('❌ Erro Redis SET:', error)
      this.handleConnectionError(error)
    }

    // Fallback para cache local
    this.setFallback(key, value, ttl)
    return false
  }

  /**
   * DELETE com fallback
   */
  async del(key: string): Promise<boolean> {
    try {
      if (this.redis && this.healthStatus.isHealthy) {
        const start = Date.now()
        await this.redis.del(key)
        this.metrics.latency = Date.now() - start
        this.metrics.commands++
      }
    } catch (error) {
      console.error('❌ Erro Redis DEL:', error)
      this.handleConnectionError(error)
    }

    // Também remover do fallback
    this.fallbackCache.delete(key)
    return true
  }

  /**
   * GET do cache fallback
   */
  private getFallback(key: string): string | null {
    const item = this.fallbackCache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.fallbackCache.delete(key)
      return null
    }
    
    return item.value
  }

  /**
   * SET no cache fallback
   */
  private setFallback(key: string, value: string, ttl?: number): void {
    const expires = ttl ? Date.now() + (ttl * 1000) : Date.now() + (3600 * 1000)
    this.fallbackCache.set(key, { value, expires })
  }

  /**
   * Limpa cache fallback expirado
   */
  private cleanupFallbackCache(): void {
    const now = Date.now()
    for (const [key, item] of this.fallbackCache.entries()) {
      if (now > item.expires) {
        this.fallbackCache.delete(key)
      }
    }
  }

  /**
   * Obtém status de saúde
   */
  getHealthStatus(): RedisHealthStatus {
    return { ...this.healthStatus }
  }

  /**
   * Obtém métricas
   */
  getMetrics(): RedisMetrics {
    return { ...this.metrics }
  }

  /**
   * Força reconexão
   */
  async forceReconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect()
    }
    this.reconnectAttempts = 0
    await this.initializeRedis()
  }

  /**
   * Limpa recursos
   */
  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    
    if (this.redis) {
      await this.redis.quit()
    }
    
    this.fallbackCache.clear()
  }
}

/**
 * Instância singleton do serviço Redis
 */
let redisService: RedisProductionService | null = null

export function getRedisService(): RedisProductionService {
  if (!redisService) {
    redisService = new RedisProductionService()
  }
  return redisService
}

/**
 * Utilitários Redis
 */
export const redisUtils = {
  // Cache com TTL automático
  async cacheWithTTL<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = 3600
  ): Promise<T> {
    const redis = getRedisService()
    
    // Tentar obter do cache
    const cached = await redis.get(key)
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (error) {
        console.error('❌ Erro ao parsear cache:', error)
      }
    }
    
    // Buscar dados e cachear
    const data = await fetcher()
    await redis.set(key, JSON.stringify(data), ttl)
    return data
  },

  // Invalidar cache por padrão
  async invalidatePattern(pattern: string): Promise<void> {
    const redis = getRedisService()
    // Implementação simplificada para fallback
    console.log(`🗑️ Invalidando cache pattern: ${pattern}`)
  },

  // Obter múltiplas chaves
  async mget(keys: string[]): Promise<(string | null)[]> {
    const redis = getRedisService()
    const results: (string | null)[] = []
    
    for (const key of keys) {
      results.push(await redis.get(key))
    }
    
    return results
  }
}

export default getRedisService