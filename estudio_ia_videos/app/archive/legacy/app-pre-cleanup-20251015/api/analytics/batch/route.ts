
import { NextRequest, NextResponse } from 'next/server'

interface BatchAnalyticsPayload {
  events: any[]
  behaviorData: {
    timeOnPage: number
    scrollDepth: number
    clickHeatmap: Array<{ x: number; y: number; timestamp: number }>
    featuresUsed: string[]
    conversionFunnel: string[]
    dropoffPoints: string[]
  }
  sessionId: string
}

export async function POST(request: NextRequest) {
  try {
    const payload: BatchAnalyticsPayload = await request.json()

    if (!payload.sessionId || !Array.isArray(payload.events)) {
      return NextResponse.json(
        { error: 'Payload inválido' },
        { status: 400 }
      )
    }

    // Processar eventos em batch
    console.log(`Processing ${payload.events.length} events for session ${payload.sessionId}`)

    // Agregar métricas de comportamento
    const behaviorInsights = {
      session: payload.sessionId,
      engagementScore: calculateEngagementScore(payload.behaviorData),
      featuresEngagement: analyzeFeaturesUsage(payload.behaviorData.featuresUsed),
      conversionProgress: analyzeConversionFunnel(payload.behaviorData.conversionFunnel),
      dropoffAnalysis: analyzeDropoffPoints(payload.behaviorData.dropoffPoints)
    }

    console.log('Behavior Insights:', behaviorInsights)

    // Em produção, salvar no banco de dados
    // await saveBatchEvents(payload.events)
    // await saveBehaviorData(behaviorInsights)

    return NextResponse.json({ 
      success: true,
      processed: payload.events.length,
      insights: behaviorInsights
    })
  } catch (error) {
    console.error('Error processing batch analytics:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function calculateEngagementScore(behaviorData: BatchAnalyticsPayload['behaviorData']): number {
  let score = 0

  // Tempo na página (max 40 pontos)
  score += Math.min(behaviorData.timeOnPage / 1000 / 60, 10) * 4 // max 10 min

  // Profundidade de scroll (max 20 pontos)
  score += (behaviorData.scrollDepth / 100) * 20

  // Funcionalidades usadas (max 30 pontos)
  score += Math.min(behaviorData.featuresUsed.length, 15) * 2

  // Interações (clicks) (max 10 pontos)
  score += Math.min(behaviorData.clickHeatmap.length / 10, 1) * 10

  return Math.min(Math.round(score), 100)
}

function analyzeFeaturesUsage(featuresUsed: string[]): Record<string, number> {
  const usage: Record<string, number> = {}
  
  featuresUsed.forEach(feature => {
    const category = feature.split(':')[0]
    usage[category] = (usage[category] || 0) + 1
  })

  return usage
}

function analyzeConversionFunnel(conversionFunnel: string[]): {
  steps: string[]
  completionRate: number
  currentStep: string
} {
  const uniqueSteps = [...new Set(conversionFunnel)]
  const completionRate = conversionFunnel.includes('video_exported') ? 100 :
                        conversionFunnel.includes('video_created') ? 75 :
                        conversionFunnel.includes('avatar_selected') ? 50 :
                        conversionFunnel.includes('template_selected') ? 25 : 0

  return {
    steps: uniqueSteps,
    completionRate,
    currentStep: uniqueSteps[uniqueSteps.length - 1] || 'landing'
  }
}

function analyzeDropoffPoints(dropoffPoints: string[]): {
  criticalPoints: string[]
  severity: 'low' | 'medium' | 'high'
} {
  const criticalDropoffs = ['avatar_selection', 'voice_configuration', 'export_options']
  const foundCritical = dropoffPoints.filter(point => criticalDropoffs.includes(point))
  
  const severity = foundCritical.length >= 2 ? 'high' :
                  foundCritical.length === 1 ? 'medium' : 'low'

  return {
    criticalPoints: foundCritical,
    severity
  }
}
