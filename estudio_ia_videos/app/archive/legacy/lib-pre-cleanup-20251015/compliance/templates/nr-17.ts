/**
 * NR-17: ERGONOMIA
 * Template de conformidade para treinamentos
 */

export const NR17_TEMPLATE = {
  nr: 'NR-17',
  name: 'Ergonomia',
  description: 'Norma Regulamentadora sobre ergonomia no ambiente de trabalho',
  version: '2023',
  
  requiredTopics: [
    {
      id: 'nr17_intro',
      title: 'Introdução à NR-17',
      keywords: ['nr-17', 'norma regulamentadora', 'ergonomia', 'conforto', 'saúde'],
      minDuration: 30,
      mandatory: true,
      weight: 10,
      description: 'Apresentação da NR-17 e seus objetivos'
    },
    {
      id: 'nr17_objetivos',
      title: 'Objetivos da Ergonomia',
      keywords: ['objetivos', 'finalidade', 'bem-estar', 'produtividade', 'saúde ocupacional'],
      minDuration: 45,
      mandatory: true,
      weight: 10,
      description: 'Objetivos e importância da ergonomia'
    },
    {
      id: 'nr17_levantamento',
      title: 'Levantamento de Cargas',
      keywords: ['levantamento', 'transporte', 'descarga', 'cargas', 'peso', 'postura'],
      minDuration: 90,
      mandatory: true,
      weight: 15,
      description: 'Técnicas corretas de levantamento e transporte de cargas'
    },
    {
      id: 'nr17_mobiliario',
      title: 'Mobiliário dos Postos de Trabalho',
      keywords: ['mobiliário', 'cadeira', 'mesa', 'bancada', 'altura', 'ajustes'],
      minDuration: 60,
      mandatory: true,
      weight: 15,
      description: 'Requisitos para mobiliário ergonômico'
    },
    {
      id: 'nr17_equipamentos',
      title: 'Equipamentos dos Postos de Trabalho',
      keywords: ['equipamentos', 'teclado', 'monitor', 'mouse', 'iluminação', 'posicionamento'],
      minDuration: 60,
      mandatory: true,
      weight: 10,
      description: 'Ergonomia de equipamentos e dispositivos'
    },
    {
      id: 'nr17_condicoes',
      title: 'Condições Ambientais de Trabalho',
      keywords: ['temperatura', 'umidade', 'iluminação', 'ruído', 'ventilação', 'ambiente'],
      minDuration: 60,
      mandatory: true,
      weight: 10,
      description: 'Condições ambientais adequadas'
    },
    {
      id: 'nr17_organizacao',
      title: 'Organização do Trabalho',
      keywords: ['organização', 'ritmo', 'pausas', 'jornada', 'trabalho repetitivo', 'descanso'],
      minDuration: 90,
      mandatory: true,
      weight: 15,
      description: 'Organização ergonômica do trabalho'
    },
    {
      id: 'nr17_aer',
      title: 'Análise Ergonômica do Trabalho (AET)',
      keywords: ['AET', 'análise ergonômica', 'avaliação', 'diagnóstico', 'relatório'],
      minDuration: 60,
      mandatory: true,
      weight: 15,
      description: 'Metodologia de Análise Ergonômica'
    }
  ],
  
  criticalPoints: [
    'Demonstração de técnicas corretas de levantamento de cargas',
    'Ajustes ergonômicos de cadeira e mesa',
    'Identificação de riscos ergonômicos',
    'Importância das pausas e ginástica laboral',
    'Prevenção de LER/DORT'
  ],
  
  requiredImages: [
    'Postura correta para levantamento de cargas',
    'Ajustes de cadeira ergonômica',
    'Posicionamento correto de monitor e teclado',
    'Exemplos de LER/DORT',
    'Exercícios de ginástica laboral'
  ],
  
  structureRules: {
    minSlides: 8,
    maxSlides: 20,
    minDuration: 600, // 10 minutos
    maxDuration: 3600, // 60 minutos
    requiredSequence: [
      'Introdução',
      'Conceitos fundamentais',
      'Aplicação prática',
      'Exercícios práticos',
      'Avaliação'
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

export default NR17_TEMPLATE

