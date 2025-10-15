
/**
 * 🎙️ Enhanced TTS Service - PRODUÇÃO REAL V2
 * Serviço TTS avançado com cache otimizado, sincronização labial precisa e integração completa
 */

export interface EnhancedTTSConfig {
  text: string
  language: string
  voice: string
  speed: number
  pitch: number
  emotion?: string
  provider?: 'elevenlabs' | 'azure' | 'google' | 'synthetic'
  cacheEnabled?: boolean
  lipSyncPrecision?: 'basic' | 'standard' | 'high' | 'ultra'
  outputFormat?: 'mp3' | 'wav' | 'ogg'
}

export interface EnhancedTTSResult {
  audioUrl: string
  audioBuffer: Buffer
  duration: number
  language: string
  voice: string
  success: boolean
  phonemes: PhonemeData[]
  lipSyncData: LipSyncData
  provider: string
  quality: 'high' | 'medium' | 'synthetic'
  cacheHit?: boolean
  processingTime: number
  metadata: TTSMetadata
}

export interface PhonemeData {
  phoneme: string
  startTime: number
  endTime: number
  intensity: number
  confidence: number
  viseme: string
}

export interface LipSyncData {
  phonemes: PhonemeData[]
  timing: number[]
  mouthShapes: MouthShape[]
  fps: number
  duration: number
  precision: string
  blendShapes: BlendShape[]
}

export interface MouthShape {
  time: number
  shape: 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'B' | 'P' | 'F' | 'V' | 'REST'
  intensity: number
  openness: number
  width: number
}

export interface BlendShape {
  name: string
  time: number
  value: number
  weight: number
}

export interface TTSMetadata {
  textLength: number
  wordCount: number
  estimatedReadingTime: number
  complexity: 'simple' | 'medium' | 'complex'
  emotionalTone: string
  languageConfidence: number
}

export interface TTSCacheEntry {
  key: string
  audioBuffer: Buffer
  result: EnhancedTTSResult
  createdAt: Date
  accessCount: number
  lastAccessed: Date
  size: number
}

export class EnhancedTTSService {
  // Singleton instance
  private static instance: EnhancedTTSService | null = null

  // Cache otimizado
  private static cache: Map<string, TTSCacheEntry> = new Map()
  private static readonly MAX_CACHE_SIZE = 100 * 1024 * 1024 // 100MB
  private static readonly MAX_CACHE_ENTRIES = 1000
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas

  // Construtor privado para singleton
  private constructor() {}

  // Método getInstance para singleton
  static getInstance(): EnhancedTTSService {
    if (!this.instance) {
      this.instance = new EnhancedTTSService()
    }
    return this.instance
  }

  // Configuração de providers aprimorada
  private static readonly PROVIDERS = {
    elevenlabs: {
      apiUrl: 'https://api.elevenlabs.io/v1/text-to-speech',
      apiKey: process.env.ELEVENLABS_API_KEY,
      voices: {
        'pt-BR-Female-1': 'pNInz6obpgDQGcFmaJgB', // Rachel (Portuguese)
        'pt-BR-Male-1': '2EiwWnXFnvU5JabPnv8n', // Adam (Portuguese)
        'pt-BR-Female-2': 'ErXwobaYiN019PkySvjV', // Antoni (Portuguese adapted)
        'pt-BR-Female-3': 'EXAVITQu4vr4xnSDxMaL', // Bella (Portuguese)
        'pt-BR-Male-2': 'VR6AewLTigWG4xSOukaG', // Josh (Portuguese)
      },
      models: {
        'multilingual_v2': 'eleven_multilingual_v2',
        'turbo_v2': 'eleven_turbo_v2',
        'multilingual_v1': 'eleven_multilingual_v1'
      }
    },
    azure: {
      apiUrl: 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1',
      apiKey: process.env.AZURE_SPEECH_KEY,
      region: process.env.AZURE_SPEECH_REGION || 'eastus',
      voices: {
        'pt-BR-AntonioNeural': 'male',
        'pt-BR-FranciscaNeural': 'female',
        'pt-BR-ThalitaNeural': 'female',
        'pt-BR-FabioNeural': 'male',
        'pt-BR-BrendaNeural': 'female',
        'pt-BR-DonatoNeural': 'male',
        'pt-BR-ElzaNeural': 'female',
        'pt-BR-GiovannaNeural': 'female',
        'pt-BR-HumbertoNeural': 'male',
        'pt-BR-JulioNeural': 'male',
        'pt-BR-LeilaNeural': 'female',
        'pt-BR-LeticiaNeural': 'female',
        'pt-BR-ManuelaNeural': 'female',
        'pt-BR-NicolauNeural': 'male',
        'pt-BR-ValerioNeural': 'male',
        'pt-BR-YaraNeural': 'female'
      }
    },
    google: {
      apiUrl: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      apiKey: process.env.GOOGLE_TTS_API_KEY,
      voices: {
        'pt-BR-Neural2-A': 'FEMALE',
        'pt-BR-Neural2-B': 'MALE',
        'pt-BR-Neural2-C': 'FEMALE',
        'pt-BR-Wavenet-A': 'FEMALE',
        'pt-BR-Wavenet-B': 'MALE',
        'pt-BR-Wavenet-C': 'FEMALE',
        'pt-BR-Standard-A': 'FEMALE',
        'pt-BR-Standard-B': 'MALE'
      }
    }
  }

