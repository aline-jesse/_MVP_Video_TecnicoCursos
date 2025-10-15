
/**
 * 🧩 NR Templates - Certified Templates for Safety Training
 * NR12, NR33, NR35, etc.
 */

export interface NRTemplateSlide {
  title: string;
  content: string;
  duration: number;
  backgroundImage?: string;
  audioText: string;
  elements?: any[];
}

export interface NRTemplate {
  id: string;
  nr: string;
  title: string;
  description: string;
  category: string;
  slides: NRTemplateSlide[];
  duration: number;
  thumbnailUrl: string;
  certification?: string;
  validUntil?: string;
}

// NR12 - Segurança no Trabalho em Máquinas e Equipamentos
export const NR12_TEMPLATE: NRTemplate = {
  id: 'nr12-template',
  nr: 'NR12',
  title: 'NR12 - Segurança em Máquinas e Equipamentos',
  description: 'Treinamento completo sobre segurança no trabalho em máquinas e equipamentos',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/nr12-thumb.jpg',
  certification: 'Certificado MTE',
  duration: 240,
  slides: [
    {
      title: 'Introdução à NR12',
      content: 'A Norma Regulamentadora 12 estabelece requisitos mínimos para segurança no trabalho em máquinas e equipamentos.',
      duration: 30,
      backgroundImage: '/nr12-intro.jpg',
      audioText: 'Bem-vindos ao treinamento sobre a Norma Regulamentadora 12. Esta norma estabelece os requisitos mínimos para a prevenção de acidentes e doenças do trabalho nas fases de projeto e de utilização de máquinas e equipamentos.',
    },
    {
      title: 'Objetivos da NR12',
      content: 'Proteger a integridade física dos trabalhadores e prevenir acidentes durante a operação de máquinas.',
      duration: 30,
      backgroundImage: '/nr12-objetivos.jpg',
      audioText: 'Os principais objetivos da NR12 são proteger a integridade física e a saúde dos trabalhadores, estabelecendo referências técnicas e princípios fundamentais para garantir a segurança durante a operação de máquinas e equipamentos.',
    },
    {
      title: 'Arranjo Físico e Instalações',
      content: 'As máquinas devem ser instaladas em locais adequados, com espaço suficiente e piso nivelado.',
      duration: 30,
      backgroundImage: '/nr12-arranjo.jpg',
      audioText: 'O arranjo físico e as instalações das máquinas devem respeitar os requisitos necessários fornecidos pelo fabricante, com espaço adequado para circulação, operação e manutenção, além de piso estável e nivelado.',
    },
    {
      title: 'Instalações e Dispositivos Elétricos',
      content: 'As instalações elétricas devem ser projetadas e mantidas de forma a prevenir riscos de choques elétricos e incêndios.',
      duration: 30,
      backgroundImage: '/nr12-eletrico.jpg',
      audioText: 'As instalações elétricas das máquinas e equipamentos devem ser projetadas e mantidas para prevenir choques elétricos, incêndios e explosões, em conformidade com as normas técnicas vigentes.',
    },
    {
      title: 'Dispositivos de Partida e Parada',
      content: 'As máquinas devem possuir dispositivos de partida, acionamento e parada seguros.',
      duration: 30,
      backgroundImage: '/nr12-partida.jpg',
      audioText: 'Todos os dispositivos de partida, acionamento e parada das máquinas devem ser projetados, selecionados e instalados de modo que não se localizem em zonas perigosas e possam ser acionados em caso de emergência.',
    },
    {
      title: 'Sistemas de Segurança',
      content: 'As máquinas devem possuir proteções fixas, móveis e dispositivos de segurança para proteção dos trabalhadores.',
      duration: 30,
      backgroundImage: '/nr12-seguranca.jpg',
      audioText: 'As máquinas e equipamentos devem possuir sistemas de segurança como proteções fixas, proteções móveis e dispositivos de segurança interligados, que garantam proteção à saúde e à integridade física dos trabalhadores.',
    },
    {
      title: 'Procedimentos de Trabalho e Segurança',
      content: 'Devem ser adotados procedimentos de trabalho e segurança específicos para cada tipo de máquina.',
      duration: 30,
      backgroundImage: '/nr12-procedimentos.jpg',
      audioText: 'Os empregadores devem elaborar e manter atualizados procedimentos de trabalho e segurança específicos para cada máquina ou equipamento, contemplando todas as fases de utilização, manutenção e intervenção.',
    },
    {
      title: 'Capacitação e Treinamento',
      content: 'Os trabalhadores devem receber capacitação adequada para operar as máquinas com segurança.',
      duration: 30,
      backgroundImage: '/nr12-treinamento.jpg',
      audioText: 'Os operadores de máquinas e equipamentos devem receber capacitação específica, ministrada por profissionais qualificados, contemplando conteúdos teóricos e práticos sobre riscos, medidas de proteção e procedimentos seguros.',
    },
  ]
};

