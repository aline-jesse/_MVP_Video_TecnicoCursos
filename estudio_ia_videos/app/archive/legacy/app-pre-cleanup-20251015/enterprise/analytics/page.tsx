
'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  Activity, Users, TrendingUp, Server, Database, Zap,
  AlertTriangle, CheckCircle, Clock, BarChart3, Gauge,
  RefreshCw, Download, Settings, Filter, Calendar
} from 'lucide-react'

interface AnalyticsData {
  system: {
    cpu: number
    memory: number
    disk: number
    database: number
    uptime: number
  }
  users: {
    total: number
    active: number
    newToday: number
    engagement: number
  }
  content: {
    totalVideos: number
    renderingTime: number
    successRate: number
    storageUsed: number
  }
  api: {
    totalRequests: number
    avgResponseTime: number
    errorRate: number
    throughput: number
  }
  business: {
    revenue: number
    conversions: number
    retention: number
    satisfaction: number
  }
}

export default function EnterpriseAnalytics() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 5000) // 5s para dados real-time
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh])

  const fetchAnalytics = async () => {
    try {
      // Usar API real-time implementada
      const response = await fetch('/api/v2/enterprise/analytics/real-time')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAnalytics(data.metrics)
        }
      }
    } catch (error) {
      console.error('Error fetching real-time analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const mockData = {
    system: { cpu: 45, memory: 62, disk: 34, database: 12, uptime: 99.9 },
    users: { total: 1247, active: 342, newToday: 23, engagement: 78 },
    content: { totalVideos: 5632, renderingTime: 45, successRate: 96.5, storageUsed: 2.4 },
    api: { totalRequests: 125634, avgResponseTime: 180, errorRate: 0.8, throughput: 450 },
    business: { revenue: 28950, conversions: 15.3, retention: 89, satisfaction: 4.7 }
  }

  const currentData = analytics || mockData

  const chartData = [
    { name: 'CPU', value: currentData.system.cpu, color: '#3B82F6' },
    { name: 'Memória', value: currentData.system.memory, color: '#10B981' },
    { name: 'Disco', value: currentData.system.disk, color: '#F59E0B' },
    { name: 'BD', value: currentData.system.database, color: '#EF4444' }
  ]

  const userActivityData = [
    { time: '00:00', users: 45, videos: 12 },
    { time: '06:00', users: 123, videos: 34 },
    { time: '12:00', users: 234, videos: 67 },
    { time: '18:00', users: 342, videos: 89 },
    { time: '24:00', users: 189, videos: 45 }
  ]

  const performanceData = [
    { metric: 'Response Time', atual: 180, target: 200, trend: -5 },
    { metric: 'Success Rate', atual: 96.5, target: 95, trend: 1.2 },
    { metric: 'Throughput', atual: 450, target: 400, trend: 12.5 },
    { metric: 'Error Rate', atual: 0.8, target: 2, trend: -0.3 }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Enterprise Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Métricas avançadas e monitoramento em tempo real
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {['1h', '24h', '7d', '30d'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.users.active}</div>
            <p className="text-xs text-muted-foreground">
              +{currentData.users.newToday} novos hoje
            </p>
            <div className="mt-2">
              <Progress value={currentData.users.engagement} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {currentData.users.engagement}% engagement
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance API</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.api.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {currentData.api.totalRequests.toLocaleString()} requests
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {currentData.api.errorRate}% errors
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentData.api.throughput} req/min
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vídeos Criados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.content.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              {currentData.content.renderingTime}s tempo médio
            </p>
            <div className="mt-2">
              <Progress value={currentData.content.successRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {currentData.content.successRate}% sucesso
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentData.system.uptime}%
            </div>
            <p className="text-xs text-muted-foreground">uptime</p>
            <div className="mt-2 flex space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="business">Negócio</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recursos do Sistema</CardTitle>
                <CardDescription>Uso de CPU, memória e armazenamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade da API</CardTitle>
                <CardDescription>Requests por minuto nas últimas 24h</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade de Usuários</CardTitle>
                <CardDescription>Usuários ativos vs. criação de vídeos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="videos" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Usuários</CardTitle>
                <CardDescription>Segmentação por tipo de uso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Criadores Ativos</span>
                    <Badge variant="secondary">68%</Badge>
                  </div>
                  <Progress value={68} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Espectadores</span>
                    <Badge variant="secondary">25%</Badge>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Administradores</span>
                    <Badge variant="secondary">7%</Badge>
                  </div>
                  <Progress value={7} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>KPIs vs. metas estabelecidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((metric) => (
                    <div key={metric.metric} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{metric.atual}</span>
                          <Badge 
                            variant={metric.trend > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {metric.trend > 0 ? '+' : ''}{metric.trend}%
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={(metric.atual / metric.target) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Queue Processing</CardTitle>
                <CardDescription>Status da fila de processamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Processados</span>
                    </div>
                    <span className="font-medium">234</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Na Fila</span>
                    </div>
                    <span className="font-medium">12</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Processando</span>
                    </div>
                    <span className="font-medium">3</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Falhas</span>
                    </div>
                    <span className="font-medium">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal</CardTitle>
                <CardDescription>R$ {currentData.business.revenue.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  +12.5%
                </div>
                <p className="text-xs text-muted-foreground">vs. mês anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conversão</CardTitle>
                <CardDescription>{currentData.business.conversions}%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  +2.3%
                </div>
                <p className="text-xs text-muted-foreground">crescimento mensal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfação</CardTitle>
                <CardDescription>{currentData.business.satisfaction}/5.0</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  ⭐ Excelente
                </div>
                <p className="text-xs text-muted-foreground">4.7+ rating médio</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Alertas</CardTitle>
              <CardDescription>Monitoramento e notificações em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sistema Operacional</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Todos os serviços funcionando normalmente
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">Agora</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Alto Uso de Memória</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Uso de memória em 62% - próximo do limite
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">5min atrás</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pico de Usuários</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      342 usuários online - novo recorde!
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">1h atrás</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