  // Síntese de voz com cache e melhorias
  async synthesizeSpeech(config: EnhancedTTSConfig): Promise<EnhancedTTSResult> {
    const startTime = Date.now()
    console.log('🎙️ EnhancedTTSService V2 - Iniciando síntese avançada')
    
    // Gerar chave de cache
    const cacheKey = EnhancedTTSService.generateCacheKey(config)
    
    // Verificar cache se habilitado
    if (config.cacheEnabled !== false) {
      const cachedResult = EnhancedTTSService.getCachedResult(cacheKey)
      if (cachedResult) {
        console.log('✅ Cache hit - Retornando resultado em cache')
        return {
          ...cachedResult,
          cacheHit: true,
          processingTime: Date.now() - startTime
        }
      }
    }

    // Analisar texto para metadados
    const metadata = EnhancedTTSService.analyzeText(config.text)
    console.log('📊 Metadados do texto:', metadata)

    // Tentar providers em ordem de preferência
    const providers = config.provider ? [config.provider] : ['elevenlabs', 'azure', 'google', 'synthetic']

    for (const provider of providers) {
      try {
        console.log(`🔄 Tentando provider: ${provider}`)
        const result = await EnhancedTTSService.synthesizeWithProvider(config, provider as any, metadata)
        
        if (result.success) {
          const processingTime = Date.now() - startTime
          const finalResult = {
            ...result,
            cacheHit: false,
            processingTime,
            metadata
          }

          // Salvar no cache se habilitado
          if (config.cacheEnabled !== false) {
            EnhancedTTSService.setCachedResult(cacheKey, finalResult)
          }

          console.log(`✅ Síntese concluída com ${provider}:`, {
            duration: result.duration,
            quality: result.quality,
            audioSize: result.audioBuffer.length,
            processingTime,
            lipSyncPrecision: config.lipSyncPrecision || 'standard'
          })
          
          return finalResult
        }
        
      } catch (error) {
        console.warn(`⚠️ Falha em ${provider}:`, error)
        continue
      }
    }

    throw new Error('Todos os providers de TTS falharam')
  }

  // Síntese com provider específico
  private static async synthesizeWithProvider(
    config: EnhancedTTSConfig, 
    provider: 'elevenlabs' | 'azure' | 'google' | 'synthetic',
    metadata: TTSMetadata
  ): Promise<EnhancedTTSResult> {
    
    switch (provider) {
      case 'elevenlabs':
        return this.synthesizeWithElevenLabs(config, metadata)
      case 'azure':
        return this.synthesizeWithAzure(config, metadata)
      case 'google':
        return this.synthesizeWithGoogle(config, metadata)
      case 'synthetic':
        return this.synthesizeWithSynthetic(config, metadata)
      default:
        throw new Error(`Provider não suportado: ${provider}`)
    }
  }

  // ElevenLabs TTS aprimorado
  private static async synthesizeWithElevenLabs(config: EnhancedTTSConfig, metadata: TTSMetadata): Promise<EnhancedTTSResult> {
    const { apiKey, apiUrl, voices, models } = this.PROVIDERS.elevenlabs
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key não configurada')
    }

    const voiceId = voices[config.voice as keyof typeof voices] || Object.values(voices)[0]
    
    // Selecionar modelo baseado na complexidade
    const modelId = metadata.complexity === 'complex' ? 
      models.multilingual_v2 : models.turbo_v2

