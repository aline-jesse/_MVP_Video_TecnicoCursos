

// Sistema de Mascotes Personalizáveis para Empresas
export interface MascotTemplate {
  id: string
  name: string
  type: 'animal' | 'object' | 'character' | 'abstract'
  industry: 'industrial' | 'corporativo' | 'educacional' | 'saude' | 'tecnologia' | 'geral'
  base_design: {
    colors: string[]
    style: '2d' | '3d' | 'cartoon' | 'realistic'
    size_category: 'pequeno' | 'medio' | 'grande'
    complexity: 'simples' | 'moderado' | 'detalhado'
  }
  animations: {
    welcome: string[]
    explain: string[]
    celebrate: string[]
    warning: string[]
    goodbye: string[]
  }
  voice_style: 'infantil' | 'jovem' | 'adulto' | 'robotico' | 'amigavel'
  personality_traits: string[]
  customizable_elements: string[]
  premium: boolean
}

export interface MascotCustomization {
  template_id: string
  company_branding: {
    primary_color: string
    secondary_color: string
    logo_integration: boolean
    company_name: string
    slogan?: string
  }
  personality: {
    name: string
    catchphrase?: string
    style: 'profissional' | 'descontraido' | 'energetico' | 'calmo'
    interaction_level: 'baixo' | 'medio' | 'alto'
  }
  visual_customization: {
    clothing?: string
    accessories?: string[]
    background_theme?: string
    animation_speed?: 'lento' | 'normal' | 'rapido'
  }
}

export class MascotSystem {
  
  static readonly MASCOT_TEMPLATES: MascotTemplate[] = [
    // === MASCOTES INDUSTRIAIS === //
    {
      id: 'safety-bear',
      name: 'Urso da Segurança',
      type: 'animal',
      industry: 'industrial',
      base_design: {
        colors: ['#FF6B35', '#004E89', '#FFFFFF'],
        style: '3d',
        size_category: 'medio',
        complexity: 'moderado'
      },
      animations: {
        welcome: ['acenar_capacete', 'sorrir_acolhedor'],
        explain: ['apontar_quadro', 'demonstrar_epi'],
        celebrate: ['pular_alegria', 'dar_ok'],
        warning: ['balançar_dedo', 'mostrar_perigo'],
        goodbye: ['acenar_despedida', 'thumbs_up']
      },
      voice_style: 'amigavel',
      personality_traits: ['protetor', 'educativo', 'confiavel', 'experiente'],
      customizable_elements: ['cor_capacete', 'uniforme_empresa', 'logo_peito', 'cinto_ferramentas'],
      premium: false
    },

    {
      id: 'robo-compliance',
      name: 'Robô Compliance',
      type: 'character',
      industry: 'corporativo',
      base_design: {
        colors: ['#0066CC', '#FFFFFF', '#666666'],
        style: '3d',
        size_category: 'grande',
        complexity: 'detalhado'
      },
      animations: {
        welcome: ['scanear_ambiente', 'apresentar_dados'],
        explain: ['projetar_hologramas', 'calcular_metricas'],
        celebrate: ['lights_celebration', 'data_success'],
        warning: ['alerta_vermelho', 'scan_problemas'],
        goodbye: ['power_down_elegante', 'backup_completo']
      },
      voice_style: 'robotico',
      personality_traits: ['preciso', 'analitico', 'eficiente', 'confiavel'],
      customizable_elements: ['cor_led', 'logo_display', 'tema_interface', 'dados_empresa'],
      premium: true
    },

    // Adicionar mais mascotes...
  ]

  // Sistema de geração de mascotes por IA
  static async generateCustomMascot(requirements: {
    industry: string
    company_values: string[]
    target_audience: string
    brand_colors: string[]
    style_preference: string
  }): Promise<MascotTemplate> {
    
    // Simular geração por IA
    const generated: MascotTemplate = {
      id: `custom-${Date.now()}`,
      name: `Mascote ${requirements.industry}`,
      type: 'character',
      industry: requirements.industry as any,
      base_design: {
        colors: requirements.brand_colors,
        style: requirements.style_preference as any,
        size_category: 'medio',
        complexity: 'moderado'
      },
      animations: {
        welcome: ['entrada_marca', 'apresentacao_empresa'],
        explain: ['demonstrar_valores', 'explicar_processos'],
        celebrate: ['comemorar_conquistas', 'mostrar_orgulho'],
        warning: ['alertar_cuidados', 'lembrar_procedimentos'],
        goodbye: ['despedida_marca', 'call_to_action']
      },
      voice_style: 'amigavel',
      personality_traits: requirements.company_values,
      customizable_elements: ['cores_marca', 'logo_empresa', 'uniformes', 'acessorios'],
      premium: true
    }

    return generated
  }

  static getRecommendedMascots(industry: string): MascotTemplate[] {
    return this.MASCOT_TEMPLATES.filter(m => 
      m.industry === industry || m.industry === 'geral'
    ).sort((a, b) => (a.premium ? 1 : 0) - (b.premium ? 1 : 0))
  }
}

