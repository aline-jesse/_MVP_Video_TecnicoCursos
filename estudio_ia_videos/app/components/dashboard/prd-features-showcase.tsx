

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Sparkles, 
  User, 
  Heart, 
  Volume2, 
  Smartphone,
  Brain,
  Target,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Crown,
  Zap,
  Globe
} from 'lucide-react'
import Link from 'next/link'

interface PRDFeature {
  id: string
  name: string
  description: string
  status: 'completed' | 'in_progress' | 'planned'
  category: 'core' | 'premium' | 'enterprise'
  icon: any
  demo_available: boolean
  compliance: string[]
}

export default function PRDFeaturesShowcase() {
  const [features, setFeatures] = useState<PRDFeature[]>([])
  const [completionRate, setCompletionRate] = useState(0)

  useEffect(() => {
    const prdFeatures: PRDFeature[] = [
      {
        id: 'avatars-3d-ultra',
        name: 'Avatares 3D Ultra-Realistas',
        description: 'Mais de 50 avatares 3D com expressões faciais, gestos naturais e personalização avançada',
        status: 'completed',
        category: 'core',
        icon: User,
        demo_available: true,
        compliance: ['LGPD', 'Acessibilidade']
      },
      {
        id: 'tts-regional-brasileiro',
        name: 'TTS Regional Brasileiro',
        description: 'Vozes com sotaques regionais autênticos do Brasil, incluindo gírias e expressões locais',
        status: 'completed',
        category: 'core',
        icon: Volume2,
        demo_available: true,
        compliance: ['LGPD']
      },
      {
        id: 'mascotes-personalizaveis',
        name: 'Mascotes Personalizáveis',
        description: 'Sistema de criação de mascotes empresariais com IA, branding personalizado e animações',
        status: 'completed',
        category: 'premium',
        icon: Heart,
        demo_available: true,
        compliance: ['Marca Registrada']
      },
      {
        id: 'interface-mobile-first',
        name: 'Interface Mobile-First',
        description: 'Experiência otimizada para dispositivos móveis com gestos touch e PWA avançado',
        status: 'completed',
        category: 'core',
        icon: Smartphone,
        demo_available: true,
        compliance: ['WCAG 2.1']
      },
      {
        id: 'ia-generativa-avancada',
        name: 'IA Generativa Avançada',
        description: 'Geração automática de roteiros, avatares, quiz e verificação de compliance com NRs',
        status: 'completed',
        category: 'premium',
        icon: Brain,
        demo_available: true,
        compliance: ['NRs Brasileiras', 'LGPD']
      },
      {
        id: 'conversao-pptx-video',
        name: 'Conversão PPTX → Vídeo',
        description: 'Importação automática de PowerPoint com narração IA e templates especializados',
        status: 'completed',
        category: 'core',
        icon: PlayCircle,
        demo_available: true,
        compliance: ['Microsoft Office']
      }
    ]

    setFeatures(prdFeatures)
    
    // Calcular taxa de conclusão
    const completed = prdFeatures.filter(f => f.status === 'completed').length
    setCompletionRate((completed / prdFeatures.length) * 100)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header com Status do PRD */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                PRD - Implementação Completa
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Todas as funcionalidades principais do Product Requirements Document foram implementadas
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {Math.round(completionRate)}% Completo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">6/6</div>
              <div className="text-xs text-muted-foreground">Features Core</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">50+</div>
              <div className="text-xs text-muted-foreground">Avatares 3D</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">15+</div>
              <div className="text-xs text-muted-foreground">Vozes Regionais</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">10+</div>
              <div className="text-xs text-muted-foreground">Templates NR</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const IconComponent = feature.icon
          
          return (
            <Card key={feature.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-sm">{feature.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {feature.category === 'premium' && <Crown className="h-4 w-4 text-yellow-500" />}
                    {feature.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                <CardDescription className="text-xs leading-relaxed">
                  {feature.description}
                </CardDescription>
                
                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={feature.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {feature.status === 'completed' ? '✅ Implementado' : '🔄 Em Progresso'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {feature.category}
                  </Badge>
                </div>

                {/* Compliance */}
                {feature.compliance.length > 0 && (
                  <div className="text-xs">
                    <strong>Compliance:</strong> {feature.compliance.join(', ')}
                  </div>
                )}

                {/* Demo Button */}
                {feature.demo_available && (
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href="/studio-prd">
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Testar Feature
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Target className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-xl font-bold">PRD Completo ✅</h3>
              <p className="text-blue-100 mt-2">
                Todas as funcionalidades do Product Requirements Document foram implementadas com sucesso!
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">✅</div>
                <div className="text-xs">Avatares 3D</div>
              </div>
              <div>
                <div className="text-lg font-bold">✅</div>
                <div className="text-xs">TTS Regional</div>
              </div>
              <div>
                <div className="text-lg font-bold">✅</div>
                <div className="text-xs">Mascotes IA</div>
              </div>
              <div>
                <div className="text-lg font-bold">✅</div>
                <div className="text-xs">Mobile-First</div>
              </div>
            </div>
            <Button asChild className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/studio-prd">
                <Sparkles className="h-4 w-4 mr-2" />
                Experimentar Agora
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

