
import { NextRequest, NextResponse } from 'next/server'
import { redisProduction } from '@/lib/cache/redis-production'
import { ttsCache } from '@/lib/tts/cache'

/**
 * GET /api/cache/stats
 * Get comprehensive cache statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get Redis stats
    const redisStats = await redisProduction.getStats()
    
    // Get TTS cache stats
    const ttsStats = ttsCache.getStats()
    
    // Get Redis health
    const redisHealth = await redisProduction.healthCheck()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      redis: {
        ...redisStats,
        health: redisHealth
      },
      tts: {
        ...ttsStats,
        cacheEnabled: true
      },
      combined: {
        totalHits: redisStats.hits + ttsStats.hitCount,
        totalMisses: redisStats.misses + ttsStats.missCount,
        totalRequests: redisStats.totalRequests + ttsStats.totalRequests,
        overallHitRate: calculateOverallHitRate(
          redisStats.hits + ttsStats.hitCount,
          redisStats.misses + ttsStats.missCount
        )
      }
    })
  } catch (error: any) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cache statistics',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cache/stats/reset
 * Reset cache statistics
 */
export async function POST(request: NextRequest) {
  try {
    redisProduction.resetStats()
    
    return NextResponse.json({
      success: true,
      message: 'Cache statistics reset successfully'
    })
  } catch (error: any) {
    console.error('Cache stats reset error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset cache statistics',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate overall hit rate
 */
function calculateOverallHitRate(hits: number, misses: number): number {
  const total = hits + misses
  if (total === 0) return 0
  return Math.round((hits / total) * 10000) / 100
}
