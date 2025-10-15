
// Processador de Vídeo Avançado
import { SlideData, VideoConfig } from './ai-services'
import { TTSService, TTSResult } from './tts-service'
import { AvatarService, AvatarVideoResult } from './avatar-service'
import { Analytics } from './analytics'

export interface VideoScene {
  id: string
  type: 'slide' | 'intro' | 'transition' | 'outro'
  content: string
  duration: number
  avatarVideo?: AvatarVideoResult
  audioUrl?: string
  backgroundUrl?: string
  position: number
}

export interface RenderQuality {
  width: number
  height: number
  bitrate: string
  fps: number
  label: string
}

export interface RenderJob {
  id: string
  projectId: string
  scenes: VideoScene[]
  config: VideoConfig
  quality: RenderQuality
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  startedAt?: Date
  completedAt?: Date
  error?: string
  outputUrl?: string
  outputSize?: number
}

export class VideoProcessor {
  
  // Qualidades de render disponíveis
  static readonly QUALITY_PRESETS: Record<string, RenderQuality> = {
    preview: {
      width: 640,
      height: 360,
      bitrate: '500k',
      fps: 24,
      label: 'Preview (360p)'
    },
    sd: {
      width: 854,
      height: 480,
      bitrate: '1000k', 
      fps: 30,
      label: 'SD (480p)'
    },
    hd: {
      width: 1280,
      height: 720,
      bitrate: '2500k',
      fps: 30,
      label: 'HD (720p)'
    },
    fhd: {
      width: 1920,
      height: 1080,
      bitrate: '5000k',
      fps: 30,
      label: 'Full HD (1080p)'
    }
  }

  // Fila de renderização (simulada em memória para MVP)
  private static renderQueue: RenderJob[] = []
  private static isProcessing = false

  // Converter slides em cenas de vídeo
  static async convertSlidesToScenes(
    slides: SlideData[], 
    config: VideoConfig
  ): Promise<VideoScene[]> {
    const scenes: VideoScene[] = []
    
    // Adicionar cena de introdução se configurada
    if (config.intro) {
      scenes.push({
        id: `intro-${Date.now()}`,
        type: 'intro',
        content: config.intro,
        duration: 3000, // 3 segundos
        position: 0
      })
    }

    // Converter cada slide em cena
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      
      // Gerar áudio com TTS
      const ttsResult = await TTSService.processSlideWithTTS(
        slide.content,
        {
          language: config.language,
          voice: config.voiceModel,
          speed: config.speed || 1.0,
          pitch: config.pitch || 1.0
        }
      )

      // Gerar vídeo com avatar
      const avatarResult = await AvatarService.generateAvatarVideo({
        avatarId: config.avatarStyle,
        audioUrl: ttsResult.audioUrl,
        text: slide.content,
        background: config.background,
        duration: ttsResult.duration
      })

      scenes.push({
        id: slide.id,
        type: 'slide',
        content: slide.content,
        duration: ttsResult.duration,
        avatarVideo: avatarResult,
        audioUrl: ttsResult.audioUrl,
        backgroundUrl: slide.imageUrl,
        position: i + 1
      })

      // Adicionar transição entre slides (exceto último)
      if (i < slides.length - 1) {
        scenes.push({
          id: `transition-${i}`,
          type: 'transition',
          content: '',
          duration: 500, // 0.5 segundos
          position: i + 1.5
        })
      }
    }

    // Adicionar cena de encerramento se configurada
    if (config.outro) {
      scenes.push({
        id: `outro-${Date.now()}`,
        type: 'outro', 
        content: config.outro,
        duration: 3000, // 3 segundos
        position: scenes.length + 1
      })
    }