    const response = await fetch(`${apiUrl}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: config.text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: this.getStyleFromEmotion(config.emotion, metadata.emotionalTone),
          use_speaker_boost: true
        },
        pronunciation_dictionary_locators: [],
        seed: undefined,
        previous_text: undefined,
        next_text: undefined
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer())
    const phonemes = EnhancedTTSService.generateAdvancedPhonemes(config.text, config.lipSyncPrecision || 'standard')
    const lipSyncData = EnhancedTTSService.generateAdvancedLipSyncData(phonemes, config.lipSyncPrecision || 'standard')
    const duration = EnhancedTTSService.estimateDuration(config.text, config.speed)

    // Salvar áudio
    const audioUrl = await EnhancedTTSService.saveAudio(audioBuffer, 'elevenlabs', config.voice, config.outputFormat || 'mp3')

    return {
      audioUrl,
      audioBuffer,
      duration,
      language: config.language,
      voice: config.voice,
      success: true,
      phonemes,
      lipSyncData,
      provider: 'elevenlabs',
      quality: 'high',
      processingTime: 0, // Será preenchido depois
      metadata
    }
  }

  // Azure Cognitive Services TTS aprimorado
  private static async synthesizeWithAzure(config: EnhancedTTSConfig, metadata: TTSMetadata): Promise<EnhancedTTSResult> {
    const { apiKey, region, apiUrl, voices } = this.PROVIDERS.azure
    
    if (!apiKey) {
      throw new Error('Azure Speech API key não configurada')
    }

    const voiceName = config.voice in voices ? config.voice : 'pt-BR-FranciscaNeural'
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${config.language}">
        <voice name="${voiceName}">
          <prosody rate="${config.speed}x" pitch="${config.pitch > 0 ? '+' : ''}${config.pitch}%">
            ${config.text}
          </prosody>
        </voice>
      </speak>`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'EstudioIA'
      },
      body: ssml
    })

    if (!response.ok) {
      throw new Error(`Azure TTS API error: ${response.status}`)
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer())
    const phonemes = EnhancedTTSService.generateAdvancedPhonemes(config.text, config.lipSyncPrecision || 'standard')
    const lipSyncData = EnhancedTTSService.generateAdvancedLipSyncData(phonemes, config.lipSyncPrecision || 'standard')
    const duration = EnhancedTTSService.estimateDuration(config.text, config.speed)

    const audioUrl = await EnhancedTTSService.saveAudio(audioBuffer, 'azure', config.voice, config.outputFormat || 'mp3')

    return {
      audioUrl,
      audioBuffer,
      duration,
      language: config.language,
      voice: config.voice,
      success: true,
      phonemes,
      lipSyncData,
      provider: 'azure',
      quality: 'high',
      processingTime: 0,
      metadata
    }
  }

  // Google Cloud TTS aprimorado
  private static async synthesizeWithGoogle(config: EnhancedTTSConfig, metadata: TTSMetadata): Promise<EnhancedTTSResult> {
    const { apiKey, apiUrl, voices } = this.PROVIDERS.google
    
    if (!apiKey) {
      throw new Error('Google TTS API key não configurada')
    }

    const voiceName = config.voice in voices ? config.voice : 'pt-BR-Neural2-A'
    const ssmlGender = voices[voiceName as keyof typeof voices] || 'FEMALE'

    const requestBody = {
      input: { text: config.text },
      voice: {
        languageCode: config.language,
        name: voiceName,
        ssmlGender
      },
      audioConfig: {
        audioEncoding: config.outputFormat?.toUpperCase() || 'MP3',
        speakingRate: config.speed,
        pitch: config.pitch,
        volumeGainDb: 0.0
      }
    }

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.status}`)
    }

    const data = await response.json()
    const audioBuffer = Buffer.from(data.audioContent, 'base64')
    const phonemes = EnhancedTTSService.generateAdvancedPhonemes(config.text, config.lipSyncPrecision || 'standard')
    const lipSyncData = EnhancedTTSService.generateAdvancedLipSyncData(phonemes, config.lipSyncPrecision || 'standard')
    const duration = EnhancedTTSService.estimateDuration(config.text, config.speed)

    const audioUrl = await EnhancedTTSService.saveAudio(audioBuffer, 'google', config.voice, config.outputFormat || 'mp3')

    return {
      audioUrl,
      audioBuffer,
      duration,
      language: config.language,
      voice: config.voice,
      success: true,
      phonemes,
      lipSyncData,
      provider: 'google',
      quality: 'high',
      processingTime: 0,
      metadata
    }
  }

  // Síntese sintética robusta (fallback)
  private static async synthesizeWithSynthetic(config: EnhancedTTSConfig, metadata: TTSMetadata): Promise<EnhancedTTSResult> {
    console.log('🎵 Gerando áudio sintético ROBUSTO V2...')
    
    const duration = EnhancedTTSService.estimateDuration(config.text, config.speed)
    const phonemes = EnhancedTTSService.generateAdvancedPhonemes(config.text, config.lipSyncPrecision || 'standard')
    const lipSyncData = EnhancedTTSService.generateAdvancedLipSyncData(phonemes, config.lipSyncPrecision || 'standard')
    
    // Gerar áudio WAV de alta qualidade
    const audioBuffer = EnhancedTTSService.generateHighQualitySyntheticAudio(config.text, duration, config.voice, config.speed)
    const audioUrl = await EnhancedTTSService.saveAudio(audioBuffer, 'synthetic', config.voice, config.outputFormat || 'wav')

    console.log(`✅ Áudio sintético ROBUSTO V2 gerado: ${audioBuffer.length} bytes, ${duration}ms`)

    return {
      audioUrl,
      audioBuffer,
      duration,
      language: config.language,
      voice: config.voice,
      success: true,
      phonemes,
      lipSyncData,
      provider: 'synthetic',
      quality: 'synthetic',
      processingTime: 0,
      metadata
    }
  }

  // Gerar chave de cache otimizada
  private static generateCacheKey(config: EnhancedTTSConfig): string {
    const crypto = require('crypto')
    const keyData = {
      text: config.text,
      voice: config.voice,
      language: config.language,
      speed: config.speed,
      pitch: config.pitch,
      emotion: config.emotion || 'neutral',
      provider: config.provider || 'auto',
      lipSyncPrecision: config.lipSyncPrecision || 'standard',
      outputFormat: config.outputFormat || 'mp3'
    }
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex')
      .substring(0, 16)
  }

  // Obter resultado do cache
  private static getCachedResult(cacheKey: string): EnhancedTTSResult | null {
    const entry = this.cache.get(cacheKey)
    
    if (!entry) return null
    
    // Verificar TTL
    if (Date.now() - entry.createdAt.getTime() > this.CACHE_TTL) {
      this.cache.delete(cacheKey)
      return null
    }
    
    // Atualizar estatísticas de acesso
    entry.accessCount++
    entry.lastAccessed = new Date()
    
    return entry.result
  }

  // Salvar resultado no cache
  private static setCachedResult(cacheKey: string, result: EnhancedTTSResult): void {
    // Verificar limites do cache
    this.cleanupCache()
    
    const entry: TTSCacheEntry = {
      key: cacheKey,
      audioBuffer: result.audioBuffer,
      result,
      createdAt: new Date(),
      accessCount: 1,
      lastAccessed: new Date(),
      size: result.audioBuffer.length
    }
    
    this.cache.set(cacheKey, entry)
    console.log(`💾 Resultado salvo no cache: ${cacheKey} (${entry.size} bytes)`)
  }

  // Limpeza inteligente do cache
  private static cleanupCache(): void {
    const entries = Array.from(this.cache.entries())
    
    // Verificar se precisa limpar
    const totalSize = entries.reduce((sum, [, entry]) => sum + entry.size, 0)
    const needsCleanup = totalSize > this.MAX_CACHE_SIZE || entries.length > this.MAX_CACHE_ENTRIES
    
    if (!needsCleanup) return
    
    console.log('🧹 Limpando cache TTS...')
    
    // Ordenar por score (menos acessados e mais antigos primeiro)
    entries.sort(([, a], [, b]) => {
      const scoreA = a.accessCount * (Date.now() - a.lastAccessed.getTime())
      const scoreB = b.accessCount * (Date.now() - b.lastAccessed.getTime())
      return scoreA - scoreB
    })
    
    // Remover 30% das entradas menos úteis
    const toRemove = Math.floor(entries.length * 0.3)
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0])
    }
    
    console.log(`🗑️ Removidas ${toRemove} entradas do cache`)
  }

  // Analisar texto para metadados
  private static analyzeText(text: string): TTSMetadata {
    const words = text.trim().split(/\s+/)
    const wordCount = words.length
    const textLength = text.length
    
    // Calcular tempo estimado de leitura (150 WPM médio em português)
    const estimatedReadingTime = (wordCount / 150) * 60 * 1000 // em ms
    
    // Analisar complexidade
    const avgWordLength = textLength / wordCount
    const complexity = avgWordLength > 7 ? 'complex' : 
                      avgWordLength > 5 ? 'medium' : 'simple'
    
    // Detectar tom emocional básico
    const emotionalWords = {
      positive: ['bom', 'ótimo', 'excelente', 'feliz', 'alegre', 'sucesso'],
      negative: ['ruim', 'péssimo', 'triste', 'problema', 'erro', 'falha'],
      neutral: ['informação', 'dados', 'processo', 'sistema', 'método']
    }
    
    let emotionalTone = 'neutral'
    const lowerText = text.toLowerCase()
    
    for (const [tone, words] of Object.entries(emotionalWords)) {
      if (words.some(word => lowerText.includes(word))) {
        emotionalTone = tone
        break
      }
    }
    
    return {
      textLength,
      wordCount,
      estimatedReadingTime,
      complexity,
      emotionalTone,
      languageConfidence: 0.95 // Assumindo alta confiança para PT-BR
    }
  }

  // Obter estilo baseado na emoção
  private static getStyleFromEmotion(emotion?: string, detectedTone?: string): number {
    const emotionMap: { [key: string]: number } = {
      'happy': 0.8,
      'sad': 0.2,
      'angry': 0.9,
      'calm': 0.3,
      'excited': 0.9,
      'neutral': 0.5,
      'positive': 0.7,
      'negative': 0.3
    }
    
    return emotionMap[emotion || detectedTone || 'neutral'] || 0.5
  }

  // Gerar fonemas avançados com maior precisão
  private static generateAdvancedPhonemes(text: string, precision: string): PhonemeData[] {
    const phonemeMap: { [key: string]: { phoneme: string; viseme: string; duration: number } } = {
      'a': { phoneme: 'A', viseme: 'aa', duration: 120 },
      'á': { phoneme: 'A', viseme: 'aa', duration: 130 },
      'à': { phoneme: 'A', viseme: 'aa', duration: 125 },
      'ã': { phoneme: 'A', viseme: 'aa', duration: 140 },
      'â': { phoneme: 'A', viseme: 'aa', duration: 135 },
      'e': { phoneme: 'E', viseme: 'E', duration: 100 },
      'é': { phoneme: 'E', viseme: 'E', duration: 110 },
      'ê': { phoneme: 'E', viseme: 'E', duration: 115 },
      'è': { phoneme: 'E', viseme: 'E', duration: 105 },
      'i': { phoneme: 'I', viseme: 'ih', duration: 80 },
      'í': { phoneme: 'I', viseme: 'ih', duration: 90 },
      'î': { phoneme: 'I', viseme: 'ih', duration: 85 },
      'o': { phoneme: 'O', viseme: 'oh', duration: 110 },
      'ó': { phoneme: 'O', viseme: 'oh', duration: 120 },
      'ô': { phoneme: 'O', viseme: 'oh', duration: 125 },
      'õ': { phoneme: 'O', viseme: 'oh', duration: 130 },
      'ò': { phoneme: 'O', viseme: 'oh', duration: 115 },
      'u': { phoneme: 'U', viseme: 'ou', duration: 90 },
      'ú': { phoneme: 'U', viseme: 'ou', duration: 100 },
      'û': { phoneme: 'U', viseme: 'ou', duration: 95 },
      'ù': { phoneme: 'U', viseme: 'ou', duration: 95 },
      'b': { phoneme: 'B', viseme: 'pp', duration: 70 },
      'p': { phoneme: 'P', viseme: 'pp', duration: 80 },
      'm': { phoneme: 'M', viseme: 'pp', duration: 90 },
      'f': { phoneme: 'F', viseme: 'ff', duration: 100 },
      'v': { phoneme: 'V', viseme: 'ff', duration: 90 },
      'l': { phoneme: 'L', viseme: 'th', duration: 60 },
      'r': { phoneme: 'R', viseme: 'rr', duration: 70 },
      's': { phoneme: 'S', viseme: 'ss', duration: 80 },
      'z': { phoneme: 'S', viseme: 'ss', duration: 75 },
      't': { phoneme: 'T', viseme: 'dd', duration: 60 },
      'd': { phoneme: 'D', viseme: 'dd', duration: 65 },
      'n': { phoneme: 'N', viseme: 'nn', duration: 70 },
      'g': { phoneme: 'G', viseme: 'kk', duration: 70 },
      'k': { phoneme: 'K', viseme: 'kk', duration: 75 },
      'c': { phoneme: 'K', viseme: 'kk', duration: 75 },
      'j': { phoneme: 'J', viseme: 'ch', duration: 85 },
      'ch': { phoneme: 'CH', viseme: 'ch', duration: 95 },
      'lh': { phoneme: 'LH', viseme: 'th', duration: 85 },
      'nh': { phoneme: 'NH', viseme: 'nn', duration: 95 },
      'rr': { phoneme: 'RR', viseme: 'rr', duration: 100 }
    }

    const words = text.toLowerCase().replace(/[^\w\sáéíóúâêîôûãõç]/g, '').split(/\s+/)
    const phonemes: PhonemeData[] = []
    
    // Ajustar duração base baseado na precisão
    const precisionMultiplier = {
      'basic': 1.0,
      'standard': 1.2,
      'high': 1.5,
      'ultra': 2.0
    }[precision] || 1.0
    
    let timeOffset = 0

    words.forEach((word, wordIndex) => {
      // Analisar cada caractere da palavra
      for (let i = 0; i < word.length; i++) {
        let char = word[i]
        let phonemeData = phonemeMap[char]
        
        // Detectar dígrafos
        if (i < word.length - 1) {
          const digraph = char + word[i + 1]
          if (phonemeMap[digraph]) {
            phonemeData = phonemeMap[digraph]
            i++ // Pular próximo caractere
          }
        }
        
        if (phonemeData) {
          const duration = phonemeData.duration * precisionMultiplier
          const startTime = timeOffset
          const endTime = timeOffset + duration
          const intensity = this.getAdvancedPhonemeIntensity(phonemeData.phoneme, wordIndex, words.length, precision)
          const confidence = this.calculatePhonemeConfidence(char, word, precision)

          phonemes.push({
            phoneme: phonemeData.phoneme,
            startTime,
            endTime,
            intensity,
            confidence,
            viseme: phonemeData.viseme
          })
        }
        
        timeOffset += (phonemeData?.duration || 50) * precisionMultiplier
      }
      
      // Pausa entre palavras (ajustada por precisão)
      timeOffset += 50 * precisionMultiplier
    })

    return phonemes
  }

  // Gerar dados de sincronização labial avançados
  private static generateAdvancedLipSyncData(phonemes: PhonemeData[], precision: string): LipSyncData {
    const mouthShapes: MouthShape[] = []
    const blendShapes: BlendShape[] = []
    const timing: number[] = []
    
    // FPS baseado na precisão
    const fps = {
      'basic': 24,
      'standard': 30,
      'high': 60,
      'ultra': 120
    }[precision] || 30

    phonemes.forEach(phoneme => {
      const shape = this.phonemeToAdvancedMouthShape(phoneme.phoneme)
      const frameCount = Math.ceil((phoneme.endTime - phoneme.startTime) / (1000 / fps))
      
      for (let frame = 0; frame < frameCount; frame++) {
        const time = phoneme.startTime + (frame * (1000 / fps))
        const progress = frame / frameCount
        const intensity = this.calculateAdvancedFrameIntensity(phoneme.intensity, progress, phoneme.confidence)
        
        // Mouth shape avançado
        const mouthShape: MouthShape = {
          time,
          shape,
          intensity,
          openness: this.calculateMouthOpenness(phoneme.phoneme, intensity),
          width: this.calculateMouthWidth(phoneme.phoneme, intensity)
        }
        
        mouthShapes.push(mouthShape)
        timing.push(time)
        
        // Blend shapes para animação 3D
        if (precision === 'high' || precision === 'ultra') {
          const blendShape: BlendShape = {
            name: `viseme_${phoneme.viseme}`,
            time,
            value: intensity,
            weight: phoneme.confidence
          }
          blendShapes.push(blendShape)
        }
      }
    })

    const duration = phonemes.length > 0 ? 
      Math.max(...phonemes.map(p => p.endTime)) : 0

    return {
      phonemes,
      timing,
      mouthShapes,
      fps,
      duration,
      precision,
      blendShapes
    }
  }

  // Calcular intensidade avançada do fonema
  private static getAdvancedPhonemeIntensity(phoneme: string, wordIndex: number, totalWords: number, precision: string): number {
    const baseIntensity: { [key: string]: number } = {
      'A': 0.9, 'E': 0.7, 'I': 0.6, 'O': 0.8, 'U': 0.5,
      'B': 0.8, 'P': 0.9, 'M': 0.7,
      'F': 0.5, 'V': 0.6,
      'L': 0.4, 'R': 0.7, 'RR': 0.9,
      'S': 0.6, 'T': 0.8, 'D': 0.7, 'N': 0.5,
      'G': 0.7, 'K': 0.8, 'J': 0.6,
      'CH': 0.7, 'LH': 0.5, 'NH': 0.6
    }

    const intensity = baseIntensity[phoneme] || 0.5
    
    // Multiplicadores baseados na posição e precisão
    const positionMultiplier = 0.7 + (wordIndex / totalWords) * 0.3
    const precisionMultiplier = {
      'basic': 1.0,
      'standard': 1.1,
      'high': 1.2,
      'ultra': 1.3
    }[precision] || 1.0
    
    return Math.min(intensity * positionMultiplier * precisionMultiplier, 1.0)
  }

  // Calcular confiança do fonema
  private static calculatePhonemeConfidence(char: string, word: string, precision: string): number {
    const baseConfidence = 0.8
    
    // Ajustar baseado na precisão
    const precisionBonus = {
      'basic': 0.0,
      'standard': 0.1,
      'high': 0.15,
      'ultra': 0.2
    }[precision] || 0.0
    
    // Penalizar caracteres especiais ou acentuados
    const specialCharPenalty = /[áéíóúâêîôûãõç]/.test(char) ? -0.05 : 0
    
    return Math.min(Math.max(baseConfidence + precisionBonus + specialCharPenalty, 0.5), 1.0)
  }

  // Converter fonema para forma da boca avançada
  private static phonemeToAdvancedMouthShape(phoneme: string): MouthShape['shape'] {
    const shapeMap: { [key: string]: MouthShape['shape'] } = {
      'A': 'A', 'E': 'E', 'I': 'I', 'O': 'O', 'U': 'U',
      'B': 'M', 'P': 'M', 'M': 'M',
      'F': 'F', 'V': 'F',
      'L': 'I', 'R': 'I', 'RR': 'I',
      'S': 'I', 'T': 'I', 'D': 'I', 'N': 'I',
      'G': 'A', 'K': 'A', 'J': 'I',
      'CH': 'I', 'LH': 'I', 'NH': 'I'
    }
    return shapeMap[phoneme] || 'REST'
  }

  // Calcular abertura da boca
  private static calculateMouthOpenness(phoneme: string, intensity: number): number {
    const opennessMap: { [key: string]: number } = {
      'A': 0.9, 'E': 0.6, 'I': 0.3, 'O': 0.8, 'U': 0.4,
      'B': 0.0, 'P': 0.0, 'M': 0.0,
      'F': 0.2, 'V': 0.2,
      'L': 0.3, 'R': 0.4, 'RR': 0.5,
      'S': 0.2, 'T': 0.1, 'D': 0.2, 'N': 0.1,
      'REST': 0.1
    }
    
    return (opennessMap[phoneme] || 0.3) * intensity
  }

  // Calcular largura da boca
  private static calculateMouthWidth(phoneme: string, intensity: number): number {
    const widthMap: { [key: string]: number } = {
      'A': 0.7, 'E': 0.8, 'I': 0.9, 'O': 0.5, 'U': 0.3,
      'B': 0.6, 'P': 0.6, 'M': 0.6,
      'F': 0.7, 'V': 0.7,
      'L': 0.8, 'R': 0.7, 'RR': 0.6,
      'S': 0.8, 'T': 0.7, 'D': 0.7, 'N': 0.6,
      'REST': 0.5
    }
    
    return (widthMap[phoneme] || 0.6) * intensity
  }

  // Calcular intensidade por frame avançada
  private static calculateAdvancedFrameIntensity(baseIntensity: number, progress: number, confidence: number): number {
    // Envelope suave com confiança
    const envelope = Math.sin(progress * Math.PI)
    const confidenceMultiplier = 0.7 + (confidence * 0.3)
    
    return baseIntensity * envelope * confidenceMultiplier
  }

  // Gerar áudio sintético de alta qualidade
  private static generateHighQualitySyntheticAudio(text: string, duration: number, voice: string, speed: number): Buffer {
    const sampleRate = 44100
    const channels = 1
    const bitDepth = 16
    const samples = Math.floor((duration / 1000) * sampleRate)
    
    // Parâmetros baseados na voz
    const voiceParams = this.getVoiceParameters(voice)
    const textWords = text.split(/\s+/)
    
    // Criar WAV header
    const wavHeader = Buffer.alloc(44)
    wavHeader.write('RIFF', 0)
    wavHeader.writeUInt32LE(36 + samples * 2, 4)
    wavHeader.write('WAVE', 8)
    wavHeader.write('fmt ', 12)
    wavHeader.writeUInt32LE(16, 16)
    wavHeader.writeUInt16LE(1, 20)
    wavHeader.writeUInt16LE(channels, 22)
    wavHeader.writeUInt32LE(sampleRate, 24)
    wavHeader.writeUInt32LE(sampleRate * 2, 28)
    wavHeader.writeUInt16LE(2, 32)
    wavHeader.writeUInt16LE(bitDepth, 34)
    wavHeader.write('data', 36)
    wavHeader.writeUInt32LE(samples * 2, 40)
    
    // Dados de áudio
    const audioData = Buffer.alloc(samples * 2)
    
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate
      const progress = i / samples
      
      // Frequência fundamental baseada na palavra atual
      const wordIndex = Math.floor(progress * textWords.length)
      const word = textWords[wordIndex] || textWords[0]
      const baseFreq = voiceParams.baseFreq + this.getWordFrequency(word)
      
      // Múltiplas ondas para simular voz humana
      const fundamental = Math.sin(2 * Math.PI * baseFreq * time)
      const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 2 * time) * 0.3
      const harmonic3 = Math.sin(2 * Math.PI * baseFreq * 3 * time) * 0.2
      const subHarmonic = Math.sin(2 * Math.PI * baseFreq * 0.5 * time) * 0.15
      
      // Envelope de amplitude realista
      const envelope = this.getAmplitudeEnvelope(progress, textWords.length)
      
      // Vibrato sutil
      const vibrato = Math.sin(2 * Math.PI * 5 * time) * 0.02
      
      // Ruído de respiração/fala
      const breathNoise = (Math.random() - 0.5) * 0.05 * envelope
      
      // Pausas entre palavras
      const pauseFactor = this.getPauseFactor(progress, textWords.length)
      
      // Combinar tudo
      let sample = (fundamental + harmonic2 + harmonic3 + subHarmonic + vibrato) * envelope * pauseFactor + breathNoise
      sample *= voiceParams.amplitude * speed
      
      // Converter para 16-bit PCM
      audioData.writeInt16LE(Math.max(-32767, Math.min(32767, sample * 16383)), i * 2)
    }
    
    return Buffer.concat([wavHeader, audioData])
  }

  // Parâmetros de voz por tipo
  private static getVoiceParameters(voice: string) {
    const params = {
      'francisca-neural': { baseFreq: 200, amplitude: 0.8, gender: 'female' },
      'antonio-neural': { baseFreq: 120, amplitude: 0.9, gender: 'male' },
      'elza-neural': { baseFreq: 220, amplitude: 0.75, gender: 'female' },
      'fabio-neural': { baseFreq: 100, amplitude: 0.85, gender: 'male' },
      'giovanna-neural': { baseFreq: 250, amplitude: 0.7, gender: 'female' },
      'humberto-neural': { baseFreq: 95, amplitude: 0.9, gender: 'male' }
    }
    return params[voice as keyof typeof params] || params['francisca-neural']
  }

  // Frequência por palavra (para variação natural)
  private static getWordFrequency(word: string): number {
    const vowelCount = (word.match(/[aeiouáéíóúâêîôûãõ]/gi) || []).length
    const consonantCount = word.length - vowelCount
    return (vowelCount * 10) - (consonantCount * 3)
  }

  // Envelope de amplitude por posição
  private static getAmplitudeEnvelope(progress: number, wordCount: number): number {
    // Fade in/out + variação por palavra
    const fadeIn = progress < 0.05 ? progress * 20 : 1
    const fadeOut = progress > 0.95 ? (1 - progress) * 20 : 1
    const wordVariation = Math.sin(progress * wordCount * Math.PI) * 0.3 + 0.7
    return fadeIn * fadeOut * wordVariation
  }

  // Pausas entre palavras
  private static getPauseFactor(progress: number, wordCount: number): number {
    const wordPosition = (progress * wordCount) % 1
    return wordPosition > 0.9 ? 0.3 : 1.0 // Pausa no final de cada palavra
  }

  // Salvar áudio com formato otimizado
  private static async saveAudio(audioBuffer: Buffer, provider: string, voice: string, format: string = 'mp3'): Promise<string> {
    try {
      // Tentar S3 primeiro
      const { S3StorageService } = await import('./s3-storage')
      const uploadResult = await S3StorageService.uploadTTSAudio(audioBuffer, {
        voice,
        text: 'audio',
        language: 'pt-BR',
        format
      })
      
      if (uploadResult.success) {
        return uploadResult.url!
      }
    } catch (error) {
      console.warn('S3 upload falhou, usando cache local')
    }
    
    // Fallback: cache local
    const { AudioCache } = await import('./audio-cache')
    const filename = `${provider}_${voice}_${Date.now()}.${format}`
    AudioCache.store(filename, audioBuffer, `audio/${format}`, 0)
    
    return `/api/tts/audio/${filename}`
  }

  // Estimar duração realista
  private static estimateDuration(text: string, speed: number): number {
    const words = text.trim().split(/\s+/).length
    const chars = text.length
    
    // Fórmula aprimorada para português brasileiro
    const baseWPM = 160 // palavras por minuto médio em PT-BR
    const adjustedWPM = baseWPM * speed
    
    const timeFromWords = (words / adjustedWPM) * 60 * 1000
    const timeFromChars = (chars / (15 * speed)) * 1000 // 15 chars/sec médio
    
    // Média ponderada + tempo adicional para pausas
    const baseDuration = (timeFromWords * 0.6) + (timeFromChars * 0.4)
    const pauseTime = words * 50 // 50ms de pausa por palavra
    
    return Math.max(1000, Math.round(baseDuration + pauseTime))
  }

  // Estatísticas do cache
  static getCacheStats(): { size: number; entries: number; hitRate: number } {
    const entries = Array.from(this.cache.values())
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0)
    const hitRate = totalAccesses > 0 ? entries.length / totalAccesses : 0
    
    return {
      size: totalSize,
      entries: entries.length,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }

  // Limpar cache manualmente
  static clearCache(): void {
    this.cache.clear()
    console.log('🗑️ Cache TTS limpo manualmente')
  }

  // Testar providers com relatório detalhado
  static async testProviders(): Promise<{ [key: string]: { available: boolean; latency?: number; error?: string } }> {
    const results: { [key: string]: { available: boolean; latency?: number; error?: string } } = {}
    const testText = "Teste de conectividade TTS avançado."
    
    const testConfig: EnhancedTTSConfig = {
      text: testText,
      language: 'pt-BR',
      voice: 'pt-BR-Neural2-A',
      speed: 1.0,
      pitch: 0.0,
      cacheEnabled: false
    }
    
    for (const provider of ['elevenlabs', 'azure', 'google', 'synthetic'] as const) {
      const startTime = Date.now()
      try {
        await this.synthesizeWithProvider(testConfig, provider, this.analyzeText(testText))
        results[provider] = {
          available: true,
          latency: Date.now() - startTime
        }
      } catch (error) {
        results[provider] = {
          available: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      }
    }
    
    return results
  }

  // Métodos de instância para compatibilidade com testes
  async testProviders(): Promise<{ [key: string]: { available: boolean; latency?: number; error?: string } }> {
    return EnhancedTTSService.testProviders()
  }

  getCacheStats(): { size: number; entries: number; hitRate: number } {
    return EnhancedTTSService.getCacheStats()
  }

  clearCache(): void {
    EnhancedTTSService.clearCache()
  }
}
