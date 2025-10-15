
// Templates Especializados para Normas Regulamentadoras
import { SlideData, VideoConfig } from './ai-services'

export interface NRTemplate {
  id: string
  nr: string
  title: string
  description: string
  category: string
  duration_minutes: number
  slides: SlideData[]
  config: VideoConfig
  keywords: string[]
  target_audience: string
  certification_hours?: number
}

export class NRTemplateLibrary {
  
  // Templates completos para NRs específicas
  static readonly TEMPLATES: NRTemplate[] = [
    
    // === NR-10: INSTALAÇÕES E SERVIÇOS EM ELETRICIDADE === //
    {
      id: 'nr10-basico',
      nr: 'NR-10',
      title: 'NR-10 - Segurança em Instalações Elétricas (Básico)',
      description: 'Treinamento básico obrigatório para todos os trabalhadores que interagem com instalações elétricas',
      category: 'Segurança Elétrica',
      duration_minutes: 40,
      target_audience: 'Todos os trabalhadores autorizados em eletricidade',
      certification_hours: 40,
      keywords: ['eletricidade', 'segurança', 'choque', 'EPI', 'procedimentos'],
      config: {
        duration: 120,
        voiceModel: 'nr10-especialista',
        avatarStyle: 'instructor-male',
        background: 'industrial',
        language: 'pt-BR',
        speed: 0.9,
        pitch: 1.0
      },
      slides: [
        {
          id: 'nr10-intro',
          title: 'Introdução à NR-10',
          content: 'A Norma Regulamentadora 10 estabelece os requisitos e condições mínimas para garantir a segurança dos trabalhadores que interagem direta ou indiretamente com instalações elétricas e serviços com eletricidade. Esta norma é fundamental para prevenir acidentes graves como choque elétrico, arco elétrico e incêndios.',
          duration: 25,
          imageUrl: '/images/nr10/intro-eletricidade.jpg'
        },
        {
          id: 'nr10-riscos',
          title: 'Principais Riscos Elétricos',
          content: 'Os principais riscos elétricos incluem: choque elétrico por contato direto ou indireto, arco elétrico que pode causar queimaduras graves, explosões em ambientes com gases inflamáveis, incêndios causados por sobrecarga ou curto-circuito, e campos eletromagnéticos que podem afetar dispositivos médicos.',
          duration: 30,
          imageUrl: '/images/nr10/riscos-eletricos.jpg'
        },
        {
          id: 'nr10-efeitos-choque',
          title: 'Efeitos do Choque Elétrico no Corpo Humano',
          content: 'O choque elétrico pode causar diferentes efeitos dependendo da intensidade da corrente: de 1 a 5 miliampères causa apenas sensação de formigamento; de 5 a 10 miliampères causa dor e contrações musculares; de 10 a 20 miliampères pode causar paralisia muscular; acima de 20 miliampères pode causar parada respiratória e fibrilação ventricular.',
          duration: 35,
          imageUrl: '/images/nr10/efeitos-choque.jpg'
        },
        {
          id: 'nr10-medidas-protecao',
          title: 'Medidas de Proteção Coletiva',
          content: 'As medidas de proteção coletiva são prioritárias e incluem: desenergização de circuitos, isolamento físico de partes energizadas, sinalização adequada de segurança, bloqueios e travamentos de dispositivos de manobra, ventilação adequada em subestações, e sistemas de proteção contra descargas atmosféricas.',
          duration: 30,
          imageUrl: '/images/nr10/protecao-coletiva.jpg'
        },
        {
          id: 'nr10-epi',
          title: 'Equipamentos de Proteção Individual (EPI)',
          content: 'Os EPIs essenciais para trabalhos com eletricidade incluem: capacete isolante classe B, óculos de segurança com proteção lateral, luvas isolantes de borracha testadas periodicamente, calçados de segurança com solado isolante, vestimentas antichama, e cinturão de segurança para trabalhos em altura.',
          duration: 28,
          imageUrl: '/images/nr10/epi-eletricidade.jpg'
        },
        {
          id: 'nr10-procedimentos',
          title: 'Procedimentos de Trabalho Seguro',
          content: 'Antes de iniciar qualquer trabalho elétrico é obrigatório seguir os procedimentos: análise preliminar de risco, autorização formal por escrito, desligamento da instalação com bloqueio, verificação da ausência de tensão, instalação de aterramento temporário, delimitação da área de trabalho e sinalização adequada.',
          duration: 32,
          imageUrl: '/images/nr10/procedimentos-trabalho.jpg'
        },
        {
          id: 'nr10-desenergizacao',
          title: 'Processo de Desenergização',
          content: 'A desenergização deve seguir a sequência obrigatória: seccionamento com afastamento adequado, impedimento de reenergização através de bloqueio, constatação da ausência de tensão, instalação de aterramento temporário com equipotencialização, proteção dos elementos energizados existentes na zona controlada.',
          duration: 30,
          imageUrl: '/images/nr10/desenergizacao.jpg'
        },
        {
          id: 'nr10-primeiros-socorros',
          title: 'Primeiros Socorros em Acidentes Elétricos',
          content: 'Em caso de acidente elétrico: primeiro desligue a fonte de energia ou afaste a vítima usando material isolante, verifique sinais vitais, inicie ressuscitação cardiopulmonar se necessário, trate queimaduras com água fria e panos limpos, mantenha a vítima aquecida e chame imediatamente o socorro médico especializado.',
          duration: 35,
          imageUrl: '/images/nr10/primeiros-socorros.jpg'
        },
        {
          id: 'nr10-responsabilidades',
          title: 'Responsabilidades e Qualificações',
          content: 'Trabalhadores autorizados devem ter qualificação formal, treinamento de 40 horas mínimas, reciclagem bienal obrigatória, exames médicos específicos, e autorização formal da empresa. Empregadores devem garantir treinamento adequado, fornecimento de EPIs, manutenção preventiva de equipamentos e fiscalização do cumprimento da norma.',
          duration: 30,
          imageUrl: '/images/nr10/responsabilidades.jpg'
        },
        {
          id: 'nr10-conclusao',
          title: 'Conclusão e Compromisso com a Segurança',
          content: 'A segurança em instalações elétricas é responsabilidade de todos. Lembre-se sempre: nunca improvise em eletricidade, use sempre os EPIs adequados, siga rigorosamente os procedimentos estabelecidos, mantenha-se sempre atualizado através de treinamentos, e em caso de dúvida, sempre consulte um profissional qualificado.',
          duration: 25,
          imageUrl: '/images/nr10/conclusao-seguranca.jpg'
        }
      ]
    },

    // === NR-35: TRABALHO EM ALTURA === //
    {
      id: 'nr35-completo',
      nr: 'NR-35',
      title: 'NR-35 - Trabalho em Altura Seguro',
      description: 'Treinamento completo para trabalhos realizados acima de 2 metros de altura com risco de queda',
      category: 'Trabalho em Altura',
      duration_minutes: 35,
      target_audience: 'Trabalhadores que executam trabalho em altura',
      certification_hours: 8,
      keywords: ['altura', 'queda', 'cinto', 'ancoragem', 'resgate'],
      config: {
        duration: 105,
        voiceModel: 'nr35-instrutor-altura',
        avatarStyle: 'instructor-male',
        background: 'industrial',
        language: 'pt-BR',
        speed: 0.9,
        pitch: 1.0
      },
      slides: [
        {
          id: 'nr35-definicao',
          title: 'Definição de Trabalho em Altura',
          content: 'Considera-se trabalho em altura toda atividade executada acima de 2 metros do nível inferior, onde há risco de queda. Isso inclui trabalhos em telhados, torres, andaimes, escadas, estruturas elevadas, equipamentos suspensos, e qualquer situação onde a queda possa resultar em lesão grave ou morte.',
          duration: 20,
          imageUrl: '/images/nr35/definicao-altura.jpg'
        },
        {
          id: 'nr35-riscos-quedas',
          title: 'Análise de Riscos e Tipos de Queda',
          content: 'Os principais tipos de queda são: queda de mesmo nível por tropeços ou escorregões, queda de nível diferente por falta de proteção, queda de objetos que podem atingir pessoas abaixo. Os fatores de risco incluem condições climáticas adversas, equipamentos inadequados, falta de treinamento, fadiga e pressa na execução das tarefas.',
          duration: 25,
          imageUrl: '/images/nr35/tipos-queda.jpg'
        },
        {
          id: 'nr35-medidas-protecao',
          title: 'Hierarquia das Medidas de Proteção',
          content: 'A hierarquia de proteção deve ser respeitada: primeiro eliminação do risco sempre que tecnicamente viável, prevenção do risco através de proteções coletivas como guarda-corpos e plataformas, proteção individual com cinturões e talabartes, e por último medidas administrativas como treinamento e procedimentos.',
          duration: 30,
          imageUrl: '/images/nr35/hierarquia-protecao.jpg'
        },
        {
          id: 'nr35-protecao-coletiva',
          title: 'Sistemas de Proteção Coletiva',
          content: 'Proteções coletivas prioritárias incluem: guarda-corpos rígidos com altura mínima de 1,20m, redes de segurança instaladas corretamente, plataformas de trabalho estáveis, andaimes certificados e montados por profissionais habilitados, e cobertura de vãos para evitar quedas através de aberturas.',
          duration: 28,
          imageUrl: '/images/nr35/protecao-coletiva-altura.jpg'
        },
        {
          id: 'nr35-epi-altura',
          title: 'Equipamentos de Proteção Individual',
          content: 'EPIs obrigatórios para trabalho em altura: cinturão de segurança tipo paraquedista, talabartes com absorvedor de energia, conectores com trava dupla, capacete com jugular, calçados antiderrapantes, e óculos de proteção. Todos os equipamentos devem ter certificado de aprovação e inspeção periódica.',
          duration: 30,
          imageUrl: '/images/nr35/epi-altura.jpg'
        },
        {
          id: 'nr35-ancoragem',
          title: 'Pontos de Ancoragem e Fixação',
          content: 'Pontos de ancoragem devem suportar no mínimo 15 quilonewtons por pessoa conectada. Podem ser estruturais como vigas e pilares, ou dispositivos específicos como olhais certificados. É fundamental verificar a integridade antes do uso e nunca conectar mais pessoas que o especificado pelo fabricante.',
          duration: 25,
          imageUrl: '/images/nr35/pontos-ancoragem.jpg'
        },
        {
          id: 'nr35-procedimentos',
          title: 'Procedimentos e Permissão de Trabalho',
          content: 'Antes do início dos trabalhos é obrigatório emitir Permissão de Trabalho em Altura contendo análise de risco, medidas de proteção, equipe autorizada, procedimentos de emergência, condições meteorológicas, e validade. O documento deve ser assinado por responsável técnico e mantido no local.',
          duration: 32,
          imageUrl: '/images/nr35/permissao-trabalho.jpg'
        },
        {
          id: 'nr35-capacitacao',
          title: 'Capacitação e Aptidão Médica',
          content: 'Trabalhadores devem ter treinamento teórico e prático de 8 horas, reciclagem a cada 2 anos, exame médico ocupacional específico para altura, e autorização formal da empresa. É proibido trabalhar em altura com problemas de saúde que possam causar vertigem, desmaios ou perda de consciência.',
          duration: 28,
          imageUrl: '/images/nr35/capacitacao-medica.jpg'
        },
        {
          id: 'nr35-resgate',
          title: 'Plano de Resgate e Emergência',
          content: 'Todo trabalho em altura deve ter plano de resgate definindo: equipe treinada em resgate, equipamentos específicos disponíveis, procedimentos de comunicação de emergência, tempo máximo para início do resgate, rotas de evacuação, e articulação com serviços externos de emergência.',
          duration: 30,
          imageUrl: '/images/nr35/plano-resgate.jpg'
        },
        {
          id: 'nr35-boas-praticas',
          title: 'Boas Práticas e Prevenção',
          content: 'Melhores práticas incluem: inspeção diária dos EPIs antes do uso, comunicação constante entre a equipe, não trabalhar sozinho, respeitar limites climáticos, manter área embaixo isolada, usar ferramentas amarradas, e sempre questionar condições inseguras. Lembre-se: sua segurança e vida são prioridade absoluta.',
          duration: 27,
          imageUrl: '/images/nr35/boas-praticas.jpg'
        }
      ]
    },

    // === NR-33: ESPAÇOS CONFINADOS === //
    {
      id: 'nr33-supervisor',
      nr: 'NR-33',
      title: 'NR-33 - Segurança em Espaços Confinados',
      description: 'Treinamento para entrada segura e trabalho em espaços confinados',
      category: 'Espaços Confinados',
      duration_minutes: 45,
      target_audience: 'Supervisores e trabalhadores de espaços confinados',
      certification_hours: 40,
      keywords: ['confinado', 'gases', 'atmosfera', 'ventilação', 'resgate'],
      config: {
        duration: 135,
        voiceModel: 'nr33-especialista-confinado',
        avatarStyle: 'instructor-female',
        background: 'industrial',
        language: 'pt-BR',
        speed: 0.85,
        pitch: 1.0
      },
      slides: [
        {
          id: 'nr33-definicao',
          title: 'Caracterização de Espaços Confinados',
          content: 'Espaço Confinado é qualquer área não projetada para ocupação humana contínua, com ventilação insuficiente para remover contaminantes, e cuja entrada e saída são limitadas. Exemplos: tanques, reservatórios, silos, vasos de pressão, tubulações, poços, fossas, galerias subterrâneas e porões.',
          duration: 25,
          imageUrl: '/images/nr33/definicao-espacos.jpg'
        },
        {
          id: 'nr33-riscos-atmosfericos',
          title: 'Riscos Atmosféricos Fatais',
          content: 'Os principais riscos atmosféricos são: deficiência ou enriquecimento de oxigênio, gases tóxicos como monóxido de carbono e ácido sulfídrico, gases asfixiantes como nitrogênio e argônio, vapores inflamáveis que podem explodir, e poeiras combustíveis. Estes riscos são invisíveis e podem ser letais em minutos.',
          duration: 30,
          imageUrl: '/images/nr33/riscos-atmosfericos.jpg'
        },
        {
          id: 'nr33-medicao-continua',
          title: 'Medição e Monitoramento Contínuo',
          content: 'É obrigatório medir a atmosfera antes e durante todo o trabalho usando detectores calibrados. Parâmetros obrigatórios: oxigênio entre 19,5% e 23%, gases tóxicos abaixo dos limites de tolerância, gases inflamáveis máximo 10% do limite inferior de explosividade. A medição deve ser contínua e alarmes devem ser configurados.',
          duration: 35,
          imageUrl: '/images/nr33/medicao-atmosfera.jpg'
        },
        {
          id: 'nr33-ventilacao',
          title: 'Sistemas de Ventilação Forçada',
          content: 'A ventilação adequada é fundamental: insuflação de ar puro na parte inferior do espaço, exaustão na parte superior para remover contaminantes, vazão suficiente para renovar o ar pelo menos 6 vezes por hora, e equipamentos à prova de explosão quando necessário. Nunca use oxigênio puro para ventilação.',
          duration: 32,
          imageUrl: '/images/nr33/ventilacao-forcada.jpg'
        },
        {
          id: 'nr33-permissao-entrada',
          title: 'Permissão de Entrada e Trabalho (PET)',
          content: 'A PET é documento obrigatório que deve conter: identificação do espaço confinado, finalidade da entrada, data e horário, medições atmosféricas, equipamentos utilizados, procedimentos de resgate, equipe envolvida com assinaturas, e validade máxima de um turno de trabalho.',
          duration: 30,
          imageUrl: '/images/nr33/permissao-entrada.jpg'
        },
        {
          id: 'nr33-equipe-trabalho',
          title: 'Responsabilidades da Equipe',
          content: 'A equipe mínima inclui: Supervisor de Entrada que autoriza e acompanha, Vigia que permanece do lado externo em comunicação constante, Trabalhadores Autorizados com treinamento específico, e Equipe de Resgate treinada e equipada. Cada função tem responsabilidades específicas e não podem ser acumuladas.',
          duration: 35,
          imageUrl: '/images/nr33/equipe-responsabilidades.jpg'
        },
        {
          id: 'nr33-equipamentos',
          title: 'Equipamentos de Proteção e Segurança',
          content: 'Equipamentos obrigatórios: detectores de gases calibrados, equipamentos de ventilação forçada, equipamentos de comunicação, cinturões de segurança com retrieval, tripé ou suporte para resgate, equipamentos de iluminação à prova de explosão, e equipamentos de resgate incluindo respiradores autônomos.',
          duration: 32,
          imageUrl: '/images/nr33/equipamentos-protecao.jpg'
        },
        {
          id: 'nr33-procedimentos-entrada',
          title: 'Procedimentos Seguros de Entrada',
          content: 'Sequência obrigatória: isolamento energético do espaço, purga e limpeza quando necessário, ventilação forçada contínua, medição atmosférica, emissão da PET, posicionamento do vigia, teste de comunicação, entrada controlada com equipamentos de proteção, e monitoramento contínuo durante todo trabalho.',
          duration: 38,
          imageUrl: '/images/nr33/procedimentos-entrada.jpg'
        },
        {
          id: 'nr33-emergencias',
          title: 'Procedimentos de Emergência e Resgate',
          content: 'Em emergências: o vigia aciona imediatamente o resgate sem abandonar o posto, trabalhadores saem imediatamente se possível, equipe de resgate usa equipamentos autônomos de respiração, vítimas são retiradas o mais rápido possível, primeiros socorros são prestados fora do espaço, e serviços médicos especializados são acionados.',
          duration: 35,
          imageUrl: '/images/nr33/emergencias-resgate.jpg'
        },
        {
          id: 'nr33-capacitacao',
          title: 'Treinamento e Capacitação Específica',
          content: 'Treinamento obrigatório de 40 horas para supervisores, 16 horas para trabalhadores autorizados, reciclagem anual, simulados periódicos de resgate, conhecimento específico dos riscos, uso correto de equipamentos, e certificação médica específica. O treinamento deve ser prático e incluir situações reais.',
          duration: 30,
          imageUrl: '/images/nr33/treinamento-capacitacao.jpg'
        },
        {
          id: 'nr33-prevencao',
          title: 'Cultura de Prevenção e Melhores Práticas',
          content: 'Princípios fundamentais: nunca entre em espaço confinado sem autorização, sempre trabalhe em equipe, mantenha comunicação constante, respeite todos os procedimentos, questione condições suspeitas, mantenha equipamentos calibrados, e lembre-se que em espaços confinados não existe segunda chance para erros.',
          duration: 28,
          imageUrl: '/images/nr33/cultura-prevencao.jpg'
        }
      ]
    }
  ]

