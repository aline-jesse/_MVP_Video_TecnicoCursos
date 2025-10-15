

/**
 * Azure Cognitive Speech Services para Vozes Brasileiras Profissionais
 * Integração com vozes neurais de alta qualidade em português brasileiro
 */

export interface AzureVoice {
  name: string
  displayName: string
  localName: string
  gender: 'Male' | 'Female'
  locale: string
  styleList?: string[]
  sampleRateHertz: string
  voiceType: 'Neural' | 'Standard'
}

interface AzureTTSRequest {
  text: string
  voice: string
  style?: string
  speed?: number
  pitch?: number
  volume?: number
  format?: 'mp3' | 'wav' | 'ogg'
}

interface AzureTTSResponse {
  audioUrl: string
  duration: number
  quality: {
    neural: boolean
    sampleRate: string
    bitrate: string
  }
  cost: number
}

export class AzureSpeechService {
  private endpoint: string
  private apiKey: string
  private region: string

  constructor() {
    this.endpoint = process.env.AZURE_SPEECH_ENDPOINT || 'https://brazilsouth.api.cognitive.microsoft.com'
    this.apiKey = process.env.AZURE_SPEECH_KEY || 'demo-key'
    this.region = process.env.AZURE_SPEECH_REGION || 'brazilsouth'
  }

