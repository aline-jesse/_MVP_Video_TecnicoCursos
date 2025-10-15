
import { NextRequest, NextResponse } from 'next/server'

interface NRTemplate {
  id: string
  nr: 'NR-06' | 'NR-10' | 'NR-12' | 'NR-33' | 'NR-35' | 'NR-17' | 'NR-23'
  title: string
  description: string
  duration: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  industry: string[]
  complianceScore: number
  lastUpdated: Date
  views: number
  rating: number
  scenarios: number
  interactive: boolean
  certified: boolean
  content?: any
}

interface ComplianceCheck {
  id: string
  rule: string
  status: 'compliant' | 'warning' | 'non-compliant'
  description: string
  recommendation?: string
}

// Mock data storage
let templates: NRTemplate[] = [
  {
    id: 'nr12-001',
    nr: 'NR-12',
    title: 'Segurança em Máquinas e Equipamentos - Módulo Básico',
    description: 'Treinamento fundamental sobre proteções físicas, dispositivos de segurança e procedimentos básicos de operação segura.',
    duration: 35,
    difficulty: 'basic',
    industry: ['Indústria', 'Manufatura', 'Automobilística'],
    complianceScore: 96.2,
    lastUpdated: new Date('2024-09-15'),
    views: 1247,
    rating: 4.8,
    scenarios: 8,
    interactive: true,
    certified: true
  },
  {
    id: 'nr33-002',
    nr: 'NR-33',
    title: 'Trabalho em Espaços Confinados - Avançado',
    description: 'Procedimentos para entrada em espaços confinados, monitoramento atmosférico e sistema de resgate.',
    duration: 42,
    difficulty: 'advanced',
    industry: ['Petróleo & Gás', 'Química', 'Siderurgia'],
    complianceScore: 94.8,
    lastUpdated: new Date('2024-09-10'),
    views: 856,
    rating: 4.9,
    scenarios: 12,
    interactive: true,
    certified: true
  },
  {
    id: 'nr35-003',
    nr: 'NR-35',
    title: 'Trabalho em Altura - Capacitação Completa',
    description: 'Treinamento completo sobre EPIs, sistemas de proteção coletiva e procedimentos de emergência.',
    duration: 38,
    difficulty: 'intermediate',
    industry: ['Construção Civil', 'Telecomunicações', 'Energia'],
    complianceScore: 92.1,
    lastUpdated: new Date('2024-09-08'),
    views: 1534,
    rating: 4.7,
    scenarios: 10,
    interactive: true,
    certified: true
  }
]

