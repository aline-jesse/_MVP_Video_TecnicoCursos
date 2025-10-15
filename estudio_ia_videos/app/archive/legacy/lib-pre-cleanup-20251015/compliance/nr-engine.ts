
/**
 * NR Compliance Engine with AI Analysis
 * Engine de validação de conformidade com normas regulamentadoras usando IA
 */

import { NR_TEMPLATES, type NRCode, getNRTemplate } from './templates'
import { analyzeCompleteContent, type ContentAnalysis } from './ai-analysis'

export interface ComplianceCheckResult {
  nr: string
  nrName: string
  status: 'compliant' | 'partial' | 'non_compliant'
  score: number
  requirementsMet: number
  requirementsTotal: number
  findings: ComplianceFinding[]
  recommendations: string[]
  criticalPoints: CriticalPointCoverage[]
  aiAnalysis?: ContentAnalysis
  aiScore?: number
  confidence?: number
}

export interface ComplianceFinding {
  type: 'error' | 'warning' | 'info'
  topic: string
  message: string
  slideNumbers?: number[]
}

export interface CriticalPointCoverage {
  point: string
  covered: boolean
  confidence: number
  evidence?: string[]
}

export interface ProjectContent {
  slides: Array<{
    number: number
    title: string
    content: string
    duration: number
    images?: string[]
  }>
  totalDuration: number
  audioTranscripts?: string[]
}

/**
 * Valida conformidade de um projeto com uma NR específica usando IA
 */
export async function checkCompliance(
  nr: NRCode,
  projectContent: ProjectContent,
  useAI: boolean = true
): Promise<ComplianceCheckResult> {
  const template = getNRTemplate(nr)
  if (!template) {
    throw new Error(`Template não encontrado para ${nr}`)
  }

  const findings: ComplianceFinding[] = []
  let requirementsMet = 0
  const requirementsTotal = template.requiredTopics.length

  // Concatena todo o conteúdo para análise
  const allContent = projectContent.slides
    .map(s => `${s.title} ${s.content}`.toLowerCase())
    .join(' ')

  // Análise com IA (se habilitada)
  let aiAnalysis: ContentAnalysis | undefined
  let aiScore = 0
  let confidence = 0

  if (useAI) {
    try {
      const nrRequirements = template.requiredTopics.map(t => t.description)
      
      aiAnalysis = await analyzeCompleteContent(
        {
          text: allContent,
          images: projectContent.slides.flatMap(s => s.images || []),
          audioTranscription: projectContent.audioTranscripts?.join(' '),
          slides: projectContent.slides
        },
        nrRequirements,
        template.criticalPoints,
        template.nr
      )

      // Calcula score baseado na análise de IA
      aiScore = Math.round(
        (aiAnalysis.textAnalysis.semanticScore * 0.4) +
        (aiAnalysis.textAnalysis.contextualRelevance * 0.3) +
        ((aiAnalysis.imageAnalysis?.demonstrationQuality || 70) * 0.2) +
        ((aiAnalysis.sequenceAnalysis?.logicalFlow || 70) * 0.1)
      )

      confidence = aiAnalysis.textAnalysis.confidence

      // Adiciona recomendações da IA
      findings.push(...aiAnalysis.textAnalysis.recommendations.map(rec => ({
        type: 'info' as const,
        topic: 'Análise de IA',
        message: rec
      })))

    } catch (error) {
      console.error('Erro na análise de IA:', error)
      findings.push({
        type: 'warning',
        topic: 'Análise de IA',
        message: 'Análise de IA não disponível. Usando análise tradicional.'
      })
    }
  }

  // Verifica cada tópico obrigatório (análise tradicional)
  for (const topic of template.requiredTopics) {
    const topicCovered = checkTopicCoverage(
      topic,
      projectContent.slides,
      allContent
    )

    if (topicCovered.covered) {
      requirementsMet++
      
      // Verifica duração mínima
      if (topicCovered.duration < topic.minDuration) {
        findings.push({
          type: 'warning',
          topic: topic.title,
          message: `Duração insuficiente: ${topicCovered.duration}s (mínimo: ${topic.minDuration}s)`,
          slideNumbers: topicCovered.slideNumbers
        })
      }
    } else if (topic.mandatory) {
      findings.push({
        type: 'error',
        topic: topic.title,
        message: `Tópico obrigatório não coberto: ${topic.description}`,
      })
    }
  }

  // Verifica pontos críticos
  const criticalPoints = checkCriticalPoints(
    template.criticalPoints,
    allContent
  )

  // Calcula score combinado (tradicional + IA)
  const topicScore = (requirementsMet / requirementsTotal) * 70
  const criticalScore = (criticalPoints.filter(c => c.covered).length / criticalPoints.length) * 30
  const traditionalScore = Math.round(topicScore + criticalScore)

  // Score final combina análise tradicional e IA
  const finalScore = useAI && aiScore > 0 
    ? Math.round((traditionalScore * 0.6) + (aiScore * 0.4))
    : traditionalScore

  // Determina status
  let status: 'compliant' | 'partial' | 'non_compliant'
  if (finalScore >= template.assessmentCriteria.minScore && requirementsMet === requirementsTotal) {
    status = 'compliant'
  } else if (finalScore >= 50) {
    status = 'partial'
  } else {
    status = 'non_compliant'
  }

  // Gera recomendações
  const recommendations = generateRecommendations(
    template,
    findings,
    criticalPoints
  )

  return {
    nr: template.nr,
    nrName: template.name,
    status,
    score: finalScore,
    requirementsMet,
    requirementsTotal,
    findings,
    recommendations,
    criticalPoints,
    aiAnalysis,
    aiScore,
    confidence
  }
}

