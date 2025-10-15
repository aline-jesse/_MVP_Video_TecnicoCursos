

// Sistema Avançado de Avatares 3D Ultra-Realistas
export interface Avatar3D {
  id: string
  name: string
  category: 'professional' | 'casual' | 'technical' | 'executive' | 'instructor'
  appearance: {
    gender: 'male' | 'female' | 'neutral'
    ethnicity: 'caucasiano' | 'afrodescendente' | 'asiatico' | 'indigena' | 'pardo'
    age_range: 'jovem' | 'adulto' | 'senior'
    clothing: 'formal' | 'casual' | 'uniforme' | 'eps' | 'scrubs'
    hair_style: string
    facial_features: string
  }
  animations: {
    idle: string[]
    speaking: string[]
    gestures: string[]
    expressions: string[]
    reactions: string[]
  }
  voice_compatibility: string[]
  specializations: ('nr' | 'treinamento' | 'apresentacao' | 'vendas' | 'suporte')[]
  premium: boolean
  model_quality: 'standard' | 'hd' | 'ultra_hd'
  created_at: string
  popularity_score: number
}

export interface AvatarCustomization {
  avatar_base_id: string
  custom_name?: string
  clothing_color?: string
  background_environment?: string
  pose_style?: 'dinamico' | 'estatico' | 'interativo'
  expression_intensity?: 'suave' | 'moderado' | 'intenso'
  gesture_frequency?: 'baixa' | 'media' | 'alta'
  eye_contact_level?: 'direto' | 'ocasional' | 'natural'
}

export interface AvatarPerformanceMetrics {
  avatar_id: string
  engagement_score: number
  completion_rate: number
  user_feedback: number
  usage_count: number
  conversion_rate: number
}

export class Avatar3DSystem {
  
  // Catálogo expandido de avatares para treinamentos brasileiros
  static readonly AVATAR_CATALOG: Avatar3D[] = [
    // === AVATARES TÉCNICOS === //
    {
      id: 'tech-marcos-nr',
      name: 'Marcos - Especialista em NR',
      category: 'technical',
      appearance: {
        gender: 'male',
        ethnicity: 'pardo',
        age_range: 'adulto',
        clothing: 'uniforme',
        hair_style: 'curto_profissional',
        facial_features: 'expressivo_confiante'
      },
      animations: {
        idle: ['respiracao_natural', 'olhar_atento'],
        speaking: ['labios_sincronizados', 'movimento_cabeca'],
        gestures: ['apontar_segurança', 'demonstrar_epi', 'alertar_perigo'],
        expressions: ['seriedade', 'preocupacao', 'satisfacao'],
        reactions: ['aprovar', 'negar', 'alertar', 'explicar']
      },
      voice_compatibility: ['sp-carlos-tech', 'sp-roberto-safety', 'mg-eduardo-industrial'],
      specializations: ['nr', 'treinamento'],
      premium: false,
      model_quality: 'hd',
      created_at: '2025-08-30',
      popularity_score: 9.2
    },
    
    {
      id: 'corp-ana-executive',
      name: 'Ana - Executiva Corporativa',
      category: 'executive',
      appearance: {
        gender: 'female',
        ethnicity: 'caucasiano',
        age_range: 'adulto',
        clothing: 'formal',
        hair_style: 'longo_elegante',
        facial_features: 'profissional_carismatica'
      },
      animations: {
        idle: ['postura_ereta', 'sorriso_profissional'],
        speaking: ['gesticulacao_elegante', 'contato_visual'],
        gestures: ['apresentar_slides', 'enfatizar_pontos', 'acolher_audiencia'],
        expressions: ['confianca', 'empatia', 'determinacao'],
        reactions: ['concordar', 'esclarecer', 'motivar', 'liderar']
      },
      voice_compatibility: ['sp-ana-corporate', 'rj-patricia-executive', 'rs-lucia-professional'],
      specializations: ['apresentacao', 'treinamento', 'vendas'],
      premium: true,
      model_quality: 'ultra_hd',
      created_at: '2025-08-30',
      popularity_score: 9.5
    },

    {
      id: 'instr-joao-safety',
      name: 'João - Instrutor de Segurança',
      category: 'instructor',
      appearance: {
        gender: 'male',
        ethnicity: 'afrodescendente',
        age_range: 'senior',
        clothing: 'eps',
        hair_style: 'grisalho_experiente',
        facial_features: 'experiente_confiavel'
      },
      animations: {
        idle: ['vigilancia_ativa', 'observacao_ambiente'],
        speaking: ['demonstracao_pratica', 'enfase_seguranca'],
        gestures: ['mostrar_equipamentos', 'simular_procedimentos', 'alertar_riscos'],
        expressions: ['alerta', 'cuidado', 'aprovacao', 'preocupacao'],
        reactions: ['intervir_perigo', 'ensinar_procedimento', 'corrigir_erro']
      },
      voice_compatibility: ['ba-joao-instructor', 'pe-antonio-safety', 'ce-francisco-mentor'],
      specializations: ['nr', 'treinamento'],
      premium: false,
      model_quality: 'hd',
      created_at: '2025-08-30',
      popularity_score: 9.8
    },

    // Adicionar mais avatares...
  ]

  static getAvatarsByCategory(category: Avatar3D['category']): Avatar3D[] {
    return this.AVATAR_CATALOG.filter(avatar => avatar.category === category)
  }

  static getAvatarsByRegion(region: Avatar3D['appearance']['ethnicity']): Avatar3D[] {
    return this.AVATAR_CATALOG.filter(avatar => avatar.appearance.ethnicity === region)
  }

  static getCompatibleVoices(avatarId: string): string[] {
    const avatar = this.AVATAR_CATALOG.find(a => a.id === avatarId)
    return avatar?.voice_compatibility || []
  }

  static getRecommendedAvatars(content_type: 'nr' | 'corporate' | 'general'): Avatar3D[] {
    switch (content_type) {
      case 'nr':
        return this.AVATAR_CATALOG.filter(a => 
          a.specializations.includes('nr') || a.category === 'technical'
        ).sort((a, b) => b.popularity_score - a.popularity_score)
      
      case 'corporate':
        return this.AVATAR_CATALOG.filter(a => 
          a.category === 'executive' || a.specializations.includes('apresentacao')
        ).sort((a, b) => b.popularity_score - a.popularity_score)
      
      default:
        return this.AVATAR_CATALOG.sort((a, b) => b.popularity_score - a.popularity_score)
    }
  }
}

