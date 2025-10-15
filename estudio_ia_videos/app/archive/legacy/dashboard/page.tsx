'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  User, 
  Video, 
  Mic, 
  Settings, 
  BarChart3,
  Upload,
  Edit,
  Palette,
  Volume2,
  Users,
  Template,
  Cpu,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react"

/**
 * 🎯 DASHBOARD PRINCIPAL UNIFICADO - VERSÃO APRIMORADA
 * 
 * Centraliza todos os módulos do sistema em uma interface única
 * Evita 404s redirecionando módulos antigos para cá
 */

interface DashboardStats {
  totalProjects: number
  activeRenders: number
  completedToday: number
  systemHealth: 'healthy' | 'warning' | 'error'
  storageUsed: number
  storageTotal: number
}

interface ModuleStatus {
  name: string
  status: 'active' | 'maintenance' | 'disabled'
  health: number
  lastUpdate: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 42,
    activeRenders: 3,
    completedToday: 8,
    systemHealth: 'healthy',
    storageUsed: 2.4,
    storageTotal: 10
  })

  const [modules, setModules] = useState<ModuleStatus[]>([
    { name: 'PPTX Studio', status: 'active', health: 98, lastUpdate: '2 min ago' },
    { name: 'Avatar Studio', status: 'active', health: 95, lastUpdate: '5 min ago' },
    { name: 'Video Pipeline', status: 'active', health: 92, lastUpdate: '1 min ago' },
    { name: 'Voice Studio', status: 'active', health: 89, lastUpdate: '3 min ago' },
    { name: 'Template Engine', status: 'maintenance', health: 75, lastUpdate: '15 min ago' },
    { name: 'Analytics', status: 'active', health: 96, lastUpdate: '30 sec ago' },
  ])

  // Detecta tab via URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [])

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600'
    if (health >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: ModuleStatus['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      disabled: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎬 Estúdio IA Vídeos
            </h1>
            <p className="text-gray-600 mt-2">
              Central de produção de vídeos com inteligência artificial
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* System Status Alert */}
        {stats.systemHealth !== 'healthy' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sistema em manutenção. Algumas funcionalidades podem estar indisponíveis.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Projetos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Renderizando</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeRenders}</p>
                </div>
                <Cpu className="w-8 h-8 text-orange-600 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Finalizados Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Armazenamento</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.storageUsed}GB / {stats.storageTotal}GB
                  </p>
                  <Progress 
                    value={(stats.storageUsed / stats.storageTotal) * 100} 
                    className="mt-2 h-2" 
                  />
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="pptx">
              <FileText className="w-4 h-4 mr-2" />
              PPTX
            </TabsTrigger>
            <TabsTrigger value="avatar">
              <User className="w-4 h-4 mr-2" />
              Avatar
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="w-4 h-4 mr-2" />
              Vídeo
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="w-4 h-4 mr-2" />
              Voz
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Template className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="collaboration">
              <Users className="w-4 h-4 mr-2" />
              Colaboração
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* System Modules Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Módulos</CardTitle>
                  <CardDescription>
                    Monitoramento em tempo real de todos os sistemas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className={`w-5 h-5 ${getHealthColor(module.health)}`} />
                        <div>
                          <p className="font-medium">{module.name}</p>
                          <p className="text-sm text-gray-500">{module.lastUpdate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${getHealthColor(module.health)}`}>
                          {module.health}%
                        </span>
                        {getStatusBadge(module.status)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>
                    Últimas ações no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">Vídeo renderizado com sucesso</p>
                      <p className="text-sm text-gray-500">Projeto: NR-35 Treinamento</p>
                    </div>
                    <span className="text-sm text-gray-400">2 min</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">PPTX carregado</p>
                      <p className="text-sm text-gray-500">Arquivo: seguranca_trabalho.pptx</p>
                    </div>
                    <span className="text-sm text-gray-400">5 min</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium">Avatar criado</p>
                      <p className="text-sm text-gray-500">Tipo: Executivo Corporativo</p>
                    </div>
                    <span className="text-sm text-gray-400">8 min</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PPTX Studio Tab */}
          <TabsContent value="pptx" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  PPTX Studio
                </CardTitle>
                <CardDescription>
                  Converta apresentações PowerPoint em vídeos profissionais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-24 flex-col space-y-2">
                    <Upload className="w-8 h-8" />
                    <span>Upload PPTX</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Edit className="w-8 h-8" />
                    <span>Editor</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Video className="w-8 h-8" />
                    <span>Renderizar</span>
                  </Button>
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Módulo PPTX funcionando normalmente. Suporte a arquivos até 100MB.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avatar Studio Tab */}
          <TabsContent value="avatar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-6 h-6 mr-2 text-purple-600" />
                  Avatar Studio
                </CardTitle>
                <CardDescription>
                  Crie avatares realistas e fotos falantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-24 flex-col space-y-2">
                    <User className="w-8 h-8" />
                    <span>Avatar 3D</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Palette className="w-8 h-8" />
                    <span>Talking Photo</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Settings className="w-8 h-8" />
                    <span>Personalizar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="w-6 h-6 mr-2 text-green-600" />
                  Produção de Vídeo
                </CardTitle>
                <CardDescription>
                  Editor profissional e pipeline de renderização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-24 flex-col space-y-2">
                    <Edit className="w-8 h-8" />
                    <span>Canvas Editor</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Cpu className="w-8 h-8" />
                    <span>Render Pipeline</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Palette className="w-8 h-8" />
                    <span>Effects Library</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="w-6 h-6 mr-2 text-red-600" />
                  Voice Studio
                </CardTitle>
                <CardDescription>
                  Text-to-Speech e clonagem de voz internacional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-24 flex-col space-y-2">
                    <Mic className="w-8 h-8" />
                    <span>TTS Studio</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Volume2 className="w-8 h-8" />
                    <span>Voice Cloning</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Settings className="w-8 h-8" />
                    <span>Audio Mixer</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Template className="w-6 h-6 mr-2 text-indigo-600" />
                  Template Engine
                </CardTitle>
                <CardDescription>
                  Biblioteca de templates para NRs e treinamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-24 flex-col space-y-2">
                    <Template className="w-8 h-8" />
                    <span>NR Templates</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Edit className="w-8 h-8" />
                    <span>Custom Templates</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col space-y-2">
                    <Upload className="w-8 h-8" />
                    <span>Template Library</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-yellow-600" />
                  Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Métricas e insights de produção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  📊 Dashboard de analytics em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaboration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-2 text-teal-600" />
                  Colaboração
                </CardTitle>
                <CardDescription>
                  Trabalho em equipe e revisão de projetos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  👥 Ferramentas de colaboração em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}