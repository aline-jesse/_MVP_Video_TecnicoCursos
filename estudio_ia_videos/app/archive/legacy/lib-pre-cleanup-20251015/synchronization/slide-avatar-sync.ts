

/**
 * Sistema de Sincronização Slide-Avatar-Narração
 * Controla timing preciso entre slides, narração e movimentos de avatar
 */

export interface SyncTimeline {
  slideId: string
  slideNumber: number
  startTime: number
  endTime: number
  duration: number
  narrationSegments: NarrationSyncSegment[]
  avatarActions: AvatarSyncAction[]
  transitionEffect?: SlideTransition
}

export interface NarrationSyncSegment {
  id: string
  text: string
  startTime: number
  endTime: number
  audioUrl: string
  lipSyncFrames: LipSyncFrame[]
  emphasis: Array<{
    startTime: number
    endTime: number
    level: 'weak' | 'moderate' | 'strong'
  }>
}

export interface AvatarSyncAction {
  id: string
  type: 'gesture' | 'expression' | 'look' | 'pose' | 'movement'
  startTime: number
  duration: number
  parameters: {
    gestureType?: 'point' | 'explain' | 'warn' | 'welcome' | 'demonstrate'
    expression?: 'neutral' | 'concerned' | 'friendly' | 'serious' | 'excited'
    lookDirection?: 'camera' | 'slide' | 'audience' | 'object'
    intensity?: number
  }
  triggerWord?: string
}

export interface LipSyncFrame {
  timestamp: number
  phoneme: string
  viseme: string
  mouthShape: string
  intensity: number
}

export interface SlideTransition {
  type: 'fade' | 'slide' | 'zoom' | 'dissolve' | 'cut'
  duration: number
  waitForNarration: boolean
}

export interface SyncConfiguration {
  autoTransition: boolean
  waitForNarrationComplete: boolean
  avatarGesturesEnabled: boolean
  lipSyncPrecision: 'low' | 'medium' | 'high'
  transitionDelay: number
  gestureIntensity: number
}

/**
 * Controlador de sincronização
 */
export class SlideAvatarSyncController {
  
  private timeline: SyncTimeline[] = []
  private currentSlideIndex = 0
  private isPlaying = false
  private startTime = 0
  private pausedAt = 0
  private syncConfiguration: SyncConfiguration
  
  constructor(config: SyncConfiguration) {
    this.syncConfiguration = config
  }

  /**
   * Gerar timeline de sincronização completa
   */
  generateSyncTimeline(
    slides: any[],
    narrationResults: any[],
    avatarConfig: any
  ): SyncTimeline[] {
    
    console.log('🎬 Gerando timeline de sincronização para', slides.length, 'slides')
    
    const timeline: SyncTimeline[] = []
    let cumulativeTime = 0
    
    slides.forEach((slide, index) => {
      const narrationResult = narrationResults[index]
      
      if (!narrationResult) {
        console.warn(`Narração não encontrada para slide ${index + 1}`)
        return
      }
      
      // Duração base: narração + delay de transição
      const baseDuration = narrationResult.totalDuration
      const transitionDelay = this.syncConfiguration.waitForNarrationComplete 
        ? this.syncConfiguration.transitionDelay 
        : 0
      const totalDuration = baseDuration + transitionDelay
      
      // Converter segmentos de narração
      const narrationSegments: NarrationSyncSegment[] = narrationResult.segments.map((seg: any) => ({
        id: seg.id,
        text: seg.text,
        startTime: cumulativeTime + seg.startTime,
        endTime: cumulativeTime + seg.endTime,
        audioUrl: seg.audioUrl,
        lipSyncFrames: this.convertToLipSyncFrames(seg.lipSyncData || []),
        emphasis: this.detectEmphasisInText(seg.text)
      }))
      
      // Gerar ações de avatar baseadas no conteúdo
      const avatarActions = this.generateAvatarActions(
        slide,
        narrationSegments,
        cumulativeTime,
        avatarConfig
      )
      
      // Definir transição
      const transitionEffect: SlideTransition = {
        type: index === slides.length - 1 ? 'fade' : 'slide',
        duration: 1000, // 1 segundo
        waitForNarration: this.syncConfiguration.waitForNarrationComplete
      }
      
      const syncSlide: SyncTimeline = {
        slideId: slide.id || `slide_${index}`,
        slideNumber: slide.slideNumber || index + 1,
        startTime: cumulativeTime,
        endTime: cumulativeTime + totalDuration,
        duration: totalDuration,
        narrationSegments,
        avatarActions,
        transitionEffect
      }
      
      timeline.push(syncSlide)
      cumulativeTime += totalDuration
    })
    
    this.timeline = timeline
    
    console.log(`✅ Timeline gerada: ${timeline.length} slides, duração total: ${Math.round(cumulativeTime)}s`)
    return timeline
  }

