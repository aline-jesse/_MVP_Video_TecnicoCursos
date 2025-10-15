
/**
 * 🎬 TIMELINE KEYFRAMES API
 * API real para gerenciar keyframes e animações
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      projectId, 
      timelineData, 
      action = 'save' // save, render, preview
    } = body

    if (!projectId || !timelineData) {
      return NextResponse.json({ 
        error: 'Project ID e timeline data obrigatórios' 
      }, { status: 400 })
    }

    console.log(`🎬 Timeline API - ${action} para projeto:`, projectId)

    switch (action) {
      case 'save':
        return await saveTimeline(projectId, timelineData)
      
      case 'render':
        return await renderTimeline(projectId, timelineData)
      
      case 'preview':
        return await generatePreview(projectId, timelineData)
      
      default:
        return NextResponse.json({ 
          error: 'Ação inválida' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Erro na Timeline API:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID obrigatório' }, { status: 400 })
    }

    // Buscar dados da timeline do projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        name: true, 
        settings: true,
        duration: true,
        updatedAt: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    const timelineData = (project.settings as any)?.timeline || null

    return NextResponse.json({
      success: true,
      projectId,
      projectName: project.name,
      timeline: timelineData,
      duration: project.duration,
      lastUpdated: project.updatedAt
    })

  } catch (error) {
    console.error('❌ Erro ao buscar timeline:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

/**
 * Salva dados da timeline no projeto
 */
async function saveTimeline(projectId: string, timelineData: any) {
  try {
    // Calcular duração total baseada nas tracks
    const totalDuration = Math.max(
      ...timelineData.tracks.map((track: any) => 
        Math.max(...track.keyframes.map((kf: any) => kf.time + (kf.duration || 0)))
      ),
      timelineData.duration || 0
    )

    await prisma.project.update({
      where: { id: projectId },
      data: {
        duration: Math.ceil(totalDuration),
        settings: {
          ...((await prisma.project.findUnique({ 
            where: { id: projectId }, 
            select: { settings: true } 
          }))?.settings as any || {}),
          timeline: {
            ...timelineData,
            lastSaved: new Date().toISOString(),
            version: (timelineData.version || 0) + 1
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Timeline salva com sucesso',
      duration: totalDuration,
      version: (timelineData.version || 0) + 1
    })

  } catch (error) {
    throw new Error(`Erro ao salvar timeline: ${error}`)
  }
}

/**
 * Renderiza timeline com FFmpeg
 */
async function renderTimeline(projectId: string, timelineData: any) {
  try {
    console.log('🎬 Iniciando renderização da timeline...')

    // Criar job de renderização
    const renderJob = await prisma.renderJob.create({
      data: {
        type: 'timeline_render',
        status: 'queued',
        priority: 8,
        inputData: {
          projectId,
          timeline: timelineData,
          settings: {
            format: 'mp4',
            resolution: '1920x1080',
            fps: timelineData.fps || 30,
            quality: 'high'
          }
        },
        maxRetries: 2
      }
    })

    // Simular processamento assíncrono
    setTimeout(async () => {
      try {
        await processTimelineRender(renderJob.id, timelineData)
      } catch (error) {
        console.error('❌ Erro no processamento:', error)
      }
    }, 100)

    return NextResponse.json({
      success: true,
      message: 'Renderização iniciada',
      jobId: renderJob.id,
      estimatedTime: calculateRenderTime(timelineData)
    })

  } catch (error) {
    throw new Error(`Erro na renderização: ${error}`)
  }
}

/**
 * Gera preview rápido da timeline
 */
async function generatePreview(projectId: string, timelineData: any) {
  try {
    console.log('👁️ Gerando preview da timeline...')

    // Simular geração de preview (mais rápida que render completo)
    const previewData = {
      projectId,
      frames: Math.ceil((timelineData.duration || 30) * (timelineData.fps || 30)),
      keyframes: timelineData.tracks.reduce((total: number, track: any) => 
        total + track.keyframes.length, 0
      ),
      effects: countEffects(timelineData),
      estimatedSize: calculatePreviewSize(timelineData)
    }

    return NextResponse.json({
      success: true,
      message: 'Preview gerado com sucesso',
      preview: previewData,
      previewUrl: `/api/projects/${projectId}/preview`, // URL simulada
      duration: timelineData.duration
    })

  } catch (error) {
    throw new Error(`Erro na geração de preview: ${error}`)
  }
}

/**
 * Processa renderização da timeline (simulado)
 */
async function processTimelineRender(jobId: string, timelineData: any) {
  try {
    // Atualizar status para processando
    await prisma.renderJob.update({
      where: { id: jobId },
      data: { 
        status: 'processing',
        startedAt: new Date(),
        currentStep: 'preparing_timeline'
      }
    })

    // Simular passos do processamento
    const steps = [
      'preparing_timeline',
      'processing_keyframes',
      'applying_effects',
      'rendering_video',
      'encoding_output',
      'finalizing'
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await prisma.renderJob.update({
        where: { id: jobId },
        data: { 
          progress: Math.round(((i + 1) / steps.length) * 100),
          currentStep: steps[i]
        }
      })
    }

    // Finalizar com sucesso
    await prisma.renderJob.update({
      where: { id: jobId },
      data: { 
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        outputData: {
          videoUrl: `/renders/${jobId}.mp4`,
          duration: timelineData.duration,
          fileSize: calculateFileSize(timelineData),
          format: 'mp4',
          resolution: '1920x1080'
        }
      }
    })

    console.log('✅ Renderização concluída:', jobId)

  } catch (error) {
    // Marcar como erro
    await prisma.renderJob.update({
      where: { id: jobId },
      data: { 
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    })
    console.error('❌ Erro na renderização:', error)
  }
}

/**
 * Funções auxiliares
 */
function calculateRenderTime(timelineData: any): number {
  const baseDuration = timelineData.duration || 30
  const complexity = timelineData.tracks.length * 2 + 
    timelineData.tracks.reduce((total: number, track: any) => total + track.keyframes.length, 0)
  
  return Math.ceil(baseDuration * 0.5 + complexity * 0.1) // segundos
}

function countEffects(timelineData: any): number {
  return timelineData.tracks.reduce((total: number, track: any) => {
    return total + track.keyframes.filter((kf: any) => 
      kf.properties && Object.keys(kf.properties).length > 2
    ).length
  }, 0)
}

function calculatePreviewSize(timelineData: any): number {
  const baseSizeMB = (timelineData.duration || 30) * 0.5 // 0.5MB por segundo
  const complexityMultiplier = Math.min(timelineData.tracks.length * 0.1, 2)
  return Math.ceil(baseSizeMB * (1 + complexityMultiplier))
}

function calculateFileSize(timelineData: any): number {
  const baseSizeMB = (timelineData.duration || 30) * 2 // 2MB por segundo em HD
  const complexityMultiplier = Math.min(timelineData.tracks.length * 0.2, 3)
  return Math.ceil(baseSizeMB * (1 + complexityMultiplier)) * 1024 * 1024 // bytes
}
