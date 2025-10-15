

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { 
  Brain, 
  Sparkles, 
  Zap, 
  FileText, 
  Users, 
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
  Wand2
} from 'lucide-react'
import AIScriptGenerator from './ai-script-generator'
import ContentOptimizer from './content-optimizer'

export default function AIDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const aiStats = [
    { label: 'Scripts Gerados', value: '147', icon: FileText, color: 'text-blue-600' },
    { label: 'Conteúdo Otimizado', value: '89', icon: Zap, color: 'text-orange-600' },
    { label: 'Compliance Score', value: '94%', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Tempo Economizado', value: '340h', icon: Clock, color: 'text-purple-600' }
  ]

  const recentGenerations = [
    { id: 1, title: 'NR-35: Trabalho em Altura - Básico', type: 'Script', status: 'Concluído', time: '2h atrás' },
    { id: 2, title: 'Otimização: Treinamento NR-12', type: 'Otimização', status: 'Concluído', time: '4h atrás' },
    { id: 3, title: 'NR-33: Espaços Confinados - Avançado', type: 'Script', status: 'Concluído', time: '1d atrás' },
    { id: 4, title: 'Quiz Interativo NR-10', type: 'Quiz', status: 'Processando', time: '2d atrás' }
  ]

  const aiCapabilities = [
    {
      title: 'Geração de Roteiros',
      description: 'Crie roteiros completos para qualquer NR com estrutura profissional',
      icon: FileText,
      features: ['Conteúdo técnico preciso', 'Linguagem acessível', 'Estrutura pedagógica', 'Compliance automático']
    },
    {
      title: 'Otimização de Conteúdo',
      description: 'Melhore conteúdos existentes para maior engajamento e clareza',
      icon: TrendingUp,
      features: ['Análise de engajamento', 'Sugestões práticas', 'Melhoria de clareza', 'Adaptação de público']
    },
    {
      title: 'Instruções de Avatar',
      description: 'Gere instruções detalhadas para avatares 3D mais expressivos',
      icon: Users,
      features: ['Gestos naturais', 'Tom adequado', 'Ênfases corretas', 'Personalidade consistente']
    },
    {
      title: 'Análise de Compliance',
      description: 'Verifique automaticamente aderência às Normas Regulamentadoras',
      icon: CheckCircle,
      features: ['Checklist automático', 'Gap analysis', 'Sugestões de correção', 'Score de conformidade']
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">IA Avançada</h1>
          <p className="text-gray-600">
            Tecnologia de ponta para criação inteligente de conteúdo de treinamento
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="script-generator">Gerador de Scripts</TabsTrigger>
          <TabsTrigger value="optimizer">Otimizador</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Capacidades de IA
              </CardTitle>
              <CardDescription>
                Funcionalidades avançadas disponíveis no Sprint 4
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiCapabilities.map((capability) => (
                  <div key={capability.title} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <capability.icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{capability.title}</h3>
                        <p className="text-sm text-gray-600">{capability.description}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {capability.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Suas últimas gerações e otimizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGenerations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        {item.type === 'Script' ? (
                          <FileText className="w-4 h-4 text-blue-600" />
                        ) : item.type === 'Otimização' ? (
                          <Zap className="w-4 h-4 text-orange-600" />
                        ) : (
                          <BarChart3 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={item.status === 'Concluído' ? 'default' : 'secondary'}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              size="lg" 
              className="p-6 h-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => setActiveTab('script-generator')}
            >
              <div className="text-center">
                <Wand2 className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">Gerar Novo Script</p>
                <p className="text-xs opacity-90">Criar roteiro completo com IA</p>
              </div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="p-6 h-auto hover:bg-orange-50"
              onClick={() => setActiveTab('optimizer')}
            >
              <div className="text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">Otimizar Conteúdo</p>
                <p className="text-xs text-gray-600">Melhorar material existente</p>
              </div>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="script-generator">
          <AIScriptGenerator />
        </TabsContent>

        <TabsContent value="optimizer">
          <ContentOptimizer />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de IA</CardTitle>
              <CardDescription>Métricas avançadas em desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Analytics Avançados</h3>
                <p className="text-gray-600 mb-4">
                  Métricas detalhadas de performance e ROI das funcionalidades de IA
                </p>
                <Badge variant="outline">Em Desenvolvimento</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
