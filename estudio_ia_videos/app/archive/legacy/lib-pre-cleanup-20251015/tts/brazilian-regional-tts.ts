

// Sistema TTS com Sotaques Regionais Brasileiros Ultra-Realistas
export interface BrazilianVoiceRegional {
  id: string
  display_name: string
  region: {
    name: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul'
    state: string
    city?: string
    accent_description: string
  }
  characteristics: {
    gender: 'masculino' | 'feminino' | 'neutro'
    age_group: '18-25' | '26-35' | '36-50' | '51-65' | '65+'
    tone: 'formal' | 'informal' | 'tecnico' | 'amigavel' | 'autoritativo'
    pace: 'lento' | 'normal' | 'rapido'
    pronunciation_style: 'carioca' | 'paulista' | 'gaucho' | 'nordestino' | 'goiano' | 'paraense'
  }
  specialties: {
    industries: string[]
    content_types: ('nr' | 'treinamento' | 'apresentacao' | 'marketing' | 'educacional')[]
    technical_terms: boolean
    colloquial_expressions: boolean
  }
  audio_quality: {
    sample_rate: '22kHz' | '44kHz' | '48kHz'
    format: 'mp3' | 'wav' | 'ogg'
    neural_quality: 'standard' | 'premium' | 'studio'
  }
  pricing_tier: 'gratuito' | 'basico' | 'premium' | 'enterprise'
  preview_text: string
}

export class BrazilianRegionalTTS {
  
  static readonly REGIONAL_VOICES: BrazilianVoiceRegional[] = [
    // === REGIÃO SUDESTE === //
    {
      id: 'sp-carlos-industrial',
      display_name: 'Carlos (São Paulo) - Instrutor Industrial',
      region: {
        name: 'Sudeste',
        state: 'São Paulo',
        city: 'São Paulo',
        accent_description: 'Sotaque paulistano técnico, claro e objetivo'
      },
      characteristics: {
        gender: 'masculino',
        age_group: '36-50',
        tone: 'tecnico',
        pace: 'normal',
        pronunciation_style: 'paulista'
      },
      specialties: {
        industries: ['industrial', 'manufatura', 'construcao'],
        content_types: ['nr', 'treinamento'],
        technical_terms: true,
        colloquial_expressions: false
      },
      audio_quality: {
        sample_rate: '48kHz',
        format: 'wav',
        neural_quality: 'premium'
      },
      pricing_tier: 'gratuito',
      preview_text: 'Bem-vindos ao treinamento de segurança. Vamos aprender sobre os procedimentos essenciais da NR-12.'
    },

    {
      id: 'rj-maria-corporate',
      display_name: 'Maria (Rio de Janeiro) - Executiva',
      region: {
        name: 'Sudeste',
        state: 'Rio de Janeiro',
        city: 'Rio de Janeiro',
        accent_description: 'Sotaque carioca elegante e carismático'
      },
      characteristics: {
        gender: 'feminino',
        age_group: '26-35',
        tone: 'amigavel',
        pace: 'normal',
        pronunciation_style: 'carioca'
      },
      specialties: {
        industries: ['corporativo', 'servicos', 'consultoria'],
        content_types: ['apresentacao', 'marketing', 'treinamento'],
        technical_terms: false,
        colloquial_expressions: true
      },
      audio_quality: {
        sample_rate: '44kHz',
        format: 'mp3',
        neural_quality: 'premium'
      },
      pricing_tier: 'premium',
      preview_text: 'Olá! Que bom ter vocês aqui. Vamos juntos descobrir como nossa empresa pode crescer ainda mais.'
    },

    // === REGIÃO NORDESTE === //
    {
      id: 'ba-antonio-mentor',
      display_name: 'Antônio (Bahia) - Mentor Técnico',
      region: {
        name: 'Nordeste',
        state: 'Bahia',
        city: 'Salvador',
        accent_description: 'Sotaque baiano acolhedor e experiente'
      },
      characteristics: {
        gender: 'masculino',
        age_group: '51-65',
        tone: 'amigavel',
        pace: 'lento',
        pronunciation_style: 'nordestino'
      },
      specialties: {
        industries: ['petroleo', 'petroquimica', 'industrial'],
        content_types: ['nr', 'treinamento', 'educacional'],
        technical_terms: true,
        colloquial_expressions: true
      },
      audio_quality: {
        sample_rate: '44kHz',
        format: 'wav',
        neural_quality: 'studio'
      },
      pricing_tier: 'premium',
      preview_text: 'Meu amigo, vamos aprender juntos sobre segurança no trabalho. A experiência ensina que prevenção é tudo.'
    },

    // === REGIÃO SUL === //
    {
      id: 'rs-lucia-professional',
      display_name: 'Lúcia (Rio Grande do Sul) - Profissional',
      region: {
        name: 'Sul',
        state: 'Rio Grande do Sul',
        city: 'Porto Alegre',
        accent_description: 'Sotaque gaúcho determinado e claro'
      },
      characteristics: {
        gender: 'feminino',
        age_group: '36-50',
        tone: 'formal',
        pace: 'normal',
        pronunciation_style: 'gaucho'
      },
      specialties: {
        industries: ['agronegocio', 'industrial', 'logistica'],
        content_types: ['treinamento', 'apresentacao'],
        technical_terms: true,
        colloquial_expressions: false
      },
      audio_quality: {
        sample_rate: '48kHz',
        format: 'wav',
        neural_quality: 'premium'
      },
      pricing_tier: 'basico',
      preview_text: 'Tchê, vamos nos organizar para aprender sobre os procedimentos de segurança de forma eficiente.'
    }
  ]

