
/**
 * 📋 NR TEMPLATES EXPANSION
 * Novos templates NR7, NR9, NR11, NR13, NR15
 */

export interface NRTemplate {
  id: string
  nr: string
  title: string
  description: string
  category: string
  duration: number
  thumbnailUrl: string
  certification: {
    validityMonths: number
    requiredScore: number
  }
  compliance: {
    keywords: string[]
    requiredElements: string[]
    prohibitedContent: string[]
  }
  slides: NRSlide[]
}

export interface NRSlide {
  id: string
  type: 'intro' | 'content' | 'case' | 'quiz' | 'conclusion'
  title: string
  content: string
  media?: {
    type: 'image' | 'video' | '3d-avatar'
    url: string
  }
  voiceover?: {
    text: string
    provider: 'elevenlabs' | 'azure' | 'google'
    voiceId: string
  }
  duration: number
}

/**
 * NR-7: Programas de Controle Médico de Saúde Ocupacional (PCMSO)
 */
export const NR7_TEMPLATE: NRTemplate = {
  id: 'nr7-pcmso-2025',
  nr: 'NR-7',
  title: 'Programa de Controle Médico de Saúde Ocupacional (PCMSO)',
  description: 'Treinamento sobre exames médicos ocupacionais, monitoramento de saúde e prevenção de doenças ocupacionais.',
  category: 'Saúde Ocupacional',
  duration: 900, // 15 minutos
  thumbnailUrl: '/images/nr-templates/nr7-thumb.jpg',
  certification: {
    validityMonths: 12,
    requiredScore: 75,
  },
  compliance: {
    keywords: ['PCMSO', 'exame médico', 'saúde ocupacional', 'ASO', 'admissional', 'periódico', 'demissional'],
    requiredElements: [
      'Objetivos do PCMSO',
      'Tipos de exames médicos',
      'Atestado de Saúde Ocupacional (ASO)',
      'Periodicidade dos exames',
      'Direitos e deveres do trabalhador',
    ],
    prohibitedContent: ['informações médicas incorretas', 'dispensa de exames obrigatórios'],
  },
  slides: [
    {
      id: 'nr7-slide-1',
      type: 'intro',
      title: 'Bem-vindo ao Treinamento NR-7',
      content: 'Neste treinamento, você aprenderá sobre o Programa de Controle Médico de Saúde Ocupacional e a importância dos exames médicos no ambiente de trabalho.',
      media: {
        type: '3d-avatar',
        url: '/avatars/dr-safety.glb',
      },
      voiceover: {
        text: 'Bem-vindo ao treinamento sobre NR-7. O PCMSO é fundamental para proteger sua saúde no trabalho.',
        provider: 'elevenlabs',
        voiceId: 'rachel',
      },
      duration: 60,
    },
    {
      id: 'nr7-slide-2',
      type: 'content',
      title: 'O que é PCMSO?',
      content: 'O PCMSO é um programa que visa promover e preservar a saúde dos trabalhadores através de exames médicos periódicos e monitoramento de riscos ocupacionais.',
      media: {
        type: 'image',
        url: '/images/nr7/pcmso-overview.jpg',
      },
      voiceover: {
        text: 'O PCMSO monitora sua saúde através de exames regulares, identificando precocemente possíveis problemas relacionados ao trabalho.',
        provider: 'elevenlabs',
        voiceId: 'rachel',
      },
      duration: 90,
    },
    {
      id: 'nr7-slide-3',
      type: 'content',
      title: 'Tipos de Exames Médicos',
      content: `
        1. Admissional: antes de iniciar o trabalho
        2. Periódico: durante o contrato de trabalho
        3. Retorno ao trabalho: após afastamento superior a 30 dias
        4. Mudança de função: antes de alteração de função
        5. Demissional: até 10 dias do término do contrato
      `,
      media: {
        type: 'image',
        url: '/images/nr7/tipos-exames.jpg',
      },
      voiceover: {
        text: 'Existem cinco tipos de exames médicos ocupacionais. Cada um tem um objetivo específico na proteção da sua saúde.',
        provider: 'elevenlabs',
        voiceId: 'rachel',
      },
      duration: 120,
    },
    {
      id: 'nr7-slide-4',
      type: 'content',
      title: 'Atestado de Saúde Ocupacional (ASO)',
      content: 'O ASO é o documento que atesta que você está apto ou inapto para exercer suas funções. Deve ser emitido após cada exame médico.',
      media: {
        type: 'image',
        url: '/images/nr7/aso-documento.jpg',
      },
      voiceover: {
        text: 'O ASO é seu documento de aptidão para o trabalho. Guarde sempre uma cópia.',
        provider: 'elevenlabs',
        voiceId: 'rachel',
      },
      duration: 90,
    },
    {
      id: 'nr7-slide-5',
      type: 'case',
      title: 'Caso Real: Detecção Precoce',
      content: 'Um operário de metalúrgica descobriu perda auditiva inicial em exame periódico. Com o uso correto de EPI auditivo e acompanhamento médico, evitou a progressão da doença.',
      media: {
        type: 'video',
        url: '/videos/nr7/caso-auditivo.mp4',
      },
      duration: 120,
    },
    {
      id: 'nr7-slide-6',
      type: 'quiz',
      title: 'Quiz de Avaliação',
      content: 'Teste seus conhecimentos sobre o PCMSO',
      duration: 180,
    },
    {
      id: 'nr7-slide-7',
      type: 'conclusion',
      title: 'Conclusão',
      content: 'O PCMSO é essencial para sua saúde ocupacional. Sempre participe dos exames médicos e mantenha sua documentação em dia.',
      media: {
        type: '3d-avatar',
        url: '/avatars/dr-safety.glb',
      },
      voiceover: {
        text: 'Parabéns por concluir o treinamento! Lembre-se: sua saúde é prioridade.',
        provider: 'elevenlabs',
        voiceId: 'rachel',
      },
      duration: 60,
    },
  ],
}

