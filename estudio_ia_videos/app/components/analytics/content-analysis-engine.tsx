
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer
} from 'recharts'
import { 
  Activity, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Clock, 
  Users,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface ContentMetrics {
  viewCount: number
  engagementRate: number
  completionRate: number
  averageWatchTime: number
  retentionRate: number
  interactionCount: number
  shareCount: number
  downloadCount: number
}

interface AnalyticsData {
  date: string
  views: number
  engagement: number
  completion: number
  retention: number
}

interface AudienceInsight {
  segment: string
  percentage: number
  performance: number
  color: string
  [key: string]: any
}

interface ContentPerformance {
  contentId: string
  title: string
  type: 'pptx' | 'video' | 'avatar' | 'template'
  score: number
  metrics: ContentMetrics
  insights: string[]
  recommendations: string[]
}

export default function ContentAnalysisEngine() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentMetrics, setCurrentMetrics] = useState<ContentMetrics>({
    viewCount: 0,
    engagementRate: 0,
    completionRate: 0,
    averageWatchTime: 0,
    retentionRate: 0,
    interactionCount: 0,
    shareCount: 0,
    downloadCount: 0
  })
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [audienceData, setAudienceData] = useState<AudienceInsight[]>([])
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  // Simular dados de análise
  useEffect(() => {
    generateMockData()
  }, [selectedTimeRange])

  const generateMockData = () => {
    // Métricas principais
    setCurrentMetrics({
      viewCount: 15847,
      engagementRate: 78.5,
      completionRate: 85.2,
      averageWatchTime: 645, // segundos
      retentionRate: 82.7,
      interactionCount: 3256,
      shareCount: 892,
      downloadCount: 1547
    })

    // Dados de performance temporal
    const mockAnalytics: AnalyticsData[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      views: Math.floor(Math.random() * 1000) + 200,
      engagement: Math.floor(Math.random() * 20) + 60,
      completion: Math.floor(Math.random() * 15) + 70,
      retention: Math.floor(Math.random() * 10) + 75
    }))
    setAnalyticsData(mockAnalytics)

    // Insights de audiência
    setAudienceData([
      { segment: 'Indústria', percentage: 35, performance: 88, color: '#8884d8' },
      { segment: 'Construção', percentage: 28, performance: 92, color: '#82ca9d' },
      { segment: 'Saúde', percentage: 18, performance: 85, color: '#ffc658' },
      { segment: 'Educação', percentage: 12, performance: 79, color: '#ff7300' },
      { segment: 'Outros', percentage: 7, performance: 76, color: '#8dd1e1' }
    ])

    // Performance de conteúdo
    setContentPerformance([
      {
        contentId: '1',
        title: 'NR-12 Segurança em Máquinas',
        type: 'pptx',
        score: 94,
        metrics: {
          viewCount: 5247,
          engagementRate: 89.2,
          completionRate: 91.5,
          averageWatchTime: 720,
          retentionRate: 88.3,
          interactionCount: 1547,
          shareCount: 324,
          downloadCount: 678
        },
        insights: [
          'Alto engajamento nos slides 8-12 (procedimentos práticos)',
          'Taxa de abandono baixa (8.5%)',
          'Compartilhamento alto em grupos de segurança'
        ],
        recommendations: [
          'Expandir seção de casos práticos',
          'Adicionar mais exemplos visuais',
          'Criar versão resumida para revisão'
        ]
      },
      {
        contentId: '2',
        title: 'Avatar 3D - Treinamento NR-33',
        type: 'avatar',
        score: 91,
        metrics: {
          viewCount: 3892,
          engagementRate: 94.7,
          completionRate: 87.3,
          averageWatchTime: 845,
          retentionRate: 90.1,
          interactionCount: 2156,
          shareCount: 445,
          downloadCount: 389
        },
        insights: [
          'Avatar aumenta engajamento em 35%',
          'Tempo de visualização 40% maior',
          'Feedback positivo sobre realismo'
        ],
        recommendations: [
          'Produzir mais conteúdo com avatares',
          'Testar diferentes personalidades',
          'Adicionar interações por voz'
        ]
      }
    ])
  }

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    toast.info('Iniciando análise profunda de conteúdo...')
    
    try {
      // Simular análise em tempo real
      const steps = [
        'Coletando dados de visualização...',
        'Analisando padrões de engajamento...',
        'Processando métricas de retenção...',
        'Gerando insights personalizados...',
        'Calculando scores de performance...',
        'Criando recomendações IA...'
      ]
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.info(step)
      }
      
      generateMockData()
      toast.success('Análise completa! Insights atualizados.')
      
    } catch (error) {
      toast.error('Erro na análise. Tente novamente.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const exportReport = () => {
    toast.success('Relatório de análise exportado com sucesso!')
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 80) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Content Analysis Engine</h1>
            <p className="text-muted-foreground">
              Análise avançada de performance e engajamento de conteúdo
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <Button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                <span>Analisar</span>
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={exportReport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.viewCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8.2% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conclusão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5.7% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(currentMetrics.averageWatchTime)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15.3% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="audience">Audiência</TabsTrigger>
          <TabsTrigger value="content">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChartIcon className="h-5 w-5" />
                  <span>Tendência de Engajamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="engagement" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="retention" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Visualizações Diárias</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Retention Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Retenção</CardTitle>
              <CardDescription>
                Pontos de abandono e engajamento ao longo do conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { point: '0-20%', retention: 95, color: 'bg-green-500' },
                    { point: '20-40%', retention: 89, color: 'bg-green-400' },
                    { point: '40-60%', retention: 85, color: 'bg-yellow-500' },
                    { point: '60-80%', retention: 82, color: 'bg-yellow-400' },
                    { point: '80-100%', retention: 78, color: 'bg-orange-500' }
                  ].map((segment) => (
                    <div key={segment.point} className="text-center">
                      <div className="text-sm font-medium mb-2">{segment.point}</div>
                      <div className="h-24 bg-muted rounded-lg flex items-end justify-center p-2">
                        <div 
                          className={`w-full ${segment.color} rounded-t`}
                          style={{ height: `${segment.retention}%` }}
                        ></div>
                      </div>
                      <div className="text-lg font-bold mt-2">{segment.retention}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Segmentos de Audiência</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={audienceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percentage }: any) => `${segment} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {audienceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance por Segmento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audienceData.map((segment) => (
                    <div key={segment.segment} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{segment.segment}</span>
                        <Badge variant={segment.performance >= 85 ? 'default' : 'secondary'}>
                          {segment.performance}%
                        </Badge>
                      </div>
                      <Progress value={segment.performance} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {segment.percentage}% da audiência total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="space-y-4">
            {contentPerformance.map((content) => (
              <Card key={content.contentId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span>{content.title}</span>
                        <Badge variant="outline" className="capitalize">
                          {content.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Performance Score: 
                        <span className={`ml-2 font-bold ${getScoreColor(content.score)}`}>
                          {content.score}/100
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant={getScoreBadge(content.score)} className="text-lg px-4 py-2">
                      {content.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {content.metrics.viewCount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Visualizações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {content.metrics.engagementRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Engajamento</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {content.metrics.completionRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Conclusão</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatTime(content.metrics.averageWatchTime)}
                      </div>
                      <div className="text-sm text-muted-foreground">Tempo Médio</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Insights Principais
                      </h4>
                      <ul className="space-y-2">
                        {content.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                        Recomendações IA
                      </h4>
                      <ul className="space-y-2">
                        {content.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span>Oportunidades de Melhoria</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Retenção no Final do Conteúdo
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      22% dos usuários abandonam nos últimos 20% do conteúdo. 
                      Considere adicionar elementos interativos ou resumo visual.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                      Horários de Pico
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Maior engajamento entre 14h-16h. Considere agendar 
                      lançamentos de novos conteúdos neste período.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      Conteúdo com Avatar
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Conteúdos com avatares 3D têm 40% mais engajamento. 
                      Priorize produção de mais material com avatares.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Tendências Identificadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Móvel vs Desktop</span>
                    <Badge>68% Mobile</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Duração Ideal</span>
                    <Badge>8-12 minutos</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Melhor NR</span>
                    <Badge>NR-12 (+15%)</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Formato Preferido</span>
                    <Badge>Vídeo + Quiz</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Crescimento</span>
                    <Badge className="bg-green-100 text-green-800">+18% MoM</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
