
/**
 * 🆕 NR Templates Expandidos - 5 Novos Modelos
 * NR17, NR18, NR20, NR23, NR31
 */

import { NRTemplate, NRTemplateSlide } from './nr-templates-complete'

// NR17 - Ergonomia
export const NR17_TEMPLATE: NRTemplate = {
  id: 'nr17-template',
  nr: 'NR17',
  title: 'NR17 - Ergonomia',
  description: 'Treinamento sobre princípios ergonômicos para adequação das condições de trabalho',
  category: 'Ergonomia e Saúde',
  thumbnailUrl: '/nr17-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 12,
    certificateTemplate: 'nr17-certificate',
    requiredScore: 70
  },
  compliance: {
    mteCertified: true,
    lastUpdate: '2025-10-02',
    version: '1.0.0',
    revisionNumber: 1
  },
  duration: 180,
  slides: [
    {
      title: 'Introdução à Ergonomia',
      content: 'A NR17 visa estabelecer parâmetros para adaptação das condições de trabalho às características psicofisiológicas dos trabalhadores.',
      duration: 25,
      audioText: 'Bem-vindos ao treinamento sobre a Norma Regulamentadora 17. A ergonomia busca adaptar o trabalho ao trabalhador, considerando suas características físicas e mentais para promover conforto, segurança e eficiência.',
      quizQuestions: [
        {
          question: 'Qual o principal objetivo da NR17?',
          options: [
            'Aumentar a produtividade',
            'Adaptar condições de trabalho às características dos trabalhadores',
            'Reduzir custos',
            'Modernizar equipamentos'
          ],
          correctAnswer: 1,
          explanation: 'A NR17 visa adaptar as condições de trabalho às características psicofisiológicas dos trabalhadores para promover conforto e prevenir doenças.'
        }
      ]
    },
    {
      title: 'Levantamento e Transporte de Cargas',
      content: 'Limites de peso para transporte manual: 60kg para homens e 20kg para mulheres. Técnicas corretas de levantamento.',
      duration: 25,
      audioText: 'O transporte manual de cargas deve respeitar limites de peso e técnicas adequadas. Sempre flexione os joelhos, mantenha as costas retas e use a força das pernas para levantar.',
    },
    {
      title: 'Mobiliário e Postos de Trabalho',
      content: 'Cadeiras, mesas e equipamentos devem ser ajustáveis e adequados às características dos trabalhadores.',
      duration: 25,
      audioText: 'Os postos de trabalho devem possuir mobiliário com dimensões e características adequadas, permitindo ajustes de altura, apoios para pés, e boa visualização de telas e documentos.',
    },
    {
      title: 'Equipamentos e Condições Ambientais',
      content: 'Iluminação adequada, níveis de ruído controlados, temperatura confortável e qualidade do ar.',
      duration: 25,
      audioText: 'As condições ambientais de trabalho devem estar adequadas às características psicofisiológicas dos trabalhadores, incluindo iluminação de 500 lux em escritórios, ruído abaixo de 65 dB, temperatura entre 20-23°C.',
    },
    {
      title: 'Organização do Trabalho',
      content: 'Pausas regulares, variação de tarefas e ritmo compatível com as capacidades humanas.',
      duration: 25,
      audioText: 'A organização do trabalho deve levar em conta as normas de produção, modo operatório, exigências de tempo, determinação do conteúdo de tempo, ritmo de trabalho e pausas. Recomenda-se pausa de 10 minutos a cada 50 minutos de digitação.',
      quizQuestions: [
        {
          question: 'Qual a pausa recomendada para trabalho de digitação?',
          options: [
            '5 minutos a cada hora',
            '10 minutos a cada 50 minutos',
            '15 minutos a cada 2 horas',
            'Sem necessidade de pausas'
          ],
          correctAnswer: 1,
          explanation: 'Para trabalhos de digitação contínua, recomenda-se pausa de 10 minutos a cada 50 minutos trabalhados.'
        }
      ]
    },
    {
      title: 'Análise Ergonômica do Trabalho (AET)',
      content: 'Metodologia para avaliar e adaptar as condições de trabalho, obrigatória quando há riscos ergonômicos.',
      duration: 25,
      audioText: 'A Análise Ergonômica do Trabalho é obrigatória quando há queixas de trabalhadores ou quando identificados riscos ergonômicos. Deve contemplar avaliação das condições de trabalho conforme estabelecido na norma.',
    },
    {
      title: 'Prevenção de LER/DORT',
      content: 'Lesões por Esforços Repetitivos e Distúrbios Osteomusculares Relacionados ao Trabalho: causas, sintomas e prevenção.',
      duration: 30,
      audioText: 'LER e DORT são causadas por esforços repetitivos, posturas inadequadas e falta de pausas. Os sintomas incluem dor, formigamento, perda de força e limitação de movimentos. A prevenção envolve ergonomia adequada, pausas e ginástica laboral.',
    }
  ]
}

