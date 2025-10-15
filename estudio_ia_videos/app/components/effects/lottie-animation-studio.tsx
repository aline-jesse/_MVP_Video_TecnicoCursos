
'use client'

/**
 * 🎭 LOTTIE ANIMATION STUDIO - Vector Animation Engine
 * Sistema profissional de animações Lottie com biblioteca integrada
 */

import React, { useState, useRef, useEffect } from 'react'
import lottie, { AnimationItem } from 'lottie-web'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  Download,
  Search,
  Heart,
  Star,
  Repeat,
  Settings2,
  Palette,
  Zap
} from 'lucide-react'

interface LottieAnimation {
  id: string
  name: string
  category: 'icons' | 'characters' | 'effects' | 'transitions' | 'ui'
  description: string
  tags: string[]
  premium: boolean
  duration: number
  size: 'small' | 'medium' | 'large'
  popularity: number
  // Em produção, isso seria uma URL para o arquivo JSON
  animationData: any
}

// Mock data - em produção viriam de uma API ou LottieFiles
const lottieLibrary: LottieAnimation[] = [
  {
    id: 'loading-dots',
    name: 'Loading Dots',
    category: 'ui',
    description: 'Animação de loading com pontos',
    tags: ['loading', 'ui', 'dots'],
    premium: false,
    duration: 1.5,
    size: 'small',
    popularity: 95,
    animationData: {
      // Animação simples de 3 círculos pulsando
      v: "5.5.7",
      fr: 30,
      ip: 0,
      op: 45,
      w: 200,
      h: 200,
      nm: "Loading Dots",
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "Dot 1",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [50, 100, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: { 
              a: 1, 
              k: [
                { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [100] },
                { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 15, s: [150] },
                { t: 30, s: [100] }
              ]
            }
          },
          ao: 0,
          shapes: [
            {
              ty: "el",
              p: { a: 0, k: [0, 0] },
              s: { a: 0, k: [20, 20] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.2, 0.6, 1, 1] },
              o: { a: 0, k: 100 }
            }
          ],
          ip: 0,
          op: 45,
          st: 0
        }
      ]
    }
  },
  {
    id: 'success-check',
    name: 'Success Check',
    category: 'icons',
    description: 'Checkmark animado de sucesso',
    tags: ['success', 'check', 'done'],
    premium: false,
    duration: 1,
    size: 'medium',
    popularity: 88,
    animationData: {
      // Animação simples de check
      v: "5.5.7",
      fr: 30,
      ip: 0,
      op: 30,
      w: 200,
      h: 200,
      nm: "Success Check",
      layers: []
    }
  },
  {
    id: 'floating-particles',
    name: 'Floating Particles',
    category: 'effects',
    description: 'Partículas flutuantes mágicas',
    tags: ['particles', 'magic', 'float'],
    premium: true,
    duration: 3,
    size: 'large',
    popularity: 92,
    animationData: {
      // Animação mais complexa
      v: "5.5.7",
      fr: 30,
      ip: 0,
      op: 90,
      w: 400,
      h: 400,
      nm: "Floating Particles",
      layers: []
    }
  },
  {
    id: 'typing-text',
    name: 'Typing Text',
    category: 'ui',
    description: 'Efeito de texto sendo digitado',
    tags: ['text', 'typing', 'write'],
    premium: true,
    duration: 2,
    size: 'medium',
    popularity: 85,
    animationData: {
      v: "5.5.7",
      fr: 30,
      ip: 0,
      op: 60,
      w: 300,
      h: 100,
      nm: "Typing Text",
      layers: []
    }
  },
  {
    id: 'morph-shapes',
    name: 'Morphing Shapes',
    category: 'transitions',
    description: 'Formas se transformando fluidamente',
    tags: ['morph', 'shapes', 'transform'],
    premium: true,
    duration: 2.5,
    size: 'large',
    popularity: 90,
    animationData: {
      v: "5.5.7",
      fr: 30,
      ip: 0,
      op: 75,
      w: 300,
      h: 300,
      nm: "Morphing Shapes",
      layers: []
    }
  }
]

