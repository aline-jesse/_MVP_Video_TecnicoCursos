

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  Sparkles, 
  FileVideo, 
  User, 
  Volume2, 
  Heart,
  Smartphone,
  Brain,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Download
} from 'lucide-react'
import Avatar3DSelector from '../../components/avatars/avatar-3d-selector'
import MascotCreator from '../../components/mascots/mascot-creator'
import BrazilianVoiceSelector from '../../components/tts/brazilian-voice-selector'
// Import do pipeline hiper-realista
interface Avatar3D {
  id: string
  name: string
  category: 'business' | 'healthcare' | 'education' | 'casual' | 'safety'
  gender: 'male' | 'female' | 'unisex'
  ethnicity: 'caucasian' | 'afro' | 'asian' | 'latino' | 'mixed'
  age: 'young' | 'adult' | 'senior'
  quality: 'standard' | 'premium' | 'cinematic' | 'hyperreal'
  features: {
    facialDetails: 'high' | 'ultra' | 'cinematic'
    skinTexture: 'procedural' | 'scanned' | 'photogrammetry'
    hairSystem: 'strand' | 'cards' | 'volumetric'
    lipSyncAccuracy: number
  }
}

interface AvatarCustomization {
  avatar_base_id: string
  pose_style?: 'dinamico' | 'estatico' | 'interativo'
  expression_intensity?: 'suave' | 'moderado' | 'intenso'
  gesture_frequency?: 'baixa' | 'media' | 'alta'
  eye_contact_level?: 'direto' | 'natural' | 'ocasional'
}
import { MascotTemplate, MascotCustomization } from '../../lib/mascots/mascot-system'
import { BrazilianVoiceRegional } from '../../lib/tts/brazilian-regional-tts'
import { GenerativeAIAdvanced } from '../../lib/ai/generative-ai-advanced'

interface StudioPRDProject {
  id: string
  name: string
  type: 'nr_training' | 'corporate_presentation' | 'product_demo' | 'custom'
  avatar: Avatar3D | null
  avatar_customization: AvatarCustomization | null
  mascot: MascotTemplate | null
  mascot_customization: MascotCustomization | null
  voice: BrazilianVoiceRegional | null
  voice_settings: any
  content_generated: boolean
  progress: number
  created_at: string
}

