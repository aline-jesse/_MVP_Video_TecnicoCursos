
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TestTube,
  Zap,
  Brain,
  Sparkles,
  Rocket,
  Star,
  Settings,
  Play,
  Lock,
  Crown,
  Microscope,
  Atom,
  Cpu,
  Database,
  Cloud,
  Shield
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LabFeature {
  id: string
  name: string
  category: 'experimental' | 'enterprise' | 'ai-research' | 'beta'
  description: string
  icon: any
  status: 'available' | 'beta' | 'coming-soon' | 'enterprise-only'
  tier: 'free' | 'pro' | 'enterprise'
}

export function LabsPrototype() {
  const [activeCategory, setActiveCategory] = useState<string>('experimental')

  const labFeatures: LabFeature[] = [
    {
      id: 'ai-video-gen',
      name: 'Geração de Vídeo com IA',
      category: 'experimental',
      description: 'Crie vídeos completos apenas com prompts de texto usando modelos generativos avançados',
      icon: Brain,
      status: 'beta',
      tier: 'pro'
    },
    {
      id: 'voice-cloning',
      name: 'Clonagem de Voz',
      category: 'experimental',
      description: 'Clone qualquer voz com apenas 30 segundos de amostra de áudio',
      icon: Microscope,
      status: 'available',
      tier: 'enterprise'
    },
    {
      id: 'real-time-render',
      name: 'Renderização em Tempo Real',
      category: 'experimental',
      description: 'Veja suas alterações sendo renderizadas instantaneamente conforme você edita',
      icon: Zap,
      status: 'beta',
      tier: 'pro'
    },
    {
      id: 'quantum-processing',
      name: 'Processamento Quântico',
      category: 'ai-research',
      description: 'Acelere a renderização usando algoritmos quânticos para processamento de vídeo',
      icon: Atom,
      status: 'coming-soon',
      tier: 'enterprise'
    },
    {
      id: 'neural-upscaling',
      name: 'Upscaling Neural',
      category: 'ai-research',
      description: 'Melhore a resolução de vídeos automaticamente usando redes neurais',
      icon: Cpu,
      status: 'available',
      tier: 'pro'
    },
    {
      id: 'enterprise-analytics',
      name: 'Analytics Empresarial',
      category: 'enterprise',
      description: 'Dashboard avançado com métricas empresariais e relatórios personalizados',
      icon: Database,
      status: 'available',
      tier: 'enterprise'
    },
    {
      id: 'cloud-scaling',
      name: 'Escalonamento em Nuvem',
      category: 'enterprise',
      description: 'Escale automaticamente recursos de renderização baseado na demanda',
      icon: Cloud,
      status: 'available',
      tier: 'enterprise'
    },
    {
      id: 'security-suite',
      name: 'Suite de Segurança',
      category: 'enterprise',
      description: 'Ferramentas avançadas de segurança, compliance e auditoria',
      icon: Shield,
      status: 'available',
      tier: 'enterprise'
    },
    {
      id: 'motion-capture',
      name: 'Captura de Movimento',
      category: 'beta',
      description: 'Capture movimentos reais e aplique aos seus avatares 3D',
      icon: Sparkles,
      status: 'beta',
      tier: 'pro'
    }
  ]

  const categories = [
    { id: 'experimental', name: 'Experimental', icon: TestTube, color: 'text-purple-600' },
    { id: 'enterprise', name: 'Enterprise', icon: Crown, color: 'text-gold-600' },
    { id: 'ai-research', name: 'IA Research', icon: Brain, color: 'text-blue-600' },
    { id: 'beta', name: 'Beta Features', icon: Rocket, color: 'text-green-600' }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      'available': 'bg-green-100 text-green-800',
      'beta': 'bg-blue-100 text-blue-800',
      'coming-soon': 'bg-yellow-100 text-yellow-800',
      'enterprise-only': 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTierColor = (tier: string) => {
    const colors = {
      'free': 'bg-gray-100 text-gray-800',
      'pro': 'bg-blue-100 text-blue-800',
      'enterprise': 'bg-purple-100 text-purple-800'
    }
    return colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleFeatureDemo = (feature: LabFeature) => {
    if (feature.status === 'coming-soon') {
      toast.success(`${feature.name} estará disponível em breve!`)
    } else if (feature.tier === 'enterprise' && feature.status === 'enterprise-only') {
      toast.error('Esta funcionalidade requer plano Enterprise')
    } else {
      toast.success(`Demonstração de ${feature.name} iniciada (protótipo)`)
    }
  }

  const handleUpgrade = () => {
    toast.success('Redirecionando para upgrade de plano...')
  }

  const filteredFeatures = labFeatures.filter(feature => feature.category === activeCategory)

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <TestTube className="h-10 w-10 text-purple-600" />
          Estúdio Labs & Enterprise
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Recursos experimentais, IA avançada e funcionalidades enterprise
        </p>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
          🧪 Laboratório de Inovação - Protótipos Interativos
        </Badge>
      </div>

      {/* Category Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => {
          const IconComponent = category.icon
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeCategory === category.id
                  ? 'ring-2 ring-purple-500 bg-purple-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <IconComponent className={`h-8 w-8 mx-auto mb-2 ${category.color}`} />
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {labFeatures.filter(f => f.category === category.id).length} recursos
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => {
          const IconComponent = feature.icon
          return (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-purple-600" />
                    <div>
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getTierColor(feature.tier)}>
                          {feature.tier}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {feature.tier === 'enterprise' && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                
                <div className="space-y-3">
                  {/* Feature Status */}
                  <div className="text-xs text-gray-500">
                    {feature.status === 'available' && '✅ Disponível agora'}
                    {feature.status === 'beta' && '🔬 Em testes beta'}
                    {feature.status === 'coming-soon' && '🚀 Em breve'}
                    {feature.status === 'enterprise-only' && '🏢 Apenas Enterprise'}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFeatureDemo(feature)}
                      disabled={feature.status === 'coming-soon'}
                      className="flex-1"
                    >
                      {feature.status === 'available' ? (
                        <Play className="h-4 w-4 mr-2" />
                      ) : feature.status === 'beta' ? (
                        <TestTube className="h-4 w-4 mr-2" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      {feature.status === 'coming-soon' ? 'Em Breve' : 'Testar'}
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Upgrade Prompt */}
                  {feature.tier !== 'free' && (
                    <div className="text-xs text-center p-2 bg-blue-50 rounded border">
                      {feature.tier === 'pro' && 'Requer plano Pro'}
                      {feature.tier === 'enterprise' && 'Requer plano Enterprise'}
                      <Button
                        size="sm"
                        variant="link"
                        className="text-xs p-0 h-auto ml-2"
                        onClick={handleUpgrade}
                      >
                        Upgrade →
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enterprise Section */}
      {activeCategory === 'enterprise' && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Crown className="h-8 w-8 text-yellow-500" />
              Estúdio Enterprise Suite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Segurança Avançada</h4>
                <p className="text-sm text-gray-600">
                  SSO, 2FA, auditoria completa e compliance SOC2
                </p>
              </div>
              
              <div className="text-center p-4">
                <Database className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Analytics Empresarial</h4>
                <p className="text-sm text-gray-600">
                  Dashboards customizados e relatórios avançados
                </p>
              </div>
              
              <div className="text-center p-4">
                <Cloud className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Escalabilidade</h4>
                <p className="text-sm text-gray-600">
                  Recursos ilimitados e auto-scaling
                </p>
              </div>
              
              <div className="text-center p-4">
                <Star className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Suporte Premium</h4>
                <p className="text-sm text-gray-600">
                  Suporte 24/7 e gerente de conta dedicado
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button 
                size="lg"
                onClick={() => toast.success('Consultoria Enterprise solicitada!')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Crown className="h-5 w-5 mr-2" />
                Solicitar Consultoria Enterprise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">💡 Sugira Novas Funcionalidades</h3>
          <p className="text-gray-600 mb-4">
            Tem uma ideia para o futuro do Estúdio IA? Queremos ouvir sua sugestão!
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              onClick={() => toast.success('Formulário de sugestões aberto!')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Enviar Sugestão
            </Button>
            <Button 
              variant="outline"
              onClick={() => toast.success('Roadmap público aberto!')}
            >
              Ver Roadmap Público
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
