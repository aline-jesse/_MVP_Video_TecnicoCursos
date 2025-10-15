

/**
 * Sprint 7 - API para estatísticas de cache
 */

import { NextRequest, NextResponse } from 'next/server'
import { intelligentCache, pptxCache, templateCache, renderCache } from '../../../../lib/cache/intelligent-cache'
import { performanceOptimizer } from '../../../../lib/optimization/performance-optimizer'

export async function GET(request: NextRequest) {
  try {
    // Collect stats from all cache instances
    const cacheStats = {
      intelligent: intelligentCache.getStats(),
      pptx: pptxCache.getStats(),
      template: templateCache.getStats(),
      render: renderCache.getStats()
    }
    
    // Get performance insights
    const performanceInsights = performanceOptimizer.getPerformanceInsights()
    
    // Calculate overall system efficiency
    const overallHitRate = Object.values(cacheStats)
      .reduce((sum, stats) => sum + stats.hitRate, 0) / Object.keys(cacheStats).length
    
    const totalMemoryUsage = Object.values(cacheStats)
      .reduce((sum, stats) => sum + stats.totalSize, 0)
    
    return NextResponse.json({
      success: true,
      cacheStats,
      performanceInsights,
      systemOverview: {
        overallHitRate: overallHitRate * 100,
        totalMemoryUsage: formatBytes(totalMemoryUsage),
        cacheCount: Object.keys(cacheStats).length,
        totalEntries: Object.values(cacheStats).reduce((sum, stats) => sum + stats.totalEntries, 0)
      },
      recommendations: generateOptimizationRecommendations(cacheStats, performanceInsights)
    })
    
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas de cache' },
      { status: 500 }
    )
  }
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

function generateOptimizationRecommendations(cacheStats: any, performanceInsights: any): string[] {
  const recommendations: string[] = []
  
  // Check hit rates
  Object.entries(cacheStats).forEach(([cacheType, stats]: [string, any]) => {
    if (stats.hitRate < 0.7) {
      recommendations.push(`Melhorar taxa de acerto do cache ${cacheType} (atual: ${(stats.hitRate * 100).toFixed(1)}%)`)
    }
    
    if (stats.totalSize > 800 * 1024 * 1024) { // 800MB
      recommendations.push(`Cache ${cacheType} está usando muita memória (${stats.memoryUsage})`)
    }
  })
  
  // Check performance trends
  Object.entries(performanceInsights).forEach(([operation, data]: [string, any]) => {
    if (data.trend === 'degrading') {
      recommendations.push(`Performance da operação ${operation} está piorando`)
    }
    
    if (data.averageTime > 3000) {
      recommendations.push(`Operação ${operation} está muito lenta (${data.averageTime}ms)`)
    }
  })
  
  if (recommendations.length === 0) {
    recommendations.push('Sistema funcionando com performance otimizada')
  }
  
  return recommendations
}