// NR18 - Condições e Meio Ambiente de Trabalho na Indústria da Construção
export const NR18_TEMPLATE: NRTemplate = {
  id: 'nr18-template',
  nr: 'NR18',
  title: 'NR18 - Segurança na Construção Civil',
  description: 'Normas de segurança para trabalhos na indústria da construção civil',
  category: 'Construção Civil',
  thumbnailUrl: '/nr18-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 12,
    certificateTemplate: 'nr18-certificate',
    requiredScore: 75
  },
  compliance: {
    mteCertified: true,
    lastUpdate: '2025-10-02',
    version: '1.0.0',
    revisionNumber: 1
  },
  duration: 240,
  slides: [
    {
      title: 'Introdução à NR18',
      content: 'A NR18 estabelece diretrizes administrativas, de planejamento e organização para implementar medidas de controle e sistemas preventivos de segurança na construção civil.',
      duration: 30,
      audioText: 'A NR18 é específica para a indústria da construção, estabelecendo requisitos de segurança e saúde no trabalho em canteiros de obras. É uma das normas mais importantes do setor.',
    },
    {
      title: 'PCMAT - Programa de Condições e Meio Ambiente',
      content: 'Obrigatório para estabelecimentos com 20 ou mais trabalhadores. Elaborado por profissional habilitado.',
      duration: 30,
      audioText: 'O PCMAT é um programa obrigatório que estabelece condições e diretrizes de segurança no trabalho para canteiros de obras com 20 ou mais trabalhadores, contemplando as atividades a serem desenvolvidas no estabelecimento.',
      quizQuestions: [
        {
          question: 'O PCMAT é obrigatório a partir de quantos trabalhadores?',
          options: ['10', '15', '20', '25'],
          correctAnswer: 2,
          explanation: 'O PCMAT é obrigatório para estabelecimentos com 20 ou mais trabalhadores.'
        }
      ]
    },
    {
      title: 'Trabalho em Altura na Construção',
      content: 'Andaimes, plataformas elevadas, proteções contra quedas, linha de vida.',
      duration: 30,
      audioText: 'Todo trabalho em altura acima de 2 metros requer proteção coletiva (guarda-corpo, telas) e individual (cinto de segurança). Os andaimes devem ser montados por profissionais qualificados.',
    },
    {
      title: 'Escavações, Fundações e Demolições',
      content: 'Escoramento, sinalização, proteções laterais, rampas de acesso.',
      duration: 30,
      audioText: 'Escavações com mais de 1,25m de profundidade devem ter escoramento adequado. Demolições exigem projeto específico e isolamento da área. Verificar redes elétricas e de gás antes de iniciar.',
    },
    {
      title: 'Carpintaria, Armações de Aço e Concretagem',
      content: 'Proteção de máquinas e ferramentas, armazenamento de materiais, formas e escoramentos.',
      duration: 30,
      audioText: 'As máquinas e ferramentas da carpintaria devem ter proteções. Armazenar materiais de forma organizada e segura. O sistema de formas deve ser projetado para suportar as cargas de concretagem.',
    },
    {
      title: 'Instalações Elétricas Temporárias',
      content: 'Quadros elétricos, aterramento, proteção contra choques, iluminação.',
      duration: 30,
      audioText: 'As instalações elétricas temporárias devem ser executadas por profissional qualificado, seguir projeto específico, possuir aterramento e proteções contra choques elétricos e curto-circuitos.',
    },
    {
      title: 'Equipamentos de Proteção Individual',
      content: 'Capacete, luvas, botas, óculos, protetor auricular, cinto de segurança.',
      duration: 30,
      audioText: 'É obrigatório o uso de EPIs adequados a cada atividade: capacete em áreas de risco de queda de objetos, óculos para proteção contra partículas, botas com biqueira de aço, cinto de segurança para trabalho em altura.',
    },
    {
      title: 'Ordem e Limpeza no Canteiro',
      content: 'Organização de materiais, descarte adequado de resíduos, sinalização.',
      duration: 30,
      audioText: 'A ordem e limpeza são fundamentais para prevenir acidentes. Manter materiais organizados, vias de circulação desobstruídas, descartar resíduos em locais adequados e sinalizar áreas de risco.',
      quizQuestions: [
        {
          question: 'Por que a ordem e limpeza são importantes no canteiro?',
          options: [
            'Apenas para boa aparência',
            'Para prevenir acidentes e facilitar o trabalho',
            'Para economizar espaço',
            'Não são importantes'
          ],
          correctAnswer: 1,
          explanation: 'Ordem e limpeza previnem acidentes, facilitam a circulação e o trabalho, e são requisitos da NR18.'
        }
      ]
    }
  ]
}

