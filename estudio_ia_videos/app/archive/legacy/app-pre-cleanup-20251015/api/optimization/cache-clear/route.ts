

/**
 * Sprint 7 - API para limpeza de cache
 */

import { NextRequest, NextResponse } from 'next/server'
import { intelligentCache, pptxCache, templateCache, renderCache } from '../../../../lib/cache/intelligent-cache'

export async function POST(request: NextRequest) {
  try {
    const { cacheType } = await request.json()
    
    let clearedCount = 0
    let clearedSize = 0
    
    switch (cacheType) {
      case 'intelligent':
        const intelligentStats = intelligentCache.getStats()
        clearedCount = intelligentStats.totalEntries
        clearedSize = intelligentStats.totalSize
        intelligentCache.clear()
        break
        
      case 'pptx':
        const pptxStats = pptxCache.getStats()
        clearedCount = pptxStats.totalEntries
        clearedSize = pptxStats.totalSize
        pptxCache.clear()
        break
        
      case 'template':
        const templateStats = templateCache.getStats()
        clearedCount = templateStats.totalEntries
        clearedSize = templateStats.totalSize
        templateCache.clear()
        break
        
      case 'render':
        const renderStats = renderCache.getStats()
        clearedCount = renderStats.totalEntries
        clearedSize = renderStats.totalSize
        renderCache.clear()
        break
        
      case 'all':
        const allStats = [
          intelligentCache.getStats(),
          pptxCache.getStats(),
          templateCache.getStats(),
          renderCache.getStats()
        ]
        
        clearedCount = allStats.reduce((sum, stats) => sum + stats.totalEntries, 0)
        clearedSize = allStats.reduce((sum, stats) => sum + stats.totalSize, 0)
        
        intelligentCache.clear()
        pptxCache.clear()
        templateCache.clear()
        renderCache.clear()
        break
        
      default:
        return NextResponse.json(
          { error: 'Tipo de cache inválido' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      message: `Cache ${cacheType} limpo com sucesso`,
      cleared: {
        entries: clearedCount,
        size: formatBytes(clearedSize)
      }
    })
    
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar cache' },
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
