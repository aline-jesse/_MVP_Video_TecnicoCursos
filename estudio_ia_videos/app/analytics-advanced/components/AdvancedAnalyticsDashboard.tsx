import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, Users, Clock } from 'lucide-react'

type MetricCard = {
  label: string
  value: string
  trend: 'up' | 'down' | 'steady'
  description: string
}

const trendStyles: Record<MetricCard['trend'], string> = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  steady: 'text-sky-400',
}

const summaryMetrics: MetricCard[] = [
  {
    label: 'Engajamento',
    value: '94.2%',
    trend: 'up',
    description: 'Participa��o em treinamentos NR',
  },
  {
    label: 'Usu�rios Ativos',
    value: '1.247',
    trend: 'steady',
    description: 'Colaboradores com acesso nos �ltimos 7 dias',
  },
  {
    label: 'Tempo M�dio',
    value: '6m 18s',
    trend: 'up',
    description: 'M�dia de consumo por sess�o',
  },
  {
    label: 'Compliance NR',
    value: '97.5%',
    trend: 'up',
    description: 'Conformidade autom�tica com normas regulat�rias',
  },
]

export function AdvancedAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryMetrics.map((metric) => (
          <Card
            key={metric.label}
            className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-200"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{metric.label}</span>
                <Badge variant="outline" className="border-white/20 text-white">
                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                  {metric.trend === 'down' && <Activity className="w-3 h-3 mr-1 rotate-180" />}
                  {metric.trend === 'steady' && <Activity className="w-3 h-3 mr-1" />}
                  {metric.trend === 'up'
                    ? '+5.4%'
                    : metric.trend === 'down'
                      ? '-2.1%'
                      : '0%'}
                </Badge>
              </div>
              <div className="text-3xl font-semibold text-white">{metric.value}</div>
              <p className="text-xs text-gray-400">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                Distribui��o por perfil
              </h3>
              <p className="text-sm text-gray-400">
                Acompanhamento da jornada dos colaboradores nos treinamentos NR
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              Atualizado h� 2 minutos
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              {[
                { label: 'Treinamentos NR conclu�dos', value: 78 },
                { label: 'Avalia��es com nota acima de 80%', value: 62 },
                { label: 'Projetos colaborativos ativos', value: 31 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm text-gray-300 mb-1">
                    <span>{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                  <Progress value={Math.min(100, item.value)} className="h-2 bg-white/10" />
                </div>
              ))}
            </div>

            <div className="space-y-4 bg-black/20 rounded-lg border border-white/10 p-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
                Alertas recentes
              </h4>
              <div className="space-y-3">
                {[
                  {
                    title: 'NR-12 - Turma noturna',
                    description: 'Taxa de conclus�o abaixo de 70% nas �ltimas 48h',
                    tone: 'warning',
                  },
                  {
                    title: 'NR-33 - Certifica��o anual',
                    description: 'Prazo limite em 14 dias para 12 colaboradores',
                    tone: 'info',
                  },
                  {
                    title: 'NR-35 - Conte�do atualizado',
                    description: 'Nova vers�o publicada, 100% dos colaboradores sincronizados',
                    tone: 'success',
                  },
                ].map((alert) => (
                  <div
                    key={alert.title}
                    className="rounded-md border border-white/10 bg-white/5 p-3"
                  >
                    <div
                      className={`text-sm font-medium ${
                        alert.tone === 'warning'
                          ? 'text-amber-400'
                          : alert.tone === 'success'
                            ? 'text-emerald-400'
                            : 'text-sky-400'
                      }`}
                    >
                      {alert.title}
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedAnalyticsDashboard
