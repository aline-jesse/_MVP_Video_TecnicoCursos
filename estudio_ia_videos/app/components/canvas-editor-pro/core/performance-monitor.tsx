

'use client'

/**
 * 🔍 Performance Monitor - Real-time Canvas Metrics
 * FPS tracking, memory usage, and optimization alerts
 * Sprint 22 - Performance Optimization Engine
 */

import { useRef, useState, useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  fps: number
  renderTime: number
  memoryUsage: number
  objectCount: number
  cacheHitRate: number
  totalRenders: number
}

interface UsePerformanceMonitorReturn {
  startMonitoring: (canvas: any) => void
  stopMonitoring: () => void
  getMetrics: () => PerformanceMetrics
  isMonitoring: boolean
}

export function usePerformanceMonitor(): UsePerformanceMonitorReturn {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    memoryUsage: 0,
    objectCount: 0,
    cacheHitRate: 0,
    totalRenders: 0
  })
  
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const renderTimesRef = useRef<number[]>([])
  const totalRendersRef = useRef(0)
  const cacheHitsRef = useRef(0)
  const cacheMissesRef = useRef(0)
  const monitoringIntervalRef = useRef<NodeJS.Timeout>()

  const updateMetrics = useCallback((canvas: any) => {
    const now = Date.now()
    const deltaTime = now - lastTimeRef.current
    
    // Calculate FPS
    frameCountRef.current++
    if (deltaTime >= 1000) {
      const fps = (frameCountRef.current * 1000) / deltaTime
      frameCountRef.current = 0
      lastTimeRef.current = now
      
      // Calculate average render time
      const avgRenderTime = renderTimesRef.current.length > 0
        ? renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
        : 0
      
      // Calculate memory usage (approximate)
      const memoryUsage = canvas ? canvas.getObjects().length * 0.1 : 0 // Rough estimate
      
      // Calculate cache hit rate
      const totalCacheAttempts = cacheHitsRef.current + cacheMissesRef.current
      const cacheHitRate = totalCacheAttempts > 0 
        ? (cacheHitsRef.current / totalCacheAttempts) * 100 
        : 0
      
      setMetrics({
        fps: Math.min(fps, 60),
        renderTime: avgRenderTime,
        memoryUsage,
        objectCount: canvas ? canvas.getObjects().length : 0,
        cacheHitRate,
        totalRenders: totalRendersRef.current
      })
      
      // Reset render times array to prevent memory leak
      renderTimesRef.current = []
    }
  }, [])

  const startMonitoring = useCallback((canvas: any) => {
    if (!canvas || isMonitoring) return
    
    setIsMonitoring(true)
    
    // Hook into canvas render cycle
    const originalRenderAll = canvas.renderAll.bind(canvas)
    canvas.renderAll = function() {
      const renderStart = performance.now()
      originalRenderAll()
      const renderEnd = performance.now()
      
      totalRendersRef.current++
      renderTimesRef.current.push(renderEnd - renderStart)
      
      // Keep only last 60 render times
      if (renderTimesRef.current.length > 60) {
        renderTimesRef.current.shift()
      }
    }
    
    // Start monitoring interval
    monitoringIntervalRef.current = setInterval(() => {
      updateMetrics(canvas)
    }, 100) // Update metrics every 100ms
    
  }, [updateMetrics, isMonitoring])
  
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current)
    }
  }, [])
  
  const getMetrics = useCallback(() => metrics, [metrics])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring()
    }
  }, [stopMonitoring])
  
  return {
    startMonitoring,
    stopMonitoring,
    getMetrics,
    isMonitoring
  }
}

// Performance alert hooks
export function usePerformanceAlerts(metrics: PerformanceMetrics) {
  const [alerts, setAlerts] = useState<string[]>([])
  
  useEffect(() => {
    const newAlerts: string[] = []
    
    if (metrics.fps < 30) {
      newAlerts.push('Low FPS detected - Consider reducing object count')
    }
    
    if (metrics.renderTime > 16) {
      newAlerts.push('High render time - Performance optimization needed')
    }
    
    if (metrics.memoryUsage > 100) {
      newAlerts.push('High memory usage - Consider clearing unused objects')
    }
    
    if (metrics.objectCount > 500) {
      newAlerts.push('Too many objects - Performance may be affected')
    }
    
    if (metrics.cacheHitRate < 50 && metrics.totalRenders > 100) {
      newAlerts.push('Low cache efficiency - Cache strategy needs optimization')
    }
    
    setAlerts(newAlerts)
  }, [metrics])
  
  return alerts
}

// Performance optimization recommendations
export const PerformanceRecommendations = {
  getFPSOptimizations: (fps: number) => {
    if (fps < 30) return ['Reduce object count', 'Enable object caching', 'Use simpler shapes']
    if (fps < 45) return ['Optimize render cycle', 'Reduce animation complexity']
    return ['Performance is optimal']
  },
  
  getMemoryOptimizations: (memoryUsage: number) => {
    if (memoryUsage > 100) return ['Clear unused objects', 'Optimize image sizes', 'Use object pooling']
    if (memoryUsage > 50) return ['Monitor object creation', 'Consider lazy loading']
    return ['Memory usage is optimal']
  },
  
  getRenderOptimizations: (renderTime: number) => {
    if (renderTime > 16) return ['Enable GPU acceleration', 'Use OffscreenCanvas', 'Batch operations']
    if (renderTime > 8) return ['Optimize object complexity', 'Use render caching']
    return ['Render performance is optimal']
  }
}

