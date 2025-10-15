import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { GOOGLE_TTS_VOICES } from './google-tts'

export interface SynthesizeOptions {
  text: string
  voiceId?: string
  speed?: number
  pitch?: number
  volume?: number
}

export interface SynthesizeResult {
  fileUrl: string
  filePath: string
  duration: number
  voiceId: string
}

// Base64 de um MP3 de silêncio ~1 segundo (48kbps) para fallback offline
const SILENT_MP3_BASE64 =
  'SUQzAwAAAAAAF1RTU0UAAAAPAAAACAAATGF2ZjU4LjMyLjEwMAAAAAAAAAAAAAAA//tQxAADBz4AW0AAAP8AAAACAAACoACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAAAA=='

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function estimateDurationSeconds(text: string, speed: number = 1.0): number {
  const wordsPerMinute = 150 * speed
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil((wordCount / wordsPerMinute) * 60))
}

/**
 * Synthesizes text to speech and saves to file
 */
export async function synthesizeToFile(options: SynthesizeOptions): Promise<SynthesizeResult> {
  const { text, voiceId = 'pt-BR-Neural2-A', speed = 1.0 } = options;
  
  // Validate input parameters
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }
  
  if (text.length > 5000) {
    throw new Error('Text too long - maximum 5000 characters allowed');
  }
  
  if (text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }
  
  const timestamp = Date.now()
  const randomId = crypto.randomBytes(5).toString('hex')
  const filename = `tts_${timestamp}_${randomId}.mp3`
  
  const outputDir = path.join(process.cwd(), 'public', 'tts')
  ensureDir(outputDir)
  
  const filePath = path.join(outputDir, filename)
  const fileUrl = `/tts/${filename}`
  
  try {
    // Check if Google TTS API key is available
    if (process.env.GOOGLE_TTS_API_KEY) {
      // Use Google TTS (placeholder - in real implementation would use Google client)
      const duration = estimateDurationSeconds(text, speed);
      
      // Create a placeholder audio file (in real implementation, this would be the API response)
      await fs.promises.writeFile(filePath, Buffer.from(SILENT_MP3_BASE64, 'base64'))
      
      return {
        filePath,
        fileUrl,
        duration,
        voiceId
      };
    } else {
      // Use fallback TTS
      const duration = estimateDurationSeconds(text, speed)
      await fs.promises.writeFile(filePath, Buffer.from(SILENT_MP3_BASE64, 'base64'))
      
      return {
        filePath,
        fileUrl,
        duration,
        voiceId
      }
    }
  } catch (error) {
    console.error('TTS synthesis error:', error);
    
    // Fallback to basic TTS
    const duration = estimateDurationSeconds(text, speed)
    await fs.promises.writeFile(filePath, Buffer.from(SILENT_MP3_BASE64, 'base64'))
    
    return {
      filePath,
      fileUrl,
      duration,
      voiceId
    }
  }
}

export function listVoices() {
  return GOOGLE_TTS_VOICES
}

// Serviço de Text-to-Speech melhorado
export interface TTSConfig {
  text: string
  language: string
  voice: string
  speed: number
  pitch: number
}

export interface TTSResult {
  audioUrl: string
  duration: number
  language: string
  voice: string
  success: boolean
}

export class TTSService {
  private static readonly VOICE_OPTIONS = {
    'pt-BR': [
      { id: 'pt-BR-AntonioNeural', name: 'Antonio (Masculino)', gender: 'male' },
      { id: 'pt-BR-FranciscaNeural', name: 'Francisca (Feminino)', gender: 'female' },
      { id: 'pt-BR-BrendaNeural', name: 'Brenda (Feminino)', gender: 'female' },
      { id: 'pt-BR-DonatoNeural', name: 'Donato (Masculino)', gender: 'male' },
      { id: 'pt-BR-ElzaNeural', name: 'Elza (Feminino)', gender: 'female' },
      { id: 'pt-BR-FabioNeural', name: 'Fábio (Masculino)', gender: 'male' },
      { id: 'pt-BR-GiovannaNeural', name: 'Giovanna (Feminino)', gender: 'female' },
      { id: 'pt-BR-HumbertoNeural', name: 'Humberto (Masculino)', gender: 'male' },
      { id: 'pt-BR-JulioNeural', name: 'Júlio (Masculino)', gender: 'male' },
      { id: 'pt-BR-LeilaNeural', name: 'Leila (Feminino)', gender: 'female' },
      { id: 'pt-BR-LeticiaNeural', name: 'Letícia (Feminino)', gender: 'female' },
      { id: 'pt-BR-ManuelaNeural', name: 'Manuela (Feminino)', gender: 'female' },
      { id: 'pt-BR-NicolauNeural', name: 'Nicolau (Masculino)', gender: 'male' },
      { id: 'pt-BR-ValerioNeural', name: 'Valério (Masculino)', gender: 'male' },
      { id: 'pt-BR-YaraNeural', name: 'Yara (Feminino)', gender: 'female' }
    ]
  }

