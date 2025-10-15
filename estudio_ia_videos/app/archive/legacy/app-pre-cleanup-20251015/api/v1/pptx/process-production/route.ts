

import { NextRequest, NextResponse } from "next/server"
import { downloadFile } from "@/lib/s3"
import { parseEnhancedPPTX } from "@/lib/pptx-enhanced-parser"
import { getServerSession } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication (simplified for now)
    // const session = await getServerSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { s3Key, jobId } = await request.json()
    
    if (!s3Key) {
      return NextResponse.json({ error: 'S3 key required' }, { status: 400 })
    }

    console.log('🔄 Starting PPTX processing:', { s3Key, jobId })

    // Download file from S3 (already returns Buffer)
    const buffer = await downloadFile(s3Key)
    
    // Extract filename from path
    const fileName = s3Key.split('/').pop() || 'presentation.pptx'

    // Process PPTX content using enhanced parser
    console.log('📄 Parsing PPTX content...')
    const processingResult = await parseEnhancedPPTX(buffer, fileName)

    console.log('✅ PPTX processing complete:', {
      slides: processingResult.slides?.length || 0,
      duration: processingResult.totalDuration || 0
    })

    // Return result in the format expected by the component
    return NextResponse.json({
      success: true,
      data: {
        jobId,
        s3Key,
        slides: processingResult.slides || [],
        totalDuration: processingResult.totalDuration || 0,
        processing: processingResult,
        processedAt: new Date().toISOString(),
        userId: 'user_temp' // session.user?.id
      }
    })

  } catch (error) {
    console.error('Processing Production API Error:', error)
    return NextResponse.json({ 
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get processing status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const s3Key = searchParams.get('s3Key')
    
    if (!jobId && !s3Key) {
      return NextResponse.json({ error: 'Job ID or S3 key required' }, { status: 400 })
    }

    // In a real implementation, you would track processing status in database
    // For now, return completed status
    return NextResponse.json({
      jobId,
      s3Key,
      status: 'completed',
      progress: 100,
      message: 'Processing completed successfully'
    })

  } catch (error) {
    console.error('Status API Error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}

