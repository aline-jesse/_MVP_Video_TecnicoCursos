
/**
 * NR Compliance Engine
 * Motor de validação de compliance com Normas Regulamentadoras (NR-1 a NR-37)
 * 
 * Features:
 * - Validação de conteúdo obrigatório por NR
 * - Verificação de duração mínima
 * - Checklist de itens mandatórios
 * - Geração de relatórios de conformidade
 * - Certificados de conformidade
 */

// ============================================================================
// TYPES
// ============================================================================

export interface NRRule {
  id: string;
  title: string;
  description: string;
  required: boolean;
  minDuration?: number; // em segundos
  keywords: string[];
  topics: string[];
}

export interface NRStandard {
  nr: string;
  name: string;
  description: string;
  minimumDuration: number; // em minutos
  mandatoryTopics: string[];
  rules: NRRule[];
}

export interface ComplianceValidationResult {
  isCompliant: boolean;
  score: number; // 0-100
  standard: string;
  mandatoryTopicsCovered: string[];
  missingTopics: string[];
  warnings: string[];
  errors: string[];
  recommendations: string[];
  details: {
    contentLength: number;
    duration: number;
    topicsCovered: number;
    totalTopics: number;
    rulesPassed: number;
    totalRules: number;
  };
}

export interface ComplianceCertificate {
  id: string;
  projectId: string;
  userId: string;
  standard: string;
  issuedAt: Date;
  expiresAt?: Date;
  score: number;
  status: 'valid' | 'expired' | 'revoked';
  pdfUrl?: string;
  validationResult: ComplianceValidationResult;
}

// ============================================================================
// NR STANDARDS DATABASE
// ============================================================================

