
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth/api-auth'
import { processingQueue } from '@/lib/queue/processing-queue'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await processingQueue.getQueueStats()

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching queue stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue stats' },
      { status: 500 }
    )
  }
}
