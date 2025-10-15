/**
 * 🎙️ ElevenLabs TTS Provider
 * Integração completa com ElevenLabs API v1
 * 
 * Features:
 * - Text-to-Speech de alta qualidade
 * - Múltiplas vozes e idiomas
 * - Controle de estabilidade e clareza
 * - Streaming de áudio
 * - Gestão de caracteres/créditos
 */

import { fetch } from 'undici'

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: 'premade' | 'cloned' | 'generated'
  labels: Record<string, string>
  preview_url?: string
  description?: string
  samples?: {
    sample_id: string
    file_name: string
    mime_type: string
    size_bytes: number
    hash: string
  }[]
}

export interface ElevenLabsConfig {
  apiKey: string
  modelId?: string // 'eleven_multilingual_v2' | 'eleven_monolingual_v1'
}

export interface TTSOptions {
  text: string
  voiceId: string
  stability?: number // 0-1
  similarityBoost?: number // 0-1
  style?: number // 0-1
  useSpeakerBoost?: boolean
  modelId?: string
}

export interface TTSResult {
  audio: Buffer
  characters: number
  duration?: number
  format: string
}

export class ElevenLabsProvider {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'
  private defaultModelId = 'eleven_multilingual_v2'

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey
    if (config.modelId) {
      this.defaultModelId = config.modelId
    }
  }

  /**
   * Gerar áudio a partir de texto
   */
  async textToSpeech(options: TTSOptions): Promise<TTSResult> {
    const {
      text,
      voiceId,
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0,
      useSpeakerBoost = true,
      modelId = this.defaultModelId,
    } = options

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty')
    }

    if (text.length > 5000) {
      throw new Error('Text exceeds maximum length of 5000 characters')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability,
              similarity_boost: similarityBoost,
              style,
              use_speaker_boost: useSpeakerBoost,
            },
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`ElevenLabs API error: ${response.status} - ${error}`)
      }

      // Obter áudio como buffer
      const arrayBuffer = await response.arrayBuffer()
      const audio = Buffer.from(arrayBuffer)

      // Calcular caracteres (para billing)
      const characters = text.length

      return {
        audio,
        characters,
        format: 'mp3',
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      throw error
    }
  }

  /**
   * Listar vozes disponíveis
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`)
      }

      const data = await response.json() as { voices: ElevenLabsVoice[] }
      return data.voices
    } catch (error) {
      console.error('Error fetching voices:', error)
      throw error
    }
  }

  /**
   * Obter informações de uma voz específica
   */
  async getVoice(voiceId: string): Promise<ElevenLabsVoice> {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch voice: ${response.status}`)
      }

      return await response.json() as ElevenLabsVoice
    } catch (error) {
      console.error('Error fetching voice:', error)
      throw error
    }
  }

  /**
   * Obter informações de uso (créditos)
   */
  async getSubscriptionInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.status}`)
      }

      const data = await response.json() as {
        tier: string
        character_count: number
        character_limit: number
        can_extend_character_limit: boolean
        allowed_to_extend_character_limit: boolean
        next_character_count_reset_unix: number
        voice_limit: number
        professional_voice_limit: number
        can_extend_voice_limit: boolean
        can_use_instant_voice_cloning: boolean
        available_models: { model_id: string; display_name: string }[]
      }

      return {
        tier: data.tier,
        charactersUsed: data.character_count,
        charactersLimit: data.character_limit,
        charactersRemaining: data.character_limit - data.character_count,
        percentageUsed: (data.character_count / data.character_limit) * 100,
        resetDate: new Date(data.next_character_count_reset_unix * 1000),
        availableModels: data.available_models,
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error)
      throw error
    }
  }

  /**
   * Verificar se a API key é válida
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.getSubscriptionInfo()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Estimar custo em caracteres
   */
  estimateCharacters(text: string): number {
    return text.length
  }

  /**
   * Quebrar texto longo em chunks
   */
  splitTextIntoChunks(text: string, maxChars: number = 5000): string[] {
    const chunks: string[] = []
    
    // Quebrar por parágrafos primeiro
    const paragraphs = text.split(/\n\n+/)
    
    let currentChunk = ''
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length + 2 <= maxChars) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph
      } else {
        if (currentChunk) {
          chunks.push(currentChunk)
        }
        
        // Se o parágrafo for muito grande, quebrar por sentenças
        if (paragraph.length > maxChars) {
          const sentences = paragraph.split(/[.!?]+\s+/)
          currentChunk = ''
          
          for (const sentence of sentences) {
            if (currentChunk.length + sentence.length + 2 <= maxChars) {
              currentChunk += (currentChunk ? '. ' : '') + sentence
            } else {
              if (currentChunk) {
                chunks.push(currentChunk + '.')
              }
              currentChunk = sentence
            }
          }
        } else {
          currentChunk = paragraph
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk)
    }
    
    return chunks
  }

  /**
   * Processar texto longo gerando múltiplos áudios
   */
  async textToSpeechLong(
    text: string,
    voiceId: string,
    options?: Omit<TTSOptions, 'text' | 'voiceId'>
  ): Promise<TTSResult[]> {
    const chunks = this.splitTextIntoChunks(text)
    const results: TTSResult[] = []

    for (const chunk of chunks) {
      const result = await this.textToSpeech({
        text: chunk,
        voiceId,
        ...options,
      })
      results.push(result)
    }

    return results
  }
}

/**
 * Vozes padrão recomendadas (IDs reais da ElevenLabs)
 */
export const RECOMMENDED_VOICES = {
  // Inglês
  rachel: '21m00Tcm4TlvDq8ikWAM', // Feminina, clara, versátil
  drew: '29vD33N1CtxCmqQRPOHJ', // Masculina, profunda, notícias
  clyde: '2EiwWnXFnvU5JabPnv8n', // Masculina, média, conversacional
  paul: '5Q0t7uMcjvnagumLfvZi', // Masculina, madura, narração
  
  // Multilíngue
  adam: 'pNInz6obpgDQGcFmaJgB', // Masculina, profunda, múltiplos idiomas
  antoni: 'ErXwobaYiN019PkySvjV', // Masculina, suave, bem articulada
  arnold: 'VR6AewLTigWG4xSOukaG', // Masculina, forte, crisp
  bella: 'EXAVITQu4vr4xnSDxMaL', // Feminina, jovem, conversacional
  domi: 'AZnzlk1XvdvUeBnXmlld', // Feminina, forte, confiante
  elli: 'MF3mGyEYCl7XYWbV9V6O', // Feminina, emotiva, expressiva
}

/**
 * Modelos disponíveis
 */
export const AVAILABLE_MODELS = {
  MULTILINGUAL_V2: 'eleven_multilingual_v2', // Melhor qualidade, múltiplos idiomas
  MONOLINGUAL_V1: 'eleven_monolingual_v1', // Apenas inglês, mais rápido
  TURBO_V2: 'eleven_turbo_v2', // Baixa latência, boa qualidade
}
