
'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { 
  Globe, Languages, Play, Pause, Download, Settings, 
  Flag, Headphones, Volume2, Sparkles, Loader2,
  Star, BarChart3, Clock, Users, Zap, CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

interface LanguageVoice {
  id: string
  name: string
  language: string
  language_code: string
  country: string
  country_code: string
  gender: 'male' | 'female' | 'neutral'
  age_group: 'young' | 'adult' | 'mature'
  accent: string
  quality_score: number
  popularity: number
  specialties: string[]
  preview_url: string
  is_premium: boolean
  flag: string
}

interface TranslationService {
  id: string
  name: string
  supported_languages: string[]
  quality: 'basic' | 'professional' | 'premium'
  turbo_mode: boolean
  context_aware: boolean
}

const InternationalVoiceStudio: React.FC = () => {
  // State Management
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR')
  const [selectedVoice, setSelectedVoice] = useState<LanguageVoice | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [translationProgress, setTranslationProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Text and Settings
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.0,
    emotion: 'neutral'
  })

  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null)

  // Supported Languages with Premium Voices
  const [supportedLanguages] = useState([
    {
      code: 'pt-BR',
      name: 'Português (Brasil)',
      flag: '🇧🇷',
      voices: 8,
      premium: true
    },
    {
      code: 'en-US',
      name: 'English (United States)',
      flag: '🇺🇸',
      voices: 12,
      premium: true
    },
    {
      code: 'en-GB',
      name: 'English (United Kingdom)',
      flag: '🇬🇧',
      voices: 9,
      premium: true
    },
    {
      code: 'es-ES',
      name: 'Español (España)',
      flag: '🇪🇸',
      voices: 7,
      premium: true
    },
    {
      code: 'es-MX',
      name: 'Español (México)',
      flag: '🇲🇽',
      voices: 6,
      premium: true
    },
    {
      code: 'fr-FR',
      name: 'Français (France)',
      flag: '🇫🇷',
      voices: 8,
      premium: true
    },
    {
      code: 'de-DE',
      name: 'Deutsch (Deutschland)',
      flag: '🇩🇪',
      voices: 6,
      premium: true
    },
    {
      code: 'it-IT',
      name: 'Italiano (Italia)',
      flag: '🇮🇹',
      voices: 5,
      premium: false
    },
    {
      code: 'ja-JP',
      name: '日本語 (Japan)',
      flag: '🇯🇵',
      voices: 4,
      premium: false
    },
    {
      code: 'ko-KR',
      name: '한국어 (Korea)',
      flag: '🇰🇷',
      voices: 3,
      premium: false
    },
    {
      code: 'zh-CN',
      name: '中文 (China)',
      flag: '🇨🇳',
      voices: 5,
      premium: false
    },
    {
      code: 'ru-RU',
      name: 'Русский (Russia)',
      flag: '🇷🇺',
      voices: 4,
      premium: false
    }
  ])

  // International Voices Database
  const [internationalVoices] = useState<LanguageVoice[]>([
    // Portuguese (Brazil) - 8 voices
    {
      id: 'pt_br_adam',
      name: 'Adam Santos',
      language: 'Português',
      language_code: 'pt-BR',
      country: 'Brasil',
      country_code: 'BR',
      gender: 'male',
      age_group: 'adult',
      accent: 'paulista',
      quality_score: 4.8,
      popularity: 95,
      specialties: ['Corporativo', 'Treinamento', 'Narração'],
      preview_url: '/api/voices/preview/pt_br_adam',
      is_premium: true,
      flag: '🇧🇷'
    },
    {
      id: 'pt_br_bella',
      name: 'Bella Costa',
      language: 'Português',
      language_code: 'pt-BR',
      country: 'Brasil',
      country_code: 'BR',
      gender: 'female',
      age_group: 'young',
      accent: 'carioca',
      quality_score: 4.9,
      popularity: 87,
      specialties: ['Amigável', 'Educacional', 'Jovem'],
      preview_url: '/api/voices/preview/pt_br_bella',
      is_premium: true,
      flag: '🇧🇷'
    },
    
    // English (US) - 12 voices
    {
      id: 'en_us_jeremy',
      name: 'Jeremy Wilson',
      language: 'English',
      language_code: 'en-US',
      country: 'United States',
      country_code: 'US',
      gender: 'male',
      age_group: 'mature',
      accent: 'general american',
      quality_score: 4.9,
      popularity: 96,
      specialties: ['Documentary', 'Professional', 'Authoritative'],
      preview_url: '/api/voices/preview/en_us_jeremy',
      is_premium: true,
      flag: '🇺🇸'
    },
    {
      id: 'en_us_charlotte',
      name: 'Charlotte Davis',
      language: 'English',
      language_code: 'en-US',
      country: 'United States',
      country_code: 'US',
      gender: 'female',
      age_group: 'adult',
      accent: 'californian',
      quality_score: 4.8,
      popularity: 89,
      specialties: ['Conversational', 'Friendly', 'Marketing'],
      preview_url: '/api/voices/preview/en_us_charlotte',
      is_premium: true,
      flag: '🇺🇸'
    },

    // English (UK) - 9 voices
    {
      id: 'en_gb_george',
      name: 'George Hamilton',
      language: 'English',
      language_code: 'en-GB',
      country: 'United Kingdom',
      country_code: 'GB',
      gender: 'male',
      age_group: 'mature',
      accent: 'received pronunciation',
      quality_score: 4.9,
      popularity: 91,
      specialties: ['Elegant', 'Sophisticated', 'Luxury'],
      preview_url: '/api/voices/preview/en_gb_george',
      is_premium: true,
      flag: '🇬🇧'
    },
    {
      id: 'en_gb_freya',
      name: 'Freya Thompson',
      language: 'English',
      language_code: 'en-GB',
      country: 'United Kingdom',
      country_code: 'GB',
      gender: 'female',
      age_group: 'adult',
      accent: 'london',
      quality_score: 4.8,
      popularity: 82,
      specialties: ['Warm', 'Educational', 'Professional'],
      preview_url: '/api/voices/preview/en_gb_freya',
      is_premium: true,
      flag: '🇬🇧'
    },

    // Spanish (Spain) - 7 voices
    {
      id: 'es_es_mateo',
      name: 'Mateo García',
      language: 'Español',
      language_code: 'es-ES',
      country: 'España',
      country_code: 'ES',
      gender: 'male',
      age_group: 'adult',
      accent: 'madrileño',
      quality_score: 4.7,
      popularity: 73,
      specialties: ['Profesional', 'Corporativo', 'Serio'],
      preview_url: '/api/voices/preview/es_es_mateo',
      is_premium: true,
      flag: '🇪🇸'
    },

    // Spanish (Mexico) - 6 voices
    {
      id: 'es_mx_sofia',
      name: 'Sofía Hernández',
      language: 'Español',
      language_code: 'es-MX',
      country: 'México',
      country_code: 'MX',
      gender: 'female',
      age_group: 'young',
      accent: 'mexicano',
      quality_score: 4.6,
      popularity: 68,
      specialties: ['Amigable', 'Cálida', 'Latinoamericana'],
      preview_url: '/api/voices/preview/es_mx_sofia',
      is_premium: true,
      flag: '🇲🇽'
    },

    // French (France) - 8 voices
    {
      id: 'fr_fr_antoine',
      name: 'Antoine Dubois',
      language: 'Français',
      language_code: 'fr-FR',
      country: 'France',
      country_code: 'FR',
      gender: 'male',
      age_group: 'mature',
      accent: 'parisien',
      quality_score: 4.8,
      popularity: 79,
      specialties: ['Élégant', 'Sophistiqué', 'Narrateur'],
      preview_url: '/api/voices/preview/fr_fr_antoine',
      is_premium: true,
      flag: '🇫🇷'
    },

    // German (Germany) - 6 voices
    {
      id: 'de_de_klaus',
      name: 'Klaus Müller',
      language: 'Deutsch',
      language_code: 'de-DE',
      country: 'Deutschland',
      country_code: 'DE',
      gender: 'male',
      age_group: 'adult',
      accent: 'hochdeutsch',
      quality_score: 4.7,
      popularity: 71,
      specialties: ['Professionell', 'Technisch', 'Zuverlässig'],
      preview_url: '/api/voices/preview/de_de_klaus',
      is_premium: true,
      flag: '🇩🇪'
    },

    // Italian (Italy) - 5 voices
    {
      id: 'it_it_marco',
      name: 'Marco Rossi',
      language: 'Italiano',
      language_code: 'it-IT',
      country: 'Italia',
      country_code: 'IT',
      gender: 'male',
      age_group: 'adult',
      accent: 'romano',
      quality_score: 4.5,
      popularity: 65,
      specialties: ['Espressivo', 'Caloroso', 'Mediterraneo'],
      preview_url: '/api/voices/preview/it_it_marco',
      is_premium: false,
      flag: '🇮🇹'
    }
  ])

  // Translation Services
  const [translationServices] = useState<TranslationService[]>([
    {
      id: 'deepl_pro',
      name: 'DeepL Professional',
      supported_languages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'],
      quality: 'premium',
      turbo_mode: true,
      context_aware: true
    },
    {
      id: 'google_translate',
      name: 'Google Translate',
      supported_languages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN', 'ru-RU'],
      quality: 'professional',
      turbo_mode: false,
      context_aware: true
    },
    {
      id: 'openai_gpt',
      name: 'OpenAI GPT-4 Translation',
      supported_languages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN', 'ru-RU'],
      quality: 'premium',
      turbo_mode: true,
      context_aware: true
    }
  ])

  // Get voices for selected language
  const getVoicesForLanguage = (langCode: string) => {
    return internationalVoices.filter(voice => voice.language_code === langCode)
  }

  // Translate Text
  const translateText = async (targetLanguage: string) => {
    if (!sourceText.trim()) {
      toast.error('Digite o texto para traduzir')
      return
    }

    setIsTranslating(true)
    setTranslationProgress(0)

    try {
      // Simulate translation progress
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => Math.min(prev + 15, 90))
      }, 300)

      // Simulate API call to translation service
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setTranslationProgress(100)

      // For demo, we'll use a simple mock translation
      const translations: { [key: string]: string } = {
        'en-US': 'This is a professional translation of workplace safety training content.',
        'es-ES': 'Esta es una traducción profesional del contenido de formación en seguridad laboral.',
        'fr-FR': 'Il s\'agit d\'une traduction professionnelle du contenu de formation à la sécurité au travail.',
        'de-DE': 'Dies ist eine professionelle Übersetzung von Arbeitsschutz-Schulungsinhalten.',
        'it-IT': 'Questa è una traduzione professionale del contenuto di formazione sulla sicurezza sul lavoro.'
      }

      setTranslatedText(
        translations[targetLanguage] || 
        `Professional translation to ${targetLanguage}: ${sourceText}`
      )

      toast.success('Texto traduzido com sucesso!')
    } catch (error) {
      toast.error('Erro na tradução')
      setTranslationProgress(0)
    } finally {
      setIsTranslating(false)
    }
  }

  // Generate Voice
  const generateVoice = async () => {
    if (!selectedVoice || !translatedText.trim()) {
      toast.error('Selecione uma voz e traduza o texto primeiro')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate generation progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 8, 90))
      }, 400)

      await new Promise(resolve => setTimeout(resolve, 3000))

      clearInterval(progressInterval)
      setGenerationProgress(100)

      toast.success('Áudio gerado em ' + selectedVoice.language + '!')
    } catch (error) {
      toast.error('Erro ao gerar áudio')
      setGenerationProgress(0)
    } finally {
      setIsGenerating(false)
    }
  }

  // Toggle Playback
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            International Voice Studio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Estúdio multilíngue com 76 vozes premium em 12 idiomas e tradução automática profissional
          </p>
        </div>

        {/* Language Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Idiomas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Headphones className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <p className="text-2xl font-bold">76</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vozes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold">48</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Premium</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Languages className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">98.7%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Precisão</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Language Selection & Translation */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Seleção de Idioma e Tradução
                </CardTitle>
                <CardDescription>
                  Traduza e localize seu conteúdo para audiências globais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {supportedLanguages.map((lang) => (
                    <div
                      key={lang.code}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedLanguage === lang.code
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedLanguage(lang.code)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{lang.flag}</div>
                        <div className="text-sm font-medium mb-1">{lang.name.split('(')[0]}</div>
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                          <Headphones className="h-3 w-3" />
                          <span>{lang.voices}</span>
                          {lang.premium && <Star className="h-3 w-3 text-yellow-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Source Text */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Texto Original (Português)
                  </label>
                  <Textarea
                    placeholder="Digite o texto do treinamento de segurança que deseja traduzir..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Translation Button */}
                <Button 
                  onClick={() => translateText(selectedLanguage)}
                  disabled={isTranslating || !sourceText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traduzindo para {supportedLanguages.find(l => l.code === selectedLanguage)?.name}...
                    </>
                  ) : (
                    <>
                      <Languages className="mr-2 h-4 w-4" />
                      Traduzir para {supportedLanguages.find(l => l.code === selectedLanguage)?.name}
                    </>
                  )}
                </Button>

                {/* Translation Progress */}
                {isTranslating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processando tradução...</span>
                      <span>{translationProgress}%</span>
                    </div>
                    <Progress value={translationProgress} />
                  </div>
                )}

                {/* Translated Text */}
                {translatedText && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Texto Traduzido ({supportedLanguages.find(l => l.code === selectedLanguage)?.name})
                    </label>
                    <Textarea
                      value={translatedText}
                      onChange={(e) => setTranslatedText(e.target.value)}
                      rows={4}
                      className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Selection */}
            {selectedLanguage && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Vozes Disponíveis - {supportedLanguages.find(l => l.code === selectedLanguage)?.name}
                  </CardTitle>
                  <CardDescription>
                    {getVoicesForLanguage(selectedLanguage).length} vozes premium disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                    {getVoicesForLanguage(selectedLanguage).map((voice) => (
                      <div
                        key={voice.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedVoice?.id === voice.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedVoice(voice)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{voice.flag}</span>
                            <div>
                              <h4 className="font-semibold">{voice.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {voice.gender} • {voice.age_group} • {voice.accent}
                              </p>
                            </div>
                          </div>
                          {voice.is_premium && (
                            <Badge variant="default">Premium</Badge>
                          )}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Qualidade:</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400" />
                              <span>{voice.quality_score}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Popularidade:</span>
                            <span>{voice.popularity}%</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {voice.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Voice Settings & Generation */}
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

                {/* Emotion */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Emoção
                  </label>
                  <Select value={voiceSettings.emotion} onValueChange={(value) => 
                    setVoiceSettings(prev => ({ ...prev, emotion: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">Neutro</SelectItem>
                      <SelectItem value="friendly">Amigável</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="authoritative">Autoritativo</SelectItem>
                      <SelectItem value="warm">Caloroso</SelectItem>
                      <SelectItem value="energetic">Energético</SelectItem>
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
                {/* Generation Progress */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Gerando áudio...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <Progress value={generationProgress} />
                  </div>
                )}

                {/* Generate Button */}
                <Button 
                  onClick={generateVoice} 
                  disabled={isGenerating || !selectedVoice || !translatedText.trim()}
                  className="w-full"
                  size="lg"
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
                  <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                    {selectedVoice ? `${selectedVoice.name} - ${selectedVoice.language}` : 'Nenhum áudio'}
                  </div>
                  <Button size="sm" variant="ghost" disabled={!audioRef.current?.src}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
              </CardContent>
            </Card>

            {/* Language Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Idiomas Suportados</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Vozes Premium</span>
                    <span className="font-medium">48/76</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Precisão Média</span>
                    <span className="font-medium">98.7%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Tempo de Geração</span>
                    <span className="font-medium">~3s</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Idioma selecionado:
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {supportedLanguages.find(l => l.code === selectedLanguage)?.flag}
                    </span>
                    <span className="text-sm font-medium">
                      {supportedLanguages.find(l => l.code === selectedLanguage)?.name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InternationalVoiceStudio
