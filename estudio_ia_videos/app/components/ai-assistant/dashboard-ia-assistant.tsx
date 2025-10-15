
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Brain,
  Sparkles,
  BarChart3,
  Target,
  Lightbulb,
  Users,
  Clock,
  Trophy,
  Rocket,
  Star,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface IAInsight {
  id: string
  type: 'success' | 'warning' | 'info' | 'action'
  title: string
  description: string
  action?: string
  priority: 'high' | 'medium' | 'low'
  timestamp: string
}

interface PerformanceMetric {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
}

export default function DashboardIAAssistant() {
  const [insights, setInsights] = useState<IAInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')

  // Dados mockados do assistente IA
  useEffect(() => {
    const mockInsights: IAInsight[] = [
      {
        id: '1',
        type: 'success',
        title: 'Performance Excelente',
        description: 'Seus vídeos de NR-12 atingiram 96% de engagement',
        priority: 'high',
        timestamp: 'Há 2 min'
      },
      {
        id: '2',
        type: 'action',
        title: 'Otimização Recomendada',
        description: 'IA detectou oportunidade de melhorar templates NR-33',
        action: 'Aplicar otimização',
        priority: 'medium',
        timestamp: 'Há 15 min'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Compliance Alert',
        description: 'Template NR-18 precisa de atualização normativa',
        priority: 'high',
        timestamp: 'Há 1h'
      },
      {
        id: '4',
        type: 'info',
        title: 'Novo Template Disponível',
        description: 'Template NR-35 com IA de simulação em altura foi lançado',
        priority: 'medium',
        timestamp: 'Há 2h'
      }
    ]

    const mockMetrics: PerformanceMetric[] = [
      {
        label: 'Engagement Rate',
        value: 87,
        change: 12,
        trend: 'up',
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        label: 'Compliance Score',
        value: 94,
        change: 3,
        trend: 'up',
        icon: <Target className="h-4 w-4" />
      },
      {
        label: 'Time to Complete',
        value: 23,
        change: -15,
        trend: 'down',
        icon: <Clock className="h-4 w-4" />
      },
      {
        label: 'User Satisfaction',
        value: 4.8,
        change: 0.2,
        trend: 'up',
        icon: <Star className="h-4 w-4" />
      }
    ]

    setInsights(mockInsights)
    setMetrics(mockMetrics)
  }, [])

  const runSmartAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simulação de análise IA
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Adicionar novo insight baseado na análise
    const newInsight: IAInsight = {
      id: Date.now().toString(),
      type: 'action',
      title: 'Nova Oportunidade Detectada',
      description: 'IA identificou padrões que podem aumentar efetividade em 23%',
      action: 'Ver recomendações',
      priority: 'high',
      timestamp: 'Agora'
    }

    setInsights(prev => [newInsight, ...prev])
    setIsAnalyzing(false)
    toast.success('Análise IA concluída!')
  }

  const handleAction = (insight: IAInsight) => {
    toast.success(`Ação aplicada: ${insight.title}`)
  }

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return
    
    toast.success('Mensagem enviada ao assistente IA!')
    setChatMessage('')
    
    // Simular resposta do assistente
    setTimeout(() => {
      toast('🤖 Assistente: Analisando sua solicitação...', { duration: 2000 })
    }, 1000)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Lightbulb className="h-4 w-4 text-blue-500" />
      case 'action': return <Zap className="h-4 w-4 text-purple-500" />
      default: return <Brain className="h-4 w-4 text-gray-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      case 'action': return 'border-purple-200 bg-purple-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header do Assistente */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">
                  Assistente IA Dashboard
                </CardTitle>
                <p className="text-blue-700 mt-1">
                  Insights inteligentes e otimizações automáticas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={runSmartAnalysis}
                disabled={isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Análise Inteligente
              </Button>
              <Button 
                onClick={() => setChatOpen(!chatOpen)}
                variant="outline"
                className="border-blue-300"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat IA
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Insights e Métricas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance IA Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {metric.icon}
                        <span className="text-sm font-medium text-gray-700">
                          {metric.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {metric.trend === 'up' ? (
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        ) : metric.trend === 'down' ? (
                          <ArrowDown className="h-3 w-3 text-red-500" />
                        ) : null}
                        <span className={`text-xs font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}
                          {metric.label.includes('Rate') || metric.label.includes('Score') ? '%' : 
                           metric.label.includes('Time') ? 'min' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.value}
                      {metric.label.includes('Rate') || metric.label.includes('Score') ? '%' : 
                       metric.label.includes('Time') ? 'min' : 
                       metric.label.includes('Satisfaction') ? '/5' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Insights IA em Tempo Real
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {insights.length} insights
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getInsightIcon(insight.type)}
                          <h3 className="font-semibold text-gray-900">
                            {insight.title}
                          </h3>
                          <Badge className={getPriorityBadge(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {insight.description}
                        </p>
                        <span className="text-xs text-gray-500">
                          {insight.timestamp}
                        </span>
                      </div>
                      {insight.action && (
                        <Button 
                          onClick={() => handleAction(insight)}
                          size="sm"
                          className="ml-4"
                        >
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Chat IA e Status */}
        <div className="space-y-6">
          {/* Status IA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Status IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sistema IA</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Análise Automática</span>
                <Badge className="bg-blue-100 text-blue-800">Ativa</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Templates NR</span>
                <Badge className="bg-purple-100 text-purple-800">6 Ativos</Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm">Confiança IA</span>
                <Progress value={92} className="h-2" />
                <span className="text-xs text-gray-600">92% de precisão</span>
              </div>
            </CardContent>
          </Card>

          {/* Chat IA */}
          <Card className={`transition-all duration-300 ${chatOpen ? 'h-96' : 'h-auto'}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat com Assistente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chatOpen ? (
                <div className="space-y-4">
                  <div className="h-48 bg-gray-50 rounded-lg p-3 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Bot className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="bg-blue-100 rounded-lg p-2 text-sm">
                          Olá! Sou seu assistente IA. Como posso ajudar com seus projetos de treinamento hoje?
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 justify-end">
                        <div className="bg-gray-200 rounded-lg p-2 text-sm max-w-xs">
                          Como posso melhorar o engagement dos meus vídeos NR-12?
                        </div>
                        <Users className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-start space-x-2">
                        <Bot className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="bg-blue-100 rounded-lg p-2 text-sm">
                          Baseado na análise IA, recomendo: 1) Adicionar mais casos práticos 2) Usar avatares regionais 3) Incluir gamificação. Quer que eu aplique essas otimizações?
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <Button 
                      onClick={sendChatMessage}
                      size="sm"
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique em "Chat IA" para conversar com o assistente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rocket className="h-5 w-5 mr-2" />
                Ações Rápidas IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.success('Otimização automática iniciada!')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Otimizar Templates
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.success('Análise de compliance iniciada!')}
              >
                <Target className="h-4 w-4 mr-2" />
                Verificar Compliance
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.success('Relatório sendo gerado!')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.success('Sugestões de conteúdo geradas!')}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Sugerir Conteúdo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
