
/**
 * 🎙️ ElevenLabs TTS Provider - Production Implementation
 * Real integration with ElevenLabs API for high-quality TTS
 */

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: 'premade' | 'cloned' | 'professional' | 'generated'
  settings: {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
  labels: {
    accent?: string
    description?: string
    age?: string
    gender?: string
    use_case?: string
  }
  samples?: {
    sample_id: string
    file_name: string
    mime_type: string
    size_bytes: number
  }[]
  preview_url?: string
}

export interface TTSGenerationOptions {
  voice_id: string
  text: string
  model_id: 'eleven_multilingual_v2' | 'eleven_monolingual_v1' | 'eleven_multilingual_v1'
  voice_settings: {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
  output_format?: 'mp3_44100_128' | 'pcm_16000' | 'pcm_22050' | 'pcm_44100'
  optimize_streaming_latency?: 0 | 1 | 2 | 3 | 4
}

export interface TTSGenerationResult {
  success: boolean
  audio_url?: string
  audio_buffer?: ArrayBuffer
  metadata?: {
    character_count: number
    request_id: string
    generation_time: number
    voice_id: string
    model_id: string
  }
  error?: string
}

export interface VoiceCloneOptions {
  name: string
  files: File[]
  description?: string
  labels?: Record<string, string>
}

export interface VoiceCloneResult {
  success: boolean
  voice_id?: string
  name?: string
  error?: string
}

/**
 * ElevenLabs TTS Provider Class
 */
export class ElevenLabsProvider {
  private readonly API_BASE = 'https://api.elevenlabs.io/v1'
  private readonly apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || ''
    
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required')
    }
  }

  /**
   * Get all available voices
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.API_BASE}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.voices || []

    } catch (error) {
      console.error('Error fetching voices:', error)
      return this.getFallbackVoices()
    }
  }

  /**
   * Get specific voice details
   */
  async getVoice(voiceId: string): Promise<ElevenLabsVoice | null> {
    try {
      const response = await fetch(`${this.API_BASE}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Voice not found: ${voiceId}`)
      }

      return await response.json()

    } catch (error) {
      console.error(`Error fetching voice ${voiceId}:`, error)
      return null
    }
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(options: TTSGenerationOptions): Promise<TTSGenerationResult> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.API_BASE}/text-to-speech/${options.voice_id}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: options.text,
          model_id: options.model_id,
          voice_settings: options.voice_settings,
          output_format: options.output_format || 'mp3_44100_128',
          optimize_streaming_latency: options.optimize_streaming_latency || 0
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`TTS Generation failed: ${response.status} - ${errorData.detail || response.statusText}`)
      }

      const audio_buffer = await response.arrayBuffer()
      const generationTime = Date.now() - startTime

      // Convert to base64 URL for easy handling
      const audio_url = `data:audio/mpeg;base64,${Buffer.from(audio_buffer).toString('base64')}`

      return {
        success: true,
        audio_url,
        audio_buffer,
        metadata: {
          character_count: options.text.length,
          request_id: response.headers.get('request-id') || `req_${Date.now()}`,
          generation_time: generationTime,
          voice_id: options.voice_id,
          model_id: options.model_id
        }
      }

    } catch (error) {
      console.error('TTS Generation Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TTS generation failed'
      }
    }
  }

  /**
   * Generate speech with streaming
   */
  async generateSpeechStream(options: TTSGenerationOptions): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const response = await fetch(`${this.API_BASE}/text-to-speech/${options.voice_id}/stream`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: options.text,
          model_id: options.model_id,
          voice_settings: options.voice_settings,
          optimize_streaming_latency: options.optimize_streaming_latency || 3
        })
      })

      if (!response.ok) {
        throw new Error(`Streaming TTS failed: ${response.status}`)
      }

      return response.body

    } catch (error) {
      console.error('Streaming TTS Error:', error)
      return null
    }
  }

  /**
   * Clone voice from audio samples
   */
  async cloneVoice(options: VoiceCloneOptions): Promise<VoiceCloneResult> {
    try {
      const formData = new FormData()
      
      formData.append('name', options.name)
      
      if (options.description) {
        formData.append('description', options.description)
      }

      if (options.labels) {
        formData.append('labels', JSON.stringify(options.labels))
      }

      // Add audio files
      options.files.forEach((file, index) => {
        formData.append(`files`, file, file.name)
      })

      const response = await fetch(`${this.API_BASE}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Voice cloning failed: ${response.status} - ${errorData.detail || response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        voice_id: result.voice_id,
        name: result.name
      }

    } catch (error) {
      console.error('Voice Cloning Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Voice cloning failed'
      }
    }
  }

  /**
   * Delete a cloned voice
   */
  async deleteVoice(voiceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      return response.ok

    } catch (error) {
      console.error(`Error deleting voice ${voiceId}:`, error)
      return false
    }
  }

  /**
   * Get user account info and usage
   */
  async getUserInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Error getting user info:', error)
      return null
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get usage stats: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Error getting usage stats:', error)
      return null
    }
  }

  /**
   * Fallback voices when API is unavailable
   */
  private getFallbackVoices(): ElevenLabsVoice[] {
    return [
      {
        voice_id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam (English)',
        category: 'premade',
        settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.0,
          use_speaker_boost: true
        },
        labels: {
          accent: 'american',
          description: 'Middle aged',
          age: 'middle_aged',
          gender: 'male',
          use_case: 'narration'
        }
      },
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella (English)',
        category: 'premade',
        settings: {
          stability: 0.71,
          similarity_boost: 0.87,
          style: 0.0,
          use_speaker_boost: true
        },
        labels: {
          accent: 'american',
          description: 'Young adult',
          age: 'young',
          gender: 'female',
          use_case: 'narration'
        }
      }
    ]
  }
}

// Export singleton instance
export const elevenLabsProvider = new ElevenLabsProvider()

// Export helper functions
export async function generateTTS(
  text: string, 
  voiceId: string = 'pNInz6obpgDQGcFmaJgB',
  options?: Partial<TTSGenerationOptions>
): Promise<TTSGenerationResult> {
  return elevenLabsProvider.generateSpeech({
    voice_id: voiceId,
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.0,
      use_speaker_boost: true
    },
    ...options
  })
}

export async function getAvailableVoices(): Promise<ElevenLabsVoice[]> {
  return elevenLabsProvider.getVoices()
}

export async function cloneVoiceFromFiles(
  name: string, 
  files: File[], 
  description?: string
): Promise<VoiceCloneResult> {
  return elevenLabsProvider.cloneVoice({
    name,
    files,
    description
  })
}
