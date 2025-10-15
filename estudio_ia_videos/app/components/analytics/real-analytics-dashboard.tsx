
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import Plot from 'react-plotly.js'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  PlayCircle, 
  Download, 
  Eye,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Target,
  Award,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink,
  BarChart3,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AnalyticsData {
  // User Engagement
  activeUsers: number
  totalSessions: number
  avgSessionDuration: number
  bounceRate: number
  pageViews: number
  
  // Video Analytics
  videosCreated: number
  videosCompleted: number
  totalWatchTime: number
  avgCompletionRate: number
  
  // System Performance
  renderTime: number
  uploadSuccess: number
  errorRate: number
  systemUptime: number
  
  // Business Metrics
  conversionRate: number
  nrComplianceScore: number
  userSatisfaction: number
  revenueImpact: number
}

interface TimeSeriesData {
  timestamp: string
  value: number
  category: string
}

interface UserBehaviorData {
  page: string
  sessions: number
  avgDuration: number
  bounceRate: number
  conversionRate: number
}

export default function RealAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    activeUsers: 1247,
    totalSessions: 3456,
    avgSessionDuration: 8.5,
    bounceRate: 23.4,
    pageViews: 12834,
    videosCreated: 567,
    videosCompleted: 489,
    totalWatchTime: 45230,
    avgCompletionRate: 86.2,
    renderTime: 2.3,
    uploadSuccess: 98.7,
    errorRate: 1.3,
    systemUptime: 99.8,
    conversionRate: 12.4,
    nrComplianceScore: 94.5,
    userSatisfaction: 4.7,
    revenueImpact: 125000
  })

  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState<string>('engagement')

  // Generate real-time mock data
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        totalSessions: prev.totalSessions + Math.floor(Math.random() * 20),
        pageViews: prev.pageViews + Math.floor(Math.random() * 50),
        systemUptime: Math.min(99.99, prev.systemUptime + (Math.random() * 0.01))
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Time series data for charts
  const timeSeriesData = useMemo(() => {
    const data = []
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i)
      data.push({
        timestamp: format(date, 'dd/MM'),
        usuarios: Math.floor(Math.random() * 200) + 800,
        sessoes: Math.floor(Math.random() * 300) + 1000,
        videos: Math.floor(Math.random() * 50) + 100,
        tempo: Math.floor(Math.random() * 60) + 30
      })
    }
    return data
  }, [dateRange])

  // User behavior data
  const userBehaviorData = useMemo(() => [
    { page: 'Dashboard', sessions: 1247, avgDuration: 4.2, bounceRate: 15.3, conversionRate: 23.1 },
    { page: 'PPTX Studio', sessions: 856, avgDuration: 12.7, bounceRate: 8.2, conversionRate: 67.4 },
    { page: 'Avatar Studio', sessions: 634, avgDuration: 8.9, bounceRate: 12.1, conversionRate: 45.2 },
    { page: 'Templates NR', sessions: 523, avgDuration: 6.3, bounceRate: 18.7, conversionRate: 34.6 },
    { page: 'Timeline Editor', sessions: 445, avgDuration: 15.4, bounceRate: 5.9, conversionRate: 78.3 }
  ], [])

  // Performance metrics data
  const performanceData = useMemo(() => [
    { name: 'Upload Success', value: analyticsData.uploadSuccess, color: '#10B981' },
    { name: 'Render Speed', value: 100 - (analyticsData.renderTime * 10), color: '#3B82F6' },
    { name: 'System Uptime', value: analyticsData.systemUptime, color: '#8B5CF6' },
    { name: 'User Satisfaction', value: analyticsData.userSatisfaction * 20, color: '#F59E0B' }
  ], [analyticsData])

  // NR Compliance breakdown
  const nrComplianceData = useMemo(() => [
    { name: 'NR-12', compliance: 96.2, issues: 3, color: '#10B981' },
    { name: 'NR-33', compliance: 94.8, issues: 5, color: '#3B82F6' },
    { name: 'NR-35', compliance: 92.1, issues: 8, color: '#F59E0B' },
    { name: 'NR-10', compliance: 98.7, issues: 1, color: '#8B5CF6' },
    { name: 'NR-06', compliance: 91.3, issues: 9, color: '#EF4444' }
  ], [])

  const refreshData = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update with new mock data
    setAnalyticsData(prev => ({
      ...prev,
      activeUsers: Math.floor(Math.random() * 500) + 1000,
      totalSessions: Math.floor(Math.random() * 1000) + 3000,
      videosCreated: Math.floor(Math.random() * 200) + 500
    }))
    
    setLoading(false)
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number',
    color = 'blue' 
  }: {
    title: string
    value: number
    change?: number
    icon: any
    format?: 'number' | 'percent' | 'time' | 'currency'
    color?: string
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'percent': return `${val.toFixed(1)}%`
        case 'time': return `${val.toFixed(1)}min`
        case 'currency': return `R$ ${val.toLocaleString('pt-BR')}`
        default: return val.toLocaleString('pt-BR')
      }
    }

    const isPositive = change ? change > 0 : true
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200'
    }

    return (
      <Card className={cn('transition-all duration-200 hover:scale-105', colorClasses[color as keyof typeof colorClasses])}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-70">{title}</p>
              <p className="text-2xl font-bold mt-2">{formatValue(value)}</p>
              {change !== undefined && (
                <div className={cn(
                  "flex items-center mt-2 text-sm",
                  isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-white/50">
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Real-Time</h1>
            <p className="text-gray-600 mt-2">
              Dashboard avançado com métricas em tempo real do Estúdio IA de Vídeos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              Tempo Real
            </Badge>
            
            <Button 
              variant="outline" 
              onClick={refreshData} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Atualizar
            </Button>
            
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              Relatório Completo
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Usuários Ativos"
          value={analyticsData.activeUsers}
          change={12.5}
          icon={Users}
          color="blue"
        />
        
        <MetricCard
          title="Vídeos Criados"
          value={analyticsData.videosCreated}
          change={8.3}
          icon={PlayCircle}
          color="green"
        />
        
        <MetricCard
          title="Taxa de Conclusão"
          value={analyticsData.avgCompletionRate}
          change={5.2}
          icon={CheckCircle}
          format="percent"
          color="purple"
        />
        
        <MetricCard
          title="Compliance NR"
          value={analyticsData.nrComplianceScore}
          change={2.1}
          icon={Award}
          format="percent"
          color="yellow"
        />
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance NR</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Usuários e Sessões (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}`,
                        name === 'usuarios' ? 'Usuários' : 'Sessões'
                      ]}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="usuarios"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessoes"
                      stackId="2"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Produção de Vídeos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Vídeos']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="videos"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Taxa de Rejeição"
              value={analyticsData.bounceRate}
              change={-3.2}
              icon={TrendingDown}
              format="percent"
              color="green"
            />
            
            <MetricCard
              title="Tempo Médio de Sessão"
              value={analyticsData.avgSessionDuration}
              change={15.8}
              icon={Clock}
              format="time"
              color="blue"
            />
            
            <MetricCard
              title="Visualizações de Página"
              value={analyticsData.pageViews}
              change={22.1}
              icon={Eye}
              color="purple"
            />
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Performance']} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Métricas Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tempo de Renderização</span>
                    <span>{analyticsData.renderTime}s</span>
                  </div>
                  <Progress value={100 - (analyticsData.renderTime * 20)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sucesso no Upload</span>
                    <span>{analyticsData.uploadSuccess}%</span>
                  </div>
                  <Progress value={analyticsData.uploadSuccess} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uptime do Sistema</span>
                    <span>{analyticsData.systemUptime}%</span>
                  </div>
                  <Progress value={analyticsData.systemUptime} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Taxa de Erro</span>
                    <span>{analyticsData.errorRate}%</span>
                  </div>
                  <Progress 
                    value={100 - analyticsData.errorRate * 10} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Tempo de Render"
              value={analyticsData.renderTime}
              change={-12.3}
              icon={Zap}
              format="time"
              color="green"
            />
            
            <MetricCard
              title="Uptime Sistema"
              value={analyticsData.systemUptime}
              change={0.2}
              icon={CheckCircle}
              format="percent"
              color="blue"
            />
            
            <MetricCard
              title="Sucesso Upload"
              value={analyticsData.uploadSuccess}
              change={1.8}
              icon={Download}
              format="percent"
              color="purple"
            />
            
            <MetricCard
              title="Taxa de Erro"
              value={analyticsData.errorRate}
              change={-8.4}
              icon={AlertTriangle}
              format="percent"
              color="red"
            />
          </div>
        </TabsContent>

        {/* Compliance NR Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Score de Compliance por NR
              </CardTitle>
              <CardDescription>
                Análise detalhada do cumprimento das Normas Regulamentadoras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nrComplianceData.map((nr) => (
                  <div key={nr.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{nr.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={nr.compliance > 95 ? "default" : nr.compliance > 90 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {nr.compliance}%
                        </Badge>
                        {nr.issues > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {nr.issues} issues
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={nr.compliance} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Score Médio NR"
              value={analyticsData.nrComplianceScore}
              change={2.3}
              icon={Award}
              format="percent"
              color="green"
            />
            
            <MetricCard
              title="Templates Ativos"
              value={25}
              change={8.7}
              icon={CheckCircle}
              color="blue"
            />
            
            <MetricCard
              title="Issues Resolvidas"
              value={47}
              change={23.1}
              icon={Target}
              color="purple"
            />
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="w-5 h-5" />
                Comportamento por Página
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {userBehaviorData.map((page) => (
                    <div key={page.page} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{page.page}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Sessões</span>
                          <p className="font-semibold text-lg">{page.sessions}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duração</span>
                          <p className="font-semibold text-lg">{page.avgDuration}min</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Bounce Rate</span>
                          <p className="font-semibold text-lg">{page.bounceRate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversão</span>
                          <p className="font-semibold text-lg">{page.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Taxa de Conversão"
              value={analyticsData.conversionRate}
              change={5.8}
              icon={Target}
              format="percent"
              color="green"
            />
            
            <MetricCard
              title="Satisfação do Usuário"
              value={analyticsData.userSatisfaction}
              change={3.2}
              icon={Star}
              format="number"
              color="yellow"
            />
            
            <MetricCard
              title="Impacto na Receita"
              value={analyticsData.revenueImpact}
              change={18.5}
              icon={TrendingUp}
              format="currency"
              color="blue"
            />
            
            <MetricCard
              title="ROI Treinamentos"
              value={34.7}
              change={12.1}
              icon={Award}
              format="percent"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Setor</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Construção Civil', value: 35, color: '#3B82F6' },
                        { name: 'Indústria', value: 28, color: '#10B981' },
                        { name: 'Serviços', value: 20, color: '#F59E0B' },
                        { name: 'Saúde', value: 12, color: '#8B5CF6' },
                        { name: 'Outros', value: 5, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Construção Civil', value: 35, color: '#3B82F6' },
                        { name: 'Indústria', value: 28, color: '#10B981' },
                        { name: 'Serviços', value: 20, color: '#F59E0B' },
                        { name: 'Saúde', value: 12, color: '#8B5CF6' },
                        { name: 'Outros', value: 5, color: '#EF4444' }
                      ].map((entry, index) => (
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
                <CardTitle>Métricas de Negócio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customer Lifetime Value</span>
                    <Badge className="bg-green-100 text-green-800">R$ 2.847</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Custo de Aquisição</span>
                    <Badge className="bg-blue-100 text-blue-800">R$ 147</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Churn Rate</span>
                    <Badge className="bg-yellow-100 text-yellow-800">2.3%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Recurring Revenue</span>
                    <Badge className="bg-purple-100 text-purple-800">R$ 89.450</Badge>
                  </div>

                  <Separator />
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      +127% ROI
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Comparado ao período anterior
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Real-time Status */}
      <div className="mt-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            Dashboard atualizado em tempo real • {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
          </span>
        </motion.div>
      </div>
    </div>
  )
}
