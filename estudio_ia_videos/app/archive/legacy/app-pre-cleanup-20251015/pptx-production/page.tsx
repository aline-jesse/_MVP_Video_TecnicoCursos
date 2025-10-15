
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  FileText, 
  Play, 
  Settings, 
  BarChart3,
  Brain,
  Zap,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  Download,
  Sparkles
} from 'lucide-react'
import ProductionPPTXUpload from '@/components/pptx/production-pptx-upload'
import { toast } from 'react-hot-toast'

export default function PPTXProductionPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [recentUploads] = useState([
    {
      id: '1',
      name: 'Treinamento NR-12.pptx',
      status: 'completed',
      uploadTime: 'Há 2 horas',
      aiScore: 96
    },
    {
      id: '2', 
      name: 'Espaços Confinados.pptx',
      status: 'processing',
      uploadTime: 'Há 15 min',
      aiScore: 89
    },
    {
      id: '3',
      name: 'Trabalho em Altura.pptx', 
      status: 'completed',
      uploadTime: 'Há 1 dia',
      aiScore: 94
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-blue-900">
                    PPTX Production Studio
                  </CardTitle>
                  <p className="text-blue-700 mt-1">
                    Upload, processamento e conversão profissional de apresentações
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  Sistema Online
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  IA Ativo
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Métricas Rápidas */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uploads Hoje</p>
                  <p className="text-2xl font-bold text-blue-600">47</p>
                </div>
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processando</p>
                  <p className="text-2xl font-bold text-orange-600">3</p>
                </div>
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Score IA Médio</p>
                  <p className="text-2xl font-bold text-green-600">93.2</p>
                </div>
                <Brain className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-purple-600">1,247</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-gray-200 px-6 py-4">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                  <TabsTrigger 
                    value="upload"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PPTX
                  </TabsTrigger>
                  <TabsTrigger 
                    value="processing"
                    className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Processamento
                  </TabsTrigger>
                  <TabsTrigger 
                    value="projects"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Projetos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="upload" className="mt-0">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">
                        Upload PPTX com Processamento IA
                      </h2>
                      <p className="text-gray-600">
                        Faça upload de suas apresentações e deixe a IA processar automaticamente
                      </p>
                    </div>
                    <ProductionPPTXUpload />
                  </div>
                </TabsContent>

                <TabsContent value="processing" className="mt-0">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">
                        Processamento Avançado
                      </h2>
                      <p className="text-gray-600">
                        Configure as opções de processamento e IA
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Brain className="h-5 w-5 mr-2" />
                            Configurações IA
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Análise Automática</span>
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Compliance NR</span>
                            <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Otimização de Layout</span>
                            <Badge className="bg-purple-100 text-purple-800">Ativo</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            Configurações Avançadas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Qualidade de Saída</span>
                            <span className="text-sm font-medium">Alta (4K)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Processamento Paralelo</span>
                            <span className="text-sm font-medium">8 threads</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Cache Inteligente</span>
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        Projetos Recentes
                      </h2>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Todos
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {recentUploads.map((upload) => (
                        <Card key={upload.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{upload.name}</h3>
                                  <p className="text-sm text-gray-600">{upload.uploadTime}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Brain className="h-3 w-3 mr-1" />
                                  Score: {upload.aiScore}
                                </Badge>
                                <Badge className={
                                  upload.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }>
                                  {upload.status === 'completed' ? 'Concluído' : 'Processando'}
                                </Badge>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">
                        Analytics de Produção
                      </h2>
                      <p className="text-gray-600">
                        Métricas detalhadas de upload e processamento
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Performance Semanal
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Uploads</span>
                              <span className="font-medium">+23%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Score IA Médio</span>
                              <span className="font-medium">+5.2 pontos</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Tempo Processamento</span>
                              <span className="font-medium">-15%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Sparkles className="h-5 w-5 mr-2" />
                            Insights IA
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Qualidade Excelente</p>
                                <p className="text-xs text-gray-600">92% dos uploads com score 90+</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Otimização Ativa</p>
                                <p className="text-xs text-gray-600">IA melhorou 1,247 apresentações</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-2">
                              <Users className="h-4 w-4 text-purple-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Engagement Alto</p>
                                <p className="text-xs text-gray-600">87% de taxa de conclusão</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
