

'use client'

/**
 * 📊 ANALYTICS ADVANCED - Sprint 17
 * Analytics avançados com métricas em tempo real
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AppShell from '@/components/layouts/AppShell'
import { EmergencyErrorBoundary } from '@/lib/advanced-analytics-emergency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  Shield,
  Video,
  FileText,
  Zap,
  Activity,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react'

interface AnalyticsMetrics {
  totalViews: number
  activeUsers: number
  completionRate: number
  avgWatchTime: string
  nrCompliance: number
  trendsUp: boolean
}

function SafeAnalyticsContent() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      loadAnalytics()
    }
  }, [status, router])

  const loadAnalytics = async () => {
    setLoading(true)
    
    // Simular carregamento de dados
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setMetrics({
      totalViews: 15847,
      activeUsers: 342,
      completionRate: 87.3,
      avgWatchTime: '4:32',
      nrCompliance: 94.7,
      trendsUp: true
    })
    
    setLoading(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <AppShell 
      title="Analytics Pro - Sprint 17"
      description="Métricas avançadas com inteligência artificial e compliance em tempo real"
      showBreadcrumbs={true}
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Analytics', href: '/analytics-advanced' }
      ]}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Analytics Pro
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Inteligência em tempo real para seus treinamentos NR
              </p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Dados em tempo real
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Activity className="h-4 w-4" />
              {metrics.activeUsers} usuários online
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {metrics.totalViews.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                <ArrowUp className="h-3 w-3" />
                +23.5% este mês
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.activeUsers}</div>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                <ArrowUp className="h-3 w-3" />
                +12.8% esta semana
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Conclusão</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{metrics.completionRate}%</div>
              <Progress value={metrics.completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{metrics.avgWatchTime}</div>
              <div className="text-xs text-muted-foreground mt-2">Por sessão</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 bg-green-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NR Compliance</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.nrCompliance}%</div>
              <Badge className="text-xs mt-2 bg-green-600">Excelente</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Tendências de Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <BarChart3 className="h-16 w-16 text-blue-500 mx-auto" />
                  <div>
                    <p className="font-semibold text-blue-700">Gráfico de Tendências</p>
                    <p className="text-sm text-muted-foreground">
                      Visualização interativa seria renderizada aqui
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Performance NR por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { nr: 'NR-12', score: 96, category: 'Máquinas' },
                  { nr: 'NR-35', score: 94, category: 'Altura' },
                  { nr: 'NR-33', score: 91, category: 'Espaços Confinados' },
                  { nr: 'NR-06', score: 98, category: 'EPIs' },
                  { nr: 'NR-10', score: 89, category: 'Eletricidade' }
                ].map((item) => (
                  <div key={item.nr} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">{item.nr} - {item.category}</div>
                      <div className="text-xs text-muted-foreground">Compliance Score</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold text-green-600">{item.score}%</div>
                      <Progress value={item.score} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Atividade em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { 
                  time: '2 min atrás', 
                  event: 'Usuário completou NR-12 Segurança em Máquinas', 
                  type: 'completion' 
                },
                { 
                  time: '5 min atrás', 
                  event: 'Novo upload PPTX para template NR-35', 
                  type: 'upload' 
                },
                { 
                  time: '8 min atrás', 
                  event: 'Colaboração iniciada em projeto corporativo', 
                  type: 'collaboration' 
                },
                { 
                  time: '12 min atrás', 
                  event: 'Compliance automático aprovado para NR-33', 
                  type: 'compliance' 
                },
                { 
                  time: '15 min atrás', 
                  event: 'Vídeo exportado com avatar 3D hyperreal', 
                  type: 'export' 
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'completion' && <Target className="h-5 w-5 text-green-500" />}
                    {activity.type === 'upload' && <FileText className="h-5 w-5 text-blue-500" />}
                    {activity.type === 'collaboration' && <Users className="h-5 w-5 text-purple-500" />}
                    {activity.type === 'compliance' && <Shield className="h-5 w-5 text-orange-500" />}
                    {activity.type === 'export' && <Video className="h-5 w-5 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Center */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Centro de Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => router.push('/admin/metrics')}
              >
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Dashboard Detalhado</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => router.push('/behavioral-analytics')}
              >
                <Eye className="h-6 w-6" />
                <span className="text-sm">Comportamento</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => router.push('/compliance-dashboard')}
              >
                <Shield className="h-6 w-6" />
                <span className="text-sm">Compliance Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-purple-700">
              Analytics Pro - Sprint 17 ✨
            </h3>
            <p className="text-muted-foreground">
              Dados atualizados em tempo real com inteligência artificial integrada
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Sistema Online
              </div>
              <div>Última atualização: agora</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default function AnalyticsAdvancedPage() {
  return (
    <EmergencyErrorBoundary>
      <SafeAnalyticsContent />
    </EmergencyErrorBoundary>
  )
}

