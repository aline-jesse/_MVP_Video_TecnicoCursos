
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth/api-auth'
import { processFileUpload } from '@/lib/file-upload/file-processor'
import { prisma } from '@/lib/database/prisma'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'image'
    const purpose = formData.get('purpose') as string || 'project_source'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = {
      pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/mp4'],
      video: ['video/mp4', 'video/webm', 'video/mov']
    }

    const validTypes = allowedTypes[type as keyof typeof allowedTypes] || []
    if (validTypes.length > 0 && !validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process upload
    const processedFile = await processFileUpload({
      userId: session.user.id,
      originalName: file.name,
      buffer,
      mimeType: file.type,
      type: type as any,
      purpose: purpose as any
    })

    return NextResponse.json({
      file: processedFile,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const purpose = searchParams.get('purpose')

    const whereCondition: any = {
      userId: session.user.id
    }

    if (type) whereCondition.type = type
    if (purpose) whereCondition.purpose = purpose

    const files = await prisma.fileUpload.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
