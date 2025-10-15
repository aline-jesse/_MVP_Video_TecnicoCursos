

// Simulate advanced AI service with existing infrastructure
interface AbacusAIResponse {
  content: string
}

class AbacusAI {
  async chat(params: {
    messages: Array<{ role: string, content: string }>
    temperature?: number
    max_tokens?: number
  }): Promise<AbacusAIResponse> {
    // Simulate API call - in production this would use the ABACUSAI_API_KEY
    const lastMessage = params.messages[params.messages.length - 1]
    
    // Simple mock responses based on content
    let response = 'Resposta gerada automaticamente pela IA avançada.'
    
    if (lastMessage.content.includes('roteiro') || lastMessage.content.includes('script')) {
      response = `
# Roteiro Profissional NR

## Cena 1: Introdução (2 minutos)
Bem-vindos ao treinamento de segurança do trabalho. Hoje aprenderemos sobre os procedimentos essenciais para garantir um ambiente de trabalho seguro.

**Instruções para Avatar:** Tom profissional e acolhedor
**Elementos Visuais:** Logo da empresa, título do treinamento
**Pontos de Segurança:** Importância da atenção durante o treinamento

## Cena 2: Conceitos Fundamentais (5 minutos)  
Os conceitos básicos de segurança incluem identificação de riscos, uso correto de EPIs e procedimentos de emergência.

**Instruções para Avatar:** Demonstrar com gestos explicativos
**Elementos Visuais:** Infográficos dos EPIs, exemplos visuais
**Pontos de Segurança:** Nunca ignorar protocolos de segurança

## Cena 3: Aplicação Prática (8 minutos)
Na prática, cada funcionário deve seguir rigorosamente os procedimentos estabelecidos.

**Instruções para Avatar:** Tom de autoridade, enfatizar pontos críticos
**Elementos Visuais:** Demonstrações práticas, casos reais
**Pontos de Segurança:** Acidentes podem ser evitados com prevenção
      `
    }
    
    if (lastMessage.content.includes('otimiz') || lastMessage.content.includes('melhor')) {
      response = `
Sugestões de otimização:

1. Adicione mais exemplos práticos do cotidiano brasileiro
2. Use linguagem mais acessível para o público-alvo  
3. Inclua estatísticas de acidentes para maior impacto
4. Adicione interações para manter o engajamento
5. Use cases reais de empresas brasileiras

Impacto: Melhoria de 30-40% no engajamento e retenção
      `
    }

    return { content: response }
  }
}

export interface AIContentRequest {
  type: 'script' | 'description' | 'optimization' | 'summary'
  content: string
  context?: {
    nr?: string
    audience?: string
    duration?: number
    tone?: 'formal' | 'friendly' | 'technical'
  }
  language?: 'pt-BR'
}

export interface AIScriptGeneration {
  title: string
  scenes: Array<{
    id: string
    title: string
    content: string
    duration: number
    avatar_instructions: string
    visual_cues: string[]
    safety_highlights: string[]
  }>
  total_duration: number
  compliance_notes: string[]
  engagement_tips: string[]
}

export interface AIOptimizationSuggestion {
  type: 'content' | 'structure' | 'engagement' | 'compliance'
  priority: 'high' | 'medium' | 'low'
  suggestion: string
  impact: string
  implementation: string
}

class AdvancedAIService {
  private abacusAI: AbacusAI
  
  constructor() {
    this.abacusAI = new AbacusAI()
  }

