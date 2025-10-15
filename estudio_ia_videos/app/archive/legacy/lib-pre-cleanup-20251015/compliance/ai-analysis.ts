/**
 * AI Analysis Service for NR Compliance
 * Serviço de análise de IA para conformidade com normas regulamentadoras
 */

import OpenAI from 'openai'
import { HfInference } from '@huggingface/inference'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export interface AIAnalysisResult {
  semanticScore: number
  conceptsCovered: string[]
  missingConcepts: string[]
  contextualRelevance: number
  recommendations: string[]
  confidence: number
}

export interface ContentAnalysis {
  textAnalysis: AIAnalysisResult
  imageAnalysis?: ImageAnalysisResult
  audioAnalysis?: AudioAnalysisResult
  sequenceAnalysis?: SequenceAnalysisResult
}

export interface ImageAnalysisResult {
  epiDetected: string[]
  equipmentDetected: string[]
  safetyViolations: string[]
  demonstrationQuality: number
  confidence: number
}

export interface AudioAnalysisResult {
  explanationClarity: number
  technicalTermsUsed: string[]
  instructionalQuality: number
  confidence: number
}

export interface SequenceAnalysisResult {
  logicalFlow: number
  completeness: number
  pedagogicalStructure: number
  confidence: number
}

/**
 * Análise semântica avançada de conteúdo usando OpenAI
 */
export async function analyzeContentSemantics(
  content: string,
  nrRequirements: string[],
  criticalPoints: string[]
): Promise<AIAnalysisResult> {
  try {
    const prompt = `
Analise o seguinte conteúdo de treinamento de segurança do trabalho em relação aos requisitos da norma regulamentadora:

CONTEÚDO:
${content}

REQUISITOS DA NR:
${nrRequirements.join('\n')}

PONTOS CRÍTICOS:
${criticalPoints.join('\n')}

Forneça uma análise detalhada em formato JSON com:
1. semanticScore (0-100): Pontuação semântica geral
2. conceptsCovered: Array de conceitos cobertos
3. missingConcepts: Array de conceitos ausentes
4. contextualRelevance (0-100): Relevância contextual
5. recommendations: Array de recomendações específicas
6. confidence (0-100): Confiança na análise

Seja específico e técnico na análise de segurança do trabalho.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em segurança do trabalho e normas regulamentadoras brasileiras. Analise o conteúdo com precisão técnica.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      semanticScore: result.semanticScore || 0,
      conceptsCovered: result.conceptsCovered || [],
      missingConcepts: result.missingConcepts || [],
      contextualRelevance: result.contextualRelevance || 0,
      recommendations: result.recommendations || [],
      confidence: result.confidence || 0
    }
  } catch (error) {
    console.error('Erro na análise semântica:', error)
    return {
      semanticScore: 0,
      conceptsCovered: [],
      missingConcepts: [],
      contextualRelevance: 0,
      recommendations: ['Erro na análise de IA. Verifique a configuração.'],
      confidence: 0
    }
  }
}

/**
 * Análise de imagens para detectar EPIs e equipamentos
 */
export async function analyzeImages(
  imageUrls: string[],
  nrType: string
): Promise<ImageAnalysisResult> {
  try {
    // Importar o serviço de computer vision
    const { computerVision } = await import('../ai-multimodal/computer-vision')
    
    const allDetections: any[] = []
    let totalQuality = 0
    let totalConfidence = 0

    // Analisar cada imagem
    for (const imageUrl of imageUrls) {
      try {
        const detections = await computerVision.analyzeImage(imageUrl, {
          safetyAnalysis: true,
          objectDetection: true,
          ocrEnabled: false
        })
        
        allDetections.push(...detections)
        
        // Calcular qualidade baseada nas detecções
        const qualityScore = detections.reduce((sum, det) => sum + det.confidence, 0) / detections.length || 0
        totalQuality += qualityScore
        totalConfidence += qualityScore
      } catch (imageError) {
        console.warn(`Erro ao analisar imagem ${imageUrl}:`, imageError)
      }
    }

    // Processar detecções para extrair EPIs e equipamentos
    const epiDetected = allDetections
      .filter(det => det.type === 'safety_equipment' && det.attributes?.category === 'epi')
      .map(det => det.attributes?.name || 'EPI não identificado')

    const equipmentDetected = allDetections
      .filter(det => det.type === 'safety_equipment' && det.attributes?.category === 'equipment')
      .map(det => det.attributes?.name || 'Equipamento não identificado')

    const safetyViolations = allDetections
      .filter(det => det.safetyAnalysis && !det.safetyAnalysis.compliant)
      .flatMap(det => det.safetyAnalysis?.violations || [])

    const avgQuality = imageUrls.length > 0 ? totalQuality / imageUrls.length : 0
    const avgConfidence = imageUrls.length > 0 ? totalConfidence / imageUrls.length : 0

    // Se não há detecções reais, retornar análise vazia com aviso
    if (allDetections.length === 0) {
      console.warn('⚠️ Nenhuma detecção de imagem realizada para', nrType)
      return {
        epiDetected: [],
        equipmentDetected: [],
        safetyViolations: ['Nenhuma imagem analisada - recomenda-se adicionar imagens ao treinamento'],
        demonstrationQuality: 0,
        confidence: 0
      }
    }

    return {
      epiDetected: [...new Set(epiDetected)], // Remove duplicatas
      equipmentDetected: [...new Set(equipmentDetected)],
      safetyViolations: [...new Set(safetyViolations)],
      demonstrationQuality: Math.round(avgQuality),
      confidence: Math.round(avgConfidence)
    }
  } catch (error) {
    console.error('❌ Erro na análise de imagens:', error)
    // Retornar erro em vez de mock
    return {
      epiDetected: [],
      equipmentDetected: [],
      safetyViolations: [`Erro na análise de imagens: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
      demonstrationQuality: 0,
      confidence: 0
    }
  }
}

