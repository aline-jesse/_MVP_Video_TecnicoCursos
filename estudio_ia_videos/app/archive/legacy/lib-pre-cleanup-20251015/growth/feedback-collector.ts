
/**
 * Sprint 41: Feedback Collector
 * Sistema de coleta de NPS, CSAT e feedback qualitativo
 */

export interface NPSResponse {
  userId: string;
  score: number; // 0-10
  category: 'detractor' | 'passive' | 'promoter';
  comment?: string;
  timestamp: Date;
  context: 'post_render' | 'post_upgrade' | 'periodic' | 'manual';
}

export interface CSATResponse {
  userId: string;
  score: number; // 1-5
  feature: string;
  comment?: string;
  timestamp: Date;
}

export interface QualitativeFeedback {
  userId: string;
  type: 'bug' | 'feature_request' | 'improvement' | 'praise' | 'complaint';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'wont_fix';
  votes: number;
  timestamp: Date;
  tags: string[];
}

export interface FeedbackAnalysis {
  nps: {
    score: number;
    detractors: number;
    passives: number;
    promoters: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  csat: {
    averageScore: number;
    byFeature: Record<string, number>;
  };
  topIssues: QualitativeFeedback[];
  topRequests: QualitativeFeedback[];
}

export class FeedbackCollector {
  /**
   * Registra resposta NPS
   */
  static recordNPS(
    userId: string,
    score: number,
    comment?: string,
    context: NPSResponse['context'] = 'manual'
  ): NPSResponse {
    const category =
      score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor';

    const response: NPSResponse = {
      userId,
      score,
      category,
      comment,
      timestamp: new Date(),
      context,
    };

    // Salvar no banco
    // await prisma.npsResponse.create({ data: response });

    console.log('[FeedbackCollector] NPS recorded:', response);

    return response;
  }

  /**
   * Registra resposta CSAT
   */
  static recordCSAT(
    userId: string,
    score: number,
    feature: string,
    comment?: string
  ): CSATResponse {
    const response: CSATResponse = {
      userId,
      score,
      feature,
      comment,
      timestamp: new Date(),
    };

    // Salvar no banco
    // await prisma.csatResponse.create({ data: response });

    console.log('[FeedbackCollector] CSAT recorded:', response);

    return response;
  }

  /**
   * Registra feedback qualitativo
   */
  static recordFeedback(
    userId: string,
    type: QualitativeFeedback['type'],
    title: string,
    description: string,
    tags: string[] = []
  ): QualitativeFeedback {
    const feedback: QualitativeFeedback = {
      userId,
      type,
      title,
      description,
      priority: this.calculatePriority(type, description),
      status: 'new',
      votes: 0,
      timestamp: new Date(),
      tags,
    };

    // Salvar no banco
    // await prisma.feedback.create({ data: feedback });

    console.log('[FeedbackCollector] Feedback recorded:', feedback);

    return feedback;
  }

  /**
   * Calcula NPS score
   */
  static calculateNPS(responses: NPSResponse[]): number {
    if (responses.length === 0) return 0;

    const promoters = responses.filter((r) => r.category === 'promoter').length;
    const detractors = responses.filter((r) => r.category === 'detractor').length;

    const promoterPercentage = (promoters / responses.length) * 100;
    const detractorPercentage = (detractors / responses.length) * 100;

    return Math.round(promoterPercentage - detractorPercentage);
  }

