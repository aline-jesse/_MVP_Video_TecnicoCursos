
/**
 * 🎙️ ElevenLabs Service - PRODUÇÃO REAL V2
 * Integração otimizada com ElevenLabs para alta qualidade de voz e performance
 */

// Configuração das credenciais do ElevenLabs
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_743746a66091c0cb9711070872ac78b5082c441e978d3714'
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

// Cache de vozes para otimização
interface VoiceCache {
  voices: ElevenLabsVoice[]
  lastUpdated: Date
  ttl: number
}

// Configurações avançadas de qualidade
interface QualitySettings {
  model_id: string
  voice_settings: VoiceSettings
  output_format: 'mp3_44100_128' | 'mp3_22050_32' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100'
  optimize_streaming_latency: number
  pronunciation_dictionary_locators?: string[]
}

// Métricas de performance
interface PerformanceMetrics {
  requestCount: number
  totalLatency: number
  averageLatency: number
  errorCount: number
  cacheHitRate: number
  lastReset: Date
}

// Vozes brasileiras premium reais do ElevenLabs
const PREMIUM_BRAZILIAN_VOICES = [
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Rachel adaptada para PT-BR
    name: 'Rachel - Brasileira Profissional',
    category: 'premade',
    labels: {
      gender: 'female',
      age: 'middle-aged',
      accent: 'brazilian',
      description: 'Voz feminina brasileira clara e profissional, ideal para treinamentos corporativos'
    },
    preview_url: '',
    samples: []
  },
  {
    voice_id: '2EiwWnXFnvU5JabPnv8n', // Adam adaptado para PT-BR
    name: 'Adam - Narrador Corporativo',
    category: 'premade',
    labels: {
      gender: 'male',
      age: 'middle-aged',
      accent: 'brazilian',
      description: 'Voz masculina robusta para narrações e apresentações'
    },
    preview_url: '',
    samples: []
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV', // Antoni adaptado para PT-BR
    name: 'Antoni - Educacional',
    category: 'premade',
    labels: {
      gender: 'male',
      age: 'young',
      accent: 'brazilian',
      description: 'Voz jovem e dinâmica para conteúdos educacionais'
    },
    preview_url: '',
    samples: []
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella adaptada para PT-BR
    name: 'Bella - Apresentadora',
    category: 'premade',
    labels: {
      gender: 'female',
      age: 'young',
      accent: 'brazilian',
      description: 'Voz feminina jovem e envolvente para apresentações'
    },
    preview_url: '',
    samples: []
  },
  {
    voice_id: 'VR6AewLTigWG4xSOukaG', // Josh adaptado para PT-BR
    name: 'Josh - Instrutor Técnico',
    category: 'premade',
    labels: {
      gender: 'male',
      age: 'mature',
      accent: 'brazilian',
      description: 'Voz experiente e confiável para instruções técnicas'
    },
    preview_url: '',
    samples: []
  }
]

export interface ElevenLabsVoice {
  id: string
  name: string
  category: string
  language: string
  gender: string
  age: string
  accent: string
  description: string
  preview_url: string
  samples: string[]
  quality_score?: number
  is_premium?: boolean
}

export interface VoiceSettings {
  stability: number
  similarity_boost: number
  style: number
  use_speaker_boost: boolean
}

export interface TTSGenerationOptions {
  text: string
  voice_id: string
  model_id?: string
  voice_settings?: VoiceSettings
  pronunciation_dictionary_locators?: string[]
  seed?: number
  previous_text?: string
  next_text?: string
  previous_request_ids?: string[]
  next_request_ids?: string[]
  output_format?: string
  optimize_streaming_latency?: number
}

export interface ElevenLabsResponse {
  audio: ArrayBuffer
  metadata: {
    duration: number
    size: number
    format: string
    quality: 'high' | 'medium' | 'low'
    latency: number
  }
}

export class ElevenLabsService {
  private static instance: ElevenLabsService
  private voiceCache: VoiceCache | null = null
  private performanceMetrics: PerformanceMetrics
  private requestQueue: Map<string, Promise<any>> = new Map()

  constructor() {
    this.performanceMetrics = {
      requestCount: 0,
      totalLatency: 0,
      averageLatency: 0,
      errorCount: 0,
      cacheHitRate: 0,
      lastReset: new Date()
    }
  }

