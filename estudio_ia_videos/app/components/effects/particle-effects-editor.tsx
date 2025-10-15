
'use client'

/**
 * ✨ PARTICLE EFFECTS EDITOR - 3D Particle Systems with Three.js
 * Sistema profissional de efeitos de partículas usando Three.js + React Three Fiber
 */

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  Flame,
  Snowflake,
  Zap,
  Star,
  Wind,
  Droplets,
  Play,
  Pause,
  Download,
  Settings2,
  RotateCcw,
  Eye
} from 'lucide-react'

interface ParticleSystem {
  id: string
  name: string
  type: 'fire' | 'snow' | 'rain' | 'magic' | 'explosion' | 'smoke'
  description: string
  icon: React.ReactNode
  premium: boolean
  defaultSettings: ParticleSettings
}

interface ParticleSettings {
  count: number
  size: number
  speed: number
  spread: number
  lifetime: number
  color1: string
  color2: string
  gravity: number
  turbulence: number
}

const particleSystems: ParticleSystem[] = [
  {
    id: 'fire',
    name: 'Fogo Realista',
    type: 'fire',
    description: 'Sistema de fogo com física realista',
    icon: <Flame className="h-5 w-5" />,
    premium: true,
    defaultSettings: {
      count: 500,
      size: 2,
      speed: 3,
      spread: 0.5,
      lifetime: 2,
      color1: '#ff4400',
      color2: '#ffaa00',
      gravity: -2,
      turbulence: 1
    }
  },
  {
    id: 'snow',
    name: 'Neve Suave',
    type: 'snow',
    description: 'Flocos de neve caindo suavemente',
    icon: <Snowflake className="h-5 w-5" />,
    premium: false,
    defaultSettings: {
      count: 300,
      size: 1.5,
      speed: 0.5,
      spread: 5,
      lifetime: 10,
      color1: '#ffffff',
      color2: '#e0e7ff',
      gravity: 0.1,
      turbulence: 0.2
    }
  },
  {
    id: 'magic',
    name: 'Partículas Mágicas',
    type: 'magic',
    description: 'Efeito mágico com brilho e movimento fluido',
    icon: <Sparkles className="h-5 w-5" />,
    premium: true,
    defaultSettings: {
      count: 200,
      size: 3,
      speed: 1.5,
      spread: 2,
      lifetime: 4,
      color1: '#8b5cf6',
      color2: '#06b6d4',
      gravity: 0,
      turbulence: 2
    }
  },
  {
    id: 'explosion',
    name: 'Explosão',
    type: 'explosion',
    description: 'Efeito de explosão com partículas espalhando',
    icon: <Zap className="h-5 w-5" />,
    premium: true,
    defaultSettings: {
      count: 800,
      size: 2.5,
      speed: 8,
      spread: 3,
      lifetime: 1.5,
      color1: '#fbbf24',
      color2: '#f59e0b',
      gravity: 1,
      turbulence: 3
    }
  },
  {
    id: 'rain',
    name: 'Chuva',
    type: 'rain',
    description: 'Gotas de chuva caindo',
    icon: <Droplets className="h-5 w-5" />,
    premium: false,
    defaultSettings: {
      count: 1000,
      size: 0.5,
      speed: 5,
      spread: 8,
      lifetime: 3,
      color1: '#3b82f6',
      color2: '#1e40af',
      gravity: 2,
      turbulence: 0.1
    }
  },
  {
    id: 'smoke',
    name: 'Fumaça',
    type: 'smoke',
    description: 'Fumaça densa com movimento orgânico',
    icon: <Wind className="h-5 w-5" />,
    premium: true,
    defaultSettings: {
      count: 150,
      size: 8,
      speed: 1,
      spread: 1.5,
      lifetime: 6,
      color1: '#6b7280',
      color2: '#374151',
      gravity: -0.5,
      turbulence: 1.5
    }
  }
]

