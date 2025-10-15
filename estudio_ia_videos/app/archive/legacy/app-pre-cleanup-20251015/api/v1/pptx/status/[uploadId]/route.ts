
import { NextRequest, NextResponse } from 'next/server'

// In a real implementation, you would use Redis or a database to track upload status
const uploadStatus = new Map<string, any>()

export async function GET(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  try {
    const { uploadId } = params
    
    // Get status from storage (Redis, DB, etc.)
    const status = uploadStatus.get(uploadId) || {
      id: uploadId,
      status: 'completed', // Default to completed for demo
      progress: 100,
      stage: 'processing_complete',
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('Status check error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Status check failed'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  try {
    const { uploadId } = params
    const updates = await request.json()
    
    // Update status in storage
    const currentStatus = uploadStatus.get(uploadId) || {}
    const newStatus = {
      ...currentStatus,
      ...updates,
      id: uploadId,
      updatedAt: new Date().toISOString()
    }
    
    uploadStatus.set(uploadId, newStatus)
    
    return NextResponse.json(newStatus)

  } catch (error) {
    console.error('Status update error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Status update failed'
    }, { status: 500 })
  }
}