export default function StudioPRDPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  
  const [currentProject, setCurrentProject] = useState<StudioPRDProject>({
    id: '',
    name: '',
    type: 'nr_training',
    avatar: null,
    avatar_customization: null,
    mascot: null,
    mascot_customization: null,
    voice: null,
    voice_settings: null,
    content_generated: false,
    progress: 0,
    created_at: new Date().toISOString()
  })
  
  const [activeStep, setActiveStep] = useState<'setup' | 'avatar' | 'mascot' | 'voice' | 'generate' | 'preview'>('setup')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const handleProjectSetup = (projectData: { name: string, type: StudioPRDProject['type'] }) => {
    setCurrentProject(prev => ({
      ...prev,
      id: `project-${Date.now()}`,
      name: projectData.name,
      type: projectData.type,
      progress: 20
    }))
    setActiveStep('avatar')
  }

  const handleAvatarSelection = (avatar: Avatar3D, customization?: AvatarCustomization) => {
    setCurrentProject(prev => ({
      ...prev,
      avatar,
      avatar_customization: customization || null,
      progress: 40
    }))
    setActiveStep('mascot')
  }

  const handleMascotCreation = (mascot: MascotTemplate, customization: MascotCustomization) => {
    setCurrentProject(prev => ({
      ...prev,
      mascot,
      mascot_customization: customization,
      progress: 60
    }))
    setActiveStep('voice')
  }

  const handleVoiceSelection = (voice: BrazilianVoiceRegional, settings: any) => {
    setCurrentProject(prev => ({
      ...prev,
      voice,
      voice_settings: settings,
      progress: 80
    }))
    setActiveStep('generate')
  }

  const handleGenerateContent = async () => {
    setIsGenerating(true)
    
    try {
      // Gerar conteúdo com IA baseado no projeto configurado
      const content = await GenerativeAIAdvanced.generateTrainingScript({
        type: 'roteiro',
        input: {
          topic: currentProject.type === 'nr_training' ? 'Normas Regulamentadoras de Segurança' : 'Treinamento Corporativo',
          target_audience: 'funcionarios_empresa',
          duration_minutes: 10,
          compliance_requirements: ['NR-12', 'NR-35', 'LGPD'],
          company_context: currentProject.mascot_customization?.company_branding.company_name || 'Empresa'
        },
        style_preferences: {
          tone: 'formal',
          complexity: 'intermediario',
          interactivity: 'alta'
        },
        output_format: 'structured'
      })

      setGeneratedContent(content)
      setCurrentProject(prev => ({
        ...prev,
        content_generated: true,
        progress: 100
      }))
      setActiveStep('preview')
      
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Principal */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎬 Estúdio IA de Vídeos PRD
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Sistema completo de criação de vídeos com IA - Implementação do PRD
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso do Projeto</span>
              <span>{currentProject.progress}%</span>
            </div>
            <Progress value={currentProject.progress} className="h-2" />
          </div>
        </div>

        {/* Mobile-First Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {[
              { key: 'setup', label: 'Configuração', icon: Target },
              { key: 'avatar', label: 'Avatar 3D', icon: User },
              { key: 'mascot', label: 'Mascote', icon: Heart },
              { key: 'voice', label: 'Voz Regional', icon: Volume2 },
              { key: 'generate', label: 'IA Generativa', icon: Brain },
              { key: 'preview', label: 'Preview', icon: PlayCircle }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeStep === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStep(key as any)}
                className="flex items-center gap-1"
                disabled={
                  (key === 'avatar' && !currentProject.name) ||
                  (key === 'mascot' && !currentProject.avatar) ||
                  (key === 'voice' && !currentProject.mascot) ||
                  (key === 'generate' && !currentProject.voice) ||
                  (key === 'preview' && !currentProject.content_generated)
                }
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-6xl mx-auto">
          
          {/* Etapa 1: Configuração do Projeto */}
          {activeStep === 'setup' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Configuração do Projeto
                </CardTitle>
                <CardDescription>
                  Defina o tipo de vídeo que você quer criar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProjectSetupForm onSetup={handleProjectSetup} />
              </CardContent>
            </Card>
          )}

          {/* Etapa 2: Seleção de Avatar */}
          {activeStep === 'avatar' && (
            <Avatar3DSelector 
              onAvatarSelect={handleAvatarSelection}
              selectedAvatar={currentProject.avatar || undefined}
              contentType={currentProject.type === 'nr_training' ? 'nr' : 'corporate'}
            />
          )}

          {/* Etapa 3: Criação de Mascote */}
          {activeStep === 'mascot' && (
            <MascotCreator 
              onMascotCreate={handleMascotCreation}
              companyBranding={{
                name: 'Empresa Exemplo',
                colors: ['#0066CC', '#FFFFFF'],
                industry: currentProject.type === 'nr_training' ? 'industrial' : 'corporativo'
              }}
            />
          )}

          {/* Etapa 4: Seleção de Voz */}
          {activeStep === 'voice' && (
            <BrazilianVoiceSelector 
              onVoiceSelect={handleVoiceSelection}
              selectedVoice={currentProject.voice || undefined}
              contentType={currentProject.type === 'nr_training' ? 'nr' : 'apresentacao'}
            />
          )}

          {/* Etapa 5: Geração com IA */}
          {activeStep === 'generate' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  IA Generativa Avançada
                </CardTitle>
                <CardDescription>
                  Gerar conteúdo automaticamente baseado nas suas configurações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Resumo da Configuração */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Configuração Atual</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Projeto:</span>
                        <span>{currentProject.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avatar:</span>
                        <span>{currentProject.avatar?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mascote:</span>
                        <span>{currentProject.mascot?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Voz:</span>
                        <span>{currentProject.voice?.display_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">IA Capabilities</h4>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="w-full justify-start">
                        ✅ Roteiro Automático
                      </Badge>
                      <Badge variant="secondary" className="w-full justify-start">
                        ✅ Instruções de Avatar
                      </Badge>
                      <Badge variant="secondary" className="w-full justify-start">
                        ✅ Compliance NR
                      </Badge>
                      <Badge variant="secondary" className="w-full justify-start">
                        ✅ Quiz Interativo
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                  className="w-full h-12 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                      Gerando Conteúdo com IA...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Gerar Vídeo Completo com IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Etapa 6: Preview */}
          {activeStep === 'preview' && generatedContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Preview do Vídeo Gerado
                </CardTitle>
                <CardDescription>
                  Seu vídeo foi gerado com sucesso! Confira o resultado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Video Preview */}
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-center text-white">
                    <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-semibold mb-2">{currentProject.name}</h3>
                    <p className="text-sm opacity-80">
                      Avatar: {currentProject.avatar?.name} | Voz: {currentProject.voice?.region.state}
                    </p>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <Button 
                    size="lg"
                    className="absolute inset-0 w-full h-full bg-black/20 hover:bg-black/30 border-0"
                  >
                    <PlayCircle className="h-12 w-12" />
                  </Button>
                </div>

                {/* Content Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {generatedContent.metadata?.estimated_duration || 10}min
                    </div>
                    <div className="text-xs text-muted-foreground">Duração</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((generatedContent.metadata?.confidence_score || 0.92) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {generatedContent.structured_data?.scenes?.length || 3}
                    </div>
                    <div className="text-xs text-muted-foreground">Cenas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {generatedContent.structured_data?.quiz_questions?.length || 5}
                    </div>
                    <div className="text-xs text-muted-foreground">Questões</div>
                  </div>
                </div>

                {/* Generated Content Preview */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Conteúdo Gerado</h4>
                  <div className="bg-muted/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">
                      {generatedContent.content}
                    </pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-3">
                  <Button className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar MP4
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileVideo className="h-4 w-4 mr-2" />
                    Editar no Studio
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Novo Projeto
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <Card className="p-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {activeStep === 'setup' && 'Configuração'}
                {activeStep === 'avatar' && 'Avatar 3D'}
                {activeStep === 'mascot' && 'Mascote'}
                {activeStep === 'voice' && 'Voz Regional'}
                {activeStep === 'generate' && 'IA Generativa'}
                {activeStep === 'preview' && 'Preview'}
              </span>
              <Badge variant="secondary">{currentProject.progress}%</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Componente de Configuração do Projeto
function ProjectSetupForm({ onSetup }: { onSetup: (data: { name: string, type: StudioPRDProject['type'] }) => void }) {
  const [projectName, setProjectName] = useState('')
  const [projectType, setProjectType] = useState<StudioPRDProject['type']>('nr_training')

  const projectTypes = [
    { 
      id: 'nr_training', 
      name: 'Treinamento NR', 
      description: 'Normas Regulamentadoras de Segurança',
      icon: '🛡️',
      popular: true
    },
    { 
      id: 'corporate_presentation', 
      name: 'Apresentação Corporativa', 
      description: 'Apresentações executivas e institucionais',
      icon: '🏢',
      popular: true
    },
    { 
      id: 'product_demo', 
      name: 'Demo de Produto', 
      description: 'Demonstrações e tutoriais de produtos',
      icon: '📱',
      popular: false
    },
    { 
      id: 'custom', 
      name: 'Personalizado', 
      description: 'Projeto customizado com IA',
      icon: '✨',
      popular: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Nome do Projeto */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Projeto</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Ex: Treinamento NR-12 - Segurança em Máquinas"
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Tipo de Projeto */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Tipo de Projeto</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projectTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                projectType === type.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setProjectType(type.id as StudioPRDProject['type'])}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{type.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{type.name}</h4>
                      {type.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button 
        onClick={() => onSetup({ name: projectName, type: projectType })}
        disabled={!projectName.trim()}
        className="w-full h-12"
      >
        <ArrowRight className="h-4 w-4 mr-2" />
        Continuar para Avatar 3D
      </Button>
    </div>
  )
}

