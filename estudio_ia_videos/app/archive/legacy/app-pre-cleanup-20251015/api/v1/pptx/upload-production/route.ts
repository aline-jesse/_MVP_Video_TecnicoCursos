

import { NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/s3"
import { UPLOAD_CONFIG } from "@/lib/aws-config"
import { getServerSession } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication (simplified for now)
    // const session = await getServerSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!UPLOAD_CONFIG.allowedTypes.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed: .pptx, .ppt, .pdf' 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size: ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    const cloud_storage_path = await uploadFile(buffer, file.name, file.type)
    
    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Return upload result in the format expected by the component
    return NextResponse.json({
      success: true,
      job: {
        id: jobId,
        s3Key: cloud_storage_path,
        status: 'uploaded',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        userId: 'user_temp' // session.user?.id
      },
      data: {
        cloud_storage_path,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Upload Production API Error:', error)
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

