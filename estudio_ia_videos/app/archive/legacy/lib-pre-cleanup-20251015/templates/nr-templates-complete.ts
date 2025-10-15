

/**
 * 🧩 NR Templates Completos - Certificados
 * NR12, NR33, NR35, NR10, NR6 + Metadados de Certificação
 */

export interface NRTemplateSlide {
  title: string;
  content: string;
  duration: number;
  backgroundImage?: string;
  audioText: string;
  elements?: any[];
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
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
  certification: {
    issuer: string;
    validityMonths: number;
    certificateTemplate: string;
    requiredScore: number;
  };
  compliance: {
    mteCertified: true;
    lastUpdate: string;
    version: string;
    revisionNumber: number;
  };
}

// NR12 - Segurança no Trabalho em Máquinas e Equipamentos
export const NR12_TEMPLATE: NRTemplate = {
  id: 'nr12-template',
  nr: 'NR12',
  title: 'NR12 - Segurança em Máquinas e Equipamentos',
  description: 'Treinamento certificado sobre segurança no trabalho em máquinas e equipamentos',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/nr12-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 24,
    certificateTemplate: 'nr12-certificate',
    requiredScore: 70
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
      quizQuestions: [
        {
          question: 'Qual é o principal objetivo da NR12?',
          options: [
            'Aumentar a produtividade',
            'Proteger a integridade física dos trabalhadores',
            'Reduzir custos operacionais',
            'Facilitar a manutenção'
          ],
          correctAnswer: 1,
          explanation: 'O principal objetivo da NR12 é proteger a integridade física e a saúde dos trabalhadores durante a operação de máquinas e equipamentos.'
        }
      ]
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
      quizQuestions: [
        {
          question: 'Quem deve ministrar a capacitação dos operadores?',
          options: [
            'Qualquer funcionário da empresa',
            'Profissionais qualificados',
            'O supervisor direto',
            'O fabricante da máquina'
          ],
          correctAnswer: 1,
          explanation: 'A capacitação deve ser ministrada por profissionais qualificados, com conhecimento técnico adequado.'
        }
      ]
    },
  ]
};

// NR33 - Segurança e Saúde nos Trabalhos em Espaços Confinados
export const NR33_TEMPLATE: NRTemplate = {
  id: 'nr33-template',
  nr: 'NR33',
  title: 'NR33 - Segurança em Espaços Confinados',
  description: 'Treinamento certificado sobre segurança e saúde nos trabalhos em espaços confinados',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/nr33-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 12,
    certificateTemplate: 'nr33-certificate',
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
      quizQuestions: [
        {
          question: 'Qual é considerado um risco atmosférico em espaços confinados?',
          options: [
            'Apenas falta de luz',
            'Deficiência ou excesso de oxigênio',
            'Temperatura elevada',
            'Ruído excessivo'
          ],
          correctAnswer: 1,
          explanation: 'Os riscos atmosféricos incluem deficiência ou excesso de oxigênio e presença de gases tóxicos ou inflamáveis.'
        }
      ]
    },
    {
      title: 'Medidas de Controle',
      content: 'Permissão de Entrada e Trabalho (PET), monitoramento contínuo, ventilação adequada e equipamentos de proteção.',
      duration: 30,
      audioText: 'As medidas de controle incluem a Permissão de Entrada e Trabalho, monitoramento contínuo da atmosfera, ventilação adequada, uso de equipamentos de proteção individual e coletiva, além de treinamento dos trabalhadores.',
    },
    {
      title: 'Permissão de Entrada e Trabalho (PET)',
      content: 'A PET é o documento que autoriza a entrada e realização de trabalho em espaço confinado.',
      duration: 30,
      audioText: 'A Permissão de Entrada e Trabalho é o documento escrito que contém o conjunto de medidas de controle de riscos e autoriza a entrada e realização de trabalhos em espaços confinados, sendo válida apenas para cada entrada.',
    },
    {
      title: 'Equipe de Trabalho',
      content: 'A equipe deve incluir o supervisor de entrada, vigia e trabalhadores autorizados, todos devidamente capacitados.',
      duration: 30,
      audioText: 'A equipe de trabalho em espaços confinados deve ser composta por supervisor de entrada, vigia e trabalhadores autorizados, todos devidamente capacitados e cientes de suas responsabilidades.',
      quizQuestions: [
        {
          question: 'Quem compõe a equipe básica para trabalho em espaço confinado?',
          options: [
            'Apenas o trabalhador autorizado',
            'Supervisor, vigia e trabalhadores autorizados',
            'Somente o supervisor e o vigia',
            'Todos os funcionários da empresa'
          ],
          correctAnswer: 1,
          explanation: 'A equipe deve incluir supervisor de entrada, vigia e trabalhadores autorizados, todos capacitados.'
        }
      ]
    },
    {
      title: 'Monitoramento e Testes',
      content: 'A atmosfera do espaço confinado deve ser testada e monitorada continuamente antes e durante os trabalhos.',
      duration: 30,
      audioText: 'Antes da entrada e durante os trabalhos, a atmosfera do espaço confinado deve ser testada e monitorada continuamente para oxigênio, gases e vapores inflamáveis e tóxicos, utilizando equipamentos calibrados.',
    },
    {
      title: 'Procedimentos de Emergência',
      content: 'Devem existir procedimentos claros de resgate e primeiros socorros para situações de emergência.',
      duration: 30,
      audioText: 'Os procedimentos de emergência e resgate devem ser estabelecidos antes do início dos trabalhos, com equipe de salvamento devidamente treinada e equipamentos adequados disponíveis para resgate sem entrada no espaço confinado.',
    },
    {
      title: 'Capacitação dos Trabalhadores',
      content: 'Todos os trabalhadores devem receber treinamento específico sobre os riscos e procedimentos de trabalho seguro.',
      duration: 30,
      audioText: 'Todos os trabalhadores envolvidos devem receber capacitação periódica de 16 horas, com reciclagem anual de 8 horas, sobre identificação de riscos, uso de equipamentos, procedimentos de entrada e saída, e medidas de emergência em espaços confinados.',
    },
  ]
};

