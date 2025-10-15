
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Sparkles, 
  Target, 
  Scan, 
  BarChart3, 
  Bot,
  Zap,
  Eye,
  Lightbulb,
  RefreshCw
} from 'lucide-react'
import IAContentAssistant from '@/components/ai-assistant/ia-content-assistant'
import SmartTemplatesNR from '@/components/ai-assistant/smart-templates-nr'
import DashboardIAAssistant from '@/components/ai-assistant/dashboard-ia-assistant'
import ContentAnalysisEngine from '@/components/ai-assistant/content-analysis-engine'
import { toast } from 'react-hot-toast'

export default function IAAssistantStudio() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSystemOptimizing, setIsSystemOptimizing] = useState(false)

  const runSystemOptimization = async () => {
    setIsSystemOptimizing(true)
    
    // Simulação de otimização geral do sistema
    const optimizationSteps = [
      'Analisando performance geral...',
      'Otimizando algoritmos IA...',
      'Atualizando modelos de aprendizado...',
      'Calibrando motores de análise...',
      'Finalizando otimizações...'
    ]

    for (const step of optimizationSteps) {
      toast.loading(step, { id: 'system-optimization' })
      await new Promise(resolve => setTimeout(resolve, 1200))
    }

    toast.dismiss('system-optimization')
    setIsSystemOptimizing(false)
    toast.success('Sistema IA otimizado com sucesso! Performance melhorada em 23%')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Principal */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-indigo-900">
                    Estúdio IA Assistant
                  </CardTitle>
                  <p className="text-indigo-700 mt-1 text-lg">
                    Centro de inteligência artificial para criação de conteúdo avançado
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  Sistema IA Online
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  Sprint 23 Active
                </Badge>
                <Button 
                  onClick={runSystemOptimization}
                  disabled={isSystemOptimizing}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isSystemOptimizing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Otimizar Sistema IA
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Sistema de Métricas Gerais */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Precisão IA</p>
                  <p className="text-2xl font-bold text-green-600">94.2%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Templates IA</p>
                  <p className="text-2xl font-bold text-blue-600">127</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Análises Hoje</p>
                  <p className="text-2xl font-bold text-purple-600">2,847</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Scan className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Otimizações</p>
                  <p className="text-2xl font-bold text-orange-600">1,456</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais do Assistente IA */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 px-6 py-4">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                  <TabsTrigger 
                    value="dashboard" 
                    className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                    onClick={() => {
                      setActiveTab('dashboard')
                      toast.success('Dashboard IA carregado!')
                    }}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Dashboard IA
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content-assistant"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Assistente Conteúdo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="smart-templates"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Templates Inteligentes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content-analysis"
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                    onClick={() => {
                      setActiveTab('content-analysis')
                      toast.success('Análise de Conteúdo carregada!')
                    }}
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Análise Conteúdo
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="dashboard" className="mt-0">
                  <DashboardIAAssistant />
                </TabsContent>

                <TabsContent value="content-assistant" className="mt-0">
                  <IAContentAssistant />
                </TabsContent>

                <TabsContent value="smart-templates" className="mt-0">
                  <SmartTemplatesNR />
                </TabsContent>

                <TabsContent value="content-analysis" className="mt-0">
                  <ContentAnalysisEngine />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer com Informações do Sistema */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sistema IA: Online</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Models: Atualizados</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Performance: 94.2%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span>Sprint 23 - IA Assistant Integration</span>
                <Badge variant="outline" className="text-xs">
                  v2.3.0
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
