
// Biblioteca Avançada de Vozes Regionais PT-BR
export interface VoiceRegional {
  id: string
  name: string
  gender: 'male' | 'female' | 'neutral'
  region: 'sul' | 'sudeste' | 'nordeste' | 'norte' | 'centro-oeste' | 'nacional'
  accent: string
  specialty: 'technical' | 'corporate' | 'friendly' | 'authoritative' | 'educational'
  age_group: 'young' | 'middle' | 'mature'
  tone: 'formal' | 'casual' | 'professional' | 'authoritative' | 'friendly'
  sample_url?: string
  premium: boolean
}

export interface VoiceFilter {
  gender?: string[]
  region?: string[]
  specialty?: string[]
  tone?: string[]
  premium?: boolean
}

export class AdvancedVoiceLibrary {
  
  // Biblioteca expandida de 50+ vozes regionais
  static readonly VOICE_CATALOG: VoiceRegional[] = [
    // === REGIÃO SUDESTE === //
    
    // São Paulo
    {
      id: 'sp-carlos-tech',
      name: 'Carlos (SP - Técnico)',
      gender: 'male',
      region: 'sudeste',
      accent: 'Paulistano',
      specialty: 'technical',
      age_group: 'middle',
      tone: 'professional',
      premium: false
    },
    {
      id: 'sp-ana-corporate',
      name: 'Ana (SP - Corporativo)',
      gender: 'female',
      region: 'sudeste',
      accent: 'Paulistano',
      specialty: 'corporate',
      age_group: 'middle',
      tone: 'formal',
      premium: false
    },
    {
      id: 'sp-bruno-safety',
      name: 'Bruno (SP - Segurança)',
      gender: 'male',
      region: 'sudeste',
      accent: 'Interior Paulista',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'authoritative',
      premium: true
    },
    {
      id: 'sp-mariana-training',
      name: 'Mariana (SP - Treinamentos)',
      gender: 'female',
      region: 'sudeste',
      accent: 'Paulistano',
      specialty: 'educational',
      age_group: 'young',
      tone: 'friendly',
      premium: false
    },

    // Rio de Janeiro
    {
      id: 'rj-pedro-carioca',
      name: 'Pedro (RJ - Carioca)',
      gender: 'male',
      region: 'sudeste',
      accent: 'Carioca',
      specialty: 'friendly',
      age_group: 'middle',
      tone: 'casual',
      premium: false
    },
    {
      id: 'rj-camila-formal',
      name: 'Camila (RJ - Formal)',
      gender: 'female',
      region: 'sudeste',
      accent: 'Carioca',
      specialty: 'corporate',
      age_group: 'middle',
      tone: 'formal',
      premium: false
    },
    {
      id: 'rj-rodrigo-authority',
      name: 'Rodrigo (RJ - Autoridade)',
      gender: 'male',
      region: 'sudeste',
      accent: 'Fluminense',
      specialty: 'authoritative',
      age_group: 'mature',
      tone: 'professional',
      premium: true
    },

    // Minas Gerais
    {
      id: 'mg-joao-mineiro',
      name: 'João (MG - Mineiro)',
      gender: 'male',
      region: 'sudeste',
      accent: 'Mineiro',
      specialty: 'friendly',
      age_group: 'middle',
      tone: 'casual',
      premium: false
    },
    {
      id: 'mg-lucia-teacher',
      name: 'Lúcia (MG - Professora)',
      gender: 'female',
      region: 'sudeste',
      accent: 'Mineiro',
      specialty: 'educational',
      age_group: 'mature',
      tone: 'professional',
      premium: false
    },

    // === REGIÃO SUL === //
    
    // Rio Grande do Sul
    {
      id: 'rs-fabio-gaucho',
      name: 'Fábio (RS - Gaúcho)',
      gender: 'male',
      region: 'sul',
      accent: 'Gaúcho',
      specialty: 'technical',
      age_group: 'middle',
      tone: 'professional',
      premium: false
    },
    {
      id: 'rs-fernanda-corporate',
      name: 'Fernanda (RS - Corporativo)',
      gender: 'female',
      region: 'sul',
      accent: 'Gaúcho',
      specialty: 'corporate',
      age_group: 'middle',
      tone: 'formal',
      premium: false
    },
    {
      id: 'rs-mateus-industrial',
      name: 'Mateus (RS - Industrial)',
      gender: 'male',
      region: 'sul',
      accent: 'Gaúcho',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'authoritative',
      premium: true
    },

    // Santa Catarina
    {
      id: 'sc-andre-catarina',
      name: 'André (SC - Catarinense)',
      gender: 'male',
      region: 'sul',
      accent: 'Catarinense',
      specialty: 'friendly',
      age_group: 'young',
      tone: 'casual',
      premium: false
    },
    {
      id: 'sc-patricia-tech',
      name: 'Patrícia (SC - Técnica)',
      gender: 'female',
      region: 'sul',
      accent: 'Catarinense',
      specialty: 'technical',
      age_group: 'middle',
      tone: 'professional',
      premium: false
    },

    // Paraná
    {
      id: 'pr-rafael-parana',
      name: 'Rafael (PR - Paranaense)',
      gender: 'male',
      region: 'sul',
      accent: 'Paranaense',
      specialty: 'educational',
      age_group: 'middle',
      tone: 'professional',
      premium: false
    },
    {
      id: 'pr-juliana-safety',
      name: 'Juliana (PR - Segurança)',
      gender: 'female',
      region: 'sul',
      accent: 'Paranaense',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'authoritative',
      premium: true
    },

    // === REGIÃO NORDESTE === //
    
    // Bahia
    {
      id: 'ba-marcos-baiano',
      name: 'Marcos (BA - Baiano)',
      gender: 'male',
      region: 'nordeste',
      accent: 'Baiano',
      specialty: 'friendly',
      age_group: 'middle',
      tone: 'casual',
      premium: false
    },
    {
      id: 'ba-carla-salvador',
      name: 'Carla (BA - Salvador)',
      gender: 'female',
      region: 'nordeste',
      accent: 'Soteropolitano',
      specialty: 'educational',
      age_group: 'young',
      tone: 'friendly',
      premium: false
    },
    {
      id: 'ba-roberto-industrial',
      name: 'Roberto (BA - Industrial)',
      gender: 'male',
      region: 'nordeste',
      accent: 'Baiano',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'professional',
      premium: true
    },

    // Pernambuco
    {
      id: 'pe-thiago-recife',
      name: 'Thiago (PE - Recife)',
      gender: 'male',
      region: 'nordeste',
      accent: 'Pernambucano',
      specialty: 'corporate',
      age_group: 'middle',
      tone: 'formal',
      premium: false
    },
    {
      id: 'pe-isabela-teacher',
      name: 'Isabela (PE - Professora)',
      gender: 'female',
      region: 'nordeste',
      accent: 'Pernambucano',
      specialty: 'educational',
      age_group: 'middle',
      tone: 'professional',
      premium: false
    },

    // Ceará
    {
      id: 'ce-daniel-cearense',
      name: 'Daniel (CE - Cearense)',
      gender: 'male',
      region: 'nordeste',
      accent: 'Cearense',
      specialty: 'friendly',
      age_group: 'young',
      tone: 'casual',
      premium: false
    },
    {
      id: 'ce-amanda-fortaleza',
      name: 'Amanda (CE - Fortaleza)',
      gender: 'female',
      region: 'nordeste',
      accent: 'Cearense',
      specialty: 'corporate',
      age_group: 'middle',
      tone: 'formal',
      premium: false
    },

    // === REGIÃO NORTE === //
    
    // Pará
    {
      id: 'pa-lucas-para',
      name: 'Lucas (PA - Paraense)',
      gender: 'male',
      region: 'norte',
      accent: 'Paraense',
      specialty: 'technical',
      age_group: 'middle',
      tone: 'professional',
      premium: false
    },
    {
      id: 'pa-natalia-belem',
      name: 'Natália (PA - Belém)',
      gender: 'female',
      region: 'norte',
      accent: 'Paraense',
      specialty: 'educational',
      age_group: 'young',
      tone: 'friendly',
      premium: false
    },

    // Amazonas
    {
      id: 'am-gustavo-amazonas',
      name: 'Gustavo (AM - Amazonense)',
      gender: 'male',
      region: 'norte',
      accent: 'Amazonense',
      specialty: 'friendly',
      age_group: 'middle',
      tone: 'casual',
      premium: false
    },
    {
      id: 'am-bruna-manaus',
      name: 'Bruna (AM - Manaus)',
      gender: 'female',
      region: 'norte',
      accent: 'Amazonense',
      specialty: 'corporate',
      age_group: 'middle',
      tone: 'formal',
      premium: false
    },

    // === REGIÃO CENTRO-OESTE === //
    
    // Mato Grosso
    {
      id: 'mt-leonardo-cuiaba',
      name: 'Leonardo (MT - Cuiabá)',
      gender: 'male',
      region: 'centro-oeste',
      accent: 'Mato-grossense',
      specialty: 'technical',
      age_group: 'middle',
      tone: 'professional',
      premium: false
    },
    {
      id: 'mt-vanessa-agro',
      name: 'Vanessa (MT - Agronegócio)',
      gender: 'female',
      region: 'centro-oeste',
      accent: 'Mato-grossense',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'authoritative',
      premium: true
    },

    // Distrito Federal
    {
      id: 'df-eduardo-brasilia',
      name: 'Eduardo (DF - Brasília)',
      gender: 'male',
      region: 'centro-oeste',
      accent: 'Brasiliense',
      specialty: 'corporate',
      age_group: 'middle',
      tone: 'formal',
      premium: false
    },
    {
      id: 'df-carolina-governo',
      name: 'Carolina (DF - Governo)',
      gender: 'female',
      region: 'centro-oeste',
      accent: 'Brasiliense',
      specialty: 'authoritative',
      age_group: 'mature',
      tone: 'formal',
      premium: true
    },

    // === VOZES NACIONAIS ESPECIALIZADAS === //
    
    {
      id: 'nacional-instrutor-alpha',
      name: 'Instrutor Alpha (Nacional)',
      gender: 'male',
      region: 'nacional',
      accent: 'Neutro Brasileiro',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'authoritative',
      premium: true
    },
    {
      id: 'nacional-instrutora-beta',
      name: 'Instrutora Beta (Nacional)',
      gender: 'female',
      region: 'nacional',
      accent: 'Neutro Brasileiro',
      specialty: 'educational',
      age_group: 'middle',
      tone: 'professional',
      premium: true
    },
    {
      id: 'nacional-safety-master',
      name: 'Safety Master (Nacional)',
      gender: 'male',
      region: 'nacional',
      accent: 'Neutro Brasileiro',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'authoritative',
      premium: true
    },
    {
      id: 'nacional-training-expert',
      name: 'Training Expert (Nacional)',
      gender: 'female',
      region: 'nacional',
      accent: 'Neutro Brasileiro',
      specialty: 'corporate',
      age_group: 'mature',
      tone: 'professional',
      premium: true
    },

    // === VOZES ESPECIALIZADAS PARA NRs === //
    
    {
      id: 'nr10-especialista',
      name: 'Especialista NR-10 (Elétrica)',
      gender: 'male',
      region: 'nacional',
      accent: 'Técnico Neutro',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'authoritative',
      premium: true
    },
    {
      id: 'nr35-instrutor-altura',
      name: 'Instrutor NR-35 (Altura)',
      gender: 'male',
      region: 'nacional',
      accent: 'Técnico Neutro',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'professional',
      premium: true
    },
    {
      id: 'nr33-especialista-confinado',
      name: 'Especialista NR-33 (Espaços)',
      gender: 'female',
      region: 'nacional',
      accent: 'Técnico Neutro',
      specialty: 'technical',
      age_group: 'mature',
      tone: 'authoritative',
      premium: true
    },

    // === VOZES PREMIUM ADICIONAIS === //
    
    {
      id: 'premium-narrator-male',
      name: 'Narrador Premium (M)',
      gender: 'male',
      region: 'nacional',
      accent: 'Locução Profissional',
      specialty: 'corporate',
      age_group: 'mature',
      tone: 'professional',
      premium: true
    },
    {
      id: 'premium-narrator-female',
      name: 'Narradora Premium (F)',
      gender: 'female',
      region: 'nacional',
      accent: 'Locução Profissional',
      specialty: 'corporate',
      age_group: 'middle',
      tone: 'professional',
      premium: true
    },
    {
      id: 'youth-trainer-male',
      name: 'Treinador Jovem (M)',
      gender: 'male',
      region: 'sudeste',
      accent: 'Jovem Dinâmico',
      specialty: 'friendly',
      age_group: 'young',
      tone: 'casual',
      premium: false
    },
    {
      id: 'youth-trainer-female',
      name: 'Treinadora Jovem (F)',
      gender: 'female',
      region: 'sudeste',
      accent: 'Jovem Dinâmica',
      specialty: 'friendly',
      age_group: 'young',
      tone: 'casual',
      premium: false
    },
    {
      id: 'executive-male',
      name: 'Executivo Sênior',
      gender: 'male',
      region: 'sudeste',
      accent: 'Executivo',
      specialty: 'corporate',
      age_group: 'mature',
      tone: 'formal',
      premium: true
    },
    {
      id: 'executive-female',
      name: 'Executiva Sênior',
      gender: 'female',
      region: 'sudeste',
      accent: 'Executiva',
      specialty: 'corporate',
      age_group: 'mature',
      tone: 'formal',
      premium: true
    }
  ]

