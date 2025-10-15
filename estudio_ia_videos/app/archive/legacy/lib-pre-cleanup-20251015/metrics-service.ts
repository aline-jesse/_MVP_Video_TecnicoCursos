
/**
 * 📊 Metrics Service
 * Sistema de métricas e monitoramento para produção
 */

interface MetricData {
  timestamp: Date
  metric: string
  value: number
  tags?: Record<string, string>
  metadata?: any
}

interface PerformanceMetric {
  operation: string
  duration: number
  success: boolean
  timestamp: Date
  details?: any
}

interface UsageStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageProcessingTime: number
  peakProcessingTime: number
  activeUsers: number
  totalVideosGenerated: number
  totalAudioGenerated: number
  storageUsed: number
}

export class MetricsService {
  private static metrics: MetricData[] = []
  private static performanceMetrics: PerformanceMetric[] = []
  private static readonly MAX_METRICS = 10000
  private static readonly RETENTION_HOURS = 24

  // Registrar métrica personalizada
  static recordMetric(
    metric: string,
    value: number,
    tags?: Record<string, string>,
    metadata?: any
  ): void {
    const data: MetricData = {
      timestamp: new Date(),
      metric,
      value,
      tags,
      metadata
    }

    this.metrics.push(data)
    this.cleanupOldMetrics()

    console.log(`📊 Métrica registrada: ${metric} = ${value}`, tags)
  }

  // Registrar métrica de performance
  static recordPerformance(
    operation: string,
    startTime: number,
    success: boolean,
    details?: any
  ): void {
    const duration = Date.now() - startTime
    
    const metric: PerformanceMetric = {
      operation,
      duration,
      success,
      timestamp: new Date(),
      details
    }

    this.performanceMetrics.push(metric)
    this.cleanupOldMetrics()

    // Registrar como métrica também
    this.recordMetric(`performance.${operation}.duration`, duration, {
      success: success.toString(),
      operation
    })

    console.log(`⚡ Performance: ${operation} = ${duration}ms (${success ? 'success' : 'failed'})`)
  }

  // Wrapper para medir performance de funções
  static async measureOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now()
    let success = false
    let result: T