export const NR_STANDARDS: Record<string, NRStandard> = {
  'NR-1': {
    nr: 'NR-1',
    name: 'Disposições Gerais e Gerenciamento de Riscos Ocupacionais',
    description: 'Estabelece disposições gerais sobre SST e gerenciamento de riscos',
    minimumDuration: 15,
    mandatoryTopics: [
      'Introdução à SST',
      'Direitos e deveres',
      'Gerenciamento de riscos',
      'Documentação',
    ],
    rules: [
      {
        id: 'nr1-r1',
        title: 'Direitos e Deveres do Trabalhador',
        description: 'Deve abordar direitos e deveres dos trabalhadores em SST',
        required: true,
        keywords: ['direitos', 'deveres', 'trabalhador', 'empregado'],
        topics: ['Direitos e deveres'],
      },
      {
        id: 'nr1-r2',
        title: 'Gerenciamento de Riscos',
        description: 'Deve apresentar o conceito de gerenciamento de riscos ocupacionais',
        required: true,
        keywords: ['riscos', 'gerenciamento', 'GRO', 'identificação'],
        topics: ['Gerenciamento de riscos'],
      },
    ],
  },

  'NR-5': {
    nr: 'NR-5',
    name: 'Comissão Interna de Prevenção de Acidentes (CIPA)',
    description: 'Regulamenta a CIPA nas empresas',
    minimumDuration: 20,
    mandatoryTopics: [
      'O que é CIPA',
      'Objetivos da CIPA',
      'Composição',
      'Atribuições',
      'Funcionamento',
    ],
    rules: [
      {
        id: 'nr5-r1',
        title: 'Conceito de CIPA',
        description: 'Deve explicar o que é e para que serve a CIPA',
        required: true,
        keywords: ['CIPA', 'comissão', 'prevenção', 'acidentes'],
        topics: ['O que é CIPA', 'Objetivos da CIPA'],
      },
      {
        id: 'nr5-r2',
        title: 'Composição da CIPA',
        description: 'Deve detalhar como é formada a CIPA',
        required: true,
        keywords: ['composição', 'membros', 'representantes', 'eleição'],
        topics: ['Composição'],
      },
    ],
  },

  'NR-6': {
    nr: 'NR-6',
    name: 'Equipamentos de Proteção Individual (EPI)',
    description: 'Regulamenta o uso de EPIs',
    minimumDuration: 30,
    mandatoryTopics: [
      'O que são EPIs',
      'Responsabilidades',
      'Tipos de EPIs',
      'Uso correto',
      'Conservação',
      'Higienização',
    ],
    rules: [
      {
        id: 'nr6-r1',
        title: 'Conceito de EPI',
        description: 'Deve explicar o que são EPIs',
        required: true,
        keywords: ['EPI', 'equipamento', 'proteção', 'individual'],
        topics: ['O que são EPIs'],
      },
      {
        id: 'nr6-r2',
        title: 'Responsabilidades',
        description: 'Deve abordar responsabilidades do empregador e empregado',
        required: true,
        keywords: ['responsabilidade', 'obrigação', 'empregador', 'empregado'],
        topics: ['Responsabilidades'],
      },
      {
        id: 'nr6-r3',
        title: 'Tipos de EPIs',
        description: 'Deve apresentar os principais tipos de EPIs',
        required: true,
        minDuration: 300,
        keywords: ['capacete', 'luva', 'bota', 'óculos', 'máscara', 'protetor'],
        topics: ['Tipos de EPIs'],
      },
    ],
  },

  'NR-10': {
    nr: 'NR-10',
    name: 'Segurança em Instalações e Serviços em Eletricidade',
    description: 'Estabelece requisitos de segurança em eletricidade',
    minimumDuration: 40,
    mandatoryTopics: [
      'Riscos elétricos',
      'Choque elétrico',
      'Arco elétrico',
      'Campo eletromagnético',
      'Medidas de controle',
      'EPIs e EPCs',
      'Primeiros socorros',
    ],
    rules: [
      {
        id: 'nr10-r1',
        title: 'Riscos Elétricos',
        description: 'Deve abordar os principais riscos elétricos',
        required: true,
        keywords: ['risco', 'elétrico', 'choque', 'arco', 'queimadura'],
        topics: ['Riscos elétricos', 'Choque elétrico', 'Arco elétrico'],
      },
      {
        id: 'nr10-r2',
        title: 'Medidas de Proteção',
        description: 'Deve apresentar medidas de proteção coletiva e individual',
        required: true,
        keywords: ['proteção', 'EPI', 'EPC', 'isolamento', 'bloqueio'],
        topics: ['Medidas de controle', 'EPIs e EPCs'],
      },
    ],
  },

  'NR-11': {
    nr: 'NR-11',
    name: 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais',
    description: 'Regulamenta operações de transporte e movimentação de materiais',
    minimumDuration: 35,
    mandatoryTopics: [
      'Normas de segurança',
      'Empilhadeiras',
      'Pontes rolantes',
      'Elevadores',
      'Armazenagem',
      'Sinalização',
    ],
    rules: [
      {
        id: 'nr11-r1',
        title: 'Operação de Empilhadeiras',
        description: 'Deve abordar segurança na operação de empilhadeiras',
        required: true,
        keywords: ['empilhadeira', 'operador', 'carga', 'transporte'],
        topics: ['Empilhadeiras'],
      },
    ],
  },

  'NR-12': {
    nr: 'NR-12',
    name: 'Segurança no Trabalho em Máquinas e Equipamentos',
    description: 'Estabelece requisitos de segurança em máquinas',
    minimumDuration: 40,
    mandatoryTopics: [
      'Proteções de máquinas',
      'Dispositivos de segurança',
      'Sistemas de parada',
      'Capacitação',
      'Manutenção',
      'Inspeções',
    ],
    rules: [
      {
        id: 'nr12-r1',
        title: 'Proteções de Máquinas',
        description: 'Deve abordar proteções físicas e dispositivos de segurança',
        required: true,
        keywords: ['proteção', 'guarda', 'dispositivo', 'segurança'],
        topics: ['Proteções de máquinas', 'Dispositivos de segurança'],
      },
    ],
  },

  'NR-33': {
    nr: 'NR-33',
    name: 'Segurança e Saúde nos Trabalhos em Espaços Confinados',
    description: 'Regulamenta trabalhos em espaços confinados',
    minimumDuration: 40,
    mandatoryTopics: [
      'O que é espaço confinado',
      'Riscos',
      'Permissão de entrada',
      'Medidas de controle',
      'Resgate e emergência',
      'Capacitação',
    ],
    rules: [
      {
        id: 'nr33-r1',
        title: 'Conceito de Espaço Confinado',
        description: 'Deve explicar o que caracteriza um espaço confinado',
        required: true,
        keywords: ['espaço confinado', 'tanque', 'poço', 'tubulação'],
        topics: ['O que é espaço confinado'],
      },
      {
        id: 'nr33-r2',
        title: 'Permissão de Entrada e Trabalho (PET)',
        description: 'Deve abordar o processo de PET',
        required: true,
        keywords: ['permissão', 'PET', 'autorização', 'entrada'],
        topics: ['Permissão de entrada'],
      },
    ],
  },

  'NR-35': {
    nr: 'NR-35',
    name: 'Trabalho em Altura',
    description: 'Estabelece requisitos para trabalho em altura',
    minimumDuration: 8 * 60, // 8 horas (curso obrigatório)
    mandatoryTopics: [
      'Riscos em altura',
      'EPIs específicos',
      'Ancoragem',
      'Planejamento',
      'Resgate e emergência',
      'Análise de risco',
    ],
    rules: [
      {
        id: 'nr35-r1',
        title: 'Conceito de Trabalho em Altura',
        description: 'Deve explicar o que é trabalho em altura (acima de 2m)',
        required: true,
        keywords: ['altura', '2 metros', 'risco de queda'],
        topics: ['Riscos em altura'],
      },
      {
        id: 'nr35-r2',
        title: 'EPIs para Trabalho em Altura',
        description: 'Deve abordar cinturão, trava-quedas e outros EPIs',
        required: true,
        keywords: ['cinturão', 'trava-quedas', 'talabarte', 'capacete'],
        topics: ['EPIs específicos'],
      },
    ],
  },
};