/**
 * NR-9: Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos
 */
export const NR9_TEMPLATE: NRTemplate = {
  id: 'nr9-riscos-ambientais-2025',
  nr: 'NR-9',
  title: 'Avaliação e Controle de Riscos Ambientais',
  description: 'Identificação, avaliação e controle de riscos físicos, químicos e biológicos no ambiente de trabalho.',
  category: 'Higiene Ocupacional',
  duration: 1200, // 20 minutos
  thumbnailUrl: '/images/nr-templates/nr9-thumb.jpg',
  certification: {
    validityMonths: 12,
    requiredScore: 80,
  },
  compliance: {
    keywords: ['PGR', 'riscos ambientais', 'agentes físicos', 'agentes químicos', 'agentes biológicos', 'exposição ocupacional'],
    requiredElements: [
      'Identificação de riscos ambientais',
      'Medidas de controle',
      'EPI adequado',
      'Monitoramento ambiental',
      'Limites de tolerância',
    ],
    prohibitedContent: ['exposição inadequada', 'falta de controle de riscos'],
  },
  slides: [
    {
      id: 'nr9-slide-1',
      type: 'intro',
      title: 'Riscos Ambientais no Trabalho',
      content: 'Aprenda a identificar e controlar riscos físicos, químicos e biológicos no seu ambiente de trabalho.',
      media: {
        type: '3d-avatar',
        url: '/avatars/safety-expert.glb',
      },
      voiceover: {
        text: 'Vamos aprender sobre os riscos ambientais que podem afetar sua saúde no trabalho.',
        provider: 'elevenlabs',
        voiceId: 'adam',
      },
      duration: 60,
    },
    {
      id: 'nr9-slide-2',
      type: 'content',
      title: 'Agentes Físicos',
      content: `
        - Ruído
        - Vibrações
        - Temperaturas extremas
        - Radiações
        - Pressões anormais
      `,
      media: {
        type: 'image',
        url: '/images/nr9/agentes-fisicos.jpg',
      },
      voiceover: {
        text: 'Agentes físicos incluem ruído, vibrações e temperaturas extremas. Todos exigem proteção adequada.',
        provider: 'elevenlabs',
        voiceId: 'adam',
      },
      duration: 120,
    },
    {
      id: 'nr9-slide-3',
      type: 'content',
      title: 'Agentes Químicos',
      content: `
        - Poeiras
        - Fumos
        - Névoas
        - Gases
        - Vapores
      `,
      media: {
        type: 'image',
        url: '/images/nr9/agentes-quimicos.jpg',
      },
      voiceover: {
        text: 'Agentes químicos podem ser inalados, absorvidos pela pele ou ingeridos. Use sempre EPI adequado.',
        provider: 'elevenlabs',
        voiceId: 'adam',
      },
      duration: 120,
    },
    {
      id: 'nr9-slide-4',
      type: 'content',
      title: 'Agentes Biológicos',
      content: `
        - Bactérias
        - Vírus
        - Fungos
        - Parasitas
      `,
      media: {
        type: 'image',
        url: '/images/nr9/agentes-biologicos.jpg',
      },
      voiceover: {
        text: 'Agentes biológicos são microorganismos que podem causar doenças. Higiene e vacinação são essenciais.',
        provider: 'elevenlabs',
        voiceId: 'adam',
      },
      duration: 120,
    },
    {
      id: 'nr9-slide-5',
      type: 'content',
      title: 'Hierarquia de Controles',
      content: `
        1. Eliminação do risco
        2. Substituição por alternativa mais segura
        3. Controles de engenharia
        4. Controles administrativos
        5. Equipamentos de Proteção Individual (EPI)
      `,
      media: {
        type: 'image',
        url: '/images/nr9/hierarquia-controles.jpg',
      },
      voiceover: {
        text: 'A hierarquia de controles prioriza eliminar o risco. EPI é a última linha de defesa.',
        provider: 'elevenlabs',
        voiceId: 'adam',
      },
      duration: 150,
    },
    {
      id: 'nr9-slide-6',
      type: 'case',
      title: 'Caso Real: Controle de Ruído',
      content: 'Uma fábrica reduziu o ruído de 95 dB para 80 dB através de isolamento acústico, eliminando a necessidade de protetores auriculares em determinadas áreas.',
      media: {
        type: 'video',
        url: '/videos/nr9/caso-ruido.mp4',
      },
      duration: 150,
    },
    {
      id: 'nr9-slide-7',
      type: 'quiz',
      title: 'Avaliação de Conhecimentos',
      content: 'Teste seus conhecimentos sobre riscos ambientais',
      duration: 240,
    },
    {
      id: 'nr9-slide-8',
      type: 'conclusion',
      title: 'Mantenha-se Seguro',
      content: 'A identificação e controle de riscos ambientais protegem sua saúde a longo prazo. Sempre reporte condições inseguras.',
      media: {
        type: '3d-avatar',
        url: '/avatars/safety-expert.glb',
      },
      voiceover: {
        text: 'Parabéns! Agora você sabe como identificar e controlar riscos ambientais no trabalho.',
        provider: 'elevenlabs',
        voiceId: 'adam',
      },
      duration: 60,
    },
  ],
}

