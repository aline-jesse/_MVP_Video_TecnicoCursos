
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, Cpu, HardDrive, Database, Zap, AlertTriangle,
  CheckCircle, TrendingUp, TrendingDown, Clock, BarChart3,
  Settings, RefreshCw, Download, Filter, Bell, Eye
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts'

interface PerformanceData {
  system: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  application: {
    responseTime: number
    throughput: number
    errorRate: number
    activeUsers: number
  }
  database: {
    queryTime: number
    connections: number
    cacheHitRate: number
    lockWaitTime: number
  }
  queue: {
    pendingJobs: number
    processingJobs: number
    completedJobs: number
    failedJobs: number
  }
}

interface Alert {
  id: string
  type: 'performance' | 'security' | 'error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: Date
  resolved: boolean
}

export default function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds

  useEffect(() => {
    fetchPerformanceData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const fetchPerformanceData = async () => {
    try {
      const [metricsResponse, alertsResponse] = await Promise.all([
        fetch('/api/v2/performance/metrics'),
        fetch('/api/v2/performance/alerts')
      ])

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setPerformanceData(metricsData)
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.alerts)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
      // Use mock data
      setPerformanceData(mockPerformanceData)
      setAlerts(mockAlerts)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const mockPerformanceData: PerformanceData = {
    system: {
      cpu: 45 + Math.random() * 20,
      memory: 62 + Math.random() * 15,
      disk: 34 + Math.random() * 10,
      network: 78 + Math.random() * 15
    },
    application: {
      responseTime: 180 + Math.random() * 100,
      throughput: 450 + Math.random() * 100,
      errorRate: 0.5 + Math.random() * 1,
      activeUsers: 342 + Math.floor(Math.random() * 50)
    },
    database: {
      queryTime: 45 + Math.random() * 30,
      connections: 15 + Math.floor(Math.random() * 10),
      cacheHitRate: 88 + Math.random() * 10,
      lockWaitTime: 12 + Math.random() * 15
    },
    queue: {
      pendingJobs: Math.floor(Math.random() * 50),
      processingJobs: Math.floor(Math.random() * 10),
      completedJobs: 1247 + Math.floor(Math.random() * 100),
      failedJobs: Math.floor(Math.random() * 5)
    }
  }

  const mockAlerts: Alert[] = [
    {
      id: 'alert-1',
      type: 'performance',
      severity: 'medium',
      title: 'High Memory Usage',
      description: 'Memory usage is at 78% - consider scaling',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      resolved: false
    },
    {
      id: 'alert-2',
      type: 'performance',
      severity: 'low',
      title: 'Slow Query Detected',
      description: 'Database query took 2.3s - review optimization',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false
    }
  ]

  const currentData = performanceData || mockPerformanceData
  const currentAlerts = alerts.length > 0 ? alerts : mockAlerts

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200'
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
      default: return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200'
    }
  }

  const systemHealthData = [
    { name: 'CPU', value: currentData.system.cpu, max: 100, color: '#3B82F6' },
    { name: 'Memória', value: currentData.system.memory, max: 100, color: '#10B981' },
    { name: 'Disco', value: currentData.system.disk, max: 100, color: '#F59E0B' },
    { name: 'Rede', value: currentData.system.network, max: 100, color: '#EF4444' }
  ]

  const performanceTimeline = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    responseTime: 150 + Math.random() * 200,
    throughput: 400 + Math.random() * 200,
    errorRate: Math.random() * 2
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando Monitor de Performance...</p>
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
            Performance Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitoramento em tempo real de performance e recursos do sistema
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
            <Bell className="h-4 w-4 mr-2" />
            Alertas ({currentAlerts.filter(a => !a.resolved).length})
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(currentData.system.cpu, { good: 50, warning: 80 })}`}>
              {currentData.system.cpu.toFixed(1)}%
            </div>
            <Progress value={currentData.system.cpu} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {currentData.system.cpu > 80 ? 'Alto uso' : currentData.system.cpu > 50 ? 'Uso moderado' : 'Uso normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memória</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(currentData.system.memory, { good: 60, warning: 85 })}`}>
              {currentData.system.memory.toFixed(1)}%
            </div>
            <Progress value={currentData.system.memory} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((currentData.system.memory / 100) * 8)}GB / 8GB usados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(currentData.database.queryTime, { good: 50, warning: 200 })}`}>
              {currentData.database.queryTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {currentData.database.connections} conexões ativas
            </p>
            <div className="mt-2">
              <Progress value={currentData.database.cacheHitRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {currentData.database.cacheHitRate.toFixed(1)}% cache hit rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aplicação</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(currentData.application.responseTime, { good: 200, warning: 500 })}`}>
              {currentData.application.responseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {currentData.application.activeUsers} usuários ativos
            </p>
            <div className="mt-2 flex space-x-2">
              <Badge variant="secondary" className="text-xs">
                {currentData.application.errorRate.toFixed(2)}% errors
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="queue">Fila</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance em Tempo Real</CardTitle>
                <CardDescription>Métricas atualizadas a cada {refreshInterval}s</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart data={systemHealthData}>
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      fill="#3B82F6"
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Aplicação</CardTitle>
                <CardDescription>Response time e throughput</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Time</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{currentData.application.responseTime.toFixed(0)}ms</span>
                      <Badge variant={currentData.application.responseTime < 200 ? 'default' : 'destructive'}>
                        {currentData.application.responseTime < 200 ? 'Excelente' : 'Atenção'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(currentData.application.responseTime / 1000) * 100} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Throughput</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{currentData.application.throughput.toFixed(0)} req/min</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <Progress value={(currentData.application.throughput / 1000) * 100} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{currentData.application.errorRate.toFixed(2)}%</span>
                      <Badge variant={currentData.application.errorRate < 1 ? 'default' : 'destructive'}>
                        {currentData.application.errorRate < 1 ? 'Baixo' : 'Alto'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={currentData.application.errorRate * 10} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Utilização de Recursos</CardTitle>
              <CardDescription>Distribuição detalhada de recursos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={systemHealthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Performance</CardTitle>
              <CardDescription>Análise histórica das últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="responseTime" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="throughput" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alertas Ativos</span>
                <Badge variant="destructive">{currentAlerts.filter(a => !a.resolved).length}</Badge>
              </CardTitle>
              <CardDescription>Alertas de performance e sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {alert.severity === 'critical' && <AlertTriangle className="h-5 w-5" />}
                        {alert.severity === 'high' && <AlertTriangle className="h-5 w-5" />}
                        {alert.severity === 'medium' && <Eye className="h-5 w-5" />}
                        {alert.severity === 'low' && <CheckCircle className="h-5 w-5" />}
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm opacity-75">{alert.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>
                          {alert.resolved ? 'Resolvido' : alert.severity.toUpperCase()}
                        </Badge>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {currentAlerts.filter(a => !a.resolved).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Nenhum alerta ativo</p>
                    <p className="text-sm">Sistema operando normalmente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status da Fila</CardTitle>
                <CardDescription>Processamento de jobs em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{currentData.queue.pendingJobs}</div>
                      <div className="text-xs text-yellow-600">Pendentes</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{currentData.queue.processingJobs}</div>
                      <div className="text-xs text-blue-600">Processando</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{currentData.queue.completedJobs}</div>
                      <div className="text-xs text-green-600">Concluídos</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{currentData.queue.failedJobs}</div>
                      <div className="text-xs text-red-600">Falhas</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas da Fila</CardTitle>
                <CardDescription>Performance e eficiência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Sucesso</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">
                        {(((currentData.queue.completedJobs) / (currentData.queue.completedJobs + currentData.queue.failedJobs)) * 100).toFixed(1)}%
                      </span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio</span>
                    <span className="font-bold">2.3min</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Jobs/Hora</span>
                    <span className="font-bold">127</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Capacity</span>
                    <Badge variant="default">Normal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Monitoramento</CardTitle>
              <CardDescription>Ajustar thresholds e intervalos de atualização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Intervalo de Atualização</h4>
                  <div className="flex space-x-2">
                    {[10, 30, 60, 120].map((interval) => (
                      <Button
                        key={interval}
                        variant={refreshInterval === interval ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRefreshInterval(interval)}
                      >
                        {interval}s
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Thresholds de Alerta</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CPU Usage</span>
                      <Badge variant="outline">80%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memory Usage</span>
                      <Badge variant="outline">85%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time</span>
                      <Badge variant="outline">500ms</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <Badge variant="outline">2%</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Notificações</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Alerts</span>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Slack Integration</span>
                      <Badge variant="secondary">Configurar</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Webhook Alerts</span>
                      <Badge variant="secondary">Inativo</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