// NR33 - Segurança e Saúde nos Trabalhos em Espaços Confinados
export const NR33_TEMPLATE: NRTemplate = {
  id: 'nr33-template',
  nr: 'NR33',
  title: 'NR33 - Segurança em Espaços Confinados',
  description: 'Treinamento sobre segurança e saúde nos trabalhos em espaços confinados',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/nr33-thumb.jpg',
  certification: 'Certificado MTE',
  duration: 180,
  slides: [
    {
      title: 'O que são Espaços Confinados?',
      content: 'Espaço confinado é qualquer área não projetada para ocupação humana contínua, com meios limitados de entrada e saída.',
      duration: 30,
      audioText: 'Espaço confinado é qualquer área ou ambiente não projetado para ocupação humana contínua, que possua meios limitados de entrada e saída, cuja ventilação existente é insuficiente para remover contaminantes.',
    },
    {
      title: 'Riscos em Espaços Confinados',
      content: 'Os principais riscos incluem deficiência ou enriquecimento de oxigênio, gases e vapores tóxicos ou inflamáveis.',
      duration: 30,
      audioText: 'Os principais riscos em espaços confinados incluem atmosferas com deficiência ou excesso de oxigênio, presença de gases tóxicos ou inflamáveis, riscos mecânicos, elétricos, biológicos e de soterramento.',
    },
    {
      title: 'Medidas de Controle',
      content: 'Permissão de Entrada e Trabalho (PET), monitoramento contínuo, ventilação adequada e equipamentos de proteção.',
      duration: 30,
      audioText: 'As medidas de controle incluem a Permissão de Entrada e Trabalho, monitoramento contínuo da atmosfera, ventilação adequada, uso de equipamentos de proteção individual e coletiva, além de treinamento dos trabalhadores.',
    },
    {
      title: 'Equipe de Trabalho',
      content: 'A equipe deve incluir o supervisor de entrada, vigia e trabalhadores autorizados, todos devidamente capacitados.',
      duration: 30,
      audioText: 'A equipe de trabalho em espaços confinados deve ser composta por supervisor de entrada, vigia e trabalhadores autorizados, todos devidamente capacitados e cientes de suas responsabilidades.',
    },
    {
      title: 'Procedimentos de Emergência',
      content: 'Devem existir procedimentos claros de resgate e primeiros socorros para situações de emergência.',
      duration: 30,
      audioText: 'Os procedimentos de emergência e resgate devem ser estabelecidos antes do início dos trabalhos, com equipe de salvamento devidamente treinada e equipamentos adequados disponíveis.',
    },
    {
      title: 'Capacitação dos Trabalhadores',
      content: 'Todos os trabalhadores devem receber treinamento específico sobre os riscos e procedimentos de trabalho seguro.',
      duration: 30,
      audioText: 'Todos os trabalhadores envolvidos devem receber capacitação periódica sobre identificação de riscos, uso de equipamentos, procedimentos de entrada e saída, e medidas de emergência em espaços confinados.',
    },
  ]
};

