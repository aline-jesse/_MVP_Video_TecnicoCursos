/**
 * 🚀 PPTX Upload API
 * Recebe arquivos de apresentação, salva em disco (ou S3 futuramente),
 * extrai metadados reais e inicializa um projeto completo no banco.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { randomUUID } from 'crypto'
import path from 'path'
import { promises as fs } from 'fs'
import { authConfig } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { PPTXProcessor } from '@/lib/pptx/pptx-processor'
import { PPTXParser } from '@/lib/pptx/parser'

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB
const ALLOWED_EXTENSIONS = ['.pptx', '.ppt', '.odp']
const DEMO_EMAIL = 'demo@estudio-ia.com'

type UploadError = {
  code: string
  message: string
  status: number
}

function buildErrorResponse(error: UploadError) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    },
    { status: error.status }
  )
}

async function ensureDemoUser() {
  const existingDemo = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL }
  })

  if (existingDemo) {
    return existingDemo
  }

  return prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: 'Usuário Demo'
    }
  })
}

function sanitizeFileName(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^\w.\- ]/g, '_')
    .replace(/\s+/g, '_')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob | File | null

    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      return buildErrorResponse({
        code: 'NO_FILE',
        message: 'Nenhum arquivo foi enviado.',
        status: 400
      })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileSize = 'size' in file ? Number(file.size) : buffer.length

    if (fileSize === 0) {
      return buildErrorResponse({
        code: 'EMPTY_FILE',
        message: 'O arquivo enviado está vazio.',
        status: 400
      })
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return buildErrorResponse({
        code: 'FILE_TOO_LARGE',
        message: `O arquivo excede o limite de ${(MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB.`,
        status: 413
      })
    }

    const originalFileName =
      (file as File).name || (formData.get('fileName') as string | null) || 'presentation.pptx'
    const extension = path.extname(originalFileName).toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return buildErrorResponse({
        code: 'INVALID_EXTENSION',
        message: 'Formato não suportado. Utilize arquivos PPTX, PPT ou ODP.',
        status: 415
      })
    }

    let session: Awaited<ReturnType<typeof getServerSession>> | null = null
    try {
      session = await getServerSession(authConfig)
    } catch (sessionError) {
      console.warn('getServerSession unavailable, continuing without session:', sessionError)
    }

    let userId = session?.user?.id ?? (formData.get('userId') as string | null) ?? undefined

    let userRecord = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null

    if (!userRecord) {
      userRecord = await ensureDemoUser()
      userId = userRecord.id
    }

    const pptxProcessor = new PPTXProcessor().setUserContext(userId ?? null)
    let parsed: {
      slides: Awaited<ReturnType<PPTXProcessor['parse']>>['slides']
      metadata: Awaited<ReturnType<PPTXProcessor['parse']>>['metadata']
    }

    try {
      parsed = await pptxProcessor.parse(buffer)
    } catch (primaryError) {
      console.warn('PPTXProcessor parse failed, falling back to legacy parser:', primaryError)
      const legacyParser = new PPTXParser()
      const legacyResult = await legacyParser.parsePPTX(buffer)

      parsed = {
        slides: legacyResult.slides.map((slide, index) => {
          const textElements =
            slide.content?.map((text, idx) => ({
              id: `${slide.id}-text-${idx}`,
              type: 'text' as const,
              content: text,
              position: {
                x: 0,
                y: idx * 48,
                width: 1920,
                height: 200
              }
            })) ?? []

          return {
            number: slide.order ?? index + 1,
            elements: textElements,
            background: {
              type: 'solid' as const,
              color: '#ffffff'
            },
            layout: slide.layout ?? 'default',
            notes: slide.notes,
            duration: 5000,
            transition: undefined
          }
        }),
        metadata: {
          title: legacyResult.metadata.title ?? '',
          author: legacyResult.metadata.author ?? '',
          totalSlides: legacyResult.metadata.slideCount ?? legacyResult.slides.length,
          createdDate: normalizeDate(legacyResult.metadata.created),
          modifiedDate: normalizeDate(legacyResult.metadata.modified),
          company: undefined,
          description: undefined,
          keywords: undefined,
          category: undefined,
          status: undefined,
          revision: undefined
        }
      }
    }

    const safeFileName = `${Date.now()}-${sanitizeFileName(originalFileName)}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pptx')
    await fs.mkdir(uploadDir, { recursive: true })

    const storedFilePath = path.join(uploadDir, safeFileName)
    await fs.writeFile(storedFilePath, buffer)

    const publicUrl = `/uploads/pptx/${safeFileName}`.replace(/\\/g, '/')

    const projectId = randomUUID()
    const projectName =
      (formData.get('projectName') as string | null) ??
      path.parse(originalFileName).name ??
      'Projeto PPTX'

    const now = new Date()

    await prisma.project.create({
      data: {
        id: projectId,
        name: projectName,
        type: 'pptx',
        status: 'PROCESSING',
        userId,
        originalFileName,
        pptxUrl: publicUrl,
        totalSlides: parsed.slides.length,
        pptxMetadata: parsed.metadata as any,
        slidesData: {
          extractedAt: now.toISOString(),
          metadata: parsed.metadata,
          slides: parsed.slides
        },
        processingLog: {
          stage: 'uploaded',
          storedAt: now.toISOString(),
          fileName: safeFileName,
          fileSize
        }
      }
    })

    const slidePromises = parsed.slides.map(async slide => {
      const textElements = slide.elements
        .filter(element => element.type === 'text' && element.content)
        .map(element => element.content?.trim())
        .filter(Boolean) as string[]

      const images = slide.elements.filter(element => element.type === 'image')

      const rawText = textElements.join('\n')
      const title = textElements[0] || `Slide ${slide.number}`
      const durationSeconds = Math.max(1, Math.round((slide.duration ?? 5000) / 1000))

      await prisma.slide.create({
        data: {
          projectId,
          title,
          content: rawText || title,
          slideNumber: slide.number,
          extractedText: rawText || null,
          slideNotes: slide.notes ?? null,
          slideLayout: slide.layout ? { name: slide.layout } : null,
          slideImages: images.length ? images : null,
          slideElements: slide.elements,
          slideMetrics: {
            textBlocks: textElements.length,
            imageCount: images.length,
            hasNotes: Boolean(slide.notes)
          },
          backgroundType: slide.background.type,
          backgroundColor: slide.background.color ?? null,
          backgroundImage: slide.background.image?.src ?? null,
          duration: durationSeconds,
          transition: slide.transition?.type ?? 'fade',
          audioText: rawText || title,
          elements: slide.elements
        }
      })
    })

    await Promise.all(slidePromises)

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'COMPLETED',
        processingLog: {
          stage: 'parsed',
          completedAt: new Date().toISOString(),
          fileName: safeFileName,
          fileSize,
          totalSlides: parsed.slides.length
        },
        imagesExtracted: parsed.slides.reduce(
          (total, slide) =>
            total + slide.elements.filter(element => element.type === 'image').length,
          0
        ),
        processingTime: 0,
        phase: 'UPLOAD_COMPLETED'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        projectName,
        totalSlides: parsed.slides.length,
        pptxUrl: publicUrl,
        metadata: parsed.metadata,
        createdAt: now.toISOString()
      }
    })
  } catch (error) {
    console.error('PPTX upload error:', error)

    return buildErrorResponse({
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Erro interno ao processar o PPTX.',
      status: 500
    })
  }
}
function normalizeDate(value: Date | string | undefined | null) {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}
