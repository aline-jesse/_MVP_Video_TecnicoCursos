

/**
 * API: Cache Statistics
 * Get Redis cache stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { redisCache } from '@/lib/cache/redis-cache'

export async function GET(request: NextRequest) {
  try {
    const stats = await redisCache.getStats()

    return NextResponse.json({
      success: true,
      cache: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[Cache Stats] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get cache stats' },
      { status: 500 }
    )
  }
}
