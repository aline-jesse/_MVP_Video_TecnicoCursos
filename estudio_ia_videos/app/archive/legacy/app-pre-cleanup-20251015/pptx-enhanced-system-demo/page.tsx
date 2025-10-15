'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Settings,
  Eye,
  Users,
  FileText,
  Video,
  Zap,
  Star,
  Crown,
  Sparkles,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Download,
  Share2,
  Edit3,
  PlayCircle,
  Presentation,
  Timeline,
  Palette,
  Activity,
  Loader2
} from 'lucide-react'

// Import our new components
import PPTXIntegratedTimeline from '@/components/timeline/pptx-integrated-timeline'
import PPTXRealTimePreview from '@/components/preview/pptx-realtime-preview'
import PPTXTemplateLibrary from '@/components/templates/pptx-template-library'
import PPTXCollaborationHub from '@/components/collaboration/pptx-collaboration-hub'
import PPTXPerformanceOptimizer from '@/components/performance/pptx-performance-optimizer'

// Mock data that integrates with existing PPTX system
const MOCK_PROJECT_DATA = {
  id: 'project-enhanced-demo',
  name: 'Demonstração Sistema Integrado',
  description: 'Projeto de demonstração dos novos componentes integrados ao sistema PPTX existente',
  slides: [
    {
      id: 'slide-1',
      title: 'Introdução ao Sistema Integrado',
      content: 'Bem-vindos ao novo sistema de edição de vídeos PPTX com funcionalidades avançadas de colaboração, templates e performance otimizada.',
      notes: 'Esta é uma apresentação demonstrando as novas funcionalidades implementadas sem duplicar o sistema existente.',
      duration: 8,
      order: 1,
      thumbnail: '/slides/slide-1-thumb.jpg',
      audioText: 'Bem-vindos ao nosso novo sistema integrado de edição de vídeos PPTX. Hoje vamos demonstrar todas as funcionalidades avançadas que foram implementadas.',
      backgroundImage: '/backgrounds/intro-bg.jpg',
      layoutType: 'title' as const
    },
    {
      id: 'slide-2',
      title: 'Timeline Editor Profissional',
      content: 'O novo editor de timeline oferece drag-and-drop avançado, keyframes, controles de áudio e integração perfeita com o sistema PPTX existente.',
      notes: 'Demonstrar as funcionalidades do timeline editor.',
      duration: 10,
      order: 2,
      thumbnail: '/slides/slide-2-thumb.jpg',
      audioText: 'O editor de timeline profissional permite criar sequências complexas com múltiplas tracks, efeitos e transições suaves.',
      layoutType: 'content' as const
    },
    {
      id: 'slide-3',
      title: 'Preview em Tempo Real',
      content: 'Visualize seu vídeo sendo criado em tempo real, com suporte a múltiplos dispositivos e configurações de qualidade.',
      notes: 'Mostrar o sistema de preview.',
      duration: 7,
      order: 3,
      thumbnail: '/slides/slide-3-thumb.jpg',
      audioText: 'O sistema de preview em tempo real permite ver exatamente como seu vídeo ficará antes da renderização final.',
      layoutType: 'mixed' as const
    },
    {
      id: 'slide-4',
      title: 'Biblioteca de Templates',
      content: 'Acesse centenas de templates profissionais organizados por categoria, com filtros avançados e preview interativo.',
      notes: 'Demonstrar a biblioteca de templates.',
      duration: 9,
      order: 4,
      thumbnail: '/slides/slide-4-thumb.jpg',
      audioText: 'Nossa biblioteca de templates oferece designs profissionais para todos os tipos de apresentação.',
      layoutType: 'image' as const
    },
    {
      id: 'slide-5',
      title: 'Colaboração em Tempo Real',
      content: 'Trabalhe em equipe com comentários, chat em tempo real, controle de versões e chamadas integradas.',
      notes: 'Mostrar funcionalidades de colaboração.',
      duration: 11,
      order: 5,
      thumbnail: '/slides/slide-5-thumb.jpg',
      audioText: 'A colaboração em tempo real permite que múltiplos usuários trabalhem simultaneamente no mesmo projeto.',
      layoutType: 'content' as const
    },
    {
      id: 'slide-6',
      title: 'Performance Otimizada',
      content: 'Sistema otimizado com virtualização, lazy loading, componentes memoizados e monitoramento de performance em tempo real.',
      notes: 'Demonstrar otimizações de performance.',
      duration: 6,
      order: 6,
      thumbnail: '/slides/slide-6-thumb.jpg',
      audioText: 'Todas as otimizações de performance garantem uma experiência fluida mesmo com projetos complexos.',
      layoutType: 'content' as const
    }
  ],
  user: {
    id: 'user-demo',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: '/avatars/demo-avatar.jpg'
  }
}

