
import { prisma } from '@/lib/database/prisma'

export interface TTSRequest {
  text: string
  voiceId?: string
  language?: string
  speed?: number
  pitch?: number
  volume?: number
  userId?: string
  projectId?: string
}

export interface TTSResponse {
  audioUrl: string
  duration: number
  cost: number
  quality: number
  format: string
}

export interface BrazilianVoice {
  id: string
  name: string
  gender: 'male' | 'female'
  age: 'young' | 'adult' | 'senior'
  accent: string
  description: string
  sampleUrl: string
  isPremium: boolean
}

// Brazilian voices collection
export const BRAZILIAN_VOICES: BrazilianVoice[] = [
  {
    id: 'br-carlos-adult',
    name: 'Carlos',
    gender: 'male',
    age: 'adult',
    accent: 'São Paulo',
    description: 'Voz masculina profissional, ideal para treinamentos corporativos',
    sampleUrl: '/voices/samples/carlos.mp3',
    isPremium: false
  },
  {
    id: 'br-maria-adult',
    name: 'Maria',
    gender: 'female',
    age: 'adult',
    accent: 'Rio de Janeiro',
    description: 'Voz feminina calorosa e amigável',
    sampleUrl: '/voices/samples/maria.mp3',
    isPremium: false
  },
  {
    id: 'br-joao-young',
    name: 'João',
    gender: 'male',
    age: 'young',
    accent: 'Belo Horizonte',
    description: 'Voz jovem e dinâmica, perfeita para conteúdo moderno',
    sampleUrl: '/voices/samples/joao.mp3',
    isPremium: true
  },
  {
    id: 'br-ana-adult',
    name: 'Ana',
    gender: 'female',
    age: 'adult',
    accent: 'Porto Alegre',
    description: 'Voz clara e articulada, excelente para conteúdo técnico',
    sampleUrl: '/voices/samples/ana.mp3',
    isPremium: true
  },
  {
    id: 'br-rodrigo-senior',
    name: 'Rodrigo',
    gender: 'male',
    age: 'senior',
    accent: 'Salvador',
    description: 'Voz experiente e confiável, ideal para conteúdo institucional',
    sampleUrl: '/voices/samples/rodrigo.mp3',
    isPremium: true
  },
  {
    id: 'br-isabella-young',
    name: 'Isabella',
    gender: 'female',
    age: 'young',
    accent: 'Recife',
    description: 'Voz jovem e energética com sotaque nordestino',
    sampleUrl: '/voices/samples/isabella.mp3',
    isPremium: true
  }
]

