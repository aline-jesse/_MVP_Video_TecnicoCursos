
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Scan, 
  Brain, 
  Eye, 
  Ear, 
  MessageSquare, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Zap,
  Target,
  Users,
  Clock,
  Lightbulb,
  FileText,
  Image,
  Play,
  Volume2,
  RefreshCw,
  Download
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ContentElement {
  type: 'text' | 'image' | 'audio' | 'video'
  content: string
  duration?: number
  quality: number
  suggestions: string[]
  compliance: {
    score: number
    issues: string[]
  }
}

interface AnalysisResult {
  overallScore: number
  elements: ContentElement[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    category: string
    description: string
    impact: string
  }[]
  metrics: {
    readability: number
    engagement: number
    accessibility: number
    retention: number
  }
  nrCompliance: {
    nr: string
    score: number
    requirements: {
      met: string[]
      missing: string[]
    }
  }
}

export default function ContentAnalysisEngine() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const analyzeContent = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulação de progresso de análise
    const progressSteps = [
      { step: 'Carregando conteúdo...', progress: 20 },
      { step: 'Analisando texto...', progress: 40 },
      { step: 'Processando imagens...', progress: 60 },
      { step: 'Verificando áudio...', progress: 80 },
      { step: 'Gerando relatório...', progress: 100 }
    ]

    for (const { step, progress } of progressSteps) {
      toast.loading(step, { id: 'analysis-progress' })
      setAnalysisProgress(progress)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Dados mockados da análise
    const mockAnalysis: AnalysisResult = {
      overallScore: 87,
      elements: [
        {
          type: 'text',
          content: 'Procedimentos de Segurança NR-12',
          quality: 92,
          suggestions: [
            'Simplificar linguagem técnica',
            'Adicionar exemplos práticos',
            'Incluir glossário'
          ],
          compliance: {
            score: 95,
            issues: ['Falta aviso de segurança obrigatório']
          }
        },
        {
          type: 'image',
          content: 'Diagrama de máquinas industriais',
          quality: 85,
          suggestions: [
            'Aumentar contraste',
            'Adicionar legendas descritivas',
            'Melhorar resolução'
          ],
          compliance: {
            score: 88,
            issues: ['Imagem precisa de descrição alt']
          }
        },
        {
          type: 'audio',
          content: 'Narração principal',
          duration: 180,
          quality: 89,
          suggestions: [
            'Reduzir velocidade de fala',
            'Adicionar pausas estratégicas',
            'Melhorar clareza de pronúncia'
          ],
          compliance: {
            score: 91,
            issues: []
          }
        },
        {
          type: 'video',
          content: 'Demonstração de procedimentos',
          duration: 240,
          quality: 83,
          suggestions: [
            'Adicionar legendas',
            'Melhorar iluminação',
            'Incluir close-ups'
          ],
          compliance: {
            score: 87,
            issues: ['Vídeo precisa de descrição de acessibilidade']
          }
        }
      ],
      recommendations: [
        {
          priority: 'high',
          category: 'Accessibility',
          description: 'Adicionar legendas e descrições alt para melhor acessibilidade',
          impact: 'Melhora conformidade WCAG em 23%'
        },
        {
          priority: 'medium',
          category: 'Engagement',
          description: 'Incluir elementos interativos e gamificação',
          impact: 'Pode aumentar retenção em 18%'
        },
        {
          priority: 'medium',
          category: 'Content',
          description: 'Simplificar linguagem técnica para melhor compreensão',
          impact: 'Reduz taxa de abandono em 15%'
        }
      ],
      metrics: {
        readability: 78,
        engagement: 84,
        accessibility: 67,
        retention: 89
      },
      nrCompliance: {
        nr: 'NR-12',
        score: 91,
        requirements: {
          met: [
            'Informações sobre riscos',
            'Procedimentos de segurança',
            'Equipamentos de proteção',
            'Treinamento obrigatório'
          ],
          missing: [
            'Aviso de segurança visual',
            'Procedimentos de emergência',
            'Contatos de segurança'
          ]
        }
      }
    }

    toast.dismiss('analysis-progress')
    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
    toast.success('Análise de conteúdo concluída!')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      toast.success(`Arquivo ${file.name} carregado para análise`)
    }
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-5 w-5" />
      case 'image': return <Image className="h-5 w-5" />
      case 'audio': return <Volume2 className="h-5 w-5" />
      case 'video': return <Play className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-600 rounded-xl">
                <Scan className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-cyan-900">
                  Engine de Análise de Conteúdo
                </CardTitle>
                <p className="text-cyan-700 mt-1">
                  Análise inteligente de texto, imagem, áudio e vídeo com IA
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={analyzeContent}
                disabled={isAnalyzing}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Scan className="h-4 w-4 mr-2" />
                )}
                Analisar Conteúdo
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Upload de Arquivo */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Conteúdo para Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pptx,.pdf,.mp4,.mp3,.jpg,.png"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-lg font-semibold">
                  {selectedFile ? selectedFile.name : 'Selecione um arquivo para análise'}
                </p>
                <p className="text-gray-600">
                  Suporte: PPTX, PDF, MP4, MP3, JPG, PNG
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Brain className="h-16 w-16 text-cyan-600 mx-auto" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Analisando conteúdo com IA...</h3>
                <p className="text-gray-600">Processando elementos multimídia</p>
              </div>
              <Progress value={analysisProgress} className="w-full max-w-md mx-auto h-3" />
              <p className="text-sm text-gray-500">{analysisProgress}% concluído</p>
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
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Score Geral de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-cyan-600">
                  {analysis.overallScore}/100
                </span>
                <Badge className="bg-cyan-100 text-cyan-800">
                  {analysis.overallScore >= 90 ? 'Excelente' : 
                   analysis.overallScore >= 70 ? 'Bom' : 'Precisa Melhorar'}
                </Badge>
              </div>
              <Progress value={analysis.overallScore} className="h-4 mb-4" />
              
              {/* Métricas Detalhadas */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Eye className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-sm font-medium">Legibilidade</p>
                  <p className="text-lg font-bold text-blue-600">{analysis.metrics.readability}%</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 mx-auto text-green-600 mb-1" />
                  <p className="text-sm font-medium">Engajamento</p>
                  <p className="text-lg font-bold text-green-600">{analysis.metrics.engagement}%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                  <p className="text-sm font-medium">Acessibilidade</p>
                  <p className="text-lg font-bold text-purple-600">{analysis.metrics.accessibility}%</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                  <p className="text-sm font-medium">Retenção</p>
                  <p className="text-lg font-bold text-orange-600">{analysis.metrics.retention}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs de Análise Detalhada */}
          <Tabs defaultValue="elements">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="elements">Elementos</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
              <TabsTrigger value="compliance">Compliance NR</TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="space-y-4">
              {analysis.elements.map((element, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getElementIcon(element.type)}
                        <div>
                          <h3 className="font-semibold capitalize">{element.type}</h3>
                          <p className="text-gray-600 text-sm">{element.content}</p>
                          {element.duration && (
                            <p className="text-xs text-gray-500">
                              Duração: {Math.floor(element.duration / 60)}:{(element.duration % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getQualityColor(element.quality)}`}>
                          {element.quality}/100
                        </p>
                        <Progress value={element.quality} className="w-20 h-2" />
                      </div>
                    </div>

                    {/* Sugestões */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Sugestões IA:</h4>
                      <ul className="space-y-1">
                        {element.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Compliance */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Compliance Score</p>
                        {element.compliance.issues.length > 0 && (
                          <p className="text-sm text-red-600">
                            {element.compliance.issues.join(', ')}
                          </p>
                        )}
                      </div>
                      <Badge className={element.compliance.score >= 90 ? 
                        'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'}>
                        {element.compliance.score}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {analysis.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">{rec.category}</h3>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{rec.description}</p>
                        <p className="text-sm text-green-600 font-medium">
                          💡 {rec.impact}
                        </p>
                      </div>
                      <Button size="sm" className="ml-4">
                        <Zap className="h-4 w-4 mr-1" />
                        Aplicar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="compliance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Compliance {analysis.nrCompliance.nr}</span>
                    <Badge className={analysis.nrCompliance.score >= 90 ? 
                      'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'}>
                      {analysis.nrCompliance.score}% Conforme
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Progress value={analysis.nrCompliance.score} className="h-3" />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Requisitos Atendidos */}
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Requisitos Atendidos
                      </h4>
                      <ul className="space-y-2">
                        {analysis.nrCompliance.requirements.met.map((req, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requisitos Pendentes */}
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-3 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Requisitos Pendentes
                      </h4>
                      <ul className="space-y-2">
                        {analysis.nrCompliance.requirements.missing.map((req, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Relatório Completo
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