    try {
      result = await fn()
      success = true
      return result
    } catch (error) {
      console.error(`❌ Operação falhou: ${operation}`, error)
      throw error
    } finally {
      this.recordPerformance(operation, startTime, success, { tags })
    }
  }

  // Métricas específicas do talking photo
  static recordTalkingPhotoMetrics(data: {
    textLength: number
    audioDuration: number
    videoDuration: number
    resolution: string
    processingTime: number
    success: boolean
    avatarId: string
    voice: string
  }): void {
    this.recordMetric('talking_photo.requests', 1, {
      success: data.success.toString(),
      resolution: data.resolution,
      avatarId: data.avatarId,
      voice: data.voice
    })

    if (data.success) {
      this.recordMetric('talking_photo.text_length', data.textLength)
      this.recordMetric('talking_photo.audio_duration', data.audioDuration)
      this.recordMetric('talking_photo.video_duration', data.videoDuration)
      this.recordMetric('talking_photo.processing_time', data.processingTime, {
        resolution: data.resolution
      })
    }
  }

  // Métricas de TTS
  static recordTTSMetrics(data: {
    provider: 'google' | 'azure' | 'elevenlabs' | 'fallback'
    textLength: number
    audioDuration: number
    processingTime: number
    success: boolean
    voice: string
  }): void {
    this.recordMetric('tts.requests', 1, {
      provider: data.provider,
      success: data.success.toString(),
      voice: data.voice
    })

    if (data.success) {
      this.recordMetric('tts.text_length', data.textLength, { provider: data.provider })
      this.recordMetric('tts.audio_duration', data.audioDuration, { provider: data.provider })
      this.recordMetric('tts.processing_time', data.processingTime, { provider: data.provider })
    }
  }

  // Métricas de armazenamento
  static recordStorageMetrics(data: {
    operation: 'upload' | 'download' | 'delete'
    fileType: 'audio' | 'video' | 'image'
    fileSize: number
    success: boolean
    processingTime: number
  }): void {
    this.recordMetric('storage.operations', 1, {
      operation: data.operation,
      fileType: data.fileType,
      success: data.success.toString()
    })

    if (data.success) {
      this.recordMetric('storage.file_size', data.fileSize, {
        operation: data.operation,
        fileType: data.fileType
      })
      this.recordMetric('storage.processing_time', data.processingTime, {
        operation: data.operation
      })
    }
  }

  // Obter estatísticas de uso
  static getUsageStats(): UsageStats {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentMetrics = this.metrics.filter(m => m.timestamp >= last24h)
    const recentPerformance = this.performanceMetrics.filter(p => p.timestamp >= last24h)

    const totalRequests = recentMetrics.filter(m => m.metric.includes('.requests')).length
    const successfulRequests = recentMetrics.filter(m => 
      m.metric.includes('.requests') && m.tags?.success === 'true'
    ).length
    const failedRequests = totalRequests - successfulRequests

    const processingTimes = recentPerformance.map(p => p.duration)
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0
    const peakProcessingTime = processingTimes.length > 0 
      ? Math.max(...processingTimes) 
      : 0

    const videosGenerated = recentMetrics.filter(m => 
      m.metric === 'talking_photo.requests' && m.tags?.success === 'true'
    ).length

    const audiosGenerated = recentMetrics.filter(m => 
      m.metric === 'tts.requests' && m.tags?.success === 'true'
    ).length

    const storageMetrics = recentMetrics.filter(m => m.metric === 'storage.file_size')
    const storageUsed = storageMetrics.reduce((total, m) => total + m.value, 0)

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageProcessingTime: Math.round(averageProcessingTime),
      peakProcessingTime: Math.round(peakProcessingTime),
      activeUsers: this.estimateActiveUsers(),
      totalVideosGenerated: videosGenerated,
      totalAudioGenerated: audiosGenerated,
      storageUsed: Math.round(storageUsed / (1024 * 1024)) // MB
    }
  }

  // Obter métricas por período
  static getMetricsByPeriod(
    metricName: string,
    hours: number = 24
  ): Array<{ timestamp: Date; value: number; tags?: Record<string, string> }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    return this.metrics
      .filter(m => m.metric === metricName && m.timestamp >= since)
      .map(m => ({
        timestamp: m.timestamp,
        value: m.value,
        tags: m.tags
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  // Obter top erros
  static getTopErrors(limit: number = 10): Array<{
    operation: string
    count: number
    lastSeen: Date
    sampleError?: any
  }> {
    const failedOps = this.performanceMetrics.filter(p => !p.success)
    const errorCounts = new Map<string, { count: number; lastSeen: Date; sampleError?: any }>()

    failedOps.forEach(op => {
      const key = op.operation
      const existing = errorCounts.get(key)
      
      if (existing) {
        existing.count++
        if (op.timestamp > existing.lastSeen) {
          existing.lastSeen = op.timestamp
          existing.sampleError = op.details
        }
      } else {
        errorCounts.set(key, {
          count: 1,
          lastSeen: op.timestamp,
          sampleError: op.details
        })
      }
    })

    return Array.from(errorCounts.entries())
      .map(([operation, data]) => ({ operation, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Obter alertas do sistema
  static getSystemAlerts(): Array<{
    type: 'warning' | 'error' | 'critical'
    message: string
    timestamp: Date
    metric?: string
    value?: number
  }> {
    const alerts = []
    const stats = this.getUsageStats()

    // Taxa de erro alta
    if (stats.totalRequests > 0) {
      const errorRate = stats.failedRequests / stats.totalRequests
      if (errorRate > 0.1) { // > 10%
        alerts.push({
          type: 'error' as const,
          message: `Taxa de erro alta: ${(errorRate * 100).toFixed(1)}%`,
          timestamp: new Date(),
          metric: 'error_rate',
          value: errorRate
        })
      }
    }

    // Tempo de processamento alto
    if (stats.peakProcessingTime > 30000) { // > 30s
      alerts.push({
        type: 'warning' as const,
        message: `Tempo de processamento alto: ${(stats.peakProcessingTime / 1000).toFixed(1)}s`,
        timestamp: new Date(),
        metric: 'peak_processing_time',
        value: stats.peakProcessingTime
      })
    }

    // Uso de armazenamento alto
    if (stats.storageUsed > 10000) { // > 10GB
      alerts.push({
        type: 'warning' as const,
        message: `Uso de armazenamento alto: ${stats.storageUsed}MB`,
        timestamp: new Date(),
        metric: 'storage_used',
        value: stats.storageUsed
      })
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Limpeza de métricas antigas
  private static cleanupOldMetrics(): void {
    if (this.metrics.length > this.MAX_METRICS) {
      const cutoff = new Date(Date.now() - this.RETENTION_HOURS * 60 * 60 * 1000)
      this.metrics = this.metrics.filter(m => m.timestamp >= cutoff)
      console.log(`🧹 Métricas antigas removidas. Total: ${this.metrics.length}`)
    }

    if (this.performanceMetrics.length > this.MAX_METRICS) {
      const cutoff = new Date(Date.now() - this.RETENTION_HOURS * 60 * 60 * 1000)
      this.performanceMetrics = this.performanceMetrics.filter(p => p.timestamp >= cutoff)
      console.log(`🧹 Métricas de performance antigas removidas. Total: ${this.performanceMetrics.length}`)
    }
  }

  // Estimar usuários ativos (aproximação)
  private static estimateActiveUsers(): number {
    const last1h = new Date(Date.now() - 60 * 60 * 1000)
    const recentRequests = this.metrics.filter(m => 
      m.timestamp >= last1h && m.metric.includes('.requests')
    ).length
    
    // Aproximação: assumir que cada usuário faz ~5 requests por hora
    return Math.max(1, Math.ceil(recentRequests / 5))
  }

  // Exportar métricas (para integração com Prometheus/Grafana)
  static exportPrometheusMetrics(): string {
    const stats = this.getUsageStats()
    const alerts = this.getSystemAlerts()
    
    return `
# HELP talking_photo_requests_total Total requests for talking photo generation
# TYPE talking_photo_requests_total counter
talking_photo_requests_total{status="success"} ${stats.successfulRequests}
talking_photo_requests_total{status="failed"} ${stats.failedRequests}

# HELP talking_photo_processing_time_seconds Average processing time
# TYPE talking_photo_processing_time_seconds gauge
talking_photo_processing_time_seconds ${stats.averageProcessingTime / 1000}

# HELP talking_photo_peak_time_seconds Peak processing time
# TYPE talking_photo_peak_time_seconds gauge
talking_photo_peak_time_seconds ${stats.peakProcessingTime / 1000}

# HELP talking_photo_active_users Estimated active users
# TYPE talking_photo_active_users gauge
talking_photo_active_users ${stats.activeUsers}

# HELP talking_photo_storage_mb Total storage used in MB
# TYPE talking_photo_storage_mb gauge
talking_photo_storage_mb ${stats.storageUsed}

# HELP talking_photo_alerts_active Active system alerts
# TYPE talking_photo_alerts_active gauge
talking_photo_alerts_active ${alerts.length}
    `.trim()
  }

  // Reset de métricas (para testes)
  static reset(): void {
    this.metrics = []
    this.performanceMetrics = []
    console.log('🔄 Métricas resetadas')
  }
}

// Interceptador global para métricas automáticas
export const withMetrics = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operation: string
): T => {
  return (async (...args: any[]) => {
    return MetricsService.measureOperation(operation, () => fn(...args))
  }) as T
}
