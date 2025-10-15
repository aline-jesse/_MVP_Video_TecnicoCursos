/**
 * 📊 DATABASE PERFORMANCE MONITOR
 * Sistema de monitoramento de performance do banco de dados
 */

import { optimizedPrisma } from './optimized-prisma'
import type { DatabaseMetrics, DatabaseHealth } from './performance-config'

class DatabasePerformanceMonitor {
  private static instance: DatabasePerformanceMonitor
  private metrics: DatabaseMetrics
  private isMonitoring = false
  private monitoringInterval?: NodeJS.Timeout

  constructor() {
    this.metrics = {
      connectionPool: {
        active: 0,
        idle: 0,
        total: 0,
        waiting: 0,
      },
      queries: {
        total: 0,
        slow: 0,
        failed: 0,
        averageTime: 0,
      },
      transactions: {
        active: 0,
        committed: 0,
        rolledBack: 0,
        averageTime: 0,
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      },
    }
  }

  static getInstance(): DatabasePerformanceMonitor {
    if (!DatabasePerformanceMonitor.instance) {
      DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor()
    }
    return DatabasePerformanceMonitor.instance
  }

  // 🚀 Start monitoring
  startMonitoring(intervalMs = 30000): void {
    if (this.isMonitoring) {
      console.log('📊 Database monitoring already running')
      return
    }

    this.isMonitoring = true
    console.log('📊 Starting database performance monitoring...')

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics()
        await this.checkHealth()
      } catch (error) {
        console.error('❌ Error collecting database metrics:', error)
      }
    }, intervalMs)
  }

  // 🛑 Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.isMonitoring = false
    console.log('📊 Database monitoring stopped')
  }

  // 📈 Collect performance metrics
  private async collectMetrics(): Promise<void> {
    try {
      // Query performance metrics
      const queryStart = Date.now()
      await optimizedPrisma.$queryRaw`SELECT 1 as health_check`
      const queryTime = Date.now() - queryStart

      // Update query metrics
      this.metrics.queries.total++
      this.metrics.queries.averageTime = 
        (this.metrics.queries.averageTime + queryTime) / 2

      if (queryTime > 1000) { // Slow query threshold
        this.metrics.queries.slow++
      }

      // Connection pool metrics (simulated - Prisma doesn't expose these directly)
      this.updateConnectionPoolMetrics()

      // Log metrics periodically
      if (this.metrics.queries.total % 10 === 0) {
        this.logMetrics()
      }

    } catch (error) {
      this.metrics.queries.failed++
      console.error('❌ Database metrics collection failed:', error)
    }
  }

  // 🔍 Health check
  async checkHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now()
    const errors: string[] = []

    try {
      // Basic connectivity test
      await optimizedPrisma.$queryRaw`SELECT 1 as health_check`
      
      // Check database version
      const versionResult = await optimizedPrisma.$queryRaw`SELECT version() as version`
      
      const latency = Date.now() - startTime
      
      // Determine health status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      
      if (latency > 5000) {
        status = 'unhealthy'
        errors.push(`High latency: ${latency}ms`)
      } else if (latency > 1000) {
        status = 'degraded'
        errors.push(`Elevated latency: ${latency}ms`)
      }

      if (this.metrics.queries.failed > 0) {
        const errorRate = this.metrics.queries.failed / this.metrics.queries.total
        if (errorRate > 0.1) {
          status = 'unhealthy'
          errors.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`)
        } else if (errorRate > 0.05) {
          status = 'degraded'
          errors.push(`Elevated error rate: ${(errorRate * 100).toFixed(2)}%`)
        }
      }

      const health: DatabaseHealth = {
        status,
        latency,
        connectionPool: {
          available: this.metrics.connectionPool.idle,
          used: this.metrics.connectionPool.active,
          utilization: this.metrics.connectionPool.active / 
                      (this.metrics.connectionPool.active + this.metrics.connectionPool.idle),
        },
        lastCheck: new Date(),
        errors,
      }

      return health

    } catch (error: any) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        connectionPool: {
          available: 0,
          used: 0,
          utilization: 1,
        },
        lastCheck: new Date(),
        errors: [`Database connection failed: ${error.message}`],
      }
    }
  }

  // 📊 Get current metrics
  getMetrics(): DatabaseMetrics {
    return { ...this.metrics }
  }

  // 🔄 Reset metrics
  resetMetrics(): void {
    this.metrics = {
      connectionPool: {
        active: 0,
        idle: 0,
        total: 0,
        waiting: 0,
      },
      queries: {
        total: 0,
        slow: 0,
        failed: 0,
        averageTime: 0,
      },
      transactions: {
        active: 0,
        committed: 0,
        rolledBack: 0,
        averageTime: 0,
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      },
    }
  }

  // 📝 Log metrics
  private logMetrics(): void {
    console.log('📊 Database Performance Metrics:', {
      queries: {
        total: this.metrics.queries.total,
        slow: this.metrics.queries.slow,
        failed: this.metrics.queries.failed,
        avgTime: `${this.metrics.queries.averageTime.toFixed(2)}ms`,
        errorRate: `${((this.metrics.queries.failed / this.metrics.queries.total) * 100).toFixed(2)}%`,
      },
      connectionPool: {
        active: this.metrics.connectionPool.active,
        idle: this.metrics.connectionPool.idle,
        utilization: `${((this.metrics.connectionPool.active / this.metrics.connectionPool.total) * 100).toFixed(2)}%`,
      },
    })
  }

  // 🔧 Update connection pool metrics (simulated)
  private updateConnectionPoolMetrics(): void {
    // Since Prisma doesn't expose connection pool metrics directly,
    // we simulate based on query patterns
    const baseConnections = 10
    const maxConnections = 100
    
    // Simulate connection usage based on query frequency
    const queryFrequency = Math.min(this.metrics.queries.total / 100, 1)
    const estimatedActive = Math.floor(baseConnections + (maxConnections - baseConnections) * queryFrequency)
    
    this.metrics.connectionPool.active = estimatedActive
    this.metrics.connectionPool.idle = maxConnections - estimatedActive
    this.metrics.connectionPool.total = maxConnections
  }

  // 🚨 Check for alerts
  async checkAlerts(): Promise<string[]> {
    const alerts: string[] = []
    const health = await this.checkHealth()

    // High latency alert
    if (health.latency > 5000) {
      alerts.push(`🚨 HIGH LATENCY: ${health.latency}ms`)
    }

    // High error rate alert
    if (this.metrics.queries.total > 0) {
      const errorRate = this.metrics.queries.failed / this.metrics.queries.total
      if (errorRate > 0.05) {
        alerts.push(`🚨 HIGH ERROR RATE: ${(errorRate * 100).toFixed(2)}%`)
      }
    }

    // Connection pool utilization alert
    if (health.connectionPool.utilization > 0.8) {
      alerts.push(`🚨 HIGH CONNECTION POOL UTILIZATION: ${(health.connectionPool.utilization * 100).toFixed(2)}%`)
    }

    // Slow queries alert
    if (this.metrics.queries.slow > 10) {
      alerts.push(`🚨 HIGH SLOW QUERY COUNT: ${this.metrics.queries.slow}`)
    }

    return alerts
  }

  // 📈 Get performance summary
  getPerformanceSummary(): {
    status: string
    uptime: string
    totalQueries: number
    averageLatency: string
    errorRate: string
    slowQueries: number
  } {
    const errorRate = this.metrics.queries.total > 0 
      ? (this.metrics.queries.failed / this.metrics.queries.total) * 100 
      : 0

    return {
      status: this.isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive',
      uptime: process.uptime().toFixed(0) + 's',
      totalQueries: this.metrics.queries.total,
      averageLatency: this.metrics.queries.averageTime.toFixed(2) + 'ms',
      errorRate: errorRate.toFixed(2) + '%',
      slowQueries: this.metrics.queries.slow,
    }
  }
}

// 🌐 Export singleton instance
export const dbMonitor = DatabasePerformanceMonitor.getInstance()

// 🚀 Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  dbMonitor.startMonitoring(30000) // 30 seconds interval
}

export default dbMonitor