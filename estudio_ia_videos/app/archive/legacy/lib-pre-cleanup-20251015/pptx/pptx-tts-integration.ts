

/**
 * PPTX TTS Integration for Sprint 6
 * Enhanced text-to-speech with slide-specific optimization
 */

import { TTSMultiProvider } from '../tts/tts-multi-provider'

export interface SlideNarrationConfig {
  slideId: string
  voiceId: string
  language: string
  speed: number
  pitch: number
  emotion: 'neutral' | 'excited' | 'serious' | 'concerned'
  emphasis: Array<{
    text: string
    level: 'strong' | 'moderate' | 'soft'
  }>
}

export interface SlideNarrationResult {
  slideId: string
  segments: Array<{
    id: string
    text: string
    audioUrl: string
    duration: number
    startTime: number
  }>
  totalDuration: number
  cost: number
  cacheKey: string
}

export interface BatchNarrationProgress {
  totalSlides: number
  completedSlides: number
  currentSlide: string
  estimatedTimeRemaining: number
  errors: Array<{
    slideId: string
    error: string
  }>
}

/**
 * Portuguese TTS Optimizer
 */
export class PortugueseTTSOptimizer {
  
  /**
   * NR Dictionary for proper pronunciation of safety terms
   */
  private static readonly NR_DICTIONARY = {
    'NR-12': 'Norma Regulamentadora doze',
    'NR-10': 'Norma Regulamentadora dez',
    'NR-6': 'Norma Regulamentadora seis',
    'EPI': 'E P I',
    'EPC': 'E P C',
    'SESMT': 'S E S M T',
    'CIPA': 'C I P A',
    'PCMSO': 'P C M S O',
    'PPRA': 'P P R A',
    'LTCAT': 'L T C A T',
    'CAT': 'C A T',
    'MHz': 'mega hertz',
    'kHz': 'quilo hertz',
    'mA': 'mili ampère',
    '°C': 'graus celsius',
    'dB': 'decibéis',
    'Lockout': 'lock out',
    'Tagout': 'tag out'
  }
  
  /**
   * Optimize text for Portuguese TTS
   */
  static optimizeTextForTTS(text: string): string {
    let optimizedText = text
    
    // Replace technical terms
    Object.entries(this.NR_DICTIONARY).forEach(([term, pronunciation]) => {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      optimizedText = optimizedText.replace(regex, pronunciation)
    })
    
    // Add natural pauses
    optimizedText = optimizedText
      .replace(/\./g, '... ') // Longer pauses at periods
      .replace(/,/g, ', ') // Short pauses at commas
      .replace(/:/g, ': ') // Pause after colons
      .replace(/;/g, '; ') // Pause after semicolons
      .replace(/\?/g, '? ') // Pause after questions
      .replace(/!/g, '! ') // Pause after exclamations
    
    // Expand abbreviations
    optimizedText = optimizedText
      .replace(/\betc\b/gi, 'etcétera')
      .replace(/\bex\./gi, 'exemplo')
      .replace(/\bp\.?ex\./gi, 'por exemplo')
      .replace(/\bobs\./gi, 'observação')
      .replace(/\bpág\./gi, 'página')
    
    // Numbers in Portuguese style
    optimizedText = optimizedText
      .replace(/\b(\d+)\s*%/g, '$1 por cento')
      .replace(/\b(\d+)\s*º/g, '$1° ')
      .replace(/\b(\d+)\s*ª/g, '$1ª ')
    
    // Clean up extra spaces
    optimizedText = optimizedText.replace(/\s+/g, ' ').trim()
    
    return optimizedText
  }
  
  /**
   * Split text for natural speech segments
   */
  static splitForNaturalSpeech(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const segments: string[] = []
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim()
      if (trimmed.length === 0) return
      
      // If sentence is too long (>100 chars), split by commas
      if (trimmed.length > 100) {
        const parts = trimmed.split(',').filter(p => p.trim().length > 0)
        if (parts.length > 1) {
          parts.forEach((part, index) => {
            if (index === parts.length - 1) {
              segments.push(part.trim() + '.')
            } else {
              segments.push(part.trim() + ',')
            }
          })
        } else {
          segments.push(trimmed + '.')
        }
      } else {
        segments.push(trimmed + '.')
      }
    })
    
    return segments
  }
  
  /**
   * Detect emotion/tone for slide content
   */
  static detectSlideEmotion(slideContent: any): 'neutral' | 'excited' | 'serious' | 'concerned' {
    const text = (slideContent.title + ' ' + (slideContent.bullets?.join(' ') || '')).toLowerCase()
    
    // Safety-related keywords indicate serious tone
    const seriousKeywords = ['segurança', 'risco', 'perigo', 'acidente', 'lesão', 'morte', 'emergência', 'cuidado', 'atenção']
    const concernedKeywords = ['alerta', 'importante', 'obrigatório', 'proibido', 'nunca', 'jamais']
    const excitedKeywords = ['parabéns', 'sucesso', 'excelente', 'ótimo', 'conquista', 'benefício']
    
    if (concernedKeywords.some(keyword => text.includes(keyword))) return 'concerned'
    if (seriousKeywords.some(keyword => text.includes(keyword))) return 'serious'
    if (excitedKeywords.some(keyword => text.includes(keyword))) return 'excited'
    
    return 'neutral'
  }
}