  /**
   * Gerar ações de avatar baseadas no conteúdo
   */
  private generateAvatarActions(
    slide: any,
    narrationSegments: NarrationSyncSegment[],
    slideStartTime: number,
    avatarConfig: any
  ): AvatarSyncAction[] {
    
    const actions: AvatarSyncAction[] = []
    
    // Ação inicial: apresentar slide
    actions.push({
      id: `${slide.id}_intro`,
      type: 'gesture',
      startTime: slideStartTime,
      duration: 2000,
      parameters: {
        gestureType: 'welcome',
        expression: 'friendly',
        lookDirection: 'camera',
        intensity: 0.7
      }
    })
    
    // Analisar segmentos de narração para gerar gestos apropriados
    narrationSegments.forEach((segment, index) => {
      const text = segment.text.toLowerCase()
      
      // Gestos baseados em palavras-chave
      if (this.containsKeywords(text, ['atenção', 'cuidado', 'perigo', 'risco'])) {
        actions.push({
          id: `${slide.id}_warning_${index}`,
          type: 'expression',
          startTime: segment.startTime,
          duration: segment.endTime - segment.startTime,
          parameters: {
            expression: 'concerned',
            gestureType: 'warn',
            intensity: 0.9
          },
          triggerWord: this.extractKeyword(text, ['atenção', 'cuidado', 'perigo', 'risco'])
        })
      }
      
      if (this.containsKeywords(text, ['importante', 'essencial', 'fundamental'])) {
        actions.push({
          id: `${slide.id}_emphasis_${index}`,
          type: 'gesture',
          startTime: segment.startTime + 500, // Delay de 0.5s
          duration: 1500,
          parameters: {
            gestureType: 'explain',
            expression: 'serious',
            intensity: 0.8
          }
        })
      }
      
      if (this.containsKeywords(text, ['exemplo', 'demonstrar', 'mostrar', 'observe'])) {
        actions.push({
          id: `${slide.id}_demonstrate_${index}`,
          type: 'gesture',
          startTime: segment.startTime,
          duration: 2000,
          parameters: {
            gestureType: 'demonstrate',
            lookDirection: 'slide',
            intensity: 0.6
          }
        })
      }
    })
    
    // Ação final: transição
    const lastSegment = narrationSegments[narrationSegments.length - 1]
    if (lastSegment) {
      actions.push({
        id: `${slide.id}_outro`,
        type: 'gesture',
        startTime: lastSegment.endTime - 1000,
        duration: 1000,
        parameters: {
          gestureType: 'explain',
          expression: 'neutral',
          lookDirection: 'camera',
          intensity: 0.5
        }
      })
    }
    
    return actions
  }

