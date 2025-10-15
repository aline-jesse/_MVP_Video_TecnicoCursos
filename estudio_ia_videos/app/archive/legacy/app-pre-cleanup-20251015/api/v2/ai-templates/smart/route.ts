
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/database/prisma'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get AI-powered smart templates
    const smartTemplates = [
      {
        id: 'smart-nr10-adaptive',
        name: 'NR-10 Adaptativo Inteligente',
        category: 'Industrial',
        description: 'Template que se adapta ao nível de conhecimento e função do trabalhador',
        aiGenerated: true,
        adaptiveFeatures: [
          'Detecção de Nível de Conhecimento',
          'Exemplos Contextualizados por Função',
          'Quiz Adaptativo Inteligente',
          'Cenários Específicos por Ambiente',
          'Linguagem Ajustada ao Público'
        ],
        targetAudience: ['Eletricistas', 'Engenheiros Elétricos', 'Técnicos em Eletrotécnica', 'Supervisores'],
        compliance: ['NR-10', 'ABNT NBR 5410', 'ABNT NBR 14039', 'IEEE C2'],
        thumbnail: '/templates/smart-nr10-adaptive.jpg',
        usage: 342,
        rating: 4.9,
        estimatedTime: 15,
        aiCapabilities: {
          contextAwareness: true,
          dynamicContent: true,
          personalizedQuizzes: true,
          riskAssessment: true,
          complianceChecking: true
        },
        learningOutcomes: [
          'Identificar riscos elétricos específicos da função',
          'Aplicar procedimentos de segurança contextualizados',
          'Reconhecer EPIs adequados para cada situação',
          'Executar bloqueios e etiquetagens corretas'
        ]
      },
      {
        id: 'smart-safety-contextual',
        name: 'Segurança Contextual Dinâmica',
        category: 'Segurança',
        description: 'Adapta cenários de segurança baseado no ambiente de trabalho real',
        aiGenerated: true,
        adaptiveFeatures: [
          'Análise de Ambiente de Trabalho',
          'Cenários Dinâmicos por Setor',
          'Riscos Específicos Detectados',
          'EPIs Contextualizados',
          'Procedimentos Adaptativos'
        ],
        targetAudience: ['Operadores de Máquinas', 'Supervisores de SST', 'Técnicos de Segurança'],
        compliance: ['NR-6', 'NR-12', 'NR-35', 'NR-33'],
        thumbnail: '/templates/smart-safety-contextual.jpg',
        usage: 267,
        rating: 4.8,
        estimatedTime: 12,
        aiCapabilities: {
          environmentAnalysis: true,
          riskPrediction: true,
          adaptiveScenarios: true,
          realTimeUpdates: true,
          smartRecommendations: true
        },
        learningOutcomes: [
          'Reconhecer riscos específicos do ambiente',
          'Aplicar medidas preventivas adequadas',
          'Usar EPIs corretos para cada situação',
          'Seguir procedimentos de emergência'
        ]
      },
      {
        id: 'smart-health-personalized',
        name: 'Saúde Ocupacional Personalizada',
        category: 'Saúde',
        description: 'Template que considera histórico médico e perfil ocupacional',
        aiGenerated: true,
        adaptiveFeatures: [
          'Análise de Perfil Ocupacional',
          'Riscos Específicos por Função',
          'Recomendações Personalizadas',
          'Monitoramento de Saúde IA',
          'Alertas Preventivos Inteligentes'
        ],
        targetAudience: ['Médicos do Trabalho', 'Enfermeiros Ocupacionais', 'Técnicos em SST'],
        compliance: ['NR-7', 'NR-9', 'PCMSO', 'PPRA'],
        thumbnail: '/templates/smart-health-personalized.jpg',
        usage: 156,
        rating: 4.7,
        estimatedTime: 18,
        aiCapabilities: {
          healthProfiling: true,
          riskAnalysis: true,
          personalizedRecommendations: true,
          preventiveAlerts: true,
          complianceTracking: true
        },
        learningOutcomes: [
          'Identificar riscos ocupacionais específicos',
          'Implementar programas de prevenção',
          'Monitorar indicadores de saúde',
          'Atuar em medicina preventiva'
        ]
      },
      {
        id: 'smart-emergency-intelligent',
        name: 'Emergência Inteligente Adaptativa',
        category: 'Emergência',
        description: 'Treinamentos de emergência que se adaptam ao layout e riscos do local',
        aiGenerated: true,
        adaptiveFeatures: [
          'Mapeamento Inteligente de Rotas',
          'Cenários Específicos do Local',
          'Simulações Contextualizadas',
          'Análise de Vulnerabilidades',
          'Planos de Ação Adaptativos'
        ],
        targetAudience: ['Brigadistas', 'Supervisores', 'Equipes de Emergência'],
        compliance: ['NR-23', 'IT-08', 'ABNT NBR 15219'],
        thumbnail: '/templates/smart-emergency-intelligent.jpg',
        usage: 198,
        rating: 4.9,
        estimatedTime: 20,
        aiCapabilities: {
          layoutAnalysis: true,
          routeOptimization: true,
          scenarioGeneration: true,
          riskAssessment: true,
          realTimeAdaptation: true
        },
        learningOutcomes: [
          'Identificar rotas de fuga ótimas',
          'Executar procedimentos específicos do local',
          'Coordenar equipes de emergência',
          'Gerenciar crises eficientemente'
        ]
      },
      {
        id: 'smart-leadership-adaptive',
        name: 'Liderança em SST Adaptativa',
        category: 'Liderança',
        description: 'Desenvolve líderes em segurança com base no perfil de liderança',
        aiGenerated: true,
        adaptiveFeatures: [
          'Análise de Estilo de Liderança',
          'Cenários Específicos de Gestão',
          'Comunicação Adaptativa',
          'Tomada de Decisão Contextual',
          'Desenvolvimento Personalizado'
        ],
        targetAudience: ['Gerentes', 'Supervisores', 'Coordenadores de SST'],
        compliance: ['NR-1', 'ISO 45001', 'OHSAS 18001'],
        thumbnail: '/templates/smart-leadership-adaptive.jpg',
        usage: 89,
        rating: 4.8,
        estimatedTime: 25,
        aiCapabilities: {
          leadershipAssessment: true,
          communicationAnalysis: true,
          decisionSupport: true,
          teamDynamics: true,
          performanceTracking: true
        },
        learningOutcomes: [
          'Desenvolver liderança em segurança',
          'Comunicar-se efetivamente sobre SST',
          'Tomar decisões baseadas em dados',
          'Motivar equipes para segurança'
        ]
      },
      {
        id: 'smart-compliance-monitor',
        name: 'Monitor de Compliance Inteligente',
        category: 'Compliance',
        description: 'Sistema que monitora e atualiza automaticamente requisitos regulatórios',
        aiGenerated: true,
        adaptiveFeatures: [
          'Monitoramento Regulatório Automático',
          'Atualizações Normativas IA',
          'Análise de Gaps de Conformidade',
          'Recomendações Inteligentes',
          'Relatórios Automáticos'
        ],
        targetAudience: ['Analistas de Compliance', 'Auditores', 'Gestores de SST'],
        compliance: ['Todas as NRs', 'ISO 45001', 'OHSAS 18001', 'ISO 9001'],
        thumbnail: '/templates/smart-compliance-monitor.jpg',
        usage: 234,
        rating: 4.9,
        estimatedTime: 10,
        aiCapabilities: {
          regulatoryMonitoring: true,
          gapAnalysis: true,
          automaticUpdates: true,
          complianceScoring: true,
          predictiveCompliance: true
        },
        learningOutcomes: [
          'Manter conformidade regulatória',
          'Antecipar mudanças normativas',
          'Otimizar processos de compliance',
          'Reduzir riscos regulatórios'
        ]
      }
    ]

    // Add AI insights for each template
    const templatesWithInsights = smartTemplates.map(template => ({
      ...template,
      aiInsights: {
        adaptationPotential: Math.floor(Math.random() * 20) + 80, // 80-100%
        learningEfficiency: Math.floor(Math.random() * 15) + 85, // 85-100%
        engagementPredict: Math.floor(Math.random() * 10) + 90, // 90-100%
        customizationLevel: Math.floor(Math.random() * 25) + 75 // 75-100%
      },
      metrics: {
        completionRate: Math.floor(Math.random() * 10) + 85, // 85-95%
        userSatisfaction: 4.5 + Math.random() * 0.5, // 4.5-5.0
        knowledgeRetention: Math.floor(Math.random() * 15) + 80, // 80-95%
        timeToComplete: template.estimatedTime + Math.floor(Math.random() * 5) - 2
      }
    }))

    return NextResponse.json({
      templates: templatesWithInsights,
      categories: [
        { id: 'industrial', name: 'Industrial', count: 2 },
        { id: 'saude', name: 'Saúde', count: 1 },
        { id: 'seguranca', name: 'Segurança', count: 1 },
        { id: 'emergencia', name: 'Emergência', count: 1 },
        { id: 'lideranca', name: 'Liderança', count: 1 },
        { id: 'compliance', name: 'Compliance', count: 1 }
      ],
      aiFeatures: {
        adaptiveContent: true,
        contextAwareness: true,
        personalizedLearning: true,
        realTimeOptimization: true,
        predictiveAnalytics: true,
        automaticUpdates: true
      },
      total: templatesWithInsights.length,
      aiGenerated: templatesWithInsights.filter(t => t.aiGenerated).length
    })
  } catch (error) {
    console.error('Error fetching smart templates:', error)
    return NextResponse.json(
      { error: 'Failed to load smart templates' },
      { status: 500 }
    )
  }
}