/**
 * NR-11: Transporte, Movimentação, Armazenagem e Manuseio de Materiais
 */
export const NR11_TEMPLATE: NRTemplate = {
  id: 'nr11-empilhadeiras-2025',
  nr: 'NR-11',
  title: 'Segurança em Transporte e Movimentação de Materiais',
  description: 'Operação segura de empilhadeiras, pontes rolantes e equipamentos de movimentação de cargas.',
  category: 'Operação de Equipamentos',
  duration: 1080, // 18 minutos
  thumbnailUrl: '/images/nr-templates/nr11-thumb.jpg',
  certification: {
    validityMonths: 24,
    requiredScore: 85,
  },
  compliance: {
    keywords: ['empilhadeira', 'ponte rolante', 'transporte de carga', 'movimentação', 'armazenagem', 'capacidade de carga'],
    requiredElements: [
      'Inspeção pré-operacional',
      'Capacidade de carga',
      'Estabilidade de carga',
      'Rotas de transporte',
      'Procedimentos de emergência',
    ],
    prohibitedContent: ['excesso de carga', 'operação sem habilitação', 'manutenção inadequada'],
  },
  slides: [
    {
      id: 'nr11-slide-1',
      type: 'intro',
      title: 'Segurança em Movimentação de Cargas',
      content: 'Aprenda as melhores práticas para operar equipamentos de movimentação de forma segura e eficiente.',
      media: {
        type: '3d-avatar',
        url: '/avatars/forklift-operator.glb',
      },
      voiceover: {
        text: 'Bem-vindo ao treinamento de movimentação segura de materiais. Sua segurança começa aqui.',
        provider: 'elevenlabs',
        voiceId: 'antoni',
      },
      duration: 60,
    },
    // ... mais slides seguindo o padrão
  ],
}

