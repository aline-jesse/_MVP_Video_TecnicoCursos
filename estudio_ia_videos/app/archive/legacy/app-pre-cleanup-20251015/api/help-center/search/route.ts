
import { NextRequest, NextResponse } from 'next/server'


import { HelpCenterAI } from '@/lib/support/help-center-ai'




// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    const articles = HelpCenterAI.searchArticles(query, limit)

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length,
    })
  } catch (error) {
    console.error('Error searching articles:', error)
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    )
  }
}
