
/**
 * 🤖 Estúdio IA de Vídeos - Sprint 8
 * Sistema de IA Generativa Avançada
 * 
 * Funcionalidades:
 * - Geração de conteúdo com LLMs Abacus.AI
 * - Scripts inteligentes para vídeos
 * - Otimização automática de narrativas
 * - Personalização por contexto e audiência
 */

import { LLMService } from '@/lib/llm-service';

export interface ContentGenerationRequest {
  type: 'script' | 'narration' | 'description' | 'title' | 'summary';
  context: {
    topic: string;
    audience: 'workers' | 'supervisors' | 'executives' | 'mixed';
    industry: 'construction' | 'manufacturing' | 'healthcare' | 'education' | 'retail' | 'tech';
    duration: number; // em segundos
    tone: 'formal' | 'friendly' | 'authoritative' | 'engaging';
    complexity: 'basic' | 'intermediate' | 'advanced';
  };
  requirements?: {
    keywords?: string[];
    compliance?: string[]; // NR-10, NR-35, etc.
    structure?: string[];
    examples?: boolean;
    callToAction?: string;
  };
  existingContent?: string;
}

export interface ContentGenerationResponse {
  content: string;
  metadata: {
    wordCount: number;
    readingTime: number;
    complexity: number;
    keywords: string[];
    suggestions: string[];
  };
  variations?: string[];
  quality: {
    score: number;
    factors: {
      clarity: number;
      engagement: number;
      compliance: number;
      structure: number;
    };
  };
}