let complianceChecks: ComplianceCheck[] = [
  {
    id: 'check-1',
    rule: 'Atualização de Conteúdo',
    status: 'compliant',
    description: 'Todos os templates estão atualizados conforme legislação vigente',
    recommendation: 'Manter revisão mensal'
  },
  {
    id: 'check-2',
    rule: 'Carga Horária Mínima',
    status: 'warning',
    description: '2 templates com carga horária abaixo do recomendado',
    recommendation: 'Adicionar módulos complementares'
  },
  {
    id: 'check-3',
    rule: 'Interatividade Obrigatória',
    status: 'non-compliant',
    description: '1 template sem elementos interativos necessários',
    recommendation: 'Implementar exercícios práticos'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nr = searchParams.get('nr')
    const industry = searchParams.get('industry')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'rating'
    const action = searchParams.get('action')

    // Handle different actions
    if (action === 'compliance') {
      return NextResponse.json({
        success: true,
        data: {
          checks: complianceChecks,
          overall: {
            score: 95.2,
            compliant: complianceChecks.filter(c => c.status === 'compliant').length,
            warnings: complianceChecks.filter(c => c.status === 'warning').length,
            nonCompliant: complianceChecks.filter(c => c.status === 'non-compliant').length
          }
        }
      })
    }

    if (action === 'industries') {
      const industries = [
        { id: 'construction', name: 'Construção Civil', templates: 12, compliance: 94.2, popularNRs: ['NR-35', 'NR-18', 'NR-06'] },
        { id: 'industry', name: 'Indústria', templates: 15, compliance: 96.5, popularNRs: ['NR-12', 'NR-10', 'NR-06'] },
        { id: 'oil-gas', name: 'Petróleo & Gás', templates: 8, compliance: 98.1, popularNRs: ['NR-33', 'NR-20', 'NR-35'] },
        { id: 'healthcare', name: 'Saúde', templates: 6, compliance: 92.7, popularNRs: ['NR-06', 'NR-09', 'NR-17'] }
      ]
      return NextResponse.json({
        success: true,
        data: industries
      })
    }

    let filteredTemplates = [...templates]

    // Apply filters
    if (nr && nr !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.nr === nr)
    }

    if (industry && industry !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.industry.some(ind => 
          ind.toLowerCase().includes(industry.toLowerCase())
        )
      )
    }

    if (difficulty && difficulty !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.difficulty === difficulty)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTemplates = filteredTemplates.filter(template =>
        template.title.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.industry.some(ind => ind.toLowerCase().includes(searchLower))
      )
    }

    // Apply sorting
    filteredTemplates.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'views':
          return b.views - a.views
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case 'compliance':
          return b.complianceScore - a.complianceScore
        case 'duration':
          return b.duration - a.duration
        default:
          return 0
      }
    })

    // Update views for each template (simulate activity)
    filteredTemplates = filteredTemplates.map(template => ({
      ...template,
      views: template.views + Math.floor(Math.random() * 3)
    }))

    return NextResponse.json({
      success: true,
      data: filteredTemplates,
      total: filteredTemplates.length,
      filters: { nr, industry, difficulty, search, sortBy }
    })
  } catch (error) {
    console.error('NR Templates GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar templates NR' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...templateData } = body

    if (action === 'generate') {
      // AI Template Generation
      const { nr, industry, requirements, duration, difficulty, scenarios } = templateData

      const newTemplate: NRTemplate = {
        id: `${nr.toLowerCase()}-${Date.now()}`,
        nr: nr as any,
        title: `Treinamento ${nr} - ${industry} (IA Generated)`,
        description: requirements || `Template personalizado para ${industry} com foco em ${nr}`,
        duration: parseInt(duration) || Math.floor(Math.random() * 30) + 20,
        difficulty: difficulty || 'intermediate',
        industry: [industry],
        complianceScore: Math.floor(Math.random() * 10) + 90,
        lastUpdated: new Date(),
        views: 0,
        rating: 5.0,
        scenarios: parseInt(scenarios) || Math.floor(Math.random() * 8) + 4,
        interactive: true,
        certified: true
      }

      templates.unshift(newTemplate)

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000))

      return NextResponse.json({
        success: true,
        data: newTemplate,
        message: 'Template gerado com IA com sucesso'
      })
    }

    if (action === 'duplicate') {
      const { templateId } = templateData
      const originalTemplate = templates.find(t => t.id === templateId)
      
      if (!originalTemplate) {
        return NextResponse.json(
          { success: false, error: 'Template não encontrado' },
          { status: 404 }
        )
      }

      const duplicatedTemplate: NRTemplate = {
        ...originalTemplate,
        id: `${originalTemplate.id}-copy-${Date.now()}`,
        title: `${originalTemplate.title} (Cópia)`,
        views: 0,
        lastUpdated: new Date()
      }

      templates.unshift(duplicatedTemplate)

      return NextResponse.json({
        success: true,
        data: duplicatedTemplate,
        message: 'Template duplicado com sucesso'
      })
    }

    // Create new template
    const newTemplate: NRTemplate = {
      id: `template-${Date.now()}`,
      nr: templateData.nr || 'NR-06',
      title: templateData.title || 'Novo Template',
      description: templateData.description || 'Descrição do template',
      duration: templateData.duration || 30,
      difficulty: templateData.difficulty || 'basic',
      industry: templateData.industry || ['Geral'],
      complianceScore: Math.floor(Math.random() * 10) + 85,
      lastUpdated: new Date(),
      views: 0,
      rating: 5.0,
      scenarios: templateData.scenarios || 5,
      interactive: templateData.interactive || true,
      certified: false
    }

    templates.unshift(newTemplate)

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template criado com sucesso'
    })
  } catch (error) {
    console.error('NR Templates POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar template' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do template é obrigatório' },
        { status: 400 }
      )
    }

    const templateIndex = templates.findIndex(template => template.id === id)
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    if (action === 'view') {
      templates[templateIndex].views += 1
      return NextResponse.json({
        success: true,
        data: templates[templateIndex],
        message: 'Visualização registrada'
      })
    }

    if (action === 'rate') {
      const { rating } = updateData
      if (rating >= 1 && rating <= 5) {
        // Simple rating update (in real app, would calculate average)
        templates[templateIndex].rating = (templates[templateIndex].rating + rating) / 2
      }
      return NextResponse.json({
        success: true,
        data: templates[templateIndex],
        message: 'Avaliação registrada'
      })
    }

    // Update template
    templates[templateIndex] = {
      ...templates[templateIndex],
      ...updateData,
      lastUpdated: new Date()
    }

    return NextResponse.json({
      success: true,
      data: templates[templateIndex],
      message: 'Template atualizado com sucesso'
    })
  } catch (error) {
    console.error('NR Templates PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do template é obrigatório' },
        { status: 400 }
      )
    }

    const templateIndex = templates.findIndex(template => template.id === id)
    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    const deletedTemplate = templates.splice(templateIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedTemplate,
      message: 'Template removido com sucesso'
    })
  } catch (error) {
    console.error('NR Templates DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao remover template' },
      { status: 500 }
    )
  }
}