// ============================================================================
// NR COMPLIANCE ENGINE CLASS
// ============================================================================

export class NRComplianceEngine {
  /**
   * Valida se um conteúdo está em conformidade com uma NR específica
   */
  async validateCompliance(params: {
    standard: string; // Ex: 'NR-6', 'NR-35'
    content: string;
    duration?: number; // em minutos
    projectId?: string;
  }): Promise<ComplianceValidationResult> {
    const { standard, content, duration = 0 } = params;

    const nrStandard = NR_STANDARDS[standard];
    
    if (!nrStandard) {
      throw new Error(`Norma ${standard} não encontrada`);
    }

    const result: ComplianceValidationResult = {
      isCompliant: false,
      score: 0,
      standard,
      mandatoryTopicsCovered: [],
      missingTopics: [],
      warnings: [],
      errors: [],
      recommendations: [],
      details: {
        contentLength: content.length,
        duration,
        topicsCovered: 0,
        totalTopics: nrStandard.mandatoryTopics.length,
        rulesPassed: 0,
        totalRules: nrStandard.rules.length,
      },
    };

    // 1. Verificar duração mínima
    if (duration < nrStandard.minimumDuration) {
      result.errors.push(
        `Duração insuficiente: ${duration} min (mínimo: ${nrStandard.minimumDuration} min)`
      );
    }

    // 2. Verificar tópicos obrigatórios
    const contentLower = content.toLowerCase();
    
    for (const topic of nrStandard.mandatoryTopics) {
      const topicKeywords = topic.toLowerCase().split(' ');
      const found = topicKeywords.some(keyword => 
        contentLower.includes(keyword)
      );

      if (found) {
        result.mandatoryTopicsCovered.push(topic);
        result.details.topicsCovered++;
      } else {
        result.missingTopics.push(topic);
      }
    }

    // 3. Verificar regras específicas
    for (const rule of nrStandard.rules) {
      const passed = this.validateRule(rule, content, duration);
      
      if (passed) {
        result.details.rulesPassed++;
      } else if (rule.required) {
        result.errors.push(
          `Regra obrigatória não atendida: ${rule.title}`
        );
      } else {
        result.warnings.push(
          `Regra recomendada não atendida: ${rule.title}`
        );
      }
    }

    // 4. Calcular score
    const topicScore = (result.details.topicsCovered / result.details.totalTopics) * 60;
    const ruleScore = (result.details.rulesPassed / result.details.totalRules) * 30;
    const durationScore = duration >= nrStandard.minimumDuration ? 10 : 0;
    
    result.score = Math.round(topicScore + ruleScore + durationScore);

    // 5. Determinar conformidade
    result.isCompliant = 
      result.score >= 80 &&
      duration >= nrStandard.minimumDuration &&
      result.missingTopics.length === 0;

    // 6. Gerar recomendações
    if (!result.isCompliant) {
      if (result.missingTopics.length > 0) {
        result.recommendations.push(
          `Adicionar conteúdo sobre: ${result.missingTopics.join(', ')}`
        );
      }
      
      if (duration < nrStandard.minimumDuration) {
        result.recommendations.push(
          `Aumentar duração em ${nrStandard.minimumDuration - duration} minutos`
        );
      }

      if (result.score < 80) {
        result.recommendations.push(
          'Enriquecer conteúdo com mais detalhes sobre os tópicos obrigatórios'
        );
      }
    }

    return result;
  }

