
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { RetentionTracker } from '@/lib/growth/retention-tracker'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, eventType, metadata } = body

    RetentionTracker.trackUserActivity(userId, eventType, metadata)

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
    })
  } catch (error) {
    console.error('Error tracking retention event:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock data - em produção, buscar do banco
    const mockUsers = [
      {
        userId: 'user1',
        signupDate: new Date('2025-09-01'),
        lastActiveDate: new Date('2025-10-02'),
        d1Retention: true,
        d7Retention: true,
        d30Retention: true,
        totalSessions: 15,
        averageSessionDuration: 900,
        keyActionsCompleted: ['video_render', 'tts_generate', 'avatar_use'],
        cohort: 'September 2025',
      },
      {
        userId: 'user2',
        signupDate: new Date('2025-09-15'),
        lastActiveDate: new Date('2025-09-20'),
        d1Retention: true,
        d7Retention: false,
        d30Retention: false,
        totalSessions: 3,
        averageSessionDuration: 300,
        keyActionsCompleted: ['video_render'],
        cohort: 'September 2025',
      },
    ]

    const cohortAnalysis = RetentionTracker.analyzeCohort(mockUsers)
    const featureUsage = RetentionTracker.analyzeFeatureUsage(mockUsers)

    return NextResponse.json({
      success: true,
      cohortAnalysis,
      featureUsage,
    })
  } catch (error) {
    console.error('Error fetching retention data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch retention data' },
      { status: 500 }
    )
  }
}
