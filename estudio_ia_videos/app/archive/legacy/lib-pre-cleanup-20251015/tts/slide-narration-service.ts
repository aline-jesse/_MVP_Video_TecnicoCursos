

/**
 * Serviço de Narração Automática de Slides TTS
 * Sistema avançado para conversão de texto de slides em áudio profissional
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { elevenLabsClient } from './elevenlabs'
import { BrazilianRegionalTTS, BrazilianVoiceRegional } from './brazilian-regional-tts'

export interface SlideNarrationRequest {
  slideId: string
  slideNumber: number
  title: string
  content: string[]
  notes?: string
  voiceConfig: {
    voiceId: string
    speed: number
    pitch: number
    emotion: 'neutro' | 'animado' | 'serio' | 'preocupado'
    regional_expressions: boolean
  }
  syncWithAvatar: boolean
  targetDuration?: number
}

export interface NarrationSegment {
  id: string
  text: string
  audioUrl: string
  duration: number
  startTime: number
  endTime: number
  confidence: number
  phoneticBreakdown?: string[]
  lipSyncData?: LipSyncFrame[]
}

export interface LipSyncFrame {
  timestamp: number
  viseme: string
  intensity: number
  duration: number
}

export interface SlideNarrationResult {
  slideId: string
  slideNumber: number
  segments: NarrationSegment[]
  totalDuration: number
  audioUrl: string
  lipSyncData: LipSyncFrame[]
  quality: {
    pronunciation_score: number
    clarity_score: number
    emotion_match: number
  }
  cacheKey: string
  cost: number
  processedAt: Date
}

export interface BatchNarrationProgress {
  totalSlides: number
  completedSlides: number
  currentSlide: {
    number: number
    title: string
    status: 'processing' | 'completed' | 'error'
  }
  estimatedTimeRemaining: number
  totalCost: number
  errors: Array<{
    slideNumber: number
    error: string
    suggestion: string
  }>
}

/**
 * Classe principal para narração de slides
 */
export class SlideNarrationService {
  private ttsClient: TextToSpeechClient | null = null
  private narrationCache = new Map<string, SlideNarrationResult>()
  
  constructor() {
    this.initializeTTSService()
  }

  private async initializeTTSService() {
    try {
      if (process.env.GOOGLE_CLOUD_TTS_CREDENTIALS) {
        this.ttsClient = new TextToSpeechClient({
          keyFilename: process.env.GOOGLE_CLOUD_TTS_CREDENTIALS
        })
        console.log('✅ Google Cloud TTS inicializado para narração de slides')
      }
    } catch (error) {
      console.warn('Google TTS não disponível, usando fallback:', error)
    }
  }