interface ComponentDemoCardProps {
  title: string
  description: string
  features: string[]
  isActive: boolean
  isPremium?: boolean
  onActivate: () => void
  icon: React.ComponentType<{ className?: string }>
  status: 'implemented' | 'partial' | 'planned'
}

const ComponentDemoCard: React.FC<ComponentDemoCardProps> = ({
  title,
  description,
  features,
  isActive,
  isPremium = false,
  onActivate,
  icon: Icon,
  status
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'implemented': return 'bg-green-500'
      case 'partial': return 'bg-yellow-500'
      case 'planned': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'implemented': return 'Implementado'
      case 'partial': return 'Parcial'  
      case 'planned': return 'Planejado'
      default: return 'Desconhecido'
    }
  }

  return (
    <motion.div
      className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'border-primary bg-primary/5 shadow-lg' 
          : 'border-border hover:border-primary/50 hover:shadow-md'
      }`}
      onClick={onActivate}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <Badge 
          variant="secondary" 
          className={`text-xs ${getStatusColor()} text-white`}
        >
          {getStatusText()}
        </Badge>
        {isPremium && (
          <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className={`p-3 rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  )
}

export default function PPTXEnhancedSystemDemo() {
  const [activeComponent, setActiveComponent] = useState<string>('overview')
  const [showPreview, setShowPreview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Component configurations
  const components = [
    {
      id: 'timeline',
      title: 'Timeline Editor Profissional',
      description: 'Editor avançado com drag-and-drop, keyframes e integração PPTX',
      features: [
        'Drag-and-drop intuitivo',
        'Múltiplas tracks (vídeo, áudio, slides)',
        'Keyframes e animações',
        'Integração com sistema PPTX existente',
        'Controles de áudio avançados'
      ],
      icon: Timeline,
      status: 'implemented' as const,
      isPremium: false
    },
    {
      id: 'preview',
      title: 'Preview em Tempo Real',
      description: 'Visualização instantânea com múltiplos dispositivos e qualidades',
      features: [
        'Preview instantâneo',
        'Múltiplos formatos (Desktop, Mobile, Tablet)',
        'Controles de qualidade',
        'Simulação de renderização',
        'Export para múltiplos formatos'
      ],
      icon: PlayCircle,
      status: 'implemented' as const,
      isPremium: false
    },
    {
      id: 'templates',
      title: 'Biblioteca de Templates',
      description: 'Centenas de templates profissionais com filtros avançados',
      features: [
        'Centenas de templates profissionais',
        'Filtros por categoria e tipo',
        'Preview interativo',
        'Templates premium e gratuitos',
        'Busca avançada com tags'
      ],
      icon: Palette,
      status: 'implemented' as const,
      isPremium: true
    },
    {
      id: 'collaboration',
      title: 'Colaboração em Tempo Real',
      description: 'Trabalho em equipe com chat, comentários e versionamento',
      features: [
        'Colaboração simultânea',
        'Chat e comentários em tempo real',
        'Controle de versões',
        'Chamadas de voz/vídeo integradas',
        'Gerenciamento de permissões'
      ],
      icon: Users,
      status: 'implemented' as const,
      isPremium: true
    },
    {
      id: 'performance',
      title: 'Performance Otimizada',
      description: 'Sistema otimizado com monitoramento em tempo real',
      features: [
        'Virtualização para listas grandes',
        'Lazy loading de recursos',
        'Componentes memoizados',
        'Monitoramento de performance',
        'Bundle size otimizado'
      ],
      icon: Activity,
      status: 'implemented' as const,
      isPremium: false
    }
  ]

  // Handlers
  const handleComponentSelect = useCallback((componentId: string) => {
    setIsLoading(true)
    
    // Simulate loading time
    setTimeout(() => {
      setActiveComponent(componentId)
      setIsLoading(false)
      toast.success(`${components.find(c => c.id === componentId)?.title} ativado!`)
    }, 500)
  }, [components])

  const handleTemplateSelect = useCallback((template: any) => {
    setSelectedTemplate(template)
    toast.success(`Template "${template.name}" selecionado!`)
  }, [])

  const handlePreviewTemplate = useCallback((template: any) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }, [])

  const handleExportProject = useCallback(() => {
    toast.success('Projeto exportado com sucesso!')
  }, [])

  // Render active component
  const renderActiveComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Carregando componente...</span>
        </div>
      )
    }

    switch (activeComponent) {
      case 'timeline':
        return (
          <PPTXIntegratedTimeline
            projectId={MOCK_PROJECT_DATA.id}
            slides={MOCK_PROJECT_DATA.slides}
            onSave={(data) => console.log('Timeline saved:', data)}
            onPreview={() => setShowPreview(true)}
            onExport={handleExportProject}
          />
        )

      case 'preview':
        return (
          <PPTXRealTimePreview
            projectId={MOCK_PROJECT_DATA.id}
            slides={MOCK_PROJECT_DATA.slides}
            isVisible={true}
            onClose={() => setActiveComponent('overview')}
            onExport={(settings) => {
              console.log('Export settings:', settings)
              handleExportProject()
            }}
          />
        )

      case 'templates':
        return (
          <PPTXTemplateLibrary
            onSelectTemplate={handleTemplateSelect}
            onPreviewTemplate={handlePreviewTemplate}
            userPlan="pro"
          />
        )

      case 'collaboration':
        return (
          <PPTXCollaborationHub
            projectId={MOCK_PROJECT_DATA.id}
            currentUser={MOCK_PROJECT_DATA.user}
            onUserActivity={(activity) => console.log('User activity:', activity)}
            onCommentAdd={(comment) => console.log('Comment added:', comment)}
            onLockToggle={(locked) => console.log('Project locked:', locked)}
          />
        )

      case 'performance':
        return (
          <PPTXPerformanceOptimizer
            projectId={MOCK_PROJECT_DATA.id}
            initialData={{
              slides: MOCK_PROJECT_DATA.slides,
              timeline: [],
              assets: []
            }}
            showPerformanceMonitor={true}
          />
        )

      default:
        return (
          <div className="space-y-6">
            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Sparkles className="mr-3 h-6 w-6 text-yellow-500" />
                  Sistema PPTX Integrado - Demonstração Completa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">5</div>
                    <div className="text-sm text-muted-foreground">Novos Componentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">100%</div>
                    <div className="text-sm text-muted-foreground">Integração Existente</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500 mb-2">0</div>
                    <div className="text-sm text-muted-foreground">Duplicação de Código</div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    <strong>🎯 Objetivo:</strong> Complementar o sistema PPTX existente com funcionalidades avançadas 
                    sem duplicar código ou interferir com implementações atuais.
                  </p>
                  <p>
                    <strong>✨ Funcionalidades:</strong> Timeline profissional, preview em tempo real, templates avançados, 
                    colaboração e otimizações de performance.
                  </p>
                  <p>
                    <strong>🔧 Integração:</strong> Todos os componentes foram projetados para usar as APIs e 
                    estruturas de dados existentes do sistema PPTX.
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-center space-x-4">
                  <Button 
                    onClick={() => setActiveComponent('timeline')}
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Iniciar Demonstração</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Rápido
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Component Selection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {components.map((component) => (
                <ComponentDemoCard
                  key={component.id}
                  title={component.title}
                  description={component.description}
                  features={component.features}
                  isActive={activeComponent === component.id}
                  isPremium={component.isPremium}
                  onActivate={() => handleComponentSelect(component.id)}
                  icon={component.icon}
                  status={component.status}
                />
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Presentation className="mr-3 h-8 w-8 text-primary" />
                Sistema PPTX Enhanced
              </h1>
              <p className="text-muted-foreground mt-1">
                Demonstração dos componentes integrados ao sistema existente
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Sistema Online
              </Badge>
              
              <Button
                variant="outline"
                onClick={() => setActiveComponent('overview')}
                disabled={activeComponent === 'overview'}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Visão Geral
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'overview', name: 'Visão Geral', icon: Eye },
              ...components.map(c => ({ id: c.id, name: c.title, icon: c.icon }))
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeComponent === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleComponentSelect(tab.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
                disabled={isLoading}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeComponent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveComponent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick Preview Modal */}
      {showPreview && (
        <PPTXRealTimePreview
          projectId={MOCK_PROJECT_DATA.id}
          slides={MOCK_PROJECT_DATA.slides}
          isVisible={showPreview}
          onClose={() => setShowPreview(false)}
          onExport={handleExportProject}
        />
      )}
    </div>
  )
}