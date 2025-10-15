
/**
 * 🎙️ ELEVENLABS SERVICE - Sprint 44
 * Integração real com ElevenLabs para voice cloning
 */

import { Redis } from 'ioredis'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

// Redis client para cache
let redis: Redis | null = null
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    })
  }
} catch (error) {
  console.warn('⚠️ Redis não configurado, cache desabilitado')
}

export interface VoiceTrainingJob {
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  voiceId?: string
  error?: string
}

export class ElevenLabsService {
  /**
   * Criar voz customizada a partir de samples
   */
  static async createVoice(name: string, samples: Buffer[]): Promise<VoiceTrainingJob> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY não configurada')
    }

    const formData = new FormData()
    formData.append('name', name)
    
    samples.forEach((buffer, i) => {
      const blob = new Blob([buffer], { type: 'audio/mpeg' })
      formData.append(`files`, blob, `sample${i}.mp3`)
    })

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        jobId: data.voice_id,
        status: 'completed',
        progress: 100,
        voiceId: data.voice_id
      }
    } catch (error) {
      console.error('Erro ao criar voz:', error)
      throw error
    }
  }

  /**
   * Verificar status do treinamento (job)
   */
  static async getJobStatus(jobId: string): Promise<VoiceTrainingJob> {
    // ElevenLabs não tem API de job separada, retorna como completo
    return {
      jobId,
      status: 'completed',
      progress: 100,
      voiceId: jobId
    }
  }

  /**
   * Gerar TTS com voz customizada + cache Redis
   */
  static async generateTTS(
    voiceId: string,
    text: string,
    options: {
      stability?: number
      similarityBoost?: number
      style?: number
    } = {}
  ): Promise<Buffer> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY não configurada')
    }

    // Verificar cache primeiro
    const cacheKey = `tts:elevenlabs:${voiceId}:${Buffer.from(text).toString('base64').slice(0, 32)}`
    
    if (redis) {
      try {
        const cached = await redis.getBuffer(cacheKey)
        if (cached) {
          console.log('✓ TTS cache hit')
          return cached
        }
      } catch (error) {
        console.warn('Erro ao ler cache:', error)
      }
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0
        }
      })
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS error: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Salvar no cache (TTL 1 hora)
    if (redis) {
      try {
        await redis.setex(cacheKey, 3600, buffer)
      } catch (error) {
        console.warn('Erro ao salvar cache:', error)
      }
    }

    return buffer
  }

  /**
   * Listar vozes disponíveis
   */
  static async listVoices(): Promise<any[]> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY não configurada')
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.voices
  }

  /**
   * Deletar voz customizada
   */
  static async deleteVoice(voiceId: string): Promise<void> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY não configurada')
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }
  }
}
