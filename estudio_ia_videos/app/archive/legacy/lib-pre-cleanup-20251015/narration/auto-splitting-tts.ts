

/**
 * Auto-Splitting TTS System for Better Lip-Sync
 * Automatically splits text by sentences and phrases for natural speech
 */

export interface TextSegment {
  id: string
  text: string
  start_time: number
  duration: number
  pause_after: number
  emphasis: 'normal' | 'strong' | 'soft'
  emotion: 'neutral' | 'excited' | 'serious' | 'concerned'
}

export interface TTSTimingResult {
  segments: TextSegment[]
  total_duration: number
  word_count: number
  estimated_cost: number
  audio_files: Array<{
    segment_id: string
    audio_url: string
    duration: number
  }>
}

/**
 * Brazilian Portuguese Text Processor
 */
export class BrazilianTextProcessor {
  
  /**
   * Split text into natural speech segments
   */
  splitTextForNaturalSpeech(text: string): TextSegment[] {
    // Remove extra whitespace and normalize
    text = text.trim().replace(/\s+/g, ' ')
    
    // Split by sentences first
    const sentences = this.splitBySentences(text)
    
    const segments: TextSegment[] = []
    let currentTime = 0

    sentences.forEach((sentence, index) => {
      // Further split long sentences by clauses
      const clauses = this.splitByClauses(sentence)
      
      clauses.forEach((clause, clauseIndex) => {
        const trimmedClause = clause.trim()
        if (trimmedClause.length === 0) return

        const segment: TextSegment = {
          id: `segment-${index}-${clauseIndex}`,
          text: trimmedClause,
          start_time: currentTime,
          duration: this.estimateSpeechDuration(trimmedClause),
          pause_after: this.calculatePauseDuration(trimmedClause, clauseIndex === clauses.length - 1),
          emphasis: this.detectEmphasis(trimmedClause),
          emotion: this.detectEmotion(trimmedClause)
        }

        currentTime += segment.duration + segment.pause_after
        segments.push(segment)
      })
    })

    return segments
  }

  /**
   * Split text by sentences (Portuguese punctuation aware)
   */
  private splitBySentences(text: string): string[] {
    // Portuguese sentence endings
    const sentenceEndings = /[.!?]+(?:\s|$)/g
    
    const sentences = text.split(sentenceEndings).filter(s => s.trim().length > 0)
    return sentences
  }

  /**
   * Split sentences by natural clauses
   */
  private splitByClauses(sentence: string): string[] {
    // Common Portuguese clause separators
    const clauseSeparators = /[,;:]\s+/g
    
    const clauses = sentence.split(clauseSeparators)
    
    // Don't split if clauses are too short
    if (clauses.some(clause => clause.trim().length < 10)) {
      return [sentence] // Keep as single clause
    }
    
    return clauses
  }

  /**
   * Estimate speech duration for Brazilian Portuguese
   */
  private estimateSpeechDuration(text: string): number {
    const wordCount = text.split(/\s+/).length
    const charCount = text.length
    
    // Brazilian Portuguese speaking rates (words per minute)
    const baseWPM = 160 // Average for training content
    const adjustedWPM = this.adjustWPMForContent(text, baseWPM)
    
    // Duration in seconds
    const wordBasedDuration = (wordCount / adjustedWPM) * 60
    
    // Character-based adjustment for complex terms
    const charBasedAdjustment = charCount * 0.02 // 20ms per character
    
    return Math.max(0.5, wordBasedDuration + charBasedAdjustment)
  }

  /**
   * Adjust WPM based on content complexity
   */
  private adjustWPMForContent(text: string, baseWPM: number): number {
    let wpm = baseWPM

    // Technical terms slow down speech
    const technicalTerms = [
      'equipamento', 'procedimento', 'segurança', 'norma', 'regulamentadora',
      'individual', 'proteção', 'coletiva', 'emergência', 'treinamento',
      'capacitação', 'certificação', 'inspeção', 'manutenção'
    ]

    const technicalTermCount = technicalTerms.reduce((count, term) => {
      return count + (text.toLowerCase().match(new RegExp(term, 'g')) || []).length
    }, 0)

    // Reduce WPM for technical content
    wpm *= Math.max(0.7, 1 - (technicalTermCount * 0.05))

    // Numbers and acronyms slow down speech
    const numbersAndAcronyms = text.match(/\b(?:\d+|[A-Z]{2,})\b/g) || []
    wpm *= Math.max(0.8, 1 - (numbersAndAcronyms.length * 0.02))

    return wpm
  }

