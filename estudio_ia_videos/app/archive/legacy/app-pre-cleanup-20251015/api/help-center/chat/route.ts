
import { NextRequest, NextResponse } from 'next/server'
import { HelpCenterAI } from '@/lib/support/help-center-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const response = await HelpCenterAI.generateChatResponse(
      message,
      conversationHistory || []
    )

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    console.error('Error generating chat response:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
