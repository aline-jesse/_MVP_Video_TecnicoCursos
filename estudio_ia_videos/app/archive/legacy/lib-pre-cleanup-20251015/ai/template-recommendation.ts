
/**
 * SPRINT 34 - AI-POWERED TEMPLATE RECOMMENDATIONS
 * Smart template suggestions based on content analysis
 */

import { prisma } from '../db';

export interface TemplateRecommendation {
  templateId: string;
  nr: string;
  title: string;
  description: string;
  confidence: number;
  reasons: string[];
  thumbnailUrl?: string;
}

export interface ComplianceCheck {
  nr: string;
  isRequired: boolean;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  articles: string[];
}

export interface ContentAnalysis {
  keywords: string[];
  topics: string[];
  industry: string;
  riskLevel: 'high' | 'medium' | 'low';
  recommendedNRs: string[];
}

/**
 * Analyze content and recommend appropriate NR templates
 */
export async function recommendTemplates(
  content: string,
  context?: { industry?: string; jobRole?: string }
): Promise<TemplateRecommendation[]> {
  // Analyze content
  const analysis = analyzeContent(content, context);

  // Get all NR templates
  const templates = await prisma.nRTemplate.findMany({
    where: {
      nr: { in: analysis.recommendedNRs },
    },
    orderBy: { usageCount: 'desc' },
  });

  // Score and rank templates
  const recommendations: TemplateRecommendation[] = templates.map((template: any) => {
    const score = calculateTemplateScore(template, analysis);
    const reasons = generateRecommendationReasons(template, analysis);

    return {
      templateId: template.id,
      nr: template.nr,
      title: template.title,
      description: template.description,
      confidence: score,
      reasons,
      thumbnailUrl: template.thumbnailUrl || undefined,
    };
  });

  // Sort by confidence score
  return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Check compliance requirements based on content
 */
export async function checkCompliance(content: string): Promise<ComplianceCheck[]> {
  const analysis = analyzeContent(content);
  const checks: ComplianceCheck[] = [];

  // Define compliance rules (simplified for demo)
  const complianceRules: Record<string, ComplianceCheck> = {
    NR12: {
      nr: 'NR12',
      isRequired: false,
      reason: 'Segurança no Trabalho em Máquinas e Equipamentos',
      severity: 'high',
      articles: ['12.1', '12.2', '12.3'],
    },
    NR33: {
      nr: 'NR33',
      isRequired: false,
      reason: 'Segurança e Saúde nos Trabalhos em Espaços Confinados',
      severity: 'high',
      articles: ['33.1', '33.2', '33.3'],
    },
    NR35: {
      nr: 'NR35',
      isRequired: false,
      reason: 'Trabalho em Altura',
      severity: 'high',
      articles: ['35.1', '35.2', '35.3'],
    },
    NR10: {
      nr: 'NR10',
      isRequired: false,
      reason: 'Segurança em Instalações e Serviços em Eletricidade',
      severity: 'high',
      articles: ['10.1', '10.2', '10.3'],
    },
    NR17: {
      nr: 'NR17',
      isRequired: false,
      reason: 'Ergonomia',
      severity: 'medium',
      articles: ['17.1', '17.2'],
    },
  };

  // Check each keyword and topic against compliance rules
  for (const [nr, rule] of Object.entries(complianceRules)) {
    const isRelevant = analysis.recommendedNRs.includes(nr);
    if (isRelevant) {
      checks.push({
        ...rule,
        isRequired: analysis.riskLevel === 'high',
      });
    }
  }

  return checks.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    if (a.severity === 'high') return -1;
    if (b.severity === 'high') return 1;
    if (a.severity === 'medium') return -1;
    return 1;
  });
}

/**
 * Generate smart content suggestions
 */