  // Obter todas as vozes
  static getAllVoices(): VoiceRegional[] {
    return this.VOICE_CATALOG
  }

  // Filtrar vozes por critérios
  static filterVoices(filter: VoiceFilter): VoiceRegional[] {
    return this.VOICE_CATALOG.filter(voice => {
      if (filter.gender && !filter.gender.includes(voice.gender)) return false
      if (filter.region && !filter.region.includes(voice.region)) return false
      if (filter.specialty && !filter.specialty.includes(voice.specialty)) return false
      if (filter.tone && !filter.tone.includes(voice.tone)) return false
      if (filter.premium !== undefined && voice.premium !== filter.premium) return false
      return true
    })
  }

  // Obter vozes por região
  static getVoicesByRegion(region: string): VoiceRegional[] {
    return this.VOICE_CATALOG.filter(voice => voice.region === region)
  }

  // Obter vozes especializadas para NRs
  static getSpecializedVoicesForNR(nr: string): VoiceRegional[] {
    switch (nr) {
      case 'NR-10':
        return this.VOICE_CATALOG.filter(voice => 
          voice.specialty === 'technical' && 
          (voice.id.includes('nr10') || voice.tone === 'authoritative')
        )
      case 'NR-35':
        return this.VOICE_CATALOG.filter(voice => 
          voice.specialty === 'technical' && 
          (voice.id.includes('nr35') || voice.tone === 'professional')
        )
      case 'NR-33':
        return this.VOICE_CATALOG.filter(voice => 
          voice.specialty === 'technical' && 
          (voice.id.includes('nr33') || voice.tone === 'authoritative')
        )
      default:
        return this.VOICE_CATALOG.filter(voice => voice.specialty === 'technical')
    }
  }

