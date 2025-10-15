/**
 * NR-20: SEGURANÇA E SAÚDE NO TRABALHO COM INFLAMÁVEIS E COMBUSTÍVEIS
 * Template de conformidade para treinamentos
 */

export const NR20_TEMPLATE = {
  nr: 'NR-20',
  name: 'Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis',
  description: 'Norma Regulamentadora sobre segurança e saúde no trabalho com inflamáveis e combustíveis',
  version: '2023',
  
  requiredTopics: [
    {
      id: 'nr20_intro',
      title: 'Introdução à NR-20',
      keywords: ['nr-20', 'inflamáveis', 'combustíveis', 'segurança química'],
      minDuration: 30,
      mandatory: true,
      description: 'Apresentação da NR-20 e conceitos básicos de segurança com inflamáveis'
    },
    {
      id: 'nr20_classificacao',
      title: 'Classificação de Instalações',
      keywords: ['classificação instalações', 'classe i', 'classe ii', 'classe iii', 'atividades'],
      minDuration: 45,
      mandatory: true,
      description: 'Classificação das instalações conforme atividades e produtos'
    },
    {
      id: 'nr20_riscos',
      title: 'Riscos de Inflamáveis e Combustíveis',
      keywords: ['riscos químicos', 'explosão', 'incêndio', 'toxicidade', 'vazamentos'],
      minDuration: 90,
      mandatory: true,
      description: 'Identificação e análise dos riscos com inflamáveis e combustíveis'
    },
    {
      id: 'nr20_prevencao',
      title: 'Medidas de Prevenção',
      keywords: ['prevenção', 'controle riscos', 'ventilação', 'aterramento', 'eliminação fontes ignição'],
      minDuration: 120,
      mandatory: true,
      description: 'Medidas de prevenção e controle de riscos'
    },
    {
      id: 'nr20_protecao_incendio',
      title: 'Proteção Contra Incêndio',
      keywords: ['proteção incêndio', 'sistemas detecção', 'combate incêndio', 'sprinklers', 'extintores'],
      minDuration: 90,
      mandatory: true,
      description: 'Sistemas de proteção e combate a incêndio'
    },
    {
      id: 'nr20_procedimentos',
      title: 'Procedimentos Operacionais',
      keywords: ['procedimentos operacionais', 'permissão trabalho', 'trabalho quente', 'manutenção'],
      minDuration: 105,
      mandatory: true,
      description: 'Procedimentos operacionais seguros'
    },
    {
      id: 'nr20_emergencia',
      title: 'Plano de Resposta a Emergências',
      keywords: ['emergência', 'plano emergência', 'evacuação', 'primeiros socorros', 'comunicação'],
      minDuration: 75,
      mandatory: true,
      description: 'Plano de resposta a emergências com inflamáveis'
    },
    {
      id: 'nr20_analise_riscos',
      title: 'Análise de Riscos',
      keywords: ['análise riscos', 'apr', 'what if', 'hazop', 'fmea'],
      minDuration: 90,
      mandatory: true,
      description: 'Metodologias de análise de riscos'
    },
    {
      id: 'nr20_capacitacao',
      title: 'Capacitação de Trabalhadores',
      keywords: ['capacitação', 'treinamento', 'integração', 'reciclagem', 'competência'],
      minDuration: 60,
      mandatory: true,
      description: 'Programas de capacitação específicos'
    }
  ],
  
  criticalPoints: [
    'Identificação de produtos inflamáveis e combustíveis',
    'Uso correto de EPIs para produtos químicos',
    'Procedimentos de trabalho a quente',
    'Sistemas de detecção e combate a incêndio',
    'Procedimentos de emergência e evacuação',
    'Análise de riscos em atividades',
    'Manuseio seguro de produtos químicos'
  ],
  
  requiredImages: [
    'EPIs para trabalho com químicos',
    'Sistemas de combate a incêndio',
    'Sinalização de segurança química',
    'Procedimentos de emergência',
    'Equipamentos de detecção de gases',
    'Armazenamento seguro de inflamáveis'
  ],
  
  assessmentCriteria: {
    minScore: 85,
    minCompletionRate: 95,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  }
}