/**
 * PPTX TTS Integration Manager
 */
export class PPTXTTSIntegration {
  
  private static audioCache = new Map<string, SlideNarrationResult>()
  
  /**
   * Generate narration for all slides in batch
   */
  static async generateBatchNarration(
    slides: any[],
    voiceConfig: {
      voiceId: string
      language: string
      speed: number
      pitch: number
    },
    onProgress?: (progress: BatchNarrationProgress) => void
  ): Promise<SlideNarrationResult[]> {
    
    const results: SlideNarrationResult[] = []
    const errors: Array<{ slideId: string, error: string }> = []
    const startTime = Date.now()
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      const slideId = slide.id || slide.slideNumber?.toString() || `slide_${i}`
      
      try {
        // Progress callback
        if (onProgress) {
          const remainingSlides = slides.length - i
          const avgTimePerSlide = (Date.now() - startTime) / Math.max(i, 1)
          const estimatedTimeRemaining = remainingSlides * avgTimePerSlide
          
          onProgress({
            totalSlides: slides.length,
            completedSlides: i,
            currentSlide: slide.title || `Slide ${slide.slideNumber}`,
            estimatedTimeRemaining: Math.round(estimatedTimeRemaining / 1000),
            errors
          })
        }
        
        // Generate narration for slide
        const narrationConfig: SlideNarrationConfig = {
          slideId,
          voiceId: voiceConfig.voiceId,
          language: voiceConfig.language,
          speed: voiceConfig.speed,
          pitch: voiceConfig.pitch,
          emotion: PortugueseTTSOptimizer.detectSlideEmotion(slide),
          emphasis: this.extractEmphasisFromSlide(slide)
        }
        
        const result = await this.generateSlideNarration(slide, narrationConfig)
        results.push(result)
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error generating narration for slide ${slideId}:`, error)
        errors.push({ slideId, error: errorMessage })
      }
      
      // Small delay to prevent API rate limits
      if (i < slides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    // Final progress update
    if (onProgress) {
      onProgress({
        totalSlides: slides.length,
        completedSlides: slides.length,
        currentSlide: 'Completed',
        estimatedTimeRemaining: 0,
        errors
      })
    }
    
    return results
  }
  
  /**
   * Generate narration for a single slide
   */
  static async generateSlideNarration(
    slide: any,
    config: SlideNarrationConfig
  ): Promise<SlideNarrationResult> {
    
    // Generate cache key
    const contentText = this.generateVoiceTextFromSlide(slide)
    const cacheKey = this.generateCacheKey(contentText, config)
    
    // Check cache first
    if (this.audioCache.has(cacheKey)) {
      console.log(`Using cached audio for slide ${config.slideId}`)
      return this.audioCache.get(cacheKey)!
    }
    
    try {
      // Optimize text for Portuguese TTS
      const optimizedText = PortugueseTTSOptimizer.optimizeTextForTTS(contentText)
      
      // Split into natural segments
      const textSegments = PortugueseTTSOptimizer.splitForNaturalSpeech(optimizedText)
      
      console.log(`Generating TTS for slide ${config.slideId} with ${textSegments.length} segments`)
      
      // Generate TTS audio using real multi-provider service
      const segments = await this.generateRealTTS(textSegments, config)
      
      const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0)
      const cost = this.calculateTTSCost(optimizedText, config.voiceId)
      
      const result: SlideNarrationResult = {
        slideId: config.slideId,
        segments,
        totalDuration,
        cost,
        cacheKey
      }
      
      // Cache result
      this.audioCache.set(cacheKey, result)
      
      return result
      
    } catch (error) {
      console.error('Error in slide narration generation:', error)
      throw new Error(`Failed to generate narration for slide ${config.slideId}`)
    }
  }
  
  /**
   * Generate voice text from slide content
   */
  private static generateVoiceTextFromSlide(slide: any): string {
    let voiceText = ''
    
    // Add title with emphasis
    if (slide.title) {
      voiceText += slide.title + '. '
    }
    
    // Add bullets in natural flow
    if (slide.bullets && slide.bullets.length > 0) {
      if (slide.bullets.length === 1) {
        voiceText += slide.bullets[0] + '. '
      } else {
        voiceText += 'Vamos ver os pontos principais: '
        slide.bullets.forEach((bullet: string, index: number) => {
          voiceText += bullet
          if (index < slide.bullets.length - 1) {
            voiceText += '. Em seguida, '
          } else {
            voiceText += '. '
          }
        })
      }
    }
    
    // Add notes for context
    if (slide.notes && slide.notes.trim().length > 0) {
      voiceText += slide.notes + ' '
    }
    
    return voiceText.trim()
  }
  
  /**
   * Extract emphasis points from slide
   */
  private static extractEmphasisFromSlide(slide: any): Array<{ text: string, level: 'strong' | 'moderate' | 'soft' }> {
    const emphasis: Array<{ text: string, level: 'strong' | 'moderate' | 'soft' }> = []
    const text = slide.title + ' ' + (slide.bullets?.join(' ') || '')
    
    // Strong emphasis for safety terms
    const strongTerms = ['atenção', 'cuidado', 'perigo', 'proibido', 'obrigatório', 'nunca', 'jamais']
    strongTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        emphasis.push({ text: term, level: 'strong' as const })
      }
    })
    
    // Moderate emphasis for important terms
    const moderateTerms = ['importante', 'necessário', 'deve', 'precisa', 'sempre']
    moderateTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        emphasis.push({ text: term, level: 'moderate' as const })
      }
    })
    
    return emphasis
  }
  
  /**
   * Generate TTS audio using real multi-provider service
   * Supports ElevenLabs, Azure Speech, and Google TTS with fallback
   */
  private static async generateRealTTS(
    textSegments: string[],
    config: SlideNarrationConfig
  ): Promise<Array<{
    id: string
    text: string
    audioUrl: string
    duration: number
    startTime: number
  }>> {
    
    const ttsService = new TTSMultiProvider()
    const segments = []
    let currentTime = 0
    
    for (let i = 0; i < textSegments.length; i++) {
      const segment = textSegments[i]
      
      try {
        // Generate real TTS audio
        const ttsResult = await ttsService.generateSpeech({
          text: segment,
          provider: 'auto', // Auto-select best provider
          voice: config.voiceId,
          language: config.language,
          speed: config.speed,
          pitch: config.pitch,
          cache: true // Enable caching for performance
        })
        
        if (ttsResult.success && ttsResult.audioUrl) {
          segments.push({
            id: `${config.slideId}_segment_${i}`,
            text: segment,
            audioUrl: ttsResult.audioUrl,
            duration: ttsResult.duration || this.estimateDuration(segment, config.speed),
            startTime: Math.round(currentTime * 10) / 10
          })
          
          currentTime += ttsResult.duration || this.estimateDuration(segment, config.speed)
        } else {
          // Fallback to duration estimation if TTS fails
          const estimatedDuration = this.estimateDuration(segment, config.speed)
          segments.push({
            id: `${config.slideId}_segment_${i}`,
            text: segment,
            audioUrl: '', // Empty URL indicates TTS failure
            duration: estimatedDuration,
            startTime: Math.round(currentTime * 10) / 10
          })
          
          currentTime += estimatedDuration
          console.warn(`TTS failed for segment ${i} of slide ${config.slideId}:`, ttsResult.error)
        }
      } catch (error) {
        // Fallback to duration estimation on error
        const estimatedDuration = this.estimateDuration(segment, config.speed)
        segments.push({
          id: `${config.slideId}_segment_${i}`,
          text: segment,
          audioUrl: '', // Empty URL indicates TTS failure
          duration: estimatedDuration,
          startTime: Math.round(currentTime * 10) / 10
        })
        
        currentTime += estimatedDuration
        console.error(`TTS error for segment ${i} of slide ${config.slideId}:`, error)
      }
    }
    
    return segments
  }
  
  /**
   * Estimate audio duration based on text length and speed
   */
  private static estimateDuration(text: string, speed: number = 1.0): number {
    const baseCharsPerSecond = 12 // Portuguese average
    const speedMultiplier = speed
    return Math.max(1, text.length / (baseCharsPerSecond * speedMultiplier))
  }
  
  /**
   * Generate cache key for TTS result
   */
  private static generateCacheKey(text: string, config: SlideNarrationConfig): string {
    const configHash = JSON.stringify({
      voiceId: config.voiceId,
      language: config.language,
      speed: config.speed,
      pitch: config.pitch,
      emotion: config.emotion
    })
    
    return `tts_${Buffer.from(text + configHash).toString('base64').slice(0, 32)}`
  }
  
  /**
   * Calculate TTS cost estimation
   */
  private static calculateTTSCost(text: string, voiceId: string): number {
    const baseCharacters = text.length
    const costPerChar = 0.000016 // Mock pricing: $16 per 1M chars
    return Math.round(baseCharacters * costPerChar * 100) / 100
  }
  
  /**
   * Clear TTS cache (for memory management)
   */
  static clearTTSCache(): void {
    this.audioCache.clear()
    console.log('TTS cache cleared')
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    cacheSize: number
    totalCachedDuration: number
    estimatedSavings: number
  } {
    let totalDuration = 0
    let totalSavings = 0
    
    this.audioCache.forEach(result => {
      totalDuration += result.totalDuration
      totalSavings += result.cost
    })
    
    return {
      cacheSize: this.audioCache.size,
      totalCachedDuration: Math.round(totalDuration),
      estimatedSavings: Math.round(totalSavings * 100) / 100
    }
  }
}