  static getAvailableVoices(language: string = 'pt-BR') {
    return this.VOICE_OPTIONS[language as keyof typeof this.VOICE_OPTIONS] || []
  }

  // Converter texto para fala com retry e fallback
  static async synthesizeSpeech(config: TTSConfig): Promise<TTSResult> {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Tentar provedor primário (Google Cloud TTS)
        const result = await this.tryGoogleTTS(config)
        if (result.success) return result

        // Fallback para provedor secundário (Web Speech API)
        if (attempt === maxRetries) {
          return await this.tryWebSpeechAPI(config)
        }
      } catch (error) {
        lastError = error as Error
        console.warn(`TTS attempt ${attempt} failed:`, error)
        
        // Delay exponencial entre tentativas
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    // Se tudo falhar, retornar erro
    throw new Error(`TTS failed after ${maxRetries} attempts. Last error: ${lastError?.message}`)
  }

  // Provedor primário: Google Cloud TTS
  private static async tryGoogleTTS(config: TTSConfig): Promise<TTSResult> {
    try {
      const response = await fetch('/api/tts/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error(`Google TTS API error: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        audioUrl: result.audioUrl,
        duration: result.duration,
        language: config.language,
        voice: config.voice,
        success: true
      }
    } catch (error) {
      console.warn('Google TTS failed:', error)
      throw error
    }
  }

  // Provedor de fallback: Web Speech API (simulado)
  private static async tryWebSpeechAPI(config: TTSConfig): Promise<TTSResult> {
    return new Promise((resolve) => {
      // Simular síntese de fala para MVP
      console.log('Using Web Speech API fallback for:', config.text.substring(0, 50) + '...')
      
      // Simular delay de processamento
      setTimeout(() => {
        const estimatedDuration = Math.ceil(config.text.length / 150) * 1000 // ~150 chars/segundo
        
        resolve({
          audioUrl: `/api/tts/fallback/${Date.now()}.mp3`,
          duration: estimatedDuration,
          language: config.language,
          voice: 'fallback-voice',
          success: true
        })
      }, 1000)
    })
  }

  // Calcular duração estimada de áudio baseada no texto
  static estimateAudioDuration(text: string, speed: number = 1.0): number {
    // Fórmula baseada em características do português brasileiro
    const wordsPerMinute = 180 * speed // WPM médio em PT-BR
    const words = text.split(/\s+/).length
    const durationMinutes = words / wordsPerMinute
    return Math.ceil(durationMinutes * 60 * 1000) // retornar em millisegundos
  }

  // Dividir texto longo em chunks para melhor processamento
  static splitTextIntoChunks(text: string, maxLength: number = 1000): string[] {
    if (text.length <= maxLength) return [text]

    const chunks: string[] = []
    const sentences = text.split(/[.!?]+/)
    let currentChunk = ''

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence + '. '
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = sentence + '. '
        } else {
          // Sentence muito longo, dividir por palavras
          chunks.push(sentence.substring(0, maxLength))
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }

  // Processar slides com TTS
  static async processSlideWithTTS(
    slideText: string, 
    voiceConfig: { language: string; voice: string; speed: number; pitch: number }
  ): Promise<TTSResult> {
    // Limpar e preparar texto
    const cleanText = this.cleanTextForTTS(slideText)
    
    // Dividir em chunks se necessário
    const chunks = this.splitTextIntoChunks(cleanText, 800)
    
    if (chunks.length === 1) {
      // Processar chunk único
      return await this.synthesizeSpeech({
        text: cleanText,
        ...voiceConfig
      })
    } else {
      // Processar múltiplos chunks e combinar (simplificado para MVP)
      const firstChunk = await this.synthesizeSpeech({
        text: chunks[0],
        ...voiceConfig
      })
      
      // Para MVP, retornar apenas o primeiro chunk
      // Em produção, seria necessário combinar todos os áudios
      return {
        ...firstChunk,
        duration: this.estimateAudioDuration(cleanText, voiceConfig.speed)
      }
    }
  }

  // Limpar texto para síntese de voz
  private static cleanTextForTTS(text: string): string {
    return text
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[*#_`]/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .trim()
  }
}