    return scenes
  }

  // Gerar preview rápido (baixa qualidade)
  static async generatePreview(
    scenes: VideoScene[],
    projectId: string
  ): Promise<RenderJob> {
    const startTime = Date.now()
    Analytics.videoPreviewStarted(projectId, scenes.length)

    const job: RenderJob = {
      id: `preview-${Date.now()}`,
      projectId,
      scenes,
      config: {} as VideoConfig,
      quality: this.QUALITY_PRESETS.preview,
      status: 'processing',
      progress: 0,
      startedAt: new Date()
    }

    try {
      // Simular processamento rápido para preview
      await this.simulatePreviewGeneration(job)
      
      job.status = 'completed'
      job.completedAt = new Date()
      job.progress = 100
      job.outputUrl = `/api/videos/preview/${job.id}.mp4`
      job.outputSize = Math.random() * 10 * 1024 * 1024 // 1-10MB simulado

      const duration = Date.now() - startTime
      Analytics.videoPreviewCompleted(projectId, duration)

      return job
    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Preview generation failed'
      throw error
    }
  }

  // Gerar vídeo final (alta qualidade)
  static async generateFinalVideo(
    scenes: VideoScene[],
    projectId: string,
    quality: string = 'fhd'
  ): Promise<RenderJob> {
    const startTime = Date.now()
    Analytics.videoRenderStarted(projectId, quality, scenes.length)

    const job: RenderJob = {
      id: `final-${Date.now()}`,
      projectId,
      scenes,
      config: {} as VideoConfig,
      quality: this.QUALITY_PRESETS[quality],
      status: 'queued',
      progress: 0
    }

    // Adicionar à fila de renderização
    this.renderQueue.push(job)
    this.processRenderQueue()

    return job
  }

  // Processar fila de renderização
  private static async processRenderQueue() {
    if (this.isProcessing) return

    this.isProcessing = true

    while (this.renderQueue.length > 0) {
      const job = this.renderQueue.shift()!
      
      try {
        job.status = 'processing'
        job.startedAt = new Date()
        
        await this.simulateFinalRender(job)
        
        job.status = 'completed'
        job.completedAt = new Date()
        job.progress = 100
        job.outputUrl = `/api/videos/final/${job.id}.mp4`
        job.outputSize = Math.random() * 100 * 1024 * 1024 // 50-100MB simulado

        const duration = job.completedAt.getTime() - job.startedAt!.getTime()
        Analytics.videoRenderCompleted(job.projectId, duration, job.outputSize)

        // Notificar usuário (em produção seria WebSocket ou similar)
        console.log('Render completed:', job.id)
        
      } catch (error) {
        job.status = 'failed'
        job.error = error instanceof Error ? error.message : 'Render failed'
        
        const duration = Date.now() - job.startedAt!.getTime()
        Analytics.videoRenderFailed(job.projectId, job.error, duration)
      }
    }

    this.isProcessing = false
  }

  // Simular geração de preview (rápida)
  private static async simulatePreviewGeneration(job: RenderJob): Promise<void> {
    const totalSteps = 10
    
    for (let i = 0; i <= totalSteps; i++) {
      job.progress = (i / totalSteps) * 100
      
      // Simular delay de processamento (2-8 segundos total para preview)
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 600))
      
      if (i === 5) {
        console.log(`Preview generation 50% complete for ${job.id}`)
      }
    }
  }

  // Simular renderização final (lenta)
  private static async simulateFinalRender(job: RenderJob): Promise<void> {
    const totalSteps = 100
    const totalDuration = job.scenes.reduce((sum, scene) => sum + scene.duration, 0)
    const estimatedTime = Math.max(30000, totalDuration * 3) // Mínimo 30s, ou 3x duração do vídeo
    
    for (let i = 0; i <= totalSteps; i++) {
      job.progress = (i / totalSteps) * 100
      
      // Delay proporcional ao tempo estimado
      await new Promise(resolve => setTimeout(resolve, estimatedTime / totalSteps))
      
      // Log progress em marcos importantes
      if (i % 20 === 0) {
        console.log(`Final render ${job.progress}% complete for ${job.id}`)
      }
    }
  }

  // Obter status do job
  static getRenderJob(jobId: string): RenderJob | null {
    return this.renderQueue.find(job => job.id === jobId) || null
  }

  // Cancelar job de renderização
  static cancelRenderJob(jobId: string): boolean {
    const index = this.renderQueue.findIndex(job => job.id === jobId)
    if (index !== -1) {
      this.renderQueue.splice(index, 1)
      return true
    }
    return false
  }

  // Estimar tempo de renderização
  static estimateRenderTime(scenes: VideoScene[], quality: string): number {
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0)
    const qualityMultiplier = {
      preview: 0.1,
      sd: 1,
      hd: 2,
      fhd: 3
    }[quality] || 1

    return Math.ceil(totalDuration * qualityMultiplier * 2) // 2x fator de segurança
  }

  // Obter informações de uso da fila
  static getQueueStats() {
    const processing = this.renderQueue.filter(job => job.status === 'processing').length
    const queued = this.renderQueue.filter(job => job.status === 'queued').length
    const completed = this.renderQueue.filter(job => job.status === 'completed').length
    const failed = this.renderQueue.filter(job => job.status === 'failed').length

    return {
      processing,
      queued, 
      completed,
      failed,
      total: this.renderQueue.length
    }
  }
}
