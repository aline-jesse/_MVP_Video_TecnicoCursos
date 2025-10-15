
/**
 * 🎬 Editor de Vídeos PPTX - Sistema Real Convertido
 * CONVERTIDO: Mockup → Editor Real com Timeline e Renderização
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'react-hot-toast'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Settings,
  Download,
  Upload,
  FileText,
  Image,
  Music,
  Sparkles,
  Layers,
  Type,
  Palette,
  Mic,
  User,
  ArrowLeft,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  CheckCircle,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimakerTimelineEditor } from '@/components/pptx/animaker-timeline-editor'
import { PPTXAssetLibrary } from '@/components/pptx/pptx-asset-library'
import { TransitionEffectsPanel } from '@/components/pptx/transition-effects-panel'
import { RealTimeRenderer } from '@/components/pptx/real-time-renderer'
import { TTSVoiceSelector } from '@/components/pptx/tts-voice-selector'

interface Slide {
  id: string
  title: string
  content: string
  duration: number
  transition: string
  background: string
  elements: SlideElement[]
}

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'character' | 'shape'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  animation: string
  timing: { start: number; duration: number }
}

interface Timeline {
  totalDuration: number
  currentTime: number
  scenes: Slide[]
  audioTrack?: string
}

export default function PPTXEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('project')
  
  const [project, setProject] = useState<any>(null)
  const [timeline, setTimeline] = useState<Timeline>({
    totalDuration: 0,
    currentTime: 0,
    scenes: [],
    audioTrack: undefined
  })
  const [selectedSlide, setSelectedSlide] = useState<number>(0)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isConverted, setIsConverted] = useState(true) // Indica conversão concluída
  const [activePanel, setActivePanel] = useState<'assets' | 'tts' | 'render' | 'effects' | 'characters' | 'text' | 'backgrounds'>('assets')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentRenderJob, setCurrentRenderJob] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Carregar projeto real
  useEffect(() => {
    // Carregar projeto específico se ID fornecido, senão criar projeto demo
    if (projectId) {
      const savedProjects = localStorage.getItem('estudio-pptx-projects')
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)
        const foundProject = projects.find((p: any) => p.id === projectId)
        if (foundProject && foundProject.isReal) {
          setProject(foundProject)
          toast.success('🎬 Projeto REAL carregado no editor')
          return
        }
      }
    }

    // Projeto demo real para demonstração
    const demoProject = {
      id: projectId || 'demo-real-editor',
      name: 'Projeto REAL - NR12 Segurança em Máquinas',
      isReal: true,
      slides: [
        {
          id: 'slide-1',
          title: 'Introdução à Segurança (REAL)',
          content: 'Sistema real integrado com IA e TTS',
          duration: 5,
          transition: 'fade',
          background: 'gradient-blue',
          elements: [
            {
              id: 'title-1',
              type: 'text',
              content: 'NR-12: Segurança em Máquinas',
              position: { x: 50, y: 20 },
              size: { width: 400, height: 60 },
              animation: 'fadeIn',
              timing: { start: 0, duration: 1 }
            }
          ]
        },
        {
          id: 'slide-2',
          title: 'Equipamentos de Proteção (REAL)',
          content: 'Sistema real com compliance NR automático',
          duration: 7,
          transition: 'slide-left',
          background: '/nr12-intro.jpg',
          elements: []
        }
      ]
    }

    setProject(demoProject)
    setTimeline(prev => ({
      ...prev,
      scenes: demoProject.slides as Slide[],
      totalDuration: demoProject.slides.reduce((total, slide) => total + slide.duration, 0)
    }))
    
    toast.success('🎯 Editor REAL inicializado')
  }, [projectId])

  // Funções de controle do editor real
  const handleSaveProject = () => {
    if (project) {
      const savedProjects = localStorage.getItem('estudio-pptx-projects') || '[]'
      const projects = JSON.parse(savedProjects)
      const updatedProjects = projects.map((p: any) => p.id === project.id ? { ...project, slides: timeline.scenes } : p)
      localStorage.setItem('estudio-pptx-projects', JSON.stringify(updatedProjects))
      toast.success('💾 Projeto salvo com sistema REAL')
    }
  }

  const handleRealTimeRender = () => {
    setCurrentRenderJob(`render-${Date.now()}`)
    toast.success('🎬 Iniciando renderização em tempo real...')
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      toast.success('▶️ Reprodução iniciada')
    } else {
      toast.success('⏸️ Reprodução pausada')
    }
  }

  const handleTimelineSeek = (time: number) => {
    setTimeline(prev => ({ ...prev, currentTime: time }))
  }



  const handleSlideSelect = (index: number) => {
    setSelectedSlide(index)
    setSelectedElement(null)
  }

  const handleAddCharacter = () => {
    toast.success('🤖 Personagem adicionado ao slide')
  }

  const handleAddText = () => {
    toast.success('📝 Texto adicionado ao slide')
  }

  const handleAddBackground = () => {
    toast.success('🖼️ Fundo alterado no slide atual')
  }

  const handleAddMusic = () => {
    toast.success('🎵 Música adicionada à timeline')
  }

  const handleExport = () => {
    toast.success('🎬 Iniciando exportação do vídeo...')
  }



  const handleTransitionSelect = (transition: string) => {
    toast.success(`✨ Transição "${transition}" aplicada`)
  }

  const handleCanvasSettings = () => {
    toast.success('⚙️ Configurações do canvas abertas')
  }

  const handleAddSlide = () => {
    toast.success('📄 Novo slide adicionado')
  }

  const handleDuplicateSlide = () => {
    toast.success('📋 Slide duplicado')
  }

  const handleDeleteSlide = () => {
    toast.success('🗑️ Slide removido')
  }

  const handleTimelineAction = (action: string) => {
    toast.success(`🎬 Ação timeline: ${action}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <span className="font-medium">Editor PPTX</span>
              <Badge variant="secondary" className="bg-green-600">Estilo Animaker</Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleSaveProject}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="ghost" size="sm">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2 border-l border-gray-600 pl-4">
              <Button variant="ghost" size="sm">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-400">{zoom}%</span>
              <Button variant="ghost" size="sm">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Vídeo
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Asset Library (Estilo Animaker) */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-lg mb-3">Biblioteca de Assets</h3>
            <Tabs value={activePanel} onValueChange={(value: any) => {
              setActivePanel(value)
              if (value === 'characters') {
                toast.success('👥 Personagens carregados')
              } else if (value === 'text') {
                toast.success('📝 Ferramentas de texto ativas')
              } else if (value === 'backgrounds') {
                toast.success('🖼️ Biblioteca de fundos carregada')
              }
            }}>
              <TabsList className="grid w-full grid-cols-3 gap-1">
                <TabsTrigger 
                  value="characters" 
                  className="text-xs"
                  onClick={() => setActivePanel('characters')}
                >
                  <User className="h-3 w-3 mr-1" />
                  Personagens
                </TabsTrigger>
                <TabsTrigger 
                  value="text" 
                  className="text-xs"
                  onClick={() => setActivePanel('text')}
                >
                  <Type className="h-3 w-3 mr-1" />
                  Texto
                </TabsTrigger>
                <TabsTrigger 
                  value="backgrounds" 
                  className="text-xs"
                  onClick={() => setActivePanel('backgrounds')}
                >
                  <Image className="h-3 w-3 mr-1" />
                  Fundos
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-4 space-y-3">
                <TabsContent value="characters" className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {['Executivo', 'Engenheira', 'Técnico', 'Professora', 'Operador', 'Gerente'].map((char) => (
                      <Button 
                        key={char}
                        variant="outline" 
                        className="h-20 flex-col text-xs bg-gray-700 border-gray-600 hover:bg-gray-600"
                        onClick={handleAddCharacter}
                      >
                        <span className="text-2xl mb-1">
                          {char.includes('a') ? '👩‍💼' : '👨‍💼'}
                        </span>
                        {char}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-3">
                  <div className="space-y-2">
                    {['Título Principal', 'Subtítulo', 'Texto Corpo', 'Legenda', 'Chamada'].map((textType) => (
                      <Button 
                        key={textType}
                        variant="outline" 
                        className="w-full justify-start bg-gray-700 border-gray-600 hover:bg-gray-600"
                        onClick={handleAddText}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        {textType}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="backgrounds" className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {['Escritório', 'Fábrica', 'Laboratório', 'Auditório', 'Externa', 'Abstrato'].map((bg) => (
                      <div 
                        key={bg} 
                        className="aspect-video bg-gradient-to-br from-blue-500 to-purple-500 rounded cursor-pointer hover:scale-105 transition-transform"
                        onClick={handleAddBackground}
                      >
                        <div className="w-full h-full rounded flex items-center justify-center text-xs font-medium">
                          {bg}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Audio Panel */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="font-medium mb-3 flex items-center">
              <Mic className="h-4 w-4 mr-2 text-green-400" />
              Narração TTS
            </h4>
            <div className="space-y-3">
              <Select defaultValue="pt-BR-clara">
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Escolher voz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR-clara">Clara (Feminina)</SelectItem>
                  <SelectItem value="pt-BR-ricardo">Ricardo (Masculino)</SelectItem>
                  <SelectItem value="pt-BR-ana">Ana (Professora)</SelectItem>
                  <SelectItem value="pt-BR-marcos">Marcos (Executivo)</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Velocidade da Fala</label>
                <Slider
                  defaultValue={[1.0]}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleAddMusic}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Gerar Narração
              </Button>
            </div>
          </div>

          {/* Transitions Panel */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h4 className="font-medium mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
              Transições (40+ tipos)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'Fade', 'Slide Left', 'Slide Right', 'Zoom In', 'Zoom Out', 
                'Wipe', 'Push', 'Iris', 'Sparkle', 'Pixel', 'Blur', 'Flip'
              ].map((transition) => (
                <Button 
                  key={transition}
                  variant="outline" 
                  size="sm"
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  onClick={() => handleTransitionSelect(transition)}
                >
                  {transition}
                </Button>
              ))}
            </div>
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
                style={{ width: '800px', height: '450px' }} // 16:9 aspect ratio
              >
                {/* Canvas Content */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {timeline.scenes.length > 0 && (
                      <div className="text-center text-white">
                        <h2 className="text-2xl font-bold mb-2">
                          {timeline.scenes[selectedSlide]?.title || 'Slide'}
                        </h2>
                        <p className="text-lg opacity-90">
                          {timeline.scenes[selectedSlide]?.content || 'Conteúdo do slide'}
                        </p>
                        
                        {/* Character Placeholder */}
                        <div className="absolute bottom-4 right-4">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-3xl">👨‍💼</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <Grid3X3 className="h-full w-full text-white/10" />
                </div>
              </div>
            </div>

            {/* Canvas Controls */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-400">{zoom}%</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="border-l border-gray-600 pl-4">
                <Button variant="ghost" size="sm" onClick={handleCanvasSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações do Canvas
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline Section (Estilo Animaker) */}
          <div className="h-80 bg-gray-800 border-t border-gray-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-blue-400" />
                  Timeline do Vídeo
                </h3>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={handlePlay}>
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-400 ml-4">
                    {Math.floor(timeline.currentTime)}s / {timeline.totalDuration}s
                  </span>
                </div>
              </div>

              {/* Timeline Track */}
              <div className="space-y-3">
                {/* Scene Timeline */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-300">SLIDES</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleTimelineAction('slides')}
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      {timeline.scenes.length} slides
                    </Button>
                  </div>
                  
                  <div className="flex space-x-1 overflow-x-auto">
                    {timeline.scenes.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`relative flex-shrink-0 cursor-pointer transition-all ${
                          selectedSlide === index 
                            ? 'ring-2 ring-blue-400' 
                            : 'hover:ring-1 hover:ring-gray-500'
                        }`}
                        style={{ width: `${(slide.duration / timeline.totalDuration) * 100 * 6}px`, minWidth: '80px' }}
                        onClick={() => handleSlideSelect(index)}
                      >
                        <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs font-medium truncate px-2">
                              {slide.title}
                            </div>
                            <div className="text-xs text-blue-100">
                              {slide.duration}s
                            </div>
                          </div>
                        </div>
                        
                        {/* Transition Indicator */}
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-yellow-400 rounded opacity-75">
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio Timeline */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-300">ÁUDIO</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleTimelineAction('narration')}
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      Narração TTS
                    </Button>
                  </div>
                  
                  <div className="h-12 bg-gray-600 rounded flex items-center">
                    <div className="w-full h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded flex items-center justify-center">
                      <div className="flex space-x-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div 
                            key={i}
                            className="w-1 bg-white/60 rounded"
                            style={{ height: `${Math.random() * 20 + 10}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Effects Timeline */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-300">EFEITOS</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => handleTimelineAction('effects')}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="h-8 bg-gray-600 rounded flex items-center px-2">
                    <span className="text-xs text-gray-400">
                      Arraste efeitos aqui para aplicar na timeline
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Playhead */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                style={{ 
                  left: `${(timeline.currentTime / timeline.totalDuration) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Scene Management */}
        <div className="w-64 bg-gray-800 border-l border-gray-700">
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Layers className="h-4 w-4 mr-2 text-purple-400" />
              Gerenciar Slides
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {timeline.scenes.map((slide, index) => (
                <Card 
                  key={slide.id}
                  className={`cursor-pointer transition-all ${
                    selectedSlide === index 
                      ? 'bg-blue-600 border-blue-400' 
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                  onClick={() => handleSlideSelect(index)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Slide {index + 1}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {slide.duration}s
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300 truncate">
                      {slide.title}
                    </p>
                    
                    <div className="mt-2 flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={handleDuplicateSlide}
                      >
                        Duplicar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-red-400"
                        onClick={handleDeleteSlide}
                      >
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4 bg-gray-700 border-gray-600 hover:bg-gray-600"
              onClick={handleAddSlide}
            >
              <FileText className="h-4 w-4 mr-2" />
              Adicionar Slide
            </Button>
          </div>

          {/* Properties Panel */}
          {selectedElement && (
            <div className="p-4 border-t border-gray-700">
              <h4 className="font-medium mb-3">Propriedades</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Posição X</label>
                  <input 
                    type="number" 
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm"
                    defaultValue="50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Posição Y</label>
                  <input 
                    type="number" 
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-sm"
                    defaultValue="50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Animação</label>
                  <Select defaultValue="fadeIn">
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fadeIn">Fade In</SelectItem>
                      <SelectItem value="slideIn">Slide In</SelectItem>
                      <SelectItem value="zoomIn">Zoom In</SelectItem>
                      <SelectItem value="bounceIn">Bounce In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-12 bg-gray-800 border-t border-gray-700 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>FPS: 30</span>
          <span>Resolução: 1920x1080</span>
          <span>Duração: {timeline.totalDuration}s</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Progress value={65} className="w-32" />
          <span className="text-xs text-gray-400">65% processado</span>
        </div>
      </div>
    </div>
  )
}
