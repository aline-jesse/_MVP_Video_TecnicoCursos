/**
 * 🎙️ Azure TTS Provider (Fallback)
 * Integração com Azure Cognitive Services Speech
 */

// Importação condicional do Azure SDK
let sdk: any = null;
try {
  sdk = require('microsoft-cognitiveservices-speech-sdk');
} catch (error) {
  console.warn('⚠️ microsoft-cognitiveservices-speech-sdk não instalado. Azure TTS desabilitado.');
}

export interface AzureConfig {
  subscriptionKey: string
  region: string
}

export interface AzureVoice {
  name: string
  displayName: string
  localName: string
  shortName: string
  gender: 'Male' | 'Female'
  locale: string
  voiceType: 'Neural' | 'Standard'
}

export interface AzureTTSOptions {
  text: string
  voice: string
  rate?: string // '-50%' to '+50%'
  pitch?: string // '-50%' to '+50%'
  volume?: string // '0' to '100'
  outputFormat?: string
}

export class AzureTTSProvider {
  private subscriptionKey: string
  private region: string

  constructor(config: AzureConfig) {
    this.subscriptionKey = config.subscriptionKey
    this.region = config.region
  }

  /**
   * Gerar áudio a partir de texto
   */
  async textToSpeech(options: AzureTTSOptions): Promise<Buffer> {
    if (!sdk) {
      throw new Error('Azure SDK não disponível. Instale microsoft-cognitiveservices-speech-sdk.');
    }

    const {
      text,
      voice,
      rate = '0%',
      pitch = '0%',
      volume = '100',
      outputFormat = 'audio-16khz-128kbitrate-mono-mp3',
    } = options

    return new Promise((resolve, reject) => {
      try {
        const speechConfig = sdk.SpeechConfig.fromSubscription(
          this.subscriptionKey,
          this.region
        )
        
        speechConfig.speechSynthesisOutputFormat = 
          sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3

        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, undefined)

        // Construir SSML
        const ssml = `
          <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">
            <voice name="${voice}">
              <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
                ${this.escapeXml(text)}
              </prosody>
            </voice>
          </speak>
        `.trim()

        synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              const audio = Buffer.from(result.audioData)
              synthesizer.close()
              resolve(audio)
            } else {
              synthesizer.close()
              reject(new Error(`Speech synthesis failed: ${result.errorDetails}`))
            }
          },
          (error) => {
            synthesizer.close()
            reject(error)
          }
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Listar vozes disponíveis
   */
  async getVoices(): Promise<AzureVoice[]> {
    // Vozes Neural em Português do Brasil
    return [
      {
        name: 'pt-BR-FranciscaNeural',
        displayName: 'Francisca',
        localName: 'Francisca',
        shortName: 'pt-BR-FranciscaNeural',
        gender: 'Female',
        locale: 'pt-BR',
        voiceType: 'Neural',
      },
      {
        name: 'pt-BR-AntonioNeural',
        displayName: 'Antonio',
        localName: 'Antonio',
        shortName: 'pt-BR-AntonioNeural',
        gender: 'Male',
        locale: 'pt-BR',
        voiceType: 'Neural',
      },
      {
        name: 'pt-BR-BrendaNeural',
        displayName: 'Brenda',
        localName: 'Brenda',
        shortName: 'pt-BR-BrendaNeural',
        gender: 'Female',
        locale: 'pt-BR',
        voiceType: 'Neural',
      },
      {
        name: 'pt-BR-DonatoNeural',
        displayName: 'Donato',
        localName: 'Donato',
        shortName: 'pt-BR-DonatoNeural',
        gender: 'Male',
        locale: 'pt-BR',
        voiceType: 'Neural',
      },
    ]
  }

  /**
   * Escapar caracteres especiais XML
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * Validar credenciais
   */
  async validateCredentials(): Promise<boolean> {
    try {
      await this.textToSpeech({
        text: 'Test',
        voice: 'pt-BR-FranciscaNeural',
      })
      return true
    } catch (error) {
      return false
    }
  }
}

/**
 * Vozes recomendadas Azure (Português BR)
 */
export const AZURE_RECOMMENDED_VOICES = {
  francisca: 'pt-BR-FranciscaNeural', // Feminina, clara
  antonio: 'pt-BR-AntonioNeural', // Masculina, profissional
  brenda: 'pt-BR-BrendaNeural', // Feminina, jovem
  donato: 'pt-BR-DonatoNeural', // Masculina, madura
}