// NR20 - Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis
export const NR20_TEMPLATE: NRTemplate = {
  id: 'nr20-template',
  nr: 'NR20',
  title: 'NR20 - Inflamáveis e Combustíveis',
  description: 'Segurança no trabalho com líquidos combustíveis e inflamáveis',
  category: 'Segurança Química',
  thumbnailUrl: '/nr20-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 36,
    certificateTemplate: 'nr20-certificate',
    requiredScore: 80
  },
  compliance: {
    mteCertified: true,
    lastUpdate: '2025-10-02',
    version: '1.0.0',
    revisionNumber: 1
  },
  duration: 240,
  slides: [
    {
      title: 'Introdução à NR20',
      content: 'Estabelece requisitos mínimos para gestão da segurança em instalações que armazenam, manipulam e transportam inflamáveis e combustíveis.',
      duration: 30,
      audioText: 'A NR20 estabelece requisitos para a gestão da segurança e saúde no trabalho com inflamáveis e combustíveis, visando prevenir acidentes graves como incêndios, explosões e vazamentos.',
    },
    {
      title: 'Classificação de Instalações',
      content: 'Classes I, II e III conforme quantidade, características e riscos dos produtos.',
      duration: 30,
      audioText: 'As instalações são classificadas em três classes conforme a atividade e quantidade armazenada. Classe I: até 2 mil litros, Classe II: acima de 2 mil até 60 mil litros, Classe III: acima de 60 mil litros ou que processam/refinam.',
      quizQuestions: [
        {
          question: 'Uma instalação com 50 mil litros de combustível é classe:',
          options: ['Classe I', 'Classe II', 'Classe III', 'Sem classificação'],
          correctAnswer: 1,
          explanation: 'Instalações com mais de 2 mil até 60 mil litros são Classe II.'
        }
      ]
    },
    {
      title: 'Propriedades dos Inflamáveis',
      content: 'Ponto de fulgor, limites de inflamabilidade, densidade de vapor, eletricidade estática.',
      duration: 30,
      audioText: 'Compreender as propriedades dos inflamáveis é essencial. Ponto de fulgor é a menor temperatura onde há formação de vapor inflamável. Vapores mais densos que o ar acumulam-se em níveis baixos, aumentando o risco.',
    },
    {
      title: 'Riscos e Cenários de Acidentes',
      content: 'Incêndio, explosão, vazamento, intoxicação, contaminação ambiental.',
      duration: 30,
      audioText: 'Os principais riscos são incêndio, explosão e vazamentos. Cenários incluem derramamento, falha de equipamentos, erro humano, ignição por fontes de calor ou eletricidade estática.',
    },
    {
      title: 'Medidas de Controle e Prevenção',
      content: 'Ventilação, aterramento, sinalização, detecção de gases, sistemas de combate a incêndio.',
      duration: 30,
      audioText: 'Medidas de controle incluem ventilação adequada, aterramento e ligação equipotencial, sinalização de segurança, sistemas de detecção de gases inflamáveis e detectores de fumaça e chama, além de sistemas de combate a incêndio.',
    },
    {
      title: 'Procedimentos Operacionais',
      content: 'Permissão de trabalho, análise de risco, liberação de equipamentos, isolamento e bloqueio.',
      duration: 30,
      audioText: 'Antes de qualquer intervenção, deve-se emitir permissão de trabalho, realizar análise de risco, isolar e bloquear energias perigosas, testar atmosfera e garantir condições seguras.',
      quizQuestions: [
        {
          question: 'Qual documento é obrigatório antes de intervenções em áreas com inflamáveis?',
          options: [
            'Ordem de serviço',
            'Permissão de trabalho',
            'Certificado de qualidade',
            'Nota fiscal'
          ],
          correctAnswer: 1,
          explanation: 'A permissão de trabalho é obrigatória para garantir que todas as medidas de segurança foram avaliadas e implementadas.'
        }
      ]
    },
    {
      title: 'Resposta a Emergências',
      content: 'Plano de Resposta a Emergências, brigada de incêndio, simulados, rotas de fuga.',
      duration: 30,
      audioText: 'Toda instalação classe II e III deve ter Plano de Resposta a Emergências detalhando ações em caso de vazamento, incêndio ou explosão. Realizar simulados periódicos e treinar equipes de resposta.',
    },
    {
      title: 'Capacitação de Trabalhadores',
      content: 'Treinamentos específicos conforme a classe da instalação e função do trabalhador.',
      duration: 30,
      audioText: 'Os trabalhadores devem receber capacitação conforme a classe da instalação e suas atividades. Treinamentos incluem riscos operacionais, controle de emergências, primeiros socorros e uso de EPIs.',
    }
  ]
}