export async function generateContentSuggestions(
  projectType: string,
  existingContent?: string
): Promise<string[]> {
  // In production, this would use GPT-4 or similar
  // For now, we'll use rule-based suggestions
  
  const suggestions: Record<string, string[]> = {
    'NR12': [
      'Introdução à NR12: Conceitos e Objetivos',
      'Identificação de Riscos em Máquinas e Equipamentos',
      'Procedimentos de Segurança na Operação',
      'Uso Correto de EPIs e EPCs',
      'Manutenção Preventiva e Inspeções Periódicas',
    ],
    'NR33': [
      'O que são Espaços Confinados?',
      'Identificação e Avaliação de Riscos',
      'Procedimentos de Entrada Segura',
      'Equipamentos de Resgate e Emergência',
      'Comunicação e Sinalização',
    ],
    'NR35': [
      'Conceitos de Trabalho em Altura',
      'Análise de Risco (APR)',
      'Sistemas de Proteção contra Quedas',
      'Inspeção e Manutenção de Equipamentos',
      'Procedimentos de Emergência e Resgate',
    ],
  };

  const contentType = projectType.toUpperCase();
  return suggestions[contentType] || [
    'Introdução ao Treinamento',
    'Objetivos e Metas',
    'Procedimentos de Segurança',
    'Boas Práticas',
    'Conclusão e Certificação',
  ];
}

// Helper functions
function analyzeContent(
  content: string,
  context?: { industry?: string; jobRole?: string }
): ContentAnalysis {
  const normalizedContent = content.toLowerCase();

  // Define keyword mappings to NRs
  const nrKeywords: Record<string, string[]> = {
    NR12: ['máquina', 'equipamento', 'prensa', 'torno', 'serra', 'proteção', 'dispositivo'],
    NR33: ['espaço confinado', 'tanque', 'silo', 'poço', 'vala', 'túnel', 'ventilação'],
    NR35: ['altura', 'andaime', 'escada', 'telhado', 'queda', 'cinto', 'ancoragem'],
    NR10: ['elétrico', 'eletricidade', 'tensão', 'corrente', 'painel', 'fiação'],
    NR17: ['ergonomia', 'postura', 'levantamento', 'repetitivo', 'mobiliário'],
    NR06: ['epi', 'equipamento proteção individual', 'luva', 'capacete', 'óculos'],
    NR09: ['risco', 'avaliação', 'ppra', 'agente', 'exposição'],
  };

  // Detect relevant NRs
  const recommendedNRs: string[] = [];
  const keywords: string[] = [];

  for (const [nr, terms] of Object.entries(nrKeywords)) {
    for (const term of terms) {
      if (normalizedContent.includes(term)) {
        if (!recommendedNRs.includes(nr)) {
          recommendedNRs.push(nr);
        }
        if (!keywords.includes(term)) {
          keywords.push(term);
        }
      }
    }
  }

  // Determine risk level
  const highRiskTerms = ['fatal', 'morte', 'grave', 'crítico', 'alto risco'];
  const hasHighRisk = highRiskTerms.some((term) => normalizedContent.includes(term));

  return {
    keywords,
    topics: recommendedNRs,
    industry: context?.industry || 'industrial',
    riskLevel: hasHighRisk ? 'high' : recommendedNRs.length > 2 ? 'medium' : 'low',
    recommendedNRs,
  };
}

function calculateTemplateScore(template: any, analysis: ContentAnalysis): number {
  let score = 0;

  // Base score from usage count (normalized to 0-30)
  score += Math.min((template.usageCount / 100) * 30, 30);

  // Relevance to detected topics (0-40)
  if (analysis.topics.includes(template.nr)) {
    score += 40;
  }

  // Rating boost (0-20)
  if (template.rating) {
    score += (template.rating / 5) * 20;
  }

  // Risk level match (0-10)
  if (analysis.riskLevel === 'high') {
    score += 10;
  }

  return Math.min(score, 100);
}

function generateRecommendationReasons(template: any, analysis: ContentAnalysis): string[] {
  const reasons: string[] = [];

  if (analysis.topics.includes(template.nr)) {
    reasons.push(`Conteúdo relacionado a ${template.nr}`);
  }

  if (template.usageCount > 50) {
    reasons.push('Template popular e comprovado');
  }

  if (template.rating && template.rating > 4) {
    reasons.push('Alta avaliação dos usuários');
  }

  if (analysis.riskLevel === 'high') {
    reasons.push('Relevante para situações de alto risco');
  }

  if (reasons.length === 0) {
    reasons.push('Template recomendado para sua categoria');
  }

  return reasons;
}
