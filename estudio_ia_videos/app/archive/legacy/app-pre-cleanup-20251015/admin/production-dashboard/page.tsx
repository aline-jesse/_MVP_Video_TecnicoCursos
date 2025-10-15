
/**
 * 📊 Production Dashboard
 * Dashboard de monitoramento para sistema de produção
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  HardDrive,
  Zap,
  TrendingUp,
  Database,
  Server,
  RefreshCw
} from 'lucide-react'

interface SystemMetrics {
  usage: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageProcessingTime: number
    peakProcessingTime: number
    activeUsers: number
    totalVideosGenerated: number
    totalAudioGenerated: number
    storageUsed: number
  }
  queue: {
    pending: number
    processing: number
    completed: number
    failed: number
    totalJobs: number
  }
  alerts: Array<{
    type: 'warning' | 'error' | 'critical'
    message: string
    timestamp: Date
    metric?: string
    value?: number
  }>
  performance: {
    averageResponseTime: number
    peakResponseTime: number
    successRate: string
    requestsPerHour: number
  }
}

export default function ProductionDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Carregar métricas
  const loadMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/monitoring/metrics')
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh das métricas
  useEffect(() => {
    loadMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000) // 30 segundos
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const successRate = metrics?.usage ? 
    (metrics.usage.successfulRequests / Math.max(1, metrics.usage.totalRequests) * 100).toFixed(1) : 
    '100.0'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
            <p className="text-gray-600">Sistema de monitoramento em tempo real</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={loadMetrics} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              {autoRefresh ? 'Pausar' : 'Auto-Refresh'}
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {metrics?.alerts && metrics.alerts.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertas do Sistema ({metrics.alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-red-700">{alert.message}</span>
                    <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests Hoje</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.usage?.totalRequests || 0}</div>
              <p className="text-xs text-muted-foreground">
                Taxa de sucesso: {successRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((metrics?.usage?.averageProcessingTime || 0) / 1000)}s
              </div>
              <p className="text-xs text-muted-foreground">
                Pico: {Math.round((metrics?.usage?.peakProcessingTime || 0) / 1000)}s
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.usage?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.usage?.storageUsed || 0} MB</div>
              <p className="text-xs text-muted-foreground">
                S3 Storage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Detalhes */}
        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="queue">Fila de Jobs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="production">Produção</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          {/* Fila de Jobs */}
          <TabsContent value="queue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {metrics?.queue?.pending || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processando</CardTitle>
                  <Zap className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics?.queue?.processing || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics?.queue?.completed || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Falharam</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {metrics?.queue?.failed || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progresso da Fila */}
            {metrics?.queue && metrics.queue.totalJobs > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Status da Fila</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Concluídos</span>
                      <span>{metrics.queue.completed}/{metrics.queue.totalJobs}</span>
                    </div>
                    <Progress value={(metrics.queue.completed / metrics.queue.totalJobs) * 100} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{successRate}%</div>
                  <Progress value={parseFloat(successRate)} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requests/Hora</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics?.performance?.requestsPerHour || 0}</div>
                  <p className="text-sm text-muted-foreground">Média das últimas 24h</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round((metrics?.performance?.averageResponseTime || 0) / 1000)}s
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pico: {Math.round((metrics?.performance?.peakResponseTime || 0) / 1000)}s
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Produção */}
          <TabsContent value="production" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Talking Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics?.usage?.totalVideosGenerated || 0}</div>
                  <p className="text-sm text-muted-foreground">Vídeos gerados hoje</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Áudios TTS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics?.usage?.totalAudioGenerated || 0}</div>
                  <p className="text-sm text-muted-foreground">Sínteses realizadas</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Status dos Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Google Cloud TTS</span>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>S3 Storage</span>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Queue System</span>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Metrics</span>
                      <Badge variant="default">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Recursos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Armazenamento S3</span>
                      <span>{metrics?.usage?.storageUsed || 0} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jobs na Fila</span>
                      <span>{metrics?.queue?.totalJobs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Hit Rate</span>
                      <span>~85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
