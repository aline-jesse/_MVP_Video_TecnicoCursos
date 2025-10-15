
// 🎬 PPTX Processing Engine API
// Advanced content extraction and scene generation

import { NextRequest, NextResponse } from 'next/server'
import { processFromBuffer } from '@/lib/pptx-processor'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const options = JSON.parse(formData.get('options') as string || '{}')
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided for processing' },
        { status: 400 }
      )
    }
    
    // Initialize processor
    // Using processPPTX function directly
    
    // Process file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const processingResult = await processFromBuffer(buffer, file.name)
    
    if (!processingResult) {
      return NextResponse.json(
        { error: 'Erro no processamento do arquivo' },
        { status: 500 }
      )
    }
    
    // Generate video scenes from slides
    // Generate video scenes from slides
    const videoScenes = processingResult.slides.map((slide: any, index: number) => ({
      id: `scene-${index}`,
      slideId: slide.id,
      title: slide.title,
      content: slide.content,
      duration: 8,
      order: index
    }))
    
    // Advanced processing options
    const processingOptions = {
      extractImages: options.extractImages !== false,
      generateNarration: options.generateNarration !== false,
      optimizeForMobile: options.optimizeForMobile || false,
      qualityLevel: options.qualityLevel || 'high', // low, medium, high, ultra
      avatarStyle: options.avatarStyle || 'hyperreal'
    }
    
    // Generate project structure
    const projectStructure = {
      id: `project-${Date.now()}`,
      fileName: file.name,
      metadata: { name: processingResult.metadata.title, duration: processingResult.timeline.totalDuration },
      slides: processingResult.slides,
      videoScenes,
      processingOptions,
      timeline: {
        totalDuration: videoScenes.reduce((acc: number, scene: any) => acc + scene.duration, 0),
        sceneCount: videoScenes.length,
        estimatedRenderTime: Math.ceil(videoScenes.length * 2.5), // 2.5s per scene
        outputFormat: '1080p60',
        audioTrack: 'tts-generated'
      },
      assets: {
        extracted: processingResult.slides?.length || 0,
        optimized: 0,
        cached: false
      },
      status: 'ready_for_editing',
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      message: 'PPTX processed successfully',
      data: projectStructure
    })
    
  } catch (error) {
    console.error('Processing Engine Error:', error)
    return NextResponse.json(
      {
        error: 'Processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 🔍 GET - Get processing status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }
    
    // Simulate processing status check
    const statusData = {
      projectId,
      status: 'completed',
      progress: 100,
      currentStep: 'Scene generation complete',
      steps: [
        { name: 'File upload', status: 'completed', duration: '2s' },
        { name: 'Content extraction', status: 'completed', duration: '5s' },
        { name: 'Slide parsing', status: 'completed', duration: '8s' },
        { name: 'Scene generation', status: 'completed', duration: '3s' },
        { name: 'Timeline creation', status: 'completed', duration: '2s' }
      ],
      results: {
        slidesExtracted: Math.floor(Math.random() * 40) + 15,
        scenesGenerated: Math.floor(Math.random() * 40) + 15,
        assetsFound: Math.floor(Math.random() * 15) + 5,
        estimatedDuration: `${Math.floor(Math.random() * 5) + 3}min`,
        readyForEditing: true
      }
    }
    
    return NextResponse.json({
      success: true,
      data: statusData
    })
    
  } catch (error) {
    console.error('Status Check Error:', error)
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    )
  }
}