  /**
   * Verificar se texto contém palavras-chave
   */
  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword))
  }

  /**
   * Extrair primeira palavra-chave encontrada
   */
  private extractKeyword(text: string, keywords: string[]): string | undefined {
    return keywords.find(keyword => text.includes(keyword))
  }

  /**
   * Converter dados de lip-sync
   */
  private convertToLipSyncFrames(lipSyncData: any[]): LipSyncFrame[] {
    return lipSyncData.map((frame: any) => ({
      timestamp: frame.timestamp,
      phoneme: frame.phoneme || '',
      viseme: frame.viseme,
      mouthShape: this.visemeToMouthShape(frame.viseme),
      intensity: frame.intensity
    }))
  }

  /**
   * Converter visema para forma da boca
   */
  private visemeToMouthShape(viseme: string): string {
    const mouthShapeMap: Record<string, string> = {
      'aa': 'open_wide',
      'E': 'open_mid',
      'ih': 'open_narrow',
      'oh': 'rounded',
      'ou': 'rounded_tight',
      'PP': 'closed',
      'FF': 'pressed',
      'TH': 'tongue_out',
      'SS': 'hissing',
      'nn': 'neutral',
      'RR': 'rolled',
      'kk': 'back_tongue',
      'sil': 'neutral'
    }
    
    return mouthShapeMap[viseme] || 'neutral'
  }

  /**
   * Detectar ênfase no texto
   */
  private detectEmphasisInText(text: string): Array<{
    startTime: number
    endTime: number
    level: 'weak' | 'moderate' | 'strong'
  }> {
    const emphasis: Array<{ startTime: number, endTime: number, level: 'weak' | 'moderate' | 'strong' }> = []
    
    // Palavras que requerem ênfase forte
    const strongWords = ['atenção', 'cuidado', 'perigo', 'nunca', 'jamais', 'obrigatório']
    const moderateWords = ['importante', 'sempre', 'deve', 'precisa']
    const weakWords = ['recomenda', 'sugere', 'pode', 'poderia']
    
    // Simular timing baseado na posição das palavras
    // Em produção, usaria análise mais precisa
    strongWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        emphasis.push({
          startTime: 0, // Seria calculado pela posição real da palavra
          endTime: 1000,
          level: 'strong'
        })
      }
    })
    
    return emphasis
  }

  /**
   * Reproduzir timeline sincronizada
   */
  async playTimeline(
    onSlideChange?: (slideIndex: number) => void,
    onAvatarAction?: (action: AvatarSyncAction) => void,
    onNarrationSegment?: (segment: NarrationSyncSegment) => void
  ): Promise<void> {
    
    if (this.timeline.length === 0) {
      throw new Error('Timeline não configurada')
    }
    
    this.isPlaying = true
    this.startTime = Date.now() - this.pausedAt
    this.currentSlideIndex = 0
    
    console.log('▶️ Iniciando reprodução da timeline sincronizada')
    
    try {
      for (let i = 0; i < this.timeline.length; i++) {
        if (!this.isPlaying) break
        
        const slide = this.timeline[i]
        this.currentSlideIndex = i
        
        console.log(`📊 Reproduzindo slide ${slide.slideNumber}: ${slide.duration}s`)
        
        // Notificar mudança de slide
        if (onSlideChange) {
          onSlideChange(i)
        }
        
        // Executar ações de avatar e narração em paralelo
        await this.executeSlideActions(slide, onAvatarAction, onNarrationSegment)
        
        // Aguardar conclusão da narração se configurado
        if (this.syncConfiguration.waitForNarrationComplete) {
          await this.waitForNarrationComplete(slide)
        }
        
        // Delay de transição entre slides
        if (i < this.timeline.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.syncConfiguration.transitionDelay))
        }
      }
      
      console.log('✅ Timeline concluída com sucesso')
      
    } catch (error) {
      console.error('❌ Erro na reprodução da timeline:', error)
      throw error
    } finally {
      this.isPlaying = false
    }
  }

  /**
   * Executar ações de um slide
   */
  private async executeSlideActions(
    slide: SyncTimeline,
    onAvatarAction?: (action: AvatarSyncAction) => void,
    onNarrationSegment?: (segment: NarrationSyncSegment) => void
  ): Promise<void> {
    
    const slideStartTime = Date.now()
    
    // Iniciar narração
    const narrationPromises = slide.narrationSegments.map(async (segment) => {
      // Aguardar tempo de início do segmento
      const delay = (segment.startTime - slide.startTime) * 1000
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      if (onNarrationSegment) {
        onNarrationSegment(segment)
      }
      
      // Reproduzir áudio se disponível
      if (segment.audioUrl) {
        try {
          const audio = new Audio(segment.audioUrl)
          await audio.play()
        } catch (error) {
          console.warn('Erro ao reproduzir áudio:', error)
        }
      }
    })
    
    // Iniciar ações de avatar
    const avatarPromises = slide.avatarActions.map(async (action) => {
      const delay = action.startTime - slide.startTime
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      if (onAvatarAction) {
        onAvatarAction(action)
      }
    })
    
    // Aguardar todas as ações completarem ou tempo mínimo do slide
    await Promise.allSettled([
      ...narrationPromises,
      ...avatarPromises,
      new Promise(resolve => setTimeout(resolve, slide.duration * 1000))
    ])
  }

  /**
   * Aguardar conclusão da narração
   */
  private async waitForNarrationComplete(slide: SyncTimeline): Promise<void> {
    const lastSegment = slide.narrationSegments[slide.narrationSegments.length - 1]
    if (!lastSegment) return
    
    const remainingTime = lastSegment.endTime - slide.startTime
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime * 1000))
    }
  }

  /**
   * Pausar reprodução
   */
  pause(): void {
    if (this.isPlaying) {
      this.isPlaying = false
      this.pausedAt = Date.now() - this.startTime
      console.log('⏸️ Timeline pausada')
    }
  }

  /**
   * Retomar reprodução
   */
  resume(): void {
    if (!this.isPlaying) {
      this.isPlaying = true
      this.startTime = Date.now() - this.pausedAt
      console.log('▶️ Timeline retomada')
    }
  }

  /**
   * Parar reprodução
   */
  stop(): void {
    this.isPlaying = false
    this.currentSlideIndex = 0
    this.pausedAt = 0
    console.log('⏹️ Timeline parada')
  }

  /**
   * Pular para slide específico
   */
  seekToSlide(slideIndex: number): void {
    if (slideIndex >= 0 && slideIndex < this.timeline.length) {
      this.currentSlideIndex = slideIndex
      const slide = this.timeline[slideIndex]
      this.pausedAt = slide.startTime * 1000
      console.log(`⏭️ Pulando para slide ${slideIndex + 1}`)
    }
  }

  /**
   * Obter posição atual
   */
  getCurrentPosition(): {
    slideIndex: number
    timeInSlide: number
    totalTime: number
    totalDuration: number
  } {
    const totalDuration = this.timeline.reduce((sum, slide) => sum + slide.duration, 0)
    const currentTime = this.isPlaying 
      ? (Date.now() - this.startTime) / 1000
      : this.pausedAt / 1000
    
    const currentSlide = this.timeline[this.currentSlideIndex]
    const timeInSlide = currentSlide 
      ? Math.max(0, currentTime - currentSlide.startTime)
      : 0
    
    return {
      slideIndex: this.currentSlideIndex,
      timeInSlide,
      totalTime: currentTime,
      totalDuration
    }
  }

  /**
   * Atualizar configuração de sincronização
   */
  updateSyncConfiguration(config: Partial<SyncConfiguration>): void {
    this.syncConfiguration = { ...this.syncConfiguration, ...config }
    console.log('⚙️ Configuração de sincronização atualizada:', config)
  }

  /**
   * Obter timeline atual
   */
  getTimeline(): SyncTimeline[] {
    return this.timeline
  }

  /**
   * Obter estatísticas da timeline
   */
  getTimelineStats(): {
    totalSlides: number
    totalDuration: number
    totalNarrationSegments: number
    totalAvatarActions: number
    averageSlideLength: number
  } {
    const totalDuration = this.timeline.reduce((sum, slide) => sum + slide.duration, 0)
    const totalSegments = this.timeline.reduce((sum, slide) => sum + slide.narrationSegments.length, 0)
    const totalActions = this.timeline.reduce((sum, slide) => sum + slide.avatarActions.length, 0)
    
    return {
      totalSlides: this.timeline.length,
      totalDuration: Math.round(totalDuration),
      totalNarrationSegments: totalSegments,
      totalAvatarActions: totalActions,
      averageSlideLength: this.timeline.length > 0 ? Math.round(totalDuration / this.timeline.length) : 0
    }
  }

  /**
   * Exportar timeline para arquivo
   */
  exportTimeline(): string {
    return JSON.stringify({
      version: '1.0',
      generated_at: new Date().toISOString(),
      configuration: this.syncConfiguration,
      timeline: this.timeline,
      stats: this.getTimelineStats()
    }, null, 2)
  }

  /**
   * Importar timeline de arquivo
   */
  importTimeline(timelineData: string): void {
    try {
      const data = JSON.parse(timelineData)
      
      if (data.version !== '1.0') {
        throw new Error('Versão de timeline não suportada')
      }
      
      this.timeline = data.timeline
      this.syncConfiguration = data.configuration
      
      console.log('📥 Timeline importada com sucesso:', this.getTimelineStats())
      
    } catch (error) {
      console.error('Erro ao importar timeline:', error)
      throw new Error('Arquivo de timeline inválido')
    }
  }
}

// Criar instância padrão
export const slideAvatarSyncController = new SlideAvatarSyncController({
  autoTransition: true,
  waitForNarrationComplete: true,
  avatarGesturesEnabled: true,
  lipSyncPrecision: 'high',
  transitionDelay: 1000,
  gestureIntensity: 0.7
})