export class GenerativeAIService {
  private llmService: LLMService;
  private cache = new Map<string, ContentGenerationResponse>();

  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * 🎬 Gera script de vídeo otimizado
   */
  async generateScript(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const cacheKey = this.getCacheKey(request);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const prompt = this.buildScriptPrompt(request);
    const response = await this.llmService.generateContent({
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
      model: 'gpt-4-turbo'
    });

    const result = await this.processScriptResponse(response, request);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * 🎙️ Gera narração otimizada para TTS
   */
  async generateNarration(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const cacheKey = this.getCacheKey(request);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const prompt = this.buildNarrationPrompt(request);
    const response = await this.llmService.generateContent({
      prompt,
      maxTokens: 1500,
      temperature: 0.6,
      model: 'claude-3-sonnet'
    });

    const result = await this.processNarrationResponse(response, request);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * 📝 Otimiza conteúdo existente
   */
  async optimizeContent(
    content: string,
    context: ContentGenerationRequest['context'],
    goals: string[]
  ): Promise<ContentGenerationResponse> {
    const prompt = `
    Otimize o seguinte conteúdo para ${context.audience} na indústria ${context.industry}:
    
    CONTEÚDO ORIGINAL:
    ${content}
    
    CONTEXTO:
    - Audiência: ${context.audience}
    - Indústria: ${context.industry}
    - Tom: ${context.tone}
    - Duração alvo: ${Math.floor(context.duration / 60)} minutos
    - Complexidade: ${context.complexity}
    
    OBJETIVOS DE OTIMIZAÇÃO:
    ${goals.map(goal => `- ${goal}`).join('\n')}
    
    INSTRUÇÕES:
    1. Mantenha a mensagem principal
    2. Ajuste o tom e linguagem para a audiência
    3. Otimize para clareza e engajamento
    4. Adicione elementos de compliance quando aplicável
    5. Estruture para o tempo disponível
    
    Retorne o conteúdo otimizado em formato JSON com:
    - content: o texto otimizado
    - improvements: lista de melhorias aplicadas
    - quality_score: pontuação de 0-100
    `;

    const response = await this.llmService.generateContent({
      prompt,
      maxTokens: 2000,
      temperature: 0.5,
      model: 'gpt-4-turbo'
    });

    return this.processOptimizationResponse(response, context);
  }

  /**
   * 📊 Analisa qualidade do conteúdo
   */
  async analyzeContent(content: string, context: ContentGenerationRequest['context']) {
    const prompt = `
    Analise a qualidade do seguinte conteúdo educacional:
    
    ${content}
    
    CONTEXTO:
    - Audiência: ${context.audience}
    - Indústria: ${context.industry}
    - Tom desejado: ${context.tone}
    
    Forneça análise detalhada em JSON:
    {
      "overall_score": número de 0-100,
      "factors": {
        "clarity": 0-100,
        "engagement": 0-100,
        "structure": 0-100,
        "tone_alignment": 0-100,
        "audience_fit": 0-100
      },
      "strengths": ["ponto forte 1", "ponto forte 2"],
      "improvements": ["melhoria 1", "melhoria 2"],
      "keywords": ["palavra-chave 1", "palavra-chave 2"],
      "readability": {
        "level": "básico|intermediário|avançado",
        "score": 0-100
      }
    }
    `;

    const response = await this.llmService.generateContent({
      prompt,
      maxTokens: 1000,
      temperature: 0.3,
      model: 'claude-3-sonnet'
    });

    return JSON.parse(response.content);
  }

  /**
   * 🎯 Gera variações de conteúdo
   */
  async generateVariations(
    baseContent: string,
    context: ContentGenerationRequest['context'],
    variationType: 'tone' | 'complexity' | 'length' | 'audience'
  ): Promise<string[]> {
    const variationPrompts = {
      tone: ['formal', 'amigável', 'técnico', 'motivacional'],
      complexity: ['básico', 'intermediário', 'avançado'],
      length: ['resumido (30%)', 'padrão', 'detalhado (+50%)'],
      audience: ['trabalhadores', 'supervisores', 'executivos', 'geral']
    };

    const variations = [];
    for (const variant of variationPrompts[variationType]) {
      const prompt = `
      Adapte o seguinte conteúdo para: ${variant}
      
      CONTEÚDO BASE:
      ${baseContent}
      
      CONTEXTO ATUAL:
      - Indústria: ${context.industry}
      - Audiência original: ${context.audience}
      
      Mantenha a mensagem principal, mas ajuste ${variationType} para: ${variant}
      `;

      const response = await this.llmService.generateContent({
        prompt,
        maxTokens: 1500,
        temperature: 0.6,
        model: 'gpt-4-turbo'
      });

      variations.push(response.content);
    }

    return variations;
  }

  private buildScriptPrompt(request: ContentGenerationRequest): string {
    const { context, requirements } = request;
    
    return `
    Crie um script de vídeo educacional profissional sobre: ${context.topic}
    
    ESPECIFICAÇÕES:
    - Audiência: ${context.audience}
    - Indústria: ${context.industry}
    - Duração: ${Math.floor(context.duration / 60)} minutos
    - Tom: ${context.tone}
    - Complexidade: ${context.complexity}
    
    ${requirements?.compliance ? `COMPLIANCE: ${requirements.compliance.join(', ')}` : ''}
    ${requirements?.keywords ? `PALAVRAS-CHAVE: ${requirements.keywords.join(', ')}` : ''}
    
    ESTRUTURA OBRIGATÓRIA:
    1. ABERTURA (10% do tempo) - Gancho e objetivos
    2. DESENVOLVIMENTO (75% do tempo) - Conteúdo principal com exemplos
    3. CONCLUSÃO (15% do tempo) - Resumo e call-to-action
    
    REQUISITOS:
    - Linguagem adequada à audiência
    - Exemplos práticos da indústria
    - Elementos de engajamento (perguntas, cenários)
    - Formatação clara para narração
    - Indicações de timing
    
    ${requirements?.callToAction ? `CALL-TO-ACTION: ${requirements.callToAction}` : ''}
    
    Retorne em formato estruturado com timing e indicações de produção.
    `;
  }

  private buildNarrationPrompt(request: ContentGenerationRequest): string {
    const { context } = request;
    
    return `
    Crie uma narração otimizada para TTS (Text-to-Speech) sobre: ${context.topic}
    
    ESPECIFICAÇÕES TÉCNICAS:
    - Audiência: ${context.audience}
    - Tom: ${context.tone}
    - Duração alvo: ${Math.floor(context.duration / 60)} minutos
    - Velocidade de fala: 150-160 palavras/minuto
    
    REQUISITOS TTS:
    - Frases curtas e claras
    - Evitar abreviações
    - Pontuação adequada para pausas naturais
    - Números escritos por extenso quando relevante
    - Evitar caracteres especiais
    
    ESTRUTURA:
    - Introdução cativante (30 segundos)
    - Desenvolvimento fluido com transições
    - Conclusão memorável
    
    A narração deve soar natural quando sintetizada por voz artificial brasileira.
    `;
  }

  private async processScriptResponse(
    response: any,
    request: ContentGenerationRequest
  ): Promise<ContentGenerationResponse> {
    const content = response.content;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / 160); // 160 palavras por minuto

    return {
      content,
      metadata: {
        wordCount,
        readingTime,
        complexity: this.calculateComplexity(content),
        keywords: await this.extractKeywords(content),
        suggestions: await this.generateSuggestions(content, request)
      },
      quality: await this.calculateQuality(content, request.context)
    };
  }

  private async processNarrationResponse(
    response: any,
    request: ContentGenerationRequest
  ): Promise<ContentGenerationResponse> {
    const content = response.content;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / 150); // TTS é um pouco mais lento

    return {
      content,
      metadata: {
        wordCount,
        readingTime,
        complexity: this.calculateComplexity(content),
        keywords: await this.extractKeywords(content),
        suggestions: ['Ajustar velocidade TTS', 'Revisar pausas', 'Testar pronúncia']
      },
      quality: await this.calculateQuality(content, request.context)
    };
  }