// NR23 - Proteção Contra Incêndios
export const NR23_TEMPLATE: NRTemplate = {
  id: 'nr23-template',
  nr: 'NR23',
  title: 'NR23 - Proteção Contra Incêndios',
  description: 'Medidas de prevenção e combate a incêndios nos locais de trabalho',
  category: 'Prevenção de Incêndios',
  thumbnailUrl: '/nr23-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 12,
    certificateTemplate: 'nr23-certificate',
    requiredScore: 75
  },
  compliance: {
    mteCertified: true,
    lastUpdate: '2025-10-02',
    version: '1.0.0',
    revisionNumber: 1
  },
  duration: 120,
  slides: [
    {
      title: 'Introdução à Prevenção de Incêndios',
      content: 'A NR23 estabelece requisitos de proteção contra incêndio, saídas de emergência e equipamentos de combate.',
      duration: 20,
      audioText: 'A proteção contra incêndios visa prevenir a ocorrência de incêndios, facilitar a evacuação segura dos ocupantes e combater princípios de incêndio com equipamentos adequados.',
    },
    {
      title: 'Triângulo do Fogo',
      content: 'Três elementos necessários: combustível, comburente (oxigênio) e calor. Eliminando um deles, o fogo se extingue.',
      duration: 20,
      audioText: 'O fogo precisa de três elementos: combustível, oxigênio e calor. Para extinguir o fogo, basta eliminar um desses elementos através de resfriamento, abafamento ou retirada do material combustível.',
      quizQuestions: [
        {
          question: 'Quais são os elementos do triângulo do fogo?',
          options: [
            'Fogo, água e terra',
            'Combustível, oxigênio e calor',
            'Fumaça, chama e brasa',
            'Madeira, papel e plástico'
          ],
          correctAnswer: 1,
          explanation: 'Os três elementos essenciais do fogo são combustível, comburente (oxigênio) e calor.'
        }
      ]
    },
    {
      title: 'Classes de Incêndio',
      content: 'Classe A (sólidos), B (líquidos), C (elétricos), D (metais), K (cozinha).',
      duration: 20,
      audioText: 'Classe A: materiais sólidos como madeira e papel. Classe B: líquidos inflamáveis. Classe C: equipamentos elétricos energizados. Classe D: metais combustíveis. Classe K: óleos e gorduras de cozinha.',
    },
    {
      title: 'Extintores de Incêndio',
      content: 'Tipos: água, pó químico, CO2, espuma. Escolha conforme a classe do incêndio.',
      duration: 20,
      audioText: 'Extintores de água para classe A. Pó químico para A, B e C. CO2 para B e C (não deixa resíduos). Espuma para A e B. Nunca use água em incêndio elétrico. Lembre-se: Puxar o pino, Apontar para a base, Apertar o gatilho, Varrer.',
    },
    {
      title: 'Saídas de Emergência',
      content: 'Dimensionadas, sinalizadas, iluminadas e desobstruídas. Portas abrindo no sentido da saída.',
      duration: 15,
      audioText: 'As saídas de emergência devem estar sempre desobstruídas, sinalizadas com iluminação de emergência. As portas devem abrir facilmente no sentido do fluxo de saída. Largura mínima de 1,20m para corredores.',
    },
    {
      title: 'Sistemas de Alarme e Detecção',
      content: 'Detectores de fumaça, botões de alarme manual, sirenes audíveis em todo o local.',
      duration: 15,
      audioText: 'Sistemas de detecção precoce salvam vidas. Detectores de fumaça, calor ou chama acionam alarmes sonoros. Botões manuais devem estar acessíveis. O alarme deve ser audível em todos os pontos do estabelecimento.',
      quizQuestions: [
        {
          question: 'Qual a largura mínima de um corredor de saída de emergência?',
          options: ['80 cm', '1 metro', '1,20 metro', '1,50 metro'],
          correctAnswer: 2,
          explanation: 'A largura mínima de corredores que servem como saída de emergência é de 1,20 metro.'
        }
      ]
    },
    {
      title: 'Plano de Evacuação e Simulados',
      content: 'Rotas de fuga, pontos de encontro, responsáveis por áreas, simulados periódicos.',
      duration: 15,
      audioText: 'Todos devem conhecer o plano de evacuação: rotas principais e alternativas, pontos de encontro seguros, quem coordena a evacuação. Realizar simulados no mínimo uma vez por ano.',
    },
    {
      title: 'Brigada de Incêndio',
      content: 'Grupo treinado para prevenção, combate e evacuação. Obrigatória conforme legislação local.',
      duration: 15,
      audioText: 'A brigada de incêndio é composta por voluntários treinados para ações de prevenção, combate inicial e evacuação. Os brigadistas devem fazer curso específico e reciclagem anual.',
    }
  ]
}