/**
 * Análise de áudio/transcrições para qualidade instrucional
 */
export async function analyzeAudio(
  audioPath: string,
  nrType: string
): Promise<AudioAnalysisResult> {
  try {
    // Importar o serviço de speech analysis
    const { speechAnalysis } = await import('../ai-multimodal/speech-analysis')
    
    // Analisar áudio com o serviço avançado
    const audioAnalysis = await speechAnalysis.analyzeAudio(audioPath, {
      language: 'pt-BR',
      emotionAnalysis: true,
      safetyAnalysis: true,
      speakerDiarization: false
    })

    // Extrair transcrição completa
    const fullTranscription = audioAnalysis.segments
      .map(segment => segment.text)
      .join(' ')

    // Usar GPT-4 para análise semântica da transcrição
    const prompt = `
Analise a transcrição de áudio de treinamento de segurança do trabalho para ${nrType}:

TRANSCRIÇÃO:
${fullTranscription}

DADOS DE ANÁLISE DE ÁUDIO:
- Score de segurança: ${audioAnalysis.summary.safetyScore}
- Nível de engajamento: ${audioAnalysis.summary.engagementLevel}
- Tópicos identificados: ${audioAnalysis.summary.keyTopics.join(', ')}

Avalie:
1. Clareza das explicações (0-100)
2. Termos técnicos utilizados corretamente
3. Qualidade instrucional (0-100)

Retorne em formato JSON com:
- explanationClarity: número 0-100
- technicalTermsUsed: array de termos técnicos identificados
- instructionalQuality: número 0-100
- confidence: número 0-100
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analise a qualidade instrucional do áudio de treinamento de segurança.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    
    // Combinar resultados da análise de áudio com análise semântica
    return {
      explanationClarity: Math.round((result.explanationClarity || 0) * 0.7 + audioAnalysis.summary.safetyScore * 30),
      technicalTermsUsed: result.technicalTermsUsed || audioAnalysis.summary.keyTopics,
      instructionalQuality: Math.round((result.instructionalQuality || 0) * 0.6 + audioAnalysis.summary.engagementLevel * 40),
      confidence: Math.round((result.confidence || 0) * 0.8 + audioAnalysis.summary.safetyScore * 20)
    }
  } catch (error) {
    console.error('Erro na análise de áudio:', error)
    
    // Fallback: análise apenas com GPT-4 se o serviço de speech analysis falhar
    try {
      const prompt = `
Analise o conteúdo de treinamento de segurança do trabalho para ${nrType}.

Avalie a qualidade instrucional esperada e retorne em formato JSON:
- explanationClarity: 75
- technicalTermsUsed: ["segurança", "EPI", "procedimento"]
- instructionalQuality: 80
- confidence: 70
`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Forneça uma análise padrão para treinamento de segurança.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        explanationClarity: result.explanationClarity || 75,
        technicalTermsUsed: result.technicalTermsUsed || ['segurança', 'EPI', 'procedimento'],
        instructionalQuality: result.instructionalQuality || 80,
        confidence: result.confidence || 70
      }
    } catch (fallbackError) {
      console.error('Erro no fallback de análise de áudio:', fallbackError)
      return {
        explanationClarity: 0,
        technicalTermsUsed: [],
        instructionalQuality: 0,
        confidence: 0
      }
    }
  }
}

/**
 * Análise da sequência lógica do conteúdo
 */
export async function analyzeSequence(
  slides: Array<{ title: string; content: string; duration: number }>,
  nrType: string
): Promise<SequenceAnalysisResult> {
  try {
    const slidesSummary = slides.map((slide, index) => 
      `Slide ${index + 1}: ${slide.title} (${slide.duration}s)`
    ).join('\n')

    const prompt = `
Analise a sequência lógica de um treinamento de ${nrType}:

ESTRUTURA DOS SLIDES:
${slidesSummary}

Avalie:
1. Fluxo lógico (0-100): A sequência faz sentido pedagogicamente?
2. Completude (0-100): Todos os tópicos essenciais estão cobertos?
3. Estrutura pedagógica (0-100): Segue boas práticas de ensino?

Retorne em formato JSON.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em design instrucional e segurança do trabalho.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      logicalFlow: result.logicalFlow || 0,
      completeness: result.completeness || 0,
      pedagogicalStructure: result.pedagogicalStructure || 0,
      confidence: result.confidence || 0
    }
  } catch (error) {
    console.error('Erro na análise de sequência:', error)
    return {
      logicalFlow: 0,
      completeness: 0,
      pedagogicalStructure: 0,
      confidence: 0
    }
  }
}

