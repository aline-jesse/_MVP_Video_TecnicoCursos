/**
 * NR-06: EQUIPAMENTO DE PROTECAO INDIVIDUAL - EPI
 * Template de conformidade para treinamentos.
 * Texto mantido em ASCII para evitar problemas de encoding observados no historico do projeto.
 */

export type Nr06Topic = {
  id: string
  title: string
  keywords: string[]
  minDuration: number
  mandatory: boolean
  description: string
}

export const NR06_TEMPLATE = {
  nr: 'NR-06',
  name: 'Equipamento de Protecao Individual - EPI',
  description: 'Norma Regulamentadora sobre equipamentos de protecao individual',
  version: '2023',

  requiredTopics: [
    {
      id: 'nr06_intro',
      title: 'Introducao a NR-06',
      keywords: ['nr-06', 'epi', 'equipamento protecao individual', 'seguranca'],
      minDuration: 30,
      mandatory: true,
      description: 'Apresentacao da NR-06 e conceitos basicos de EPI',
    },
    {
      id: 'nr06_definicoes',
      title: 'Definicoes e Conceitos',
      keywords: ['definicoes', 'conceitos', 'epi', 'protecao', 'individual'],
      minDuration: 45,
      mandatory: true,
      description: 'Definicoes tecnicas e conceitos fundamentais',
    },
    {
      id: 'nr06_tipos',
      title: 'Tipos de EPI',
      keywords: [
        'tipos',
        'categorias',
        'protecao cabeca',
        'protecao olhos',
        'protecao respiratoria',
        'protecao auditiva',
        'protecao maos',
        'protecao pes',
      ],
      minDuration: 90,
      mandatory: true,
      description: 'Classificacao e tipos de equipamentos de protecao individual',
    },
    {
      id: 'nr06_selecao',
      title: 'Selecao e Especificacao',
      keywords: ['selecao', 'especificacao', 'analise riscos', 'adequacao', 'certificacao'],
      minDuration: 60,
      mandatory: true,
      description: 'Criterios para selecao e especificacao de EPIs',
    },
    {
      id: 'nr06_ca',
      title: 'Certificado de Aprovacao (CA)',
      keywords: ['ca', 'certificado aprovacao', 'validade', 'mte', 'inmetro'],
      minDuration: 45,
      mandatory: true,
      description: 'Sistema de certificacao e aprovacao de EPIs',
    },
    {
      id: 'nr06_fornecimento',
      title: 'Fornecimento e Distribuicao',
      keywords: ['fornecimento', 'distribuicao', 'gratuito', 'empregador', 'responsabilidades'],
      minDuration: 30,
      mandatory: true,
      description: 'Obrigacoes do empregador no fornecimento de EPIs',
    },
    {
      id: 'nr06_uso',
      title: 'Uso Correto e Conservacao',
      keywords: ['uso correto', 'conservacao', 'manutencao', 'higienizacao', 'armazenamento'],
      minDuration: 75,
      mandatory: true,
      description: 'Procedimentos para uso adequado e conservacao de EPIs',
    },
    {
      id: 'nr06_treinamento',
      title: 'Treinamento e Capacitacao',
      keywords: ['treinamento', 'capacitacao', 'orientacao', 'conscientizacao', 'reciclagem'],
      minDuration: 60,
      mandatory: true,
      description: 'Programas de treinamento e capacitacao para uso de EPIs',
    },
    {
      id: 'nr06_fiscalizacao',
      title: 'Fiscalizacao e Controle',
      keywords: ['fiscalizacao', 'controle', 'registro', 'documentacao', 'auditoria'],
      minDuration: 45,
      mandatory: true,
      description: 'Sistemas de controle e fiscalizacao do uso de EPIs',
    },
  ] as Nr06Topic[],

  criticalPoints: [
    'Demonstracao do uso correto de cada tipo de EPI',
    'Verificacao do Certificado de Aprovacao (CA)',
    'Procedimentos de higienizacao e conservacao',
    'Identificacao de EPIs danificados ou vencidos',
    'Responsabilidades do empregador e empregado',
    'Consequencias do nao uso de EPIs',
  ],

  requiredImages: [
    'Diferentes tipos de EPIs por categoria',
    'Certificado de Aprovacao (CA)',
    'Demonstracao de uso correto',
    'Procedimentos de conservacao',
    'EPIs danificados versus em bom estado',
  ],

  evaluationCriteria: {
    minimumScore: 0.8,
    requiresPracticalAssessment: true,
  },

  recommendedDurationHours: 6,
  lastUpdated: '2023-07-01',
};

export type Nr06Template = typeof NR06_TEMPLATE;