  /**
   * Valida uma regra específica
   */
  private validateRule(rule: NRRule, content: string, duration: number): boolean {
    const contentLower = content.toLowerCase();

    // Verificar duração mínima da regra
    if (rule.minDuration && duration < rule.minDuration / 60) {
      return false;
    }

    // Verificar keywords
    const keywordsFound = rule.keywords.filter(keyword =>
      contentLower.includes(keyword.toLowerCase())
    );

    // Regra passa se pelo menos 50% das keywords forem encontradas
    return keywordsFound.length >= rule.keywords.length * 0.5;
  }

  /**
   * Lista todas as NRs disponíveis
   */
  listAvailableStandards(): NRStandard[] {
    return Object.values(NR_STANDARDS);
  }

  /**
   * Busca uma NR específica
   */
  getStandard(nr: string): NRStandard | null {
    return NR_STANDARDS[nr] || null;
  }

  /**
   * Gera certificado de conformidade
   */
  async generateCertificate(params: {
    projectId: string;
    userId: string;
    validationResult: ComplianceValidationResult;
    expiresInDays?: number;
  }): Promise<ComplianceCertificate> {
    const { projectId, userId, validationResult, expiresInDays = 365 } = params;

    if (!validationResult.isCompliant) {
      throw new Error('Não é possível gerar certificado para conteúdo não conforme');
    }

    const certificate: ComplianceCertificate = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      userId,
      standard: validationResult.standard,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      score: validationResult.score,
      status: 'valid',
      validationResult,
    };

    return certificate;
  }

  /**
   * Verifica se um certificado ainda é válido
   */
  isCertificateValid(certificate: ComplianceCertificate): boolean {
    if (certificate.status !== 'valid') {
      return false;
    }

    if (certificate.expiresAt && certificate.expiresAt < new Date()) {
      return false;
    }

    return true;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let complianceEngineInstance: NRComplianceEngine | null = null;

export function getComplianceEngine(): NRComplianceEngine {
  if (!complianceEngineInstance) {
    complianceEngineInstance = new NRComplianceEngine();
  }
  return complianceEngineInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default NRComplianceEngine;