// NR31 - Segurança e Saúde no Trabalho na Agricultura
export const NR31_TEMPLATE: NRTemplate = {
  id: 'nr31-template',
  nr: 'NR31',
  title: 'NR31 - Segurança no Trabalho Rural',
  description: 'Normas de segurança e saúde para trabalhadores rurais',
  category: 'Trabalho Rural',
  thumbnailUrl: '/nr31-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 12,
    certificateTemplate: 'nr31-certificate',
    requiredScore: 70
  },
  compliance: {
    mteCertified: true,
    lastUpdate: '2025-10-02',
    version: '1.0.0',
    revisionNumber: 1
  },
  duration: 210,
  slides: [
    {
      title: 'Introdução à NR31',
      content: 'Estabelece preceitos a serem observados na organização e no ambiente de trabalho rural.',
      duration: 30,
      audioText: 'A NR31 é específica para o trabalho na agricultura, pecuária, silvicultura, exploração florestal e aquicultura. Objetiva garantir segurança e saúde dos trabalhadores rurais.',
    },
    {
      title: 'Equipamentos, Ferramentas e Máquinas Agrícolas',
      content: 'Tratores, colheitadeiras, ferramentas manuais: uso seguro, manutenção e proteções.',
      duration: 30,
      audioText: 'Máquinas e equipamentos agrícolas devem ter dispositivos de segurança, manual de operação em português, e ser operados apenas por trabalhadores capacitados. Realizar manutenção preventiva regularmente.',
      quizQuestions: [
        {
          question: 'Quem pode operar máquinas agrícolas?',
          options: [
            'Qualquer trabalhador',
            'Apenas trabalhadores capacitados',
            'Somente o dono da propriedade',
            'Qualquer pessoa com carteira de motorista'
          ],
          correctAnswer: 1,
          explanation: 'Apenas trabalhadores capacitados e habilitados podem operar máquinas agrícolas.'
        }
      ]
    },
    {
      title: 'Agrotóxicos e Produtos Químicos',
      content: 'Armazenamento, manuseio, aplicação e descarte seguros. EPIs obrigatórios.',
      duration: 30,
      audioText: 'Os agrotóxicos devem ser armazenados em local exclusivo, ventilado e trancado. Ler sempre o rótulo e ficha de segurança. Usar EPIs completos durante manuseio e aplicação: luvas, botas, máscara, roupa impermeável. Respeitar período de reentrada.',
    },
    {
      title: 'Transporte de Trabalhadores',
      content: 'Veículos adequados, com assentos, proteções laterais e cobertura.',
      duration: 30,
      audioText: 'O transporte de trabalhadores deve ser feito em veículos adequados, com carroceria com cobertura, proteções laterais fixas, assentos estofados e cintos de segurança. Proibido transportar pessoas junto com animais ou produtos tóxicos.',
    },
    {
      title: 'Instalações Rurais',
      content: 'Alojamentos, refeitórios, sanitários, água potável, condições de higiene.',
      duration: 30,
      audioText: 'As instalações devem ser mantidas em condições adequadas de higiene, com água potável, sanitários separados por sexo, vestiários, refeitório e área de descanso. Alojamentos devem ter ventilação, iluminação e camas adequadas.',
    },
    {
      title: 'Trabalho em Espaços Confinados Rurais',
      content: 'Silos, tanques, estufas: riscos de asfixia, gases tóxicos, entrada segura.',
      duration: 30,
      audioText: 'Espaços confinados rurais como silos e tanques apresentam riscos de asfixia e gases tóxicos. Antes da entrada, medir a atmosfera, ventilar, usar EPIs respiratórios e ter vigia do lado de fora.',
      quizQuestions: [
        {
          question: 'O que deve ser feito antes de entrar em um silo?',
          options: [
            'Entrar diretamente',
            'Medir a atmosfera e ventilar',
            'Apenas avisar alguém',
            'Usar lanterna'
          ],
          correctAnswer: 1,
          explanation: 'Antes de entrar em espaços confinados como silos, deve-se medir a atmosfera, garantir ventilação adequada e usar equipamentos de proteção respiratória.'
        }
      ]
    },
    {
      title: 'Ergonomia e Organização do Trabalho Rural',
      content: 'Posturas adequadas, pausas, organização de tarefas, prevenção de lesões.',
      duration: 30,
      audioText: 'Evite posturas inadequadas em tarefas repetitivas. Organize o trabalho com pausas, variação de tarefas e ferramentas ergonômicas. Promova ginástica laboral e orientação sobre técnicas corretas de levantamento de peso.',
    }
  ]
}

// Exportar todos os novos templates
export const NR_TEMPLATES_EXPANDED = [
  NR17_TEMPLATE,
  NR18_TEMPLATE,
  NR20_TEMPLATE,
  NR23_TEMPLATE,
  NR31_TEMPLATE
]
