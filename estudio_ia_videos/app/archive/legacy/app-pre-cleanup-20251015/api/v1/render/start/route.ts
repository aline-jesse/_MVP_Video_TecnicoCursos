
/**
 * 🎬 API de Renderização - Iniciar Geração de Vídeo
 * POST /api/v1/render/start
 */

import { NextRequest, NextResponse } from 'next/server'
import { videoRenderer } from '@/lib/video-renderer'
import { synthesizeToFile } from '@/lib/tts-service'


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const { projectId, timeline, options, generateTTS: shouldGenerateTTS } = await request.json()

    // Validar dados de entrada
    if (!projectId || !timeline || !options) {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes' },
        { status: 400 }
      )
    }

    // Gerar TTS se solicitado
    if (shouldGenerateTTS) {
      console.log('Gerando TTS para todas as cenas...')
      
      const ttsRequests = timeline.scenes
        .filter((scene: any) => scene.narrationText)
        .map((scene: any) => ({
          text: scene.narrationText,
          voiceId: scene.selectedVoice || 'pt-BR-Neural2-A',
          speed: scene.narrationSpeed || 1.0,
          pitch: scene.narrationPitch || 0,
          volume: scene.narrationVolume || 0
        }))

      if (ttsRequests.length > 0) {
        // Gerar TTS real/simulado e salvar em public/tts
        const ttsResponses = [] as Array<{ audioUrl: string; duration: number }>
        for (const req of ttsRequests) {
          const result = await synthesizeToFile({
            text: req.text,
            voiceId: req.voiceId,
            speed: req.speed,
            pitch: req.pitch,
            volume: req.volume,
          })
          ttsResponses.push({ audioUrl: result.fileUrl, duration: result.duration })
        }
        
        // Atualizar timeline com URLs de áudio
        let idx = 0
        timeline.scenes.forEach((scene: any) => {
          if (scene.narrationText && ttsResponses[idx]) {
            scene.audio = {
              ...scene.audio,
              narration: ttsResponses[idx].audioUrl,
              narrationDuration: ttsResponses[idx].duration
            }
            idx++
          }
        })
      }
    }

    // Iniciar renderização
    const jobId = await videoRenderer.startRender(projectId, timeline, options)

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Renderização iniciada com sucesso',
      estimatedTime: Math.ceil(timeline.totalDuration * 0.5), // 50% do tempo do vídeo
      data: {
        projectId,
        status: 'pending',
        progress: 0,
        timeline: {
          totalDuration: timeline.totalDuration,
          scenesCount: timeline.scenes.length,
          hasNarration: timeline.scenes.some((s: any) => s.narrationText),
          hasMusic: timeline.scenes.some((s: any) => s.audio?.backgroundMusic)
        }
      }
    })

  } catch (error) {
    console.error('Render Start Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao iniciar renderização',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  try {
    const jobs = videoRenderer.getAllJobs(projectId || undefined)
    
    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => ({
        id: job.id,
        projectId: job.projectId,
        status: job.status,
        progress: job.progress,
        outputUrl: job.outputUrl,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        timeline: {
          totalDuration: job.timeline.totalDuration,
          scenesCount: job.timeline.scenes.length
        }
      }))
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar jobs de renderização' },
      { status: 500 }
    )
  }
}
