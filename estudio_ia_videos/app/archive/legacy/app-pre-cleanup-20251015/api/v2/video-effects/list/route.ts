
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Effect categories and library
    const effectLibrary = [
      // Particle Effects
      {
        id: 'particles-energy',
        name: 'Partículas de Energia',
        category: 'Partículas',
        description: 'Efeito de partículas energéticas flutuantes',
        thumbnail: '/effects/particles-energy.jpg',
        premium: false,
        config: {
          id: 'particles-energy',
          name: 'Partículas de Energia',
          type: 'particle',
          enabled: false,
          intensity: 0.5,
          params: { 
            color: '#ffffff', 
            speed: 1, 
            count: 50,
            size: 2,
            opacity: 0.8
          }
        }
      },
      {
        id: 'particles-snow',
        name: 'Neve Digital',
        category: 'Partículas',
        description: 'Efeito de neve digital suave',
        thumbnail: '/effects/particles-snow.jpg',
        premium: false,
        config: {
          id: 'particles-snow',
          name: 'Neve Digital',
          type: 'particle',
          enabled: false,
          intensity: 0.3,
          params: { 
            color: '#ffffff', 
            speed: 0.5, 
            count: 100,
            size: 1,
            gravity: true
          }
        }
      },
      {
        id: 'particles-sparks',
        name: 'Faíscas Elétricas',
        category: 'Partículas',
        description: 'Efeito de faíscas para treinamentos elétricos',
        thumbnail: '/effects/particles-sparks.jpg',
        premium: true,
        config: {
          id: 'particles-sparks',
          name: 'Faíscas Elétricas',
          type: 'particle',
          enabled: false,
          intensity: 0.7,
          params: { 
            color: '#fbbf24', 
            speed: 2, 
            count: 25,
            size: 3,
            electric: true
          }
        }
      },

      // Transition Effects
      {
        id: 'transition-wipe',
        name: 'Transição Wipe',
        category: 'Transições',
        description: 'Transição suave tipo wipe lateral',
        thumbnail: '/effects/transition-wipe.jpg',
        premium: false,
        config: {
          id: 'transition-wipe',
          name: 'Transição Wipe',
          type: 'transition',
          enabled: false,
          intensity: 1,
          params: { 
            direction: 'left', 
            duration: 1000,
            easing: 'ease-in-out'
          }
        }
      },
      {
        id: 'transition-dissolve',
        name: 'Dissolução',
        category: 'Transições',
        description: 'Transição por dissolução suave',
        thumbnail: '/effects/transition-dissolve.jpg',
        premium: false,
        config: {
          id: 'transition-dissolve',
          name: 'Dissolução',
          type: 'transition',
          enabled: false,
          intensity: 0.8,
          params: { 
            duration: 800,
            opacity: 0.5
          }
        }
      },
      {
        id: 'transition-cube',
        name: 'Cubo 3D',
        category: 'Transições',
        description: 'Transição com efeito de cubo rotativo',
        thumbnail: '/effects/transition-cube.jpg',
        premium: true,
        config: {
          id: 'transition-cube',
          name: 'Cubo 3D',
          type: 'transition',
          enabled: false,
          intensity: 1,
          params: { 
            duration: 1200,
            axis: 'y',
            perspective: 1000
          }
        }
      },

      // Filter Effects
      {
        id: 'filter-cinematic',
        name: 'Filtro Cinematográfico',
        category: 'Filtros',
        description: 'Correção de cor estilo cinema',
        thumbnail: '/effects/filter-cinematic.jpg',
        premium: true,
        config: {
          id: 'filter-cinematic',
          name: 'Filtro Cinematográfico',
          type: 'filter',
          enabled: false,
          intensity: 0.6,
          params: { 
            color: '#ff6b6b', 
            saturation: 1.2, 
            contrast: 1.1,
            shadows: 0.9,
            highlights: 1.1
          }
        }
      },
      {
        id: 'filter-vintage',
        name: 'Vintage',
        category: 'Filtros',
        description: 'Efeito vintage com grão de filme',
        thumbnail: '/effects/filter-vintage.jpg',
        premium: false,
        config: {
          id: 'filter-vintage',
          name: 'Vintage',
          type: 'filter',
          enabled: false,
          intensity: 0.5,
          params: { 
            sepia: 0.3, 
            grain: 0.2, 
            vignette: 0.4
          }
        }
      },
      {
        id: 'filter-corporate',
        name: 'Corporativo Limpo',
        category: 'Filtros',
        description: 'Look profissional para treinamentos',
        thumbnail: '/effects/filter-corporate.jpg',
        premium: false,
        config: {
          id: 'filter-corporate',
          name: 'Corporativo Limpo',
          type: 'filter',
          enabled: false,
          intensity: 0.4,
          params: { 
            brightness: 1.1, 
            contrast: 1.05, 
            clarity: 1.2
          }
        }
      },

      // Motion Graphics
      {
        id: 'motion-title',
        name: 'Títulos Animados',
        category: 'Motion Graphics',
        description: 'Títulos com animações profissionais',
        thumbnail: '/effects/motion-title.jpg',
        premium: true,
        config: {
          id: 'motion-title',
          name: 'Títulos Animados',
          type: 'motion',
          enabled: false,
          intensity: 0.8,
          params: { 
            speed: 1, 
            scale: 1, 
            rotation: 0,
            fontFamily: 'Roboto',
            fontSize: 48,
            color: '#ffffff'
          }
        }
      },
      {
        id: 'motion-lower-third',
        name: 'Lower Third',
        category: 'Motion Graphics',
        description: 'Legendas animadas inferiores',
        thumbnail: '/effects/motion-lower-third.jpg',
        premium: false,
        config: {
          id: 'motion-lower-third',
          name: 'Lower Third',
          type: 'motion',
          enabled: false,
          intensity: 1,
          params: { 
            position: 'bottom-left',
            background: 'rgba(0,0,0,0.8)',
            textColor: '#ffffff'
          }
        }
      },
      {
        id: 'motion-callouts',
        name: 'Callouts Animados',
        category: 'Motion Graphics',
        description: 'Elementos de destaque animados',
        thumbnail: '/effects/motion-callouts.jpg',
        premium: true,
        config: {
          id: 'motion-callouts',
          name: 'Callouts Animados',
          type: 'motion',
          enabled: false,
          intensity: 0.9,
          params: { 
            style: 'pulse',
            color: '#3b82f6',
            size: 1.2,
            duration: 2000
          }
        }
      }
    ]

    // Performance metrics for each effect
    const effectsWithMetrics = effectLibrary.map(effect => ({
      ...effect,
      performance: {
        renderImpact: effect.premium ? 'medium' : 'low',
        fileSize: effect.premium ? '+15%' : '+5%',
        compatibility: '4K Ready'
      }
    }))

    return NextResponse.json({
      effects: effectsWithMetrics,
      categories: [
        { id: 'particles', name: 'Partículas', count: 3 },
        { id: 'transitions', name: 'Transições', count: 3 },
        { id: 'filters', name: 'Filtros', count: 3 },
        { id: 'motion', name: 'Motion Graphics', count: 3 }
      ],
      total: effectsWithMetrics.length,
      premium: effectsWithMetrics.filter(e => e.premium).length
    })
  } catch (error) {
    console.error('Error listing video effects:', error)
    return NextResponse.json(
      { error: 'Failed to load effects library' },
      { status: 500 }
    )
  }
}
