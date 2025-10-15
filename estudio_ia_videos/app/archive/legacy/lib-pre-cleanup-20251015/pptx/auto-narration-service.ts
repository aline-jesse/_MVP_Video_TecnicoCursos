
/**
 * 🎙️ AUTO-NARRATION SERVICE
 * Gera narração automática para slides PPTX
 * Sprint 45 - Fase 1
 */

import { S3StorageService } from '@/lib/s3-storage'
import { ttsService } from '@/lib/tts/tts-service'

export interface NarrationOptions {
  provider: 'azure' | 'elevenlabs'
  voice: string
  speed: number
  pitch?: number
  preferNotes: boolean // Priorizar notas do slide
}

export interface SlideNarration {
  slideNumber: number
  script: string
  audioUrl: string
  duration: number
  provider: string
  voice: string
}

export interface AutoNarrationResult {
  success: boolean
  narrations: SlideNarration[]
  totalDuration: number
  error?: string
}

export class AutoNarrationService {
  constructor() {
    // Usa instância singleton do ttsService
  }

  /**
   * Gera narração para múltiplos slides
   */
  async generateNarrations(
    slides: Array<{
      slideNumber: number
      notes?: string
      elements: Array<{ type: string; content: any }>
    }>,
    projectId: string,
    options: NarrationOptions
  ): Promise<AutoNarrationResult> {
    try {
      console.log(`🎙️ Gerando narrações para ${slides.length} slides...`)
      
      const narrations: SlideNarration[] = []
      let totalDuration = 0

      for (const slide of slides) {
        try {
          // 1. Extrair texto do slide
          const script = this.extractScript(slide, options.preferNotes)
          
          if (!script || script.trim().length === 0) {
            console.warn(`⚠️ Slide ${slide.slideNumber}: sem texto para narração`)
            continue
          }

          console.log(`📝 Slide ${slide.slideNumber}: "${script.substring(0, 50)}..."`)

          // 2. Gerar TTS
          const audioBuffer = await this.generateTTS(script, options)

          // 3. Calcular duração (estimativa: ~150 palavras por minuto)
          const wordCount = script.split(/\s+/).length
          const estimatedDuration = (wordCount / 150) * 60 * 1000 // em ms

          // 4. Upload para S3
          const audioKey = `narrations/${projectId}/slide-${slide.slideNumber}.mp3`
          const uploadResult = await S3StorageService.uploadFile(
            audioBuffer,
            audioKey,
            'audio/mpeg'
          )

          if (!uploadResult.success || !uploadResult.url) {
            throw new Error(`Erro ao fazer upload do áudio: ${uploadResult.error}`)
          }

          narrations.push({
            slideNumber: slide.slideNumber,
            script,
            audioUrl: uploadResult.url,
            duration: estimatedDuration,
            provider: options.provider,
            voice: options.voice
          })

          totalDuration += estimatedDuration

          console.log(`✅ Slide ${slide.slideNumber}: narração gerada (${Math.round(estimatedDuration/1000)}s)`)

        } catch (error) {
          console.error(`❌ Erro ao gerar narração do slide ${slide.slideNumber}:`, error)
          // Continua para próximo slide
        }
      }

      return {
        success: true,
        narrations,
        totalDuration
      }

    } catch (error) {
      console.error('❌ Erro ao gerar narrações:', error)
      return {
        success: false,
        narrations: [],
        totalDuration: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Extrai script do slide (notas ou texto visível)
   */
  private extractScript(
    slide: {
      notes?: string
      elements: Array<{ type: string; content: any }>
    },
    preferNotes: boolean
  ): string {
    // 1. Se preferir notas E notas existem, usar notas
    if (preferNotes && slide.notes && slide.notes.trim().length > 0) {
      return this.cleanScript(slide.notes)
    }

    // 2. Caso contrário, extrair texto visível dos elementos
    const textElements = slide.elements.filter(el => el.type === 'text')
    
    if (textElements.length === 0) {
      return slide.notes ? this.cleanScript(slide.notes) : ''
    }

    // 3. Concatenar textos separados por ponto
    const texts = textElements
      .map(el => {
        const text = el.content?.text || el.content || ''
        return String(text).trim()
      })
      .filter(text => text.length > 0)

    return this.cleanScript(texts.join('. '))
  }

  /**
   * Limpa e formata script para TTS
   */
  private cleanScript(text: string): string {
    return text
      .trim()
      // Remove múltiplos espaços
      .replace(/\s+/g, ' ')
      // Remove quebras de linha excessivas
      .replace(/\n{3,}/g, '\n\n')
      // Remove bullets
      .replace(/^[•\-\*]\s+/gm, '')
      // Garante pontuação final
      .replace(/([^.!?])$/, '$1.')
      // Remove espaços antes de pontuação
      .replace(/\s+([.,!?;:])/g, '$1')
  }

  /**
   * Gera áudio TTS
   */
  private async generateTTS(
    text: string,
    options: NarrationOptions
  ): Promise<Buffer> {
    try {
      let audioUrl: string

      switch (options.provider) {
        case 'azure':
          audioUrl = await ttsService.generateSpeechAzure({
            text,
            voiceId: options.voice || 'pt-BR-FranciscaNeural',
            speed: options.speed,
            pitch: options.pitch,
            language: 'pt-BR'
          })
          break

        case 'elevenlabs':
          audioUrl = await ttsService.generateSpeechElevenLabs({
            text,
            voiceId: options.voice || 'default',
            speed: options.speed,
            language: 'pt-BR'
          })
          break

        default:
          throw new Error(`Provider não suportado: ${options.provider}`)
      }

      // Download áudio gerado (audioUrl pode ser S3 ou URL temporária)
      if (audioUrl.startsWith('http')) {
        const response = await fetch(audioUrl)
        return Buffer.from(await response.arrayBuffer())
      }

      // Se já é um buffer ou string, retornar diretamente
      return Buffer.from(audioUrl)

    } catch (error) {
      console.error('❌ Erro ao gerar TTS:', error)
      throw error
    }
  }

  /**
   * Valida se texto é adequado para narração
   */
  validateScript(text: string): { valid: boolean; reason?: string } {
    if (!text || text.trim().length === 0) {
      return { valid: false, reason: 'Texto vazio' }
    }

    if (text.trim().length < 10) {
      return { valid: false, reason: 'Texto muito curto (mínimo 10 caracteres)' }
    }

    if (text.length > 5000) {
      return { valid: false, reason: 'Texto muito longo (máximo 5000 caracteres)' }
    }

    return { valid: true }
  }
}