  // Obter todos os templates
  static getAllTemplates(): NRTemplate[] {
    return this.TEMPLATES
  }

  // Obter template por ID
  static getTemplateById(id: string): NRTemplate | null {
    return this.TEMPLATES.find(template => template.id === id) || null
  }

  // Obter templates por NR
  static getTemplatesByNR(nr: string): NRTemplate[] {
    return this.TEMPLATES.filter(template => template.nr === nr)
  }

  // Obter templates por categoria
  static getTemplatesByCategory(category: string): NRTemplate[] {
    return this.TEMPLATES.filter(template => template.category === category)
  }

  // Buscar templates por palavra-chave
  static searchTemplates(query: string): NRTemplate[] {
    const lowercaseQuery = query.toLowerCase()
    return this.TEMPLATES.filter(template => 
      template.title.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
      template.category.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Obter estatísticas dos templates
  static getTemplateStats() {
    const total = this.TEMPLATES.length
    const byNR = {
      'NR-10': this.TEMPLATES.filter(t => t.nr === 'NR-10').length,
      'NR-35': this.TEMPLATES.filter(t => t.nr === 'NR-35').length,
      'NR-33': this.TEMPLATES.filter(t => t.nr === 'NR-33').length
    }
    const totalDuration = this.TEMPLATES.reduce((sum, t) => sum + t.duration_minutes, 0)
    const avgDuration = Math.round(totalDuration / total)

    return { total, byNR, totalDuration, avgDuration }
  }

  // Recomendar template baseado no perfil
  static recommendTemplate(userProfile: {
    role?: string
    experience?: 'beginner' | 'intermediate' | 'advanced'
    industry?: string
  }): NRTemplate[] {
    // Lógica de recomendação baseada no perfil
    let recommended = [...this.TEMPLATES]

    if (userProfile.experience === 'beginner') {
      // Priorizar templates básicos
      recommended = recommended.filter(t => 
        t.title.includes('Básico') || t.duration_minutes <= 40
      )
    }

    if (userProfile.industry) {
      // Filtrar por setor industrial se especificado
      const industryMap: Record<string, string[]> = {
        'eletrico': ['NR-10'],
        'construcao': ['NR-35', 'NR-18'],
        'industrial': ['NR-33', 'NR-10'],
        'manutencao': ['NR-10', 'NR-33', 'NR-35']
      }
      
      const relevantNRs = industryMap[userProfile.industry.toLowerCase()] || []
      if (relevantNRs.length > 0) {
        recommended = recommended.filter(t => 
          relevantNRs.includes(t.nr)
        )
      }
    }

    return recommended.slice(0, 5) // Top 5 recomendações
  }
}
