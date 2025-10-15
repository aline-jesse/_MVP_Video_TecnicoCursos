
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Globe, 
  Languages, 
  Mic,
  FileText,
  Users,
  MapPin,
  Volume2,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  Settings,
  Flag,
  Headphones,
  BookOpen,
  Target,
  Zap,
  Brain
} from 'lucide-react'

interface Language {
  code: string
  name: string
  localName: string
  flag: string
  completion: number
  voiceSupport: boolean
  culturalAdaptation: boolean
  nrCompliance: boolean
  translatorCount: number
  qualityScore: number
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'in_progress' | 'planned'
}

interface VoiceProfile {
  id: string
  language: string
  name: string
  gender: 'male' | 'female'
  age: string
  accent: string
  specialty: string[]
  quality: number
  usage: number
  samples?: string[]
}

interface TranslationProject {
  id: string
  title: string
  sourceLanguage: string
  targetLanguages: string[]
  progress: number
  status: 'active' | 'completed' | 'review' | 'planning'
  priority: 'high' | 'medium' | 'low'
  deadline: string
  translator: string
  wordCount: number
  type: 'content' | 'interface' | 'documentation' | 'audio'
}

interface CulturalAdaptation {
  region: string
  language: string
  adaptations: {
    colors: string[]
    imagery: string[]
    terminology: string[]
    regulations: string[]
  }
  complianceLevel: number
  lastUpdate: string
}

