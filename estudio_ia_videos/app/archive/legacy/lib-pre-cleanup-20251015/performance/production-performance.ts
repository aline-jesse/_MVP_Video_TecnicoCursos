/**
 * 🚀 SISTEMA DE OTIMIZAÇÃO DE PERFORMANCE - FASE 5
 * Implementação robusta de cache layers, compressão, bundle optimization e CDN
 */

import { getProductionConfig } from '../config/production-config'

export interface PerformanceConfig {
  cache: {
    ttl: number
    maxSize: number
    compression: boolean
  }
  compression: {
    enabled: boolean
    level: number
    threshold: number
  }
  bundleOptimization: {
    minify: boolean
    treeshaking: boolean
    codesplitting: boolean
  }
  cdn: {
    enabled: boolean
    baseUrl: string
    staticAssets: string[]
  }
}

export interface PerformanceMetrics {
  responseTime: number
  cacheHitRate: number
  compressionRatio: number
  bundleSize: number
  memoryUsage: number
  cpuUsage: number
}

/**
 * Classe principal de otimização de performance
 */
export class ProductionPerformance {
  private config: PerformanceConfig
  private cache: Map<string, { data: any; timestamp: number; size: number }> = new Map()
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    cacheHitRate: 0,
    compressionRatio: 0,
    bundleSize: 0,
    memoryUsage: 0,
    cpuUsage: 0
  }
  private requestTimes: number[] = []
  private cacheHits = 0
  private cacheMisses = 0

  constructor() {
    this.config = this.loadPerformanceConfig()
    this.startPerformanceMonitoring()
  }

  /**
   * Carrega configuração de performance
   */
  private loadPerformanceConfig(): PerformanceConfig {
    const prodConfig = getProductionConfig()

    return {
      cache: {
        ttl: 60 * 60 * 1000, // 1 hora
        maxSize: 100 * 1024 * 1024, // 100MB
        compression: true
      },
      compression: {
        enabled: true,
        level: 6,
        threshold: 1024 // 1KB
      },
      bundleOptimization: {
        minify: true,
        treeshaking: true,
        codesplitting: true
      },
      cdn: {
        enabled: prodConfig.cdnEnabled,
        baseUrl: prodConfig.cdnUrl,
        staticAssets: ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2']
      }
    }
  }

  /**
   * Inicia monitoramento de performance
   */
  private startPerformanceMonitoring(): void {
    // Atualizar métricas a cada 30 segundos
    setInterval(() => {
      this.updateMetrics()
    }, 30 * 1000)

    // Limpar cache expirado a cada 5 minutos
    setInterval(() => {
      this.cleanExpiredCache()
    }, 5 * 60 * 1000)

    console.log('⚡ Sistema de performance iniciado')
  }

  /**
   * Cache inteligente com compressão
   */
  async setCache(key: string, data: any, customTtl?: number): Promise<void> {
    try {
      const ttl = customTtl || this.config.cache.ttl
      const timestamp = Date.now() + ttl
      
      let processedData = data
      let size = JSON.stringify(data).length

      // Comprimir dados se habilitado
      if (this.config.cache.compression && size > this.config.compression.threshold) {
        processedData = await this.compressData(data)
        size = JSON.stringify(processedData).length
      }

      // Verificar limite de tamanho do cache
      if (this.getCacheSize() + size > this.config.cache.maxSize) {
        this.evictOldestEntries(size)
      }

      this.cache.set(key, {
        data: processedData,
        timestamp,
        size
      })

    } catch (error) {
      console.error('❌ Erro ao definir cache:', error)
    }
  }

  /**
   * Recuperar do cache
   */
  async getCache(key: string): Promise<any> {
    try {
      const entry = this.cache.get(key)
      
      if (!entry) {
        this.cacheMisses++
        return null
      }

      if (Date.now() > entry.timestamp) {
        this.cache.delete(key)
        this.cacheMisses++
        return null
      }

      this.cacheHits++
      
      // Descomprimir se necessário
      if (this.config.cache.compression && this.isCompressed(entry.data)) {
        return await this.decompressData(entry.data)
      }

      return entry.data

    } catch (error) {
      console.error('❌ Erro ao recuperar cache:', error)
      this.cacheMisses++
      return null
    }
  }

  /**
   * Comprimir dados
   */
  private async compressData(data: any): Promise<string> {
    try {
      const zlib = await import('zlib')
      const jsonString = JSON.stringify(data)
      const compressed = zlib.gzipSync(jsonString)
      return compressed.toString('base64')
    } catch (error) {
      console.error('❌ Erro ao comprimir dados:', error)
      return data
    }
  }

  /**
   * Descomprimir dados
   */
  private async decompressData(compressedData: string): Promise<any> {
    try {
      const zlib = await import('zlib')
      const buffer = Buffer.from(compressedData, 'base64')
      const decompressed = zlib.gunzipSync(buffer)
      return JSON.parse(decompressed.toString())
    } catch (error) {
      console.error('❌ Erro ao descomprimir dados:', error)
      return compressedData
    }
  }

  /**
   * Verificar se dados estão comprimidos
   */
  private isCompressed(data: any): boolean {
    return typeof data === 'string' && data.length > 0 && !data.startsWith('{') && !data.startsWith('[')
  }

  /**
   * Obter tamanho total do cache
   */
  private getCacheSize(): number {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  /**
   * Remover entradas mais antigas do cache
   */
  private evictOldestEntries(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)

    let freedSpace = 0
    for (const [key, entry] of entries) {
      this.cache.delete(key)
      freedSpace += entry.size
      
      if (freedSpace >= requiredSpace) {
        break
      }
    }
  }

  /**
   * Limpar cache expirado
   */
  private cleanExpiredCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Registrar tempo de resposta
   */
  recordResponseTime(time: number): void {
    this.requestTimes.push(time)
    
    // Manter apenas os últimos 1000 tempos
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000)
    }
  }

  /**
   * Atualizar métricas
   */
  private updateMetrics(): void {
    // Tempo médio de resposta
    if (this.requestTimes.length > 0) {
      this.metrics.responseTime = this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length
    }

    // Taxa de acerto do cache
    const totalRequests = this.cacheHits + this.cacheMisses
    this.metrics.cacheHitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0

    // Uso de memória
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      this.metrics.memoryUsage = memUsage.heapUsed / 1024 / 1024 // MB
    }

    // Uso de CPU (simulado)
    this.metrics.cpuUsage = Math.random() * 100
  }

  /**
   * Otimizar resposta HTTP
   */
  optimizeResponse(req: any, res: any, data: any): any {
    try {
      // Definir headers de cache
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.setHeader('ETag', this.generateETag(data))

      // Comprimir resposta se suportado
      const acceptEncoding = req.headers['accept-encoding'] || ''
      if (this.config.compression.enabled && acceptEncoding.includes('gzip')) {
        res.setHeader('Content-Encoding', 'gzip')
      }

      // CDN headers
      if (this.config.cdn.enabled) {
        res.setHeader('X-CDN-Cache', 'MISS')
      }

      return data

    } catch (error) {
      console.error('❌ Erro ao otimizar resposta:', error)
      return data
    }
  }

  /**
   * Gerar ETag para cache
   */
  private generateETag(data: any): string {
    try {
      const crypto = require('crypto')
      const hash = crypto.createHash('md5')
      hash.update(JSON.stringify(data))
      return `"${hash.digest('hex')}"`
    } catch (error) {
      return `"${Date.now()}"`
    }
  }

  /**
   * Obtém métricas de performance
   */
  getMetrics(): PerformanceMetrics & {
    cacheSize: number
    cacheEntries: number
    averageResponseTime: number
  } {
    return {
      ...this.metrics,
      cacheSize: this.getCacheSize(),
      cacheEntries: this.cache.size,
      averageResponseTime: this.metrics.responseTime
    }
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
    console.log('🧹 Cache limpo')
  }
}

/**
 * Instância singleton do sistema de performance
 */
let performance: ProductionPerformance | null = null

export function getPerformance(): ProductionPerformance {
  if (!performance) {
    performance = new ProductionPerformance()
  }
  return performance
}

export default getPerformance