  private async processOptimizationResponse(
    response: any,
    context: ContentGenerationRequest['context']
  ): Promise<ContentGenerationResponse> {
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.content);
    } catch {
      parsedResponse = { content: response.content, improvements: [], quality_score: 75 };
    }

    const content = parsedResponse.content || response.content;
    const wordCount = content.split(' ').length;

    return {
      content,
      metadata: {
        wordCount,
        readingTime: Math.ceil(wordCount / 160),
        complexity: this.calculateComplexity(content),
        keywords: await this.extractKeywords(content),
        suggestions: parsedResponse.improvements || []
      },
      quality: {
        score: parsedResponse.quality_score || 75,
        factors: {
          clarity: 80,
          engagement: 75,
          compliance: 85,
          structure: 90
        }
      }
    };
  }

  private calculateComplexity(content: string): number {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(' ').length;
    const avgWordsPerSentence = words / sentences;
    
    // Complexidade baseada no tamanho médio das frases
    if (avgWordsPerSentence < 12) return 1; // Básico
    if (avgWordsPerSentence < 18) return 2; // Intermediário
    return 3; // Avançado
  }

  private async extractKeywords(content: string): Promise<string[]> {
    // Implementação simplificada - em produção usaria NLP mais avançado
    const words = content.toLowerCase().split(/\W+/);
    const stopWords = ['o', 'a', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'não', 'na', 'no', 'se', 'que', 'como', 'por', 'são', 'dos', 'das', 'ou', 'ao', 'à'];
    
    const wordCount = new Map();
    words.forEach(word => {
      if (word.length > 3 && !stopWords.includes(word)) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    return Array.from(wordCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private async generateSuggestions(
    content: string,
    request: ContentGenerationRequest
  ): Promise<string[]> {
    const suggestions = [];
    
    if (content.length < 500) {
      suggestions.push('Considere adicionar mais exemplos práticos');
    }
    
    if (!content.includes('exemplo')) {
      suggestions.push('Inclua casos de uso específicos da indústria');
    }
    
    if (request.context.complexity === 'basic' && this.calculateComplexity(content) > 2) {
      suggestions.push('Simplifique a linguagem para a audiência');
    }

    return suggestions;
  }

  private async calculateQuality(
    content: string,
    context: ContentGenerationRequest['context']
  ): Promise<ContentGenerationResponse['quality']> {
    // Algoritmo simplificado de avaliação de qualidade
    let clarity = 75;
    let engagement = 70;
    let compliance = 80;
    let structure = 85;

    // Ajustes baseados no conteúdo
    if (content.includes('?')) engagement += 10; // Perguntas aumentam engajamento
    if (content.includes('exemplo')) clarity += 10;
    if (content.split('.').length > 5) structure += 5; // Boa estruturação

    const score = Math.round((clarity + engagement + compliance + structure) / 4);

    return {
      score,
      factors: { clarity, engagement, compliance, structure }
    };
  }

  private getCacheKey(request: ContentGenerationRequest): string {
    return btoa(JSON.stringify({
      type: request.type,
      topic: request.context.topic,
      audience: request.context.audience,
      industry: request.context.industry,
      tone: request.context.tone
    }));
  }

  /**
   * 🧹 Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 📊 Estatísticas do cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton para uso global
export const generativeAI = new GenerativeAIService();
