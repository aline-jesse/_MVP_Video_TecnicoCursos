
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { slideNumber: string } }
) {
  try {
    const slideNumber = parseInt(params.slideNumber)
    
    if (isNaN(slideNumber) || slideNumber < 1) {
      return NextResponse.json({ error: 'Invalid slide number' }, { status: 400 })
    }

    // In a real implementation, this would generate actual preview images
    // For now, return a placeholder response
    return NextResponse.json({
      slideNumber,
      previewUrl: `/images/slide-preview-${slideNumber}.png`,
      thumbnail: `/images/slide-thumb-${slideNumber}.png`,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Preview API Error:', error)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}
