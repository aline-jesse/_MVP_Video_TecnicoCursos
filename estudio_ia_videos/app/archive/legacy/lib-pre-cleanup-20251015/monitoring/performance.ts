// Performance Monitoring System - Sprint 13
// Simplified version for compilation

interface PerformanceMetric {
  id: string
  name: string
  value: number
  timestamp: Date
  metadata?: any
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private thresholds = {
    cpu: 80,
    memory: 85,
    responseTime: 1000,
    errorRate: 5
  }

  async recordMetric(name: string, value: number, metadata?: any) {
    const metric: PerformanceMetric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      timestamp: new Date(),
      metadata
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)?.push(metric)

    // Keep only last 1000 metrics per type
    const metricsArray = this.metrics.get(name)!
    if (metricsArray.length > 1000) {
      metricsArray.shift()
    }
  }

  async getMetrics(name?: string): Promise<PerformanceMetric[]> {
    if (name) {
      return this.metrics.get(name) || []
    }

    const allMetrics: PerformanceMetric[] = []
    for (const metricsArray of this.metrics.values()) {
      allMetrics.push(...metricsArray)
    }

    return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()