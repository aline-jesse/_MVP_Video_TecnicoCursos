
export interface TTSVoice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female'
  description: string
  preview?: string
}

export const GOOGLE_TTS_VOICES: TTSVoice[] = [
  {
    id: 'pt-BR-Neural2-A',
    name: 'Ana Clara',
    language: 'pt-BR',
    gender: 'female',
    description: 'Voz neural feminina brasileira, suave e profissional'
  },
  {
    id: 'pt-BR-Neural2-B',
    name: 'João Pedro',
    language: 'pt-BR', 
    gender: 'male',
    description: 'Voz neural masculina brasileira, clara e confiante'
  },
  {
    id: 'pt-BR-Neural2-C',
    name: 'Camila',
    language: 'pt-BR',
    gender: 'female',
    description: 'Voz neural feminina jovem, dinâmica'
  },
  {
    id: 'pt-BR-Wavenet-A',
    name: 'Ricardo',
    language: 'pt-BR',
    gender: 'male',
    description: 'Voz Wavenet masculina madura, autoritativa'
  },
  {
    id: 'pt-BR-Wavenet-B',
    name: 'Mariana',
    language: 'pt-BR',
    gender: 'female',
    description: 'Voz Wavenet feminina elegante, para narração'
  },
  {
    id: 'pt-BR-Standard-A',
    name: 'Carlos',
    language: 'pt-BR',
    gender: 'male',
    description: 'Voz padrão masculina estável, boa para documentários'
  }
]

export interface TTSOptions {
  text: string
  voiceId: string
  speed?: number // 0.25 to 4.0
  pitch?: number // -20 to 20
  volume?: number // -96 to 16 dB
}

export async function generateTTS(options: TTSOptions): Promise<string> {
  try {
    // If no Google TTS API key is provided, return mock audio URL
    if (!process.env.GOOGLE_TTS_API_KEY) {
      console.log('Google TTS API key not found, using demo mode')
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      return '/audio/demo-tts.mp3' // Mock audio file
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: options.text },
          voice: {
            languageCode: 'pt-BR',
            name: options.voiceId,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: options.speed || 1.0,
            pitch: options.pitch || 0,
            volumeGainDb: options.volume || 0,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.audioContent) {
      throw new Error('No audio content received from Google TTS')
    }

    // Convert base64 audio to blob URL
    const audioBuffer = Buffer.from(data.audioContent, 'base64')
    const blob = new Blob([audioBuffer], { type: 'audio/mp3' })
    
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('TTS generation error:', error)
    throw new Error('Erro ao gerar áudio TTS')
  }
}

export function estimateAudioDuration(text: string, speed: number = 1.0): number {
  // Average speaking rate: ~150 words per minute
  const wordsPerMinute = 150 * speed
  const wordCount = text.split(/\s+/).length
  return Math.ceil((wordCount / wordsPerMinute) * 60)
}

export function getVoiceById(voiceId: string): TTSVoice | undefined {
  return GOOGLE_TTS_VOICES.find(voice => voice.id === voiceId)
}
