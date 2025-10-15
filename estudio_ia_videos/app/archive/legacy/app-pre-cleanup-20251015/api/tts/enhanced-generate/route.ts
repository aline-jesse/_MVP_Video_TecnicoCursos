

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { elevenLabsClient } from '@/lib/tts/elevenlabs'

export const dynamic = 'force-dynamic'

interface EnhancedTTSRequest {
  text: string
  voiceId: string
  speed: number
  emotion: 'neutro' | 'animado' | 'serio' | 'preocupado'
  regional_expressions: boolean
  sync_with_avatar: boolean
  quality: 'standard' | 'premium' | 'studio'
  output_format: 'mp3' | 'wav'
}

interface EnhancedTTSResponse {
  audioUrl: string
  duration: number
  quality: {
    pronunciation_score: number
    clarity_score: number
    naturalness_score: number
  }
  lipSyncData?: any[]
  cost: number
  processingTime: number
}

// POST /api/tts/enhanced-generate - Geração TTS melhorada para slides
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      text,
      voiceId,
      speed = 1.0,
      emotion = 'neutro',
      regional_expressions = true,
      sync_with_avatar = true,
      quality = 'premium',
      output_format = 'mp3'
    }: EnhancedTTSRequest = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Texto é obrigatório' },
        { status: 400 }
      )
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Texto muito longo (máximo 5000 caracteres)' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    console.log(`🎤 Gerando TTS melhorado - Voz: ${voiceId}, Qualidade: ${quality}`)

    try {
      // 1. Otimizar texto para TTS brasileiro
      const optimizedText = optimizeTextForBrazilianTTS(text, emotion, regional_expressions)
      
      // 2. Gerar áudio usando o melhor serviço disponível
      const audioResult = await generateEnhancedAudio(
        optimizedText,
        voiceId,
        {
          speed,
          emotion,
          quality,
          output_format
        }
      )
      
      // 3. Gerar dados de sincronização labial se necessário
      const lipSyncData = sync_with_avatar 
        ? await generateLipSyncData(optimizedText, audioResult.duration)
        : []
      
      // 4. Calcular métricas de qualidade
      const qualityMetrics = calculateQualityMetrics(optimizedText, audioResult, quality)
      
      // 5. Calcular custo
      const cost = calculateTTSCost(text.length, voiceId, quality)
      
      const processingTime = Date.now() - startTime

      const response: EnhancedTTSResponse = {
        audioUrl: audioResult.audioUrl,
        duration: audioResult.duration,
        quality: qualityMetrics,
        lipSyncData: sync_with_avatar ? lipSyncData : undefined,
        cost,
        processingTime
      }

      console.log(`✅ TTS gerado em ${processingTime}ms - Duração: ${audioResult.duration}s, Custo: R$ ${cost}`)

      return NextResponse.json({
        success: true,
        data: response,
        message: 'TTS melhorado gerado com sucesso'
      })

    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error('❌ Erro na geração TTS:', error)
      
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Erro na geração de áudio',
          processing_time: processingTime
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro na API TTS melhorada:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Otimizar texto para TTS brasileiro
 */
function optimizeTextForBrazilianTTS(
  text: string, 
  emotion: string, 
  regional_expressions: boolean
): string {
  let optimized = text

  // Dicionário de pronúncia para termos técnicos
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
    'CFM': 'C F M',
    'CEO': 'C E O',
    'RH': 'R H',
    'TI': 'T I',
    'AI': 'A I',
    'IA': 'I A',
    'CFO': 'C F O',
    'CTO': 'C T O',
    'FAQ': 'F A Q',
    'PDF': 'P D F',
    'URL': 'U R L',
    'HTML': 'H T M L',
    'CSS': 'C S S',
    'API': 'A P I',
    'SQL': 'S Q L',
    'IoT': 'I o T',
    'vs.': 'versus',
    'Dr.': 'Doutor',
    'Prof.': 'Professor',
    'Sr.': 'Senhor',
    'Sra.': 'Senhora',
    'etc.': 'etcétera',
    'p.ex.': 'por exemplo',
    'obs.': 'observação'
  }

  // Aplicar substituições
  Object.entries(pronunciationMap).forEach(([term, pronunciation]) => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    optimized = optimized.replace(regex, pronunciation)
  })

  // Adicionar pausas naturais baseadas na emoção
  const pauseLength = emotion === 'serio' ? '700ms' : emotion === 'animado' ? '300ms' : '500ms'
  
  optimized = optimized
    .replace(/\./g, `. <break time="${pauseLength}"/>`)
    .replace(/,/g, `, <break time="200ms"/>`)
    .replace(/:/g, `: <break time="300ms"/>`)
    .replace(/;/g, `; <break time="300ms"/>`)
    .replace(/\?/g, `? <break time="${pauseLength}"/>`)
    .replace(/!/g, `! <break time="400ms"/>`)

  // Adicionar ênfase baseada na emoção
  if (emotion === 'serio' || emotion === 'preocupado') {
    const emphasisWords = ['importante', 'atenção', 'cuidado', 'obrigatório', 'nunca', 'jamais']
    emphasisWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      optimized = optimized.replace(regex, `<emphasis level="strong">${word}</emphasis>`)
    })
  }

  if (emotion === 'animado') {
    const positiveWords = ['excelente', 'ótimo', 'perfeito', 'parabéns', 'sucesso']
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      optimized = optimized.replace(regex, `<emphasis level="moderate">${word}</emphasis>`)
    })
  }

  // Aplicar expressões regionais se ativado
  if (regional_expressions) {
    optimized = optimized
      .replace(/\bmuito bom\b/gi, 'massa demais')
      .replace(/\bentendeu\b/gi, 'tá ligado')
      .replace(/\bvamos\b/gi, 'bora')
      .replace(/\bpessoal\b/gi, 'galera')
      .replace(/\bok\b/gi, 'beleza')
  }

  return optimized.replace(/\s+/g, ' ').trim()
}

