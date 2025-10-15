
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function GrowthDashboardPage() {
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState({
    retention: {
      d1: 68,
      d7: 42,
      d30: 28,
      trend: 'improving' as const,
    },
    nps: {
      score: 52,
      promoters: 45,
      passives: 22,
      detractors: 8,
      trend: 'stable' as const,
    },
    revenue: {
      mrr: 45000,
      growth: 12.5,
      churnRate: 3.2,
      ltv: 2400,
      cac: 450,
    },
    users: {
      total: 1250,
      new: 85,
      active: 920,
      atRisk: 42,
    },
  })

  const refreshData = async () => {
    setLoading(true)
    try {
      // Simular fetch de dados
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Dados atualizados!')
    } catch (error) {
      toast.error('Erro ao atualizar dados')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    toast.success('Relatório exportado!')
    // Implementar exportação real
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Growth</h1>
          <p className="text-gray-600">
            Métricas de retenção, engajamento e receita em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">MRR</span>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              R$ {metrics.revenue.mrr.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+{metrics.revenue.growth}% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Usuários Ativos</span>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {metrics.users.active.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              de {metrics.users.total.toLocaleString()} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">NPS Score</span>
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold mb-1">{metrics.nps.score}</div>
            <Badge
              variant={
                metrics.nps.score >= 50
                  ? 'default'
                  : metrics.nps.score >= 0
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {metrics.nps.score >= 50 ? 'Excelente' : 'Bom'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">LTV:CAC</span>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {(metrics.revenue.ltv / metrics.revenue.cac).toFixed(1)}x
            </div>
            <div className="text-sm text-gray-600">
              LTV: R$ {metrics.revenue.ltv} / CAC: R$ {metrics.revenue.cac}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention Cohorts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Retenção por Cohort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">D1 Retention</span>
                  <span className="text-lg font-bold">{metrics.retention.d1}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${metrics.retention.d1}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">D7 Retention</span>
                  <span className="text-lg font-bold">{metrics.retention.d7}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600"
                    style={{ width: `${metrics.retention.d7}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">D30 Retention</span>
                  <span className="text-lg font-bold">{metrics.retention.d30}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{ width: `${metrics.retention.d30}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">
                    Trend: <strong className="text-green-600">Improving</strong>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NPS Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Promoters (9-10)</span>
                  <span className="text-lg font-bold text-green-600">
                    {metrics.nps.promoters}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{ width: `${metrics.nps.promoters}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Passives (7-8)</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {metrics.nps.passives}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${metrics.nps.passives}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Detractors (0-6)</span>
                  <span className="text-lg font-bold text-red-600">
                    {metrics.nps.detractors}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${metrics.nps.detractors}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{metrics.nps.score}</div>
                  <div className="text-sm text-gray-600">Net Promoter Score</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Users Alert */}
      {metrics.users.atRisk > 0 && (
        <Card className="border-orange-500 bg-orange-50 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-orange-900 mb-1">
                  {metrics.users.atRisk} Usuários em Risco de Churn
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  Estes usuários não estão ativos há mais de 7 dias e podem estar em risco
                  de cancelamento.
                </p>
                <Button size="sm" variant="outline" className="border-orange-600 text-orange-600">
                  Ver Detalhes e Ações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Uso de Features Principais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Renderização de Vídeos', usage: 85, impact: 'high' },
              { name: 'Text-to-Speech', usage: 72, impact: 'high' },
              { name: 'Avatares 3D', usage: 58, impact: 'medium' },
              { name: 'Colaboração', usage: 34, impact: 'low' },
              { name: 'Templates NR', usage: 91, impact: 'high' },
            ].map((feature) => (
              <div key={feature.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{feature.name}</span>
                    <Badge
                      variant={
                        feature.impact === 'high'
                          ? 'default'
                          : feature.impact === 'medium'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {feature.impact === 'high'
                        ? 'Alto Impacto'
                        : feature.impact === 'medium'
                        ? 'Médio Impacto'
                        : 'Baixo Impacto'}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold">{feature.usage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      feature.impact === 'high'
                        ? 'bg-green-600'
                        : feature.impact === 'medium'
                        ? 'bg-blue-600'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