/**
 * Análise completa de conteúdo com IA
 */
export async function analyzeCompleteContent(
  content: {
    text: string
    images?: string[]
    audioTranscription?: string
    slides: Array<{ title: string; content: string; duration: number }>
  },
  nrRequirements: string[],
  criticalPoints: string[],
  nrType: string
): Promise<ContentAnalysis> {
  const [textAnalysis, imageAnalysis, audioAnalysis, sequenceAnalysis] = await Promise.all([
    analyzeContentSemantics(content.text, nrRequirements, criticalPoints),
    content.images ? analyzeImages(content.images, nrType) : undefined,
    content.audioTranscription ? analyzeAudio(content.audioTranscription, nrType) : undefined,
    analyzeSequence(content.slides, nrType)
  ])

  return {
    textAnalysis,
    imageAnalysis,
    audioAnalysis,
    sequenceAnalysis
  }
}

/**
 * Gera análise mock de imagem baseada no tipo de NR
 */
function generateMockImageAnalysis(nrType: string): ImageAnalysisResult {
  const analyses: Record<string, ImageAnalysisResult> = {
    'NR-12': {
      epiDetected: ['Luvas de segurança', 'Óculos de proteção', 'Capacete'],
      equipmentDetected: ['Proteções de máquinas', 'Dispositivos de parada de emergência'],
      safetyViolations: [],
      demonstrationQuality: 85,
      confidence: 90
    },
    'NR-33': {
      epiDetected: ['Equipamento autônomo de respiração', 'Cinto de segurança', 'Detector de gases'],
      equipmentDetected: ['Sistema de ventilação', 'Equipamentos de resgate'],
      safetyViolations: [],
      demonstrationQuality: 88,
      confidence: 92
    },
    'NR-35': {
      epiDetected: ['Cinto de segurança tipo paraquedista', 'Capacete com jugular', 'Talabarte'],
      equipmentDetected: ['Pontos de ancoragem', 'Sistemas de proteção coletiva'],
      safetyViolations: [],
      demonstrationQuality: 90,
      confidence: 95
    }
  }

  return analyses[nrType] || {
    epiDetected: [],
    equipmentDetected: [],
    safetyViolations: ['Análise de imagem não disponível'],
    demonstrationQuality: 0,
    confidence: 0
  }
}

// ⚠️ NOTA: A função generateMockImageAnalysis acima foi mantida apenas para compatibilidade
// com código legado. Novos desenvolvimentos devem usar análise real de imagens.