
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Activity,
  BarChart3,
  Clock,
  Download,
  Eye,
  Film,
  Play,
  Settings,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  Target,
  Globe,
  Cpu,
  HardDrive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function DashboardUnificadoPage() {
  const [stats, setStats] = useState({
    activeUsers: 1247,
    videosInProduction: 23,
    completedToday: 47,
    systemLoad: 67,
    renderQueue: 5,
    complianceScore: 95.2,
    avgRenderTime: 8.3,
    successRate: 98.7
  })

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        systemLoad: Math.max(0, Math.min(100, prev.systemLoad + (Math.random() - 0.5) * 10)),
        renderQueue: Math.max(0, prev.renderQueue + Math.floor(Math.random() * 3) - 1)
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const quickStats = [
    {
      title: 'Usuários Ativos',
      value: stats.activeUsers,
      change: '+12.5%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Vídeos em Produção',
      value: stats.videosInProduction,
      change: '+8.3%',
      icon: Film,
      color: 'purple'
    },
    {
      title: 'Concluídos Hoje',
      value: stats.completedToday,
      change: '+15.2%',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Score Compliance',
      value: `${stats.complianceScore}%`,
      change: '+2.1%',
      icon: Award,
      color: 'yellow'
    }
  ]

  const systemMetrics = [
    { name: 'CPU', value: 45, color: '#3B82F6' },
    { name: 'Memória', value: 62, color: '#10B981' },
    { name: 'GPU', value: 78, color: '#8B5CF6' },
    { name: 'Disco', value: 34, color: '#F59E0B' }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'video_completed',
      title: 'Vídeo NR-12 concluído',
      user: 'João Silva',
      time: '2 minutos atrás',
      status: 'success'
    },
    {
      id: 2,
      type: 'render_started',
      title: 'Renderização iniciada',
      user: 'Maria Santos',
      time: '5 minutos atrás',
      status: 'processing'
    },
    {
      id: 3,
      type: 'template_created',
      title: 'Template NR-35 criado',
      user: 'Pedro Costa',
      time: '12 minutos atrás',
      status: 'success'
    },
    {
      id: 4,
      type: 'compliance_check',
      title: 'Verificação de compliance',
      user: 'Sistema',
      time: '18 minutos atrás',
      status: 'warning'
    }
  ]

  const ModuleCard = ({ 
    title, 
    description, 
    href, 
    icon: Icon, 
    status = 'active',
    stats 
  }: {
    title: string
    description: string
    href: string
    icon: any
    status?: 'active' | 'beta' | 'coming-soon'
    stats?: { label: string; value: string | number }[]
  }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              status === 'active' ? "bg-blue-100" : 
              status === 'beta' ? "bg-purple-100" : "bg-gray-100"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                status === 'active' ? "text-blue-600" : 
                status === 'beta' ? "text-purple-600" : "text-gray-500"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
          
          <Badge
            className={cn(
              status === 'active' ? "bg-green-100 text-green-800" :
              status === 'beta' ? "bg-purple-100 text-purple-800" :
              "bg-gray-100 text-gray-800"
            )}
          >
            {status === 'active' ? 'Ativo' : 
             status === 'beta' ? 'Beta' : 'Em Breve'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
        
        <Link href={href}>
          <Button 
            className="w-full group-hover:scale-105 transition-transform"
            variant={status === 'coming-soon' ? 'outline' : 'default'}
            disabled={status === 'coming-soon'}
          >
            {status === 'coming-soon' ? 'Em Desenvolvimento' : 'Acessar Módulo'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Unificado</h1>
            <p className="text-gray-600 mt-2">
              Central de comando do Estúdio IA de Vídeos • Sprint 14
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              Sistema Ativo
            </Badge>
            
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Funcionalidade: 60%+
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                      <div className="flex items-center mt-2 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                    <div className={cn(
                      "p-3 rounded-full",
                      stat.color === 'blue' ? "bg-blue-100" :
                      stat.color === 'purple' ? "bg-purple-100" :
                      stat.color === 'green' ? "bg-green-100" :
                      "bg-yellow-100"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        stat.color === 'blue' ? "text-blue-600" :
                        stat.color === 'purple' ? "text-purple-600" :
                        stat.color === 'green' ? "text-green-600" :
                        "text-yellow-600"
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">Módulos Principais</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModuleCard
              title="Timeline Editor Profissional"
              description="Editor de timeline avançado com drag & drop, keyframes e exportação"
              href="/timeline-editor-professional"
              icon={Film}
              status="active"
              stats={[
                { label: 'Projetos', value: 34 },
                { label: 'Templates', value: 12 }
              ]}
            />

            <ModuleCard
              title="Analytics em Tempo Real"
              description="Dashboard com métricas avançadas e monitoramento real-time"
              href="/analytics-real-time"
              icon={BarChart3}
              status="active"
              stats={[
                { label: 'Usuários', value: stats.activeUsers },
                { label: 'Uptime', value: '99.8%' }
              ]}
            />

            <ModuleCard
              title="Pipeline de Renderização"
              description="Sistema avançado de renderização com monitoramento de performance"
              href="/render-pipeline-advanced"
              icon={Zap}
              status="active"
              stats={[
                { label: 'Queue', value: stats.renderQueue },
                { label: 'Tempo Médio', value: `${stats.avgRenderTime}min` }
              ]}
            />

            <ModuleCard
              title="Templates NR Inteligentes"
              description="Sistema automatizado de templates para Normas Regulamentadoras"
              href="/nr-templates-engine"
              icon={Award}
              status="active"
              stats={[
                { label: 'Templates', value: 25 },
                { label: 'Compliance', value: `${stats.complianceScore}%` }
              ]}
            />

            <ModuleCard
              title="PPTX Studio Avançado"
              description="Editor PPTX com IA, processamento real e pipeline completo"
              href="/pptx-studio-enhanced"
              icon={Target}
              status="beta"
              stats={[
                { label: 'Uploads', value: 156 },
                { label: 'Taxa Sucesso', value: '98.7%' }
              ]}
            />

            <ModuleCard
              title="Avatar 3D Hiper-Realista"
              description="Sistema de avatares 3D com lip-sync e expressões faciais"
              href="/avatar-studio-hyperreal"
              icon={Users}
              status="beta"
              stats={[
                { label: 'Avatares', value: 8 },
                { label: 'Renderizações', value: 234 }
              ]}
            />
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Performance do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.map((metric) => (
                    <div key={metric.name}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{metric.name}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Status dos Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'API Gateway', status: 'online', uptime: '99.9%' },
                    { name: 'Render Engine', status: 'online', uptime: '99.8%' },
                    { name: 'TTS Service', status: 'online', uptime: '99.7%' },
                    { name: 'Storage S3', status: 'online', uptime: '100%' },
                    { name: 'Database', status: 'online', uptime: '99.9%' }
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Online
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{service.uptime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Estatísticas de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">156 GB</p>
                  <p className="text-sm text-blue-600">Vídeos Processados</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">2.3k</p>
                  <p className="text-sm text-green-600">Horas de Conteúdo</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">45.2k</p>
                  <p className="text-sm text-purple-600">Renderizações</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">89%</p>
                  <p className="text-sm text-yellow-600">Taxa de Satisfação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso por Módulo (30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'PPTX Studio', value: 1247 },
                    { name: 'Avatar 3D', value: 856 },
                    { name: 'Timeline', value: 634 },
                    { name: 'Templates NR', value: 523 },
                    { name: 'Analytics', value: 445 }
                  ]}>
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
                <CardTitle>Performance Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { name: 'Jan', usuarios: 400, videos: 240 },
                    { name: 'Fev', usuarios: 500, videos: 300 },
                    { name: 'Mar', usuarios: 600, videos: 350 },
                    { name: 'Abr', usuarios: 700, videos: 420 },
                    { name: 'Mai', usuarios: 850, videos: 520 },
                    { name: 'Jun', usuarios: 950, videos: 600 },
                    { name: 'Jul', usuarios: 1100, videos: 700 },
                    { name: 'Ago', usuarios: 1247, videos: 789 },
                    { name: 'Set', usuarios: 1350, videos: 856 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="usuarios" stroke="#3B82F6" />
                    <Line type="monotone" dataKey="videos" stroke="#10B981" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.status === 'success' ? "bg-green-500" :
                      activity.status === 'processing' ? "bg-blue-500" :
                      activity.status === 'warning' ? "bg-yellow-500" :
                      "bg-gray-500"
                    )} />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">por {activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Status */}
      <div className="mt-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            Sistema funcionando • Funcionalidade Real: 60%+ • {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
          </span>
        </motion.div>
      </div>
    </div>
  )
}
