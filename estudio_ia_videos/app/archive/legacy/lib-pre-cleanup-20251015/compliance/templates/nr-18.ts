/**
 * NR-18: CONDIÇÕES E MEIO AMBIENTE DE TRABALHO NA INDÚSTRIA DA CONSTRUÇÃO
 * Template de conformidade para treinamentos
 */

export const NR18_TEMPLATE = {
  nr: 'NR-18',
  name: 'Condições e Meio Ambiente de Trabalho na Indústria da Construção',
  description: 'Norma Regulamentadora sobre condições e meio ambiente de trabalho na construção civil',
  version: '2023',
  
  requiredTopics: [
    {
      id: 'nr18_intro',
      title: 'Introdução à NR-18',
      keywords: ['nr-18', 'construção civil', 'segurança construção', 'canteiro obras'],
      minDuration: 30,
      mandatory: true,
      description: 'Apresentação da NR-18 e conceitos básicos de segurança na construção'
    },
    {
      id: 'nr18_pcmat',
      title: 'PCMAT - Programa de Condições e Meio Ambiente',
      keywords: ['pcmat', 'programa condições', 'meio ambiente trabalho', 'planejamento segurança'],
      minDuration: 60,
      mandatory: true,
      description: 'Programa de Condições e Meio Ambiente de Trabalho na Indústria da Construção'
    },
    {
      id: 'nr18_areas_vivencia',
      title: 'Áreas de Vivência',
      keywords: ['áreas vivência', 'instalações sanitárias', 'vestiário', 'alojamento', 'refeitório'],
      minDuration: 45,
      mandatory: true,
      description: 'Requisitos para áreas de vivência em canteiros de obras'
    },
    {
      id: 'nr18_demolição',
      title: 'Demolição',
      keywords: ['demolição', 'estruturas', 'planejamento demolição', 'segurança demolição'],
      minDuration: 60,
      mandatory: true,
      description: 'Procedimentos seguros para trabalhos de demolição'
    },
    {
      id: 'nr18_escavacoes',
      title: 'Escavações',
      keywords: ['escavações', 'taludes', 'escoramento', 'estabilidade solo'],
      minDuration: 75,
      mandatory: true,
      description: 'Segurança em trabalhos de escavação e movimentação de terra'
    },
    {
      id: 'nr18_fundacoes',
      title: 'Fundações',
      keywords: ['fundações', 'estacas', 'tubulões', 'segurança fundações'],
      minDuration: 60,
      mandatory: true,
      description: 'Procedimentos seguros para execução de fundações'
    },
    {
      id: 'nr18_estruturas_concreto',
      title: 'Estruturas de Concreto',
      keywords: ['concreto', 'formas', 'armação', 'concretagem', 'escoramento'],
      minDuration: 90,
      mandatory: true,
      description: 'Segurança na execução de estruturas de concreto'
    },
    {
      id: 'nr18_trabalho_altura',
      title: 'Trabalho em Altura na Construção',
      keywords: ['trabalho altura', 'andaimes', 'plataformas', 'proteção quedas'],
      minDuration: 120,
      mandatory: true,
      description: 'Procedimentos específicos para trabalho em altura na construção'
    },
    {
      id: 'nr18_instalacoes_eletricas',
      title: 'Instalações Elétricas Temporárias',
      keywords: ['instalações elétricas', 'eletricidade canteiro', 'quadros elétricos', 'aterramento'],
      minDuration: 60,
      mandatory: true,
      description: 'Segurança em instalações elétricas temporárias de canteiro'
    },
    {
      id: 'nr18_maquinas_equipamentos',
      title: 'Máquinas e Equipamentos',
      keywords: ['máquinas construção', 'equipamentos', 'operação segura', 'manutenção'],
      minDuration: 75,
      mandatory: true,
      description: 'Operação segura de máquinas e equipamentos na construção'
    }
  ],
  
  criticalPoints: [
    'Uso correto de EPIs na construção civil',
    'Procedimentos de trabalho em altura',
    'Instalação e uso de andaimes',
    'Sinalização e isolamento de áreas de risco',
    'Procedimentos de escavação segura',
    'Operação de máquinas e equipamentos',
    'Instalações elétricas temporárias seguras'
  ],
  
  requiredImages: [
    'EPIs específicos para construção civil',
    'Andaimes e plataformas de trabalho',
    'Sinalização de segurança em canteiros',
    'Áreas de vivência adequadas',
    'Procedimentos de escavação',
    'Instalações elétricas temporárias'
  ],
  
  assessmentCriteria: {
    minScore: 85,
    minCompletionRate: 95,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  }
}