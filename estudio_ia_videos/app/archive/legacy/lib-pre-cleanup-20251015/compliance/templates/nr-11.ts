/**
 * NR-11: TRANSPORTE, MOVIMENTAÇÃO, ARMAZENAGEM E MANUSEIO DE MATERIAIS
 * Template de conformidade para treinamentos
 */

export const NR11_TEMPLATE = {
  nr: 'NR-11',
  name: 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais',
  description: 'Norma Regulamentadora sobre segurança no transporte, movimentação, armazenagem e manuseio de materiais',
  version: '2022',
  minimumScore: 75,
  
  requiredTopics: [
    {
      id: 'nr11_intro',
      title: 'Introdução à NR-11',
      keywords: ['nr-11', 'norma regulamentadora', 'transporte', 'movimentação', 'materiais'],
      weight: 10,
      mandatory: true,
      description: 'Apresentação da NR-11 e seus objetivos'
    },
    {
      id: 'nr11_objetivos',
      title: 'Objetivos e Campo de Aplicação',
      keywords: ['objetivos', 'aplicação', 'abrangência', 'responsabilidades', 'empregador'],
      weight: 15,
      mandatory: true,
      description: 'Objetivos da norma e onde se aplica'
    },
    {
      id: 'nr11_equipamentos',
      title: 'Equipamentos de Transporte e Movimentação',
      keywords: ['equipamentos', 'empilhadeiras', 'guindastes', 'talhas', 'pontes rolantes'],
      weight: 20,
      mandatory: true,
      description: 'Tipos de equipamentos e suas características de segurança'
    },
    {
      id: 'nr11_operacao',
      title: 'Operação Segura de Equipamentos',
      keywords: ['operação', 'condução', 'manobras', 'velocidade', 'carga máxima'],
      weight: 25,
      mandatory: true,
      description: 'Procedimentos seguros para operação de equipamentos'
    },
    {
      id: 'nr11_armazenagem',
      title: 'Armazenagem e Estocagem',
      keywords: ['armazenagem', 'estocagem', 'empilhamento', 'estabilidade', 'altura'],
      weight: 15,
      mandatory: true,
      description: 'Técnicas seguras de armazenagem e estocagem'
    },
    {
      id: 'nr11_manuseio',
      title: 'Manuseio Manual de Cargas',
      keywords: ['manuseio manual', 'levantamento', 'transporte', 'ergonomia', 'peso'],
      weight: 20,
      mandatory: true,
      description: 'Técnicas corretas para manuseio manual de materiais'
    },
    {
      id: 'nr11_capacitacao',
      title: 'Capacitação e Treinamento',
      keywords: ['capacitação', 'treinamento', 'habilitação', 'certificação', 'reciclagem'],
      weight: 15,
      mandatory: true,
      description: 'Requisitos de capacitação para operadores'
    }
  ],
  
  criticalPoints: [
    'Demonstração de técnicas corretas de levantamento',
    'Procedimentos de inspeção de equipamentos',
    'Limites de peso para manuseio manual',
    'Uso correto de EPIs específicos',
    'Procedimentos de emergência e primeiros socorros',
    'Sinalização e isolamento de áreas'
  ],
  
  structureRules: {
    minSlides: 8,
    maxSlides: 25,
    minDuration: 900, // 15 minutos
    maxDuration: 2400, // 40 minutos
    requiredOrder: ['intro', 'objetivos', 'equipamentos'], // tópicos que devem estar nessa ordem
  },
  
  keyPhrases: [
    'Norma Regulamentadora 11',
    'NR-11',
    'Ministério do Trabalho',
    'segurança na movimentação de cargas',
    'prevenção de acidentes',
    'responsabilidade do empregador',
    'responsabilidade do empregado',
    'equipamentos de transporte',
    'manuseio manual',
    'armazenagem segura'
  ],

  requiredImages: [
    'Equipamentos de movimentação (empilhadeiras, guindastes)',
    'Técnicas corretas de levantamento manual',
    'Exemplos de armazenagem adequada',
    'EPIs específicos para movimentação',
    'Sinalização de segurança',
    'Procedimentos de inspeção'
  ],
  
  assessmentCriteria: {
    minScore: 75,
    minCompletionRate: 85,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true,
    practicalDemonstration: true
  },

  specificRequirements: {
    weightLimits: {
      homem_adulto: 23, // kg
      mulher_adulta: 20, // kg
      menor_18_anos: 'proibido transporte manual'
    },
    equipmentInspection: [
      'Inspeção diária obrigatória',
      'Registro de manutenção',
      'Certificação periódica'
    ],
    operatorRequirements: [
      'Maior de 18 anos',
      'Treinamento específico',
      'Exame médico ocupacional',
      'Certificação de habilitação'
    ]
  }
};