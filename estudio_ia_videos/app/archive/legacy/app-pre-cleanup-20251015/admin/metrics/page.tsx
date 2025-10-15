
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Activity,
  Users,
  FileVideo,
  Zap,
  AlertCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { Analytics, AnalyticsEvent } from '../../../lib/analytics'

interface KPIData {
  editorSessions: number
  pptxImports: number
  pptxSuccessRate: number
  videoRenders: number
  videoSuccessRate: number
  avgRenderTime: number
}

export default function AdminMetricsPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [kpiData, setKpiData] = useState<KPIData>({
    editorSessions: 0,
    pptxImports: 0,
    pptxSuccessRate: 0,
    videoRenders: 0,
    videoSuccessRate: 0,
    avgRenderTime: 0
  })
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7)

  // Verificar autenticação e permissão
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Carregar dados das métricas
  useEffect(() => {
    loadMetrics()
  }, [selectedPeriod])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      // Obter métricas locais
      const metrics = Analytics.getLocalMetrics(selectedPeriod)
      const kpis = Analytics.calculateKPIs(metrics)
      
      setKpiData(kpis)
      setRecentEvents(metrics.slice(-20)) // Últimos 20 eventos
      
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatEventType = (eventType: string): string => {
    const eventMap: Record<string, string> = {
      'editor_started': 'Editor Iniciado',
      'pptx_import_started': 'Import PPTX Iniciado',
      'pptx_import_completed': 'Import PPTX Concluído',
      'pptx_import_failed': 'Import PPTX Falhou',
      'video_preview_started': 'Preview Iniciado',
      'video_preview_completed': 'Preview Concluído',
      'video_render_started': 'Render Iniciado',
      'video_render_completed': 'Render Concluído',
      'video_render_failed': 'Render Falhou',
      'avatar_selected': 'Avatar Selecionado',
      'voice_selected': 'Voz Selecionada'
    }
    
    return eventMap[eventType] || eventType
  }

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('editor')) return <Users className="w-4 h-4" />
    if (eventType.includes('pptx')) return <FileVideo className="w-4 h-4" />
    if (eventType.includes('render')) return <Zap className="w-4 h-4" />
    if (eventType.includes('failed')) return <AlertCircle className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const getEventColor = (eventType: string) => {
    if (eventType.includes('completed')) return 'bg-green-100 text-green-700'
    if (eventType.includes('failed')) return 'bg-red-100 text-red-700'
    if (eventType.includes('started')) return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Carregando métricas...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Admin - Métricas</h1>
                <p className="text-sm text-gray-500">Dashboard de telemetria e KPIs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/admin/pptx-metrics')}
              >
                <FileVideo className="w-4 h-4 mr-2" />
                Métricas PPTX
              </Button>
              <Button variant="outline" size="sm" onClick={loadMetrics}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 7, 30].map((days) => (
              <Button
                key={days}
                variant={selectedPeriod === days ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(days)}
              >
                {days === 1 ? 'Último dia' : days === 7 ? 'Última semana' : 'Último mês'}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sessões do Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.editorSessions}</div>
              <p className="text-xs text-gray-500 mt-1">
                Últimos {selectedPeriod} dia(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileVideo className="w-4 h-4" />
                Importações PPTX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.pptxImports}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={kpiData.pptxSuccessRate >= 90 ? 'default' : 'destructive'}>
                  {kpiData.pptxSuccessRate.toFixed(1)}% sucesso
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Renderizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.videoRenders}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={kpiData.videoSuccessRate >= 90 ? 'default' : 'destructive'}>
                  {kpiData.videoSuccessRate.toFixed(1)}% sucesso
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tempo Médio de Render
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData.avgRenderTime.toFixed(1)}s</div>
              <p className="text-xs text-gray-500 mt-1">
                Média dos renders concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((kpiData.pptxSuccessRate + kpiData.videoSuccessRate) / 2)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Taxa de sucesso média
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Total de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentEvents.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                Eventos registrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Eventos Recentes
            </CardTitle>
            <CardDescription>
              Últimos 20 eventos de telemetria registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum evento registrado ainda
                </p>
              ) : (
                recentEvents.slice(0, 20).map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {getEventIcon(event.event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatEventType(event.event)}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={getEventColor(event.event)}
                        >
                          {event.event}
                        </Badge>
                      </div>
                      {event.properties && Object.keys(event.properties).length > 0 && (
                        <div className="mt-1 text-sm text-gray-600">
                          {Object.entries(event.properties)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <span key={key} className="mr-4">
                                {key}: {String(value)}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.timestamp || '').toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
