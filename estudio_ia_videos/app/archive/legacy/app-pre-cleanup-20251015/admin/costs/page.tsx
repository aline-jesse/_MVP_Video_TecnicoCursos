
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  RefreshCw,
  Lightbulb,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CostsDashboardPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/growth/costs')
      const result = await response.json()
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching cost data:', error)
      toast.error('Erro ao carregar dados de custos')
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const { costs, revenue, profitability, optimizations, projections } = data

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Custos & Receita</h1>
          <p className="text-gray-600">
            Monitoramento financeiro e otimização de custos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Receita Bruta</span>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              R$ {revenue.netRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">este mês</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Custos Totais</span>
              <DollarSign className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              R$ {costs.totalCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">este mês</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Lucro Bruto</span>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              R$ {profitability.grossProfit.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>{profitability.profitMargin.toFixed(1)}% margem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">LTV:CAC</span>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold mb-1">
              {profitability.ltvCacRatio.toFixed(1)}x
            </div>
            <Badge
              variant={profitability.ltvCacRatio >= 3 ? 'default' : 'destructive'}
            >
              {profitability.ltvCacRatio >= 3 ? 'Saudável' : 'Atenção'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Text-to-Speech</span>
                  <span className="text-lg font-bold">
                    R$ {costs.ttsCost.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${(costs.ttsCost / costs.totalCost) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {costs.ttsMinutes.toFixed(0)} minutos
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Renderização</span>
                  <span className="text-lg font-bold">
                    R$ {costs.renderCost.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600"
                    style={{
                      width: `${(costs.renderCost / costs.totalCost) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {costs.renderMinutes.toFixed(0)} minutos
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Storage (S3)</span>
                  <span className="text-lg font-bold">
                    R$ {costs.storageCost.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600"
                    style={{
                      width: `${(costs.storageCost / costs.totalCost) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(costs.storageMB / 1024).toFixed(2)} GB
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">API Calls</span>
                  <span className="text-lg font-bold">
                    R$ {costs.apiCost.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600"
                    style={{
                      width: `${(costs.apiCost / costs.totalCost) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {costs.apiCalls.toLocaleString()} chamadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profitability Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Customer LTV</span>
                  <span className="text-2xl font-bold">
                    R$ {profitability.ltv.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Valor médio do ciclo de vida do cliente
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Customer CAC</span>
                  <span className="text-2xl font-bold">
                    R$ {profitability.cac.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Custo de aquisição por cliente
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Payback Period</span>
                  <span className="text-2xl font-bold">
                    {profitability.paybackPeriodMonths.toFixed(1)} meses
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Tempo para recuperar investimento em CAC
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Margem de Lucro</span>
                  <Badge
                    variant={
                      profitability.profitMargin >= 30
                        ? 'default'
                        : profitability.profitMargin >= 15
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {profitability.profitMargin.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Optimizations */}
      {optimizations.length > 0 && (
        <Card className="mb-8 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              Oportunidades de Otimização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizations.map((opt: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-blue-900">{opt.area}</h4>
                      <p className="text-sm text-gray-700 mt-1">
                        {opt.recommendation}
                      </p>
                    </div>
                    <Badge className="bg-green-500">
                      R$ {opt.potentialSavings.toFixed(0)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Custos (6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {projections.slice(0, 6).map((proj: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">
                  Mês {idx + 1}
                </span>
                <span className="text-lg font-bold">
                  R$ {proj.totalCost.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