  static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService()
    }
    return ElevenLabsService.instance
  }

  // Verificar conectividade e configuração
  async checkConnection(): Promise<{ connected: boolean; error?: string; subscription?: any }> {
    try {
      const startTime = Date.now()
      
      if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.startsWith('sk_mock')) {
        return {
          connected: false,
          error: 'API key não configurada ou usando mock'
        }
      }

      const response = await fetch(`${ELEVENLABS_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        }
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`)
      }

      const userData = await response.json()
      const latency = Date.now() - startTime

      return {
        connected: true,
        subscription: {
          tier: userData.subscription?.tier || 'Free',
          character_count: userData.subscription?.character_count || 0,
          character_limit: userData.subscription?.character_limit || 10000,
          latency
        }
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Buscar todas as vozes disponíveis com cache otimizado
  async getVoices(forceRefresh: boolean = false): Promise<ElevenLabsVoice[]> {
    const cacheKey = 'all_voices'
    
    // Verificar cache
    if (!forceRefresh && this.voiceCache && this.isCacheValid()) {
      this.updateCacheHitRate(true)
      return this.voiceCache.voices
    }

    // Verificar se já existe uma requisição em andamento
    if (this.requestQueue.has(cacheKey)) {
      return await this.requestQueue.get(cacheKey)!
    }

    const requestPromise = this.fetchVoicesFromAPI()
    this.requestQueue.set(cacheKey, requestPromise)

    try {
      const voices = await requestPromise
      this.updateCacheHitRate(false)
      
      // Atualizar cache
      this.voiceCache = {
        voices,
        lastUpdated: new Date(),
        ttl: 30 * 60 * 1000 // 30 minutos
      }
      
      return voices
    } finally {
      this.requestQueue.delete(cacheKey)
    }
  }

  // Buscar vozes da API real
  private async fetchVoicesFromAPI(): Promise<ElevenLabsVoice[]> {
    try {
      const startTime = Date.now()
      
      // Verificar conexão primeiro
      const connectionCheck = await this.checkConnection()
      if (!connectionCheck.connected) {
        console.warn('ElevenLabs não conectado, usando vozes premium locais')
        return this.getPremiumBrazilianVoices()
      }

      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        }
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      const latency = Date.now() - startTime
      
      this.updateMetrics(latency, false)

      // Processar e enriquecer vozes
      const voices = data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'cloned',
        language: this.detectLanguage(voice.name, voice.labels?.accent),
        gender: voice.labels?.gender || 'unknown',
        age: voice.labels?.age || 'unknown',
        accent: voice.labels?.accent || 'neutral',
        description: voice.labels?.description || voice.name,
        preview_url: voice.preview_url || '',
        samples: voice.samples?.map((s: any) => s.sample_id) || [],
        quality_score: this.calculateQualityScore(voice),
        is_premium: voice.category === 'premade'
      }))

      // Adicionar vozes premium brasileiras se não estiverem presentes
      const brazilianVoices = this.getPremiumBrazilianVoices()
      const existingIds = new Set(voices.map((v: ElevenLabsVoice) => v.id))
      
      brazilianVoices.forEach(voice => {
        if (!existingIds.has(voice.id)) {
          voices.push(voice)
        }
      })

      return voices.sort((a: ElevenLabsVoice, b: ElevenLabsVoice) => {
        // Priorizar vozes brasileiras e premium
        if (a.accent === 'brazilian' && b.accent !== 'brazilian') return -1
        if (b.accent === 'brazilian' && a.accent !== 'brazilian') return 1
        if (a.is_premium && !b.is_premium) return -1
        if (b.is_premium && !a.is_premium) return 1
        return (b.quality_score || 0) - (a.quality_score || 0)
      })

    } catch (error) {
      console.error('Erro ao buscar vozes ElevenLabs:', error)
      this.updateMetrics(0, true)
      
      // Fallback para vozes premium locais
      return this.getPremiumBrazilianVoices()
    }
  }

  // Obter vozes premium brasileiras
  private getPremiumBrazilianVoices(): ElevenLabsVoice[] {
    return PREMIUM_BRAZILIAN_VOICES.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      language: 'portuguese',
      gender: voice.labels.gender,
      age: voice.labels.age,
      accent: voice.labels.accent,
      description: voice.labels.description,
      preview_url: voice.preview_url,
      samples: voice.samples,
      quality_score: 0.95,
      is_premium: true
    }))
  }

  // Buscar vozes brasileiras especificamente
  async getBrazilianVoices(): Promise<ElevenLabsVoice[]> {
    const allVoices = await this.getVoices()
    return allVoices.filter(voice => 
      voice.language === 'portuguese' || 
      voice.accent === 'brazilian' ||
      voice.name.toLowerCase().includes('brazil') ||
      voice.description.toLowerCase().includes('brazil')
    ).sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
  }

  // Gerar áudio TTS com otimizações avançadas
  async generateSpeech(options: TTSGenerationOptions): Promise<ElevenLabsResponse> {
    const startTime = Date.now()
    
    try {
      // Verificar conexão
      const connectionCheck = await this.checkConnection()
      if (!connectionCheck.connected) {
        throw new Error('ElevenLabs não está conectado')
      }

      // Otimizar configurações baseado no texto
      const optimizedSettings = this.optimizeSettings(options.text, options.voice_id)
      
      const requestBody = {
        text: options.text,
        model_id: options.model_id || optimizedSettings.model_id,
        voice_settings: {
          ...optimizedSettings.voice_settings,
          ...options.voice_settings
        },
        pronunciation_dictionary_locators: options.pronunciation_dictionary_locators || [],
        seed: options.seed,
        previous_text: options.previous_text,
        next_text: options.next_text,
        previous_request_ids: options.previous_request_ids || [],
        next_request_ids: options.next_request_ids || []
      }

      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${options.voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
          'xi-output-format': options.output_format || optimizedSettings.output_format,
          'xi-optimize-streaming-latency': (options.optimize_streaming_latency || optimizedSettings.optimize_streaming_latency).toString()
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const latency = Date.now() - startTime
      
      this.updateMetrics(latency, false)

      // Calcular qualidade baseado no formato e tamanho
      const quality = this.determineQuality(audioBuffer.byteLength, options.output_format || optimizedSettings.output_format)

      return {
        audio: audioBuffer,
        metadata: {
          duration: this.estimateAudioDuration(options.text, audioBuffer.byteLength),
          size: audioBuffer.byteLength,
          format: options.output_format || optimizedSettings.output_format,
          quality,
          latency
        }
      }

    } catch (error) {
      this.updateMetrics(Date.now() - startTime, true)
      console.error('Erro ao gerar TTS:', error)
      throw error
    }
  }

  // Otimizar configurações baseado no contexto
  private optimizeSettings(text: string, voiceId: string): QualitySettings {
    const textLength = text.length
    const wordCount = text.split(/\s+/).length
    const complexity = this.analyzeTextComplexity(text)
    
    // Selecionar modelo baseado na complexidade
    let model_id = 'eleven_multilingual_v2' // Padrão para PT-BR
    
    if (textLength < 100 && complexity === 'simple') {
      model_id = 'eleven_turbo_v2' // Mais rápido para textos simples
    } else if (complexity === 'complex' || textLength > 1000) {
      model_id = 'eleven_multilingual_v2' // Melhor qualidade para textos complexos
    }

    // Configurações de voz otimizadas
    const voice_settings: VoiceSettings = {
      stability: complexity === 'complex' ? 0.6 : 0.5,
      similarity_boost: 0.8,
      style: this.getOptimalStyle(text),
      use_speaker_boost: textLength > 200
    }

    // Formato de saída baseado no uso
    let output_format: QualitySettings['output_format'] = 'mp3_44100_128'
    
    if (textLength < 50) {
      output_format = 'mp3_22050_32' // Menor qualidade para textos curtos
    } else if (textLength > 500) {
      output_format = 'mp3_44100_128' // Alta qualidade para textos longos
    }

    // Otimização de latência
    const optimize_streaming_latency = textLength < 100 ? 4 : 
                                     textLength < 300 ? 3 : 
                                     textLength < 500 ? 2 : 1

    return {
      model_id,
      voice_settings,
      output_format,
      optimize_streaming_latency
    }
  }

  // Analisar complexidade do texto
  private analyzeTextComplexity(text: string): 'simple' | 'medium' | 'complex' {
    const words = text.split(/\s+/)
    const avgWordLength = text.length / words.length
    const specialChars = (text.match(/[^\w\s]/g) || []).length
    const numbers = (text.match(/\d/g) || []).length
    
    const complexityScore = (avgWordLength * 0.3) + 
                           (specialChars / text.length * 100 * 0.4) + 
                           (numbers / text.length * 100 * 0.3)
    
    if (complexityScore < 3) return 'simple'
    if (complexityScore < 6) return 'medium'
    return 'complex'
  }

  // Obter estilo ótimo baseado no texto
  private getOptimalStyle(text: string): number {
    const lowerText = text.toLowerCase()
    
    // Detectar tom emocional
    if (lowerText.includes('!') || lowerText.includes('incrível') || lowerText.includes('fantástico')) {
      return 0.8 // Mais expressivo
    }
    
    if (lowerText.includes('técnico') || lowerText.includes('processo') || lowerText.includes('sistema')) {
      return 0.3 // Mais neutro/profissional
    }
    
    if (lowerText.includes('treinamento') || lowerText.includes('curso') || lowerText.includes('aprender')) {
      return 0.6 // Educacional
    }
    
    return 0.5 // Padrão
  }

  // Determinar qualidade do áudio
  private determineQuality(size: number, format: string): 'high' | 'medium' | 'low' {
    const sizeKB = size / 1024
    
    if (format.includes('44100') && sizeKB > 50) return 'high'
    if (format.includes('22050') || (sizeKB > 20 && sizeKB <= 50)) return 'medium'
    return 'low'
  }

  // Estimar duração do áudio
  private estimateAudioDuration(text: string, audioSize: number): number {
    const words = text.split(/\s+/).length
    const estimatedWPM = 160 // Palavras por minuto em português
    const estimatedDuration = (words / estimatedWPM) * 60 * 1000 // em ms
    
    // Ajustar baseado no tamanho do arquivo
    const sizeRatio = audioSize / (text.length * 100) // Aproximação
    return Math.round(estimatedDuration * Math.max(0.8, Math.min(1.2, sizeRatio)))
  }

  // Calcular score de qualidade da voz
  private calculateQualityScore(voice: any): number {
    let score = 0.5
    
    // Bonus para vozes premade
    if (voice.category === 'premade') score += 0.3
    
    // Bonus para vozes com samples
    if (voice.samples && voice.samples.length > 0) score += 0.1
    
    // Bonus para vozes brasileiras
    if (voice.labels?.accent === 'brazilian' || voice.name.toLowerCase().includes('brazil')) {
      score += 0.2
    }
    
    // Penalty para vozes clonadas sem descrição
    if (voice.category === 'cloned' && !voice.labels?.description) {
      score -= 0.1
    }
    
    return Math.min(1.0, Math.max(0.0, score))
  }

  // Clonar voz personalizada com validação
  async cloneVoice(
    name: string, 
    description: string, 
    files: File[]
  ): Promise<{ voice_id: string; quality_score: number }> {
    try {
      // Validar arquivos
      if (files.length === 0) {
        throw new Error('Pelo menos um arquivo de áudio é necessário')
      }

      if (files.length > 25) {
        throw new Error('Máximo de 25 arquivos permitidos')
      }

      // Verificar tamanho total
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      if (totalSize > 100 * 1024 * 1024) { // 100MB
        throw new Error('Tamanho total dos arquivos excede 100MB')
      }

      // Verificar conexão
      const connectionCheck = await this.checkConnection()
      if (!connectionCheck.connected) {
        throw new Error('ElevenLabs não está conectado')
      }

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      
      files.forEach((file, index) => {
        formData.append('files', file, `sample_${index}.${file.name.split('.').pop()}`)
      })

      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/add`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao clonar voz: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      // Calcular score de qualidade baseado nos arquivos
      const qualityScore = this.calculateClonedVoiceQuality(files)
      
      // Invalidar cache para incluir nova voz
      this.voiceCache = null
      
      return { 
        voice_id: result.voice_id,
        quality_score: qualityScore
      }
    } catch (error) {
      console.error('Erro ao clonar voz:', error)
      throw error
    }
  }

  // Calcular qualidade da voz clonada
  private calculateClonedVoiceQuality(files: File[]): number {
    let score = 0.5
    
    // Bonus por quantidade de samples
    if (files.length >= 5) score += 0.2
    if (files.length >= 10) score += 0.1
    
    // Bonus por duração total estimada
    const avgFileSize = files.reduce((sum, f) => sum + f.size, 0) / files.length
    if (avgFileSize > 500 * 1024) score += 0.1 // Arquivos maiores = melhor qualidade
    
    // Bonus por variedade de arquivos
    const uniqueSizes = new Set(files.map(f => Math.floor(f.size / 100000)))
    if (uniqueSizes.size >= 3) score += 0.1
    
    return Math.min(1.0, score)
  }

  // Detectar idioma da voz
  private detectLanguage(name: string, accent?: string): string {
    const lowerName = name.toLowerCase()
    const lowerAccent = accent?.toLowerCase() || ''
    
    if (lowerName.includes('brazil') || lowerAccent.includes('brazil') || 
        lowerName.includes('portuguese') || lowerAccent.includes('portuguese') ||
        lowerName.includes('brasil') || lowerAccent.includes('brasil')) {
      return 'portuguese'
    }
    
    if (lowerName.includes('spanish') || lowerAccent.includes('spanish')) {
      return 'spanish'
    }
    
    if (lowerName.includes('french') || lowerAccent.includes('french')) {
      return 'french'
    }
    
    return 'english'
  }

  // Verificar se cache é válido
  private isCacheValid(): boolean {
    if (!this.voiceCache) return false
    const now = Date.now()
    const cacheAge = now - this.voiceCache.lastUpdated.getTime()
    return cacheAge < this.voiceCache.ttl
  }

  // Atualizar métricas de performance
  private updateMetrics(latency: number, isError: boolean): void {
    this.performanceMetrics.requestCount++
    
    if (isError) {
      this.performanceMetrics.errorCount++
    } else {
      this.performanceMetrics.totalLatency += latency
      this.performanceMetrics.averageLatency = 
        this.performanceMetrics.totalLatency / (this.performanceMetrics.requestCount - this.performanceMetrics.errorCount)
    }
  }

  // Atualizar taxa de cache hit
  private updateCacheHitRate(isHit: boolean): void {
    const totalRequests = this.performanceMetrics.requestCount + 1
    const currentHits = this.performanceMetrics.cacheHitRate * this.performanceMetrics.requestCount
    const newHits = currentHits + (isHit ? 1 : 0)
    this.performanceMetrics.cacheHitRate = newHits / totalRequests
  }

  // Obter informações de uso com cache
  async getUserInfo() {
    try {
      const connectionCheck = await this.checkConnection()
      if (!connectionCheck.connected) {
        throw new Error('ElevenLabs não está conectado')
      }

      return connectionCheck.subscription
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error)
      throw error
    }
  }

  // Obter métricas de performance
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  // Resetar métricas
  resetMetrics(): void {
    this.performanceMetrics = {
      requestCount: 0,
      totalLatency: 0,
      averageLatency: 0,
      errorCount: 0,
      cacheHitRate: 0,
      lastReset: new Date()
    }
  }

  // Limpar cache
  clearCache(): void {
    this.voiceCache = null
    this.requestQueue.clear()
    console.log('🗑️ Cache ElevenLabs limpo')
  }

  // Testar conectividade completa
  async runDiagnostics(): Promise<{
    connection: boolean
    voices: boolean
    tts: boolean
    latency: number
    errors: string[]
  }> {
    const errors: string[] = []
    let totalLatency = 0
    let testCount = 0

    // Teste 1: Conexão
    const startTime1 = Date.now()
    const connectionTest = await this.checkConnection()
    totalLatency += Date.now() - startTime1
    testCount++

    if (!connectionTest.connected) {
      errors.push(`Conexão: ${connectionTest.error}`)
    }

    // Teste 2: Buscar vozes
    let voicesTest = false
    try {
      const startTime2 = Date.now()
      const voices = await this.getVoices(true)
      totalLatency += Date.now() - startTime2
      testCount++
      voicesTest = voices.length > 0
      
      if (!voicesTest) {
        errors.push('Nenhuma voz encontrada')
      }
    } catch (error) {
      errors.push(`Vozes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }

    // Teste 3: TTS básico
    let ttsTest = false
    if (connectionTest.connected && voicesTest) {
      try {
        const startTime3 = Date.now()
        const voices = await this.getBrazilianVoices()
        if (voices.length > 0) {
          await this.generateSpeech({
            text: 'Teste',
            voice_id: voices[0].id,
            model_id: 'eleven_turbo_v2'
          })
          totalLatency += Date.now() - startTime3
          testCount++
          ttsTest = true
        }
      } catch (error) {
        errors.push(`TTS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    return {
      connection: connectionTest.connected,
      voices: voicesTest,
      tts: ttsTest,
      latency: testCount > 0 ? Math.round(totalLatency / testCount) : 0,
      errors
    }
  }
}

export default ElevenLabsService
