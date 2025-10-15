/**
 * 🎭 Advanced Lip-Sync Service V2
 * Serviço avançado de sincronização labial para avatares 3D
 * Integração com TTS e análise de áudio em tempo real
 */

import { PhonemeData, LipSyncData, BlendShape, MouthShape } from './enhanced-tts-service'

// Configurações avançadas de lip-sync
interface LipSyncConfig {
  precision: 'low' | 'medium' | 'high' | 'ultra'
  frameRate: number // FPS para sincronização
  smoothing: number // 0-1, suavização entre frames
  intensity: number // 0-1, intensidade dos movimentos
  language: 'pt-BR' | 'en-US' | 'es-ES' | 'auto'
  enableEmotions: boolean
  enableBreathing: boolean
  enableMicroExpressions: boolean
}

// Dados de análise de áudio
interface AudioAnalysis {
  duration: number
  sampleRate: number
  channels: number
  amplitude: Float32Array
  frequency: Float32Array
  formants: FormantData[]
  pitch: PitchData[]
  energy: EnergyData[]
  silences: SilenceRegion[]
}

// Dados de formantes (ressonâncias vocais)
interface FormantData {
  timestamp: number
  f1: number // Primeira formante
  f2: number // Segunda formante
  f3: number // Terceira formante
  bandwidth: number
  intensity: number
}

// Dados de pitch (tom)
interface PitchData {
  timestamp: number
  frequency: number
  confidence: number
  voicing: boolean
}

// Dados de energia
interface EnergyData {
  timestamp: number
  rms: number // Root Mean Square
  zcr: number // Zero Crossing Rate
  spectralCentroid: number
}

// Regiões de silêncio
interface SilenceRegion {
  start: number
  end: number
  confidence: number
}

// Blend shapes avançados para avatares 3D
interface AdvancedBlendShape extends BlendShape {
  jawOpen: number
  jawForward: number
  jawLeft: number
  jawRight: number
  lipUpperUp: number
  lipLowerDown: number
  lipCornerPull: number
  lipFunnel: number
  lipPucker: number
  cheekPuff: number
  tongueOut: number
  eyeBlinkLeft: number
  eyeBlinkRight: number
  browInnerUp: number
  browOuterUp: number
  noseSneer: number
}

// Keyframe de animação avançado
interface AdvancedKeyframe {
  timestamp: number
  blendShapes: AdvancedBlendShape
  emotion: EmotionState
  breathing: BreathingState
  microExpression?: MicroExpression
  confidence: number
}

// Estado emocional
interface EmotionState {
  happiness: number
  sadness: number
  anger: number
  fear: number
  surprise: number
  disgust: number
  neutral: number
  arousal: number // Ativação emocional
  valence: number // Valência (positivo/negativo)
}

// Estado de respiração
interface BreathingState {
  phase: 'inhale' | 'exhale' | 'pause'
  intensity: number
  rate: number // Respirações por minuto
}

// Micro expressões
interface MicroExpression {
  type: 'eyebrow_flash' | 'lip_twitch' | 'nostril_flare' | 'eye_squint'
  intensity: number
  duration: number
}

// Resultado da sincronização labial
interface LipSyncResult {
  keyframes: AdvancedKeyframe[]
  metadata: {
    duration: number
    frameCount: number
    frameRate: number
    quality: 'low' | 'medium' | 'high' | 'ultra'
    processingTime: number
    confidence: number
  }
  audioAnalysis: AudioAnalysis
  phonemeMapping: PhonemeMapping[]
  emotionTimeline: EmotionTimeline[]
}

// Mapeamento de fonemas
interface PhonemeMapping {
  phoneme: string
  start: number
  end: number
  confidence: number
  blendShapeWeights: AdvancedBlendShape
  coarticulation: CoarticulationEffect[]
}

// Efeitos de coarticulação (influência entre fonemas)
interface CoarticulationEffect {
  influencingPhoneme: string
  influence: number // 0-1
  direction: 'forward' | 'backward'
}

// Timeline de emoções
interface EmotionTimeline {
  timestamp: number
  emotion: EmotionState
  trigger: 'phoneme' | 'prosody' | 'context' | 'manual'
  confidence: number
}

