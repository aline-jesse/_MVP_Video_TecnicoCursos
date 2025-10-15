/**
 * NR-23: PROTEÇÃO CONTRA INCÊNDIOS
 * Template de conformidade para treinamentos
 */

export const NR23_TEMPLATE = {
  nr: 'NR-23',
  name: 'Proteção Contra Incêndios',
  description: 'Norma Regulamentadora sobre proteção contra incêndios',
  version: '2023',
  
  requiredTopics: [
    {
      id: 'nr23_intro',
      title: 'Introdução à NR-23',
      keywords: ['nr-23', 'proteção incêndios', 'prevenção incêndio', 'segurança contra fogo'],
      minDuration: 30,
      mandatory: true,
      description: 'Apresentação da NR-23 e conceitos básicos de proteção contra incêndios'
    },
    {
      id: 'nr23_teoria_fogo',
      title: 'Teoria do Fogo',
      keywords: ['teoria fogo', 'triângulo fogo', 'tetraedro fogo', 'combustão', 'combustível'],
      minDuration: 60,
      mandatory: true,
      description: 'Fundamentos da combustão e teoria do fogo'
    },
    {
      id: 'nr23_classes_incendio',
      title: 'Classes de Incêndio',
      keywords: ['classe a', 'classe b', 'classe c', 'classe d', 'classe k', 'tipos incêndio'],
      minDuration: 45,
      mandatory: true,
      description: 'Classificação dos diferentes tipos de incêndio'
    },
    {
      id: 'nr23_prevencao',
      title: 'Prevenção de Incêndios',
      keywords: ['prevenção', 'housekeeping', 'ordem limpeza', 'controle fontes ignição', 'manutenção'],
      minDuration: 75,
      mandatory: true,
      description: 'Medidas preventivas para evitar incêndios'
    },
    {
      id: 'nr23_extintores',
      title: 'Extintores de Incêndio',
      keywords: ['extintores', 'água', 'pó químico', 'co2', 'espuma', 'agente limpo'],
      minDuration: 90,
      mandatory: true,
      description: 'Tipos de extintores e sua aplicação'
    },
    {
      id: 'nr23_sistemas_fixos',
      title: 'Sistemas Fixos de Combate',
      keywords: ['sprinklers', 'hidrantes', 'mangueiras', 'sistemas fixos', 'rede hidráulica'],
      minDuration: 75,
      mandatory: true,
      description: 'Sistemas fixos de proteção e combate a incêndio'
    },
    {
      id: 'nr23_deteccao',
      title: 'Sistemas de Detecção',
      keywords: ['detectores fumaça', 'detectores calor', 'detectores chama', 'alarmes', 'central'],
      minDuration: 60,
      mandatory: true,
      description: 'Sistemas de detecção e alarme de incêndio'
    },
    {
      id: 'nr23_rotas_fuga',
      title: 'Rotas de Fuga e Saídas de Emergência',
      keywords: ['rotas fuga', 'saídas emergência', 'sinalização', 'iluminação emergência', 'evacuação'],
      minDuration: 60,
      mandatory: true,
      description: 'Planejamento e sinalização de rotas de evacuação'
    },
    {
      id: 'nr23_brigada',
      title: 'Brigada de Incêndio',
      keywords: ['brigada incêndio', 'brigadistas', 'treinamento brigada', 'organização brigada'],
      minDuration: 90,
      mandatory: true,
      description: 'Organização e treinamento de brigadas de incêndio'
    },
    {
      id: 'nr23_plano_emergencia',
      title: 'Plano de Emergência',
      keywords: ['plano emergência', 'procedimentos evacuação', 'ponto encontro', 'comunicação'],
      minDuration: 75,
      mandatory: true,
      description: 'Elaboração e implementação de planos de emergência'
    }
  ],
  
  criticalPoints: [
    'Uso correto de extintores de incêndio',
    'Identificação de classes de incêndio',
    'Procedimentos de evacuação',
    'Operação de hidrantes e mangueiras',
    'Reconhecimento de rotas de fuga',
    'Acionamento de alarmes de incêndio',
    'Técnicas básicas de combate ao fogo'
  ],
  
  requiredImages: [
    'Tipos de extintores de incêndio',
    'Sinalização de emergência',
    'Sistemas de hidrantes',
    'Rotas de fuga sinalizadas',
    'Equipamentos de detecção',
    'Procedimentos de evacuação'
  ],
  
  assessmentCriteria: {
    minScore: 80,
    minCompletionRate: 90,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  }
}