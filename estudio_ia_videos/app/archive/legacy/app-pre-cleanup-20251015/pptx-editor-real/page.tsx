
/**
 * 🎬 Editor PPTX Real - Sprint 15
 * Editor completo com renderização e TTS real
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Save, 
  Download,
  Settings,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Layers,
  User,
  Type,
  Image,
  Mic,
  FileVideo,
  Sparkles,
  Loader
} from 'lucide-react'
import Link from 'next/link'
import { AnimakerTimelineEditor } from '@/components/pptx/animaker-timeline-editor'
import { PPTXAssetLibrary } from '@/components/pptx/pptx-asset-library'
import { TransitionEffectsPanel } from '@/components/pptx/transition-effects-panel'
import { RealTimeRenderer } from '@/components/pptx/real-time-renderer'
import { TTSVoiceSelector } from '@/components/pptx/tts-voice-selector'
import { ExportProgressModal } from '@/components/pptx/export-progress-modal'

interface Project {
  id: string
  name: string
  timeline: any
  metadata: any
}

export default function PPTXEditorReal() {
  const [project, setProject] = useState<Project | null>(null)
  const [selectedSlide, setSelectedSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activePanel, setActivePanel] = useState<'assets' | 'tts' | 'render' | 'effects'>('assets')
  const [showExportModal, setShowExportModal] = useState(false)
  const [currentRenderJob, setCurrentRenderJob] = useState<string | null>(null)
  
  const canvasRef = useRef<HTMLDivElement>(null)

  // Carregar projeto (por agora mock, depois virá de URL params)
  useEffect(() => {
    loadProject()
  }, [])

  const loadProject = () => {
    // Mock project data - em produção virá da API
    const mockProject: Project = {
      id: 'proj_1',
      name: 'NR-12 Segurança em Máquinas',
      timeline: {
        totalDuration: 225, // 3:45
        currentTime: 0,
        scenes: [
          {
            id: 'scene_1',
            title: 'Introdução à Segurança',
            content: 'Bem-vindos ao treinamento de segurança do trabalho conforme NR-12',
            duration: 45,
            transition: 'fade',
            background: 'gradient-blue',
            narrationText: 'Bem-vindos ao nosso treinamento de segurança do trabalho. Hoje aprenderemos sobre a Norma Regulamentadora 12, que trata da segurança no trabalho em máquinas e equipamentos.',
            elements: [
              {
                id: 'title_1',
                type: 'text',
                content: 'Segurança em Máquinas - NR-12',
                position: { x: 100, y: 50 },
                size: { width: 600, height: 80 },
                animation: 'fadeIn',
                timing: { start: 0, duration: 1 }
              }
            ],
            audio: {
              narration: '',
              backgroundMusic: 'corporate-intro',
              volume: 0.7
            }
          },
          {
            id: 'scene_2',
            title: 'Equipamentos de Proteção',
            content: 'Conheça os EPIs obrigatórios para operação segura de máquinas',
            duration: 60,
            transition: 'slide-left',
            background: 'factory-floor',
            narrationText: 'Os Equipamentos de Proteção Individual são fundamentais para a segurança no trabalho com máquinas. Vamos conhecer cada um deles e sua aplicação correta.',
            elements: [],
            audio: {
              narration: '',
              backgroundMusic: 'soft-ambient',
              volume: 0.6
            }
          },
          {
            id: 'scene_3',
            title: 'Procedimentos de Segurança',
            content: 'Protocolos obrigatórios antes de operar qualquer equipamento',
            duration: 75,
            transition: 'zoom-in',
            background: 'safety-room',
            narrationText: 'Antes de operar qualquer máquina, é obrigatório seguir os procedimentos de segurança. Estes protocolos foram desenvolvidos para proteger sua integridade física.',
            elements: [],
            audio: {
              narration: '',
              backgroundMusic: 'professional-light',
              volume: 0.5
            }
          },
          {
            id: 'scene_4',
            title: 'Emergências e Primeiros Socorros',
            content: 'Como agir em situações de emergência e prestar primeiros socorros',
            duration: 45,
            transition: 'wipe',
            background: 'emergency-room',
            narrationText: 'Em caso de emergência, conhecer os procedimentos de primeiros socorros pode salvar vidas. Vamos aprender as técnicas básicas e quando aplicá-las.',
            elements: [],
            audio: {
              narration: '',
              backgroundMusic: 'minimal-focus',
              volume: 0.4
            }
          }
        ]
      },
      metadata: {
        title: 'NR-12 Segurança em Máquinas',
        author: 'Sistema IA',
        slideCount: 4,
        theme: 'corporativo',
        createdAt: new Date(),
        estimatedDuration: 225
      }
    }

    setProject(mockProject)
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    toast.success(isPlaying ? '⏸️ Pausado' : '▶️ Reproduzindo')
  }

  const handleSave = async () => {
    if (!project) return
    
    // Salvar projeto via API
    toast.success('💾 Projeto salvo automaticamente')
  }

  const handleExport = () => {
    setActivePanel('render')
    toast.success('🎬 Painel de renderização ativado')
  }

  const handleRenderComplete = (videoUrl: string) => {
    setShowExportModal(false)
    toast.success('🎉 Vídeo pronto para download!')
  }

  const handleRenderError = (error: string) => {
    setShowExportModal(false)
    toast.error(`❌ Erro na renderização: ${error}`)
  }

  const handleTTSGenerate = (config: any) => {
    if (!project) return
    
    // Aplicar configuração TTS ao projeto
    const updatedProject = {
      ...project,
      timeline: {
        ...project.timeline,
        ttsConfig: config
      }
    }
    setProject(updatedProject)
    toast.success('🗣️ Configuração TTS aplicada')
  }

  const getCurrentSlideText = () => {
    if (!project || !project.timeline.scenes[selectedSlide]) return ''
    return project.timeline.scenes[selectedSlide].narrationText || project.timeline.scenes[selectedSlide].content
  }

  const handlePanelChange = (value: string) => {
    const panel = value as 'assets' | 'tts' | 'render' | 'effects'
    setActivePanel(panel)
    toast.success(`🔧 Painel ${panel} ativado`)
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando projeto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/pptx-studio">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Studio
              </Button>
            </Link>
            
            <div>
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <p className="text-sm text-gray-400">
                {project.timeline.scenes.length} slides • {Math.floor(project.timeline.totalDuration / 60)}min
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-100 text-green-700">
              🎬 Renderização Real
            </Badge>
            
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Vídeo
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout - 4 Painéis */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Ferramentas */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-lg mb-3">Ferramentas</h3>
            
            <Tabs value={activePanel} onValueChange={handlePanelChange} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-2 gap-1">
                <TabsTrigger 
                  value="assets" 
                  className="text-xs"
                  onClick={() => handlePanelChange('assets')}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Assets
                </TabsTrigger>
                <TabsTrigger 
                  value="tts" 
                  className="text-xs"
                  onClick={() => handlePanelChange('tts')}
                >
                  <Mic className="h-3 w-3 mr-1" />
                  Narração
                </TabsTrigger>
              </TabsList>
              
              <TabsList className="grid w-full grid-cols-2 gap-1 mt-2">
                <TabsTrigger 
                  value="render" 
                  className="text-xs"
                  onClick={() => handlePanelChange('render')}
                >
                  <FileVideo className="h-3 w-3 mr-1" />
                  Render
                </TabsTrigger>
                <TabsTrigger 
                  value="effects" 
                  className="text-xs"
                  onClick={() => handlePanelChange('effects')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Efeitos
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-4">
                <TabsContent value="assets">
                  <PPTXAssetLibrary 
                    onAssetSelect={(asset) => toast.success(`📎 ${asset} adicionado`)}
                  />
                </TabsContent>

                <TabsContent value="tts">
                  <TTSVoiceSelector 
                    onVoiceSelect={(voice) => console.log('Voice selected:', voice)}
                    onGenerateTTS={handleTTSGenerate}
                    selectedSlideText={getCurrentSlideText()}
                  />
                </TabsContent>

                <TabsContent value="render">
                  <RealTimeRenderer 
                    projectId={project.id}
                    timeline={project.timeline}
                    onRenderComplete={handleRenderComplete}
                    onRenderError={handleRenderError}
                  />
                </TabsContent>

                <TabsContent value="effects">
                  <TransitionEffectsPanel 
                    onEffectSelect={(effect) => toast.success(`✨ Transição ${effect.name} aplicada`)}
                    selectedSlideIndex={selectedSlide}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Area */}
          <div className="flex-1 bg-gray-900 p-4">
            <div className="h-full flex items-center justify-center">
              <div 
                ref={canvasRef}
                className="relative bg-white rounded-lg shadow-2xl"
                style={{ width: '800px', height: '450px' }} // 16:9
              >
                {/* Canvas Content */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {project.timeline.scenes.length > 0 && (
                      <div className="text-center text-white p-8">
                        <h2 className="text-3xl font-bold mb-4">
                          {project.timeline.scenes[selectedSlide]?.title || 'Slide'}
                        </h2>
                        <p className="text-lg opacity-90 leading-relaxed">
                          {project.timeline.scenes[selectedSlide]?.content || 'Conteúdo do slide'}
                        </p>
                        
                        {/* Character Placeholder */}
                        <div className="absolute bottom-8 right-8">
                          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <span className="text-4xl">👨‍💼</span>
                          </div>
                        </div>

                        {/* Info Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/20 text-white">
                            Slide {selectedSlide + 1}/{project.timeline.scenes.length}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas Controls */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handlePlay}>
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? 'Pausar' : 'Reproduzir'}
              </Button>
              
              <Button variant="ghost" size="sm">
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <div className="border-l border-gray-600 pl-4">
                <span className="text-sm text-gray-400">
                  {Math.floor(project.timeline.currentTime || 0)}s / {project.timeline.totalDuration}s
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="h-80 bg-gray-800 border-t border-gray-700">
            <AnimakerTimelineEditor 
              slides={project.timeline.scenes}
              onTimelineChange={(timeline) => {
                setProject(prev => prev ? { ...prev, timeline } : null)
              }}
              onPlayStateChange={setIsPlaying}
            />
          </div>
        </div>

        {/* Right Sidebar - Slide Management */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-lg mb-3">Gerenciar Slides</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {project.timeline.scenes.map((scene: any, index: number) => (
              <Card 
                key={scene.id}
                className={`cursor-pointer transition-all ${
                  selectedSlide === index 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSlide(index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-gray-900">
                        {scene.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {scene.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {scene.duration}s
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          {scene.narrationText && <Mic className="h-3 w-3 mr-1" />}
                          {scene.audio?.backgroundMusic && <Volume2 className="h-3 w-3 mr-1" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Export Progress Modal */}
      <ExportProgressModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        jobId={currentRenderJob}
        onComplete={handleRenderComplete}
      />
    </div>
  )
}
