
'use client'

/**
 * 🎬 GSAP EFFECTS STUDIO - Hollywood Grade Animation Engine
 * Sistema profissional de efeitos usando GSAP com preview real-time
 */

import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sparkles,
  Zap,
  Wind,
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  Download,
  Settings2,
  Eye,
  Layers,
  Timer
} from 'lucide-react'

interface GSAPEffect {
  id: string
  name: string
  category: 'entrada' | 'saída' | 'movimento' | 'texto' | 'especial'
  description: string
  duration: number
  difficulty: 'Fácil' | 'Intermediário' | 'Avançado'
  premium: boolean
  preview: () => gsap.core.Timeline
}

const gsapEffects: GSAPEffect[] = [
  {
    id: 'fade-in-up',
    name: 'Fade In Up',
    category: 'entrada',
    description: 'Elemento aparece deslocando de baixo para cima',
    duration: 1,
    difficulty: 'Fácil',
    premium: false,
    preview: () => gsap.timeline().from('.demo-element', { opacity: 0, y: 50, duration: 1 })
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    category: 'entrada',
    description: 'Entrada com efeito de bounce elástico',
    duration: 1.2,
    difficulty: 'Fácil',
    premium: false,
    preview: () => gsap.timeline().from('.demo-element', { scale: 0, duration: 1.2, ease: "bounce.out" })
  },
  {
    id: 'slide-reveal',
    name: 'Slide Reveal',
    category: 'entrada',
    description: 'Revelação por slide com mask avançado',
    duration: 1.5,
    difficulty: 'Intermediário',
    premium: true,
    preview: () => gsap.timeline().fromTo('.demo-element', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.5 })
  },
  {
    id: 'morph-text',
    name: 'Morphing Text',
    category: 'texto',
    description: 'Transformação fluida entre textos',
    duration: 2,
    difficulty: 'Avançado',
    premium: true,
    preview: () => gsap.timeline().to('.demo-element', { morphSVG: "circle", duration: 2 })
  },
  {
    id: 'particle-burst',
    name: 'Particle Burst',
    category: 'especial',
    description: 'Explosão de partículas com física',
    duration: 3,
    difficulty: 'Avançado',
    premium: true,
    preview: () => gsap.timeline().to('.demo-element', { scale: 2, rotation: 360, duration: 3, ease: "power2.out" })
  },
  {
    id: 'liquid-wave',
    name: 'Liquid Wave',
    category: 'movimento',
    description: 'Movimento fluido como líquido',
    duration: 2.5,
    difficulty: 'Avançado',
    premium: true,
    preview: () => gsap.timeline().to('.demo-element', { 
      y: -20, 
      scaleY: 1.2, 
      duration: 2.5, 
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    })
  }
]