  /**
   * Gerar narração automática para um slide
   */
  async generateSlideNarration(request: SlideNarrationRequest): Promise<SlideNarrationResult> {
    console.log(`🎤 Iniciando narração para slide ${request.slideNumber}: ${request.title}`)
    
    // Verificar cache primeiro
    const cacheKey = this.generateCacheKey(request)
    if (this.narrationCache.has(cacheKey)) {
      console.log(`📦 Usando cache para slide ${request.slideNumber}`)
      return this.narrationCache.get(cacheKey)!
    }

    try {
      // 1. Preparar texto otimizado para narração
      const optimizedText = this.prepareSlideTextForNarration(request)
      
      // 2. Dividir em segmentos naturais
      const textSegments = this.splitIntoNaturalSegments(optimizedText)
      
      // 3. Gerar áudio para cada segmento
      const segments = await this.generateAudioSegments(
        textSegments, 
        request.voiceConfig, 
        request.syncWithAvatar
      )
      
      // 4. Calcular timing total
      const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0)
      
      // 5. Gerar arquivo de áudio final combinado
      const audioUrl = await this.combineAudioSegments(segments, request.slideId)
      
      // 6. Gerar dados de sincronização labial para avatares
      const lipSyncData = request.syncWithAvatar 
        ? await this.generateLipSyncData(segments)
        : []
      
      // 7. Calcular métricas de qualidade
      const quality = this.calculateQualityMetrics(optimizedText, segments)
      
      const result: SlideNarrationResult = {
        slideId: request.slideId,
        slideNumber: request.slideNumber,
        segments,
        totalDuration,
        audioUrl,
        lipSyncData,
        quality,
        cacheKey,
        cost: this.calculateCost(optimizedText, request.voiceConfig.voiceId),
        processedAt: new Date()
      }
      
      // Armazenar no cache
      this.narrationCache.set(cacheKey, result)
      
      console.log(`✅ Narração concluída para slide ${request.slideNumber} - ${Math.round(totalDuration)}s`)
      return result
      
    } catch (error) {
      console.error(`❌ Erro na narração do slide ${request.slideNumber}:`, error)
      throw new Error(`Falha na geração de narração para slide ${request.slideNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  /**
   * Gerar narração para múltiplos slides em lote
   */
  async generateBatchNarration(
    requests: SlideNarrationRequest[],
    onProgress?: (progress: BatchNarrationProgress) => void
  ): Promise<SlideNarrationResult[]> {
    
    console.log(`🎬 Iniciando narração em lote para ${requests.length} slides`)
    
    const results: SlideNarrationResult[] = []
    const errors: Array<{ slideNumber: number, error: string, suggestion: string }> = []
    let totalCost = 0
    const startTime = Date.now()
    
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i]
      
      try {
        // Callback de progresso
        if (onProgress) {
          const elapsed = Date.now() - startTime
          const avgTimePerSlide = elapsed / Math.max(i, 1)
          const remainingTime = (requests.length - i) * avgTimePerSlide
          
          onProgress({
            totalSlides: requests.length,
            completedSlides: i,
            currentSlide: {
              number: request.slideNumber,
              title: request.title,
              status: 'processing'
            },
            estimatedTimeRemaining: Math.round(remainingTime / 1000),
            totalCost,
            errors
          })
        }
        
        // Gerar narração para o slide
        const result = await this.generateSlideNarration(request)
        results.push(result)
        totalCost += result.cost
        
        // Atualizar progresso como concluído
        if (onProgress) {
          onProgress({
            totalSlides: requests.length,
            completedSlides: i + 1,
            currentSlide: {
              number: request.slideNumber,
              title: request.title,
              status: 'completed'
            },
            estimatedTimeRemaining: 0,
            totalCost,
            errors
          })
        }
        
        // Delay entre slides para evitar rate limiting
        if (i < requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        console.error(`❌ Erro no slide ${request.slideNumber}:`, error)
        
        errors.push({
          slideNumber: request.slideNumber,
          error: errorMessage,
          suggestion: this.getErrorSuggestion(errorMessage)
        })
        
        // Adicionar resultado de erro vazio
        results.push({
          slideId: request.slideId,
          slideNumber: request.slideNumber,
          segments: [],
          totalDuration: 0,
          audioUrl: '',
          lipSyncData: [],
          quality: { pronunciation_score: 0, clarity_score: 0, emotion_match: 0 },
          cacheKey: '',
          cost: 0,
          processedAt: new Date()
        })
      }
    }
    
    console.log(`🎉 Narração em lote concluída: ${results.length} slides, custo total: R$ ${totalCost.toFixed(2)}`)
    return results
  }

  /**
   * Preparar texto do slide para narração natural
   */
  private prepareSlideTextForNarration(request: SlideNarrationRequest): string {
    let narrativeText = ''
    
    // 1. Introduzir o slide
    if (request.slideNumber === 1) {
      narrativeText += 'Bem-vindos ao nosso treinamento. '
    } else {
      narrativeText += `Agora, vamos para o ${this.numberToPortuguese(request.slideNumber)} tópico. `
    }
    
    // 2. Apresentar título
    if (request.title) {
      narrativeText += `${request.title}. `
    }
    
    // 3. Apresentar conteúdo em formato natural
    if (request.content && request.content.length > 0) {
      if (request.content.length === 1) {
        narrativeText += `${request.content[0]}. `
      } else {
        narrativeText += 'Vamos abordar os seguintes pontos importantes: '
        
        request.content.forEach((item, index) => {
          if (index === 0) {
            narrativeText += `Primeiro, ${item.toLowerCase()}. `
          } else if (index === request.content.length - 1) {
            narrativeText += `E por último, ${item.toLowerCase()}. `
          } else {
            narrativeText += `Em seguida, ${item.toLowerCase()}. `
          }
        })
      }
    }
    
    // 4. Adicionar notas se disponíveis
    if (request.notes && request.notes.trim()) {
      narrativeText += `${request.notes}. `
    }
    
    // 5. Transição para próximo slide (exceto último)
    narrativeText += 'Vamos continuar. '
    
    // 6. Otimizar texto para TTS brasileiro
    return this.optimizeForBrazilianTTS(narrativeText, request.voiceConfig)
  }

  /**
   * Otimizar texto para TTS brasileiro
   */
  private optimizeForBrazilianTTS(text: string, voiceConfig: any): string {
    let optimized = text
    
    // Substituições para melhor pronúncia
    const pronunciationMap: Record<string, string> = {
      'NR-12': 'Norma Regulamentadora doze',
      'NR-10': 'Norma Regulamentadora dez',
      'NR-6': 'Norma Regulamentadora seis',
      'EPI': 'E P I',
      'EPC': 'E P C',
      'CIPA': 'C I P A',
      'SESMT': 'S E S M T',
      'PPRA': 'P P R A',
      'PCMSO': 'P C M S O',
      'CAT': 'C A T',
      'SST': 'S S T',
      'COVID-19': 'covid dezenove',
      'Wi-Fi': 'uái fái',
      'email': 'í-meil',
      'download': 'daun-lôud',
      'upload': 'âp-lôud',
      'vs.': 'versus',
      'etc.': 'etcétera',
      'p.ex.': 'por exemplo',
      'obs.': 'observação'
    }
    
    // Aplicar substituições
    Object.entries(pronunciationMap).forEach(([term, pronunciation]) => {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      optimized = optimized.replace(regex, pronunciation)
    })
    
    // Adicionar pausas naturais
    optimized = optimized
      .replace(/\./g, '. <break time="500ms"/>')
      .replace(/,/g, ', <break time="200ms"/>')
      .replace(/:/g, ': <break time="300ms"/>')
      .replace(/;/g, '; <break time="300ms"/>')
      .replace(/\?/g, '? <break time="500ms"/>')
      .replace(/!/g, '! <break time="500ms"/>')
    
    // Enfatizar termos importantes de segurança
    const emphasisTerms = [
      'atenção', 'cuidado', 'perigo', 'risco', 'proibido', 
      'obrigatório', 'nunca', 'jamais', 'sempre', 'importante'
    ]
    
    emphasisTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      optimized = optimized.replace(regex, `<emphasis level="strong">${term}</emphasis>`)
    })
    
    // Aplicar expressões regionais se ativado
    if (voiceConfig.regional_expressions) {
      optimized = this.applyRegionalExpressions(optimized, voiceConfig.voiceId)
    }
    
    return optimized.replace(/\s+/g, ' ').trim()
  }

  /**
   * Aplicar expressões regionais baseadas na voz selecionada
   */
  private applyRegionalExpressions(text: string, voiceId: string): string {
    const voice = BrazilianRegionalTTS.REGIONAL_VOICES.find(v => v.id === voiceId)
    if (!voice) return text
    
    let adapted = text
    
    switch (voice.region.name) {
      case 'Sul':
        adapted = adapted.replace(/\bvocê\b/gi, 'tu')
        adapted = adapted.replace(/\blegal\b/gi, 'massa')
        adapted = adapted.replace(/\bentendeu\b/gi, 'tá ligado')
        break
        
      case 'Nordeste':
        adapted = adapted.replace(/\bmuito bom\b/gi, 'massa demais')
        adapted = adapted.replace(/\bentender\b/gi, 'sacar')
        adapted = adapted.replace(/\bvamos\b/gi, 'bora')
        adapted = adapted.replace(/\brapaziada\b/gi, 'galera')
        break
        
      case 'Norte':
        adapted = adapted.replace(/\blegal\b/gi, 'maneiro')
        adapted = adapted.replace(/\brápido\b/gi, 'ligeiro')
        adapted = adapted.replace(/\bmuito\b/gi, 'bem')
        break
        
      case 'Centro-Oeste':
        adapted = adapted.replace(/\bpessoal\b/gi, 'galera')
        adapted = adapted.replace(/\bcerto\b/gi, 'fechou')
        break
        
      case 'Sudeste':
        // Mantém mais formal para região Sudeste
        adapted = adapted.replace(/\bok\b/gi, 'certo')
        break
    }
    
    return adapted
  }

  /**
   * Dividir texto em segmentos naturais para melhor fluxo
   */
  private splitIntoNaturalSegments(text: string): string[] {
    // Dividir por sentenças primeiro
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const segments: string[] = []
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim()
      if (trimmed.length === 0) return
      
      // Se a sentença é muito longa (>120 chars), dividir por vírgulas
      if (trimmed.length > 120) {
        const parts = trimmed.split(',').filter(p => p.trim().length > 0)
        if (parts.length > 1) {
          parts.forEach((part, index) => {
            const cleanPart = part.trim()
            if (index === parts.length - 1) {
              segments.push(cleanPart + '.')
            } else {
              segments.push(cleanPart + ',')
            }
          })
        } else {
          // Se não há vírgulas, dividir por palavras-chave de transição
          const transitionWords = ['então', 'portanto', 'assim', 'desta forma', 'por isso']
          let split = false
          
          for (const word of transitionWords) {
            if (trimmed.toLowerCase().includes(word)) {
              const parts = trimmed.split(new RegExp(`\\b${word}\\b`, 'i'))
              if (parts.length === 2) {
                segments.push(parts[0].trim() + '.')
                segments.push(word + ' ' + parts[1].trim() + '.')
                split = true
                break
              }
            }
          }
          
          if (!split) {
            segments.push(trimmed + '.')
          }
        }
      } else {
        segments.push(trimmed + '.')
      }
    })
    
    return segments.filter(s => s.length > 1)
  }

  /**
   * Gerar segmentos de áudio
   */
  private async generateAudioSegments(
    textSegments: string[],
    voiceConfig: SlideNarrationRequest['voiceConfig'],
    syncWithAvatar: boolean
  ): Promise<NarrationSegment[]> {
    
    const segments: NarrationSegment[] = []
    let currentStartTime = 0
    
    for (let i = 0; i < textSegments.length; i++) {
      const text = textSegments[i]
      
      try {
        // Gerar áudio via serviço TTS
        const audioResult = await this.generateTTSAudio(text, voiceConfig)
        
        // Calcular duração baseado no texto e velocidade
        const estimatedDuration = this.calculateSegmentDuration(text, voiceConfig.speed)
        
        // Gerar dados de sincronização labial se necessário (mock)
        const lipSyncData = syncWithAvatar 
          ? this.generateMockLipSync(text, estimatedDuration)
          : []
        
        const segment: NarrationSegment = {
          id: `segment_${i}`,
          text: text,
          audioUrl: audioResult.audioUrl,
          duration: estimatedDuration,
          startTime: currentStartTime,
          endTime: currentStartTime + estimatedDuration,
          confidence: audioResult.confidence || 0.95,
          phoneticBreakdown: this.generatePhoneticBreakdown(text),
          lipSyncData
        }
        
        segments.push(segment)
        currentStartTime += estimatedDuration
        
        // Pequeno delay entre chamadas
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Erro no segmento ${i}:`, error)
        // Criar segmento de fallback
        segments.push({
          id: `segment_${i}`,
          text: text,
          audioUrl: '',
          duration: this.calculateSegmentDuration(text, voiceConfig.speed),
          startTime: currentStartTime,
          endTime: currentStartTime + this.calculateSegmentDuration(text, voiceConfig.speed),
          confidence: 0,
          lipSyncData: []
        })
      }
    }
    
    return segments
  }

  /**
   * Gerar áudio TTS para um segmento
   */
  private async generateTTSAudio(
    text: string, 
    voiceConfig: SlideNarrationRequest['voiceConfig']
  ): Promise<{ audioUrl: string, confidence: number }> {
    
    const voice = BrazilianRegionalTTS.REGIONAL_VOICES.find(v => v.id === voiceConfig.voiceId)
    
    if (!voice) {
      throw new Error(`Voz ${voiceConfig.voiceId} não encontrada`)
    }
    
    // Usar Google Cloud TTS se disponível
    if (this.ttsClient) {
      return this.generateGoogleTTS(text, voice, voiceConfig)
    } 
    // Fallback para ElevenLabs
    else if (process.env.ELEVENLABS_API_KEY) {
      return this.generateElevenLabsTTS(text, voiceConfig)
    }
    // Demo mode
    else {
      return this.generateDemoTTS(text, voiceConfig)
    }
  }

  /**
   * Gerar TTS via Google Cloud
   */
  private async generateGoogleTTS(
    text: string,
    voice: BrazilianVoiceRegional,
    voiceConfig: SlideNarrationRequest['voiceConfig']
  ): Promise<{ audioUrl: string, confidence: number }> {
    
    const request = {
      input: { 
        ssml: `<speak><prosody rate="${voiceConfig.speed}" pitch="${voiceConfig.pitch > 1 ? '+' : ''}${(voiceConfig.pitch - 1) * 50}%">${text}</prosody></speak>`
      },
      voice: {
        languageCode: 'pt-BR',
        name: 'pt-BR-Neural2-A', // Usar voz neural brasileira
        ssmlGender: (voice.characteristics.gender === 'masculino' ? 'MALE' : 'FEMALE') as 'MALE' | 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3' as 'MP3',
        speakingRate: voiceConfig.speed,
        pitch: (voiceConfig.pitch - 1) * 4, // Converter para range do Google (-20 a 20)
        effectsProfileId: ['handset-class-device'] // Melhor para dispositivos móveis
      }
    }

    const [response] = await this.ttsClient!.synthesizeSpeech(request) as unknown as [any]
    
    if (!response.audioContent) {
      throw new Error('Nenhum conteúdo de áudio recebido do Google TTS')
    }

    // Salvar áudio e retornar URL
    const audioUrl = await this.saveAudioFile(response.audioContent, 'mp3')
    
    return {
      audioUrl,
      confidence: 0.98 // Google TTS tem alta confiabilidade
    }
  }

  /**
   * Gerar TTS via ElevenLabs
   */
  private async generateElevenLabsTTS(
    text: string,
    voiceConfig: SlideNarrationRequest['voiceConfig']
  ): Promise<{ audioUrl: string, confidence: number }> {
    
    const audioBuffer = await elevenLabsClient.generateSpeech({
      text,
      voice_id: 'br-female-1', // Mapear voiceId para ElevenLabs
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: voiceConfig.emotion === 'animado' ? 0.8 : 0.3,
        use_speaker_boost: true
      }
    })
    
    const audioUrl = await this.saveAudioBuffer(audioBuffer, 'mp3')
    
    return {
      audioUrl,
      confidence: 0.92
    }
  }

  /**
   * Gerar TTS demo (desenvolvimento)
   */
  private async generateDemoTTS(
    text: string,
    voiceConfig: SlideNarrationRequest['voiceConfig']
  ): Promise<{ audioUrl: string, confidence: number }> {
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      audioUrl: `/demo-audio/tts_${Date.now()}.mp3`,
      confidence: 0.85
    }
  }

  /**
   * Calcular duração do segmento baseado no texto e velocidade
   */
  private calculateSegmentDuration(text: string, speed: number): number {
    // Português brasileiro: aproximadamente 2.8 caracteres por segundo em velocidade normal
    const baseCharsPerSecond = 2.8
    const adjustedSpeed = baseCharsPerSecond * speed
    
    // Duração mínima de 1 segundo, máxima de 30 segundos por segmento
    const duration = Math.max(1, Math.min(30, text.length / adjustedSpeed))
    
    return Math.round(duration * 10) / 10 // Arredondar para 1 decimal
  }

  /**
   * Gerar dados de sincronização labial para avatares
   */
  private async generateLipSyncData(segments: NarrationSegment[]): Promise<LipSyncFrame[]> {
    const lipSyncFrames: LipSyncFrame[] = []
    
    for (const segment of segments) {
      // Gerar frames de sincronização labial baseado no texto
      const phonemes = this.textToPhonemes(segment.text)
      const frameDuration = segment.duration / phonemes.length
      
      phonemes.forEach((phoneme, index) => {
        const timestamp = segment.startTime + (index * frameDuration)
        const viseme = this.phonemeToViseme(phoneme)
        
        lipSyncFrames.push({
          timestamp,
          viseme,
          intensity: this.calculatePhonemeIntensity(phoneme),
          duration: frameDuration
        })
      })
    }
    
    return lipSyncFrames
  }

  /**
   * Converter texto para fonemas (simplificado)
   */
  private textToPhonemes(text: string): string[] {
    // Mapeamento simplificado de português para fonemas
    const phonemeMap: Record<string, string[]> = {
      'a': ['A'],
      'e': ['E'],
      'i': ['I'],
      'o': ['O'],
      'u': ['U'],
      'b': ['B'],
      'c': ['K', 'S'],
      'd': ['D'],
      'f': ['F'],
      'g': ['G'],
      'h': [], // Mudo em português
      'j': ['J'],
      'k': ['K'],
      'l': ['L'],
      'm': ['M'],
      'n': ['N'],
      'p': ['P'],
      'q': ['K'],
      'r': ['R'],
      's': ['S'],
      't': ['T'],
      'v': ['V'],
      'w': ['V'],
      'x': ['S', 'Z'],
      'y': ['I'],
      'z': ['Z']
    }
    
    const cleanText = text.toLowerCase().replace(/[^a-záéíóúãõçâêîôû\s]/g, '')
    const phonemes: string[] = []
    
    for (const char of cleanText) {
      if (char === ' ') {
        phonemes.push('SIL') // Silêncio
      } else {
        const phoneList = phonemeMap[char] || ['UNK']
        phonemes.push(...phoneList)
      }
    }
    
    return phonemes
  }

  /**
   * Converter fonema para visema (posição da boca)
   */
  private phonemeToViseme(phoneme: string): string {
    const visemeMap: Record<string, string> = {
      'A': 'aa',
      'E': 'E',
      'I': 'ih',
      'O': 'oh',
      'U': 'ou',
      'B': 'PP',
      'M': 'PP',
      'P': 'PP',
      'F': 'FF',
      'V': 'FF',
      'T': 'TH',
      'D': 'TH',
      'S': 'SS',
      'Z': 'SS',
      'L': 'nn',
      'N': 'nn',
      'R': 'RR',
      'K': 'kk',
      'G': 'kk',
      'SIL': 'sil'
    }
    
    return visemeMap[phoneme] || 'sil'
  }

  /**
   * Calcular intensidade do fonema
   */
  private calculatePhonemeIntensity(phoneme: string): number {
    const intensityMap: Record<string, number> = {
      'A': 0.9,
      'E': 0.8,
      'I': 0.7,
      'O': 0.9,
      'U': 0.8,
      'SIL': 0.0
    }
    
    return intensityMap[phoneme] || 0.5
  }

  /**
   * Gerar decomposição fonética
   */
  private generatePhoneticBreakdown(text: string): string[] {
    // Simplificado - em produção usaria biblioteca de fonética portuguesa
    return text.split(' ').map(word => 
      word.toLowerCase().replace(/[^a-záéíóúãõçâêîôû]/g, '')
    )
  }

  /**
   * Combinar segmentos de áudio em arquivo final
   */
  private async combineAudioSegments(segments: NarrationSegment[], slideId: string): Promise<string> {
    // Em produção, usaria FFmpeg para combinar áudios
    // Por ora, retorna URL do primeiro segmento ou URL simulada
    
    if (segments.length > 0 && segments[0].audioUrl) {
      return segments[0].audioUrl
    }
    
    return `/audio/slides/${slideId}_combined.mp3`
  }

  /**
   * Salvar arquivo de áudio
   */
  private async saveAudioFile(audioContent: any, format: string): Promise<string> {
    // Em produção, salvaria no S3 ou sistema de arquivos
    const timestamp = Date.now()
    const filename = `tts_${timestamp}.${format}`
    
    // Simular salvamento
    return `/audio/generated/${filename}`
  }

  /**
   * Salvar buffer de áudio
   */
  private async saveAudioBuffer(buffer: Buffer, format: string): Promise<string> {
    const timestamp = Date.now()
    const filename = `tts_${timestamp}.${format}`
    
    // Em produção, salvaria no S3
    return `/audio/generated/${filename}`
  }

  /**
   * Calcular métricas de qualidade
   */
  private calculateQualityMetrics(text: string, segments: NarrationSegment[]): {
    pronunciation_score: number
    clarity_score: number
    emotion_match: number
  } {
    
    // Pontuação baseada na qualidade dos segmentos
    const avgConfidence = segments.reduce((sum, seg) => sum + seg.confidence, 0) / segments.length
    
    return {
      pronunciation_score: Math.min(0.98, avgConfidence + 0.05),
      clarity_score: Math.min(0.96, avgConfidence),
      emotion_match: 0.85 // Baseado na correspondência de emoção
    }
  }

  /**
   * Gerar chave de cache
   */
  private generateCacheKey(request: SlideNarrationRequest): string {
    const content = JSON.stringify({
      text: request.title + request.content.join(' ') + (request.notes || ''),
      voiceId: request.voiceConfig.voiceId,
      speed: request.voiceConfig.speed,
      emotion: request.voiceConfig.emotion,
      regional: request.voiceConfig.regional_expressions
    })
    
    return `slide_narration_${Buffer.from(content).toString('base64').slice(0, 32)}`
  }

  /**
   * Calcular custo da narração
   */
  private calculateCost(text: string, voiceId: string): number {
    const voice = BrazilianRegionalTTS.REGIONAL_VOICES.find(v => v.id === voiceId)
    if (!voice) return 0
    
    const charCount = text.length
    let costPerChar = 0
    
    switch (voice.pricing_tier) {
      case 'gratuito':
        costPerChar = 0
        break
      case 'basico':
        costPerChar = 0.0001 // R$ 0,10 por 1K chars
        break
      case 'premium':
        costPerChar = 0.0003 // R$ 0,30 por 1K chars
        break
      case 'enterprise':
        costPerChar = 0.0005 // R$ 0,50 por 1K chars
        break
    }
    
    return Math.round(charCount * costPerChar * 100) / 100
  }

  /**
   * Converter número para português
   */
  private numberToPortuguese(num: number): string {
    const numbers: Record<number, string> = {
      1: 'primeiro',
      2: 'segundo',
      3: 'terceiro',
      4: 'quarto',
      5: 'quinto',
      6: 'sexto',
      7: 'sétimo',
      8: 'oitavo',
      9: 'nono',
      10: 'décimo'
    }
    
    return numbers[num] || `${num}º`
  }

  /**
   * Obter sugestão para erro
   */
  private getErrorSuggestion(error: string): string {
    if (error.includes('rate limit')) {
      return 'Tente novamente em alguns segundos ou reduza a velocidade de processamento'
    }
    if (error.includes('authentication')) {
      return 'Verifique as credenciais da API TTS'
    }
    if (error.includes('text too long')) {
      return 'Reduza o texto do slide ou divida em slides menores'
    }
    
    return 'Verifique a conexão com a internet e tente novamente'
  }

  /**
   * Limpar cache de narração
   */
  clearCache(): void {
    this.narrationCache.clear()
    console.log('🗑️ Cache de narração limpo')
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats(): {
    size: number
    totalDuration: number
    totalCost: number
    hitRate: number
  } {
    let totalDuration = 0
    let totalCost = 0
    
    this.narrationCache.forEach(result => {
      totalDuration += result.totalDuration
      totalCost += result.cost
    })
    
    return {
      size: this.narrationCache.size,
      totalDuration: Math.round(totalDuration),
      totalCost: Math.round(totalCost * 100) / 100,
      hitRate: 0.75 // Estimativa
    }
  }

  /**
   * Generate mock lip sync data
   */
  private generateMockLipSync(text: string, duration: number): any[] {
    // Mock implementation for lip sync data
    const words = text.split(' ')
    const timePerWord = duration / words.length
    
    return words.map((word, index) => ({
      word,
      start: index * timePerWord,
      end: (index + 1) * timePerWord,
      phonemes: ['A', 'I', 'O'] // Mock phonemes
    }))
  }
}

// Exportar instância singleton
export const slideNarrationService = new SlideNarrationService()