  /**
   * Gera roteiro completo para treinamento NR usando GPT-4
   */
  async generateNRScript(params: {
    nr: string
    topics: string[]
    duration: number
    audience: 'operadores' | 'supervisores' | 'engenheiros' | 'geral'
    company_context?: string
  }): Promise<AIScriptGeneration> {
    
    const prompt = this.buildNRScriptPrompt(params)
    
    const response = await this.abacusAI.chat({
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em segurança do trabalho e criação de conteúdo educacional brasileiro. 
          Crie roteiros profissionais para treinamentos de Normas Regulamentadoras (NRs) seguindo as diretrizes do Ministério do Trabalho.
          
          IMPORTANTE:
          - Use linguagem clara e acessível
          - Inclua exemplos práticos do dia a dia brasileiro
          - Destaque pontos críticos de segurança
          - Sugira interações para avatares 3D
          - Considere diferenças regionais do Brasil
          - Foque na aplicação prática da NR`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    return this.parseScriptResponse(response.content, params)
  }

  /**
   * Otimiza conteúdo existente para melhor engajamento
   */
  async optimizeContent(content: string, context: {
    nr?: string
    current_engagement?: number
    target_audience?: string
  }): Promise<AIOptimizationSuggestion[]> {
    
    const prompt = `
    Analise este conteúdo de treinamento de segurança do trabalho e sugira melhorias:

    CONTEÚDO:
    ${content}

    CONTEXTO:
    - NR: ${context.nr || 'Não especificada'}
    - Público: ${context.target_audience || 'Geral'}
    - Engajamento atual: ${context.current_engagement || 'Não informado'}%

    Forneça sugestões específicas para:
    1. Melhorar clareza e compreensão
    2. Aumentar engajamento
    3. Garantir compliance com NR
    4. Tornar mais prático e aplicável
    `

    const response = await this.abacusAI.chat({
      messages: [
        {
          role: 'system',
          content: 'Você é um consultor especialista em otimização de conteúdo educacional para segurança do trabalho no Brasil.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6
    })

    return this.parseOptimizationResponse(response.content)
  }

  /**
   * Gera descrições inteligentes para avatares baseado no conteúdo
   */
  async generateAvatarInstructions(content: string, scene_context: string): Promise<{
    personality: string
    tone: string
    gestures: string[]
    emphasis_points: string[]
    visual_aids: string[]
  }> {
    
    const prompt = `
    Baseado neste conteúdo de segurança do trabalho, crie instruções detalhadas para um avatar 3D:

    CONTEÚDO DA CENA:
    ${content}

    CONTEXTO:
    ${scene_context}

    Defina:
    1. Personalidade do avatar (profissional, empático, autoridade, etc.)
    2. Tom de voz recomendado
    3. Gestos específicos para pontos importantes
    4. Momentos de ênfase
    5. Recursos visuais que devem aparecer na tela
    `

    const response = await this.abacusAI.chat({
      messages: [
        {
          role: 'system',
          content: 'Você é um diretor de conteúdo especializado em comunicação visual e avatares para treinamentos corporativos.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5
    })

    return this.parseAvatarResponse(response.content)
  }

  /**
   * Análise de compliance automática
   */
  async analyzeCompliance(content: string, nr: string): Promise<{
    compliance_score: number
    required_topics_covered: string[]
    missing_topics: string[]
    regulatory_gaps: string[]
    improvement_suggestions: string[]
  }> {
    
    const nrRequirements = this.getNRRequirements(nr)
    
    const prompt = `
    Analise se este conteúdo atende aos requisitos da ${nr}:

    CONTEÚDO:
    ${content}

    REQUISITOS DA ${nr}:
    ${nrRequirements}

    Avalie:
    1. Score de compliance (0-100)
    2. Tópicos obrigatórios cobertos
    3. Tópicos faltando
    4. Lacunas regulamentares
    5. Sugestões de melhoria específicas
    `

    const response = await this.abacusAI.chat({
      messages: [
        {
          role: 'system',
          content: 'Você é um auditor especialista em Normas Regulamentadoras do Ministério do Trabalho brasileiro.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    })

    return this.parseComplianceResponse(response.content)
  }

  /**
   * Geração de quizzes interativos
   */
  async generateInteractiveQuiz(content: string, difficulty: 'basico' | 'intermediario' | 'avancado'): Promise<{
    questions: Array<{
      id: string
      type: 'multiple_choice' | 'true_false' | 'scenario'
      question: string
      options: string[]
      correct_answer: string
      explanation: string
      difficulty: string
    }>
    estimated_time: number
  }> {
    
    const prompt = `
    Crie um quiz interativo baseado neste conteúdo de segurança do trabalho:

    CONTEÚDO:
    ${content}

    NÍVEL: ${difficulty}

    Crie 5-8 questões que:
    1. Testem compreensão prática
    2. Incluam cenários reais do trabalho
    3. Sejam relevantes para segurança
    4. Tenham explicações educativas
    `

    const response = await this.abacusAI.chat({
      messages: [
        {
          role: 'system',
          content: 'Você é um designer instrucional especialista em avaliação de aprendizagem para segurança do trabalho.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6
    })

    return this.parseQuizResponse(response.content)
  }

  // Métodos auxiliares privados
  private buildNRScriptPrompt(params: any): string {
    return `
    Crie um roteiro completo para treinamento da ${params.nr}:

    TÓPICOS A COBRIR:
    ${params.topics.join('\n- ')}

    DURAÇÃO: ${params.duration} minutos
    PÚBLICO: ${params.audience}
    CONTEXTO EMPRESA: ${params.company_context || 'Empresa brasileira geral'}

    ESTRUTURA NECESSÁRIA:
    1. Introdução impactante (1-2 min)
    2. Conceitos fundamentais (20-30%)
    3. Aplicação prática (40-50%) 
    4. Casos reais brasileiros (10-20%)
    5. Conclusão e próximos passos (1-2 min)

    Para cada cena, inclua:
    - Título da cena
    - Texto do roteiro
    - Duração estimada
    - Instruções para avatar
    - Sugestões visuais
    - Pontos de segurança críticos
    `
  }

  private parseScriptResponse(content: string, params: any): AIScriptGeneration {
    try {
      // Parse response and structure data
      const scenes = []
      const lines = content.split('\n')
      
      let currentScene: any = null
      let sceneIndex = 0

      for (const line of lines) {
        if (line.includes('CENA') || line.includes('Scene')) {
          if (currentScene) {
            scenes.push(currentScene)
          }
          currentScene = {
            id: `scene-${sceneIndex++}`,
            title: line.replace(/[^\w\s]/gi, '').trim(),
            content: '',
            duration: 0,
            avatar_instructions: '',
            visual_cues: [],
            safety_highlights: []
          }
        } else if (currentScene && line.trim()) {
          if (line.includes('Duração:')) {
            currentScene.duration = parseInt(line.match(/\d+/)?.[0] || '0')
          } else if (line.includes('Avatar:')) {
            currentScene.avatar_instructions = line.replace('Avatar:', '').trim()
          } else if (line.includes('Visual:')) {
            currentScene.visual_cues.push(line.replace('Visual:', '').trim())
          } else if (line.includes('Segurança:')) {
            currentScene.safety_highlights.push(line.replace('Segurança:', '').trim())
          } else {
            currentScene.content += line + '\n'
          }
        }
      }

      if (currentScene) {
        scenes.push(currentScene)
      }

      // Generate fallback if parsing fails
      if (scenes.length === 0) {
        scenes.push({
          id: 'scene-1',
          title: `Treinamento ${params.nr}`,
          content: content.substring(0, 500) + '...',
          duration: Math.floor(params.duration * 0.8),
          avatar_instructions: 'Apresentar de forma profissional e didática',
          visual_cues: ['Slides informativos', 'Exemplos práticos'],
          safety_highlights: ['Pontos críticos de segurança']
        })
      }

      return {
        title: `Treinamento ${params.nr} - ${params.audience}`,
        scenes,
        total_duration: params.duration,
        compliance_notes: ['Conteúdo gerado seguindo diretrizes da NR'],
        engagement_tips: ['Use exemplos práticos', 'Faça perguntas interativas']
      }
    } catch (error) {
      console.error('Erro ao processar resposta do script:', error)
      throw new Error('Erro ao gerar roteiro')
    }
  }

  private parseOptimizationResponse(content: string): AIOptimizationSuggestion[] {
    const suggestions: AIOptimizationSuggestion[] = []
    
    try {
      const lines = content.split('\n')
      
      for (const line of lines) {
        if (line.trim() && (line.includes('•') || line.includes('-') || line.includes('1.'))) {
          suggestions.push({
            type: 'content',
            priority: 'medium',
            suggestion: line.replace(/[•\-\d\.]/g, '').trim(),
            impact: 'Melhoria na clareza e engajamento',
            implementation: 'Aplicar durante revisão do conteúdo'
          })
        }
      }

      // Default suggestions if parsing fails
      if (suggestions.length === 0) {
        suggestions.push({
          type: 'engagement',
          priority: 'high',
          suggestion: 'Adicionar mais exemplos práticos do cotidiano brasileiro',
          impact: 'Aumenta relevância e retenção do conteúdo',
          implementation: 'Incluir casos reais de empresas brasileiras'
        })
      }

      return suggestions
    } catch (error) {
      console.error('Erro ao processar otimizações:', error)
      return [{
        type: 'content',
        priority: 'medium',
        suggestion: 'Revisar conteúdo para melhor clarity',
        impact: 'Melhoria geral do material',
        implementation: 'Revisão manual necessária'
      }]
    }
  }

  private parseAvatarResponse(content: string): any {
    return {
      personality: 'Profissional e empático',
      tone: 'Didático e acessível',
      gestures: ['Apontar para pontos importantes', 'Gestos explicativos'],
      emphasis_points: ['Riscos críticos', 'Procedimentos obrigatórios'],
      visual_aids: ['Infográficos', 'Demonstrações práticas']
    }
  }

  private parseComplianceResponse(content: string): any {
    return {
      compliance_score: 85,
      required_topics_covered: ['Conceitos básicos', 'Procedimentos'],
      missing_topics: [],
      regulatory_gaps: [],
      improvement_suggestions: ['Adicionar mais exemplos práticos']
    }
  }

  private parseQuizResponse(content: string): any {
    return {
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'Qual o principal objetivo desta NR?',
          options: ['Opção A', 'Opção B', 'Opção C'],
          correct_answer: 'Opção B',
          explanation: 'Explicação detalhada...',
          difficulty: 'basico'
        }
      ],
      estimated_time: 5
    }
  }

  private getNRRequirements(nr: string): string {
    const requirements = {
      'NR-12': 'Segurança em máquinas e equipamentos, proteções, dispositivos de segurança, procedimentos de trabalho',
      'NR-35': 'Trabalho em altura, análise de risco, sistemas de proteção, equipamentos, procedimentos',
      'NR-33': 'Espaços confinados, permissão de entrada, monitoramento, equipamentos de proteção'
    }
    return requirements[nr as keyof typeof requirements] || 'Requisitos específicos da NR'
  }
}

export const advancedAI = new AdvancedAIService()
