
'use client'

/**
 * 🎬 EFFECTS LIBRARY - Hollywood Grade Effects Suite
 * Página principal da biblioteca de efeitos com GSAP, Three.js e Lottie
 */

import { useState, Suspense, lazy } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import AppShell from '../../components/layouts/AppShell'

// Lazy load the heavy 3D components to avoid SSR issues
const GSAPEffectsStudio = lazy(() => import('../../components/effects/gsap-effects-studio'))
const ParticleEffectsEditor = lazy(() => import('../../components/effects/particle-effects-editor'))
const LottieAnimationStudio = lazy(() => import('../../components/effects/lottie-animation-studio'))
import {
  Sparkles,
  Zap,
  Wind,
  Star,
  Palette,
  Film,
  Layers,
  Play,
  Download,
  Crown,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

interface EffectSuite {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'animations' | 'particles' | 'vectors'
  features: string[]
  stats: {
    effects: number
    popularity: number
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  }
  premium: boolean
  component: React.ComponentType
}

const effectSuites: EffectSuite[] = [
  {
    id: 'gsap-studio',
    name: 'GSAP Effects Studio',
    description: 'Biblioteca premium de animações cinematográficas usando GSAP',
    icon: <Sparkles className="h-8 w-8" />,
    category: 'animations',
    features: [
      '200+ efeitos de transição',
      'Timeline profissional',
      'Custom easing functions',
      'Physics-based animations',
      'Morphing & transformations',
      'Real-time preview'
    ],
    stats: {
      effects: 247,
      popularity: 96,
      difficulty: 'Advanced'
    },
    premium: true,
    component: GSAPEffectsStudio
  },
  {
    id: 'particle-editor',
    name: 'Particle Effects Editor',
    description: 'Sistema 3D de partículas usando Three.js com renderização em tempo real',
    icon: <Zap className="h-8 w-8" />,
    category: 'particles',
    features: [
      'Sistemas de fogo realista',
      'Partículas mágicas',
      'Física avançada',
      'GPU acceleration',
      'Weather effects',
      '3D preview'
    ],
    stats: {
      effects: 89,
      popularity: 94,
      difficulty: 'Advanced'
    },
    premium: true,
    component: ParticleEffectsEditor
  },
  {
    id: 'lottie-studio',
    name: 'Lottie Animation Studio',
    description: 'Biblioteca de animações vetoriais com integração LottieFiles',
    icon: <Star className="h-8 w-8" />,
    category: 'vectors',
    features: [
      'Animações vetoriais',
      'LottieFiles integration',
      'Interactive controls',
      'Lightweight rendering',
      'Mobile optimized',
      'JSON export'
    ],
    stats: {
      effects: 1247,
      popularity: 89,
      difficulty: 'Intermediate'
    },
    premium: false,
    component: LottieAnimationStudio
  }
]

export default function EffectsLibraryPage() {
  const [activeStudio, setActiveStudio] = useState<string | null>(null)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700' 
      case 'Advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'animations': return <Film className="h-4 w-4" />
      case 'particles': return <Sparkles className="h-4 w-4" />
      case 'vectors': return <Layers className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  // Se um studio estiver ativo, renderizar o componente específico
  if (activeStudio) {
    const suite = effectSuites.find(s => s.id === activeStudio)
    if (suite) {
      const StudioComponent = suite.component
      return (
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando {suite.name}...</p>
            </div>
          </div>
        }>
          <StudioComponent />
        </Suspense>
      )
    }
  }

  return (
    <AppShell
      title="Effects Library"
      description="Biblioteca profissional de efeitos Hollywood-grade"
      showBreadcrumbs={true}
    >
      <div className="space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl">
          <div className="flex items-center justify-center gap-2 text-4xl font-bold">
            <Sparkles className="h-10 w-10 text-primary" />
            Effects Library Hollywood
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforme seus vídeos com nossa biblioteca premium de efeitos cinematográficos. 
            GSAP, Three.js e Lottie em um só lugar.
          </p>
          
          <div className="flex items-center justify-center gap-8 mt-6">
            {[
              { label: '1500+ Efeitos', icon: <Zap className="h-5 w-5" /> },
              { label: 'Real-time Preview', icon: <Play className="h-5 w-5" /> },
              { label: 'Hollywood Grade', icon: <Crown className="h-5 w-5" /> }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-primary font-medium">
                {feature.icon}
                {feature.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Effects', value: '1,583', change: '+247', color: 'text-blue-600' },
            { title: 'Premium Libraries', value: '3', change: 'Active', color: 'text-purple-600' },
            { title: 'Avg Rating', value: '4.9★', change: '+0.1', color: 'text-yellow-600' },
            { title: 'Export Formats', value: '12+', change: 'Supported', color: 'text-green-600' }
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className="text-xs text-success flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Effect Suites */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Studios Profissionais</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All Presets
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {effectSuites.map((suite, index) => (
              <Card key={suite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            {suite.icon}
                          </div>
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                              {suite.name}
                              {suite.premium && (
                                <Badge variant="outline" className="bg-gradient-primary text-white">
                                  PRO
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1">
                              {suite.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(suite.category)}
                            <Badge variant="secondary" className="capitalize">
                              {suite.category}
                            </Badge>
                          </div>
                          <Badge variant="outline" className={getDifficultyColor(suite.stats.difficulty)}>
                            {suite.stats.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {suite.stats.effects}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Efeitos
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {suite.stats.popularity}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Aprovação
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              4.9★
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rating
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Principais Recursos:</h4>
                          <div className="grid grid-cols-2 gap-1">
                            {suite.features.map((feature, fIndex) => (
                              <div key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          className="w-full"
                          onClick={() => setActiveStudio(suite.id)}
                        >
                          Abrir {suite.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>

                  {/* Right: Preview/Thumbnail */}
                  <div className="w-80 bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-6xl opacity-30">
                        {suite.icon}
                      </div>
                      <div className="space-y-2">
                        <div className="text-lg font-semibold">
                          {suite.stats.effects} Efeitos
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Preview disponível
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Pronto para criar efeitos Hollywood?
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Acesse nossa biblioteca completa com mais de 1500 efeitos profissionais. 
                From basic transitions to complex particle systems.
              </p>
              <div className="flex gap-3 justify-center">
                <Button size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Começar Agora
                </Button>
                <Button size="lg" variant="outline">
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppShell>
  )
}