/**
 * Verifica cobertura de um tópico específico
 */
function checkTopicCoverage(
  topic: any,
  slides: ProjectContent['slides'],
  allContent: string
) {
  let covered = false
  let duration = 0
  const slideNumbers: number[] = []

  // Verifica se keywords do tópico aparecem no conteúdo
  const keywordsFound = topic.keywords.filter((kw: string) =>
    allContent.includes(kw.toLowerCase())
  ).length

  covered = keywordsFound >= topic.keywords.length * 0.5 // 50% das keywords

  // Se coberto, calcula duração
  if (covered) {
    slides.forEach(slide => {
      const slideContent = `${slide.title} ${slide.content}`.toLowerCase()
      const slideHasKeywords = topic.keywords.some((kw: string) =>
        slideContent.includes(kw.toLowerCase())
      )
      
      if (slideHasKeywords) {
        duration += slide.duration
        slideNumbers.push(slide.number)
      }
    })
  }

  return { covered, duration, slideNumbers }
}

/**
 * Verifica cobertura de pontos críticos
 */
function checkCriticalPoints(
  criticalPoints: string[],
  allContent: string
): CriticalPointCoverage[] {
  return criticalPoints.map(point => {
    // Extrai palavras-chave do ponto crítico
    const keywords = point.toLowerCase().split(' ').filter(w => w.length > 3)
    
    // Verifica se pelo menos 60% das keywords aparecem
    const keywordsFound = keywords.filter(kw => allContent.includes(kw))
    const confidence = keywordsFound.length / keywords.length

    return {
      point,
      covered: confidence >= 0.6,
      confidence: Math.round(confidence * 100),
      evidence: keywordsFound.length > 0 ? [point] : []
    }
  })
}

/**
 * Gera recomendações baseadas nos achados
 */
function generateRecommendations(
  template: any,
  findings: ComplianceFinding[],
  criticalPoints: CriticalPointCoverage[]
): string[] {
  const recommendations: string[] = []

  // Recomendações para tópicos não cobertos
  const errorFindings = findings.filter(f => f.type === 'error')
  if (errorFindings.length > 0) {
    recommendations.push(
      `Adicionar conteúdo sobre: ${errorFindings.map(f => f.topic).join(', ')}`
    )
  }

  // Recomendações para duração
  const warningFindings = findings.filter(f => f.type === 'warning' && f.message.includes('Duração'))
  if (warningFindings.length > 0) {
    recommendations.push(
      'Aumentar tempo de apresentação de alguns tópicos para atingir duração mínima'
    )
  }

  // Recomendações para pontos críticos não cobertos
  const uncoveredPoints = criticalPoints.filter(c => !c.covered)
  if (uncoveredPoints.length > 0) {
    recommendations.push(
      `Incluir demonstrações/exemplos de: ${uncoveredPoints.map(p => p.point).join(', ')}`
    )
  }

  // Recomendações gerais
  if (recommendations.length === 0) {
    recommendations.push('Projeto em conformidade! Considere adicionar mais exemplos práticos.')
  }

  return recommendations
}
