
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Users, PlayCircle, Download, Clock,
  Eye, Target, Award, AlertCircle, CheckCircle, BarChart3
} from 'lucide-react'
import { format, subDays, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mock data for real analytics - In production, this would come from APIs
const generateMockAnalytics = () => {
  const today = new Date()
  
  // Project analytics data
  const projectsData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(today, 29 - i), 'dd/MM', { locale: ptBR }),
    projetos: Math.floor(Math.random() * 15) + 5,
    videos: Math.floor(Math.random() * 25) + 10,
    visualizacoes: Math.floor(Math.random() * 500) + 200,
  }))

  // NR Compliance data
  const complianceData = [
    { nr: 'NR-12', projetos: 145, aprovados: 138, taxa: 95.2 },
    { nr: 'NR-33', projetos: 89, aprovados: 82, taxa: 92.1 },
    { nr: 'NR-35', projetos: 156, aprovados: 149, taxa: 95.5 },
    { nr: 'NR-06', projetos: 67, aprovados: 61, taxa: 91.0 },
    { nr: 'NR-17', projetos: 78, aprovados: 72, taxa: 92.3 },
  ]

  // User engagement data
  const engagementData = [
    { periodo: 'Jan', usuarios: 1245, sessoes: 3467, tempo: 18.5 },
    { periodo: 'Fev', usuarios: 1389, sessoes: 4123, tempo: 22.1 },
    { periodo: 'Mar', usuarios: 1567, sessoes: 4892, tempo: 25.8 },
    { periodo: 'Abr', usuarios: 1834, sessoes: 5634, tempo: 28.3 },
    { periodo: 'Mai', usuarios: 2156, sessoes: 6789, tempo: 31.2 },
    { periodo: 'Jun', usuarios: 2398, sessoes: 7456, tempo: 33.8 },
  ]

  // Content performance
  const contentData = [
    { tipo: 'Templates NR', total: 89, views: 15678, downloads: 4567 },
    { tipo: 'Vídeos Produzidos', total: 234, views: 45890, downloads: 12345 },
    { tipo: 'Áudios TTS', total: 456, views: 23456, downloads: 8901 },
    { tipo: 'Avatares 3D', total: 67, views: 34567, downloads: 5678 },
  ]

  return {
    projectsData,
    complianceData,
    engagementData,
    contentData
  }
}

export default function BusinessIntelligenceDashboard() {
  const [analytics, setAnalytics] = useState(generateMockAnalytics())
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Real-time metrics (simulated)
  const realTimeMetrics = {
    activeUsers: 1847,
    videosRendering: 23,
    totalProjects: 892,
    completionRate: 94.7,
    avgRenderTime: 2.3,
    storageUsed: 89.2
  }

  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setAnalytics(generateMockAnalytics())
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Business Intelligence
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Analytics avançado e insights em tempo real do Estúdio IA de Vídeos
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Ao Vivo</span>
            </div>
            <Button onClick={refreshData} disabled={isLoading} className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>

        {/* Real-time KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{realTimeMetrics.activeUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Projetos Total</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{realTimeMetrics.totalProjects}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
              <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.3%
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Renderizando</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{realTimeMetrics.videosRendering}</p>
                </div>
                <PlayCircle className="w-8 h-8 text-purple-500" />
              </div>
              <Badge className="mt-2 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                <Clock className="w-3 h-3 mr-1" />
                {realTimeMetrics.avgRenderTime}s/slide
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Taxa Sucesso</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{realTimeMetrics.completionRate}%</p>
                </div>
                <Award className="w-8 h-8 text-orange-500" />
              </div>
              <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Excelente
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Storage Usado</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100">{realTimeMetrics.storageUsed}%</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <Progress value={realTimeMetrics.storageUsed} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Downloads</p>
                  <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">15.7K</p>
                </div>
                <Download className="w-8 h-8 text-indigo-500" />
              </div>
              <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <TrendingUp className="w-3 h-3 mr-1" />
                +24.8%
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="compliance">Compliance NR</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
          </TabsList>

          {/* Projects Analytics */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Projetos - Últimos 30 Dias</CardTitle>
                <CardDescription>
                  Evolução de projetos, vídeos produzidos e visualizações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analytics.projectsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="projetos" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="videos" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="visualizacoes" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Analytics */}
          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance por NR</CardTitle>
                  <CardDescription>Taxa de aprovação por norma regulamentadora</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.complianceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nr" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="projetos" fill="#8884d8" name="Total Projetos" />
                      <Bar dataKey="aprovados" fill="#82ca9d" name="Aprovados" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de NRs</CardTitle>
                  <CardDescription>Distribuição de projetos por norma</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.complianceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ nr, value }) => `${nr}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="projetos"
                      >
                        {analytics.complianceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Analytics */}
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Engajamento de Usuários</CardTitle>
                <CardDescription>Métricas de usuários, sessões e tempo médio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="usuarios" fill="#8884d8" name="Usuários" />
                    <Bar yAxisId="left" dataKey="sessoes" fill="#82ca9d" name="Sessões" />
                    <Line yAxisId="right" type="monotone" dataKey="tempo" stroke="#ff7300" strokeWidth={3} name="Tempo Médio (min)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Analytics */}
          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.contentData.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.tipo}</CardTitle>
                    <CardDescription>{item.total} itens disponíveis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Visualizações</span>
                        <span className="font-semibold">{item.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Downloads</span>
                        <span className="font-semibold">{item.downloads.toLocaleString()}</span>
                      </div>
                      <Progress value={(item.downloads / item.views) * 100} className="w-full" />
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Taxa de conversão: {((item.downloads / item.views) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Dashboard em Tempo Real
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Dados atualizados automaticamente a cada 30 segundos
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-4 py-2">
                <Eye className="w-4 h-4 mr-2" />
                Sistema Monitorado 24/7
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