const MultiLanguageLocalization = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('pt-BR')
  const [isTranslating, setIsTranslating] = useState(false)

  // Mock data
  const [languages] = useState<Language[]>([
    {
      code: 'pt-BR',
      name: 'Portuguese (Brazil)',
      localName: 'Português (Brasil)',
      flag: '🇧🇷',
      completion: 100,
      voiceSupport: true,
      culturalAdaptation: true,
      nrCompliance: true,
      translatorCount: 12,
      qualityScore: 98.7,
      priority: 'high',
      status: 'active'
    },
    {
      code: 'es-AR',
      name: 'Spanish (Argentina)',
      localName: 'Español (Argentina)',
      flag: '🇦🇷',
      completion: 87,
      voiceSupport: true,
      culturalAdaptation: true,
      nrCompliance: false,
      translatorCount: 8,
      qualityScore: 94.2,
      priority: 'high',
      status: 'in_progress'
    },
    {
      code: 'en-US',
      name: 'English (United States)',
      localName: 'English (United States)',
      flag: '🇺🇸',
      completion: 92,
      voiceSupport: true,
      culturalAdaptation: false,
      nrCompliance: false,
      translatorCount: 15,
      qualityScore: 96.8,
      priority: 'high',
      status: 'in_progress'
    },
    {
      code: 'fr-FR',
      name: 'French (France)',
      localName: 'Français (France)',
      flag: '🇫🇷',
      completion: 45,
      voiceSupport: true,
      culturalAdaptation: false,
      nrCompliance: false,
      translatorCount: 5,
      qualityScore: 89.1,
      priority: 'medium',
      status: 'in_progress'
    },
    {
      code: 'de-DE',
      name: 'German (Germany)',
      localName: 'Deutsch (Deutschland)',
      flag: '🇩🇪',
      completion: 23,
      voiceSupport: false,
      culturalAdaptation: false,
      nrCompliance: false,
      translatorCount: 3,
      qualityScore: 85.4,
      priority: 'medium',
      status: 'planned'
    },
    {
      code: 'zh-CN',
      name: 'Chinese (Simplified)',
      localName: '中文（简体）',
      flag: '🇨🇳',
      completion: 12,
      voiceSupport: false,
      culturalAdaptation: false,
      nrCompliance: false,
      translatorCount: 2,
      qualityScore: 78.9,
      priority: 'low',
      status: 'planned'
    },
    {
      code: 'ja-JP',
      name: 'Japanese',
      localName: '日本語',
      flag: '🇯🇵',
      completion: 8,
      voiceSupport: false,
      culturalAdaptation: false,
      nrCompliance: false,
      translatorCount: 2,
      qualityScore: 82.3,
      priority: 'low',
      status: 'planned'
    }
  ])

  const [voiceProfiles] = useState<VoiceProfile[]>([
    {
      id: 'pt-br-male-1',
      language: 'pt-BR',
      name: 'Carlos Silva',
      gender: 'male',
      age: '35-45',
      accent: 'Paulista',
      specialty: ['NR-técnico', 'corporativo', 'educacional'],
      quality: 97.8,
      usage: 2847
    },
    {
      id: 'pt-br-female-1',
      language: 'pt-BR',
      name: 'Ana Santos',
      gender: 'female',
      age: '28-35',
      accent: 'Carioca',
      specialty: ['NR-treinamento', 'explicativo', 'acessível'],
      quality: 98.2,
      usage: 3156
    },
    {
      id: 'es-ar-male-1',
      language: 'es-AR',
      name: 'Miguel Rodriguez',
      gender: 'male',
      age: '30-40',
      accent: 'Porteño',
      specialty: ['seguridad-laboral', 'técnico', 'formal'],
      quality: 94.5,
      usage: 1542
    },
    {
      id: 'en-us-female-1',
      language: 'en-US',
      name: 'Sarah Johnson',
      gender: 'female',
      age: '32-38',
      accent: 'General American',
      specialty: ['safety-training', 'corporate', 'clear-diction'],
      quality: 96.1,
      usage: 1898
    }
  ])

  const [translationProjects] = useState<TranslationProject[]>([
    {
      id: 'proj-001',
      title: 'NR-06 EPI Training Module',
      sourceLanguage: 'pt-BR',
      targetLanguages: ['es-AR', 'en-US'],
      progress: 87,
      status: 'active',
      priority: 'high',
      deadline: '2025-10-15',
      translator: 'Maria Gonzalez',
      wordCount: 3458,
      type: 'content'
    },
    {
      id: 'proj-002',
      title: 'Interface Localization - Dashboard',
      sourceLanguage: 'pt-BR',
      targetLanguages: ['es-AR', 'en-US', 'fr-FR'],
      progress: 92,
      status: 'review',
      priority: 'high',
      deadline: '2025-10-08',
      translator: 'Jean Dubois',
      wordCount: 1247,
      type: 'interface'
    },
    {
      id: 'proj-003',
      title: 'NR-10 Electrical Safety Documentation',
      sourceLanguage: 'pt-BR',
      targetLanguages: ['en-US'],
      progress: 45,
      status: 'active',
      priority: 'medium',
      deadline: '2025-11-01',
      translator: 'Robert Smith',
      wordCount: 5632,
      type: 'documentation'
    }
  ])

  const [culturalAdaptations] = useState<CulturalAdaptation[]>([
    {
      region: 'Argentina',
      language: 'es-AR',
      adaptations: {
        colors: ['azul-corporativo', 'branco-neutro', 'vermelho-alerta'],
        imagery: ['trabalhadores-diversos', 'equipamentos-locais', 'cenarios-industriais'],
        terminology: ['EPP', 'Seguridad Laboral', 'Riesgo Ocupacional'],
        regulations: ['Ley 19.587', 'SRT Resoluciones', 'Convenios Colectivos']
      },
      complianceLevel: 78.5,
      lastUpdate: '2025-09-20'
    },
    {
      region: 'United States',
      language: 'en-US',
      adaptations: {
        colors: ['blue-professional', 'white-clean', 'red-warning'],
        imagery: ['diverse-workforce', 'osha-compliant', 'american-industrial'],
        terminology: ['PPE', 'Occupational Safety', 'Workplace Hazard'],
        regulations: ['OSHA Standards', 'CFR 1926', 'State Regulations']
      },
      complianceLevel: 85.2,
      lastUpdate: '2025-09-22'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'completed': return 'text-blue-500'
      case 'review': return 'text-yellow-500'
      case 'planning': return 'text-gray-500'
      case 'in_progress': return 'text-orange-500'
      case 'planned': return 'text-gray-400'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case 'review': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'planning': return <Clock className="h-4 w-4 text-gray-500" />
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />
      case 'planned': return <AlertCircle className="h-4 w-4 text-gray-400" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Multi-language & Localization</h2>
          <p className="text-muted-foreground">
            Sistema completo de tradução, localização e adaptação cultural
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Languages className="h-3 w-3" />
            <span>{languages.length} Idiomas</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Volume2 className="h-3 w-3" />
            <span>{voiceProfiles.length} Vozes</span>
          </Badge>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idiomas Ativos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languages.filter(l => l.status === 'active').length}</div>
            <p className="text-xs text-green-500 mt-1">
              +2 desde último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translationProjects.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em tradução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vozes Disponíveis</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voiceProfiles.length}</div>
            <p className="text-xs text-green-500 mt-1">
              4 idiomas com voz
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tradutores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {languages.reduce((sum, lang) => sum + lang.translatorCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Especialistas ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="languages">Idiomas</TabsTrigger>
          <TabsTrigger value="voices">Vozes</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="cultural">Cultural</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status dos Idiomas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Status dos Idiomas</span>
                </CardTitle>
                <CardDescription>
                  Progresso de localização por idioma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {languages.slice(0, 5).map((lang) => (
                  <div key={lang.code} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <div className="font-medium">{lang.name}</div>
                        <div className="text-sm text-muted-foreground">{lang.localName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-500">{lang.completion}%</div>
                      <div className="text-xs text-muted-foreground">
                        {lang.translatorCount} tradutores
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projetos em Andamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Projetos em Andamento</span>
                </CardTitle>
                <CardDescription>
                  Traduções ativas e seus progressos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {translationProjects.filter(p => p.status === 'active').map((project) => (
                  <div key={project.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate">{project.title}</div>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={project.progress} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{project.translator}</span>
                      <span>{project.wordCount.toLocaleString()} palavras</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <div className="grid gap-4">
            {languages.map((lang) => (
              <Card key={lang.code} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{lang.flag}</span>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{lang.name}</span>
                          {getStatusIcon(lang.status)}
                        </CardTitle>
                        <CardDescription>{lang.localName}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(lang.priority)}>
                        {lang.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress value={lang.completion} className="h-2" />
                    </div>
                    <span className="text-sm font-bold text-green-500">
                      {lang.completion}%
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-2 border rounded">
                      <div className={`text-lg ${lang.voiceSupport ? 'text-green-500' : 'text-gray-400'}`}>
                        {lang.voiceSupport ? <Volume2 className="h-5 w-5 mx-auto" /> : <Volume2 className="h-5 w-5 mx-auto opacity-30" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Voz</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className={`text-lg ${lang.culturalAdaptation ? 'text-blue-500' : 'text-gray-400'}`}>
                        {lang.culturalAdaptation ? <MapPin className="h-5 w-5 mx-auto" /> : <MapPin className="h-5 w-5 mx-auto opacity-30" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Cultural</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className={`text-lg ${lang.nrCompliance ? 'text-purple-500' : 'text-gray-400'}`}>
                        {lang.nrCompliance ? <CheckCircle2 className="h-5 w-5 mx-auto" /> : <AlertCircle className="h-5 w-5 mx-auto opacity-30" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">NR</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="text-lg font-bold text-yellow-500">{lang.qualityScore}</div>
                      <div className="text-xs text-muted-foreground mt-1">Qualidade</div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Tradutores: <strong>{lang.translatorCount}</strong></span>
                    <span>Score: <strong>{lang.qualityScore}%</strong></span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" disabled={lang.status === 'planned'}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    {lang.voiceSupport && (
                      <Button size="sm" variant="outline">
                        <Headphones className="h-4 w-4 mr-2" />
                        Vozes
                      </Button>
                    )}
                    {lang.culturalAdaptation && (
                      <Button size="sm" variant="outline">
                        <Flag className="h-4 w-4 mr-2" />
                        Cultural
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="voices" className="space-y-4">
          <div className="grid gap-4">
            {voiceProfiles.map((voice) => (
              <Card key={voice.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{voice.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{voice.name}</span>
                          <Badge variant="outline">{voice.gender}</Badge>
                        </CardTitle>
                        <CardDescription>
                          {languages.find(l => l.code === voice.language)?.name} • {voice.accent}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">{voice.quality}%</div>
                      <div className="text-xs text-muted-foreground">{voice.usage.toLocaleString()} usos</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {voice.specialty.map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{voice.age}</div>
                      <div className="text-xs text-muted-foreground">Idade</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-500">{voice.quality}%</div>
                      <div className="text-xs text-muted-foreground">Qualidade</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{voice.usage.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Usos</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Testar Voz
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Amostras
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Estatísticas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {translationProjects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(project.status)}
                        <span>{project.title}</span>
                      </CardTitle>
                      <CardDescription>
                        {project.sourceLanguage} → {project.targetLanguages.join(', ')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {project.type}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <span className="text-sm font-bold text-green-500">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{project.wordCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Palavras</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{project.targetLanguages.length}</div>
                      <div className="text-xs text-muted-foreground">Idiomas</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{project.translator.split(' ')[0]}</div>
                      <div className="text-xs text-muted-foreground">Tradutor</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {new Date(project.deadline).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground">Prazo</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" disabled={project.status === 'completed'}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    {project.status === 'review' && (
                      <Button size="sm" variant="default">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-4">
          <div className="grid gap-4">
            {culturalAdaptations.map((adaptation, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Flag className="h-5 w-5" />
                        <span>Adaptação - {adaptation.region}</span>
                      </CardTitle>
                      <CardDescription>
                        {adaptation.language} • Atualizado em {new Date(adaptation.lastUpdate).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">{adaptation.complianceLevel}%</div>
                      <div className="text-xs text-muted-foreground">Compliance</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Cores:</div>
                      <div className="flex flex-wrap gap-1">
                        {adaptation.adaptations.colors.map((color, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{color}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Imagens:</div>
                      <div className="flex flex-wrap gap-1">
                        {adaptation.adaptations.imagery.map((img, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{img}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Terminologia:</div>
                      <div className="flex flex-wrap gap-1">
                        {adaptation.adaptations.terminology.map((term, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{term}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Regulamentações:</div>
                      <div className="flex flex-wrap gap-1">
                        {adaptation.adaptations.regulations.map((reg, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{reg}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Progress value={adaptation.complianceLevel} className="h-2" />
                    </div>
                    <span className="text-sm font-bold text-green-500">
                      {adaptation.complianceLevel}% compliance
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Aplicar
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MultiLanguageLocalization