// Componente das partículas 3D
function ParticleField({ system, settings, isPlaying }: {
  system: ParticleSystem
  settings: ParticleSettings
  isPlaying: boolean
}) {
  const meshRef = useRef<THREE.Points>(null)
  const particles = useRef<{ 
    positions: Float32Array
    velocities: Float32Array
    lifetimes: Float32Array
    maxLifetimes: Float32Array
  }>()

  useEffect(() => {
    if (!meshRef.current) return

    const count = settings.count
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const lifetimes = new Float32Array(count)
    const maxLifetimes = new Float32Array(count)

    // Initialize particles
    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * settings.spread
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = (Math.random() - 0.5) * settings.spread

      // Velocity based on particle type
      let velX, velY, velZ
      switch (system.type) {
        case 'fire':
          velX = (Math.random() - 0.5) * 0.5
          velY = Math.random() * settings.speed
          velZ = (Math.random() - 0.5) * 0.5
          break
        case 'explosion':
          const angle = Math.random() * Math.PI * 2
          const force = Math.random() * settings.speed
          velX = Math.cos(angle) * force
          velY = Math.random() * settings.speed * 0.5
          velZ = Math.sin(angle) * force
          break
        case 'snow':
        case 'rain':
          velX = (Math.random() - 0.5) * 0.2
          velY = -Math.random() * settings.speed
          velZ = (Math.random() - 0.5) * 0.2
          break
        default:
          velX = (Math.random() - 0.5) * settings.speed
          velY = (Math.random() - 0.5) * settings.speed
          velZ = (Math.random() - 0.5) * settings.speed
      }

      velocities[i * 3] = velX
      velocities[i * 3 + 1] = velY
      velocities[i * 3 + 2] = velZ

      // Lifetime
      maxLifetimes[i] = settings.lifetime + (Math.random() - 0.5) * settings.lifetime * 0.5
      lifetimes[i] = Math.random() * maxLifetimes[i]
    }

    particles.current = { positions, velocities, lifetimes, maxLifetimes }
    meshRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }, [system, settings])

  useFrame((state, delta) => {
    if (!meshRef.current || !particles.current || !isPlaying) return

    const { positions, velocities, lifetimes, maxLifetimes } = particles.current
    const time = state.clock.getElapsedTime()

    for (let i = 0; i < settings.count; i++) {
      // Update lifetime
      lifetimes[i] -= delta

      if (lifetimes[i] <= 0) {
        // Respawn particle
        positions[i * 3] = (Math.random() - 0.5) * settings.spread
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = (Math.random() - 0.5) * settings.spread
        lifetimes[i] = maxLifetimes[i]
      } else {
        // Update position
        positions[i * 3] += velocities[i * 3] * delta
        positions[i * 3 + 1] += velocities[i * 3 + 1] * delta
        positions[i * 3 + 2] += velocities[i * 3 + 2] * delta

        // Apply gravity
        velocities[i * 3 + 1] -= settings.gravity * delta

        // Apply turbulence
        if (settings.turbulence > 0) {
          const turbulenceStrength = settings.turbulence * 0.1
          velocities[i * 3] += Math.sin(time * 2 + i * 0.1) * turbulenceStrength * delta
          velocities[i * 3 + 2] += Math.cos(time * 2 + i * 0.1) * turbulenceStrength * delta
        }
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  const createMaterial = () => {
    return new THREE.PointsMaterial({
      size: settings.size,
      color: new THREE.Color(settings.color1),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
      sizeAttenuation: true
    })
  }

  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <primitive object={createMaterial()} />
    </points>
  )
}

export default function ParticleEffectsEditor() {
  const [selectedSystem, setSelectedSystem] = useState<ParticleSystem | null>(null)
  const [settings, setSettings] = useState<ParticleSettings>(particleSystems[0].defaultSettings)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleSystemSelect = (system: ParticleSystem) => {
    setSelectedSystem(system)
    setSettings(system.defaultSettings)
    setIsPlaying(false)
  }

  const updateSetting = (key: keyof ParticleSettings, value: number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const exportSettings = () => {
    if (!selectedSystem) return
    
    const config = {
      system: selectedSystem.id,
      settings: settings
    }
    
    const dataStr = JSON.stringify(config, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `particle-${selectedSystem.id}-config.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Particle Effects Editor
            </h1>
            <p className="text-muted-foreground">
              Sistema profissional de efeitos de partículas 3D
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSettings} disabled={!selectedSystem}>
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Particle Systems */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Sistemas de Partículas</h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {particleSystems.map((system) => (
                <Card 
                  key={system.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedSystem?.id === system.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSystemSelect(system)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {system.icon}
                          <h4 className="font-medium">{system.name}</h4>
                        </div>
                        {system.premium && (
                          <Badge variant="outline" className="text-xs bg-gradient-primary text-white">
                            PRO
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {system.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* 3D Preview */}
          <div className="flex-1 relative">
            {selectedSystem ? (
              <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
                <color attach="background" args={['#0a0a0a']} />
                <ambientLight intensity={0.1} />
                <pointLight position={[10, 10, 10]} />
                
                <Suspense fallback={null}>
                  <ParticleField 
                    system={selectedSystem} 
                    settings={settings} 
                    isPlaying={isPlaying}
                  />
                  
                  {/* Ground reference */}
                  <Box position={[0, -2, 0]} args={[20, 0.1, 20]}>
                    <meshStandardMaterial color="#333333" transparent opacity={0.3} />
                  </Box>
                </Suspense>
                
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              </Canvas>
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/10">
                <div className="text-center space-y-4">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Selecione um sistema de partículas para visualizar
                  </p>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            {selectedSystem && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying(false)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          {selectedSystem && (
            <div className="h-80 p-6 pt-0">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Configurações - {selectedSystem.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Básico</TabsTrigger>
                      <TabsTrigger value="physics">Física</TabsTrigger>
                      <TabsTrigger value="appearance">Aparência</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Quantidade: {settings.count}</label>
                          <Slider
                            value={[settings.count]}
                            onValueChange={([value]) => updateSetting('count', value)}
                            min={10}
                            max={2000}
                            step={10}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tamanho: {settings.size}</label>
                          <Slider
                            value={[settings.size]}
                            onValueChange={([value]) => updateSetting('size', value)}
                            min={0.1}
                            max={10}
                            step={0.1}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Velocidade: {settings.speed}</label>
                          <Slider
                            value={[settings.speed]}
                            onValueChange={([value]) => updateSetting('speed', value)}
                            min={0.1}
                            max={20}
                            step={0.1}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Dispersão: {settings.spread}</label>
                          <Slider
                            value={[settings.spread]}
                            onValueChange={([value]) => updateSetting('spread', value)}
                            min={0.1}
                            max={20}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="physics" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Gravidade: {settings.gravity}</label>
                          <Slider
                            value={[settings.gravity]}
                            onValueChange={([value]) => updateSetting('gravity', value)}
                            min={-5}
                            max={5}
                            step={0.1}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Turbulência: {settings.turbulence}</label>
                          <Slider
                            value={[settings.turbulence]}
                            onValueChange={([value]) => updateSetting('turbulence', value)}
                            min={0}
                            max={5}
                            step={0.1}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Tempo de Vida: {settings.lifetime}s</label>
                          <Slider
                            value={[settings.lifetime]}
                            onValueChange={([value]) => updateSetting('lifetime', value)}
                            min={0.5}
                            max={10}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="appearance" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Cor Principal</label>
                          <input
                            type="color"
                            value={settings.color1}
                            onChange={(e) => updateSetting('color1', e.target.value)}
                            className="w-full h-10 border rounded-md"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Cor Secundária</label>
                          <input
                            type="color"
                            value={settings.color2}
                            onChange={(e) => updateSetting('color2', e.target.value)}
                            className="w-full h-10 border rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-6">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                        >
                          Aplicar ao Timeline
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => setIsPlaying(true)}
                        >
                          Testar Efeito
                        </Button>
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
