
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Brain, 
  Wand2, 
  Palette, 
  Zap, 
  TrendingUp, 
  Target, 
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layout,
  Eye,
  BarChart3,
  Lightbulb,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ContentSuggestion {
  id: string
  type: 'layout' | 'color' | 'content' | 'engagement'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  action: () => void
}

interface AnalysisResult {
  score: number
  category: string
  suggestions: ContentSuggestion[]
  insights: {
    strengths: string[]
    improvements: string[]
    compliance: {
      nr: string
      status: 'compliant' | 'needs-review' | 'non-compliant'
      details: string
    }
  }
}

export default function IAContentAssistant() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState('suggestions')
  const [autoMode, setAutoMode] = useState(false)

  // Simulação de análise IA do conteúdo
  const analyzeContent = async () => {
    setIsAnalyzing(true)
    
    // Simulação de delay para análise
    await new Promise(resolve => setTimeout(resolve, 3000))

    const mockAnalysis: AnalysisResult = {
      score: 87,
      category: 'Treinamento de Segurança - NR12',
      suggestions: [
        {
          id: '1',
          type: 'layout',
          title: 'Otimizar Layout Visual',
          description: 'Reorganizar elementos para melhor hierarquia visual e foco',
          impact: 'high',
          confidence: 94,
          action: () => toast.success('Layout otimizado aplicado!')
        },
        {
          id: '2', 
          type: 'color',
          title: 'Harmonização de Cores',
          description: 'Aplicar paleta de cores para compliance NR12',
          impact: 'medium',
          confidence: 89,
          action: () => toast.success('Cores NR12 aplicadas!')
        },
        {
          id: '3',
          type: 'content',
          title: 'Melhorar Clareza do Texto',
          description: 'Simplificar linguagem técnica para melhor compreensão',
          impact: 'high',
          confidence: 91,
          action: () => toast.success('Texto simplificado!')
        },
        {
          id: '4',
          type: 'engagement',
          title: 'Adicionar Elementos Interativos',
          description: 'Incluir pontos de interação para maior engajamento',
          impact: 'medium',
          confidence: 85,
          action: () => toast.success('Interatividade adicionada!')
        }
      ],
      insights: {
        strengths: [
          'Excelente uso de avatares 3D',
          'Conteúdo técnico bem estruturado',
          'Boa qualidade de áudio TTS'
        ],
        improvements: [
          'Aumentar contraste visual',
          'Incluir mais casos práticos',
          'Otimizar duração dos slides'
        ],
        compliance: {
          nr: 'NR-12 (Máquinas e Equipamentos)',
          status: 'compliant',
          details: 'Conteúdo está 94% em conformidade com NR-12'
        }
      }
    }

    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
    toast.success('Análise IA concluída!')
  }

  // Auto-otimização baseada em IA
  const autoOptimize = async () => {
    if (!analysis) return

    setIsAnalyzing(true)
    
    // Aplicar todas as sugestões automaticamente
    for (const suggestion of analysis.suggestions) {
      if (suggestion.impact === 'high') {
        suggestion.action()
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setIsAnalyzing(false)
    toast.success('Auto-otimização IA aplicada!')
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600'
      case 'needs-review': return 'text-yellow-600'
      case 'non-compliant': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header do Assistente IA */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-600 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-purple-900">
                  Assistente IA de Conteúdo
                </CardTitle>
                <p className="text-purple-700 mt-1">
                  Análise inteligente e otimização automática de conteúdo
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={analyzeContent}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Analisar Conteúdo
              </Button>
              {analysis && (
                <Button 
                  onClick={autoOptimize}
                  variant="outline"
                  disabled={isAnalyzing}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto-Otimizar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="animate-spin mx-auto">
                <Brain className="h-12 w-12 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Analisando conteúdo com IA...</h3>
                <p className="text-gray-600">Processando layout, cores, texto e compliance</p>
              </div>
              <Progress value={75} className="w-full max-w-md mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados da Análise */}
      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Score Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Score de Qualidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">
                    {analysis.score}/100
                  </span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {analysis.category}
                  </Badge>
                </div>
                <Progress value={analysis.score} className="h-3" />
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Qualidade Excelente - Pronto para produção</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs de Análise Detalhada */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggestions">
                <Sparkles className="h-4 w-4 mr-2" />
                Sugestões IA
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Lightbulb className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="compliance">
                <Target className="h-4 w-4 mr-2" />
                Compliance NR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="space-y-4">
              {analysis.suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {suggestion.type === 'layout' && <Layout className="h-5 w-5 text-blue-600" />}
                          {suggestion.type === 'color' && <Palette className="h-5 w-5 text-green-600" />}
                          {suggestion.type === 'content' && <Eye className="h-5 w-5 text-orange-600" />}
                          {suggestion.type === 'engagement' && <TrendingUp className="h-5 w-5 text-purple-600" />}
                          
                          <h3 className="font-semibold">{suggestion.title}</h3>
                          <Badge className={getImpactColor(suggestion.impact)}>
                            {suggestion.impact} impact
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-500">Confiança:</span>
                          <Progress value={suggestion.confidence} className="w-20 h-2" />
                          <span className="text-gray-700 font-medium">{suggestion.confidence}%</span>
                        </div>
                      </div>
                      <Button 
                        onClick={suggestion.action}
                        size="sm"
                        className="ml-4"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Pontos Fortes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Pontos Fortes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.insights.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Melhorias */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-700 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Oportunidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.insights.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Análise de Compliance NR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <h3 className="font-semibold text-green-800">
                        {analysis.insights.compliance.nr}
                      </h3>
                      <p className="text-green-700 mt-1">
                        {analysis.insights.compliance.details}
                      </p>
                    </div>
                    <Badge className={`${getComplianceColor(analysis.insights.compliance.status)} bg-green-100 border-green-300`}>
                      {analysis.insights.compliance.status === 'compliant' ? '✓ Conforme' : 
                       analysis.insights.compliance.status === 'needs-review' ? '⚠ Revisar' : '✗ Não Conforme'}
                    </Badge>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Recomendações NR</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Incluir avisos de segurança obrigatórios</li>
                      <li>• Destacar procedimentos de emergência</li>
                      <li>• Adicionar checklist de verificação</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