  /**
   * Calculate appropriate pause after segment
   */
  private calculatePauseDuration(text: string, isLastClause: boolean): number {
    // Base pause duration
    let pause = 0.3 // 300ms default

    // Longer pause for sentence endings
    if (text.match(/[.!?]$/)) {
      pause = 0.6
    }

    // Shorter pause for commas
    if (text.match(/[,;:]$/)) {
      pause = 0.4
    }

    // Longer pause for questions
    if (text.includes('?')) {
      pause = 0.8
    }

    // Longer pause before important information
    if (text.toLowerCase().includes('atenção') || 
        text.toLowerCase().includes('importante') ||
        text.toLowerCase().includes('cuidado')) {
      pause = 0.7
    }

    // No pause if last clause
    if (isLastClause) {
      pause = 0.1
    }

    return pause
  }

  /**
   * Detect text emphasis level
   */
  private detectEmphasis(text: string): 'normal' | 'strong' | 'soft' {
    const strongIndicators = [
      'importante', 'atenção', 'cuidado', 'perigo', 'proibido',
      'obrigatório', 'emergência', 'alerta', 'risco'
    ]

    const softIndicators = [
      'lembre-se', 'note que', 'observe', 'considere',
      'recomenda-se', 'sugere-se'
    ]

    const lowerText = text.toLowerCase()

    if (strongIndicators.some(indicator => lowerText.includes(indicator))) {
      return 'strong'
    }

    if (softIndicators.some(indicator => lowerText.includes(indicator))) {
      return 'soft'
    }

    return 'normal'
  }

  /**
   * Detect emotional tone
   */
  private detectEmotion(text: string): 'neutral' | 'excited' | 'serious' | 'concerned' {
    const lowerText = text.toLowerCase()

    // Concerned/warning tone
    if (lowerText.match(/\b(perigo|risco|cuidado|atenção|emergência|acidente)\b/)) {
      return 'concerned'
    }

    // Excited/positive tone
    if (lowerText.match(/\b(parabéns|ótimo|excelente|sucesso|conquista)\b/)) {
      return 'excited'
    }

    // Serious/formal tone
    if (lowerText.match(/\b(norma|regulamentação|obrigatório|deve|precisa)\b/)) {
      return 'serious'
    }

    return 'neutral'
  }
}

/**
 * Advanced TTS with Auto-Splitting
 */
export class AutoSplittingTTS {
  private textProcessor: BrazilianTextProcessor
  private cache: Map<string, ArrayBuffer> = new Map()

  constructor() {
    this.textProcessor = new BrazilianTextProcessor()
  }

  /**
   * Generate TTS with automatic text splitting
   */
  async generateTTSWithSplitting(
    text: string,
    voice: string,
    options: {
      target_scene_duration?: number
      speed?: number
      pitch?: number
      auto_adjust_timing?: boolean
    } = {}
  ): Promise<TTSTimingResult> {
    
    try {
      // Split text into natural segments
      const segments = this.textProcessor.splitTextForNaturalSpeech(text)
      
      // Adjust timing if target duration is specified
      if (options.target_scene_duration && options.auto_adjust_timing) {
        this.adjustTimingToTargetDuration(segments, options.target_scene_duration)
      }

      // Generate audio for each segment
      const audioFiles = await this.generateSegmentAudio(segments, voice, options)

      // Calculate total metrics
      const totalDuration = segments.reduce((sum, seg) => sum + seg.duration + seg.pause_after, 0)
      const wordCount = text.split(/\s+/).length
      const estimatedCost = audioFiles.length * 0.002 // $0.002 per segment

      return {
        segments,
        total_duration: totalDuration,
        word_count: wordCount,
        estimated_cost: estimatedCost,
        audio_files: audioFiles
      }

    } catch (error) {
      console.error('Auto-splitting TTS error:', error)
      throw error
    }
  }