class TTSService {
  private apiKey: string
  
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || process.env.AZURE_TTS_KEY || ''
  }

  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      // For demo purposes, simulate TTS generation
      const audioUrl = await this.simulateTTSGeneration(request)
      
      // Calculate estimated values
      const wordCount = request.text.split(' ').length
      const estimatedDuration = (wordCount / 150) * 60 // ~150 words per minute
      const estimatedCost = wordCount * 0.0001 // $0.0001 per word
      
      // Save generation to database for tracking
      if (request.userId) {
        await this.saveGenerationRecord(request, {
          audioUrl,
          duration: estimatedDuration,
          cost: estimatedCost,
          quality: 0.92,
          format: 'mp3'
        })
      }
      
      return {
        audioUrl,
        duration: estimatedDuration,
        cost: estimatedCost,
        quality: 0.92,
        format: 'mp3'
      }
    } catch (error) {
      console.error('TTS Generation Error:', error)
      throw new Error('Failed to generate speech')
    }
  }

  async generateSpeechElevenLabs(request: TTSRequest): Promise<string> {
    // Production implementation would use ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + (request.voiceId || 'br-carlos-adult'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: request.text,
        model_id: 'eleven_multilingual_v2',
        language_code: 'pt-BR',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speaking_rate: request.speed || 1.0,
          pitch: request.pitch || 0.0
        }
      })
    })

    if (!response.ok) {
      throw new Error('ElevenLabs API error')
    }

    // In production, would process the audio response and upload to S3
    return '/demo-audio.mp3'
  }

  async generateSpeechAzure(request: TTSRequest): Promise<string> {
    // Production implementation would use Azure Cognitive Services
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">
        <voice name="pt-BR-AntonioNeural">
          <prosody rate="${(request.speed || 1.0) * 100}%" pitch="${request.pitch || 0}Hz">
            ${request.text}
          </prosody>
        </voice>
      </speak>
    `

    // Would make actual Azure API call here
    return '/demo-audio.mp3'
  }

  private async simulateTTSGeneration(request: TTSRequest): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return demo audio URL (in production, would be actual generated audio)
    return `/demo-audio/${request.voiceId || 'br-carlos-adult'}.mp3`
  }

  private async saveGenerationRecord(request: TTSRequest, response: TTSResponse) {
    try {
      await prisma.aIGeneration.create({
        data: {
          projectId: request.projectId || 'temp-project', // Add fallback project ID
          userId: request.userId!,
          type: 'narration',
          provider: 'elevenlabs',
          inputText: request.text.substring(0, 1000), // Truncate for storage
          outputUrl: response.audioUrl,
          characters: request.text.length,
          cost: response.cost,
          status: 'completed',
          settings: {
            voiceId: request.voiceId,
            speed: request.speed,
            pitch: request.pitch,
            volume: request.volume
          }
        }
      })
    } catch (error) {
      console.error('Error saving TTS generation record:', error)
    }
  }

  async getVoiceById(voiceId: string): Promise<BrazilianVoice | null> {
    return BRAZILIAN_VOICES.find(voice => voice.id === voiceId) || null
  }

  async getAllVoices(): Promise<BrazilianVoice[]> {
    return BRAZILIAN_VOICES
  }

  async getVoicesByFilter(filter: {
    gender?: 'male' | 'female'
    age?: 'young' | 'adult' | 'senior'
    accent?: string
    isPremium?: boolean
  }): Promise<BrazilianVoice[]> {
    return BRAZILIAN_VOICES.filter(voice => {
      if (filter.gender && voice.gender !== filter.gender) return false
      if (filter.age && voice.age !== filter.age) return false
      if (filter.accent && voice.accent !== filter.accent) return false
      if (filter.isPremium !== undefined && voice.isPremium !== filter.isPremium) return false
      return true
    })
  }

  // Voice cloning functionality
  async createCustomVoice(userId: string, voiceData: {
    name: string
    description?: string
    sampleFiles: string[] // S3 keys of uploaded audio samples
  }): Promise<string> {
    try {
      // Create voice profile record
      const voiceProfile = await prisma.voiceProfile.create({
        data: {
          userId,
          name: voiceData.name,
          description: voiceData.description,
          language: 'pt-BR',
          gender: 'neutral', // Default gender
          provider: 'elevenlabs', // Default provider
          providerId: `voice-${Date.now()}`, // Generate provider ID
          trainingStatus: 'training'
        }
      })

      // In production, would start actual voice training process
      // For now, simulate training completion after a delay
      setTimeout(async () => {
        await prisma.voiceProfile.update({
          where: { id: voiceProfile.id },
          data: {
            trainingStatus: 'ready',
            quality: 0.85 + Math.random() * 0.1 // Simulate quality score
          }
        })
      }, 5000) // 5 second delay for demo

      return voiceProfile.id
    } catch (error) {
      console.error('Error creating custom voice:', error)
      throw new Error('Failed to create custom voice')
    }
  }

  async getUserVoiceProfiles(userId: string) {
    return prisma.voiceProfile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getVoiceProfileById(id: string) {
    return prisma.voiceProfile.findUnique({
      where: { id }
    })
  }
}

export const ttsService = new TTSService()