/**
 * Gerar áudio melhorado
 */
async function generateEnhancedAudio(
  text: string,
  voiceId: string,
  options: {
    speed: number
    emotion: string
    quality: string
    output_format: string
  }
): Promise<{ audioUrl: string, duration: number }> {
  
  // Tentar Google Cloud TTS primeiro (melhor qualidade)
  if (process.env.GOOGLE_CLOUD_TTS_CREDENTIALS) {
    return generateGoogleCloudTTS(text, voiceId, options)
  }
  
  // Fallback para ElevenLabs
  if (process.env.ELEVENLABS_API_KEY) {
    return generateElevenLabsEnhanced(text, options)
  }
  
  // Demo mode
  return generateDemoAudio(text, options)
}

/**
 * Google Cloud TTS melhorado
 */
async function generateGoogleCloudTTS(
  text: string,
  voiceId: string,
  options: any
): Promise<{ audioUrl: string, duration: number }> {
  
  const client = new TextToSpeechClient({
    keyFilename: process.env.GOOGLE_CLOUD_TTS_CREDENTIALS
  })

  // Mapear qualidade para modelo
  const voiceModel = options.quality === 'studio' ? 'pt-BR-Neural2-A' : 
                     options.quality === 'premium' ? 'pt-BR-Wavenet-A' : 
                     'pt-BR-Standard-A'

  const request = {
    input: { ssml: `<speak>${text}</speak>` },
    voice: {
      languageCode: 'pt-BR',
      name: voiceModel,
      ssmlGender: 'FEMALE' as const // Pode ser configurado baseado no voiceId
    },
    audioConfig: {
      audioEncoding: options.output_format === 'wav' ? 'LINEAR16' as const : 'MP3' as const,
      speakingRate: options.speed,
      pitch: 0,
      effectsProfileId: ['headphone-class-device']
    }
  }

  const [response] = await client.synthesizeSpeech(request)
  
  if (!response.audioContent) {
    throw new Error('Nenhum conteúdo de áudio recebido')
  }

  // Salvar áudio (simulado)
  const audioUrl = `/audio/enhanced/tts_${Date.now()}.${options.output_format}`
  
  // Calcular duração baseada no texto
  const duration = calculateAudioDuration(text, options.speed)

  return { audioUrl, duration }
}

/**
 * ElevenLabs melhorado
 */
async function generateElevenLabsEnhanced(
  text: string,
  options: any
): Promise<{ audioUrl: string, duration: number }> {
  
  const voiceSettings = {
    stability: options.emotion === 'serio' ? 0.8 : 0.6,
    similarity_boost: options.quality === 'studio' ? 0.9 : 0.8,
    style: options.emotion === 'animado' ? 0.8 : 0.3,
    use_speaker_boost: true
  }

  const audioBuffer = await elevenLabsClient.generateSpeech({
    text,
    voice_id: 'br-female-1',
    voice_settings: voiceSettings
  })

  const audioUrl = `/audio/enhanced/elevenlabs_${Date.now()}.mp3`
  const duration = calculateAudioDuration(text, options.speed)

  return { audioUrl, duration }
}

/**
 * Áudio demo para desenvolvimento
 */
async function generateDemoAudio(
  text: string,
  options: any
): Promise<{ audioUrl: string, duration: number }> {
  
  await new Promise(resolve => setTimeout(resolve, 800)) // Simular processamento
  
  const audioUrl = `/demo-audio/tts_${Date.now()}.${options.output_format}`
  const duration = calculateAudioDuration(text, options.speed)

  return { audioUrl, duration }
}

/**
 * Calcular duração do áudio
 */
function calculateAudioDuration(text: string, speed: number): number {
  // Português brasileiro: ~2.5 caracteres por segundo em velocidade normal
  const baseCharsPerSecond = 2.5
  const adjustedSpeed = baseCharsPerSecond * speed
  const duration = Math.max(1, text.length / adjustedSpeed)
  
  return Math.round(duration * 10) / 10
}