export default function LottieAnimationStudio() {
  const [selectedAnimation, setSelectedAnimation] = useState<LottieAnimation | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(true)
  const [animation, setAnimation] = useState<AnimationItem | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'icons', label: 'Ícones' },
    { id: 'characters', label: 'Personagens' },
    { id: 'effects', label: 'Efeitos' },
    { id: 'transitions', label: 'Transições' },
    { id: 'ui', label: 'Interface' }
  ]

  const filteredAnimations = lottieLibrary.filter(anim => {
    const matchesCategory = activeCategory === 'all' || anim.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      anim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anim.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const loadAnimation = (animationData: LottieAnimation) => {
    if (!containerRef.current) return

    // Destroy previous animation
    if (animation) {
      animation.destroy()
    }

    // Load new animation
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: loop,
      autoplay: false,
      animationData: animationData.animationData
    })

    // Set speed
    anim.setSpeed(speed)

    // Event listeners
    anim.addEventListener('complete', () => {
      setIsPlaying(false)
    })

    anim.addEventListener('enterFrame', (event: any) => {
      setCurrentFrame(Math.floor(event.currentTime))
    })

    setAnimation(anim)
    setSelectedAnimation(animationData)
    setCurrentFrame(0)
  }

  const playAnimation = () => {
    if (animation) {
      animation.play()
      setIsPlaying(true)
    }
  }

  const pauseAnimation = () => {
    if (animation) {
      animation.pause()
      setIsPlaying(false)
    }
  }

  const stopAnimation = () => {
    if (animation) {
      animation.stop()
      setIsPlaying(false)
      setCurrentFrame(0)
    }
  }

  const seekToFrame = (frame: number) => {
    if (animation) {
      animation.goToAndStop(frame, true)
      setCurrentFrame(frame)
    }
  }

  const exportAnimation = () => {
    if (!selectedAnimation) return
    
    const config = {
      animation: selectedAnimation.id,
      settings: {
        speed,
        loop,
        autoplay: true
      }
    }
    
    const dataStr = JSON.stringify(config, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `lottie-${selectedAnimation.id}-config.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (animation) {
      animation.setSpeed(speed)
    }
  }, [speed, animation])

  useEffect(() => {
    if (animation) {
      animation.loop = loop
    }
  }, [loop, animation])

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'large': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Lottie Animation Studio
            </h1>
            <p className="text-muted-foreground">
              Biblioteca profissional de animações vetoriais
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Lottie
            </Button>
            <Button onClick={exportAnimation} disabled={!selectedAnimation}>
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Animation Library */}
        <div className="w-80 border-r flex flex-col">
          {/* Search and Categories */}
          <div className="p-4 border-b space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar animações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Animation List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {filteredAnimations.map((anim) => (
                <Card 
                  key={anim.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAnimation?.id === anim.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => loadAnimation(anim)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{anim.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{anim.popularity}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {anim.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getSizeColor(anim.size)}>
                            {anim.size}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {anim.duration}s
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          {anim.premium && (
                            <Badge variant="outline" className="text-xs bg-gradient-primary text-white">
                              PRO
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {anim.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Animation Preview */}
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Preview
                    {selectedAnimation && (
                      <Badge variant="secondary">
                        {selectedAnimation.name}
                      </Badge>
                    )}
                  </div>
                  
                  {selectedAnimation && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={stopAnimation}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={isPlaying ? pauseAnimation : playAnimation}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {selectedAnimation ? (
                  <div className="text-center">
                    <div 
                      ref={containerRef}
                      className="w-80 h-80 mx-auto mb-4 border rounded-lg"
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                    
                    {/* Timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Frame: {currentFrame}</span>
                        <span>Duração: {selectedAnimation.duration}s</span>
                      </div>
                      
                      <Slider
                        value={[currentFrame]}
                        onValueChange={([value]) => seekToFrame(value)}
                        min={0}
                        max={Math.floor(selectedAnimation.duration * 30)} // 30 FPS
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      Selecione uma animação para visualizar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls Panel */}
          {selectedAnimation && (
            <div className="h-64 p-6 pt-0">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Controles de Animação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="playback">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="playback">Reprodução</TabsTrigger>
                      <TabsTrigger value="export">Exportar</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="playback" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Velocidade: {speed}x</label>
                          <Slider
                            value={[speed]}
                            onValueChange={([value]) => setSpeed(value)}
                            min={0.1}
                            max={3}
                            step={0.1}
                          />
                        </div>
                        
                        <div className="space-y-2 flex flex-col justify-end">
                          <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4" />
                            <span className="text-sm">Loop</span>
                            <input
                              type="checkbox"
                              checked={loop}
                              onChange={(e) => setLoop(e.target.checked)}
                              className="ml-auto"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={playAnimation}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Reproduzir
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={pauseAnimation}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={stopAnimation}
                        >
                          <SkipBack className="h-4 w-4 mr-2" />
                          Parar
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="export" className="mt-4">
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">Configurações de Export</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>• Velocidade: {speed}x</p>
                            <p>• Loop: {loop ? 'Ativado' : 'Desativado'}</p>
                            <p>• Formato: JSON (Lottie)</p>
                            <p>• Tamanho: {selectedAnimation.size}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Aplicar ao Timeline
                          </Button>
                          <Button className="flex-1" onClick={exportAnimation}>
                            <Download className="h-4 w-4 mr-2" />
                            Export JSON
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