  // Gerador de fala regional personalizada
  static async generateRegionalSpeech(
    text: string, 
    voiceId: string, 
    options?: {
      speed?: number
      emotion?: 'neutro' | 'animado' | 'serio' | 'preocupado'
      emphasis_words?: string[]
      regional_expressions?: boolean
    }
  ): Promise<{
    audio_url: string
    transcript: string
    emotion_markers: Array<{timestamp: number, emotion: string}>
    regional_adaptations: string[]
  }> {
    
    const voice = this.REGIONAL_VOICES.find(v => v.id === voiceId)
    if (!voice) throw new Error('Voz regional não encontrada')

    // Aplicar adaptações regionais no texto
    let adaptedText = text
    
    if (options?.regional_expressions && voice.specialties.colloquial_expressions) {
      adaptedText = this.applyRegionalExpressions(text, voice.region.name)
    }

    // Simular geração de áudio (em produção integraria com Google TTS ou ElevenLabs)
    const audioUrl = `/api/tts/generate/${voiceId}/${encodeURIComponent(adaptedText)}`
    
    return {
      audio_url: audioUrl,
      transcript: adaptedText,
      emotion_markers: [
        { timestamp: 0, emotion: options?.emotion || 'neutro' }
      ],
      regional_adaptations: [
        'Pronúncia regional aplicada',
        'Entonação característica da região',
        'Velocidade ajustada ao estilo local'
      ]
    }
  }

  // Aplicar expressões regionais típicas
  private static applyRegionalExpressions(text: string, region: BrazilianVoiceRegional['region']['name']): string {
    let adapted = text

    switch (region) {
      case 'Sul':
        adapted = adapted.replace(/\bvocê\b/g, 'tu')
        adapted = adapted.replace(/legal/g, 'massa')
        adapted = adapted.replace(/pessoal/g, 'pessoal')
        break
        
      case 'Nordeste':
        adapted = adapted.replace(/muito bom/g, 'massa demais')
        adapted = adapted.replace(/entender/g, 'sacar')
        adapted = adapted.replace(/vamos/g, 'bora')
        break
        
      case 'Norte':
        adapted = adapted.replace(/legal/g, 'maneiro')
        adapted = adapted.replace(/rapido/g, 'ligeiro')
        break
        
      // Adicionar mais regiões...
    }

    return adapted
  }

  static getVoicesByRegion(region: string): BrazilianVoiceRegional[] {
    return this.REGIONAL_VOICES.filter(v => v.region.name === region)
  }

  static getVoicesForIndustry(industry: string): BrazilianVoiceRegional[] {
    return this.REGIONAL_VOICES.filter(v => v.specialties.industries.includes(industry))
  }

  static getRecommendedVoiceForContent(contentType: string, targetAudience: string): BrazilianVoiceRegional[] {
    return this.REGIONAL_VOICES.filter(v => 
      v.specialties.content_types.includes(contentType as any)
    ).sort((a, b) => {
      // Priorizar vozes gratuitas para demonstração
      if (a.pricing_tier === 'gratuito' && b.pricing_tier !== 'gratuito') return -1
      if (b.pricing_tier === 'gratuito' && a.pricing_tier !== 'gratuito') return 1
      return 0
    })
  }
}

