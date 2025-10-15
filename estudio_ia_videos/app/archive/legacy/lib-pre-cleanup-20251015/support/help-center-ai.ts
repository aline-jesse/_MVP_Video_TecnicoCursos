
/**
 * Sprint 41: Help Center AI
 * Chatbot IA treinado na documentação interna
 */

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: 'getting-started' | 'features' | 'troubleshooting' | 'billing' | 'advanced';
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  relatedArticles?: HelpArticle[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'new' | 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  sla: {
    responseTime: number; // minutos
    resolutionTime: number; // minutos
    breached: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export class HelpCenterAI {
  private static knowledgeBase: HelpArticle[] = [
    {
      id: '1',
      title: 'Como criar meu primeiro vídeo',
      content: `
# Como criar meu primeiro vídeo

1. Faça login na plataforma
2. Clique em "Novo Vídeo"
3. Escolha um template ou comece do zero
4. Adicione texto, imagens e áudio
5. Clique em "Renderizar Vídeo"

Para mais detalhes, veja nossa documentação completa.
      `,
      category: 'getting-started',
      tags: ['tutorial', 'iniciante', 'vídeo'],
      views: 1245,
      helpful: 98,
      notHelpful: 2,
      lastUpdated: new Date('2025-09-01'),
    },
    {
      id: '2',
      title: 'Como usar Text-to-Speech',
      content: `
# Como usar Text-to-Speech

O Estúdio IA oferece múltiplos providers de TTS:

- **ElevenLabs**: Vozes hiper-realistas em português
- **Azure**: Vozes em 50+ idiomas
- **Google**: Alta qualidade e baixa latência

Para usar TTS:
1. Selecione uma cena
2. Clique em "Adicionar Narração"
3. Escolha a voz
4. Digite ou cole o texto
5. Clique em "Gerar Áudio"
      `,
      category: 'features',
      tags: ['tts', 'voz', 'narração'],
      views: 892,
      helpful: 76,
      notHelpful: 8,
      lastUpdated: new Date('2025-09-15'),
    },
    {
      id: '3',
      title: 'Vídeo não renderiza - Troubleshooting',
      content: `
# Vídeo não renderiza - Troubleshooting

Se seu vídeo não está renderizando:

1. **Verifique sua conexão**: Internet estável é essencial
2. **Tamanho das mídias**: Imagens/vídeos devem ser < 50MB cada
3. **Formato suportado**: MP4, PNG, JPG, GIF
4. **Duração**: Máximo 10 minutos no plano gratuito
5. **Tente novamente**: Clique em "Renderizar" novamente

Se o problema persistir, entre em contato com o suporte.
      `,
      category: 'troubleshooting',
      tags: ['erro', 'renderização', 'bug'],
      views: 543,
      helpful: 45,
      notHelpful: 12,
      lastUpdated: new Date('2025-09-20'),
    },
    {
      id: '4',
      title: 'Planos e Preços',
      content: `
# Planos e Preços

## Gratuito
- 3 vídeos/mês
- 5 minutos de TTS
- 1GB de storage
- Marca d'água

## Pro ($29/mês)
- Vídeos ilimitados
- 60 minutos de TTS
- 10GB de storage
- Sem marca d'água

## Enterprise (sob consulta)
- Tudo do Pro
- TTS ilimitado
- Storage ilimitado
- Suporte prioritário
- SLA garantido
      `,
      category: 'billing',
      tags: ['preços', 'planos', 'upgrade'],
      views: 1789,
      helpful: 134,
      notHelpful: 5,
      lastUpdated: new Date('2025-09-25'),
    },
  ];

  /**
   * Busca artigos relevantes baseado na query
   */
  static searchArticles(query: string, limit: number = 5): HelpArticle[] {
    const lowerQuery = query.toLowerCase();

    return this.knowledgeBase
      .filter((article) => {
        const titleMatch = article.title.toLowerCase().includes(lowerQuery);
        const contentMatch = article.content.toLowerCase().includes(lowerQuery);
        const tagMatch = article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));

        return titleMatch || contentMatch || tagMatch;
      })
      .sort((a, b) => {
        // Priorizar por relevância e views
        const aScore = a.helpful / (a.helpful + a.notHelpful + 1) * a.views;
        const bScore = b.helpful / (b.helpful + b.notHelpful + 1) * b.views;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  /**
   * Gera resposta do chatbot IA
   */
  static async generateChatResponse(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatMessage> {
    // Buscar artigos relevantes
    const relatedArticles = this.searchArticles(userMessage, 3);

    // Construir contexto para o LLM
    const context = relatedArticles
      .map((article) => `# ${article.title}\n${article.content}`)
      .join('\n\n');

    // Simular resposta do LLM (em produção, usar API real)
    const response = this.simulateLLMResponse(userMessage, context);

    return {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      relatedArticles,
    };
  }

  /**
   * Simula resposta do LLM (placeholder para integração real)
   */
  private static simulateLLMResponse(userMessage: string, context: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('criar') && lowerMessage.includes('vídeo')) {
      return `Para criar seu primeiro vídeo, siga estes passos:

1. Faça login na plataforma
2. Clique em "Novo Vídeo" no dashboard
3. Escolha um template de Normas Regulamentadoras ou comece do zero
4. Use o editor para adicionar texto, imagens e narração
5. Clique em "Renderizar Vídeo"

Precisa de ajuda com alguma etapa específica?`;
    }

    if (lowerMessage.includes('tts') || lowerMessage.includes('voz') || lowerMessage.includes('narração')) {
      return `O Estúdio IA oferece 3 providers de Text-to-Speech:

- **ElevenLabs**: Vozes hiper-realistas em português brasileiro
- **Azure**: Mais de 50 idiomas disponíveis
- **Google**: Alta qualidade com baixa latência

Para adicionar narração:
1. Selecione uma cena no editor
2. Clique em "Adicionar Narração"
3. Escolha o provider e a voz
4. Digite o texto
5. Clique em "Gerar Áudio"

Quer saber mais sobre algum provider específico?`;
    }

    if (lowerMessage.includes('preço') || lowerMessage.includes('plano') || lowerMessage.includes('upgrade')) {
      return `Oferecemos 3 planos:

**Gratuito**: 3 vídeos/mês, 5min TTS, 1GB storage
**Pro ($29/mês)**: Vídeos ilimitados, 60min TTS, 10GB storage
**Enterprise**: Recursos ilimitados + suporte prioritário

Para fazer upgrade, acesse "Configurações" > "Plano e Faturamento".

Posso ajudar com mais alguma coisa sobre os planos?`;
    }

    if (lowerMessage.includes('erro') || lowerMessage.includes('bug') || lowerMessage.includes('problema')) {
      return `Vejo que você está enfrentando um problema. Para ajudar melhor:

1. **Descreva o erro**: O que aconteceu exatamente?
2. **Quando ocorreu**: Durante qual ação?
3. **Mensagem de erro**: Alguma mensagem específica apareceu?

Enquanto isso, tente:
- Atualizar a página (F5)
- Limpar cache do navegador
- Tentar em modo anônimo

Se o problema persistir, posso criar um ticket de suporte para você.`;
    }

    return `Entendi sua dúvida. Encontrei alguns artigos que podem ajudar:

${context ? context.substring(0, 500) + '...' : 'Documentação relevante'}

Posso esclarecer algo mais específico sobre sua dúvida?`;
  }

  /**
   * Cria ticket de suporte
   */
  static createSupportTicket(
    userId: string,
    subject: string,
    description: string,
    userPlan: 'free' | 'pro' | 'enterprise' = 'free'
  ): SupportTicket {
    // SLA baseado no plano
    const sla = {
      free: { responseTime: 24 * 60, resolutionTime: 72 * 60 }, // 24h/72h
      pro: { responseTime: 4 * 60, resolutionTime: 24 * 60 }, // 4h/24h
      enterprise: { responseTime: 60, resolutionTime: 4 * 60 }, // 1h/4h
    };

    const priority = this.calculatePriority(description, userPlan);

    const ticket: SupportTicket = {
      id: `TICK-${Date.now()}`,
      userId,
      subject,
      description,
      status: 'new',
      priority,
      sla: {
        ...sla[userPlan],
        breached: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    console.log('[HelpCenterAI] Ticket created:', ticket);

    return ticket;
  }

  /**
   * Calcula prioridade do ticket
   */
  private static calculatePriority(
    description: string,
    userPlan: 'free' | 'pro' | 'enterprise'
  ): SupportTicket['priority'] {
    const lowerDesc = description.toLowerCase();

    // Keywords críticas
    const criticalKeywords = ['down', 'não funciona', 'perdeu dados', 'crítico', 'urgente'];
    if (criticalKeywords.some((kw) => lowerDesc.includes(kw))) {
      return userPlan === 'enterprise' ? 'critical' : 'high';
    }

    // Enterprise sempre tem prioridade alta
    if (userPlan === 'enterprise') {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Monitora SLA dos tickets
   */
  static checkSLACompliance(ticket: SupportTicket): {
    compliant: boolean;
    timeRemaining: number;
    breached: boolean;
  } {
    const now = Date.now();
    const createdTime = ticket.createdAt.getTime();
    const elapsedMinutes = (now - createdTime) / (1000 * 60);

    const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';

    const targetTime = isResolved
      ? ticket.sla.resolutionTime
      : ticket.sla.responseTime;

    const timeRemaining = targetTime - elapsedMinutes;
    const breached = timeRemaining < 0;

    return {
      compliant: !breached,
      timeRemaining: Math.max(0, timeRemaining),
      breached,
    };
  }

  /**
   * Gera relatório de performance do suporte
   */
  static generateSupportReport(tickets: SupportTicket[]): {
    totalTickets: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    slaCompliance: number;
    satisfactionScore: number;
  } {
    const totalTickets = tickets.length;

    const responseTimes = tickets
      .filter((t) => t.status !== 'new')
      .map((t) => {
        const firstResponse = t.messages.find((m) => m.role === 'assistant');
        if (!firstResponse) return 0;
        return (firstResponse.timestamp.getTime() - t.createdAt.getTime()) / (1000 * 60);
      });

    const resolutionTimes = tickets
      .filter((t) => t.status === 'resolved' || t.status === 'closed')
      .map((t) => (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60));

    const compliantTickets = tickets.filter((t) => {
      const compliance = this.checkSLACompliance(t);
      return compliance.compliant;
    }).length;

    return {
      totalTickets,
      averageResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0,
      averageResolutionTime:
        resolutionTimes.length > 0
          ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
          : 0,
      slaCompliance: totalTickets > 0 ? (compliantTickets / totalTickets) * 100 : 100,
      satisfactionScore: 4.5, // Calcular baseado em feedback real
    };
  }
}
