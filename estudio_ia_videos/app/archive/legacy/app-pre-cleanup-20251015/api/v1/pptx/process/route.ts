
import { NextRequest, NextResponse } from "next/server"
import { S3StorageService } from "@/lib/s3-storage"
import { PPTXProcessor } from "@/lib/pptx/pptx-processor"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check authentication (simplified for now)
    // const session = await getServerSession()
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { cloud_storage_path, project_id } = await request.json()
    
    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'Cloud storage path required' }, { status: 400 })
    }

    // Check if file exists in S3
    const fileExists = await S3StorageService.fileExists(cloud_storage_path)
    if (!fileExists) {
      return NextResponse.json({ error: 'File not found in S3' }, { status: 404 })
    }

    // Download file from S3
    const downloadResult = await S3StorageService.downloadFile(cloud_storage_path)
    
    if (!downloadResult.success || !downloadResult.buffer) {
      return NextResponse.json({ error: 'Failed to download file from S3' }, { status: 500 })
    }
    
    // Extract filename from path
    const filename = cloud_storage_path.split('/').pop() || 'presentation.pptx'

    // Process PPTX content using new PPTXProcessor
    const processingOptions = {
      extractImages: true,
      detectLayouts: true,
      estimateDurations: true,
      uploadToS3: true,
      generateThumbnails: true,
      maxImageSize: 1920,
      imageQuality: 85
    }

    const processingResult = await PPTXProcessor.processFile(downloadResult.buffer, filename, processingOptions)

    // Store processing result in database
    let project = null
    if (project_id) {
      try {
        // Update existing project
        project = await prisma.project.update({
          where: { id: project_id },
          data: {
            status: 'COMPLETED',
            pptxMetadata: processingResult.metadata,
            pptxAssets: processingResult.assets,
            pptxTimeline: processingResult.timeline,
            pptxStats: processingResult.stats,
            imagesExtracted: processingResult.assets?.images?.length || 0,
            processingTime: processingResult.metadata?.processingTime || 0,
            totalSlides: processingResult.slides?.length || 0,
            updatedAt: new Date()
          }
        })

        // Save individual slides to database
        if (processingResult.slides && processingResult.slides.length > 0) {
          for (const slide of processingResult.slides) {
            await prisma.slide.create({
              data: {
                projectId: project_id,
                slideNumber: slide.slideNumber,
                title: slide.title || '',
                content: slide.content || '',
                extractedText: slide.extractedText || '',
                slideNotes: slide.notes || '',
                slideLayout: slide.layoutResult || null,
                slideImages: slide.images || [],
                slideElements: slide.elements || null,
                slideMetrics: slide.metrics || null,
                duration: slide.estimatedDuration || 5.0
              }
            })
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Continue processing even if database save fails
      }
    }

    // Generate thumbnail URL from first image if available
    let thumbnailUrl = null
    if (processingResult.assets?.images && processingResult.assets.images.length > 0) {
      thumbnailUrl = processingResult.assets.images[0].url
    }
    
    return NextResponse.json({
      success: true,
      data: {
        cloud_storage_path,
        processing: processingResult,
        project_id,
        thumbnail_url: thumbnailUrl,
        processedAt: new Date().toISOString(),
        userId: 'user_temp', // session.user?.id
        stats: {
          slides_count: processingResult.slides?.length || 0,
          images_extracted: processingResult.assets?.images?.length || 0,
          total_duration: processingResult.metadata?.totalDuration || 0,
          processing_time: processingResult.metadata?.processingTime || 0
        }
      }
    })

  } catch (error) {
    console.error('Processing API Error:', error)
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
    const cloud_storage_path = searchParams.get('path')
    
    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 })
    }

    // Check processing status
    // In a real implementation, you would track processing status in database
    return NextResponse.json({
      cloud_storage_path,
      status: 'completed',
      progress: 100,
      message: 'Processing completed successfully'
    })

  } catch (error) {
    console.error('Status API Error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
