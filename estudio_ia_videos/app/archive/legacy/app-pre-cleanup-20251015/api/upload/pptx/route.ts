

import { NextRequest, NextResponse } from 'next/server'
import { PPTXParser } from '@/lib/pptx/parser'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return NextResponse.json(
        { success: false, error: 'Only PPTX files are supported' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Parse PPTX
    const parser = new PPTXParser()
    const pptxData = await parser.parsePPTX(buffer)
    const slides = pptxData.slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      content: slide.content.join('\n'),
      duration: 15 // Duração padrão
    }))

    return NextResponse.json({
      success: true,
      slides,
      message: `Successfully parsed ${slides.length} slides`,
      fileName: file.name,
      fileSize: file.size
    })

  } catch (error) {
    console.error('PPTX upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

