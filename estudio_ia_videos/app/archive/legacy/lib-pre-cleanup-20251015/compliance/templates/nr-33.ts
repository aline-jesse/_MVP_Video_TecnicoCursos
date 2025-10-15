
/**
 * NR-33: SEGURANÇA E SAÚDE NOS TRABALHOS EM ESPAÇOS CONFINADOS
 * Template de conformidade para treinamentos
 */

export const NR33_TEMPLATE = {
  nr: 'NR-33',
  name: 'Segurança em Espaços Confinados',
  description: 'Norma Regulamentadora sobre segurança e saúde nos trabalhos em espaços confinados',
  version: '2023',
  
  requiredTopics: [
    {
      id: 'nr33_intro',
      title: 'Introdução à NR-33',
      keywords: ['nr-33', 'espaços confinados', 'definição', 'características'],
      minDuration: 30,
      mandatory: true,
      description: 'O que são espaços confinados e características'
    },
    {
      id: 'nr33_riscos',
      title: 'Identificação de Riscos',
      keywords: ['riscos', 'atmosfera', 'asfixia', 'explosão', 'toxicidade'],
      minDuration: 90,
      mandatory: true,
      description: 'Riscos associados a espaços confinados'
    },
    {
      id: 'nr33_medicao',
      title: 'Medição e Monitoramento',
      keywords: ['medição', 'monitoramento', 'atmosfera', 'gases', 'oxigênio'],
      minDuration: 60,
      mandatory: true,
      description: 'Uso de equipamentos de medição e monitoramento'
    },
    {
      id: 'nr33_ventilacao',
      title: 'Ventilação e Purga',
      keywords: ['ventilação', 'purga', 'exaustão', 'ar', 'renovação'],
      minDuration: 60,
      mandatory: true,
      description: 'Procedimentos de ventilação e purga'
    },
    {
      id: 'nr33_pet',
      title: 'Permissão de Entrada e Trabalho (PET)',
      keywords: ['pet', 'permissão', 'autorização', 'liberação', 'supervisor'],
      minDuration: 90,
      mandatory: true,
      description: 'Sistema de permissão para entrada em espaços confinados'
    },
    {
      id: 'nr33_resgate',
      title: 'Procedimentos de Resgate e Emergência',
      keywords: ['resgate', 'emergência', 'evacuação', 'primeiros socorros', 'equipe'],
      minDuration: 120,
      mandatory: true,
      description: 'Planos e procedimentos de resgate'
    },
    {
      id: 'nr33_epis',
      title: 'Equipamentos de Proteção',
      keywords: ['epi', 'epc', 'proteção', 'equipamentos', 'respiradores'],
      minDuration: 60,
      mandatory: true,
      description: 'EPIs e EPCs específicos para espaços confinados'
    },
    {
      id: 'nr33_responsabilidades',
      title: 'Responsabilidades e Competências',
      keywords: ['responsabilidades', 'supervisor', 'vigia', 'trabalhador autorizado', 'equipe'],
      minDuration: 45,
      mandatory: true,
      description: 'Papéis e responsabilidades da equipe'
    }
  ],
  
  criticalPoints: [
    'Teste de atmosfera ANTES da entrada',
    'Uso obrigatório de permissão de entrada (PET)',
    'Presença de vigia durante toda a operação',
    'Plano de resgate previamente estabelecido',
    'Comunicação contínua entre equipe'
  ],
  
  requiredImages: [
    'Exemplos de espaços confinados',
    'Equipamentos de medição',
    'EPIs específicos (respiradores, cintos, trava-quedas)',
    'Procedimentos de resgate'
  ],
  
  assessmentCriteria: {
    minScore: 80,
    minCompletionRate: 90,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  }
}