export default function GSAPEffectsStudio() {
  const [selectedEffect, setSelectedEffect] = useState<GSAPEffect | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null)
  const [effectSettings, setEffectSettings] = useState({
    duration: 1,
    delay: 0,
    ease: 'power2.out',
    repeat: 0
  })

  const previewRef = useRef<HTMLDivElement>(null)

  const categories = [
    { id: 'all', label: 'Todos', icon: <Layers className="h-4 w-4" /> },
    { id: 'entrada', label: 'Entrada', icon: <Zap className="h-4 w-4" /> },
    { id: 'saída', label: 'Saída', icon: <RotateCcw className="h-4 w-4" /> },
    { id: 'movimento', label: 'Movimento', icon: <Wind className="h-4 w-4" /> },
    { id: 'texto', label: 'Texto', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'especial', label: 'Especial', icon: <Sparkles className="h-4 w-4" /> }
  ]

  const filteredEffects = activeCategory === 'all' 
    ? gsapEffects 
    : gsapEffects.filter(effect => effect.category === activeCategory)

  const playEffect = (effect: GSAPEffect) => {
    if (!previewRef.current) return

    // Kill previous timeline
    if (timeline) {
      timeline.kill()
    }

    // Create new timeline with settings
    const tl = gsap.timeline({
      repeat: effectSettings.repeat === -1 ? -1 : effectSettings.repeat,
      yoyo: effectSettings.repeat !== 0
    })

    // Reset element
    gsap.set(previewRef.current, { clearProps: "all" })

    // Apply effect based on type
    switch (effect.id) {
      case 'fade-in-up':
        tl.fromTo(previewRef.current, 
          { opacity: 0, y: 50 }, 
          { opacity: 1, y: 0, duration: effectSettings.duration, delay: effectSettings.delay, ease: effectSettings.ease }
        )
        break
      case 'bounce-in':
        tl.fromTo(previewRef.current, 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: effectSettings.duration, delay: effectSettings.delay, ease: "bounce.out" }
        )
        break
      case 'slide-reveal':
        tl.fromTo(previewRef.current, 
          { clipPath: 'inset(0 100% 0 0)' }, 
          { clipPath: 'inset(0 0% 0 0)', duration: effectSettings.duration, delay: effectSettings.delay, ease: effectSettings.ease }
        )
        break
      case 'particle-burst':
        tl.to(previewRef.current, 
          { scale: 1.5, rotation: 180, duration: effectSettings.duration, delay: effectSettings.delay, ease: "power2.out" }
        )
        .to(previewRef.current, 
          { scale: 1, rotation: 360, duration: effectSettings.duration * 0.5, ease: "power2.in" }
        )
        break
      case 'liquid-wave':
        tl.to(previewRef.current, 
          { 
            y: -30, 
            scaleY: 1.3, 
            skewX: 5,
            duration: effectSettings.duration, 
            delay: effectSettings.delay,
            ease: "sine.inOut"
          }
        )
        .to(previewRef.current, 
          { 
            y: 0, 
            scaleY: 1, 
            skewX: 0,
            duration: effectSettings.duration, 
            ease: "sine.inOut" 
          }
        )
        break
      default:
        tl.fromTo(previewRef.current, 
          { opacity: 0, scale: 0.8 }, 
          { opacity: 1, scale: 1, duration: effectSettings.duration, delay: effectSettings.delay, ease: effectSettings.ease }
        )
    }

    setTimeline(tl)
    setIsPlaying(true)

    tl.eventCallback('onComplete', () => {
      setIsPlaying(false)
    })
  }

  const stopEffect = () => {
    if (timeline) {
      timeline.pause()
      setIsPlaying(false)
    }
  }

  const resetEffect = () => {
    if (timeline) {
      timeline.restart()
      setIsPlaying(true)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-700'
      case 'Intermediário': return 'bg-yellow-100 text-yellow-700'
      case 'Avançado': return 'bg-red-100 text-red-700'
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
              <Sparkles className="h-6 w-6 text-primary" />
              GSAP Effects Studio
            </h1>
            <p className="text-muted-foreground">
              Biblioteca profissional de efeitos cinematográficos
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <Button>
              <Settings2 className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Effects Library */}
        <div className="w-80 border-r flex flex-col">
          {/* Categories */}
          <div className="p-4 border-b">
            <div className="grid grid-cols-3 gap-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  className="h-12 flex flex-col gap-1 text-xs"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.icon}
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Effects List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {filteredEffects.map((effect) => (
                <Card 
                  key={effect.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedEffect?.id === effect.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedEffect(effect)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{effect.name}</h3>
                        {effect.premium && (
                          <Badge variant="outline" className="text-xs bg-gradient-primary text-white">
                            PRO
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {effect.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="h-3 w-3" />
                          <span className="text-xs">{effect.duration}s</span>
                        </div>
                        <Badge variant="outline" className={getDifficultyColor(effect.difficulty)}>
                          {effect.difficulty}
                        </Badge>
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
          {/* Preview Area */}
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                    {selectedEffect && (
                      <Badge variant="secondary">
                        {selectedEffect.name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetEffect}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={isPlaying ? stopEffect : () => selectedEffect && playEffect(selectedEffect)}
                      disabled={!selectedEffect}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="relative">
                  {/* Demo Element */}
                  <div
                    ref={previewRef}
                    className="w-32 h-32 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg demo-element"
                  >
                    DEMO
                  </div>
                  
                  {!selectedEffect && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground text-center">
                        Selecione um efeito para visualizar
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          {selectedEffect && (
            <div className="h-80 p-6 pt-0">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Configurações do Efeito</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="timing">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="timing">Timing</TabsTrigger>
                      <TabsTrigger value="advanced">Avançado</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="timing" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Duração: {effectSettings.duration}s</label>
                        <Slider
                          value={[effectSettings.duration]}
                          onValueChange={([value]) => setEffectSettings(prev => ({ ...prev, duration: value }))}
                          min={0.1}
                          max={5}
                          step={0.1}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Delay: {effectSettings.delay}s</label>
                        <Slider
                          value={[effectSettings.delay]}
                          onValueChange={([value]) => setEffectSettings(prev => ({ ...prev, delay: value }))}
                          min={0}
                          max={3}
                          step={0.1}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Repetições: {effectSettings.repeat === -1 ? '∞' : effectSettings.repeat}</label>
                        <Slider
                          value={[effectSettings.repeat === -1 ? 10 : effectSettings.repeat]}
                          onValueChange={([value]) => setEffectSettings(prev => ({ ...prev, repeat: value === 10 ? -1 : value }))}
                          min={0}
                          max={10}
                          step={1}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="mt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Ease Function</label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={effectSettings.ease}
                            onChange={(e) => setEffectSettings(prev => ({ ...prev, ease: e.target.value }))}
                          >
                            <option value="power2.out">Power2 Out</option>
                            <option value="bounce.out">Bounce Out</option>
                            <option value="elastic.out">Elastic Out</option>
                            <option value="sine.inOut">Sine In Out</option>
                            <option value="expo.out">Expo Out</option>
                          </select>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => selectedEffect && playEffect(selectedEffect)}
                          >
                            Aplicar ao Timeline
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={() => selectedEffect && playEffect(selectedEffect)}
                          >
                            Testar Efeito
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