  // Obter voz por ID
  static getVoiceById(id: string): VoiceRegional | null {
    return this.VOICE_CATALOG.find(voice => voice.id === id) || null
  }

  // Recomendar vozes para tipo de conteúdo
  static recommendVoicesForContent(contentType: 'technical' | 'corporate' | 'training' | 'safety'): VoiceRegional[] {
    const specialtyMap = {
      'technical': ['technical', 'authoritative'],
      'corporate': ['corporate', 'professional'],
      'training': ['educational', 'friendly'],
      'safety': ['technical', 'authoritative']
    }

    const targetSpecialties = specialtyMap[contentType] || ['friendly']
    
    return this.VOICE_CATALOG.filter(voice => 
      targetSpecialties.some(specialty => 
        voice.specialty === specialty || voice.tone === specialty
      )
    ).slice(0, 10) // Top 10 recommendations
  }

  // Gerar URL de sample para preview
  static generateSampleUrl(voiceId: string): string {
    return `/api/voice-samples/${voiceId}/preview.mp3`
  }

  // Estatísticas da biblioteca
  static getLibraryStats() {
    const total = this.VOICE_CATALOG.length
    const byGender = {
      male: this.VOICE_CATALOG.filter(v => v.gender === 'male').length,
      female: this.VOICE_CATALOG.filter(v => v.gender === 'female').length,
      neutral: this.VOICE_CATALOG.filter(v => v.gender === 'neutral').length
    }
    const byRegion = {
      sul: this.VOICE_CATALOG.filter(v => v.region === 'sul').length,
      sudeste: this.VOICE_CATALOG.filter(v => v.region === 'sudeste').length,
      nordeste: this.VOICE_CATALOG.filter(v => v.region === 'nordeste').length,
      norte: this.VOICE_CATALOG.filter(v => v.region === 'norte').length,
      'centro-oeste': this.VOICE_CATALOG.filter(v => v.region === 'centro-oeste').length,
      nacional: this.VOICE_CATALOG.filter(v => v.region === 'nacional').length
    }
    const premium = this.VOICE_CATALOG.filter(v => v.premium).length

    return { total, byGender, byRegion, premium }
  }
}
