
/**
 * NR-35: TRABALHO EM ALTURA
 * Template de conformidade para treinamentos
 */

export const NR35_TEMPLATE = {
  nr: 'NR-35',
  name: 'Trabalho em Altura',
  description: 'Norma Regulamentadora sobre trabalho em altura',
  version: '2022',
  
  requiredTopics: [
    {
      id: 'nr35_intro',
      title: 'Introdução à NR-35',
      keywords: ['nr-35', 'trabalho em altura', 'definição', '2 metros'],
      minDuration: 30,
      mandatory: true,
      description: 'Definição de trabalho em altura e aplicação'
    },
    {
      id: 'nr35_riscos',
      title: 'Análise de Riscos',
      keywords: ['riscos', 'queda', 'análise', 'prevenção', 'identificação'],
      minDuration: 60,
      mandatory: true,
      description: 'Identificação e análise de riscos de queda'
    },
    {
      id: 'nr35_planejamento',
      title: 'Planejamento de Trabalho',
      keywords: ['planejamento', 'permissão', 'autorização', 'APR', 'análise preliminar'],
      minDuration: 60,
      mandatory: true,
      description: 'Planejamento e autorização para trabalho em altura'
    },
    {
      id: 'nr35_sistemas',
      title: 'Sistemas de Proteção contra Quedas',
      keywords: ['proteção', 'sistemas', 'ancoragem', 'linha de vida', 'trava-quedas'],
      minDuration: 90,
      mandatory: true,
      description: 'Tipos de sistemas de proteção contra quedas'
    },
    {
      id: 'nr35_epis',
      title: 'Equipamentos de Proteção Individual',
      keywords: ['epi', 'cinto', 'talabarte', 'mosquetão', 'capacete'],
      minDuration: 60,
      mandatory: true,
      description: 'EPIs para trabalho em altura e inspeção'
    },
    {
      id: 'nr35_resgate',
      title: 'Procedimentos de Emergência e Resgate',
      keywords: ['emergência', 'resgate', 'evacuação', 'primeiros socorros', 'trauma'],
      minDuration: 90,
      mandatory: true,
      description: 'Planos de emergência e resgate em altura'
    },
    {
      id: 'nr35_inspecao',
      title: 'Inspeção de Equipamentos',
      keywords: ['inspeção', 'verificação', 'equipamentos', 'manutenção', 'descarte'],
      minDuration: 45,
      mandatory: true,
      description: 'Procedimentos de inspeção de EPIs e sistemas'
    },
    {
      id: 'nr35_responsabilidades',
      title: 'Responsabilidades e Capacitação',
      keywords: ['responsabilidades', 'capacitação', 'treinamento', 'certificação', 'reciclagem'],
      minDuration: 45,
      mandatory: true,
      description: 'Responsabilidades e requisitos de capacitação'
    }
  ],
  
  criticalPoints: [
    'Inspeção de EPIs ANTES do uso',
    'Verificação de pontos de ancoragem',
    'Uso de dupla proteção (cinto + talabarte)',
    'Plano de resgate disponível',
    'Comunicação entre equipe no solo e em altura'
  ],
  
  requiredImages: [
    'EPIs de proteção contra quedas',
    'Sistemas de ancoragem',
    'Linhas de vida',
    'Procedimentos de inspeção',
    'Exemplos de trabalho em altura'
  ],
  
  assessmentCriteria: {
    minScore: 80,
    minCompletionRate: 90,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  }
}
