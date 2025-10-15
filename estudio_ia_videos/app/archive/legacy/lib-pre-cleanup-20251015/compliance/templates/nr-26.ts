/**
 * NR-26: SINALIZAÇÃO DE SEGURANÇA
 * Template de conformidade para treinamentos
 */

export const NR26_TEMPLATE = {
  nr: 'NR-26',
  name: 'Sinalização de Segurança',
  description: 'Norma Regulamentadora sobre sinalização de segurança',
  version: '2023',
  
  requiredTopics: [
    {
      id: 'nr26_intro',
      title: 'Introdução à NR-26',
      keywords: ['nr-26', 'norma regulamentadora', 'sinalização', 'segurança', 'comunicação'],
      minDuration: 30,
      mandatory: true,
      weight: 10,
      description: 'Apresentação da NR-26 e sua importância'
    },
    {
      id: 'nr26_cores',
      title: 'Cores de Segurança',
      keywords: ['cores', 'vermelho', 'amarelo', 'verde', 'azul', 'branco', 'preto', 'laranja', 'púrpura'],
      minDuration: 90,
      mandatory: true,
      weight: 20,
      description: 'Significado e aplicação das cores de segurança'
    },
    {
      id: 'nr26_placas',
      title: 'Placas de Sinalização',
      keywords: ['placas', 'avisos', 'proibição', 'obrigação', 'alerta', 'emergência'],
      minDuration: 90,
      mandatory: true,
      weight: 20,
      description: 'Tipos e aplicação de placas de sinalização'
    },
    {
      id: 'nr26_rotulagem',
      title: 'Rotulagem Preventiva',
      keywords: ['rotulagem', 'rótulos', 'produtos químicos', 'substâncias', 'GHS', 'FDS'],
      minDuration: 90,
      mandatory: true,
      weight: 20,
      description: 'Rotulagem de produtos perigosos'
    },
    {
      id: 'nr26_simbolos',
      title: 'Símbolos de Segurança',
      keywords: ['símbolos', 'pictogramas', 'ícones', 'representação', 'universal'],
      minDuration: 60,
      mandatory: true,
      weight: 15,
      description: 'Símbolos e pictogramas de segurança'
    },
    {
      id: 'nr26_demarcacao',
      title: 'Demarcação de Áreas',
      keywords: ['demarcação', 'faixas', 'áreas', 'corredores', 'passagens', 'zonas'],
      minDuration: 60,
      mandatory: true,
      weight: 10,
      description: 'Demarcação de áreas e circulação'
    },
    {
      id: 'nr26_identificacao',
      title: 'Identificação de Tubulações',
      keywords: ['tubulações', 'dutos', 'canos', 'fluidos', 'identificação', 'cores'],
      minDuration: 45,
      mandatory: false,
      weight: 5,
      description: 'Sistema de identificação de tubulações'
    }
  ],
  
  criticalPoints: [
    'Significado de cada cor de segurança',
    'Diferença entre proibição, obrigação e alerta',
    'Interpretação de pictogramas GHS',
    'Importância da sinalização de emergência',
    'Consulta à Ficha de Dados de Segurança (FDS)'
  ],
  
  requiredImages: [
    'Tabela de cores de segurança',
    'Exemplos de placas de sinalização',
    'Pictogramas GHS',
    'Rótulos de produtos químicos',
    'Demarcação de áreas',
    'Símbolos de emergência'
  ],
  
  structureRules: {
    minSlides: 7,
    maxSlides: 15,
    minDuration: 480, // 8 minutos
    maxDuration: 2400, // 40 minutos
    requiredSequence: [
      'Introdução',
      'Cores de segurança',
      'Placas e símbolos',
      'Rotulagem preventiva'
    ]
  },
  
  assessmentCriteria: {
    minScore: 75,
    minCompletionRate: 85,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  },
  
  minimumScore: 75
}

export default NR26_TEMPLATE