// NR35 - Trabalho em Altura
export const NR35_TEMPLATE: NRTemplate = {
  id: 'nr35-template',
  nr: 'NR35',
  title: 'NR35 - Trabalho em Altura',
  description: 'Treinamento sobre segurança em trabalhos em altura',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/nr35-thumb.jpg',
  certification: 'Certificado MTE',
  duration: 180,
  slides: [
    {
      title: 'Definição de Trabalho em Altura',
      content: 'É considerado trabalho em altura toda atividade executada acima de 2 metros do nível inferior, onde haja risco de queda.',
      duration: 30,
      audioText: 'Trabalho em altura é toda atividade executada acima de dois metros do nível inferior, onde haja risco de queda. Esta é uma das principais causas de acidentes graves e fatais no trabalho.',
    },
    {
      title: 'Principais Riscos',
      content: 'Quedas de altura, impacto contra objetos, esforço excessivo e condições ambientais adversas.',
      duration: 30,
      audioText: 'Os principais riscos em trabalhos em altura incluem quedas de nível, impacto contra objetos durante a queda, esforço físico excessivo, condições meteorológicas adversas e má conservação de estruturas.',
    },
    {
      title: 'Equipamentos de Proteção Individual',
      content: 'Cinturão de segurança tipo paraquedista, trava-quedas, mosquetões, capacete com jugular e calçados adequados.',
      duration: 30,
      audioText: 'Os principais EPIs para trabalho em altura são o cinturão de segurança tipo paraquedista, trava-quedas retrátil ou manual, mosquetões com trava de segurança, capacete com jugular e calçado de segurança com solado antiderrapante.',
    },
    {
      title: 'Sistemas de Proteção Contra Quedas',
      content: 'Sistemas de proteção coletiva como guarda-corpos, redes de segurança e plataformas com corrimão.',
      duration: 30,
      audioText: 'Os sistemas de proteção coletiva devem ser priorizados e incluem guarda-corpos rígidos, redes de proteção, plataformas de trabalho com corrimão e telas de proteção adequadamente instaladas.',
    },
    {
      title: 'Análise de Risco',
      content: 'Antes de iniciar o trabalho, deve ser realizada uma análise de risco detalhada e a Permissão de Trabalho.',
      duration: 30,
      audioText: 'Antes de iniciar qualquer trabalho em altura, deve ser realizada uma análise de risco detalhada, contemplando todos os perigos envolvidos, e emitida a Permissão de Trabalho em Altura por profissional capacitado.',
    },
    {
      title: 'Capacitação e Autorização',
      content: 'Os trabalhadores devem receber treinamento específico e serem considerados aptos em exame de saúde.',
      duration: 30,
      audioText: 'Os trabalhadores devem receber capacitação teórica e prática com carga horária mínima de oito horas, além de serem considerados aptos em exame médico ocupacional específico para trabalho em altura.',
    },
  ]
};

// Outros templates
export const NR10_TEMPLATE: NRTemplate = {
  id: 'nr10-template',
  nr: 'NR10',
  title: 'NR10 - Segurança em Instalações Elétricas',
  description: 'Treinamento sobre segurança em serviços com eletricidade',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/placeholder-nr.jpg',
  duration: 240,
  slides: [
    {
      title: 'Introdução à NR10',
      content: 'A NR10 estabelece requisitos para garantir a segurança de trabalhadores que interagem com instalações elétricas.',
      duration: 30,
      audioText: 'A Norma Regulamentadora 10 estabelece os requisitos e condições mínimas para a implementação de medidas de controle e sistemas preventivos, garantindo a segurança e saúde dos trabalhadores que direta ou indiretamente interagem com instalações elétricas.',
    },
  ]
};

export const NR11_TEMPLATE: NRTemplate = {
  id: 'nr11-template',
  nr: 'NR11',
  title: 'NR11 - Transporte, Movimentação e Armazenagem',
  description: 'Treinamento sobre operação segura de empilhadeiras e equipamentos de transporte',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/placeholder-nr.jpg',
  duration: 180,
  slides: [
    {
      title: 'Operação Segura de Empilhadeiras',
      content: 'Apenas trabalhadores qualificados e autorizados podem operar empilhadeiras e equipamentos de transporte.',
      duration: 30,
      audioText: 'A operação de empilhadeiras e equipamentos de transporte de materiais deve ser realizada apenas por trabalhadores qualificados, devidamente treinados e autorizados pela empresa.',
    },
  ]
};

// Export all templates
export const NR_TEMPLATES = [
  NR12_TEMPLATE,
  NR33_TEMPLATE,
  NR35_TEMPLATE,
  NR10_TEMPLATE,
  NR11_TEMPLATE,
];

/**
 * Get template by NR number
 */
export function getNRTemplate(nr: string): NRTemplate | undefined {
  return NR_TEMPLATES.find(t => t.nr === nr);
}

/**
 * Get all templates
 */
export function getAllNRTemplates(): NRTemplate[] {
  return NR_TEMPLATES;
}

/**
 * Create project from NR template
 */
export function createProjectFromTemplate(template: NRTemplate, projectName: string) {
  return {
    name: projectName || template.title,
    description: template.description,
    type: 'nr-template',
    category: template.category,
    totalSlides: template.slides.length,
    slidesData: template.slides,
    duration: template.duration,
    thumbnailUrl: template.thumbnailUrl,
    tags: [template.nr, 'NR', 'Segurança do Trabalho'],
  };
}
