

/**
 * Production PPTX Upload API
 * Real S3 integration with database persistence
 */

import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToS3, validateFile } from '@/lib/aws-s3-config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }
    
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    console.log('📤 Starting PPTX upload:', file.name)
    
    // Upload to S3
    const s3Key = await uploadFileToS3(file, file.name)
    
    console.log('✅ S3 upload successful:', s3Key)
    
    // Create project in database
    const project = await prisma.project.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        originalFileName: file.name,
        pptxUrl: s3Key,
        status: 'PROCESSING',
        type: 'pptx',
        userId: 'anonymous', // In production, get from session
        processingLog: {
          uploadedAt: new Date().toISOString(),
          s3Key: s3Key,
          fileSize: file.size,
          status: 'uploaded'
        }
      }
    })
    
    console.log('✅ Project created in database:', project.id)
    
    // Create processing job
    const processingJob = {
      id: crypto.randomUUID(),
      projectId: project.id,
      s3Key,
      fileName: file.name,
      fileSize: file.size,
      status: 'uploaded',
      createdAt: new Date().toISOString()
    }
    
    // Return upload success with project ID
    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status
      },
      job: processingJob,
      message: 'Upload realizado com sucesso - iniciando processamento...'
    })
    
  } catch (error) {
    console.error('Upload API Error:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Get upload status endpoint
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID obrigatório' },
      { status: 400 }
    )
  }
  
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        status: true,
        processingLog: true,
        slidesData: true,
        totalSlides: true
      }
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        totalSlides: project.totalSlides,
        hasData: !!project.slidesData,
        processingLog: project.processingLog
      }
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}