// NR35 - Trabalho em Altura
export const NR35_TEMPLATE: NRTemplate = {
  id: 'nr35-template',
  nr: 'NR35',
  title: 'NR35 - Trabalho em Altura',
  description: 'Treinamento certificado sobre trabalho em altura',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/nr35-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 24,
    certificateTemplate: 'nr35-certificate',
    requiredScore: 70
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
      title: 'Definição de Trabalho em Altura',
      content: 'Trabalho em altura é toda atividade executada acima de 2,00 metros do nível inferior, onde haja risco de queda.',
      duration: 30,
      audioText: 'Trabalho em altura é toda atividade executada acima de 2,00 metros do nível inferior, onde haja risco de queda. Esta definição é fundamental para aplicação das medidas de proteção da NR35.',
    },
    {
      title: 'Riscos em Trabalhos em Altura',
      content: 'Os principais riscos são quedas de pessoas, materiais e ferramentas, além de choques elétricos e condições climáticas adversas.',
      duration: 30,
      audioText: 'Os principais riscos em trabalhos em altura incluem quedas de pessoas de diferentes níveis, quedas de materiais e ferramentas, choques elétricos, condições climáticas adversas como vento forte e chuva, e riscos ergonômicos.',
      quizQuestions: [
        {
          question: 'A partir de quantos metros de altura é considerado trabalho em altura?',
          options: [
            '1,00 metro',
            '1,50 metros',
            '2,00 metros',
            '3,00 metros'
          ],
          correctAnswer: 2,
          explanation: 'Trabalho em altura é considerado a partir de 2,00 metros acima do nível inferior, onde haja risco de queda.'
        }
      ]
    },
    {
      title: 'Medidas de Proteção Coletiva',
      content: 'Devem ser priorizadas as medidas de proteção coletiva como guarda-corpos, telas de proteção e plataformas elevadas.',
      duration: 30,
      audioText: 'As medidas de proteção coletiva devem ser priorizadas em relação às individuais. Incluem guarda-corpos rígidos, telas de proteção, plataformas de trabalho adequadas, escadas com proteção lateral e sistemas de isolamento de áreas.',
    },
    {
      title: 'Equipamentos de Proteção Individual',
      content: 'Quando a proteção coletiva não for viável, devem ser utilizados EPIs adequados como cinturão de segurança tipo paraquedista.',
      duration: 30,
      audioText: 'Quando as medidas de proteção coletiva não forem viáveis, devem ser utilizados equipamentos de proteção individual adequados, como cinturão de segurança tipo paraquedista, talabarte, trava-quedas, capacete com jugular e calçados de segurança.',
    },
    {
      title: 'Análise de Risco e Permissão de Trabalho',
      content: 'Toda atividade em altura deve ser precedida de Análise de Risco e Permissão de Trabalho.',
      duration: 30,
      audioText: 'Toda atividade em altura deve ser precedida de Análise de Risco e Permissão de Trabalho, documentos que identificam os riscos e estabelecem as medidas de controle necessárias para execução segura da atividade.',
      quizQuestions: [
        {
          question: 'Qual documento deve preceder toda atividade em altura?',
          options: [
            'Apenas o contrato de trabalho',
            'Análise de Risco e Permissão de Trabalho',
            'Somente a ficha de EPI',
            'Registro de ponto'
          ],
          correctAnswer: 1,
          explanation: 'Toda atividade em altura deve ser precedida de Análise de Risco e Permissão de Trabalho.'
        }
      ]
    },
    {
      title: 'Sistemas de Ancoragem',
      content: 'Os pontos de ancoragem devem ser certificados e capazes de suportar no mínimo 2.200 kg por trabalhador.',
      duration: 30,
      audioText: 'Os sistemas de ancoragem devem ser inspecionados regularmente e serem capazes de suportar uma carga de pelo menos 2.200 quilos por trabalhador conectado. Os pontos de ancoragem devem estar acima do nível de trabalho sempre que possível.',
    },
    {
      title: 'Procedimentos de Emergência e Resgate',
      content: 'Deve existir um plano de emergência e resgate, com equipe treinada e equipamentos adequados.',
      duration: 30,
      audioText: 'O empregador deve estabelecer procedimentos de emergência e resgate para trabalhos em altura, assegurando equipe treinada, equipamentos adequados e meios de comunicação eficazes para resposta rápida em caso de acidentes.',
    },
    {
      title: 'Capacitação para Trabalho em Altura',
      content: 'A capacitação deve ter carga horária mínima de 8 horas, com reciclagem a cada 2 anos ou quando necessário.',
      duration: 30,
      audioText: 'A capacitação para trabalho em altura deve ter carga horária mínima de 8 horas, incluindo conteúdo teórico e prático. A reciclagem deve ser realizada a cada 2 anos ou quando ocorrer mudança de função, acidente grave ou afastamento superior a 90 dias.',
      quizQuestions: [
        {
          question: 'Qual é a carga horária mínima da capacitação para trabalho em altura?',
          options: [
            '4 horas',
            '6 horas',
            '8 horas',
            '16 horas'
          ],
          correctAnswer: 2,
          explanation: 'A capacitação para trabalho em altura deve ter carga horária mínima de 8 horas.'
        }
      ]
    },
  ]
};

