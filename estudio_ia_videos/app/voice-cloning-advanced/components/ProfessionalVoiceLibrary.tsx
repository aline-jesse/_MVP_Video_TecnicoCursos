'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Play, 
  Pause, 
  Download,
  Search,
  Filter,
  Star,
  Heart,
  Volume2,
  User,
  Globe,
  Clock,
  Award,
  Mic,
  Headphones,
  Music,
  Radio
} from 'lucide-react'

interface ProfessionalVoice {
  id: string
  name: string
  gender: 'male' | 'female' | 'neutral'
  age: string
  language: string
  accent: string
  category: string
  style: string
  quality: 'standard' | 'premium' | 'ultra'
  rating: number
  downloads: number
  duration: string
  description: string
  tags: string[]
  audioUrl: string
  isFavorite: boolean
  isPremium: boolean
  price?: number
}

export default function ProfessionalVoiceLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [selectedQuality, setSelectedQuality] = useState('all')
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  const professionalVoices: ProfessionalVoice[] = [
    {
      id: '1',
      name: 'Ana Profissional',
      gender: 'female',
      age: '25-35',
      language: 'pt-BR',
      accent: 'Brasileiro',
      category: 'corporate',
      style: 'Professional',
      quality: 'ultra',
      rating: 4.9,
      downloads: 15420,
      duration: '2:30',
      description: 'Voz feminina brasileira ideal para apresentações corporativas e treinamentos',
      tags: ['corporativo', 'treinamento', 'apresentação', 'clara'],
      audioUrl: '/audio/ana-professional.wav',
      isFavorite: false,
      isPremium: true,
      price: 29.90
    },
    {
      id: '2',
      name: 'Carlos Executivo',
      gender: 'male',
      age: '35-45',
      language: 'pt-BR',
      accent: 'Brasileiro',
      category: 'corporate',
      style: 'Authoritative',
      quality: 'ultra',
      rating: 4.8,
      downloads: 12350,
      duration: '3:15',
      description: 'Voz masculina grave e autoritária para liderança e negócios',
      tags: ['executivo', 'liderança', 'negócios', 'grave'],
      audioUrl: '/audio/carlos-executive.wav',
      isFavorite: true,
      isPremium: true,
      price: 34.90
    },
    {
      id: '3',
      name: 'Emma Narrator',
      gender: 'female',
      age: '30-40',
      language: 'en-US',
      accent: 'American',
      category: 'narration',
      style: 'Storytelling',
      quality: 'premium',
      rating: 4.7,
      downloads: 8920,
      duration: '4:20',
      description: 'Perfect American female voice for audiobooks and storytelling',
      tags: ['narration', 'audiobook', 'storytelling', 'warm'],
      audioUrl: '/audio/emma-narrator.wav',
      isFavorite: false,
      isPremium: false
    },
    {
      id: '4',
      name: 'David Commercial',
      gender: 'male',
      age: '25-35',
      language: 'en-US',
      accent: 'American',
      category: 'commercial',
      style: 'Energetic',
      quality: 'premium',
      rating: 4.6,
      downloads: 11200,
      duration: '1:45',
      description: 'Energetic male voice perfect for commercials and advertisements',
      tags: ['commercial', 'advertisement', 'energetic', 'young'],
      audioUrl: '/audio/david-commercial.wav',
      isFavorite: true,
      isPremium: false
    },
    {
      id: '5',
      name: 'Sofia Educativa',
      gender: 'female',
      age: '28-38',
      language: 'pt-BR',
      accent: 'Brasileiro',
      category: 'education',
      style: 'Friendly',
      quality: 'standard',
      rating: 4.5,
      downloads: 6780,
      duration: '3:50',
      description: 'Voz feminina amigável e didática para conteúdo educacional',
      tags: ['educação', 'didática', 'amigável', 'clara'],
      audioUrl: '/audio/sofia-education.wav',
      isFavorite: false,
      isPremium: false
    },
    {
      id: '6',
      name: 'Roberto Documentário',
      gender: 'male',
      age: '40-50',
      language: 'pt-BR',
      accent: 'Brasileiro',
      category: 'documentary',
      style: 'Serious',
      quality: 'ultra',
      rating: 4.9,
      downloads: 9450,
      duration: '5:10',
      description: 'Voz masculina séria e respeitável para documentários e conteúdo jornalístico',
      tags: ['documentário', 'jornalismo', 'sério', 'respeitável'],
      audioUrl: '/audio/roberto-documentary.wav',
      isFavorite: false,
      isPremium: true,
      price: 39.90
    }
  ]

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'corporate', label: 'Corporativo' },
    { value: 'commercial', label: 'Comercial' },
    { value: 'narration', label: 'Narração' },
    { value: 'education', label: 'Educação' },
    { value: 'documentary', label: 'Documentário' },
    { value: 'entertainment', label: 'Entretenimento' }
  ]

  const languages = [
    { value: 'all', label: 'Todos os Idiomas' },
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'Inglês (EUA)' },
    { value: 'es-ES', label: 'Espanhol (Espanha)' },
    { value: 'fr-FR', label: 'Francês (França)' },
    { value: 'de-DE', label: 'Alemão (Alemanha)' }
  ]

  const genders = [
    { value: 'all', label: 'Todos os Gêneros' },
    { value: 'female', label: 'Feminino' },
    { value: 'male', label: 'Masculino' },
    { value: 'neutral', label: 'Neutro' }
  ]

  const qualities = [
    { value: 'all', label: 'Todas as Qualidades' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'ultra', label: 'Ultra HD' }
  ]

  const filteredVoices = professionalVoices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || voice.category === selectedCategory
    const matchesLanguage = selectedLanguage === 'all' || voice.language === selectedLanguage
    const matchesGender = selectedGender === 'all' || voice.gender === selectedGender
    const matchesQuality = selectedQuality === 'all' || voice.quality === selectedQuality

    return matchesSearch && matchesCategory && matchesLanguage && matchesGender && matchesQuality
  })

  const playVoice = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null)
    } else {
      setPlayingVoice(voiceId)
      // Simular reprodução por 3 segundos
      setTimeout(() => setPlayingVoice(null), 3000)
    }
  }

  const toggleFavorite = (voiceId: string) => {
    setFavorites(prev => 
      prev.includes(voiceId) 
        ? prev.filter(id => id !== voiceId)
        : [...prev, voiceId]
    )
  }

  const downloadVoice = (voice: ProfessionalVoice) => {
    // Simular download
    console.log(`Downloading voice: ${voice.name}`)
  }

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'ultra':
        return <Badge className="bg-purple-100 text-purple-800">Ultra HD</Badge>
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
      default:
        return <Badge variant="secondary">Standard</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'corporate':
        return <User className="w-4 h-4" />
      case 'commercial':
        return <Radio className="w-4 h-4" />
      case 'narration':
        return <Headphones className="w-4 h-4" />
      case 'education':
        return <Award className="w-4 h-4" />
      case 'documentary':
        return <Mic className="w-4 h-4" />
      default:
        return <Music className="w-4 h-4" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Biblioteca de Vozes Profissionais
          </CardTitle>
          <CardDescription>
            Explore nossa coleção de vozes profissionais de alta qualidade para seus projetos
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Nome, descrição ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Qualidade</Label>
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualities.map((quality) => (
                    <SelectItem key={quality.value} value={quality.value}>
                      {quality.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {filteredVoices.length} vozes encontradas
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedLanguage('all')
                setSelectedGender('all')
                setSelectedQuality('all')
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vozes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVoices.map((voice) => (
          <Card key={voice.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(voice.category)}
                  <CardTitle className="text-lg">{voice.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(voice.id)}
                  className="p-1"
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favorites.includes(voice.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-400'
                    }`} 
                  />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {getQualityBadge(voice.quality)}
                {voice.isPremium && (
                  <Badge className="bg-gold-100 text-gold-800">Premium</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{voice.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Gênero:</span>
                  <span className="ml-1 font-medium">
                    {voice.gender === 'female' ? 'Feminino' : 
                     voice.gender === 'male' ? 'Masculino' : 'Neutro'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Idade:</span>
                  <span className="ml-1 font-medium">{voice.age}</span>
                </div>
                <div>
                  <span className="text-gray-500">Idioma:</span>
                  <span className="ml-1 font-medium">{voice.language}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duração:</span>
                  <span className="ml-1 font-medium">{voice.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {renderStars(voice.rating)}
                  <span className="text-sm text-gray-500 ml-1">
                    {voice.rating} ({voice.downloads.toLocaleString()})
                  </span>
                </div>
                {voice.isPremium && voice.price && (
                  <span className="text-lg font-bold text-purple-600">
                    R$ {voice.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {voice.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {voice.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{voice.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playVoice(voice.id)}
                  className="flex-1"
                >
                  {playingVoice === voice.id ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Ouvir
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => downloadVoice(voice)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {voice.isPremium ? 'Comprar' : 'Baixar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVoices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma voz encontrada</h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termos de busca para encontrar vozes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}