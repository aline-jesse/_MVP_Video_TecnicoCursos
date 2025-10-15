

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Video,
  Zap,
  Users,
  Calendar,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  performance: {
    daily_renders: Array<{ date: string, count: number, success_rate: number }>
    cost_analysis: Array<{ date: string, cost: number, renders: number }>
    quality_metrics: Array<{ date: string, avg_quality: number, satisfaction: number }>
  }
  usage: {
    by_user: Array<{ user: string, renders: number, cost: number }>
    by_project_type: Array<{ type: string, count: number, percentage: number }>
    by_resolution: Array<{ resolution: string, count: number, cost: number }>
  }
  system: {
    resource_usage: Array<{ time: string, cpu: number, gpu: number, memory: number }>
    queue_performance: Array<{ hour: number, avg_wait: number, throughput: number }>
    error_analysis: Array<{ type: string, count: number, impact: string }>
  }
}

export default function RenderAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        performance: {
          daily_renders: [
            { date: '2024-08-25', count: 23, success_rate: 0.96 },
            { date: '2024-08-26', count: 31, success_rate: 0.94 },
            { date: '2024-08-27', count: 28, success_rate: 0.98 },
            { date: '2024-08-28', count: 35, success_rate: 0.97 },
            { date: '2024-08-29', count: 42, success_rate: 0.95 },
            { date: '2024-08-30', count: 38, success_rate: 0.99 },
            { date: '2024-08-31', count: 47, success_rate: 0.97 }
          ],
          cost_analysis: [
            { date: '2024-08-25', cost: 5.67, renders: 23 },
            { date: '2024-08-26', cost: 7.12, renders: 31 },
            { date: '2024-08-27', cost: 6.23, renders: 28 },
            { date: '2024-08-28', cost: 8.45, renders: 35 },
            { date: '2024-08-29', cost: 9.78, renders: 42 },
            { date: '2024-08-30', cost: 8.91, renders: 38 },
            { date: '2024-08-31', cost: 12.85, renders: 47 }
          ],
          quality_metrics: [
            { date: '2024-08-25', avg_quality: 0.89, satisfaction: 0.92 },
            { date: '2024-08-26', avg_quality: 0.91, satisfaction: 0.94 },
            { date: '2024-08-27', avg_quality: 0.94, satisfaction: 0.96 },
            { date: '2024-08-28', avg_quality: 0.92, satisfaction: 0.95 },
            { date: '2024-08-29', avg_quality: 0.95, satisfaction: 0.97 },
            { date: '2024-08-30', avg_quality: 0.93, satisfaction: 0.96 },
            { date: '2024-08-31', avg_quality: 0.96, satisfaction: 0.98 }
          ]
        },
        usage: {
          by_user: [
            { user: 'Maria Silva', renders: 23, cost: 5.67 },
            { user: 'João Santos', renders: 18, cost: 4.32 },
            { user: 'Ana Costa', renders: 15, cost: 3.78 },
            { user: 'Carlos Lima', renders: 12, cost: 2.94 }
          ],
          by_project_type: [
            { type: 'NR Training', count: 35, percentage: 52 },
            { type: 'Safety Videos', count: 20, percentage: 30 },
            { type: 'Corporate', count: 12, percentage: 18 }
          ],
          by_resolution: [
            { resolution: '1080p', count: 45, cost: 8.23 },
            { resolution: '720p', count: 18, cost: 2.45 },
            { resolution: '1440p', count: 4, cost: 2.17 }
          ]
        },
        system: {
          resource_usage: [
            { time: '00:00', cpu: 25, gpu: 15, memory: 45 },
            { time: '04:00', cpu: 20, gpu: 10, memory: 42 },
            { time: '08:00', cpu: 65, gpu: 45, memory: 68 },
            { time: '12:00', cpu: 80, gpu: 60, memory: 75 },
            { time: '16:00', cpu: 70, gpu: 55, memory: 70 },
            { time: '20:00', cpu: 45, gpu: 30, memory: 55 }
          ],
          queue_performance: [
            { hour: 8, avg_wait: 15, throughput: 8 },
            { hour: 10, avg_wait: 25, throughput: 12 },
            { hour: 12, avg_wait: 35, throughput: 15 },
            { hour: 14, avg_wait: 45, throughput: 18 },
            { hour: 16, avg_wait: 30, throughput: 14 },
            { hour: 18, avg_wait: 20, throughput: 10 }
          ],
          error_analysis: [
            { type: 'Memory Overflow', count: 3, impact: 'medium' },
            { type: 'Network Timeout', count: 2, impact: 'low' },
            { type: 'Audio Processing', count: 1, impact: 'high' }
          ]
        }
      }
      
      setAnalyticsData(mockData)
      setIsLoading(false)
    }

    fetchAnalytics()
  }, [selectedPeriod])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Dados não disponíveis</h3>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Analytics de Renderização
          </h2>
          <p className="text-muted-foreground">
            Análise detalhada de performance e custos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={selectedPeriod === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('24h')}
          >
            24h
          </Button>
          <Button
            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7d')}
          >
            7 dias
          </Button>
          <Button
            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('30d')}
          >
            30 dias
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Renders</p>
                <p className="text-2xl font-bold text-blue-600">244</p>
                <p className="text-xs text-green-600">+23% vs semana anterior</p>
              </div>
              <Video className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-green-600">97.3%</p>
                <p className="text-xs text-green-600">+1.2% vs semana anterior</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-purple-600">$58.47</p>
                <p className="text-xs text-red-600">+12% vs semana anterior</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold text-orange-600">42s</p>
                <p className="text-xs text-green-600">-8s vs semana anterior</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Renders Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Renders Diários</CardTitle>
                <CardDescription>Volume de renderizações por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.performance.daily_renders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Success Rate Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
                <CardDescription>Tendência de qualidade ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analyticsData.performance.daily_renders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0.9, 1.0]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="success_rate" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Usage by Project Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uso por Tipo de Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.usage.by_project_type}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="type"
                    >
                      {analyticsData.usage.by_project_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="mt-4 space-y-2">
                  {analyticsData.usage.by_project_type.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span>{item.type}</span>
                      </div>
                      <span className="font-medium">{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usuários Mais Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.usage.by_user.map((user, index) => (
                    <div key={user.user} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-sm">{user.user}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.renders} renders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${user.cost.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">custo total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs">
          <div className="space-y-6">
            
            {/* Cost Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tendência de Custos</CardTitle>
                <CardDescription>Evolução dos custos de renderização</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.performance.cost_analysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Resolução</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.usage.by_resolution.map((item) => (
                      <div key={item.resolution} className="flex items-center justify-between">
                        <span className="text-sm">{item.resolution}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">${item.cost.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">{item.count} videos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">$0.24</div>
                  <div className="text-sm text-muted-foreground">Custo médio/render</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">91%</div>
                  <div className="text-sm text-muted-foreground">Eficiência de custo</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system">
          <div className="space-y-6">
            
            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uso de Recursos (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.system.resource_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU" />
                    <Line type="monotone" dataKey="gpu" stroke="#8b5cf6" name="GPU" />
                    <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memória" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Erros</CardTitle>
                <CardDescription>Tipos de erro mais frequentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.system.error_analysis.map((error, index) => (
                    <div key={error.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          error.impact === 'high' ? 'bg-red-500' :
                          error.impact === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{error.type}</p>
                          <p className="text-xs text-muted-foreground">
                            Impacto: {error.impact}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {error.count} ocorrências
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

