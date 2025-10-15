/**
 * NR-24: CONDIÇÕES SANITÁRIAS E DE CONFORTO NOS LOCAIS DE TRABALHO
 * Template de conformidade para treinamentos
 */

export const NR24_TEMPLATE = {
  nr: 'NR-24',
  name: 'Condições Sanitárias e de Conforto',
  description: 'Norma Regulamentadora sobre condições sanitárias e de conforto nos locais de trabalho',
  version: '2023',
  
  requiredTopics: [
    {
      id: 'nr24_intro',
      title: 'Introdução à NR-24',
      keywords: ['nr-24', 'norma regulamentadora', 'condições sanitárias', 'conforto', 'higiene'],
      minDuration: 30,
      mandatory: true,
      weight: 10,
      description: 'Apresentação da NR-24 e seus objetivos'
    },
    {
      id: 'nr24_instalacoes',
      title: 'Instalações Sanitárias',
      keywords: ['instalações', 'banheiros', 'sanitários', 'vestiários', 'chuveiros', 'lavatórios'],
      minDuration: 60,
      mandatory: true,
      weight: 20,
      description: 'Requisitos para instalações sanitárias'
    },
    {
      id: 'nr24_vestiarios',
      title: 'Vestiários',
      keywords: ['vestiários', 'armários', 'cabides', 'bancos', 'separação'],
      minDuration: 45,
      mandatory: true,
      weight: 15,
      description: 'Características dos vestiários'
    },
    {
      id: 'nr24_refeitorio',
      title: 'Refeitórios',
      keywords: ['refeitório', 'alimentação', 'refeições', 'cozinha', 'copa', 'lanchonete'],
      minDuration: 60,
      mandatory: true,
      weight: 15,
      description: 'Condições dos refeitórios e áreas de alimentação'
    },
    {
      id: 'nr24_cozinha',
      title: 'Cozinhas',
      keywords: ['cozinha', 'preparo', 'alimentos', 'higiene', 'conservação', 'armazenamento'],
      minDuration: 45,
      mandatory: true,
      weight: 10,
      description: 'Requisitos para cozinhas e preparo de alimentos'
    },
    {
      id: 'nr24_agua',
      title: 'Fornecimento de Água Potável',
      keywords: ['água potável', 'bebedouros', 'copos', 'higiene', 'qualidade da água'],
      minDuration: 30,
      mandatory: true,
      weight: 10,
      description: 'Fornecimento adequado de água potável'
    },
    {
      id: 'nr24_alojamento',
      title: 'Alojamentos',
      keywords: ['alojamento', 'dormitório', 'camas', 'beliches', 'ventilação', 'iluminação'],
      minDuration: 45,
      mandatory: false,
      weight: 10,
      description: 'Condições de alojamentos quando aplicável'
    },
    {
      id: 'nr24_limpeza',
      title: 'Limpeza e Conservação',
      keywords: ['limpeza', 'conservação', 'manutenção', 'higienização', 'desinfecção'],
      minDuration: 45,
      mandatory: true,
      weight: 10,
      description: 'Procedimentos de limpeza e conservação'
    }
  ],
  
  criticalPoints: [
    'Quantidade adequada de sanitários por trabalhadores',
    'Separação por sexo das instalações',
    'Limpeza e conservação diária',
    'Água potável e fresca',
    'Condições higiênicas de refeitórios'
  ],
  
  requiredImages: [
    'Instalações sanitárias adequadas',
    'Vestiários organizados',
    'Refeitórios limpos',
    'Bebedouros higienizados',
    'Cozinha industrial'
  ],
  
  structureRules: {
    minSlides: 8,
    maxSlides: 15,
    minDuration: 420, // 7 minutos
    maxDuration: 1800, // 30 minutos
    requiredSequence: [
      'Introdução',
      'Instalações sanitárias',
      'Áreas de alimentação',
      'Higiene e conservação'
    ]
  },
  
  assessmentCriteria: {
    minScore: 70,
    minCompletionRate: 80,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  },
  
  minimumScore: 70
}

export default NR24_TEMPLATE