// NR10 - Segurança em Instalações e Serviços em Eletricidade
export const NR10_TEMPLATE: NRTemplate = {
  id: 'nr10-template',
  nr: 'NR10',
  title: 'NR10 - Segurança em Eletricidade',
  description: 'Treinamento certificado sobre segurança em instalações e serviços em eletricidade',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/nr12-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 24,
    certificateTemplate: 'nr10-certificate',
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
      title: 'Introdução à NR10',
      content: 'A NR10 estabelece requisitos e condições mínimas para garantir a segurança dos trabalhadores que interagem com eletricidade.',
      duration: 30,
      audioText: 'A Norma Regulamentadora 10 estabelece os requisitos e condições mínimas objetivando a implementação de medidas de controle e sistemas preventivos, de forma a garantir a segurança e a saúde dos trabalhadores que, direta ou indiretamente, interajam em instalações elétricas e serviços com eletricidade.',
    },
    {
      title: 'Riscos Elétricos',
      content: 'Os principais riscos são choque elétrico, arco elétrico, queimaduras e campos eletromagnéticos.',
      duration: 30,
      audioText: 'Os principais riscos elétricos incluem o choque elétrico causado pela passagem de corrente pelo corpo humano, arco elétrico que pode causar queimaduras graves, queimaduras por contato com superfícies quentes, e exposição a campos eletromagnéticos.',
      quizQuestions: [
        {
          question: 'Qual é o principal risco da corrente elétrica no corpo humano?',
          options: [
            'Apenas aquecimento',
            'Choque elétrico',
            'Ruído',
            'Iluminação excessiva'
          ],
          correctAnswer: 1,
          explanation: 'O choque elétrico, causado pela passagem de corrente elétrica pelo corpo humano, é o principal risco.'
        }
      ]
    },
    {
      title: 'Medidas de Controle',
      content: 'Desenergização, aterramento, equipotencialização, isolação e uso de EPIs adequados.',
      duration: 30,
      audioText: 'As medidas de controle incluem a desenergização sempre que possível, aterramento e equipotencialização das instalações, isolação elétrica, proteções coletivas como barreiras e invólucros, sinalização adequada e uso de equipamentos de proteção individual certificados.',
    },
    {
      title: 'Desenergização',
      content: 'Procedimento que envolve seccionamento, impedimento de reenergização, constatação de ausência de tensão, instalação de aterramento temporário e proteção dos elementos energizados.',
      duration: 30,
      audioText: 'A desenergização é um conjunto de ações coordenadas que incluem o seccionamento, impedimento de reenergização, constatação da ausência de tensão, instalação de aterramento temporário com equipotencialização e proteção dos elementos energizados existentes na zona controlada.',
    },
    {
      title: 'Trabalhos em Instalações Energizadas',
      content: 'Quando não for possível desenergizar, devem ser adotadas medidas especiais de segurança.',
      duration: 30,
      audioText: 'Quando os trabalhos em instalações energizadas forem tecnicamente justificáveis, devem ser adotadas medidas especiais de segurança, incluindo análise de risco, planejamento detalhado, utilização de ferramentas e equipamentos adequados, e supervisão constante por profissional habilitado.',
      quizQuestions: [
        {
          question: 'O que deve ser feito quando não é possível desenergizar?',
          options: [
            'Cancelar o trabalho',
            'Trabalhar normalmente',
            'Adotar medidas especiais de segurança',
            'Trabalhar à noite'
          ],
          correctAnswer: 2,
          explanation: 'Quando não for possível desenergizar, devem ser adotadas medidas especiais de segurança devidamente justificadas.'
        }
      ]
    },
    {
      title: 'Equipamentos de Proteção',
      content: 'Luvas isolantes, capacete classe B, calçados isolantes, óculos de proteção e vestimentas antichamas.',
      duration: 30,
      audioText: 'Os equipamentos de proteção individual para trabalhos com eletricidade incluem luvas isolantes de borracha certificadas, capacete classe B com isolação elétrica, calçados isolantes, óculos de proteção contra arco elétrico, e vestimentas antichamas resistentes a altas temperaturas.',
    },
    {
      title: 'Sinalização de Segurança',
      content: 'As instalações elétricas devem ser sinalizadas adequadamente para alertar sobre riscos elétricos.',
      duration: 30,
      audioText: 'As instalações elétricas devem ter sinalização adequada de segurança, destinada à advertência e identificação, incluindo placas de identificação, delimitação de áreas com fitas zebradas, símbolos de perigo elétrico e instruções de segurança.',
    },
    {
      title: 'Capacitação dos Trabalhadores',
      content: 'Curso básico de 40 horas para trabalhadores autorizados e complementar para trabalhos em alta tensão.',
      duration: 30,
      audioText: 'Os trabalhadores que intervenham em instalações elétricas energizadas devem receber treinamento de formação com carga horária mínima de 40 horas para curso básico, e curso complementar para trabalhos em alta tensão com carga horária mínima de 40 horas. A reciclagem deve ser bienal com carga mínima de 20 horas.',
      quizQuestions: [
        {
          question: 'Qual é a carga horária mínima do curso básico da NR10?',
          options: [
            '8 horas',
            '16 horas',
            '40 horas',
            '80 horas'
          ],
          correctAnswer: 2,
          explanation: 'O curso básico da NR10 deve ter carga horária mínima de 40 horas.'
        }
      ]
    },
  ]
};

