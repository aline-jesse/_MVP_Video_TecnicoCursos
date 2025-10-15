/**
 * NR-10: SEGURANÇA EM INSTALAÇÕES E SERVIÇOS EM ELETRICIDADE
 * Template de conformidade para treinamentos
 */

export const NR10_TEMPLATE = {
  nr: 'NR-10',
  name: 'Segurança em Instalações e Serviços em Eletricidade',
  description: 'Norma Regulamentadora sobre segurança em instalações e serviços em eletricidade',
  version: '2023',
  
  requiredTopics: [
    {
      id: 'nr10_intro',
      title: 'Introdução à NR-10',
      keywords: ['nr-10', 'eletricidade', 'segurança elétrica', 'instalações elétricas'],
      minDuration: 30,
      mandatory: true,
      description: 'Apresentação da NR-10 e conceitos básicos de segurança elétrica'
    },
    {
      id: 'nr10_riscos',
      title: 'Riscos Elétricos',
      keywords: ['choque elétrico', 'arco elétrico', 'queimaduras', 'explosão', 'incêndio'],
      minDuration: 90,
      mandatory: true,
      description: 'Identificação e análise dos riscos elétricos'
    },
    {
      id: 'nr10_medidas_protecao',
      title: 'Medidas de Proteção',
      keywords: ['proteção coletiva', 'proteção individual', 'aterramento', 'isolação', 'seccionamento'],
      minDuration: 120,
      mandatory: true,
      description: 'Medidas de proteção contra riscos elétricos'
    },
    {
      id: 'nr10_epi_epc',
      title: 'EPI e EPC para Eletricidade',
      keywords: ['epi elétrico', 'epc elétrico', 'luvas isolantes', 'capacete classe b', 'detector tensão'],
      minDuration: 75,
      mandatory: true,
      description: 'Equipamentos de proteção específicos para trabalhos elétricos'
    },
    {
      id: 'nr10_procedimentos',
      title: 'Procedimentos de Trabalho',
      keywords: ['procedimentos segurança', 'autorização trabalho', 'bloqueio', 'sinalização', 'liberação'],
      minDuration: 90,
      mandatory: true,
      description: 'Procedimentos seguros para trabalhos em eletricidade'
    },
    {
      id: 'nr10_desenergizacao',
      title: 'Desenergização',
      keywords: ['desenergização', 'seccionamento', 'impedimento', 'constatação', 'sinalização'],
      minDuration: 120,
      mandatory: true,
      description: 'Procedimentos de desenergização de instalações elétricas'
    },
    {
      id: 'nr10_energizado',
      title: 'Trabalhos em Instalações Energizadas',
      keywords: ['trabalho energizado', 'linha viva', 'distâncias segurança', 'técnicas trabalho'],
      minDuration: 90,
      mandatory: true,
      description: 'Procedimentos para trabalhos em instalações energizadas'
    },
    {
      id: 'nr10_emergencia',
      title: 'Situações de Emergência',
      keywords: ['emergência elétrica', 'primeiros socorros', 'combate incêndio', 'resgate'],
      minDuration: 75,
      mandatory: true,
      description: 'Procedimentos de emergência em acidentes elétricos'
    }
  ],
  
  criticalPoints: [
    'Demonstração de procedimentos de desenergização',
    'Uso correto de EPIs elétricos',
    'Medição e verificação de ausência de tensão',
    'Técnicas de primeiros socorros em acidentes elétricos',
    'Identificação de riscos em instalações elétricas',
    'Procedimentos de bloqueio e sinalização'
  ],
  
  requiredImages: [
    'EPIs específicos para eletricidade',
    'Procedimentos de desenergização',
    'Equipamentos de medição e teste',
    'Sinalização de segurança elétrica',
    'Situações de risco elétrico'
  ],
  
  assessmentCriteria: {
    minScore: 80,
    minCompletionRate: 90,
    mandatoryTopicsCompleted: true,
    criticalPointsCovered: true
  }
}