  /**
   * Analisa feedback agregado
   */
  static analyzeFeedback(
    npsResponses: NPSResponse[],
    csatResponses: CSATResponse[],
    qualitativeFeedback: QualitativeFeedback[]
  ): FeedbackAnalysis {
    // Análise NPS
    const npsScore = this.calculateNPS(npsResponses);
    const promoters = npsResponses.filter((r) => r.category === 'promoter').length;
    const passives = npsResponses.filter((r) => r.category === 'passive').length;
    const detractors = npsResponses.filter((r) => r.category === 'detractor').length;

    // Análise CSAT
    const avgCSAT =
      csatResponses.length > 0
        ? csatResponses.reduce((sum, r) => sum + r.score, 0) / csatResponses.length
        : 0;

    const csatByFeature: Record<string, number> = {};
    csatResponses.forEach((response) => {
      if (!csatByFeature[response.feature]) {
        csatByFeature[response.feature] = 0;
      }
      csatByFeature[response.feature] += response.score;
    });

    // Top issues e requests
    const topIssues = qualitativeFeedback
      .filter((f) => f.type === 'bug' || f.type === 'complaint')
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);

    const topRequests = qualitativeFeedback
      .filter((f) => f.type === 'feature_request')
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);

    return {
      nps: {
        score: npsScore,
        detractors,
        passives,
        promoters,
        trend: 'stable', // Calcular baseado em histórico
      },
      csat: {
        averageScore: avgCSAT,
        byFeature: csatByFeature,
      },
      topIssues,
      topRequests,
    };
  }

  /**
   * Determina quando solicitar NPS
   */
  static shouldRequestNPS(
    user: {
      userId: string;
      signupDate: Date;
      lastNPSDate?: Date;
      videosRendered: number;
    }
  ): boolean {
    const daysSinceSignup = Math.floor(
      (Date.now() - user.signupDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Não solicitar nos primeiros 7 dias
    if (daysSinceSignup < 7) return false;

    // Se já respondeu, esperar 90 dias
    if (user.lastNPSDate) {
      const daysSinceLastNPS = Math.floor(
        (Date.now() - user.lastNPSDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastNPS < 90) return false;
    }

    // Solicitar após renderizar 3+ vídeos
    if (user.videosRendered >= 3) return true;

    // Solicitar após 30 dias de uso
    if (daysSinceSignup >= 30) return true;

    return false;
  }

  /**
   * Calcula prioridade do feedback
   */
  private static calculatePriority(
    type: QualitativeFeedback['type'],
    description: string
  ): QualitativeFeedback['priority'] {
    const lowerDesc = description.toLowerCase();

    // Keywords para prioridade alta
    const highPriorityKeywords = [
      'crash',
      'não funciona',
      'quebrado',
      'erro crítico',
      'perdi dados',
      'não consigo',
    ];

    // Keywords para prioridade crítica
    const criticalKeywords = [
      'perdeu tudo',
      'dados corrompidos',
      'segurança',
      'vazamento',
      'hack',
    ];

    if (type === 'bug') {
      if (criticalKeywords.some((kw) => lowerDesc.includes(kw))) {
        return 'critical';
      }
      if (highPriorityKeywords.some((kw) => lowerDesc.includes(kw))) {
        return 'high';
      }
      return 'medium';
    }

    if (type === 'complaint') {
      return 'high';
    }

    if (type === 'feature_request') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Gera relatório de feedback para produto
   */
  static generateProductReport(
    analysis: FeedbackAnalysis
  ): string {
    let report = '# Product Feedback Report\n\n';

    report += `## NPS Score: ${analysis.nps.score}\n`;
    report += `- Promoters: ${analysis.nps.promoters}\n`;
    report += `- Passives: ${analysis.nps.passives}\n`;
    report += `- Detractors: ${analysis.nps.detractors}\n`;
    report += `- Trend: ${analysis.nps.trend}\n\n`;

    report += `## CSAT Average: ${analysis.csat.averageScore.toFixed(2)}/5\n\n`;

    report += '## Top Issues\n';
    analysis.topIssues.forEach((issue, i) => {
      report += `${i + 1}. [${issue.priority}] ${issue.title} (${issue.votes} votes)\n`;
    });

    report += '\n## Top Feature Requests\n';
    analysis.topRequests.forEach((request, i) => {
      report += `${i + 1}. ${request.title} (${request.votes} votes)\n`;
    });

    return report;
  }
}
