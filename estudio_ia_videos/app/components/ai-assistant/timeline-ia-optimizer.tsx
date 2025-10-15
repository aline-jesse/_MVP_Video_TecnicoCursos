
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Slider } from '../ui/slider'
import { 
  Clock, 
  Zap, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  Eye,
  Brain,
  Wand2,
  BarChart3,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Music,
  Image,
  Type,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface TimelineElement {
  id: string
  type: 'text' | 'image' | 'audio' | 'video' | 'transition'
  name: string
  startTime: number
  duration: number
  track: number
  optimizationScore: number
  suggestions: string[]
  color: string
}

interface OptimizationSuggestion {
  id: string
  type: 'timing' | 'pacing' | 'engagement' | 'flow'
  description: string
  impact: string
  confidence: number
  action: () => void
}

export default function TimelineIAOptimizer() {
  const [elements, setElements] = useState<TimelineElement[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(300) // 5 minutes
  const [isPlaying, setIsPlaying] = useState(false)
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([])
  const [overallScore, setOverallScore] = useState(0)

  // Dados mockados da timeline
  useEffect(() => {
    const mockElements: TimelineElement[] = [
      {
        id: '1',
        type: 'text',
        name: 'Introdução NR-12',
        startTime: 0,
        duration: 15,
        track: 1,
        optimizationScore: 92,
        suggestions: ['Reduzir para 12s', 'Melhorar transição'],
        color: 'bg-blue-500'
      },
      {
        id: '2',
        type: 'image',
        name: 'Diagrama de Segurança',
        startTime: 10,
        duration: 20,
        track: 2,
        optimizationScore: 78,
        suggestions: ['Aumentar para 25s', 'Adicionar zoom'],
        color: 'bg-green-500'
      },
      {
        id: '3',
        type: 'audio',
        name: 'Narração Principal',
        startTime: 0,
        duration: 180,
        track: 3,
        optimizationScore: 89,
        suggestions: ['Melhorar pausas', 'Ajustar volume'],
        color: 'bg-purple-500'
      },
      {
        id: '4',
        type: 'video',
        name: 'Demonstração Prática',
        startTime: 30,
        duration: 60,
        track: 1,
        optimizationScore: 85,
        suggestions: ['Acelerar em 10%', 'Adicionar legendas'],
        color: 'bg-red-500'
      },
      {
        id: '5',
        type: 'transition',
        name: 'Transição Fade',
        startTime: 90,
        duration: 2,
        track: 4,
        optimizationScore: 95,
        suggestions: ['Perfeito!'],
        color: 'bg-yellow-500'
      },
      {
        id: '6',
        type: 'text',
        name: 'Procedimentos',
        startTime: 100,
        duration: 45,
        track: 1,
        optimizationScore: 71,
        suggestions: ['Dividir em 2 slides', 'Melhorar legibilidade'],
        color: 'bg-blue-500'
      },
      {
        id: '7',
        type: 'image',
        name: 'Checklist EPI',
        startTime: 150,
        duration: 30,
        track: 2,
        optimizationScore: 88,
        suggestions: ['Adicionar animação', 'Destacar itens'],
        color: 'bg-green-500'
      }
    ]

    setElements(mockElements)
    calculateOverallScore(mockElements)
    generateOptimizationSuggestions()
  }, [])

  const calculateOverallScore = (elements: TimelineElement[]) => {
    const avgScore = elements.reduce((acc, el) => acc + el.optimizationScore, 0) / elements.length
    setOverallScore(Math.round(avgScore))
  }

  const generateOptimizationSuggestions = () => {
    const suggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        type: 'pacing',
        description: 'Acelerar introdução para melhor engajamento',
        impact: 'Aumenta retenção em 15%',
        confidence: 92,
        action: () => toast.success('Otimização de ritmo aplicada!')
      },
      {
        id: '2',
        type: 'engagement',
        description: 'Adicionar pontos de interação aos 60s e 120s',
        impact: 'Melhora engagement em 23%',
        confidence: 88,
        action: () => toast.success('Pontos de interação adicionados!')
      },
      {
        id: '3',
        type: 'flow',
        description: 'Reorganizar sequência de imagens',
        impact: 'Melhora fluxo narrativo em 18%',
        confidence: 85,
        action: () => toast.success('Sequência reorganizada!')
      },
      {
        id: '4',
        type: 'timing',
        description: 'Sincronizar melhor áudio com elementos visuais',
        impact: 'Reduz desconexão em 12%',
        confidence: 91,
        action: () => toast.success('Sincronização otimizada!')
      }
    ]

    setOptimizationSuggestions(suggestions)
  }

  const runAIOptimization = async () => {
    setIsOptimizing(true)

    // Simular otimização IA
    for (let progress = 0; progress <= 100; progress += 10) {
      setCurrentTime(progress * totalDuration / 100)
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Aplicar otimizações
    const optimizedElements = elements.map(el => ({
      ...el,
      optimizationScore: Math.min(100, el.optimizationScore + Math.random() * 10)
    }))

    setElements(optimizedElements)
    calculateOverallScore(optimizedElements)
    setIsOptimizing(false)
    toast.success('Timeline otimizada com IA! Score melhorado em 8 pontos.')
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-3 w-3" />
      case 'image': return <Image className="h-3 w-3" />
      case 'audio': return <Volume2 className="h-3 w-3" />
      case 'video': return <Play className="h-3 w-3" />
      case 'transition': return <Layers className="h-3 w-3" />
      default: return <Eye className="h-3 w-3" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'timing': return <Clock className="h-4 w-4" />
      case 'pacing': return <TrendingUp className="h-4 w-4" />
      case 'engagement': return <Target className="h-4 w-4" />
      case 'flow': return <Layers className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-600 rounded-xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-indigo-900">
                  Otimizador IA de Timeline
                </CardTitle>
                <p className="text-indigo-700 mt-1">
                  Otimização inteligente de ritmo, timing e engajamento
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getScoreColor(overallScore)} bg-gray-100`}>
                Score: {overallScore}/100
              </Badge>
              <Button 
                onClick={runAIOptimization}
                disabled={isOptimizing}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isOptimizing ? (
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Otimizar com IA
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline Visual */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controles de Reprodução */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 10))}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={[80]}
                    max={100}
                    step={1}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Barra de Progresso da Timeline */}
              <div className="relative">
                <Progress value={(currentTime / totalDuration) * 100} className="h-2" />
                <div 
                  className="absolute top-0 w-1 h-2 bg-red-500 rounded"
                  style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timeline Tracks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Timeline Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(track => (
                  <div key={track} className="relative">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-medium w-16">Track {track}</span>
                      <div className="flex-1 h-8 bg-gray-100 rounded relative">
                        {elements
                          .filter(el => el.track === track)
                          .map(element => (
                            <div
                              key={element.id}
                              className={`absolute h-6 rounded mt-1 ${element.color} opacity-80 hover:opacity-100 cursor-pointer transition-all`}
                              style={{
                                left: `${(element.startTime / totalDuration) * 100}%`,
                                width: `${(element.duration / totalDuration) * 100}%`,
                                minWidth: '20px'
                              }}
                              title={`${element.name} (${element.optimizationScore}/100)`}
                            >
                              <div className="flex items-center justify-between px-2 h-full">
                                <div className="flex items-center space-x-1">
                                  {getElementIcon(element.type)}
                                  <span className="text-xs text-white font-medium truncate">
                                    {element.name}
                                  </span>
                                </div>
                                <Badge 
                                  className={`text-xs ${getScoreColor(element.optimizationScore)} bg-white`}
                                >
                                  {element.optimizationScore}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Marcadores de Tempo */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i}>{formatTime((totalDuration / 5) * i)}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Elementos da Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Elementos da Timeline</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {elements.length} elementos
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {elements.map(element => (
                  <div key={element.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${element.color} rounded`}>
                        {getElementIcon(element.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{element.name}</h4>
                        <p className="text-xs text-gray-600">
                          {formatTime(element.startTime)} - {formatTime(element.startTime + element.duration)}
                          <span className="ml-2">({element.duration}s)</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getScoreColor(element.optimizationScore)} bg-white`}>
                        {element.optimizationScore}/100
                      </Badge>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Sugestões e Analytics */}
        <div className="space-y-4">
          {/* Score Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Score Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}/100
                </div>
                <Progress value={overallScore} className="h-3" />
                <p className="text-sm text-gray-600">
                  {overallScore >= 90 ? 'Excelente!' : 
                   overallScore >= 70 ? 'Bom, pode melhorar' : 'Precisa otimização'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sugestões IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Sugestões IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {optimizationSuggestions.map(suggestion => (
                <div key={suggestion.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSuggestionIcon(suggestion.type)}
                      <span className="font-medium text-sm capitalize">
                        {suggestion.type}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.confidence}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {suggestion.description}
                  </p>
                  <p className="text-xs text-green-600 font-medium mb-2">
                    💡 {suggestion.impact}
                  </p>
                  <Button
                    size="sm"
                    onClick={suggestion.action}
                    className="w-full"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Aplicar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Métricas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ritmo</span>
                  <span className="font-medium">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Engajamento</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fluxo Narrativo</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sincronização</span>
                  <span className="font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Status Otimização */}
          {isOptimizing && (
            <Card>
              <CardContent className="py-6 text-center">
                <div className="animate-pulse space-y-3">
                  <Brain className="h-12 w-12 text-indigo-600 mx-auto" />
                  <p className="font-semibold">Otimizando Timeline...</p>
                  <p className="text-sm text-gray-600">IA analisando elementos</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
