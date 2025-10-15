
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import Link from 'next/link'
import { 
  Play, 
  Upload, 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  Zap,
  Brain,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Video,
  Mic,
  Image as ImageIcon,
  FileText,
  Star,
  Award,
  Rocket,
  Activity,
  Eye,
  Download,
  Plus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import CreateProjectModal from '../project/create-project-modal'

interface DashboardMetric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
}

interface RecentProject {
  id: string
  name: string
  type: 'pptx' | 'video' | 'audio'
  progress: number
  status: 'completed' | 'processing' | 'draft'
  lastModified: string
  thumbnail: string
  aiScore?: number
}

interface AIInsight {
  id: string
  type: 'optimization' | 'suggestion' | 'alert' | 'achievement'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action?: string
}

export default function EnhancedDashboardV3() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    // Métricas atualizadas
    const dashboardMetrics: DashboardMetric[] = [
      {
        label: 'Projetos Ativos',
        value: '47',
        change: '+12%',
        trend: 'up',
        icon: <Video className="h-5 w-5" />,
        color: 'text-blue-600'
      },
      {
        label: 'Score IA Médio',
        value: '94.2',
        change: '+3.8',
        trend: 'up',
        icon: <Brain className="h-5 w-5" />,
        color: 'text-purple-600'
      },
      {
        label: 'Templates NR',
        value: '127',
        change: '+23',
        trend: 'up',
        icon: <Sparkles className="h-5 w-5" />,
        color: 'text-green-600'
      },
      {
        label: 'Horas Economizadas',
        value: '2.847',
        change: '+18%',
        trend: 'up',
        icon: <Clock className="h-5 w-5" />,
        color: 'text-orange-600'
      }
    ]

    // Projetos recentes com IA
    const projects: RecentProject[] = [
      {
        id: '1',
        name: 'Treinamento NR-12 Avançado',
        type: 'pptx',
        progress: 100,
        status: 'completed',
        lastModified: 'Há 2 horas',
        thumbnail: '/nr12-thumb.jpg',
        aiScore: 96
      },
      {
        id: '2',
        name: 'Espaços Confinados NR-33',
        type: 'video',
        progress: 75,
        status: 'processing',
        lastModified: 'Há 4 horas',
        thumbnail: '/nr33-thumb.jpg',
        aiScore: 89
      },
      {
        id: '3',
        name: 'Trabalho em Altura NR-35',
        type: 'pptx',
        progress: 45,
        status: 'draft',
        lastModified: 'Há 1 dia',
        thumbnail: '/nr35-thumb.jpg',
        aiScore: 72
      },
      {
        id: '4',
        name: 'Avatar Corporativo Premium',
        type: 'audio',
        progress: 100,
        status: 'completed',
        lastModified: 'Há 3 dias',
        thumbnail: '/avatar-executivo-thumb.jpg',
        aiScore: 94
      }
    ]

    // Insights IA
    const insights: AIInsight[] = [
      {
        id: '1',
        type: 'achievement',
        title: 'Meta Atingida! 🎉',
        description: 'Seus vídeos NR alcançaram 96% de engagement médio',
        priority: 'high'
      },
      {
        id: '2',
        type: 'optimization',
        title: 'Oportunidade de Otimização',
        description: 'IA detectou 3 templates que podem ser melhorados',
        priority: 'medium',
        action: 'Ver sugestões'
      },
      {
        id: '3',
        type: 'suggestion',
        title: 'Novo Template Disponível',
        description: 'Template NR-18 com IA de canteiro de obras foi lançado',
        priority: 'medium',
        action: 'Explorar'
      },
      {
        id: '4',
        type: 'alert',
        title: 'Atualização NR Necessária',
        description: '2 templates precisam de atualização normativa',
        priority: 'high',
        action: 'Atualizar'
      }
    ]

    setMetrics(dashboardMetrics)
    setRecentProjects(projects)
    setAIInsights(insights)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'processing': return 'Processando'
      case 'draft': return 'Rascunho'
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pptx': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <Mic className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="h-5 w-5 text-green-500" />
      case 'optimization': return <Zap className="h-5 w-5 text-blue-500" />
      case 'suggestion': return <Sparkles className="h-5 w-5 text-purple-500" />
      case 'alert': return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default: return <Brain className="h-5 w-5 text-gray-500" />
    }
  }

  const runQuickAction = (action: string) => {
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      toast.success(`${action} executado com sucesso!`)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header Principal com IA */}
      <Card className="border-2 border-gradient-to-r from-blue-200 to-purple-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Estúdio IA de Vídeos
              </CardTitle>
              <p className="text-gray-600 mt-2 text-lg">
                Dashboard Inteligente - MVP 24h com Fluxo Completo
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Botão Destacado: Novo Projeto */}
              <Button 
                size="lg"
                onClick={() => setCreateModalOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Novo Projeto
              </Button>
              
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                Sistema IA: Online
              </Badge>
              
              <Link href="/ia-assistant-studio">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Bot className="h-4 w-4 mr-2" />
                  Assistente IA
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-green-600 font-medium">{metric.change}</span>
                    <TrendingUp className="h-3 w-3 ml-1 text-green-600" />
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projetos Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Projetos Recentes
              </CardTitle>
              <Link href="/projetos">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {getTypeIcon(project.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {project.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {project.aiScore && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Brain className="h-3 w-3 mr-1" />
                              {project.aiScore}
                            </Badge>
                          )}
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusText(project.status)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{project.lastModified}</p>
                      {project.progress < 100 && (
                        <div className="flex items-center space-x-2">
                          <Progress value={project.progress} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500">{project.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rocket className="h-5 w-5 mr-2" />
                Ações Rápidas com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/pptx-production">
                  <Button 
                    className="w-full h-20 flex flex-col space-y-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm font-medium">Upload PPTX</span>
                    <span className="text-xs opacity-90">Com IA Processing</span>
                  </Button>
                </Link>
                
                <Link href="/ia-assistant-studio">
                  <Button 
                    className="w-full h-20 flex flex-col space-y-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Brain className="h-6 w-6" />
                    <span className="text-sm font-medium">Assistente IA</span>
                    <span className="text-xs opacity-90">Análise Inteligente</span>
                  </Button>
                </Link>
                
                <Link href="/elevenlabs-professional-studio">
                  <Button 
                    className="w-full h-20 flex flex-col space-y-1 bg-green-600 hover:bg-green-700"
                  >
                    <Mic className="h-6 w-6" />
                    <span className="text-sm font-medium">Voice Studio</span>
                    <span className="text-xs opacity-90">TTS Premium</span>
                  </Button>
                </Link>
                
                <Link href="/talking-photo-pro">
                  <Button 
                    className="w-full h-20 flex flex-col space-y-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-medium">Avatar 3D</span>
                    <span className="text-xs opacity-90">Hiper-Realista</span>
                  </Button>
                </Link>
                
                <Link href="/canvas-editor-pro">
                  <Button 
                    className="w-full h-20 flex flex-col space-y-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Canvas Editor</span>
                    <span className="text-xs opacity-90">Pro V3</span>
                  </Button>
                </Link>
                
                <Link href="/advanced-video-pipeline">
                  <Button 
                    className="w-full h-20 flex flex-col space-y-1 bg-red-600 hover:bg-red-700"
                  >
                    <Video className="h-6 w-6" />
                    <span className="text-sm font-medium">Video Pipeline</span>
                    <span className="text-xs opacity-90">Renderização</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Insights IA */}
        <div className="space-y-4">
          {/* Insights IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  Insights IA
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {aiInsights.length} novos
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                    </div>
                    <Badge 
                      className={
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }
                    >
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  {insight.action && (
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => runQuickAction(insight.action!)}
                      disabled={isLoading}
                    >
                      {insight.action}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status do Sistema IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Status Sistema IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Processamento IA</span>
                <Badge className="bg-green-100 text-green-800">100% Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Templates NR</span>
                <Badge className="bg-blue-100 text-blue-800">127 Ativos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Voice Cloning</span>
                <Badge className="bg-purple-100 text-purple-800">29 Vozes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avatar 3D</span>
                <Badge className="bg-orange-100 text-orange-800">25 Avatares</Badge>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Performance IA</span>
                  <span className="text-sm text-green-600 font-bold">94.2%</span>
                </div>
                <Progress value={94.2} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Conquistas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Expert em NR-12</p>
                  <p className="text-xs text-gray-600">50+ vídeos criados</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">IA Master</p>
                  <p className="text-xs text-gray-600">Score médio 90+</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Compliance Pro</p>
                  <p className="text-xs text-gray-600">100% conformidade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  )
}
