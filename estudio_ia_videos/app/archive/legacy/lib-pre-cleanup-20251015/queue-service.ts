
/**
 * 🔄 Queue Service
 * Sistema de filas para processamento assíncrono em produção
 */

interface QueueJob {
  id: string
  type: 'talking-photo' | 'voice-clone' | 'batch-process'
  data: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
  attempts: number
  error?: string
  result?: any
  priority: number
}

interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  totalJobs: number
}

export class QueueService {
  private static jobs = new Map<string, QueueJob>()
  private static processingQueue: string[] = []
  private static readonly MAX_CONCURRENT = 5
  private static readonly MAX_RETRIES = 3
  private static isProcessing = false

  // Adicionar job à fila
  static async addJob(type: QueueJob['type'], data: any, priority: number = 0): Promise<string> {
    const jobId = this.generateJobId()
    
    const job: QueueJob = {
      id: jobId,
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      attempts: 0,
      priority
    }
    
    this.jobs.set(jobId, job)
    
    console.log(`📋 Job adicionado à fila: ${jobId} (${type})`)
    
    // Iniciar processamento se não estiver rodando
    if (!this.isProcessing) {
      this.startProcessing()
    }
    
    return jobId
  }

  // Obter status de um job
  static getJobStatus(jobId: string): QueueJob | null {
    return this.jobs.get(jobId) || null
  }

  // Iniciar processamento da fila
  private static async startProcessing(): Promise<void> {
    if (this.isProcessing) return
    
    this.isProcessing = true
    console.log('🚀 Iniciando processamento da fila...')
    
    while (this.hasPendingJobs() || this.processingQueue.length > 0) {
      // Processar jobs concorrentemente
      const availableSlots = this.MAX_CONCURRENT - this.processingQueue.length
      
      if (availableSlots > 0) {
        const pendingJobs = this.getPendingJobs(availableSlots)
        
        for (const job of pendingJobs) {
          this.processJobAsync(job)
        }
      }
      
      // Aguardar um pouco antes da próxima verificação
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    this.isProcessing = false
    console.log('✅ Processamento da fila finalizado')
  }

  // Processar job assincronamente
  private static async processJobAsync(job: QueueJob): Promise<void> {
    this.processingQueue.push(job.id)
    job.status = 'processing'
    job.updatedAt = new Date()
    job.attempts++
    
    console.log(`⚙️ Processando job: ${job.id} (tentativa ${job.attempts})`)
    
    try {
      const result = await this.executeJob(job)
      
      job.status = 'completed'
      job.result = result
      job.updatedAt = new Date()
      
      console.log(`✅ Job concluído: ${job.id}`)
      
    } catch (error) {
      console.error(`❌ Erro no job ${job.id}:`, error)
      
      job.error = error instanceof Error ? error.message : 'Erro desconhecido'
      job.updatedAt = new Date()
      
      if (job.attempts >= this.MAX_RETRIES) {
        job.status = 'failed'
        console.log(`💀 Job falhou definitivamente: ${job.id}`)
      } else {
        job.status = 'pending'
        console.log(`🔄 Job reagendado para retry: ${job.id}`)
      }
    } finally {
      // Remover da fila de processamento
      const index = this.processingQueue.indexOf(job.id)
      if (index > -1) {
        this.processingQueue.splice(index, 1)
      }
    }
  }

  // Executar job baseado no tipo
  private static async executeJob(job: QueueJob): Promise<any> {
    switch (job.type) {
      case 'talking-photo':
        return this.processTalkingPhotoJob(job)
      
      case 'voice-clone':
        return this.processVoiceCloneJob(job)
      
      case 'batch-process':
        return this.processBatchJob(job)
      
      default:
        throw new Error(`Tipo de job não suportado: ${job.type}`)
    }
  }

  // Processar job de talking photo
  private static async processTalkingPhotoJob(job: QueueJob): Promise<any> {
    console.log('🎬 Processando talking photo job...')
    
    const { text, avatarId, voiceSettings, videoOptions } = job.data
    
    // 1. Gerar áudio com Google TTS
    const { GoogleTTSService } = await import('./google-tts-service')
    
    const ttsConfig = {
      text,
      voice: voiceSettings?.voice || 'pt-BR-Neural2-A',
      language: voiceSettings?.language || 'pt-BR',
      speakingRate: voiceSettings?.speed || 1.0,
      pitch: voiceSettings?.pitch || 0.0
    }
    
    const audioResult = await GoogleTTSService.synthesizeSpeech(ttsConfig)
    
    if (!audioResult.success) {
      throw new Error('Falha na síntese de voz')
    }
    
    // 2. Processar vídeo talking head
    const { TalkingHeadProcessor } = await import('./talking-head-processor')
    
    const videoResult = await TalkingHeadProcessor.processVideo({
      avatarId,
      audioUrl: audioResult.audioUrl!,
      audioBuffer: audioResult.audioContent!,
      resolution: videoOptions?.resolution || '1080p',
      fps: videoOptions?.fps || 30
    })
    
    if (!videoResult.success) {
      throw new Error('Falha no processamento de vídeo')
    }
    
    return {
      audioUrl: audioResult.audioUrl,
      videoUrl: videoResult.videoUrl,
      thumbnailUrl: videoResult.thumbnailUrl,
      duration: audioResult.duration,
      metadata: {
        ttsVoice: ttsConfig.voice,
        videoResolution: videoOptions?.resolution || '1080p'
      }
    }
  }

  // Processar job de clonagem de voz
  private static async processVoiceCloneJob(job: QueueJob): Promise<any> {
    console.log('🔊 Processando voice clone job...')
    
    // TODO: Implementar clonagem de voz
    // Seria integração com ElevenLabs ou similar
    
    await new Promise(resolve => setTimeout(resolve, 5000)) // Simular processamento
    
    return {
      voiceId: `cloned_voice_${Date.now()}`,
      status: 'completed'
    }
  }

  // Processar job em lote
  private static async processBatchJob(job: QueueJob): Promise<any> {
    console.log('📦 Processando batch job...')
    
    const { items } = job.data
    const results = []
    
    for (const item of items) {
      const subJobId = await this.addJob('talking-photo', item, job.priority - 1)
      results.push({ itemId: item.id, jobId: subJobId })
    }
    
    return {
      batchId: job.id,
      subJobs: results,
      totalItems: items.length
    }
  }

  // Utilitários
  private static hasPendingJobs(): boolean {
    for (const job of this.jobs.values()) {
      if (job.status === 'pending') return true
    }
    return false
  }

  private static getPendingJobs(limit: number): QueueJob[] {
    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => b.priority - a.priority) // Prioridade maior primeiro
      .slice(0, limit)
    
    return pendingJobs
  }

  private static generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // APIs públicas para monitoramento
  static getQueueStats(): QueueStats {
    const jobs = Array.from(this.jobs.values())
    
    return {
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      totalJobs: jobs.length
    }
  }

  static getAllJobs(): QueueJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static clearCompletedJobs(): void {
    const completedJobs = Array.from(this.jobs.keys()).filter(id => {
      const job = this.jobs.get(id)
      return job && (job.status === 'completed' || job.status === 'failed')
    })
    
    completedJobs.forEach(id => this.jobs.delete(id))
    console.log(`🧹 ${completedJobs.length} jobs concluídos removidos da fila`)
  }

  // Cancelar job
  static cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    
    if (!job || job.status === 'processing') {
      return false
    }
    
    this.jobs.delete(jobId)
    console.log(`❌ Job cancelado: ${jobId}`)
    return true
  }
}
