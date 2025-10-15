
/**
 * NR-12: SEGURANÇA NO TRABALHO EM MÁQUINAS E EQUIPAMENTOS
 * Template de conformidade para treinamentos
 */

export const NR12_TEMPLATE = {
  nr: 'NR-12',
  name: 'Segurança em Máquinas e Equipamentos',
  description: 'Norma Regulamentadora sobre segurança no trabalho em máquinas e equipamentos',
  version: '2022',
  
  requiredTopics: [
    {
      id: 'nr12_intro',
      title: 'Introdução à NR-12',
      keywords: ['nr-12', 'norma regulamentadora', 'máquinas', 'equipamentos', 'segurança'],
      minDuration: 30, // segundos
      mandatory: true,
      description: 'Apresentação da NR-12 e seus objetivos'
    },
    {
      id: 'nr12_objetivos',
      title: 'Objetivos e Aplicação',
      keywords: ['objetivos', 'aplicação', 'abrangência', 'responsabilidades'],
      minDuration: 45,
      mandatory: true,
      description: 'Objetivos da norma e onde se aplica'
    },
    {
      id: 'nr12_arranjo',
      title: 'Arranjo Físico e Instalações',
      keywords: ['arranjo físico', 'instalações', 'espaço', 'layout', 'circulação'],
      minDuration: 60,
      mandatory: true,
      description: 'Requisitos para arranjo físico e instalações'
    },
    {
      id: 'nr12_dispositivos',
      title: 'Dispositivos de Segurança',
      keywords: ['dispositivos', 'proteção', 'segurança', 'barreiras', 'sensores'],
      minDuration: 90,
      mandatory: true,
      description: 'Tipos e uso de dispositivos de segurança'
    },
    {
      id: 'nr12_eletrico',
      title: 'Instalações e Dispositivos Elétricos',
      keywords: ['elétrico', 'instalações', 'energia', 'comandos', 'eletricidade'],
      minDuration: 60,
      mandatory: true,
      description: 'Segurança em instalações elétricas de máquinas'
    },
    {
      id: 'nr12_partida',
      title: 'Acionamento e Partida',
      keywords: ['acionamento', 'partida', 'parada', 'emergência', 'controle'],
      minDuration: 60,
      mandatory: true,
      description: 'Procedimentos de acionamento e parada de máquinas'
    },
    {
      id: 'nr12_procedimentos',
      title: 'Procedimentos de Trabalho e Segurança',
      keywords: ['procedimentos', 'trabalho', 'operação', 'manutenção', 'inspeção'],
      minDuration: 90,
      mandatory: true,
      description: 'Procedimentos operacionais e de segurança'
    },
    {
      id: 'nr12_capacitacao',
      title: 'Capacitação e Treinamento',
      keywords: ['capacitação', 'treinamento', 'qualificação', 'certificação', 'reciclagem'],
      minDuration: 60,
      mandatory: true,
      description: 'Requisitos de capacitação de operadores'
    }
  ],
  
  criticalPoints: [
    'Demonstração de dispositivos de proteção',
    'Procedimentos de bloqueio e etiquetagem (LOTO)',
    'Identificação de riscos específicos',
    'Medidas de proteção coletiva e individual',
    'Procedimentos de emergência'
  ],
  
  requiredImages: [
    'Exemplos de proteções de máquinas',
    'Dispositivos de segurança',
    'Sinalização de segurança',
    'EPIs específicos'
  ],
  
  assessmentCriteria: {
    minScore: 70,
    minCompletionRate: 80,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  }
}
