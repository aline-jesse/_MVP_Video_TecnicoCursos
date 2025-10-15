
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { FeedbackCollector } from '@/lib/growth/feedback-collector'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, score, comment, context } = body

    const userId = (session.user as any).id || session.user.email || 'unknown'

    let result

    if (type === 'nps' && typeof score === 'number') {
      result = FeedbackCollector.recordNPS(userId, score, comment, context)
    } else if (type === 'csat' && typeof score === 'number') {
      result = FeedbackCollector.recordCSAT(userId, score, 'general', comment)
    } else if (type === 'qualitative') {
      result = FeedbackCollector.recordFeedback(
        userId,
        'improvement',
        'User Feedback',
        comment || 'No comment provided'
      )
    } else {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 })
    }

    // Em produção, salvar no banco
    // await prisma.feedback.create({ data: result })

    return NextResponse.json({
      success: true,
      feedback: result,
    })
  } catch (error) {
    console.error('Error recording feedback:', error)
    return NextResponse.json(
      { error: 'Failed to record feedback' },
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
    const mockNPS = [
      { userId: 'user1', score: 9, category: 'promoter' as const, timestamp: new Date(), context: 'periodic' as const },
      { userId: 'user2', score: 8, category: 'passive' as const, timestamp: new Date(), context: 'periodic' as const },
      { userId: 'user3', score: 6, category: 'detractor' as const, timestamp: new Date(), context: 'periodic' as const },
    ]

    const mockCSAT = [
      { userId: 'user1', score: 5, feature: 'tts', timestamp: new Date() },
      { userId: 'user2', score: 4, feature: 'render', timestamp: new Date() },
    ]

    const mockQualitative = [
      {
        userId: 'user1',
        type: 'feature_request' as const,
        title: 'Add more TTS voices',
        description: 'Would love more voice options',
        priority: 'medium' as const,
        status: 'new' as const,
        votes: 5,
        timestamp: new Date(),
        tags: ['tts', 'voices'],
      },
    ]

    const analysis = FeedbackCollector.analyzeFeedback(
      mockNPS,
      mockCSAT,
      mockQualitative
    )

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