/**
 * NR-13: Caldeiras, Vasos de Pressão, Tubulações e Tanques Metálicos de Armazenamento
 */
export const NR13_TEMPLATE: NRTemplate = {
  id: 'nr13-caldeiras-2025',
  nr: 'NR-13',
  title: 'Segurança em Caldeiras e Vasos de Pressão',
  description: 'Operação, manutenção e inspeção segura de equipamentos pressurizados.',
  category: 'Equipamentos Especiais',
  duration: 1800, // 30 minutos
  thumbnailUrl: '/images/nr-templates/nr13-thumb.jpg',
  certification: {
    validityMonths: 12,
    requiredScore: 90,
  },
  compliance: {
    keywords: ['caldeira', 'vaso de pressão', 'pressão', 'válvula de segurança', 'inspeção', 'manutenção'],
    requiredElements: [
      'Princípios de operação',
      'Dispositivos de segurança',
      'Procedimentos de emergência',
      'Inspeções periódicas',
      'Manutenção preventiva',
    ],
    prohibitedContent: ['operação acima da pressão máxima', 'bypass de válvulas de segurança'],
  },
  slides: [
    {
      id: 'nr13-slide-1',
      type: 'intro',
      title: 'Caldeiras e Vasos de Pressão',
      content: 'Equipamentos pressurizados requerem conhecimento técnico e atenção constante. Vamos aprender sobre segurança.',
      media: {
        type: '3d-avatar',
        url: '/avatars/boiler-specialist.glb',
      },
      voiceover: {
        text: 'A operação segura de caldeiras e vasos de pressão exige treinamento especializado. Vamos começar.',
        provider: 'elevenlabs',
        voiceId: 'josh',
      },
      duration: 60,
    },
    // ... mais slides
  ],
}

/**
 * NR-15: Atividades e Operações Insalubres
 */
export const NR15_TEMPLATE: NRTemplate = {
  id: 'nr15-insalubridade-2025',
  nr: 'NR-15',
  title: 'Atividades e Operações Insalubres',
  description: 'Identificação, avaliação e controle de condições insalubres no ambiente de trabalho.',
  category: 'Saúde e Higiene',
  duration: 1320, // 22 minutos
  thumbnailUrl: '/images/nr-templates/nr15-thumb.jpg',
  certification: {
    validityMonths: 12,
    requiredScore: 80,
  },
  compliance: {
    keywords: ['insalubridade', 'adicional insalubridade', 'limites de tolerância', 'grau de insalubridade', 'laudo técnico'],
    requiredElements: [
      'Conceito de insalubridade',
      'Limites de tolerância',
      'Graus de insalubridade',
      'Direitos do trabalhador',
      'Medidas de controle',
    ],
    prohibitedContent: ['exposição sem controle', 'negação de direitos'],
  },
  slides: [
    {
      id: 'nr15-slide-1',
      type: 'intro',
      title: 'Atividades Insalubres',
      content: 'Entenda o que são atividades insalubres, seus riscos e seus direitos como trabalhador exposto.',
      media: {
        type: '3d-avatar',
        url: '/avatars/health-specialist.glb',
      },
      voiceover: {
        text: 'Vamos aprender sobre insalubridade e como proteger sua saúde em ambientes desafiadores.',
        provider: 'elevenlabs',
        voiceId: 'bella',
      },
      duration: 60,
    },
    // ... mais slides
  ],
}

/**
 * Export all new templates
 */
export const NEW_NR_TEMPLATES = [
  NR7_TEMPLATE,
  NR9_TEMPLATE,
  NR11_TEMPLATE,
  NR13_TEMPLATE,
  NR15_TEMPLATE,
]

/**
 * Template metadata for gallery
 */
export const NR_TEMPLATES_METADATA = {
  total: 15,
  new: 5,
  categories: [
    'Saúde Ocupacional',
    'Higiene Ocupacional',
    'Operação de Equipamentos',
    'Equipamentos Especiais',
    'Saúde e Higiene',
  ],
  averageDuration: 1080, // 18 minutos
}
