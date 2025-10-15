

import { NextRequest, NextResponse } from 'next/server'
import { renderQueue } from '../../../../lib/queue/setup'

export async function GET(request: NextRequest) {
  try {
    const stats = renderQueue.getStats()
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        current_time: new Date().toISOString(),
        server_status: 'healthy',
        worker_capacity: {
          total: 3,
          available: Math.max(0, 3 - stats.processing),
          busy: stats.processing
        }
      }
    })

  } catch (error) {
    console.error('Error getting queue stats:', error)
    return NextResponse.json(
      { error: 'Failed to get queue statistics' },
      { status: 500 }
    )
  }
}
