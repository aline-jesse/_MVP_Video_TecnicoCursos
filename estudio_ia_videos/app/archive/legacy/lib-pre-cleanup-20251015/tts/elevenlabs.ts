
interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  description: string
  labels: {
    accent: string
    description: string
    age: string
    gender: string
  }
}

interface TTSOptions {
  voice_id: string
  text: string
  model_id?: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
}

export class ElevenLabsClient {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || 'demo-key'
  }

  async generateSpeech(options: TTSOptions): Promise<Buffer> {
    try {
      // For demo purposes, return a mock audio buffer
      if (this.apiKey === 'demo-key') {
        return Buffer.from('demo-audio-data')
      }

      const response = await fetch(`${this.baseUrl}/text-to-speech/${options.voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: options.text,
          model_id: options.model_id || 'eleven_multilingual_v2',
          voice_settings: options.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`)
      }

      const audioBuffer = await response.arrayBuffer()
      return Buffer.from(audioBuffer)

    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      // Return Brazilian Portuguese voices for demo
      return [
        {
          voice_id: 'br-female-1',
          name: 'Ana (Brasileiro)',
          category: 'generated',
          description: 'Voz feminina brasileira natural',
          labels: {
            accent: 'brazilian',
            description: 'Professional female voice',
            age: 'middle_aged',
            gender: 'female'
          }
        },
        {
          voice_id: 'br-male-1', 
          name: 'Carlos (Brasileiro)',
          category: 'generated',
          description: 'Voz masculina brasileira natural',
          labels: {
            accent: 'brazilian',
            description: 'Professional male voice',
            age: 'middle_aged',
            gender: 'male'
          }
        }
      ]
    } catch (error) {
      console.error('Failed to fetch voices:', error)
      return []
    }
  }

  // Estimate cost for text (characters)
  calculateCost(text: string): number {
    const charCount = text.length
    const costPerChar = 0.0003 // $0.30 per 1K characters (ElevenLabs pricing)
    return charCount * costPerChar
  }

  // Split long text into chunks for API limits
  splitText(text: string, maxChars = 2500): string[] {
    if (text.length <= maxChars) {
      return [text]
    }

    const chunks: string[] = []
    const sentences = text.split(/[.!?]+/)
    let currentChunk = ''

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChars) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = sentence
        } else {
          // Sentence too long, force split
          chunks.push(sentence.substring(0, maxChars))
          currentChunk = sentence.substring(maxChars)
        }
      } else {
        currentChunk += sentence + '.'
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }
}

// Singleton instance
export const elevenLabsClient = new ElevenLabsClient()