// Mapa de fonemas para português brasileiro
const PORTUGUESE_PHONEME_MAP = {
  // Vogais
  'a': { jaw: 0.8, tongue: 0.0, lips: 0.0, category: 'vowel' },
  'e': { jaw: 0.5, tongue: 0.3, lips: 0.0, category: 'vowel' },
  'ɛ': { jaw: 0.7, tongue: 0.2, lips: 0.0, category: 'vowel' },
  'i': { jaw: 0.2, tongue: 0.8, lips: 0.1, category: 'vowel' },
  'o': { jaw: 0.6, tongue: 0.0, lips: 0.6, category: 'vowel' },
  'ɔ': { jaw: 0.8, tongue: 0.0, lips: 0.4, category: 'vowel' },
  'u': { jaw: 0.3, tongue: 0.0, lips: 0.9, category: 'vowel' },
  
  // Consoantes labiais
  'p': { jaw: 0.0, tongue: 0.0, lips: 1.0, category: 'plosive' },
  'b': { jaw: 0.0, tongue: 0.0, lips: 1.0, category: 'plosive' },
  'm': { jaw: 0.0, tongue: 0.0, lips: 1.0, category: 'nasal' },
  'f': { jaw: 0.1, tongue: 0.0, lips: 0.8, category: 'fricative' },
  'v': { jaw: 0.1, tongue: 0.0, lips: 0.8, category: 'fricative' },
  
  // Consoantes alveolares
  't': { jaw: 0.2, tongue: 0.7, lips: 0.0, category: 'plosive' },
  'd': { jaw: 0.2, tongue: 0.7, lips: 0.0, category: 'plosive' },
  'n': { jaw: 0.2, tongue: 0.7, lips: 0.0, category: 'nasal' },
  's': { jaw: 0.1, tongue: 0.6, lips: 0.0, category: 'fricative' },
  'z': { jaw: 0.1, tongue: 0.6, lips: 0.0, category: 'fricative' },
  'l': { jaw: 0.3, tongue: 0.5, lips: 0.0, category: 'liquid' },
  'r': { jaw: 0.4, tongue: 0.4, lips: 0.0, category: 'liquid' },
  
  // Consoantes palatais
  'ʃ': { jaw: 0.2, tongue: 0.8, lips: 0.3, category: 'fricative' },
  'ʒ': { jaw: 0.2, tongue: 0.8, lips: 0.3, category: 'fricative' },
  'tʃ': { jaw: 0.3, tongue: 0.8, lips: 0.2, category: 'affricate' },
  'dʒ': { jaw: 0.3, tongue: 0.8, lips: 0.2, category: 'affricate' },
  'ɲ': { jaw: 0.3, tongue: 0.8, lips: 0.0, category: 'nasal' },
  'ʎ': { jaw: 0.3, tongue: 0.8, lips: 0.0, category: 'liquid' },
  
  // Consoantes velares
  'k': { jaw: 0.4, tongue: 0.9, lips: 0.0, category: 'plosive' },
  'g': { jaw: 0.4, tongue: 0.9, lips: 0.0, category: 'plosive' },
  'x': { jaw: 0.5, tongue: 0.9, lips: 0.0, category: 'fricative' },
  
  // Semivogais
  'j': { jaw: 0.2, tongue: 0.7, lips: 0.1, category: 'glide' },
  'w': { jaw: 0.3, tongue: 0.0, lips: 0.8, category: 'glide' },
  
  // Silêncio
  'sil': { jaw: 0.0, tongue: 0.0, lips: 0.0, category: 'silence' }
}

export class AdvancedLipSyncService {
  private static instance: AdvancedLipSyncService
  private config: LipSyncConfig
  private audioContext: AudioContext | null = null

  constructor(config?: Partial<LipSyncConfig>) {
    this.config = {
      precision: 'high',
      frameRate: 60,
      smoothing: 0.3,
      intensity: 0.8,
      language: 'pt-BR',
      enableEmotions: true,
      enableBreathing: true,
      enableMicroExpressions: false,
      ...config
    }
  }

  static getInstance(config?: Partial<LipSyncConfig>): AdvancedLipSyncService {
    if (!AdvancedLipSyncService.instance) {
      AdvancedLipSyncService.instance = new AdvancedLipSyncService(config)
    }
    return AdvancedLipSyncService.instance
  }

  // Gerar sincronização labial avançada a partir de áudio e fonemas
  async generateAdvancedLipSync(
    audioBuffer: ArrayBuffer,
    phonemes: PhonemeData[],
    text: string,
    options?: Partial<LipSyncConfig>
  ): Promise<LipSyncResult> {
    const startTime = Date.now()
    const config = { ...this.config, ...options }

    try {
      // 1. Analisar áudio
      const audioAnalysis = await this.analyzeAudio(audioBuffer)
      
      // 2. Processar fonemas com coarticulação
      const phonemeMapping = this.processPhonemes(phonemes, audioAnalysis, config)
      
      // 3. Detectar emoções no texto e áudio
      const emotionTimeline = this.analyzeEmotions(text, audioAnalysis, config)
      
      // 4. Gerar keyframes de animação
      const keyframes = this.generateKeyframes(
        phonemeMapping,
        emotionTimeline,
        audioAnalysis,
        config
      )
      
      // 5. Aplicar suavização e otimizações
      const smoothedKeyframes = this.smoothKeyframes(keyframes, config)
      
      // 6. Adicionar respiração e micro expressões
      const finalKeyframes = this.addBreathingAndMicroExpressions(
        smoothedKeyframes,
        audioAnalysis,
        config
      )

      const processingTime = Date.now() - startTime
      const confidence = this.calculateOverallConfidence(finalKeyframes, phonemeMapping)

      return {
        keyframes: finalKeyframes,
        metadata: {
          duration: audioAnalysis.duration,
          frameCount: finalKeyframes.length,
          frameRate: config.frameRate,
          quality: config.precision,
          processingTime,
          confidence
        },
        audioAnalysis,
        phonemeMapping,
        emotionTimeline
      }

    } catch (error) {
      console.error('Erro ao gerar lip-sync avançado:', error)
      throw error
    }
  }

