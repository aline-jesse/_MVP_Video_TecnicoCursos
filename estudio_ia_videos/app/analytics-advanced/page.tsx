'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Target, 
  AlertTriangle, 
  FileText, 
  Download, 
  DollarSign,
  Grid,
  Activity,
  Users,
  Eye,
  Zap,
  Settings,
  Play
} from 'lucide-react'
import { AdvancedAnalyticsDashboard } from './components/AdvancedAnalyticsDashboard'

export default function AnalyticsAdvancedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Analytics Avançado
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Sistema de análise de dados com IA e machine learning
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Activity className="w-4 h-4 mr-2" />
                Sistema Ativo
              </Badge>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                  Dashboard
                </Badge>
              </div>
              <CardTitle className="text-white">Dashboard Interativo</CardTitle>
              <CardDescription className="text-gray-400">
                Visualizações avançadas em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <Eye className="w-4 h-4 mr-2 text-blue-400" />
                  Múltiplas visualizações
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Activity className="w-4 h-4 mr-2 text-green-400" />
                  Dados em tempo real
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Target className="w-4 h-4 mr-2 text-purple-400" />
                  Métricas personalizadas
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Brain className="w-8 h-8 text-purple-400" />
                <Badge variant="outline" className="border-purple-400/30 text-purple-400">
                  ML/IA
                </Badge>
              </div>
              <CardTitle className="text-white">Machine Learning</CardTitle>
              <CardDescription className="text-gray-400">
                Análise preditiva e insights inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                  Predições de tendências
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Users className="w-4 h-4 mr-2 text-blue-400" />
                  Análise comportamental
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                  Insights automáticos
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                <Badge variant="outline" className="border-yellow-400/30 text-yellow-400">
                  Alertas
                </Badge>
              </div>
              <CardTitle className="text-white">Sistema de Alertas</CardTitle>
              <CardDescription className="text-gray-400">
                Notificações inteligentes e automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                  Alertas críticos
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <TrendingUp className="w-4 h-4 mr-2 text-orange-400" />
                  Anomalias detectadas
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Target className="w-4 h-4 mr-2 text-green-400" />
                  Metas atingidas
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="w-8 h-8 text-green-400" />
                <Badge variant="outline" className="border-green-400/30 text-green-400">
                  Relatórios
                </Badge>
              </div>
              <CardTitle className="text-white">Relatórios Automáticos</CardTitle>
              <CardDescription className="text-gray-400">
                Geração e agendamento inteligente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <FileText className="w-4 h-4 mr-2 text-blue-400" />
                  Relatórios personalizados
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Download className="w-4 h-4 mr-2 text-green-400" />
                  Múltiplos formatos
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <Activity className="w-4 h-4 mr-2 text-purple-400" />
                  Agendamento automático
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-green-400" />
                Análise de ROI e Conversões
              </CardTitle>
              <CardDescription className="text-gray-400">
                Métricas financeiras e de performance detalhadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">+247%</div>
                  <div className="text-sm text-gray-400">ROI Médio</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">89.3%</div>
                  <div className="text-sm text-gray-400">Taxa Conversão</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Grid className="w-6 h-6 mr-3 text-orange-400" />
                Heatmaps e Interações
              </CardTitle>
              <CardDescription className="text-gray-400">
                Análise visual de comportamento do usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Cliques em botões</span>
                  <span className="text-orange-400 font-semibold">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tempo na página</span>
                  <span className="text-blue-400 font-semibold">4m 32s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Scroll depth</span>
                  <span className="text-green-400 font-semibold">78%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-2xl">Dashboard Principal</CardTitle>
                <CardDescription className="text-gray-400">
                  Análise completa com machine learning e visualizações interativas
                </CardDescription>
              </div>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Análise
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AdvancedAnalyticsDashboard />
          </CardContent>
        </Card>

        {/* Integration Status */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Integração com Fases Anteriores</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: 'PPTX Studio', status: 'Conectado', color: 'green' },
              { name: 'Avatar 3D', status: 'Conectado', color: 'green' },
              { name: 'Timeline Pro', status: 'Conectado', color: 'green' },
              { name: 'Render Engine', status: 'Conectado', color: 'green' },
              { name: 'Collaboration', status: 'Conectado', color: 'green' },
              { name: 'IA Assistant', status: 'Conectado', color: 'green' },
              { name: 'Voice Cloning', status: 'Conectado', color: 'green' }
            ].map((integration, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-${integration.color}-500/20 border border-${integration.color}-500/30 flex items-center justify-center`}>
                  <div className={`w-3 h-3 rounded-full bg-${integration.color}-400`}></div>
                </div>
                <div className="text-sm text-gray-300">{integration.name}</div>
                <div className={`text-xs text-${integration.color}-400`}>{integration.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
