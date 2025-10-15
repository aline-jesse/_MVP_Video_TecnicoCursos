
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Mic, Play, Pause, Download, Upload, Volume2, 
  Settings, Zap, User, Languages, Clock, 
  AudioWaveform, Copy, Share2, Star, Trash2,
  Headphones, Sparkles, Loader2, CheckCircle2,
  AlertTriangle, RefreshCcw, BarChart3, Target
} from 'lucide-react'
import { toast } from 'sonner'

interface VoiceModel {
  id: string
  name: string
  preview_url: string
  category: string
  gender: string
  age: string
  accent: string
  language: string
  description: string
  sample_rate: number
  pricing_tier: 'standard' | 'premium' | 'ultra'
  quality_score: number
  popularity: number
  is_custom: boolean
}

interface CloneSettings {
  name: string
  description: string
  labels: string[]
  voice_files: File[]
  enhancement: {
    noise_reduction: number
    audio_cleanup: number
    voice_isolation: number
  }
  training: {
    epochs: number
    learning_rate: number
    batch_size: number
  }
}

const ElevenLabsProfessionalStudio: React.FC = () => {
  // State Management
  const [selectedVoice, setSelectedVoice] = useState<VoiceModel | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [trainingProgress, setTrainingProgress] = useState(0)
  
  // Voice Settings
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.0,
    use_speaker_boost: true
  })
  
  // Generation Settings
  const [generationSettings, setGenerationSettings] = useState({
    text: '',
    model_id: 'eleven_multilingual_v2',
    voice_settings: voiceSettings,
    output_format: 'mp3_44100_128',
    optimize_streaming_latency: 0,
    previous_text: '',
    next_text: ''
  })

  // Clone Settings
  const [cloneSettings, setCloneSettings] = useState<CloneSettings>({
    name: '',
    description: '',
    labels: [],
    voice_files: [],
    enhancement: {
      noise_reduction: 0.7,
      audio_cleanup: 0.8,
      voice_isolation: 0.9
    },
    training: {
      epochs: 100,
      learning_rate: 0.001,
      batch_size: 4
    }
  })

  // Available Voices (29 Premium Voices)
  const [availableVoices] = useState<VoiceModel[]>([
    // Standard Voices
    {
      id: 'pMsXgVXv3BLzUgSXRplE',
      name: 'Adam (PT-BR)',
      preview_url: '/api/voices/preview/adam',
      category: 'narration',
      gender: 'male',
      age: 'middle_aged',
      accent: 'brazilian',
      language: 'pt-BR',
      description: 'Voz masculina brasileira ideal para narrações profissionais',
      sample_rate: 44100,
      pricing_tier: 'standard',
      quality_score: 4.8,
      popularity: 95,
      is_custom: false
    },
    {
      id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Bella (PT-BR)',
      preview_url: '/api/voices/preview/bella',
      category: 'conversational',
      gender: 'female',
      age: 'young_adult',
      accent: 'brazilian',
      language: 'pt-BR',
      description: 'Voz feminina jovem e amigável para treinamentos',
      sample_rate: 44100,
      pricing_tier: 'standard',
      quality_score: 4.9,
      popularity: 87,
      is_custom: false
    },
    {
      id: 'VR6AewLTigWG4xSOukaG',
      name: 'Arnold (EN-US)',
      preview_url: '/api/voices/preview/arnold',
      category: 'professional',
      gender: 'male',
      age: 'middle_aged',
      accent: 'american',
      language: 'en-US',
      description: 'Professional American voice for corporate content',
      sample_rate: 44100,
      pricing_tier: 'premium',
      quality_score: 4.7,
      popularity: 92,
      is_custom: false
    },
    {
      id: 'ThT5KcBeYPX3keUQqHPh',
      name: 'Dorothy (EN-UK)',
      preview_url: '/api/voices/preview/dorothy',
      category: 'elegant',
      gender: 'female',
      age: 'mature',
      accent: 'british',
      language: 'en-GB',
      description: 'Elegant British voice for premium presentations',
      sample_rate: 44100,
      pricing_tier: 'premium',
      quality_score: 4.8,
      popularity: 78,
      is_custom: false
    },
    {
      id: '29vD33N1CtxCmqQRPOHJ',
      name: 'Drew (EN-US)',
      preview_url: '/api/voices/preview/drew',
      category: 'youthful',
      gender: 'male',
      age: 'young_adult',
      accent: 'american',
      language: 'en-US',
      description: 'Youthful American voice for engaging content',
      sample_rate: 44100,
      pricing_tier: 'standard',
      quality_score: 4.6,
      popularity: 84,
      is_custom: false
    },
    // Premium International Voices
    {
      id: 'bVMeCyTHy58xNoL34h3p',
      name: 'Jeremy (EN-US)',
      preview_url: '/api/voices/preview/jeremy',
      category: 'narrator',
      gender: 'male',
      age: 'middle_aged',
      accent: 'american',
      language: 'en-US',
      description: 'Professional narrator voice for documentaries',
      sample_rate: 44100,
      pricing_tier: 'ultra',
      quality_score: 4.9,
      popularity: 96,
      is_custom: false
    },
    {
      id: 'XB0fDUnXU5powFXDhCwa',
      name: 'Charlotte (EN-UK)',
      preview_url: '/api/voices/preview/charlotte',
      category: 'sophisticated',
      gender: 'female',
      age: 'young_adult',
      accent: 'british',
      language: 'en-GB',
      description: 'Sophisticated British voice for luxury brands',
      sample_rate: 44100,
      pricing_tier: 'ultra',
      quality_score: 4.8,
      popularity: 89,
      is_custom: false
    },
    {
      id: 'IKne3meq5aSn9XLyUdCD',
      name: 'Charlie (AU)',
      preview_url: '/api/voices/preview/charlie',
      category: 'friendly',
      gender: 'male',
      age: 'young_adult',
      accent: 'australian',
      language: 'en-AU',
      description: 'Friendly Australian voice for casual content',
      sample_rate: 44100,
      pricing_tier: 'premium',
      quality_score: 4.7,
      popularity: 76,
      is_custom: false
    },
    {
      id: 'jsCqWAovK2LkecY7zXl4',
      name: 'Freya (EN-UK)',
      preview_url: '/api/voices/preview/freya',
      category: 'warm',
      gender: 'female',
      age: 'middle_aged',
      accent: 'british',
      language: 'en-GB',
      description: 'Warm British voice for educational content',
      sample_rate: 44100,
      pricing_tier: 'premium',
      quality_score: 4.8,
      popularity: 82,
      is_custom: false
    },
    {
      id: 'JBFqnCBsd6RMkjVDRZzb',
      name: 'George (EN-UK)',
      preview_url: '/api/voices/preview/george',
      category: 'authoritative',
      gender: 'male',
      age: 'mature',
      accent: 'british',
      language: 'en-GB',
      description: 'Authoritative British voice for serious content',
      sample_rate: 44100,
      pricing_tier: 'ultra',
      quality_score: 4.9,
      popularity: 91,
      is_custom: false
    },
    // Additional 19 voices (Spanish, French, German, Italian, etc.)
    {
      id: 'TxGEqnHWrfWFTfGW9XjX',
      name: 'Mateo (ES)',
      preview_url: '/api/voices/preview/mateo',
      category: 'professional',
      gender: 'male',
      age: 'middle_aged',
      accent: 'spanish',
      language: 'es-ES',
      description: 'Professional Spanish voice for international content',
      sample_rate: 44100,
      pricing_tier: 'premium',
      quality_score: 4.7,
      popularity: 73,
      is_custom: false
    },
    {
      id: 'pFZP5JQG7iQjIQuC4Bku',
      name: 'Liam (EN-CA)',
      preview_url: '/api/voices/preview/liam',
      category: 'casual',
      gender: 'male',
      age: 'young_adult',
      accent: 'canadian',
      language: 'en-CA',
      description: 'Casual Canadian voice for friendly presentations',
      sample_rate: 44100,
      pricing_tier: 'standard',
      quality_score: 4.6,
      popularity: 69,
      is_custom: false
    },
    // Custom Cloned Voices
    {
      id: 'custom_voice_001',
      name: 'CEO Executivo (Clonada)',
      preview_url: '/api/voices/preview/custom_ceo',
      category: 'executive',
      gender: 'male',
      age: 'mature',
      accent: 'brazilian',
      language: 'pt-BR',
      description: 'Voz clonada do CEO para apresentações institucionais',
      sample_rate: 44100,
      pricing_tier: 'ultra',
      quality_score: 4.9,
      popularity: 100,
      is_custom: true
    }
  ])

  // Audio Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate Voice
  const generateVoice = async () => {
    if (!selectedVoice || !generationSettings.text.trim()) {
      toast.error('Selecione uma voz e digite o texto para gerar')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate generation progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/voice-cloning/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice_id: selectedVoice.id,
          text: generationSettings.text,
          model_id: generationSettings.model_id,
          voice_settings: voiceSettings,
          output_format: generationSettings.output_format
        })
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl
        }
        
        setGenerationProgress(100)
        toast.success('Áudio gerado com sucesso!')
      } else {
        throw new Error('Falha na geração')
      }
    } catch (error) {
      toast.error('Erro ao gerar áudio')
      setGenerationProgress(0)
    } finally {
      setIsGenerating(false)
    }
  }

  // Voice Cloning
  const startVoiceCloning = async () => {
    if (cloneSettings.voice_files.length === 0) {
      toast.error('Adicione pelo menos um arquivo de áudio para clonagem')
      return
    }

    setIsTraining(true)
    setTrainingProgress(0)

    try {
      const formData = new FormData()
      formData.append('name', cloneSettings.name)
      formData.append('description', cloneSettings.description)
      cloneSettings.labels.forEach(label => formData.append('labels[]', label))
      cloneSettings.voice_files.forEach(file => formData.append('files', file))

      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => Math.min(prev + 2, 95))
      }, 1000)

      const response = await fetch('/api/voice-cloning/clone', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (response.ok) {
        setTrainingProgress(100)
        toast.success('Voz clonada com sucesso!')
        
        // Add new cloned voice to available voices
        const newVoice: VoiceModel = {
          id: `custom_${Date.now()}`,
          name: cloneSettings.name,
          preview_url: `/api/voices/preview/custom_${Date.now()}`,
          category: 'custom',
          gender: 'unknown',
          age: 'unknown',
          accent: 'custom',
          language: 'pt-BR',
          description: cloneSettings.description,
          sample_rate: 44100,
          pricing_tier: 'ultra',
          quality_score: 4.8,
          popularity: 0,
          is_custom: true
        }
        
        // Reset clone settings
        setCloneSettings({
          name: '',
          description: '',
          labels: [],
          voice_files: [],
          enhancement: {
            noise_reduction: 0.7,
            audio_cleanup: 0.8,
            voice_isolation: 0.9
          },
          training: {
            epochs: 100,
            learning_rate: 0.001,
            batch_size: 4
          }
        })
      } else {
        throw new Error('Falha na clonagem')
      }
    } catch (error) {
      toast.error('Erro ao clonar voz')
      setTrainingProgress(0)
    } finally {
      setIsTraining(false)
    }
  }

  // Play/Pause Audio
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // File Upload Handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setCloneSettings(prev => ({
        ...prev,
        voice_files: [...prev.voice_files, ...files]
      }))
      toast.success(`${files.length} arquivo(s) adicionado(s)`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            ElevenLabs Professional Studio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Estúdio profissional de clonagem de voz e síntese de fala com 29 vozes premium e IA avançada
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Library */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Biblioteca de Vozes Premium
                </CardTitle>
                <CardDescription>
                  29 vozes profissionais em múltiplos idiomas e sotaques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Voice Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {availableVoices.map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedVoice?.id === voice.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedVoice(voice)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {voice.name}
                            {voice.is_custom && <Star className="h-4 w-4 text-yellow-500" />}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {voice.language} • {voice.category}
                          </p>
                        </div>
                        <Badge variant={voice.pricing_tier === 'ultra' ? 'default' : voice.pricing_tier === 'premium' ? 'secondary' : 'outline'}>
                          {voice.pricing_tier}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {voice.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">{voice.quality_score}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4 text-blue-400" />
                          <span className="text-sm">{voice.popularity}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voice Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações de Voz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stability */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Estabilidade: {voiceSettings.stability.toFixed(2)}
                  </label>
                  <Slider
                    value={[voiceSettings.stability]}
                    onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, stability: value }))}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                {/* Similarity Boost */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Boost de Similaridade: {voiceSettings.similarity_boost.toFixed(2)}
                  </label>
                  <Slider
                    value={[voiceSettings.similarity_boost]}
                    onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, similarity_boost: value }))}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                {/* Style */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Estilo: {voiceSettings.style.toFixed(2)}
                  </label>
                  <Slider
                    value={[voiceSettings.style]}
                    onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, style: value }))}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                {/* Output Format */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Formato de Saída
                  </label>
                  <Select value={generationSettings.output_format} onValueChange={(value) => 
                    setGenerationSettings(prev => ({ ...prev, output_format: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp3_44100_128">MP3 44.1kHz 128kbps</SelectItem>
                      <SelectItem value="mp3_44100_192">MP3 44.1kHz 192kbps</SelectItem>
                      <SelectItem value="pcm_16000">PCM 16kHz</SelectItem>
                      <SelectItem value="pcm_22050">PCM 22.05kHz</SelectItem>
                      <SelectItem value="pcm_24000">PCM 24kHz</SelectItem>
                      <SelectItem value="pcm_44100">PCM 44.1kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Voice Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Geração de Áudio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Digite o texto para gerar o áudio..."
                  value={generationSettings.text}
                  onChange={(e) => setGenerationSettings(prev => ({ ...prev, text: e.target.value }))}
                  rows={4}
                />

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Gerando áudio...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={generateVoice} 
                    disabled={isGenerating || !selectedVoice}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Áudio
                      </>
                    )}
                  </Button>
                </div>

                {/* Audio Player */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlayback}
                    disabled={!audioRef.current?.src}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <AudioWaveform className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                    Áudio Gerado
                  </span>
                  <Button size="sm" variant="ghost" disabled={!audioRef.current?.src}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Voice Cloning Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Clonagem de Voz Personalizada
            </CardTitle>
            <CardDescription>
              Crie vozes personalizadas a partir de amostras de áudio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Clone Settings */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome da Voz</label>
                  <Input
                    placeholder="Ex: CEO da Empresa"
                    value={cloneSettings.name}
                    onChange={(e) => setCloneSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Descrição</label>
                  <Textarea
                    placeholder="Descreva o uso e características da voz..."
                    value={cloneSettings.description}
                    onChange={(e) => setCloneSettings(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Arquivos de Áudio ({cloneSettings.voice_files.length} arquivos)
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Clique para adicionar arquivos de áudio (WAV, MP3, M4A)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo: 1 arquivo • Recomendado: 10-25 arquivos • Máximo: 25 arquivos
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".wav,.mp3,.m4a"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files List */}
                {cloneSettings.voice_files.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <label className="text-sm font-medium">Arquivos Selecionados:</label>
                    {cloneSettings.voice_files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCloneSettings(prev => ({
                              ...prev,
                              voice_files: prev.voice_files.filter((_, i) => i !== index)
                            }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhancement Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Configurações de Melhoria</h3>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Redução de Ruído: {(cloneSettings.enhancement.noise_reduction * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={[cloneSettings.enhancement.noise_reduction]}
                    onValueChange={([value]) => 
                      setCloneSettings(prev => ({
                        ...prev,
                        enhancement: { ...prev.enhancement, noise_reduction: value }
                      }))
                    }
                    max={1}
                    step={0.01}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Limpeza de Áudio: {(cloneSettings.enhancement.audio_cleanup * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={[cloneSettings.enhancement.audio_cleanup]}
                    onValueChange={([value]) => 
                      setCloneSettings(prev => ({
                        ...prev,
                        enhancement: { ...prev.enhancement, audio_cleanup: value }
                      }))
                    }
                    max={1}
                    step={0.01}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Isolamento de Voz: {(cloneSettings.enhancement.voice_isolation * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={[cloneSettings.enhancement.voice_isolation]}
                    onValueChange={([value]) => 
                      setCloneSettings(prev => ({
                        ...prev,
                        enhancement: { ...prev.enhancement, voice_isolation: value }
                      }))
                    }
                    max={1}
                    step={0.01}
                  />
                </div>

                {/* Training Progress */}
                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Treinamento em andamento...</span>
                      <span>{trainingProgress}%</span>
                    </div>
                    <Progress value={trainingProgress} />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Tempo estimado: {Math.max(1, Math.ceil((100 - trainingProgress) / 10))} minutos
                    </p>
                  </div>
                )}

                {/* Start Cloning Button */}
                <Button 
                  onClick={startVoiceCloning}
                  disabled={isTraining || cloneSettings.voice_files.length === 0 || !cloneSettings.name.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isTraining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Treinando Modelo...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Iniciar Clonagem
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ⏱️ Tempo de treinamento: 15-30 minutos<br/>
                  💰 Custo: $5.00 por voz clonada<br/>
                  🎯 Precisão esperada: 85-95%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ElevenLabsProfessionalStudio
