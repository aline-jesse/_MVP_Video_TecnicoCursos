
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Settings,
  Download,
  Type,
  Image,
  User,
  Sparkles,
  Layers,
  Save,
  Eye,
  Grid
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EditorPrototypeProps {
  project?: any
  onSave?: () => void
  onPreview?: () => void
  onExport?: () => void
}

export function EditorPrototype({ project, onSave, onPreview, onExport }: EditorPrototypeProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [timeline, setTimeline] = useState(0)

  const mockSlides = [
    { id: 1, title: 'Introdução NR-12', duration: 5, elements: ['title', 'avatar'] },
    { id: 2, title: 'Equipamentos', duration: 7, elements: ['text', 'image', 'avatar'] },
    { id: 3, title: 'Procedimentos', duration: 6, elements: ['checklist', 'avatar'] },
    { id: 4, title: 'Conclusão', duration: 4, elements: ['summary', 'cta'] }
  ]

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    toast.success(isPlaying ? 'Reprodução pausada' : 'Reprodução iniciada')
  }

  const handleAddElement = (elementType: string) => {
    toast.success(`${elementType} adicionado ao slide ${currentSlide + 1}`)
  }

  const handleSave = () => {
    toast.success('Projeto salvo (protótipo)')
    onSave?.()
  }

  const handlePreview = () => {
    toast.success('Gerando preview...')
    setTimeout(() => {
      toast.success('Preview gerado! (simulação)')
      onPreview?.()
    }, 2000)
  }

  const handleExport = () => {
    toast.success('Iniciando exportação...')
    setTimeout(() => {
      toast.success('Vídeo exportado com sucesso! (simulação)')
      onExport?.()
    }, 3000)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Toolbar */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">Editor Canvas</h1>
          <Badge variant="secondary" className="bg-green-600">Protótipo Navegável</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button className="bg-blue-600" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Elements */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
          <h3 className="font-semibold mb-4">Elementos</h3>
          
          <div className="space-y-3">
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" />
                  Avatares 3D
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {['Executivo', 'Engenheira', 'Técnico', 'Professora'].map((avatar) => (
                    <Button
                      key={avatar}
                      variant="outline"
                      size="sm"
                      className="h-16 flex-col bg-gray-600 border-gray-500"
                      onClick={() => handleAddElement(`Avatar ${avatar}`)}
                    >
                      <span className="text-lg mb-1">
                        {avatar.includes('a') ? '👩‍💼' : '👨‍💼'}
                      </span>
                      <span className="text-xs">{avatar}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="h-4 w-4 text-green-400" />
                  Texto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['Título', 'Subtítulo', 'Corpo', 'Destaque'].map((textType) => (
                  <Button
                    key={textType}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-gray-600 border-gray-500"
                    onClick={() => handleAddElement(`Texto ${textType}`)}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    {textType}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image className="h-4 w-4 text-purple-400" />
                  Mídia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-gray-600 border-gray-500"
                  onClick={() => handleAddElement('Imagem')}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Adicionar Imagem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-gray-600 border-gray-500"
                  onClick={() => handleAddElement('Vídeo')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Adicionar Vídeo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="h-full flex items-center justify-center">
              <div className="relative bg-white rounded-lg shadow-2xl" style={{ width: '800px', height: '450px' }}>
                {/* Canvas Content */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                  {/* Grid */}
                  <div className="absolute inset-0 opacity-20">
                    <Grid className="w-full h-full text-white" />
                  </div>
                  
                  {/* Mock Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-2xl font-bold mb-4">
                        {mockSlides[currentSlide]?.title}
                      </h2>
                      <p className="text-lg opacity-90 mb-6">
                        Slide {currentSlide + 1} de {mockSlides.length}
                      </p>
                      
                      {/* Mock Avatar */}
                      <div className="absolute bottom-6 right-6 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                        👨‍💼
                      </div>
                      
                      {/* Mock Text Element */}
                      <div className="absolute top-6 left-6 bg-white/10 p-3 rounded">
                        <Type className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48 bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                Timeline
              </h3>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handlePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400 ml-4">
                  00:00 / 04:30
                </span>
              </div>
            </div>

            {/* Slides Timeline */}
            <div className="space-y-3">
              <div className="bg-gray-700 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-300">SLIDES</span>
                  <span className="text-xs text-gray-400">{mockSlides.length} slides</span>
                </div>
                <div className="flex gap-1">
                  {mockSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`flex-1 h-16 rounded cursor-pointer transition-all ${
                        currentSlide === index ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    >
                      <div className="p-2 text-center">
                        <div className="text-xs font-medium truncate">{slide.title}</div>
                        <div className="text-xs text-gray-300">{slide.duration}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Timeline */}
              <div className="bg-gray-700 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-300">ÁUDIO</span>
                  <Volume2 className="h-4 w-4 text-green-400" />
                </div>
                <div className="h-8 bg-gray-600 rounded flex items-center px-2">
                  <div className="flex-1 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded">
                    <div className="flex items-center h-full px-2">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-white/60 rounded mx-0.5"
                          style={{ height: `${Math.random() * 12 + 4}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
          <h3 className="font-semibold mb-4">Propriedades</h3>
          
          {selectedElement ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Posição X</label>
                <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Posição Y</label>
                <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Escala</label>
                <Slider defaultValue={[100]} max={200} step={1} className="mt-2" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Opacidade</label>
                <Slider defaultValue={[100]} max={100} step={1} className="mt-2" />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Selecione um elemento para editar</p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Button variant="outline" size="sm" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Efeitos IA
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Volume2 className="h-4 w-4 mr-2" />
              Configurar TTS
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
