
'use client'

/**
 * 📊 ANALYTICS REAL - Sprint 48
 * Dashboard com dados REAIS da API (não mock)
 */

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Activity, 
  Upload, 
  Video, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface MetricsData {
  period: string
  metrics: {
    totalUploads: number
    totalRenders: number
    totalDownloads: number
    conversionRate: number
    avgRenderTime: number | null
  }
  renderJobs: Array<{
    status: string
    count: number
  }>
  recentProjects: Array<{
    id: string
    name: string
    status: string
    createdAt: string
    videoUrl: string | null
  }>
  eventsByDay: any[]
}

export default function RealTimeAnalyticsReal() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  
  const { data, error, isLoading, mutate } = useSWR<MetricsData>(
    `/api/analytics/metrics?period=${period}`,
    fetcher,
    {
      refreshInterval: 30000, // Atualiza a cada 30s
      revalidateOnFocus: true
    }
  )

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Erro ao carregar analytics
          </CardTitle>
          <CardDescription>
            {error.message || 'Ocorreu um erro ao buscar os dados'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando analytics...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const { metrics, renderJobs, recentProjects } = data

  // Status dos renders
  const renderStats = renderJobs.reduce((acc, job) => {
    acc[job.status] = job.count
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header com período */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Real</h1>
          <p className="text-muted-foreground">
            Dados reais dos últimos {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : '90 dias'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={period === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('7d')}
          >
            7 dias
          </Button>
          <Button
            variant={period === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('30d')}
          >
            30 dias
          </Button>
          <Button
            variant={period === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('90d')}
          >
            90 dias
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => mutate()}
          >
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uploads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Uploads
            </CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              Arquivos PPTX enviados
            </p>
          </CardContent>
        </Card>

        {/* Renders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vídeos Gerados
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRenders}</div>
            <p className="text-xs text-muted-foreground">
              Renders completados
            </p>
          </CardContent>
        </Card>

        {/* Taxa de conversão */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Uploads → Renders
            </p>
          </CardContent>
        </Card>

        {/* Tempo médio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo Médio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgRenderTime 
                ? `${metrics.avgRenderTime}s` 
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo de render
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com detalhes */}
      <Tabs defaultValue="renders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="renders">Status de Renders</TabsTrigger>
          <TabsTrigger value="projects">Projetos Recentes</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        {/* Tab: Status de Renders */}
        <TabsContent value="renders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Render Jobs</CardTitle>
              <CardDescription>
                Estado atual dos trabalhos de renderização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum render job encontrado no período
                  </p>
                ) : (
                  renderJobs.map(job => (
                    <div
                      key={job.status}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {job.status === 'completed' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {job.status === 'processing' && (
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        )}
                        {job.status === 'queued' && (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        {job.status === 'error' && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        
                        <div>
                          <p className="font-medium capitalize">{job.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.count} {job.count === 1 ? 'job' : 'jobs'}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {job.count}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Projetos Recentes */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projetos Recentes</CardTitle>
              <CardDescription>
                Últimos 5 projetos criados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum projeto encontrado no período
                  </p>
                ) : (
                  recentProjects.map(project => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <Badge variant={
                        project.status === 'COMPLETED' ? 'default' :
                        project.status === 'ERROR' ? 'destructive' :
                        project.status === 'PROCESSING' ? 'secondary' :
                        'outline'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Downloads */}
        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Downloads de Vídeos</CardTitle>
              <CardDescription>
                Total de downloads realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-3xl font-bold mb-2">{metrics.totalDownloads}</p>
                <p className="text-sm text-muted-foreground">
                  downloads no período
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            ✅ Dados REAIS do banco de dados • Atualização automática a cada 30 segundos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
