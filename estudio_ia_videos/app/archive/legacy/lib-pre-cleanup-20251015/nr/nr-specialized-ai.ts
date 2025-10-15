

/**
 * 🏗️ IA Especializada em Normas Regulamentadoras Brasileiras
 * Sistema Avançado de Conhecimento Regulamentário
 */

interface NRKnowledgeBase {
  numero: string;
  titulo: string;
  objetivo: string;
  aplicacao: string[];
  obrigatoriedades: string[];
  penalidades: string[];
  atualizacoes: {
    data: string;
    mudancas: string[];
  }[];
  setoresImpactados: string[];
  integracaoOutrasNRs: string[];
  cenariosPraticos: NRCenario[];
}

interface NRCenario {
  id: string;
  titulo: string;
  descricao: string;
  setorAplicacao: string;
  riscosEnvolvidos: string[];
  medidasPreventivas: string[];
  epiNecessarios: string[];
  procedimentosEmergencia: string[];
  casosReais?: {
    local: string;
    dataIncidente: string;
    causas: string[];
    consequencias: string[];
    licoesAprendidas: string[];
  }[];
}

export class NRSpecializedAI {
  private knowledgeBase: Map<string, NRKnowledgeBase> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
  }

  /**
   * Inicializa a base de conhecimento com as principais NRs
   */
  private initializeKnowledgeBase(): void {
    
    // NR-01 - Disposições Gerais
    this.knowledgeBase.set('NR-01', {
      numero: 'NR-01',
      titulo: 'Disposições Gerais e Gerenciamento de Riscos Ocupacionais',
      objetivo: 'Estabelecer diretrizes e requisitos para o gerenciamento de riscos ocupacionais e medidas de prevenção',
      aplicacao: ['Todos os empregadores e trabalhadores', 'Atividades econômicas sujeitas à CLT'],
      obrigatoriedades: [
        'Programa de Gerenciamento de Riscos (PGR)',
        'Inventário de Riscos Ocupacionais',
        'Plano de Ação para eliminação/redução de riscos',
        'Treinamento e informação dos trabalhadores'
      ],
      penalidades: [
        'Multa de R$ 2.412,50 a R$ 241.250,00',
        'Interdição de estabelecimento',
        'Embargo de obra ou atividade'
      ],
      atualizacoes: [
        {
          data: '2019-12-20',
          mudancas: ['Criação do PGR', 'Substituição do PPRA', 'Nova metodologia de avaliação de riscos']
        }
      ],
      setoresImpactados: ['Todos os setores econômicos'],
      integracaoOutrasNRs: ['NR-05', 'NR-09', 'NR-15', 'NR-16'],
      cenariosPraticos: [
        {
          id: 'nr01-escritorio',
          titulo: 'Gestão de Riscos em Escritório',
          descricao: 'Identificação e controle de riscos ergonômicos',
          setorAplicacao: 'Serviços Administrativos',
          riscosEnvolvidos: ['Ergonômicos', 'Psicossociais', 'Acidentes'],
          medidasPreventivas: ['Mobiliário adequado', 'Pausas regulares', 'Ginástica laboral'],
          epiNecessarios: [],
          procedimentosEmergencia: ['Evacuação', 'Primeiros socorros']
        }
      ]
    });

    // NR-06 - EPIs
    this.knowledgeBase.set('NR-06', {
      numero: 'NR-06',
      titulo: 'Equipamentos de Proteção Individual',
      objetivo: 'Estabelecer requisitos mínimos para gestão dos EPIs',
      aplicacao: ['Empregadores obrigados a fornecer EPIs', 'Trabalhadores obrigados a usar'],
      obrigatoriedades: [
        'Fornecer EPIs adequados aos riscos',
        'Treinar sobre uso correto',
        'Substituir quando danificados',
        'Responsabilizar-se pela higienização',
        'Comunicar MTE sobre irregularidades'
      ],
      penalidades: [
        'Multa de R$ 2.412,50 a R$ 241.250,00',
        'Responsabilidade civil e criminal em caso de acidente'
      ],
      atualizacoes: [
        {
          data: '2018-11-20',
          mudancas: ['Atualização de CA', 'Novos padrões de qualidade', 'Procedimentos de higienização']
        }
      ],
      setoresImpactados: ['Industrial', 'Construção Civil', 'Saúde', 'Químico'],
      integracaoOutrasNRs: ['NR-01', 'NR-09', 'NR-15', 'NR-35'],
      cenariosPraticos: [
        {
          id: 'nr06-construcao',
          titulo: 'EPIs na Construção Civil',
          descricao: 'Uso correto de EPIs em canteiro de obras',
          setorAplicacao: 'Construção Civil',
          riscosEnvolvidos: ['Queda', 'Impacto', 'Perfuração', 'Inalação de partículas'],
          medidasPreventivas: ['Seleção adequada', 'Treinamento', 'Inspeção diária'],
          epiNecessarios: ['Capacete', 'Óculos', 'Luvas', 'Calçados de segurança', 'Cinturão'],
          procedimentosEmergencia: ['Avaliação de ferimentos', 'Acionamento de socorro']
        }
      ]
    });

    // NR-10 - Eletricidade
    this.knowledgeBase.set('NR-10', {
      numero: 'NR-10',
      titulo: 'Segurança em Instalações e Serviços em Eletricidade',
      objetivo: 'Estabelecer requisitos mínimos para garantir a segurança dos trabalhadores que interagem com instalações elétricas',
      aplicacao: ['Trabalhadores em eletricidade', 'Empregadores do setor elétrico'],
      obrigatoriedades: [
        'Curso Básico de 40h para trabalhadores autorizados',
        'Curso Complementar específico por atividade',
        'Reciclagem bienal obrigatória',
        'Procedimentos de segurança documentados',
        'Análise de Risco detalhada'
      ],
      penalidades: [
        'Multa de R$ 6.708,08 a R$ 670.808,00',
        'Interdição imediata',
        'Responsabilização criminal'
      ],
      atualizacoes: [
        {
          data: '2016-07-07',
          mudancas: ['Reciclagem reduzida para 2 anos', 'Novos requisitos de treinamento']
        }
      ],
      setoresImpactados: ['Energia Elétrica', 'Industrial', 'Construção', 'Telecomunicações'],
      integracaoOutrasNRs: ['NR-01', 'NR-06', 'NR-35'],
      cenariosPraticos: [
        {
          id: 'nr10-manutencao',
          titulo: 'Manutenção em Linha Viva',
          descricao: 'Procedimentos para trabalho em instalações energizadas',
          setorAplicacao: 'Energia Elétrica',
          riscosEnvolvidos: ['Choque elétrico', 'Arco elétrico', 'Queimaduras'],
          medidasPreventivas: ['Desenergização', 'Bloqueio', 'Teste de ausência'],
          epiNecessarios: ['Capacete classe B', 'Luvas isolantes', 'Calçados isolantes', 'Óculos'],
          procedimentosEmergencia: ['Desenergização imediata', 'Primeiros socorros', 'Acionamento SAMU'],
          casosReais: [
            {
              local: 'Subestação Industrial - SP',
              dataIncidente: '2023-04-15',
              causas: ['Não utilização de EPI', 'Procedimento inadequado'],
              consequencias: ['Queimaduras de 2º grau', 'Afastamento 30 dias'],
              licoesAprendidas: ['Reforço em treinamento', 'Supervisão constante']
            }
          ]
        }
      ]
    });

    // NR-12 - Máquinas e Equipamentos
    this.knowledgeBase.set('NR-12', {
      numero: 'NR-12',
      titulo: 'Segurança no Trabalho em Máquinas e Equipamentos',
      objetivo: 'Definir referências técnicas e medidas de proteção para máquinas e equipamentos',
      aplicacao: ['Fabricantes de máquinas', 'Empregadores', 'Trabalhadores operadores'],
      obrigatoriedades: [
        'Manual de instruções em português',
        'Sistemas de segurança integrados',
        'Treinamento específico por máquina',
        'Inspeção e manutenção programada',
        'Análise Preliminar de Riscos (APR)'
      ],
      penalidades: [
        'Multa de R$ 6.708,08 a R$ 670.808,00',
        'Interdição de máquina',
        'Responsabilização por acidentes'
      ],
      atualizacoes: [
        {
          data: '2019-04-12',
          mudancas: ['Anexo VIII sobre prensas', 'Novos dispositivos de segurança']
        }
      ],
      setoresImpactados: ['Metalúrgico', 'Automobilístico', 'Alimentício', 'Têxtil'],
      integracaoOutrasNRs: ['NR-01', 'NR-06', 'NR-17'],
      cenariosPraticos: [
        {
          id: 'nr12-prensa',
          titulo: 'Operação Segura de Prensa',
          descricao: 'Procedimentos de segurança para operação de prensas industriais',
          setorAplicacao: 'Metalúrgico',
          riscosEnvolvidos: ['Prensamento', 'Corte', 'Ruído'],
          medidasPreventivas: ['Comando bi-manual', 'Cortina de luz', 'Proteção fixa'],
          epiNecessarios: ['Protetor auricular', 'Óculos', 'Calçados'],
          procedimentosEmergencia: ['Parada de emergência', 'Socorro imediato']
        }
      ]
    });

    // NR-35 - Trabalho em Altura
    this.knowledgeBase.set('NR-35', {
      numero: 'NR-35',
      titulo: 'Trabalho em Altura',
      objetivo: 'Estabelecer requisitos mínimos de proteção para trabalhos em altura',
      aplicacao: ['Trabalhadores em atividades acima de 2 metros', 'Empregadores responsáveis'],
      obrigatoriedades: [
        'Curso de 8h para trabalhadores',
        'Curso de 40h para supervisores',
        'Reciclagem a cada 2 anos',
        'Análise de Risco específica',
        'Permissão de Trabalho (PT)'
      ],
      penalidades: [
        'Multa de R$ 4.025,61 a R$ 402.561,00',
        'Embargo da atividade',
        'Responsabilização criminal'
      ],
      atualizacoes: [
        {
          data: '2022-01-03',
          mudancas: ['Reciclagem reduzida para 2 anos', 'Novos requisitos de supervisão']
        }
      ],
      setoresImpactados: ['Construção Civil', 'Industrial', 'Telecomunicações', 'Limpeza'],
      integracaoOutrasNRs: ['NR-01', 'NR-06', 'NR-18'],
      cenariosPraticos: [
        {
          id: 'nr35-telhado',
          titulo: 'Manutenção em Telhado Industrial',
          descricao: 'Trabalho seguro em coberturas industriais',
          setorAplicacao: 'Manutenção Industrial',
          riscosEnvolvidos: ['Queda', 'Perfuração', 'Choque elétrico'],
          medidasPreventivas: ['Linha de vida', 'Plataformas', 'Sinalização'],
          epiNecessarios: ['Cinturão tipo paraquedista', 'Capacete', 'Calçados antiderrapantes'],
          procedimentosEmergencia: ['Resgate em altura', 'Primeiros socorros']
        }
      ]
    });
  }

  /**
   * Gera conteúdo especializado para uma NR específica
   */
  public async generateNRContent(
    nr: string, 
    tipo: 'introducao' | 'procedimento' | 'cenario' | 'avaliacao',
    setor?: string
  ): Promise<{
    title: string;
    content: string[];
    scenarios: string[];
    quiz: any[];
    compliance: any[];
  }> {
    const knowledge = this.knowledgeBase.get(nr);
    
    if (!knowledge) {
      throw new Error(`Conhecimento para ${nr} não encontrado`);
    }

    switch (tipo) {
      case 'introducao':
        return this.generateIntroduction(knowledge, setor);
      
      case 'procedimento':
        return this.generateProcedure(knowledge, setor);
      
      case 'cenario':
        return this.generateScenario(knowledge, setor);
      
      case 'avaliacao':
        return this.generateAssessment(knowledge);
      
      default:
        throw new Error(`Tipo de conteúdo não suportado: ${tipo}`);
    }
  }

  private generateIntroduction(knowledge: NRKnowledgeBase, setor?: string): any {
    return {
      title: `Introdução à ${knowledge.titulo}`,
      content: [
        `A ${knowledge.numero} tem como objetivo ${knowledge.objetivo.toLowerCase()}.`,
        `Esta norma se aplica a: ${knowledge.aplicacao.join(', ')}.`,
        setor ? `Para o setor ${setor}, os aspectos mais relevantes são...` : 'Aplicação geral para todos os setores.',
        `As principais obrigatoriedades incluem: ${knowledge.obrigatoriedades.slice(0, 3).join(', ')}.`
      ],
      scenarios: knowledge.cenariosPraticos
        .filter(c => !setor || c.setorAplicacao.toLowerCase().includes(setor.toLowerCase()))
        .map(c => c.titulo),
      quiz: this.generateQuiz(knowledge, 'introducao'),
      compliance: knowledge.obrigatoriedades.map(item => ({
        item,
        required: true,
        description: `Obrigatório conforme ${knowledge.numero}`
      }))
    };
  }

  private generateProcedure(knowledge: NRKnowledgeBase, setor?: string): any {
    const relevantScenarios = knowledge.cenariosPraticos
      .filter(c => !setor || c.setorAplicacao.toLowerCase().includes(setor.toLowerCase()));

    return {
      title: `Procedimentos ${knowledge.titulo}`,
      content: [
        'ETAPA 1: Identificação e Avaliação de Riscos',
        '• Realize inspeção completa do local',
        '• Identifique todos os riscos presentes',
        '• Avalie a probabilidade e gravidade',
        '',
        'ETAPA 2: Implementação de Medidas de Controle',
        '• Elimine riscos na fonte quando possível',
        '• Implemente medidas de controle coletivo',
        '• Configure EPIs quando necessário',
        '',
        'ETAPA 3: Treinamento e Conscientização',
        '• Treine todos os trabalhadores envolvidos',
        '• Realize demonstrações práticas',
        '• Documente o treinamento realizado'
      ],
      scenarios: relevantScenarios.map(s => s.titulo),
      quiz: this.generateQuiz(knowledge, 'procedimento'),
      compliance: [
        { item: 'Procedimento documentado', required: true },
        { item: 'Treinamento registrado', required: true },
        { item: 'Supervisão qualificada', required: true }
      ]
    };
  }

  private generateScenario(knowledge: NRKnowledgeBase, setor?: string): any {
    const scenario = knowledge.cenariosPraticos
      .find(c => !setor || c.setorAplicacao.toLowerCase().includes(setor.toLowerCase())) ||
      knowledge.cenariosPraticos[0];

    return {
      title: scenario.titulo,
      content: [
        `CENÁRIO: ${scenario.descricao}`,
        `SETOR: ${scenario.setorAplicacao}`,
        '',
        'RISCOS IDENTIFICADOS:',
        ...scenario.riscosEnvolvidos.map(r => `• ${r}`),
        '',
        'MEDIDAS PREVENTIVAS:',
        ...scenario.medidasPreventivas.map(m => `• ${m}`),
        '',
        'EPIs NECESSÁRIOS:',
        ...scenario.epiNecessarios.map(e => `• ${e}`),
        '',
        'EM CASO DE EMERGÊNCIA:',
        ...scenario.procedimentosEmergencia.map(p => `• ${p}`)
      ],
      scenarios: [scenario.titulo],
      quiz: this.generateQuiz(knowledge, 'cenario'),
      compliance: [
        { item: 'Análise de risco realizada', required: true },
        { item: 'EPIs disponibilizados', required: true },
        { item: 'Procedimentos de emergência definidos', required: true }
      ]
    };
  }

  private generateAssessment(knowledge: NRKnowledgeBase): any {
    return {
      title: `Avaliação ${knowledge.titulo}`,
      content: [
        'Esta avaliação verifica seu conhecimento sobre os principais aspectos da norma.',
        'É necessário acertar pelo menos 70% das questões para aprovação.',
        'O certificado será emitido automaticamente após aprovação.'
      ],
      scenarios: [],
      quiz: this.generateQuiz(knowledge, 'avaliacao', 10),
      compliance: [
        { item: 'Participação obrigatória', required: true },
        { item: 'Aproveitamento mínimo 70%', required: true },
        { item: 'Certificado válido por 2 anos', required: true }
      ]
    };
  }

  private generateQuiz(knowledge: NRKnowledgeBase, tipo: string, numQuestions: number = 5): any[] {
    const questions = [];
    
    // Questão sobre objetivo
    questions.push({
      question: `Qual o principal objetivo da ${knowledge.numero}?`,
      options: [
        knowledge.objetivo,
        'Regulamentar apenas aspectos técnicos',
        'Definir responsabilidades administrativas',
        'Estabelecer penalidades trabalhistas'
      ],
      correct: 0,
      explanation: `A ${knowledge.numero} tem como foco ${knowledge.objetivo.toLowerCase()}.`
    });

    // Questão sobre aplicação
    questions.push({
      question: `A ${knowledge.numero} se aplica a:`,
      options: [
        'Apenas grandes empresas',
        knowledge.aplicacao[0] || 'Setores específicos',
        'Apenas órgãos públicos',
        'Trabalhadores autônomos exclusivamente'
      ],
      correct: 1,
      explanation: `A norma tem aplicação abrangente conforme definido: ${knowledge.aplicacao.join(', ')}.`
    });

    // Questões sobre obrigatoriedades
    if (knowledge.obrigatoriedades.length > 0) {
      questions.push({
        question: `Qual das seguintes é uma obrigatoriedade da ${knowledge.numero}?`,
        options: [
          'Contratação de consultoria externa',
          knowledge.obrigatoriedades[0],
          'Certificação internacional obrigatória',
          'Seguro específico para atividade'
        ],
        correct: 1,
        explanation: `Conforme a ${knowledge.numero}, é obrigatório: ${knowledge.obrigatoriedades[0]}.`
      });
    }

    return questions.slice(0, numQuestions);
  }

  /**
   * Verifica conformidade de conteúdo com a NR
   */
  public async checkCompliance(nr: string, content: string[]): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    const knowledge = this.knowledgeBase.get(nr);
    
    if (!knowledge) {
      return { score: 0, issues: ['NR não encontrada'], recommendations: [] };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Verificar se objetivos são mencionados
    const contentText = content.join(' ').toLowerCase();
    if (!contentText.includes(knowledge.objetivo.toLowerCase().substring(0, 20))) {
      issues.push('Objetivo da norma não claramente apresentado');
      score -= 10;
    }

    // Verificar menção às obrigatoriedades
    let obrigatoriedadesMencionadas = 0;
    knowledge.obrigatoriedades.forEach(obr => {
      if (contentText.includes(obr.toLowerCase().substring(0, 15))) {
        obrigatoriedadesMencionadas++;
      }
    });

    if (obrigatoriedadesMencionadas < knowledge.obrigatoriedades.length * 0.7) {
      issues.push('Poucas obrigatoriedades principais mencionadas');
      score -= 15;
    }

    // Recomendações de melhoria
    recommendations.push('Incluir casos práticos do setor específico');
    recommendations.push('Adicionar referências às penalidades');
    recommendations.push('Mencionar integração com outras NRs');

    return { score: Math.max(score, 0), issues, recommendations };
  }

  /**
   * Gera script narração otimizado para NR
   */
  public generateNarrationScript(content: string[], nr: string): string {
    const knowledge = this.knowledgeBase.get(nr);
    const nrName = knowledge?.titulo || nr;

    return `
[INTRODUÇÃO - Tom profissional e acolhedor]
Bem-vindos ao treinamento sobre ${nrName}. 
Este conteúdo foi desenvolvido com inteligência artificial especializada em regulamentações brasileiras.

[DESENVOLVIMENTO - Tom didático]
${content.join('\n\n[PAUSA]\n\n')}

[CONCLUSÃO - Tom motivador]
Lembre-se: o cumprimento das normas regulamentadoras não é apenas uma obrigação legal,
mas uma responsabilidade com a vida e segurança de todos os trabalhadores.

[CERTIFICAÇÃO]
Ao final deste treinamento, você receberá um certificado digital válido conforme exigências do Ministério do Trabalho.
    `.trim();
  }

  /**
   * Recomenda EPIs específicos para cenário
   */
  public recommendEPIs(nr: string, scenario: string, setor: string): string[] {
    const knowledge = this.knowledgeBase.get(nr);
    
    if (!knowledge) return [];

    const relevantScenario = knowledge.cenariosPraticos
      .find(c => c.titulo.toLowerCase().includes(scenario.toLowerCase()) || 
                  c.setorAplicacao.toLowerCase().includes(setor.toLowerCase()));

    return relevantScenario?.epiNecessarios || [];
  }

  /**
   * Obtém atualizações recentes da NR
   */
  public getRecentUpdates(nr: string): any[] {
    const knowledge = this.knowledgeBase.get(nr);
    return knowledge?.atualizacoes || [];
  }

  /**
   * Lista NRs relacionadas
   */
  public getRelatedNRs(nr: string): string[] {
    const knowledge = this.knowledgeBase.get(nr);
    return knowledge?.integracaoOutrasNRs || [];
  }
}

export const nrAI = new NRSpecializedAI();