  /**
   * Vozes neurais brasileiras disponíveis
   */
  static readonly BRAZILIAN_NEURAL_VOICES: AzureVoice[] = [
    {
      name: 'pt-BR-AntonioNeural',
      displayName: 'Antonio (Masculino)',
      localName: 'Antônio',
      gender: 'Male',
      locale: 'pt-BR',
      styleList: ['neutral', 'cheerful', 'sad', 'angry', 'fearful', 'disgruntled', 'serious', 'affectionate'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-FranciscaNeural',
      displayName: 'Francisca (Feminino)',
      localName: 'Francisca',
      gender: 'Female',
      locale: 'pt-BR',
      styleList: ['neutral', 'calm', 'cheerful', 'sad', 'angry', 'fearful', 'disgruntled', 'serious'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-BrendaNeural',
      displayName: 'Brenda (Feminino Jovem)',
      localName: 'Brenda',
      gender: 'Female',
      locale: 'pt-BR',
      styleList: ['neutral', 'cheerful', 'sad', 'angry', 'fearful', 'disgruntled', 'whispering'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-DonatoNeural',
      displayName: 'Donato (Masculino Maduro)',
      localName: 'Donato',
      gender: 'Male',
      locale: 'pt-BR',
      styleList: ['neutral', 'calm', 'cheerful', 'sad', 'angry', 'fearful', 'disgruntled'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-ElzaNeural',
      displayName: 'Elza (Feminino Madura)',
      localName: 'Elza',
      gender: 'Female',
      locale: 'pt-BR',
      styleList: ['neutral', 'calm', 'cheerful', 'sad', 'angry', 'fearful'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-FabioNeural',
      displayName: 'Fábio (Masculino Profissional)',
      localName: 'Fábio',
      gender: 'Male',
      locale: 'pt-BR',
      styleList: ['neutral', 'calm', 'cheerful', 'serious', 'affectionate'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-GiovannaNeural',
      displayName: 'Giovanna (Feminino Jovem)',
      localName: 'Giovanna',
      gender: 'Female',
      locale: 'pt-BR',
      styleList: ['neutral', 'cheerful', 'sad', 'angry', 'fearful', 'disgruntled'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-HumbertoNeural',
      displayName: 'Humberto (Masculino Narrador)',
      localName: 'Humberto',
      gender: 'Male',
      locale: 'pt-BR',
      styleList: ['neutral', 'calm', 'serious', 'documentary-narration'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-JuliaNeural',
      displayName: 'Julia (Feminino Executiva)',
      localName: 'Júlia',
      gender: 'Female',
      locale: 'pt-BR',
      styleList: ['neutral', 'calm', 'cheerful', 'serious', 'affectionate', 'newscast'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    },
    {
      name: 'pt-BR-LeticiaNeural',
      displayName: 'Letícia (Feminino Jovem)',
      localName: 'Letícia',
      gender: 'Female',
      locale: 'pt-BR',
      styleList: ['neutral', 'calm', 'cheerful', 'sad', 'angry', 'fearful'],
      sampleRateHertz: '24000',
      voiceType: 'Neural'
    }
  ]

  /**
   * Gerar fala usando Azure Speech Services
   */
  async generateSpeech(request: AzureTTSRequest): Promise<AzureTTSResponse> {
    if (this.apiKey === 'demo-key') {
      return this.generateDemoSpeech(request)
    }

    try {
      const voice = AzureSpeechService.BRAZILIAN_NEURAL_VOICES.find((v: AzureVoice) => v.name === request.voice)
      if (!voice) {
        throw new Error(`Voz ${request.voice} não encontrada`)
      }

      // Construir SSML para máximo controle
      const ssml = this.buildSSML(request.text, voice, {
        style: request.style || 'neutral',
        speed: request.speed || 1.0,
        pitch: request.pitch || 1.0,
        volume: request.volume || 1.0
      })

      const response = await fetch(`${this.endpoint}/sts/v1.0/issuetoken`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro de autenticação Azure: ${response.status}`)
      }

      const token = await response.text()

      // Fazer requisição TTS
      const ttsResponse = await fetch(`${this.endpoint}/sts/v1.0/Synthesize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': this.getAzureAudioFormat(request.format || 'mp3')
        },
        body: ssml
      })

      if (!ttsResponse.ok) {
        throw new Error(`Erro Azure TTS: ${ttsResponse.status}`)
      }

      const audioBuffer = await ttsResponse.arrayBuffer()
      
      // Salvar áudio
      const audioUrl = await this.saveAudioBuffer(Buffer.from(audioBuffer), request.format || 'mp3')
      
      // Calcular duração
      const duration = this.estimateDuration(request.text, request.speed || 1.0)
      
      return {
        audioUrl,
        duration,
        quality: {
          neural: voice.voiceType === 'Neural',
          sampleRate: voice.sampleRateHertz,
          bitrate: request.format === 'wav' ? '1411kbps' : '320kbps'
        },
        cost: this.calculateAzureCost(request.text.length, voice.voiceType)
      }

    } catch (error) {
      console.error('Erro Azure Speech:', error)
      throw new Error(`Falha na geração Azure TTS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  /**
   * Construir SSML para controle avançado
   */
  private buildSSML(
    text: string, 
    voice: AzureVoice, 
    options: {
      style: string
      speed: number
      pitch: number
      volume: number
    }
  ): string {
    
    const pitchChange = options.pitch !== 1.0 ? `${options.pitch > 1.0 ? '+' : ''}${Math.round((options.pitch - 1) * 50)}%` : '0%'
    const volumeChange = options.volume !== 1.0 ? `${Math.round(options.volume * 100)}%` : '100%'
    const rateChange = options.speed !== 1.0 ? `${Math.round(options.speed * 100)}%` : '100%'
    
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">`
    
    // Adicionar configurações de voz
    ssml += `<voice name="${voice.name}">`
    
    // Adicionar estilo se suportado
    if (voice.styleList?.includes(options.style)) {
      ssml += `<mstts:express-as style="${options.style}">`
    }
    
    // Adicionar prosódia
    ssml += `<prosody rate="${rateChange}" pitch="${pitchChange}" volume="${volumeChange}">`
    
    // Adicionar texto otimizado
    ssml += this.optimizeTextForSSML(text)
    
    ssml += `</prosody>`
    
    if (voice.styleList?.includes(options.style)) {
      ssml += `</mstts:express-as>`
    }
    
    ssml += `</voice></speak>`
    
    return ssml
  }

  /**
   * Otimizar texto para SSML
   */
  private optimizeTextForSSML(text: string): string {
    let optimized = text
    
    // Escapar caracteres especiais XML
    optimized = optimized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
    
    // Adicionar pausas naturais
    optimized = optimized
      .replace(/\./g, '. <break time="500ms"/>')
      .replace(/,/g, ', <break time="200ms"/>')
      .replace(/:/g, ': <break time="300ms"/>')
      .replace(/;/g, '; <break time="300ms"/>')
    
    // Adicionar ênfase para termos importantes
    const emphasisTerms = ['atenção', 'cuidado', 'importante', 'obrigatório', 'nunca', 'jamais']
    emphasisTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      optimized = optimized.replace(regex, `<emphasis level="strong">${term}</emphasis>`)
    })
    
    return optimized
  }

  /**
   * Obter formato de áudio do Azure
   */
  private getAzureAudioFormat(format: string): string {
    const formatMap: Record<string, string> = {
      'mp3': 'audio-24khz-160kbitrate-mono-mp3',
      'wav': 'riff-24khz-16bit-mono-pcm',
      'ogg': 'ogg-24khz-16bit-mono-opus'
    }
    
    return formatMap[format] || formatMap['mp3']
  }

  /**
   * Estimar duração do áudio
   */
  private estimateDuration(text: string, speed: number): number {
    // Português: ~2.5 caracteres por segundo em velocidade normal
    const baseCharsPerSecond = 2.5
    const adjustedSpeed = baseCharsPerSecond * speed
    
    return Math.max(1, Math.ceil(text.length / adjustedSpeed))
  }

  /**
   * Calcular custo Azure
   */
  private calculateAzureCost(textLength: number, voiceType: string): number {
    // Preços Azure (aproximados)
    const costPerChar = voiceType === 'Neural' ? 0.000016 : 0.000004 // $16/$4 por 1M chars
    const costInBRL = costPerChar * textLength * 5.2 // Conversão USD para BRL
    
    return Math.round(costInBRL * 100) / 100
  }

  /**
   * Salvar buffer de áudio
   */
  private async saveAudioBuffer(buffer: Buffer, format: string): Promise<string> {
    // Em produção, salvaria no S3 ou Azure Blob Storage
    const timestamp = Date.now()
    const filename = `azure_tts_${timestamp}.${format}`
    
    return `/audio/azure/${filename}`
  }

  /**
   * Gerar fala demo (desenvolvimento)
   */
  private async generateDemoSpeech(request: AzureTTSRequest): Promise<AzureTTSResponse> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const duration = this.estimateDuration(request.text, request.speed || 1.0)
    
    return {
      audioUrl: `/demo-audio/azure_${Date.now()}.${request.format || 'mp3'}`,
      duration,
      quality: {
        neural: true,
        sampleRate: '24kHz',
        bitrate: '320kbps'
      },
      cost: 0.05 // Demo cost
    }
  }

  /**
   * Obter vozes disponíveis
   */
  getAvailableVoices(): AzureVoice[] {
    return AzureSpeechService.BRAZILIAN_NEURAL_VOICES
  }

  /**
   * Mapear emoção para estilo Azure
   */
  mapEmotionToStyle(emotion: string): string {
    const emotionMap: Record<string, string> = {
      'neutro': 'neutral',
      'animado': 'cheerful',
      'serio': 'serious',
      'preocupado': 'sad'
    }
    
    return emotionMap[emotion] || 'neutral'
  }

  /**
   * Testar voz com texto de exemplo
   */
  async testVoice(voiceName: string, style?: string): Promise<AzureTTSResponse> {
    const sampleText = "Olá, esta é uma demonstração da voz neural brasileira. Como você pode ouvir, a qualidade é muito natural e expressiva."
    
    return this.generateSpeech({
      text: sampleText,
      voice: voiceName,
      style: style || 'neutral',
      speed: 1.0,
      format: 'mp3'
    })
  }

  /**
   * Gerar fala em lote para múltiplos textos
   */
  async generateBatchSpeech(
    texts: string[],
    voiceConfig: {
      voice: string
      style: string
      speed: number
      format: string
    }
  ): Promise<AzureTTSResponse[]> {
    
    const results: AzureTTSResponse[] = []
    
    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await this.generateSpeech({
          text: texts[i],
          voice: voiceConfig.voice,
          style: voiceConfig.style,
          speed: voiceConfig.speed,
          format: voiceConfig.format as any
        })
        
        results.push(result)
        
        // Delay entre requisições para evitar rate limiting
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
      } catch (error) {
        console.error(`Erro no texto ${i}:`, error)
        
        // Adicionar resultado de erro
        results.push({
          audioUrl: '',
          duration: 0,
          quality: { neural: false, sampleRate: '0', bitrate: '0' },
          cost: 0
        })
      }
    }
    
    return results
  }

  /**
   * Otimizar configurações para tipo de conteúdo
   */
  optimizeForContentType(contentType: 'treinamento' | 'apresentacao' | 'marketing' | 'educacional'): {
    recommendedVoices: string[]
    recommendedStyle: string
    recommendedSpeed: number
  } {
    
    const optimizations = {
      'treinamento': {
        recommendedVoices: ['pt-BR-AntonioNeural', 'pt-BR-JuliaNeural'],
        recommendedStyle: 'serious',
        recommendedSpeed: 0.95
      },
      'apresentacao': {
        recommendedVoices: ['pt-BR-FranciscaNeural', 'pt-BR-FabioNeural'],
        recommendedStyle: 'neutral',
        recommendedSpeed: 1.0
      },
      'marketing': {
        recommendedVoices: ['pt-BR-BrendaNeural', 'pt-BR-GiovannaNeural'],
        recommendedStyle: 'cheerful',
        recommendedSpeed: 1.1
      },
      'educacional': {
        recommendedVoices: ['pt-BR-HumbertoNeural', 'pt-BR-ElzaNeural'],
        recommendedStyle: 'calm',
        recommendedSpeed: 0.9
      }
    }
    
    return optimizations[contentType] || optimizations['treinamento']
  }

  /**
   * Analisar qualidade do texto para TTS
   */
  analyzeTextQuality(text: string): {
    complexity: 'baixa' | 'media' | 'alta'
    readability: number
    technicalTerms: string[]
    recommendedAdjustments: string[]
  } {
    
    const words = text.split(/\s+/)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    // Detectar termos técnicos
    const technicalTerms: string[] = []
    const techPatterns = [
      /\bNR-?\d+\b/gi,
      /\bEPI\b/gi,
      /\bEPC\b/gi,
      /\bCIPA\b/gi,
      /\bSESMT\b/gi
    ]
    
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        technicalTerms.push(...matches)
      }
    })
    
    // Calcular complexidade
    const avgWordsPerSentence = words.length / sentences.length
    const complexity = avgWordsPerSentence > 20 ? 'alta' : 
                      avgWordsPerSentence > 12 ? 'media' : 'baixa'
    
    // Calcular legibilidade (índice simplificado)
    const readability = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence * 2)))
    
    // Gerar recomendações
    const recommendations = []
    if (complexity === 'alta') {
      recommendations.push('Considere dividir frases longas para melhor fluência')
    }
    if (technicalTerms.length > 3) {
      recommendations.push('Muitos termos técnicos - considere adicionar explicações')
    }
    if (readability < 60) {
      recommendations.push('Simplifique o texto para melhor compreensão')
    }
    
    return {
      complexity,
      readability,
      technicalTerms,
      recommendedAdjustments: recommendations
    }
  }
}

// Exportar instância singleton
export const azureSpeechService = new AzureSpeechService()

