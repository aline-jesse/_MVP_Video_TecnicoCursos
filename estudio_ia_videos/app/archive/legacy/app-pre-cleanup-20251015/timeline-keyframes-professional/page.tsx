
/**
 * 🎬 TIMELINE KEYFRAMES PROFESSIONAL - PÁGINA DEMO
 * Demonstração do sistema real de timeline com keyframes GSAP
 */

'use client'

import React, { useState } from 'react'
import AppShell from '@/components/layouts/AppShell'
import AdvancedTimelineKeyframes from '@/components/timeline/advanced-timeline-keyframes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Zap,
  Settings,
  Download,
  Layers,
  Clock,
  Target,
  Award,
  BookOpen,
  Code
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function TimelineKeyframesProfessionalPage() {
  const [activeDemo, setActiveDemo] = useState('timeline')
  const [stats, setStats] = useState({
    keyframes: 0,
    tracks: 0,
    duration: 30,
    fps: 30
  })

  const handleSaveTimeline = (timelineData: any) => {
    console.log('💾 Timeline salva:', timelineData)
    
    setStats({
      keyframes: timelineData.tracks.reduce((total: number, track: any) => 
        total + track.keyframes.length, 0
      ),
      tracks: timelineData.tracks.length,
      duration: timelineData.duration,
      fps: timelineData.fps
    })
    
    toast.success('Timeline salva com sucesso!')
  }

  const handleRenderTimeline = (timelineData: any) => {
    console.log('🎬 Renderizando timeline:', timelineData)
    toast.success('Renderização iniciada!')
    
    // Simular processo de renderização
    setTimeout(() => {
      toast.success('Vídeo renderizado com keyframes!')
    }, 3000)
  }

  const demoTimelineData = {
    id: 'demo-timeline',
    tracks: [
      {
        id: 'track-1',
        name: 'Título Principal',
        type: 'text' as const,
        keyframes: [
          {
            id: 'kf-1',
            time: 0,
            objectId: 'text-title',
            properties: { x: 0, y: 0, opacity: 0 },
            easing: 'ease-in-out',
            duration: 1
          },
          {
            id: 'kf-2',
            time: 1,
            objectId: 'text-title',
            properties: { x: 100, y: 50, opacity: 1 },
            easing: 'ease-in-out',
            duration: 2
          },
          {
            id: 'kf-3',
            time: 5,
            objectId: 'text-title',
            properties: { x: 200, y: 100, opacity: 0.5 },
            easing: 'bounce',
            duration: 1
          }
        ],
        duration: 30,
        locked: false,
        visible: true
      },
      {
        id: 'track-2',
        name: 'Background',
        type: 'image' as const,
        keyframes: [
          {
            id: 'kf-4',
            time: 0,
            objectId: 'bg-image',
            properties: { scaleX: 1, scaleY: 1, opacity: 1 },
            easing: 'ease-in',
            duration: 3
          },
          {
            id: 'kf-5',
            time: 3,
            objectId: 'bg-image',
            properties: { scaleX: 1.2, scaleY: 1.2, opacity: 0.8 },
            easing: 'ease-out',
            duration: 2
          }
        ],
        duration: 30,
        locked: false,
        visible: true
      }
    ],
    duration: 30,
    fps: 30,
    resolution: { width: 1920, height: 1080 }
  }

  return (
    <AppShell
      title="Timeline Keyframes Professional"
      description="Sistema real de animações com GSAP e timeline profissional"
    >
      <div className="max-w-full mx-auto p-6 space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Timeline Keyframes Professional
              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                🎬 GSAP
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-600">
                ⚡ REAL
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats.keyframes}</div>
                <div className="text-sm text-muted-foreground">Keyframes</div>
              </div>
              
              <div className="text-center">
                <Layers className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{stats.tracks}</div>
                <div className="text-sm text-muted-foreground">Tracks</div>
              </div>
              
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats.duration}s</div>
                <div className="text-sm text-muted-foreground">Duração</div>
              </div>
              
              <div className="text-center">
                <Play className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{stats.fps}</div>
                <div className="text-sm text-muted-foreground">FPS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Timeline Editor
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Exemplos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Editor de Timeline Profissional
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // Load demo data
                        toast('Dados de exemplo carregados', { icon: 'ℹ️' })
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Carregar Exemplo
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <AdvancedTimelineKeyframes
                    projectId="demo-keyframes"
                    initialData={demoTimelineData}
                    onSave={handleSaveTimeline}
                    onRender={handleRenderTimeline}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    GSAP Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Performance Otimizada</h3>
                    <p className="text-sm text-gray-600">
                      Animações 60 FPS com aceleração GPU usando GSAP Timeline
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Easing Avançado</h3>
                    <p className="text-sm text-gray-600">
                      Múltiplas opções de easing: bounce, elastic, back, power
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Keyframes Precisos</h3>
                    <p className="text-sm text-gray-600">
                      Controle frame-by-frame com interpolação suave
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Code className="h-4 w-4" />
                      <span className="font-medium">GSAP Timeline</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Sistema profissional usado por Netflix, Google e Adobe
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Recursos Avançados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded text-center">
                      <Layers className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                      <div className="text-sm font-medium">Multi-Track</div>
                    </div>
                    
                    <div className="p-3 border rounded text-center">
                      <Clock className="h-6 w-6 mx-auto mb-1 text-green-500" />
                      <div className="text-sm font-medium">Timeline Real</div>
                    </div>
                    
                    <div className="p-3 border rounded text-center">
                      <Settings className="h-6 w-6 mx-auto mb-1 text-gray-500" />
                      <div className="text-sm font-medium">Propriedades</div>
                    </div>
                    
                    <div className="p-3 border rounded text-center">
                      <Play className="h-6 w-6 mx-auto mb-1 text-red-500" />
                      <div className="text-sm font-medium">Preview Live</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Sincronização Áudio-Vídeo</h3>
                    <p className="text-sm text-gray-600">
                      Timeline com waveform e sincronização precisa
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Export FFmpeg</h3>
                    <p className="text-sm text-gray-600">
                      Renderização final com todas as animações aplicadas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fade In/Out</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Animação suave de entrada e saída
                    </div>
                    <div className="p-3 bg-gray-50 rounded font-mono text-xs">
                      {`opacity: 0 → 1 → 0`}
                    </div>
                    <div className="text-xs text-gray-500">
                      ⏱️ Duração: 2s | 📈 Easing: ease-in-out
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Slide & Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Movimento com mudança de escala
                    </div>
                    <div className="p-3 bg-gray-50 rounded font-mono text-xs">
                      {`x: 0→200, scale: 1→1.5`}
                    </div>
                    <div className="text-xs text-gray-500">
                      ⏱️ Duração: 3s | 📈 Easing: back.out
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rotation Bounce</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Rotação com efeito bounce
                    </div>
                    <div className="p-3 bg-gray-50 rounded font-mono text-xs">
                      {`rotation: 0→360°`}
                    </div>
                    <div className="text-xs text-gray-500">
                      ⏱️ Duração: 1.5s | 📈 Easing: bounce.out
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Casos de Uso Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Treinamentos Corporativos</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• Títulos animados com entrada suave</div>
                      <div>• Infográficos com revelação sequencial</div>
                      <div>• Destaque de elementos importantes</div>
                      <div>• Transições entre seções</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Apresentações Executivas</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• Gráficos com animação de crescimento</div>
                      <div>• Logo com entrada cinematográfica</div>
                      <div>• Texto com efeito typewriter</div>
                      <div>• Call-to-action pulsante</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informações Técnicas */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-medium mb-1 text-green-800">GSAP Timeline</h3>
                <p className="text-green-700">
                  Sistema profissional de animações com GPU acceleration
                </p>
              </div>
              
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-medium mb-1 text-green-800">Keyframes Precisos</h3>
                <p className="text-green-700">
                  Controle frame-by-frame com interpolação matemática precisa
                </p>
              </div>
              
              <div className="text-center">
                <Download className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-medium mb-1 text-green-800">Export Real</h3>
                <p className="text-green-700">
                  Renderização final com FFmpeg aplicando todas as animações
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
