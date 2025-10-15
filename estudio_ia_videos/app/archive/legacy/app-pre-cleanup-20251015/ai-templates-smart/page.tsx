
'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Brain, Sparkles, Wand2, Target, Users, Clock,
  Zap, ChevronRight, Download, Save, Eye, Settings,
  TrendingUp, Award, BookOpen, Shield, Factory, Heart
} from 'lucide-react'

interface SmartTemplate {
  id: string
  name: string
  category: string
  description: string
  aiGenerated: boolean
  adaptiveFeatures: string[]
  targetAudience: string[]
  compliance: string[]
  thumbnail: string
  usage: number
  rating: number
  estimatedTime: number
}

interface TemplateRequest {
  industry: string
  audience: string
  duration: number
  complexity: 'basic' | 'intermediate' | 'advanced'
  objectives: string[]
  complianceRequirements: string[]
  customPrompt: string
}

export default function AITemplatesSmart() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<SmartTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SmartTemplate | null>(null)
  const [requestForm, setRequestForm] = useState<TemplateRequest>({
    industry: '',
    audience: '',
    duration: 5,
    complexity: 'intermediate',
    objectives: [],
    complianceRequirements: [],
    customPrompt: ''
  })

  useEffect(() => {
    loadSmartTemplates()
  }, [])

  const loadSmartTemplates = async () => {
    try {
      const response = await fetch('/api/v2/ai-templates/smart')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error loading smart templates:', error)
      setTemplates(mockTemplates)
    } finally {
      setLoading(false)
    }
  }

  const generateCustomTemplate = async () => {
    try {
      setGenerating(true)
      
      const response = await fetch('/api/v2/ai-templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm)
      })

      if (response.ok) {
        const result = await response.json()
        setTemplates(prev => [result.template, ...prev])
        setSelectedTemplate(result.template)
      }
    } catch (error) {
      console.error('Error generating template:', error)
    } finally {
      setGenerating(false)
    }
  }

  const analyzeAndAdapt = async (templateId: string, context: any) => {
    try {
      const response = await fetch(`/api/v2/ai-templates/${templateId}/adapt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Template adapted:', result)
      }
    } catch (error) {
      console.error('Error adapting template:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Industrial': return <Factory className="h-5 w-5" />
      case 'Saúde': return <Heart className="h-5 w-5" />
      case 'Segurança': return <Shield className="h-5 w-5" />
      case 'Educação': return <BookOpen className="h-5 w-5" />
      default: return <Target className="h-5 w-5" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Mock smart templates data
  const mockTemplates: SmartTemplate[] = [
    {
      id: 'smart-nr10-1',
      name: 'NR-10 Adaptativo Inteligente',
      category: 'Industrial',
      description: 'Template que se adapta ao nível de conhecimento do funcionário',
      aiGenerated: true,
      adaptiveFeatures: ['Nível de Complexidade', 'Exemplos Contextuais', 'Quiz Personalizado'],
      targetAudience: ['Eletricistas', 'Engenheiros', 'Técnicos'],
      compliance: ['NR-10', 'ABNT NBR 5410', 'IEEE'],
      thumbnail: '/templates/smart-nr10.jpg',
      usage: 89,
      rating: 4.8,
      estimatedTime: 15
    },
    {
      id: 'smart-safety-1',
      name: 'Segurança Contextual Dinâmica',
      category: 'Segurança',
      description: 'Adapta cenários de segurança baseado no ambiente de trabalho',
      aiGenerated: true,
      adaptiveFeatures: ['Cenários Específicos', 'Riscos Contextuais', 'EPIs Relevantes'],
      targetAudience: ['Operadores', 'Supervisores', 'Gerentes'],
      compliance: ['NR-6', 'NR-12', 'NR-35'],
      thumbnail: '/templates/smart-safety.jpg',
      usage: 156,
      rating: 4.9,
      estimatedTime: 12
    },
    {
      id: 'smart-health-1',
      name: 'Saúde Ocupacional Personalizada',
      category: 'Saúde',
      description: 'Template que considera histórico médico e função do trabalhador',
      aiGenerated: true,
      adaptiveFeatures: ['Perfil Médico', 'Riscos Específicos', 'Prevenção Personalizada'],
      targetAudience: ['Médicos do Trabalho', 'Enfermeiros', 'Técnicos'],
      compliance: ['NR-7', 'NR-9', 'PCMSO'],
      thumbnail: '/templates/smart-health.jpg',
      usage: 67,
      rating: 4.7,
      estimatedTime: 18
    }
  ]

  const currentTemplates = templates.length > 0 ? templates : mockTemplates

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando Templates Inteligentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI-Powered Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Templates inteligentes que se adaptam automaticamente ao contexto
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Brain className="h-4 w-4 mr-2" />
            Gerar Novo Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Template Library */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="smart" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="smart">Templates IA</TabsTrigger>
              <TabsTrigger value="adaptive">Adaptativos</TabsTrigger>
              <TabsTrigger value="generator">Gerador</TabsTrigger>
            </TabsList>

            <TabsContent value="smart" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(template.category)}
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                        {template.aiGenerated && (
                          <Badge variant="default" className="bg-purple-500">
                            <Sparkles className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Adaptive Features */}
                        <div>
                          <Label className="text-xs font-medium">Recursos Adaptativos</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.adaptiveFeatures.slice(0, 2).map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {template.adaptiveFeatures.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.adaptiveFeatures.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Compliance */}
                        <div>
                          <Label className="text-xs font-medium">Conformidade</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.compliance.map((comp) => (
                              <Badge key={comp} variant="outline" className="text-xs">
                                {comp}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{template.usage}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Award className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{template.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{template.estimatedTime}min</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="adaptive" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Funcionalidades Adaptativas</span>
                  </CardTitle>
                  <CardDescription>
                    Como a IA adapta os templates automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Target className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Adaptação por Público</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          IA analisa o perfil do público-alvo e adapta linguagem, exemplos e complexidade
                        </p>
                        <Badge variant="secondary" className="mt-2">Automático</Badge>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Compliance Inteligente</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Verifica automaticamente conformidade com normas e ajusta conteúdo
                        </p>
                        <Badge variant="secondary" className="mt-2">Real-time</Badge>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-purple-500" />
                          <span className="font-medium">Otimização Contínua</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Aprende com feedback e métricas para melhorar templates
                        </p>
                        <Badge variant="secondary" className="mt-2">Machine Learning</Badge>
                      </div>

                      <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-5 w-5 text-orange-500" />
                          <span className="font-medium">Geração Dinâmica</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cria novos cenários e exemplos baseados em dados atualizados
                        </p>
                        <Badge variant="secondary" className="mt-2">GPT-4</Badge>
                      </div>
                    </div>

                    {/* Adaptation Flow */}
                    <div>
                      <h4 className="font-medium mb-3">Fluxo de Adaptação</h4>
                      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg whitespace-nowrap">
                          <span className="text-sm">1. Análise do Contexto</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg whitespace-nowrap">
                          <span className="text-sm">2. Adaptação IA</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg whitespace-nowrap">
                          <span className="text-sm">3. Validação</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg whitespace-nowrap">
                          <span className="text-sm">4. Otimização</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generator" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wand2 className="h-5 w-5" />
                    <span>Gerador de Template Inteligente</span>
                  </CardTitle>
                  <CardDescription>
                    Crie templates personalizados usando IA generativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label>Indústria/Setor</Label>
                        <Select
                          value={requestForm.industry}
                          onValueChange={(value) => setRequestForm(prev => ({ ...prev, industry: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a indústria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="industrial">Industrial</SelectItem>
                            <SelectItem value="saude">Saúde</SelectItem>
                            <SelectItem value="construcao">Construção</SelectItem>
                            <SelectItem value="educacao">Educação</SelectItem>
                            <SelectItem value="comercio">Comércio</SelectItem>
                            <SelectItem value="servicos">Serviços</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Público-Alvo</Label>
                        <Select
                          value={requestForm.audience}
                          onValueChange={(value) => setRequestForm(prev => ({ ...prev, audience: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o público" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operarios">Operários</SelectItem>
                            <SelectItem value="tecnicos">Técnicos</SelectItem>
                            <SelectItem value="engenheiros">Engenheiros</SelectItem>
                            <SelectItem value="supervisores">Supervisores</SelectItem>
                            <SelectItem value="gerentes">Gerentes</SelectItem>
                            <SelectItem value="diretores">Diretores</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Duração (minutos)</Label>
                        <Input
                          type="number"
                          value={requestForm.duration}
                          onChange={(e) => setRequestForm(prev => ({ 
                            ...prev, 
                            duration: parseInt(e.target.value) || 5 
                          }))}
                          min={3}
                          max={60}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Nível de Complexidade</Label>
                        <Select
                          value={requestForm.complexity}
                          onValueChange={(value: 'basic' | 'intermediate' | 'advanced') => 
                            setRequestForm(prev => ({ ...prev, complexity: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="intermediate">Intermediário</SelectItem>
                            <SelectItem value="advanced">Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Prompt Personalizado</Label>
                      <Textarea
                        placeholder="Descreva requisitos específicos para o template..."
                        value={requestForm.customPrompt}
                        onChange={(e) => setRequestForm(prev => ({ ...prev, customPrompt: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Objetivos de Aprendizagem</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'Conscientização', 'Procedimentos', 'Segurança', 'Compliance',
                          'Operação', 'Manutenção', 'Emergência', 'Prevenção'
                        ].map((objective) => (
                          <Button
                            key={objective}
                            variant="outline"
                            size="sm"
                            className={`text-left justify-start ${
                              requestForm.objectives.includes(objective) ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => {
                              setRequestForm(prev => ({
                                ...prev,
                                objectives: prev.objectives.includes(objective)
                                  ? prev.objectives.filter(o => o !== objective)
                                  : [...prev.objectives, objective]
                              }))
                            }}
                          >
                            {objective}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={generateCustomTemplate}
                      disabled={generating || !requestForm.industry || !requestForm.audience}
                      className="w-full"
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Gerando Template...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Gerar Template Inteligente
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="adaptive">
              <Card>
                <CardHeader>
                  <CardTitle>Sistema de Adaptação Automática</CardTitle>
                  <CardDescription>
                    Configure como os templates se adaptam automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Adaptação por Contexto</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Templates analisam dados do usuário e empresa para personalizar conteúdo
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Função do usuário</span>
                          <Badge variant="default">Ativo</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Experiência prévia</span>
                          <Badge variant="default">Ativo</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Setor da empresa</span>
                          <Badge variant="default">Ativo</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Aprendizado Contínuo</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Sistema aprende com métricas de engajamento e feedback
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Análise de cliques</span>
                          <Badge variant="default">Ativo</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Tempo de visualização</span>
                          <Badge variant="default">Ativo</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pontuação em quiz</span>
                          <Badge variant="default">Ativo</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Template Details & Preview */}
        <div className="space-y-6">
          {selectedTemplate ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(selectedTemplate.category)}
                    <span>{selectedTemplate.name}</span>
                  </CardTitle>
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Template Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold">{selectedTemplate.usage}</div>
                        <div className="text-xs text-gray-500">Usos</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold">{selectedTemplate.rating}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>

                    {/* Adaptive Features */}
                    <div>
                      <Label className="text-sm font-medium">Recursos Adaptativos</Label>
                      <div className="space-y-2 mt-2">
                        {selectedTemplate.adaptiveFeatures.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Sparkles className="h-3 w-3 text-purple-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                      <Label className="text-sm font-medium">Público-Alvo</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedTemplate.targetAudience.map((audience) => (
                          <Badge key={audience} variant="outline" className="text-xs">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Compliance */}
                    <div>
                      <Label className="text-sm font-medium">Conformidade</Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedTemplate.compliance.map((comp) => (
                          <Badge key={comp} variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-4 border-t">
                      <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar Preview
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Usar Template
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => analyzeAndAdapt(selectedTemplate.id, {
                          userProfile: session?.user,
                          preferences: { complexity: 'intermediate' }
                        })}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Adaptar para Mim
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Análise IA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm font-medium mb-1">Recomendação IA</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Este template é ideal para seu perfil. A IA pode adaptá-lo para 
                        focar mais em aspectos práticos baseado em sua função.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Compatibilidade</span>
                        <Badge variant="default">95%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tempo estimado</span>
                        <Badge variant="secondary">{selectedTemplate.estimatedTime}min</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Eficácia prevista</span>
                        <Badge variant="default">Alta</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Selecione um Template</CardTitle>
                <CardDescription>
                  Escolha um template para ver detalhes e opções de adaptação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">Clique em um template para começar</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
