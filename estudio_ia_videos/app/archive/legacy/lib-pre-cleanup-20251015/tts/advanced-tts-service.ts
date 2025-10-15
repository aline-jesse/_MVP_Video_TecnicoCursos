

/**
 * Serviço Avançado de Text-to-Speech
 * Suporte para múltiplos providers e vozes brasileiras
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech'

export interface TTSRequest {
  voice_id: string
  format: 'mp3' | 'wav' | 'ogg'
  speed?: number
  pitch?: number
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited'
}

export interface TTSResponse {
  audio_url: string
  duration: number
  format: string
  file_size: number
}

class AdvancedTTSService {
  private client: TextToSpeechClient | null = null
  private voiceLibrary: Map<string, any> = new Map()

  constructor() {
    this.initializeVoiceLibrary()
    this.initializeGoogleTTS()
  }

  private initializeVoiceLibrary() {
    // Brazilian Portuguese voices
    this.voiceLibrary.set('br-female-1', {
      name: 'Ana Silva',
      provider: 'google',
      language: 'pt-BR',
      gender: 'FEMALE',
      voiceName: 'pt-BR-Neural2-A',
      naturalness: 0.95,
      description: 'Voz feminina brasileira natural e profissional'
    })

    this.voiceLibrary.set('br-male-1', {
      name: 'Carlos Santos',
      provider: 'google',
      language: 'pt-BR',
      gender: 'MALE',
      voiceName: 'pt-BR-Neural2-B',
      naturalness: 0.93,
      description: 'Voz masculina brasileira clara e confiável'
    })

    this.voiceLibrary.set('br-female-2', {
      name: 'Maria Eduarda',
      provider: 'google',
      language: 'pt-BR',
      gender: 'FEMALE',
      voiceName: 'pt-BR-Neural2-C',
      naturalness: 0.97,
      description: 'Voz feminina jovem e dinâmica'
    })

    this.voiceLibrary.set('br-narrator-1', {
      name: 'Narrator Profissional',
      provider: 'google',
      language: 'pt-BR',
      gender: 'MALE',
      voiceName: 'pt-BR-Standard-B',
      naturalness: 0.89,
      description: 'Voz de narrador para treinamentos corporativos'
    })
  }

  private initializeGoogleTTS() {
    try {
      // Initialize Google Cloud TTS if credentials are available
      if (process.env.GOOGLE_CLOUD_TTS_CREDENTIALS) {
        this.client = new TextToSpeechClient({
          keyFilename: process.env.GOOGLE_CLOUD_TTS_CREDENTIALS
        })
        console.log('✅ Google Cloud TTS initialized')
      }
    } catch (error) {
      console.warn('Google TTS not available, using fallback:', error)
    }
  }

  /**
   * Generate TTS audio
   */
  async generateTTS(text: string, options: TTSRequest): Promise<TTSResponse> {
    try {
      const voice = this.voiceLibrary.get(options.voice_id)
      
      if (!voice) {
        throw new Error(`Voice ${options.voice_id} not found`)
      }

      // Clean and optimize text for TTS
      const optimizedText = this.optimizeTextForTTS(text)

      if (this.client && voice.provider === 'google') {
        return await this.generateGoogleTTS(optimizedText, voice, options)
      } else {
        return await this.generateFallbackTTS(optimizedText, voice, options)
      }

    } catch (error) {
      console.error('TTS generation error:', error)
      throw new Error('Failed to generate TTS audio')
    }
  }

  /**
   * Generate TTS using Google Cloud
   */
  private async generateGoogleTTS(
    text: string, 
    voice: any, 
    options: TTSRequest
  ): Promise<TTSResponse> {
    
    const request = {
      input: { text },
      voice: {
        languageCode: voice.language,
        name: voice.voiceName,
        ssmlGender: voice.gender
      },
      audioConfig: {
        audioEncoding: this.getGoogleAudioFormat(options.format),
        speakingRate: options.speed || 1.0,
        pitch: (options.pitch || 1.0) * 2 - 2, // Convert to Google's range (-20 to 20)
        effectsProfileId: ['telephony-class-application']
      }
    }

    const [response] = await this.client!.synthesizeSpeech(request) as unknown as [any]
    
    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS')
    }

    // In production, save to temporary file and upload to S3
    const audioUrl = await this.saveAudioFile(response.audioContent, options.format)
    
    return {
      audio_url: audioUrl,
      duration: this.estimateDuration(text),
      format: options.format,
      file_size: response.audioContent.length
    }
  }

  /**
   * Fallback TTS for demo/development
   */
  private async generateFallbackTTS(
    text: string,
    voice: any,
    options: TTSRequest
  ): Promise<TTSResponse> {
    
    // Simulate TTS generation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const duration = this.estimateDuration(text)
    
    return {
      audio_url: `/temp-audio/tts_${Date.now()}.${options.format}`,
      duration,
      format: options.format,
      file_size: duration * 32000 // Rough estimate: 32KB per second
    }
  }

  /**
   * Optimize text for better TTS output
   */
  private optimizeTextForTTS(text: string): string {
    return text
      // Add pauses after sentences
      .replace(/\./g, '. <break time="0.5s"/>')
      .replace(/:/g, ': <break time="0.3s"/>')
      .replace(/;/g, '; <break time="0.3s"/>')
      // Normalize acronyms
      .replace(/NR-?(\d+)/g, 'Norma Regulamentadora $1')
      .replace(/EPI/g, 'E P I')
      .replace(/EPC/g, 'E P C')
      // Add emphasis to important terms
      .replace(/\b(atenção|importante|cuidado|perigo)\b/gi, '<emphasis level="strong">$1</emphasis>')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Estimate audio duration
   */
  private estimateDuration(text: string): number {
    // Portuguese: approximately 2.5 characters per second
    const wordsPerMinute = 150
    const charactersPerSecond = 2.5
    
    const duration = Math.max(2, Math.ceil(text.length / charactersPerSecond))
    return duration
  }

  /**
   * Get Google TTS audio format
   */
  private getGoogleAudioFormat(format: string): 'MP3' | 'LINEAR16' | 'OGG_OPUS' {
    switch (format) {
      case 'mp3': return 'MP3'
      case 'wav': return 'LINEAR16' 
      case 'ogg': return 'OGG_OPUS'
      default: return 'MP3'
    }
  }

  /**
   * Save audio file (mock implementation)
   */
  private async saveAudioFile(audioContent: any, format: string): Promise<string> {
    // In production, save to temporary file and upload to S3
    const filename = `tts_${Date.now()}.${format}`
    
    // Mock implementation
    return `/temp-audio/${filename}`
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    const voices: any[] = []
    
    for (const [id, voice] of this.voiceLibrary) {
      voices.push({
        id,
        name: voice.name,
        language: voice.language,
        gender: voice.gender.toLowerCase(),
        naturalness: voice.naturalness,
        description: voice.description,
        provider: voice.provider
      })
    }
    
    return voices.sort((a, b) => b.naturalness - a.naturalness)
  }

  /**
   * Test voice with sample text
   */
  async testVoice(voiceId: string, sampleText?: string): Promise<TTSResponse> {
    const defaultText = "Olá, esta é uma demonstração da nossa tecnologia de síntese de voz. Como você pode ouvir, a qualidade é muito natural."
    
    return this.generateTTS(sampleText || defaultText, {
      voice_id: voiceId,
      format: 'mp3',
      speed: 1.0,
      pitch: 1.0
    })
  }

  /**
   * Batch TTS generation
   */
  async generateBatchTTS(
    texts: string[],
    options: TTSRequest
  ): Promise<TTSResponse[]> {
    
    const results: TTSResponse[] = []
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i]
      
      try {
        const result = await this.generateTTS(text, options)
        results.push(result)
        
        // Small delay between requests to avoid rate limiting
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
      } catch (error) {
        console.error(`Failed to generate TTS for text ${i}:`, error)
        
        // Add error placeholder
        results.push({
          audio_url: '',
          duration: 0,
          format: options.format,
          file_size: 0
        })
      }
    }
    
    return results
  }
}

// Export service instance and helper function
export const advancedTTSService = new AdvancedTTSService()

export async function generateTTS(text: string, options: TTSRequest): Promise<TTSResponse> {
  return advancedTTSService.generateTTS(text, options)
}

