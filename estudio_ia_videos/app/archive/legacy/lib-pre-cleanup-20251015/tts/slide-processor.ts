
import { elevenLabsClient } from './elevenlabs'
import { ttsCache } from './cache'

interface SlideAudio {
  slideId: string
  audioBuffer: Buffer
  duration: number
  cost: number
  text: string
}

interface ProcessOptions {
  voice_id: string
  model_id?: string
  pauseBetweenSlides?: number // seconds
}

export class SlideAudioProcessor {
  private totalProcessed = 0
  private totalCostAccumulated = 0
  
  async generateSlideAudios(
    slides: Array<{ id: string; title: string; content: string }>,
    options: ProcessOptions
  ): Promise<SlideAudio[]> {
    const results: SlideAudio[] = []
    let totalCost = 0
    
    console.log(`Starting TTS generation for ${slides.length} slides...`)

    for (const slide of slides) {
      try {
        // Combine title and content
        const fullText = this.buildSlideScript(slide.title, slide.content)
        
        if (!fullText.trim()) {
          console.warn(`Slide ${slide.id} has no text, skipping...`)
          continue
        }

        // Check cache first
        let audioBuffer = ttsCache.get(fullText, options.voice_id)
        let cost = 0
        
        if (!audioBuffer) {
          // Generate new audio
          audioBuffer = await elevenLabsClient.generateSpeech({
            text: fullText,
            voice_id: options.voice_id,
            model_id: options.model_id || 'eleven_multilingual_v2'
          })
          
          cost = elevenLabsClient.calculateCost(fullText)
          ttsCache.set(fullText, options.voice_id, audioBuffer, cost)
          totalCost += cost
        }

        // Estimate duration (approximation)
        const estimatedDuration = this.estimateAudioDuration(fullText)
        
        results.push({
          slideId: slide.id,
          audioBuffer,
          duration: estimatedDuration,
          cost,
          text: fullText
        })

        console.log(`✅ Generated audio for slide ${slide.id} (${fullText.length} chars, ~${estimatedDuration}s)`)

      } catch (error) {
        console.error(`❌ Failed to generate audio for slide ${slide.id}:`, error)
        
        // Create silent audio as fallback
        const fallbackBuffer = this.createSilentAudio(2) // 2 seconds
        results.push({
          slideId: slide.id,
          audioBuffer: fallbackBuffer,
          duration: 2,
          cost: 0,
          text: `[Error generating audio for: ${slide.title}]`
        })
      }
    }

    console.log(`✅ TTS generation complete. Total cost: $${totalCost.toFixed(4)}`)
    
    // Update statistics
    this.totalProcessed += slides.length
    this.totalCostAccumulated += totalCost
    
    return results
  }

  private buildSlideScript(title: string, content: string): string {
    let script = ''
    
    // Add title
    if (title && title.trim()) {
      script += title.trim()
      
      // Add pause after title if there's content
      if (content && content.trim()) {
        script += '. '
      }
    }
    
    // Add content
    if (content && content.trim()) {
      script += content.trim()
    }
    
    // Ensure proper ending
    if (script && !script.match(/[.!?]$/)) {
      script += '.'
    }
    
    return script
  }

  private estimateAudioDuration(text: string): number {
    // Average reading speed: ~150 words per minute = 2.5 words per second
    // Average: ~15 characters per second (including punctuation and pauses)
    const wordsCount = text.split(/\s+/).length
    const avgWordsPerSecond = 2.2 // Slightly slower for natural speech
    
    return Math.max(1, Math.ceil(wordsCount / avgWordsPerSecond))
  }

  private createSilentAudio(durationSeconds: number): Buffer {
    // Create minimal audio buffer representing silence
    // This is a placeholder - in real implementation, create actual silent audio file
    const sampleText = `Slide sem conteúdo. Duração de ${durationSeconds} segundos.`
    return Buffer.from(sampleText)
  }

  // Process single slide for quick testing
  async generateSingleSlideAudio(
    title: string, 
    content: string, 
    voiceId: string = 'br-female-1'
  ): Promise<SlideAudio> {
    const mockSlide = { 
      id: 'test-slide', 
      title, 
      content 
    }
    
    const results = await this.generateSlideAudios([mockSlide], { voice_id: voiceId })
    return results[0]
  }

  // Get processing statistics
  getProcessingStats(): {
    cacheStats: any
    totalProcessed: number
    avgCostPerSlide: number
  } {
    const cacheStats = ttsCache.getStats()
    const avgCostPerSlide = this.totalProcessed > 0 
      ? this.totalCostAccumulated / this.totalProcessed 
      : 0
    
    return {
      cacheStats,
      totalProcessed: this.totalProcessed,
      avgCostPerSlide: Math.round(avgCostPerSlide * 10000) / 10000 // Round to 4 decimal places
    }
  }
}

// Singleton instance
export const slideAudioProcessor = new SlideAudioProcessor()