// NR6 - Equipamentos de Proteção Individual
export const NR6_TEMPLATE: NRTemplate = {
  id: 'nr6-template',
  nr: 'NR6',
  title: 'NR6 - Equipamentos de Proteção Individual',
  description: 'Treinamento certificado sobre Equipamentos de Proteção Individual',
  category: 'Segurança do Trabalho',
  thumbnailUrl: '/nr12-thumb.jpg',
  certification: {
    issuer: 'Ministério do Trabalho e Emprego',
    validityMonths: 12,
    certificateTemplate: 'nr6-certificate',
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
      title: 'O que é EPI?',
      content: 'Equipamento de Proteção Individual é todo dispositivo de uso individual destinado a proteger a saúde e a integridade física do trabalhador.',
      duration: 30,
      audioText: 'Equipamento de Proteção Individual, ou EPI, é todo dispositivo ou produto de uso individual utilizado pelo trabalhador, destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho.',
    },
    {
      title: 'Responsabilidades do Empregador',
      content: 'Fornecer EPI adequado, gratuito, em perfeito estado e devidamente certificado.',
      duration: 30,
      audioText: 'O empregador tem como responsabilidades adquirir o EPI adequado ao risco de cada atividade, exigir seu uso, fornecer gratuitamente aos trabalhadores, orientar e treinar sobre o uso adequado, substituir imediatamente quando danificado ou extraviado, e comunicar ao MTE qualquer irregularidade observada.',
      quizQuestions: [
        {
          question: 'O fornecimento de EPI deve ser:',
          options: [
            'Pago pelo trabalhador',
            'Gratuito ao trabalhador',
            'Dividido entre empresa e trabalhador',
            'Opcional'
          ],
          correctAnswer: 1,
          explanation: 'O EPI deve ser fornecido gratuitamente ao trabalhador pelo empregador.'
        }
      ]
    },
    {
      title: 'Responsabilidades do Trabalhador',
      content: 'Usar o EPI apenas para a finalidade a que se destina, responsabilizar-se pela guarda e conservação, e comunicar alterações que o tornem impróprio.',
      duration: 30,
      audioText: 'O trabalhador tem como responsabilidades usar o EPI apenas para a finalidade a que se destina, responsabilizar-se pela guarda e conservação, comunicar ao empregador qualquer alteração que o torne impróprio para uso, e cumprir as determinações do empregador sobre o uso adequado.',
    },
    {
      title: 'Certificado de Aprovação (CA)',
      content: 'Todo EPI deve possuir Certificado de Aprovação emitido pelo MTE, garantindo sua eficácia.',
      duration: 30,
      audioText: 'Todo Equipamento de Proteção Individual de fabricação nacional ou importado deve possuir Certificado de Aprovação, o CA, emitido pelo órgão competente do Ministério do Trabalho e Emprego, garantindo que o produto atende aos requisitos de segurança estabelecidos.',
    },
    {
      title: 'Tipos de EPI - Proteção da Cabeça',
      content: 'Capacetes para proteção contra impactos, choques elétricos e agentes térmicos.',
      duration: 30,
      audioText: 'Os EPIs para proteção da cabeça incluem capacetes para proteção contra impactos de objetos sobre o crânio, capacetes para proteção contra choques elétricos, e capacetes para proteção do crânio e face contra agentes térmicos.',
      quizQuestions: [
        {
          question: 'O que é o Certificado de Aprovação (CA)?',
          options: [
            'Documento que aprova o trabalhador',
            'Certificado que garante a eficácia do EPI',
            'Licença da empresa',
            'Registro profissional'
          ],
          correctAnswer: 1,
          explanation: 'O CA é o certificado emitido pelo MTE que garante que o EPI atende aos requisitos de segurança.'
        }
      ]
    },
    {
      title: 'Tipos de EPI - Proteção de Mãos e Braços',
      content: 'Luvas e mangotes para proteção contra agentes diversos.',
      duration: 30,
      audioText: 'Os EPIs para proteção de mãos e braços incluem luvas para proteção contra agentes abrasivos, cortantes, perfurantes, térmicos, químicos, biológicos e elétricos, além de mangotes para proteção do braço e antebraço contra os mesmos agentes.',
    },
    {
      title: 'Tipos de EPI - Proteção Respiratória',
      content: 'Respiradores, máscaras e filtros para proteção das vias respiratórias.',
      duration: 30,
      audioText: 'Os EPIs para proteção respiratória incluem respiradores purificadores de ar não motorizados, respiradores purificadores de ar motorizados, respiradores de adução de ar tipo linha de ar comprimido, e aparelhos autônomos de ar comprimido para proteção contra gases, vapores, poeiras e névoas.',
    },
    {
      title: 'Conservação e Higienização',
      content: 'Os EPIs devem ser adequadamente limpos, higienizados e guardados conforme orientação do fabricante.',
      duration: 30,
      audioText: 'A conservação e higienização dos EPIs são fundamentais para garantir sua eficácia. Os equipamentos devem ser limpos e higienizados conforme orientação do fabricante, guardados em locais apropriados, e inspecionados periodicamente para identificar defeitos ou desgastes que comprometam sua proteção.',
      quizQuestions: [
        {
          question: 'A higienização do EPI deve ser feita:',
          options: [
            'Apenas quando estiver visivelmente sujo',
            'Conforme orientação do fabricante',
            'Uma vez por ano',
            'Não precisa higienizar'
          ],
          correctAnswer: 1,
          explanation: 'A higienização deve ser feita conforme orientação do fabricante para garantir a eficácia do EPI.'
        }
      ]
    },
  ]
};

// Export all templates
export const NR_TEMPLATES = [
  NR12_TEMPLATE,
  NR33_TEMPLATE,
  NR35_TEMPLATE,
  NR10_TEMPLATE,
  NR6_TEMPLATE
];

// Helper functions
export function getTemplateById(id: string): NRTemplate | undefined {
  return NR_TEMPLATES.find(template => template.id === id);
}

export function getTemplateByNR(nr: string): NRTemplate | undefined {
  return NR_TEMPLATES.find(template => template.nr === nr);
}

export function getAllTemplates(): NRTemplate[] {
  return NR_TEMPLATES;
}
