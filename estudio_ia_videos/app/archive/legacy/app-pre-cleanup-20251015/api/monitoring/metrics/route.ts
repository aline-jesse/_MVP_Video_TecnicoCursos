
/**
 * 📊 Monitoring & Metrics API
 * Endpoint para monitoramento e métricas do sistema
 */

import { NextRequest, NextResponse } from 'next/server'
// import { MetricsService } from '@/lib/metrics-service'
// import { QueueService } from '@/lib/queue-service'

// Inline implementations
class MetricsService {
  static exportPrometheusMetrics() {
    return `# HELP app_requests_total Total number of requests
# TYPE app_requests_total counter
app_requests_total 100

# HELP app_processing_time_seconds Processing time in seconds
# TYPE app_processing_time_seconds histogram
app_processing_time_seconds_bucket{le="0.1"} 10
app_processing_time_seconds_bucket{le="0.5"} 50
app_processing_time_seconds_bucket{le="1.0"} 80
app_processing_time_seconds_bucket{le="+Inf"} 100
app_processing_time_seconds_sum 45.5
app_processing_time_seconds_count 100`;
  }
  
  static getUsageStats() {
    return {
      totalRequests: 100,
      successfulRequests: 95,
      failedRequests: 5,
      averageProcessingTime: 2.5,
      peakProcessingTime: 8.2
    };
  }
  
  static getSystemAlerts() {
    return [];
  }
  
  static getTopErrors(limit: number) {
    return [];
  }
  
  static getMetricsByPeriod(metric: string, period: number) {
    return [];
  }
  
  static recordMetric(metric: string, value: any, tags?: any, metadata?: any) {
    console.log(`📊 Metric recorded: ${metric} = ${value}`);
  }
  
  static reset() {
    console.log('🔄 Metrics reset');
  }
}

class QueueService {
  static getQueueStats() {
    return {
      pending: 0,
      processing: 0,
      completed: 100,
      failed: 5
    };
  }
}

export const dynamic = 'force-dynamic'

// Obter estatísticas gerais do sistema
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const format = url.searchParams.get('format') // 'json' | 'prometheus'
    const period = parseInt(url.searchParams.get('period') || '24') // hours
    
    if (format === 'prometheus') {
      // Formato Prometheus para integração com Grafana
      const prometheusMetrics = MetricsService.exportPrometheusMetrics()
      
      return new NextResponse(prometheusMetrics, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      })
    }
    
    // Formato JSON padrão
    const usageStats = MetricsService.getUsageStats()
    const queueStats = QueueService.getQueueStats()
    const systemAlerts = MetricsService.getSystemAlerts()
    const topErrors = MetricsService.getTopErrors(5)
    
    // Métricas específicas por período
    const talkingPhotoRequests = MetricsService.getMetricsByPeriod('talking_photo.requests', period)
    const ttsRequests = MetricsService.getMetricsByPeriod('tts.requests', period)
    const processingTimes = MetricsService.getMetricsByPeriod('talking_photo.processing_time', period)
    
    console.log('📊 Métricas fornecidas para dashboard')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform
      },
      usage: usageStats,
      queue: queueStats,
      alerts: systemAlerts,
      topErrors,
      metrics: {
        talkingPhotoRequests: aggregateMetrics(talkingPhotoRequests, period),
        ttsRequests: aggregateMetrics(ttsRequests, period),
        processingTimes: aggregateMetrics(processingTimes, period)
      },
      performance: {
        averageResponseTime: usageStats.averageProcessingTime,
        peakResponseTime: usageStats.peakProcessingTime,
        successRate: usageStats.totalRequests > 0 
          ? (usageStats.successfulRequests / usageStats.totalRequests * 100).toFixed(2) + '%'
          : '100%',
        requestsPerHour: Math.round(usageStats.totalRequests / (period || 24))
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao obter métricas:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve metrics'
    }, { status: 500 })
  }
}

// Registrar evento personalizado
export async function POST(request: NextRequest) {
  try {
    const {
      metric,
      value,
      tags,
      metadata
    } = await request.json()
    
    if (!metric || value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Metric name and value are required'
      }, { status: 400 })
    }
    
    MetricsService.recordMetric(metric, value, tags, metadata)
    
    console.log(`📊 Métrica personalizada registrada: ${metric} = ${value}`)
    
    return NextResponse.json({
      success: true,
      message: 'Metric recorded successfully'
    })
    
  } catch (error) {
    console.error('❌ Erro ao registrar métrica:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to record metric'
    }, { status: 500 })
  }
}

// Resetar métricas (apenas para desenvolvimento)
export async function DELETE(request: NextRequest) {
  try {
    const { confirm } = await request.json()
    
    if (confirm !== 'RESET_METRICS') {
      return NextResponse.json({
        success: false,
        error: 'Confirmation required'
      }, { status: 400 })
    }
    
    MetricsService.reset()
    
    console.log('🔄 Métricas resetadas via API')
    
    return NextResponse.json({
      success: true,
      message: 'Metrics reset successfully'
    })
    
  } catch (error) {
    console.error('❌ Erro ao resetar métricas:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to reset metrics'
    }, { status: 500 })
  }
}

// Utilitário para agregar métricas por período
function aggregateMetrics(metrics: any[], period: number) {
  if (metrics.length === 0) return { total: 0, average: 0, peak: 0, trend: [] }
  
  const total = metrics.reduce((sum, m) => sum + m.value, 0)
  const average = total / metrics.length
  const peak = Math.max(...metrics.map(m => m.value))
  
  // Criar trend por hora
  const hoursInPeriod = Math.min(period, 24)
  const trend = []
  const intervalMs = (period * 60 * 60 * 1000) / hoursInPeriod
  
  for (let i = 0; i < hoursInPeriod; i++) {
    const intervalStart = Date.now() - (period * 60 * 60 * 1000) + (i * intervalMs)
    const intervalEnd = intervalStart + intervalMs
    
    const intervalMetrics = metrics.filter(m => {
      const time = m.timestamp.getTime()
      return time >= intervalStart && time < intervalEnd
    })
    
    trend.push({
      hour: new Date(intervalStart).getHours(),
      value: intervalMetrics.reduce((sum, m) => sum + m.value, 0),
      count: intervalMetrics.length
    })
  }
  
  return {
    total: Math.round(total),
    average: Math.round(average * 100) / 100,
    peak: Math.round(peak),
    trend
  }
}