  // Analisar áudio para extrair características
  private async analyzeAudio(audioBuffer: ArrayBuffer): Promise<AudioAnalysis> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const audioData = await this.audioContext.decodeAudioData(audioBuffer.slice(0))
    const channelData = audioData.getChannelData(0)
    const sampleRate = audioData.sampleRate
    const duration = audioData.duration

    // Análise de amplitude
    const amplitude = new Float32Array(channelData.length)
    for (let i = 0; i < channelData.length; i++) {
      amplitude[i] = Math.abs(channelData[i])
    }

    // Análise de frequência usando FFT
    const frequency = this.performFFT(channelData, sampleRate)
    
    // Análise de formantes
    const formants = this.extractFormants(channelData, sampleRate)
    
    // Análise de pitch
    const pitch = this.extractPitch(channelData, sampleRate)
    
    // Análise de energia
    const energy = this.extractEnergy(channelData, sampleRate)
    
    // Detecção de silêncios
    const silences = this.detectSilences(amplitude, sampleRate)

    return {
      duration,
      sampleRate,
      channels: audioData.numberOfChannels,
      amplitude,
      frequency,
      formants,
      pitch,
      energy,
      silences
    }
  }

  // Processar fonemas com efeitos de coarticulação
  private processPhonemes(
    phonemes: PhonemeData[],
    audioAnalysis: AudioAnalysis,
    config: LipSyncConfig
  ): PhonemeMapping[] {
    return phonemes.map((phoneme, index) => {
      const phonemeInfo = PORTUGUESE_PHONEME_MAP[phoneme.phoneme] || PORTUGUESE_PHONEME_MAP['sil']
      
      // Calcular blend shapes base
      const baseBlendShapes = this.phonemeToAdvancedBlendShapes(phoneme.phoneme, phonemeInfo)
      
      // Aplicar efeitos de coarticulação
      const coarticulationEffects = this.calculateCoarticulation(phonemes, index)
      const adjustedBlendShapes = this.applyCoarticulation(baseBlendShapes, coarticulationEffects)
      
      // Ajustar baseado na análise de áudio
      const audioAdjustedBlendShapes = this.adjustBlendShapesFromAudio(
        adjustedBlendShapes,
        audioAnalysis,
        phoneme.start,
        phoneme.end
      )

      return {
        phoneme: phoneme.phoneme,
        start: phoneme.start,
        end: phoneme.end,
        confidence: phoneme.confidence,
        blendShapeWeights: audioAdjustedBlendShapes,
        coarticulation: coarticulationEffects
      }
    })
  }

  // Converter fonema para blend shapes avançados
  private phonemeToAdvancedBlendShapes(phoneme: string, phonemeInfo: any): AdvancedBlendShape {
    const base = PORTUGUESE_PHONEME_MAP[phoneme] || PORTUGUESE_PHONEME_MAP['sil']
    
    return {
      name: phoneme,
      weight: 1.0,
      jawOpen: base.jaw * 0.8,
      jawForward: base.category === 'plosive' ? 0.2 : 0.0,
      jawLeft: 0.0,
      jawRight: 0.0,
      lipUpperUp: base.lips * 0.3,
      lipLowerDown: base.lips * 0.4,
      lipCornerPull: base.category === 'fricative' ? 0.2 : 0.0,
      lipFunnel: base.lips > 0.7 ? base.lips * 0.6 : 0.0,
      lipPucker: phoneme === 'u' || phoneme === 'o' ? base.lips * 0.8 : 0.0,
      cheekPuff: base.category === 'plosive' ? 0.3 : 0.0,
      tongueOut: base.tongue * 0.5,
      eyeBlinkLeft: 0.0,
      eyeBlinkRight: 0.0,
      browInnerUp: 0.0,
      browOuterUp: 0.0,
      noseSneer: base.category === 'fricative' ? 0.1 : 0.0
    }
  }

  // Calcular efeitos de coarticulação
  private calculateCoarticulation(phonemes: PhonemeData[], currentIndex: number): CoarticulationEffect[] {
    const effects: CoarticulationEffect[] = []
    const current = phonemes[currentIndex]
    
    // Influência do fonema anterior
    if (currentIndex > 0) {
      const previous = phonemes[currentIndex - 1]
      const influence = this.calculatePhonemeInfluence(previous.phoneme, current.phoneme, 'backward')
      if (influence > 0.1) {
        effects.push({
          influencingPhoneme: previous.phoneme,
          influence,
          direction: 'backward'
        })
      }
    }
    
    // Influência do próximo fonema
    if (currentIndex < phonemes.length - 1) {
      const next = phonemes[currentIndex + 1]
      const influence = this.calculatePhonemeInfluence(next.phoneme, current.phoneme, 'forward')
      if (influence > 0.1) {
        effects.push({
          influencingPhoneme: next.phoneme,
          influence,
          direction: 'forward'
        })
      }
    }
    
    return effects
  }

  // Calcular influência entre fonemas
  private calculatePhonemeInfluence(influencer: string, target: string, direction: 'forward' | 'backward'): number {
    const influencerInfo = PORTUGUESE_PHONEME_MAP[influencer]
    const targetInfo = PORTUGUESE_PHONEME_MAP[target]
    
    if (!influencerInfo || !targetInfo) return 0
    
    // Regras de coarticulação específicas para português
    let influence = 0
    
    // Influência labial
    if (influencerInfo.lips > 0.5 && targetInfo.lips < 0.3) {
      influence += 0.3
    }
    
    // Influência da língua
    if (Math.abs(influencerInfo.tongue - targetInfo.tongue) > 0.4) {
      influence += 0.2
    }
    
    // Influência da mandíbula
    if (Math.abs(influencerInfo.jaw - targetInfo.jaw) > 0.3) {
      influence += 0.2
    }
    
    // Ajustar baseado na direção
    if (direction === 'forward') {
      influence *= 0.7 // Influência futura é menor
    }
    
    return Math.min(1.0, influence)
  }

  // Aplicar efeitos de coarticulação
  private applyCoarticulation(
    baseBlendShapes: AdvancedBlendShape,
    effects: CoarticulationEffect[]
  ): AdvancedBlendShape {
    let adjusted = { ...baseBlendShapes }
    
    effects.forEach(effect => {
      const influencerInfo = PORTUGUESE_PHONEME_MAP[effect.influencingPhoneme]
      if (!influencerInfo) return
      
      const factor = effect.influence * 0.3 // Reduzir intensidade da coarticulação
      
      // Aplicar influência gradual
      adjusted.jawOpen = this.blendValues(adjusted.jawOpen, influencerInfo.jaw * 0.8, factor)
      adjusted.lipPucker = this.blendValues(adjusted.lipPucker, influencerInfo.lips * 0.8, factor)
      adjusted.tongueOut = this.blendValues(adjusted.tongueOut, influencerInfo.tongue * 0.5, factor)
    })
    
    return adjusted
  }

  // Misturar valores com peso
  private blendValues(current: number, target: number, weight: number): number {
    return current * (1 - weight) + target * weight
  }

  // Ajustar blend shapes baseado na análise de áudio
  private adjustBlendShapesFromAudio(
    blendShapes: AdvancedBlendShape,
    audioAnalysis: AudioAnalysis,
    startTime: number,
    endTime: number
  ): AdvancedBlendShape {
    const adjusted = { ...blendShapes }
    
    // Encontrar dados de áudio relevantes para este período
    const relevantFormants = audioAnalysis.formants.filter(f => 
      f.timestamp >= startTime && f.timestamp <= endTime
    )
    
    const relevantPitch = audioAnalysis.pitch.filter(p => 
      p.timestamp >= startTime && p.timestamp <= endTime
    )
    
    const relevantEnergy = audioAnalysis.energy.filter(e => 
      e.timestamp >= startTime && e.timestamp <= endTime
    )
    
    if (relevantFormants.length > 0) {
      const avgF1 = relevantFormants.reduce((sum, f) => sum + f.f1, 0) / relevantFormants.length
      const avgF2 = relevantFormants.reduce((sum, f) => sum + f.f2, 0) / relevantFormants.length
      
      // Ajustar abertura da mandíbula baseado em F1
      const f1Factor = Math.min(1.0, avgF1 / 800) // Normalizar F1
      adjusted.jawOpen = Math.max(adjusted.jawOpen, f1Factor * 0.6)
      
      // Ajustar posição da língua baseado em F2
      const f2Factor = Math.min(1.0, avgF2 / 2500) // Normalizar F2
      adjusted.tongueOut = this.blendValues(adjusted.tongueOut, f2Factor * 0.4, 0.3)
    }
    
    if (relevantEnergy.length > 0) {
      const avgEnergy = relevantEnergy.reduce((sum, e) => sum + e.rms, 0) / relevantEnergy.length
      const energyFactor = Math.min(1.0, avgEnergy * 10) // Amplificar energia
      
      // Ajustar intensidade geral baseado na energia
      Object.keys(adjusted).forEach(key => {
        if (key !== 'name' && key !== 'weight') {
          (adjusted as any)[key] *= (0.7 + energyFactor * 0.3)
        }
      })
    }
    
    return adjusted
  }

  // Analisar emoções no texto e áudio
  private analyzeEmotions(
    text: string,
    audioAnalysis: AudioAnalysis,
    config: LipSyncConfig
  ): EmotionTimeline[] {
    if (!config.enableEmotions) return []
    
    const timeline: EmotionTimeline[] = []
    const textEmotion = this.analyzeTextEmotion(text)
    const audioEmotion = this.analyzeAudioEmotion(audioAnalysis)
    
    // Combinar análises de texto e áudio
    const duration = audioAnalysis.duration
    const stepSize = 0.1 // Análise a cada 100ms
    
    for (let t = 0; t < duration; t += stepSize) {
      const audioEmotionAtTime = this.getEmotionAtTime(audioEmotion, t)
      const combinedEmotion = this.combineEmotions(textEmotion, audioEmotionAtTime)
      
      timeline.push({
        timestamp: t,
        emotion: combinedEmotion,
        trigger: 'prosody',
        confidence: 0.7
      })
    }
    
    return timeline
  }

  // Analisar emoção no texto
  private analyzeTextEmotion(text: string): EmotionState {
    const lowerText = text.toLowerCase()
    
    // Palavras-chave emocionais simples
    const emotionKeywords = {
      happiness: ['feliz', 'alegre', 'ótimo', 'excelente', 'maravilhoso', 'fantástico'],
      sadness: ['triste', 'melancólico', 'deprimido', 'chateado'],
      anger: ['raiva', 'irritado', 'furioso', 'bravo'],
      fear: ['medo', 'assustado', 'nervoso', 'ansioso'],
      surprise: ['surpreso', 'impressionado', 'uau', 'nossa'],
      disgust: ['nojo', 'repugnante', 'horrível']
    }
    
    const emotion: EmotionState = {
      happiness: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      neutral: 1,
      arousal: 0.5,
      valence: 0.5
    }
    
    let totalMatches = 0
    
    Object.entries(emotionKeywords).forEach(([emotionType, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length
      if (matches > 0) {
        (emotion as any)[emotionType] = Math.min(1.0, matches * 0.3)
        totalMatches += matches
      }
    })
    
    // Normalizar
    if (totalMatches > 0) {
      emotion.neutral = Math.max(0, 1 - totalMatches * 0.2)
      
      // Calcular arousal e valence
      emotion.arousal = (emotion.anger + emotion.fear + emotion.surprise) * 0.8 + 0.2
      emotion.valence = (emotion.happiness - emotion.sadness - emotion.anger - emotion.disgust) * 0.5 + 0.5
    }
    
    return emotion
  }

  // Analisar emoção no áudio
  private analyzeAudioEmotion(audioAnalysis: AudioAnalysis): EmotionTimeline[] {
    const timeline: EmotionTimeline[] = []
    
    // Análise baseada em características prosódicas
    audioAnalysis.pitch.forEach(pitchData => {
      const emotion: EmotionState = {
        happiness: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
        disgust: 0,
        neutral: 0.8,
        arousal: 0.5,
        valence: 0.5
      }
      
      // Pitch alto pode indicar felicidade ou surpresa
      if (pitchData.frequency > 200) {
        emotion.happiness = Math.min(1.0, (pitchData.frequency - 200) / 100 * 0.5)
        emotion.surprise = Math.min(1.0, (pitchData.frequency - 250) / 150 * 0.3)
      }
      
      // Pitch baixo pode indicar tristeza
      if (pitchData.frequency < 150) {
        emotion.sadness = Math.min(1.0, (150 - pitchData.frequency) / 50 * 0.4)
      }
      
      // Variação de pitch pode indicar emoção
      emotion.arousal = Math.min(1.0, pitchData.confidence * 0.8 + 0.2)
      emotion.valence = Math.min(1.0, Math.max(0, (pitchData.frequency - 150) / 100))
      
      timeline.push({
        timestamp: pitchData.timestamp,
        emotion,
        trigger: 'prosody',
        confidence: pitchData.confidence
      })
    })
    
    return timeline
  }

  // Obter emoção em um tempo específico
  private getEmotionAtTime(timeline: EmotionTimeline[], time: number): EmotionState {
    const closest = timeline.reduce((prev, curr) => 
      Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time) ? curr : prev
    )
    
    return closest ? closest.emotion : {
      happiness: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, disgust: 0,
      neutral: 1, arousal: 0.5, valence: 0.5
    }
  }

  // Combinar emoções de texto e áudio
  private combineEmotions(textEmotion: EmotionState, audioEmotion: EmotionState): EmotionState {
    const combined: EmotionState = {
      happiness: (textEmotion.happiness * 0.6 + audioEmotion.happiness * 0.4),
      sadness: (textEmotion.sadness * 0.6 + audioEmotion.sadness * 0.4),
      anger: (textEmotion.anger * 0.6 + audioEmotion.anger * 0.4),
      fear: (textEmotion.fear * 0.6 + audioEmotion.fear * 0.4),
      surprise: (textEmotion.surprise * 0.6 + audioEmotion.surprise * 0.4),
      disgust: (textEmotion.disgust * 0.6 + audioEmotion.disgust * 0.4),
      neutral: (textEmotion.neutral * 0.6 + audioEmotion.neutral * 0.4),
      arousal: (textEmotion.arousal * 0.5 + audioEmotion.arousal * 0.5),
      valence: (textEmotion.valence * 0.5 + audioEmotion.valence * 0.5)
    }
    
    return combined
  }

  // Gerar keyframes de animação
  private generateKeyframes(
    phonemeMapping: PhonemeMapping[],
    emotionTimeline: EmotionTimeline[],
    audioAnalysis: AudioAnalysis,
    config: LipSyncConfig
  ): AdvancedKeyframe[] {
    const keyframes: AdvancedKeyframe[] = []
    const frameDuration = 1000 / config.frameRate // ms por frame
    const totalFrames = Math.ceil(audioAnalysis.duration * 1000 / frameDuration)
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const timestamp = frame * frameDuration
      
      // Encontrar fonema ativo neste momento
      const activePhoneme = phonemeMapping.find(p => 
        timestamp >= p.start && timestamp <= p.end
      )
      
      // Encontrar emoção ativa
      const activeEmotion = this.getEmotionAtTime(emotionTimeline, timestamp / 1000)
      
      // Gerar blend shapes base
      let blendShapes = activePhoneme ? 
        { ...activePhoneme.blendShapeWeights } : 
        this.getRestingBlendShapes()
      
      // Aplicar modificações emocionais
      blendShapes = this.applyEmotionalModifications(blendShapes, activeEmotion, config)
      
      // Gerar estado de respiração
      const breathing = this.generateBreathingState(timestamp, audioAnalysis, config)
      
      keyframes.push({
        timestamp,
        blendShapes,
        emotion: activeEmotion,
        breathing,
        confidence: activePhoneme ? activePhoneme.confidence : 0.5
      })
    }
    
    return keyframes
  }

  // Obter blend shapes de repouso
  private getRestingBlendShapes(): AdvancedBlendShape {
    return {
      name: 'rest',
      weight: 1.0,
      jawOpen: 0.05,
      jawForward: 0.0,
      jawLeft: 0.0,
      jawRight: 0.0,
      lipUpperUp: 0.0,
      lipLowerDown: 0.0,
      lipCornerPull: 0.0,
      lipFunnel: 0.0,
      lipPucker: 0.0,
      cheekPuff: 0.0,
      tongueOut: 0.0,
      eyeBlinkLeft: 0.0,
      eyeBlinkRight: 0.0,
      browInnerUp: 0.0,
      browOuterUp: 0.0,
      noseSneer: 0.0
    }
  }

  // Aplicar modificações emocionais
  private applyEmotionalModifications(
    blendShapes: AdvancedBlendShape,
    emotion: EmotionState,
    config: LipSyncConfig
  ): AdvancedBlendShape {
    if (!config.enableEmotions) return blendShapes
    
    const modified = { ...blendShapes }
    
    // Felicidade - sorriso
    if (emotion.happiness > 0.3) {
      modified.lipCornerPull = Math.max(modified.lipCornerPull, emotion.happiness * 0.6)
      modified.browOuterUp = emotion.happiness * 0.2
    }
    
    // Tristeza - boca para baixo
    if (emotion.sadness > 0.3) {
      modified.lipCornerPull = Math.min(modified.lipCornerPull, -emotion.sadness * 0.4)
      modified.browInnerUp = emotion.sadness * 0.3
    }
    
    // Raiva - tensão
    if (emotion.anger > 0.3) {
      modified.jawForward = Math.max(modified.jawForward, emotion.anger * 0.3)
      modified.browInnerUp = emotion.anger * 0.4
      modified.noseSneer = emotion.anger * 0.2
    }
    
    // Surpresa - olhos e sobrancelhas
    if (emotion.surprise > 0.3) {
      modified.browOuterUp = emotion.surprise * 0.5
      modified.browInnerUp = emotion.surprise * 0.3
      modified.jawOpen = Math.max(modified.jawOpen, emotion.surprise * 0.4)
    }
    
    return modified
  }

  // Gerar estado de respiração
  private generateBreathingState(
    timestamp: number,
    audioAnalysis: AudioAnalysis,
    config: LipSyncConfig
  ): BreathingState {
    if (!config.enableBreathing) {
      return { phase: 'pause', intensity: 0, rate: 0 }
    }
    
    // Detectar pausas para respiração
    const isInSilence = audioAnalysis.silences.some(silence => 
      timestamp >= silence.start * 1000 && timestamp <= silence.end * 1000
    )
    
    if (isInSilence) {
      // Ciclo de respiração durante silêncios
      const breathCycle = (timestamp / 1000) % 4 // Ciclo de 4 segundos
      
      if (breathCycle < 1.5) {
        return { phase: 'inhale', intensity: breathCycle / 1.5, rate: 15 }
      } else if (breathCycle < 3) {
        return { phase: 'exhale', intensity: (3 - breathCycle) / 1.5, rate: 15 }
      } else {
        return { phase: 'pause', intensity: 0, rate: 15 }
      }
    }
    
    return { phase: 'pause', intensity: 0, rate: 15 }
  }

  // Suavizar keyframes
  private smoothKeyframes(keyframes: AdvancedKeyframe[], config: LipSyncConfig): AdvancedKeyframe[] {
    if (config.smoothing === 0 || keyframes.length < 3) return keyframes
    
    const smoothed = [...keyframes]
    const smoothingFactor = config.smoothing
    
    // Aplicar suavização usando média móvel ponderada
    for (let i = 1; i < smoothed.length - 1; i++) {
      const prev = keyframes[i - 1]
      const curr = keyframes[i]
      const next = keyframes[i + 1]
      
      // Suavizar cada propriedade dos blend shapes
      Object.keys(curr.blendShapes).forEach(key => {
        if (key !== 'name' && key !== 'weight') {
          const prevVal = (prev.blendShapes as any)[key]
          const currVal = (curr.blendShapes as any)[key]
          const nextVal = (next.blendShapes as any)[key]
          
          const smoothedVal = currVal * (1 - smoothingFactor) + 
                             (prevVal + nextVal) * 0.5 * smoothingFactor
          
          ;(smoothed[i].blendShapes as any)[key] = smoothedVal
        }
      })
    }
    
    return smoothed
  }

  // Adicionar respiração e micro expressões
  private addBreathingAndMicroExpressions(
    keyframes: AdvancedKeyframe[],
    audioAnalysis: AudioAnalysis,
    config: LipSyncConfig
  ): AdvancedKeyframe[] {
    const enhanced = [...keyframes]
    
    if (config.enableMicroExpressions) {
      // Adicionar micro expressões ocasionais
      const microExpressionInterval = 2000 // A cada 2 segundos
      
      for (let i = 0; i < enhanced.length; i++) {
        const timestamp = enhanced[i].timestamp
        
        if (timestamp % microExpressionInterval < 100) { // 100ms de duração
          const microExpression: MicroExpression = {
            type: this.getRandomMicroExpression(),
            intensity: 0.2 + Math.random() * 0.3,
            duration: 50 + Math.random() * 100
          }
          
          enhanced[i].microExpression = microExpression
          this.applyMicroExpression(enhanced[i], microExpression)
        }
      }
    }
    
    return enhanced
  }

  // Obter micro expressão aleatória
  private getRandomMicroExpression(): MicroExpression['type'] {
    const types: MicroExpression['type'][] = ['eyebrow_flash', 'lip_twitch', 'nostril_flare', 'eye_squint']
    return types[Math.floor(Math.random() * types.length)]
  }

  // Aplicar micro expressão
  private applyMicroExpression(keyframe: AdvancedKeyframe, microExpression: MicroExpression): void {
    switch (microExpression.type) {
      case 'eyebrow_flash':
        keyframe.blendShapes.browOuterUp += microExpression.intensity * 0.3
        break
      case 'lip_twitch':
        keyframe.blendShapes.lipCornerPull += microExpression.intensity * 0.2
        break
      case 'nostril_flare':
        keyframe.blendShapes.noseSneer += microExpression.intensity * 0.4
        break
      case 'eye_squint':
        keyframe.blendShapes.eyeBlinkLeft += microExpression.intensity * 0.1
        keyframe.blendShapes.eyeBlinkRight += microExpression.intensity * 0.1
        break
    }
  }

  // Calcular confiança geral
  private calculateOverallConfidence(
    keyframes: AdvancedKeyframe[],
    phonemeMapping: PhonemeMapping[]
  ): number {
    if (keyframes.length === 0) return 0
    
    const avgKeyframeConfidence = keyframes.reduce((sum, kf) => sum + kf.confidence, 0) / keyframes.length
    const avgPhonemeConfidence = phonemeMapping.reduce((sum, pm) => sum + pm.confidence, 0) / phonemeMapping.length
    
    return (avgKeyframeConfidence + avgPhonemeConfidence) / 2
  }

  // Métodos de análise de áudio (implementações simplificadas)
  private performFFT(channelData: Float32Array, sampleRate: number): Float32Array {
    // Implementação simplificada de FFT
    // Em produção, usar uma biblioteca como fft.js
    const fftSize = 2048
    const frequency = new Float32Array(fftSize / 2)
    
    // Placeholder - implementar FFT real
    for (let i = 0; i < frequency.length; i++) {
      frequency[i] = Math.random() * 0.1
    }
    
    return frequency
  }

  private extractFormants(channelData: Float32Array, sampleRate: number): FormantData[] {
    const formants: FormantData[] = []
    const windowSize = 1024
    const hopSize = 512
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const timestamp = i / sampleRate
      
      // Análise simplificada de formantes
      formants.push({
        timestamp,
        f1: 500 + Math.random() * 300, // F1 típico para vogais
        f2: 1500 + Math.random() * 1000, // F2 típico
        f3: 2500 + Math.random() * 500, // F3 típico
        bandwidth: 50 + Math.random() * 100,
        intensity: Math.random()
      })
    }
    
    return formants
  }

  private extractPitch(channelData: Float32Array, sampleRate: number): PitchData[] {
    const pitch: PitchData[] = []
    const windowSize = 1024
    const hopSize = 256
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const timestamp = i / sampleRate
      
      // Análise simplificada de pitch usando autocorrelação
      const window = channelData.slice(i, i + windowSize)
      const frequency = this.estimatePitch(window, sampleRate)
      
      pitch.push({
        timestamp,
        frequency,
        confidence: frequency > 0 ? 0.8 : 0.1,
        voicing: frequency > 50
      })
    }
    
    return pitch
  }

  private estimatePitch(window: Float32Array, sampleRate: number): number {
    // Implementação simplificada de detecção de pitch
    // Em produção, usar algoritmos como YIN ou RAPT
    
    const minPeriod = Math.floor(sampleRate / 500) // 500 Hz max
    const maxPeriod = Math.floor(sampleRate / 50)  // 50 Hz min
    
    let bestPeriod = 0
    let bestCorrelation = 0
    
    for (let period = minPeriod; period < maxPeriod && period < window.length / 2; period++) {
      let correlation = 0
      for (let i = 0; i < window.length - period; i++) {
        correlation += window[i] * window[i + period]
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestPeriod = period
      }
    }
    
    return bestPeriod > 0 ? sampleRate / bestPeriod : 0
  }

  private extractEnergy(channelData: Float32Array, sampleRate: number): EnergyData[] {
    const energy: EnergyData[] = []
    const windowSize = 512
    const hopSize = 256
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const timestamp = i / sampleRate
      const window = channelData.slice(i, i + windowSize)
      
      // RMS Energy
      const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length)
      
      // Zero Crossing Rate
      let zcr = 0
      for (let j = 1; j < window.length; j++) {
        if ((window[j] >= 0) !== (window[j - 1] >= 0)) {
          zcr++
        }
      }
      zcr /= window.length
      
      // Spectral Centroid (simplificado)
      const spectralCentroid = this.calculateSpectralCentroid(window, sampleRate)
      
      energy.push({
        timestamp,
        rms,
        zcr,
        spectralCentroid
      })
    }
    
    return energy
  }

  private calculateSpectralCentroid(window: Float32Array, sampleRate: number): number {
    // Implementação simplificada do centroide espectral
    let weightedSum = 0
    let magnitudeSum = 0
    
    for (let i = 0; i < window.length / 2; i++) {
      const frequency = i * sampleRate / window.length
      const magnitude = Math.abs(window[i])
      
      weightedSum += frequency * magnitude
      magnitudeSum += magnitude
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
  }

  private detectSilences(amplitude: Float32Array, sampleRate: number): SilenceRegion[] {
    const silences: SilenceRegion[] = []
    const threshold = 0.01 // Limiar de silêncio
    const minSilenceDuration = 0.1 // 100ms mínimo
    
    let silenceStart = -1
    
    for (let i = 0; i < amplitude.length; i++) {
      const timestamp = i / sampleRate
      
      if (amplitude[i] < threshold) {
        if (silenceStart === -1) {
          silenceStart = timestamp
        }
      } else {
        if (silenceStart !== -1) {
          const duration = timestamp - silenceStart
          if (duration >= minSilenceDuration) {
            silences.push({
              start: silenceStart,
              end: timestamp,
              confidence: 0.9
            })
          }
          silenceStart = -1
        }
      }
    }
    
    return silences
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<LipSyncConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Obter configuração atual
  getConfig(): LipSyncConfig {
    return { ...this.config }
  }

  // Limpar recursos
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

export default AdvancedLipSyncService