'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Brain, 
  Heart, 
  Zap, 
  Smile, 
  Coffee, 
  Star, 
  Users, 
  BookOpen,
  Lightbulb,
  Target,
  Save,
  Download,
  Upload,
  RefreshCw,
  Play,
  Settings,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

interface PersonalityTrait {
  id: string
  name: string
  description: string
  value: number // 0-100
  category: 'emotional' | 'social' | 'cognitive' | 'behavioral'
}

interface PersonalityPreset {
  id: string
  name: string
  description: string
  category: 'professional' | 'casual' | 'educational' | 'entertainment' | 'custom'
  traits: PersonalityTrait[]
  voice_characteristics: {
    tone: string
    pace: string
    emotion_range: string
  }
  animation_style: {
    gesture_frequency: number
    expression_intensity: number
    movement_style: string
  }
  created_at: string
  is_default: boolean
}

export default function PersonalityPresets() {
  const [selectedPreset, setSelectedPreset] = useState<PersonalityPreset | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Presets predefinidos
  const defaultPresets: PersonalityPreset[] = [
    {
      id: 'professional-presenter',
      name: 'Apresentador Profissional',
      description: 'Personalidade confiante e autoritativa para apresentações corporativas',
      category: 'professional',
      traits: [
        { id: 'confidence', name: 'Confiança', description: 'Nível de autoconfiança', value: 90, category: 'emotional' },
        { id: 'authority', name: 'Autoridade', description: 'Presença de liderança', value: 85, category: 'social' },
        { id: 'clarity', name: 'Clareza', description: 'Comunicação clara e direta', value: 95, category: 'cognitive' },
        { id: 'formality', name: 'Formalidade', description: 'Nível de formalidade', value: 80, category: 'behavioral' }
      ],
      voice_characteristics: {
        tone: 'Grave e firme',
        pace: 'Moderado',
        emotion_range: 'Controlado'
      },
      animation_style: {
        gesture_frequency: 70,
        expression_intensity: 60,
        movement_style: 'Controlado e preciso'
      },
      created_at: '2024-01-15',
      is_default: true
    },
    {
      id: 'friendly-teacher',
      name: 'Professor Amigável',
      description: 'Personalidade calorosa e educativa para conteúdo educacional',
      category: 'educational',
      traits: [
        { id: 'warmth', name: 'Calidez', description: 'Calor humano e empatia', value: 95, category: 'emotional' },
        { id: 'patience', name: 'Paciência', description: 'Capacidade de explicar com calma', value: 90, category: 'behavioral' },
        { id: 'enthusiasm', name: 'Entusiasmo', description: 'Energia positiva', value: 85, category: 'emotional' },
        { id: 'clarity', name: 'Clareza', description: 'Explicações claras', value: 90, category: 'cognitive' }
      ],
      voice_characteristics: {
        tone: 'Caloroso e acolhedor',
        pace: 'Pausado e didático',
        emotion_range: 'Expressivo'
      },
      animation_style: {
        gesture_frequency: 80,
        expression_intensity: 85,
        movement_style: 'Expressivo e acolhedor'
      },
      created_at: '2024-01-15',
      is_default: true
    },
    {
      id: 'energetic-host',
      name: 'Apresentador Energético',
      description: 'Personalidade vibrante e carismática para entretenimento',
      category: 'entertainment',
      traits: [
        { id: 'energy', name: 'Energia', description: 'Nível de energia e vitalidade', value: 95, category: 'emotional' },
        { id: 'charisma', name: 'Carisma', description: 'Capacidade de cativar', value: 90, category: 'social' },
        { id: 'humor', name: 'Humor', description: 'Senso de humor', value: 85, category: 'behavioral' },
        { id: 'spontaneity', name: 'Espontaneidade', description: 'Naturalidade', value: 80, category: 'behavioral' }
      ],
      voice_characteristics: {
        tone: 'Vibrante e dinâmico',
        pace: 'Rápido e variado',
        emotion_range: 'Muito expressivo'
      },
      animation_style: {
        gesture_frequency: 95,
        expression_intensity: 90,
        movement_style: 'Dinâmico e expressivo'
      },
      created_at: '2024-01-15',
      is_default: true
    },
    {
      id: 'calm-advisor',
      name: 'Conselheiro Calmo',
      description: 'Personalidade serena e sábia para conteúdo reflexivo',
      category: 'professional',
      traits: [
        { id: 'wisdom', name: 'Sabedoria', description: 'Conhecimento e experiência', value: 90, category: 'cognitive' },
        { id: 'calmness', name: 'Calma', description: 'Serenidade e tranquilidade', value: 95, category: 'emotional' },
        { id: 'empathy', name: 'Empatia', description: 'Compreensão emocional', value: 85, category: 'social' },
        { id: 'thoughtfulness', name: 'Reflexão', description: 'Pensamento cuidadoso', value: 90, category: 'cognitive' }
      ],
      voice_characteristics: {
        tone: 'Suave e reflexivo',
        pace: 'Lento e pausado',
        emotion_range: 'Sutil e controlado'
      },
      animation_style: {
        gesture_frequency: 40,
        expression_intensity: 50,
        movement_style: 'Suave e contemplativo'
      },
      created_at: '2024-01-15',
      is_default: true
    }
  ]

  const [presets, setPresets] = useState<PersonalityPreset[]>(defaultPresets)

  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const createNewPreset = () => {
    const newPreset: PersonalityPreset = {
      id: `custom-${Date.now()}`,
      name: 'Novo Preset',
      description: 'Personalidade personalizada',
      category: 'custom',
      traits: [
        { id: 'confidence', name: 'Confiança', description: 'Nível de autoconfiança', value: 50, category: 'emotional' },
        { id: 'energy', name: 'Energia', description: 'Nível de energia', value: 50, category: 'emotional' },
        { id: 'formality', name: 'Formalidade', description: 'Nível de formalidade', value: 50, category: 'behavioral' },
        { id: 'expressiveness', name: 'Expressividade', description: 'Nível de expressão', value: 50, category: 'behavioral' }
      ],
      voice_characteristics: {
        tone: 'Neutro',
        pace: 'Moderado',
        emotion_range: 'Equilibrado'
      },
      animation_style: {
        gesture_frequency: 50,
        expression_intensity: 50,
        movement_style: 'Natural'
      },
      created_at: new Date().toISOString().split('T')[0],
      is_default: false
    }
    
    setPresets([...presets, newPreset])
    setSelectedPreset(newPreset)
    setIsCreating(true)
    setIsEditing(true)
  }

  const updatePresetTrait = (traitId: string, value: number) => {
    if (!selectedPreset) return
    
    const updatedPreset = {
      ...selectedPreset,
      traits: selectedPreset.traits.map(trait =>
        trait.id === traitId ? { ...trait, value } : trait
      )
    }
    
    setSelectedPreset(updatedPreset)
    setPresets(presets.map(p => p.id === updatedPreset.id ? updatedPreset : p))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return <Target className="w-4 h-4" />
      case 'educational': return <BookOpen className="w-4 h-4" />
      case 'entertainment': return <Star className="w-4 h-4" />
      case 'casual': return <Coffee className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getTraitIcon = (category: string) => {
    switch (category) {
      case 'emotional': return <Heart className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      case 'cognitive': return <Brain className="w-4 h-4" />
      case 'behavioral': return <Zap className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Sistema de Presets de Personalidade
          </CardTitle>
          <CardDescription>
            Configure personalidades únicas para seus avatares com características comportamentais específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Presets */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar presets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={createNewPreset} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="educational">Educacional</SelectItem>
                  <SelectItem value="entertainment">Entretenimento</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPresets.map((preset) => (
                  <Card 
                    key={preset.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPreset?.id === preset.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedPreset(preset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(preset.category)}
                          <h3 className="font-semibold text-sm">{preset.name}</h3>
                        </div>
                        {preset.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Padrão
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{preset.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{preset.category}</span>
                        <span>{preset.created_at}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Detalhes do Preset Selecionado */}
            <div className="lg:col-span-2">
              {selectedPreset ? (
                <Tabs defaultValue="traits" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="traits">Características</TabsTrigger>
                      <TabsTrigger value="voice">Voz</TabsTrigger>
                      <TabsTrigger value="animation">Animação</TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Aplicar
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="traits" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{selectedPreset.name}</CardTitle>
                        <CardDescription>{selectedPreset.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedPreset.traits.map((trait) => (
                          <div key={trait.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getTraitIcon(trait.category)}
                                <Label className="font-medium">{trait.name}</Label>
                              </div>
                              <span className="text-sm text-gray-500">{trait.value}%</span>
                            </div>
                            <p className="text-xs text-gray-600">{trait.description}</p>
                            <Slider
                              value={[trait.value]}
                              onValueChange={(value) => updatePresetTrait(trait.id, value[0])}
                              max={100}
                              step={1}
                              disabled={!isEditing}
                              className="w-full"
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="voice" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Características de Voz</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Tom de Voz</Label>
                          <p className="text-sm text-gray-600">{selectedPreset.voice_characteristics.tone}</p>
                        </div>
                        <div>
                          <Label>Ritmo</Label>
                          <p className="text-sm text-gray-600">{selectedPreset.voice_characteristics.pace}</p>
                        </div>
                        <div>
                          <Label>Expressividade Emocional</Label>
                          <p className="text-sm text-gray-600">{selectedPreset.voice_characteristics.emotion_range}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="animation" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Estilo de Animação</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Frequência de Gestos</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Slider
                              value={[selectedPreset.animation_style.gesture_frequency]}
                              max={100}
                              step={1}
                              disabled={!isEditing}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-500 w-12">
                              {selectedPreset.animation_style.gesture_frequency}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label>Intensidade das Expressões</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Slider
                              value={[selectedPreset.animation_style.expression_intensity]}
                              max={100}
                              step={1}
                              disabled={!isEditing}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-500 w-12">
                              {selectedPreset.animation_style.expression_intensity}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label>Estilo de Movimento</Label>
                          <p className="text-sm text-gray-600">{selectedPreset.animation_style.movement_style}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Selecione um Preset
                      </h3>
                      <p className="text-gray-500">
                        Escolha um preset de personalidade para visualizar e editar suas características
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}