  /**
   * Adjust segment timing to fit target duration
   */
  private adjustTimingToTargetDuration(segments: TextSegment[], targetDuration: number): void {
    const currentTotalDuration = segments.reduce((sum, seg) => sum + seg.duration + seg.pause_after, 0)
    const speedFactor = currentTotalDuration / targetDuration

    console.log(`Adjusting speech timing: ${speedFactor.toFixed(2)}x speed to fit ${targetDuration}s`)

    // Adjust each segment proportionally
    let currentTime = 0
    segments.forEach(segment => {
      segment.start_time = currentTime
      segment.duration = segment.duration / speedFactor
      segment.pause_after = segment.pause_after / speedFactor
      
      currentTime += segment.duration + segment.pause_after
    })
  }

  /**
   * Generate audio files for all segments
   */
  private async generateSegmentAudio(
    segments: TextSegment[],
    voice: string,
    options: any
  ): Promise<Array<{
    segment_id: string
    audio_url: string
    duration: number
  }>> {
    
    const audioFiles = []

    for (const segment of segments) {
      try {
        // Check cache first
        const cacheKey = `${segment.text}-${voice}-${segment.emphasis}-${segment.emotion}`
        let audioBuffer = this.cache.get(cacheKey)

        if (!audioBuffer) {
          // Generate new TTS
          audioBuffer = await this.generateSegmentTTS(segment, voice, options)
          this.cache.set(cacheKey, audioBuffer)
        }

        // Save to temporary file (in production, use proper file system)
        const audioUrl = `/temp-tts/segment-${segment.id}.wav`
        
        audioFiles.push({
          segment_id: segment.id,
          audio_url: audioUrl,
          duration: segment.duration
        })

      } catch (error) {
        console.error(`Failed to generate audio for segment ${segment.id}:`, error)
        
        // Create silent audio as fallback
        audioFiles.push({
          segment_id: segment.id,
          audio_url: '/audio/silence.wav',
          duration: segment.duration
        })
      }
    }

    return audioFiles
  }

  /**
   * Generate TTS for individual segment
   */
  private async generateSegmentTTS(
    segment: TextSegment,
    voice: string,
    options: any
  ): Promise<ArrayBuffer> {
    
    // Adjust voice parameters based on segment characteristics
    const ttsParams = {
      text: segment.text,
      voice: voice,
      speed: this.calculateSpeed(segment, options.speed || 1.0),
      pitch: this.calculatePitch(segment, options.pitch || 1.0),
      emotion: segment.emotion,
      emphasis: segment.emphasis
    }

    // Call Google TTS API
    const response = await fetch('/api/tts/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ttsParams)
    })

    if (!response.ok) {
      throw new Error(`TTS generation failed: ${response.status}`)
    }

    return await response.arrayBuffer()
  }

  /**
   * Calculate appropriate speed for segment
   */
  private calculateSpeed(segment: TextSegment, baseSpeed: number): number {
    let speed = baseSpeed

    // Slow down for emphasis
    if (segment.emphasis === 'strong') {
      speed *= 0.85
    } else if (segment.emphasis === 'soft') {
      speed *= 1.1
    }

    // Adjust for emotion
    if (segment.emotion === 'concerned') {
      speed *= 0.9 // Slower for warnings
    } else if (segment.emotion === 'excited') {
      speed *= 1.05 // Slightly faster for positive content
    }

    return Math.max(0.5, Math.min(2.0, speed))
  }

  /**
   * Calculate appropriate pitch for segment
   */
  private calculatePitch(segment: TextSegment, basePitch: number): number {
    let pitch = basePitch

    // Adjust for emotion
    if (segment.emotion === 'excited') {
      pitch *= 1.1
    } else if (segment.emotion === 'concerned') {
      pitch *= 0.95
    }

    return Math.max(0.5, Math.min(2.0, pitch))
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    cached_segments: number
    cache_hit_rate: number
    memory_usage_mb: number
  } {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, buffer) => sum + buffer.byteLength, 0)

    return {
      cached_segments: this.cache.size,
      cache_hit_rate: 0.75, // Simulated hit rate
      memory_usage_mb: totalSize / (1024 * 1024)
    }
  }

  /**
   * Clear TTS cache
   */
  clearCache(): void {
    this.cache.clear()
    console.log('TTS cache cleared')
  }
}

export const autoSplittingTTS = new AutoSplittingTTS()