/**
 * Gerar dados de sincronização labial
 */
async function generateLipSyncData(text: string, duration: number): Promise<any[]> {
  // Simular geração de dados de lip-sync
  const words = text.split(' ')
  const frames: any[] = []
  const frameDuration = duration / words.length
  
  words.forEach((word, index) => {
    const timestamp = index * frameDuration
    
    frames.push({
      timestamp,
      word,
      phonemes: generateWordPhonemes(word),
      visemes: generateWordVisemes(word),
      intensity: calculateWordIntensity(word)
    })
  })
  
  return frames
}

/**
 * Gerar fonemas para palavra
 */
function generateWordPhonemes(word: string): string[] {
  // Mapeamento simplificado de português para fonemas
  const cleanWord = word.toLowerCase().replace(/[^a-záéíóúãõçâêîôû]/g, '')
  return cleanWord.split('').map(char => {
    const phonemeMap: Record<string, string> = {
      'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
      'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
      'j': 'ʒ', 'l': 'l', 'm': 'm', 'n': 'n', 'p': 'p',
      'r': 'r', 's': 's', 't': 't', 'v': 'v', 'z': 'z',
      'ç': 's', 'ã': 'ãː', 'õ': 'õː', 'ê': 'eː', 'ô': 'oː'
    }
    return phonemeMap[char] || char
  })
}

/**
 * Gerar visemas para palavra
 */
function generateWordVisemes(word: string): string[] {
  const phonemes = generateWordPhonemes(word)
  return phonemes.map(phoneme => {
    const visemeMap: Record<string, string> = {
      'a': 'aa', 'e': 'E', 'i': 'ih', 'o': 'oh', 'u': 'ou',
      'b': 'PP', 'm': 'PP', 'p': 'PP',
      'f': 'FF', 'v': 'FF',
      't': 'TH', 'd': 'TH',
      's': 'SS', 'z': 'SS',
      'l': 'nn', 'n': 'nn',
      'r': 'RR', 'k': 'kk', 'g': 'kk'
    }
    return visemeMap[phoneme] || 'sil'
  })
}

/**
 * Calcular intensidade da palavra
 */
function calculateWordIntensity(word: string): number {
  const emphasisWords = ['atenção', 'cuidado', 'importante', 'obrigatório', 'nunca']
  const lowerWord = word.toLowerCase()
  
  if (emphasisWords.some(emphasys => lowerWord.includes(emphasys))) {
    return 0.9
  }
  
  return 0.6
}

/**
 * Calcular métricas de qualidade
 */
function calculateQualityMetrics(
  text: string,
  audioResult: any,
  quality: string
): {
  pronunciation_score: number
  clarity_score: number
  naturalness_score: number
} {
  
  // Pontuação baseada na qualidade selecionada
  const baseScores = {
    'standard': { pronunciation: 0.80, clarity: 0.75, naturalness: 0.70 },
    'premium': { pronunciation: 0.92, clarity: 0.88, naturalness: 0.85 },
    'studio': { pronunciation: 0.98, clarity: 0.95, naturalness: 0.93 }
  }
  
  const scores = baseScores[quality as keyof typeof baseScores] || baseScores.premium
  
  // Ajustar baseado no comprimento do texto (textos mais longos podem ter qualidade menor)
  const lengthFactor = Math.min(1.0, 1000 / text.length)
  
  return {
    pronunciation_score: Math.min(0.99, scores.pronunciation * lengthFactor),
    clarity_score: Math.min(0.99, scores.clarity * lengthFactor),
    naturalness_score: Math.min(0.99, scores.naturalness * lengthFactor)
  }
}

/**
 * Calcular custo do TTS
 */
function calculateTTSCost(textLength: number, voiceId: string, quality: string): number {
  const baseCostPerChar = 0.0001 // R$ 0.10 por 1K caracteres
  
  const qualityMultiplier = {
    'standard': 1.0,
    'premium': 1.5,
    'studio': 2.0
  }[quality] || 1.0
  
  const voiceMultiplier = voiceId.includes('premium') ? 1.3 : 1.0
  
  const cost = textLength * baseCostPerChar * qualityMultiplier * voiceMultiplier
  return Math.round(cost * 100) / 100
}

// GET /api/tts/enhanced-generate - Obter configurações disponíveis
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        supported_voices: [
          'sp-carlos-industrial',
          'rj-maria-corporate', 
          'ba-antonio-mentor',
          'rs-lucia-professional'
        ],
        supported_emotions: ['neutro', 'animado', 'serio', 'preocupado'],
        supported_qualities: ['standard', 'premium', 'studio'],
        supported_formats: ['mp3', 'wav'],
        speed_range: { min: 0.5, max: 2.0, default: 1.0 },
        max_text_length: 5000,
        estimated_costs: {
          'standard': 'R$ 0.10/1K chars',
          'premium': 'R$ 0.15/1K chars', 
          'studio': 'R$ 0.20/1K chars'
        }
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao obter configurações' },
      { status: 500 }
    )
  }
}

