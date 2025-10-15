
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Shield, 
  FileCheck, 
  Zap, 
  Search, 
  Download, 
  Eye, 
  CheckCircle2,
  AlertTriangle,
  Settings,
  BookOpen,
  Building,
  Users,
  Clock,
  Star,
  Filter,
  PlayCircle,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface NRTemplate {
  id: string
  nr: string
  title: string
  description: string
  category: 'operacao' | 'seguranca' | 'emergencia' | 'treinamento'
  industry: string[]
  duration: string
  compliance: number
  difficulty: 'basico' | 'intermediario' | 'avancado'
  features: string[]
  preview: string
  downloadCount: number
  rating: number
  isNew: boolean
}

export default function SmartTemplatesNR() {
  const [templates, setTemplates] = useState<NRTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<NRTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNR, setSelectedNR] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Dados mockados dos templates NR inteligentes
  useEffect(() => {
    const mockTemplates: NRTemplate[] = [
      {
        id: '1',
        nr: 'NR-12',
        title: 'Segurança em Máquinas e Equipamentos',
        description: 'Template completo para treinamento em segurança de máquinas industriais',
        category: 'seguranca',
        industry: ['Metalurgia', 'Automotiva', 'Alimentícia'],
        duration: '45 min',
        compliance: 98,
        difficulty: 'intermediario',
        features: [
          'Avatar 3D hiper-realista',
          'Casos práticos reais',
          'Checklist interativo',
          'Simulação de acidentes',
          'Certificação automática'
        ],
        preview: '/nr12-preview.jpg',
        downloadCount: 1247,
        rating: 4.9,
        isNew: false
      },
      {
        id: '2',
        nr: 'NR-33',
        title: 'Trabalho em Espaços Confinados',
        description: 'Treinamento especializado para espaços confinados com IA de detecção de riscos',
        category: 'operacao',
        industry: ['Petroquímica', 'Construção', 'Mineração'],
        duration: '60 min',
        compliance: 97,
        difficulty: 'avancado',
        features: [
          'Simulação 3D realista',
          'Detecção IA de gases',
          'Procedimentos de emergência',
          'EPI obrigatório',
          'Monitoramento contínuo'
        ],
        preview: '/nr33-preview.jpg',
        downloadCount: 892,
        rating: 4.8,
        isNew: true
      },
      {
        id: '3',
        nr: 'NR-35',
        title: 'Trabalho em Altura',
        description: 'Template com realidade aumentada para treinamento em altura',
        category: 'treinamento',
        industry: ['Construção Civil', 'Telecomunicações', 'Elétrica'],
        duration: '50 min',
        compliance: 96,
        difficulty: 'intermediario',
        features: [
          'Simulação de altura AR',
          'Equipamentos de segurança',
          'Resgate em altura',
          'Plano de trabalho',
          'Inspeção de EPI'
        ],
        preview: '/nr35-preview.jpg',
        downloadCount: 1156,
        rating: 4.7,
        isNew: false
      },
      {
        id: '4',
        nr: 'NR-10',
        title: 'Segurança em Instalações Elétricas',
        description: 'Treinamento completo com simulador elétrico interativo',
        category: 'seguranca',
        industry: ['Elétrica', 'Industrial', 'Predial'],
        duration: '40 min',
        compliance: 99,
        difficulty: 'intermediario',
        features: [
          'Simulador elétrico 3D',
          'Análise de risco automática',
          'Procedimentos de bloqueio',
          'Primeiros socorros',
          'Normas técnicas atualizadas'
        ],
        preview: '/nr10-preview.jpg',
        downloadCount: 2031,
        rating: 4.9,
        isNew: false
      },
      {
        id: '5',
        nr: 'NR-18',
        title: 'Condições e Meio Ambiente do Trabalho na Construção',
        description: 'Template específico para construção civil com IA de prevenção',
        category: 'operacao',
        industry: ['Construção Civil', 'Infraestrutura'],
        duration: '55 min',
        compliance: 95,
        difficulty: 'avancado',
        features: [
          'Canteiro de obras virtual',
          'IA prevenção acidentes',
          'PCMAT integrado',
          'DDS automático',
          'Relatórios de segurança'
        ],
        preview: '/nr18-preview.jpg',
        downloadCount: 743,
        rating: 4.6,
        isNew: true
      },
      {
        id: '6',
        nr: 'NR-06',
        title: 'Equipamentos de Proteção Individual',
        description: 'Treinamento interativo sobre uso correto de EPIs',
        category: 'treinamento',
        industry: ['Industrial', 'Química', 'Hospitalar'],
        duration: '30 min',
        compliance: 97,
        difficulty: 'basico',
        features: [
          'Catálogo EPI 3D',
          'Teste de adequação AR',
          'Manutenção preventiva',
          'Vida útil inteligente',
          'Certificação CA'
        ],
        preview: '/nr06-preview.jpg',
        downloadCount: 3210,
        rating: 4.8,
        isNew: false
      }
    ]

    setTemplates(mockTemplates)
    setFilteredTemplates(mockTemplates)
  }, [])

  // Filtros inteligentes
  useEffect(() => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.nr.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedNR) {
      filtered = filtered.filter(template => template.nr === selectedNR)
    }

    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    if (selectedIndustry) {
      filtered = filtered.filter(template => 
        template.industry.includes(selectedIndustry)
      )
    }

    setFilteredTemplates(filtered)
  }, [searchTerm, selectedNR, selectedCategory, selectedIndustry, templates])

  const generateTemplate = async (templateId: string) => {
    setIsLoading(true)
    
    // Simulação de geração de template
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    toast.success('Template NR gerado com sucesso!')
  }

  const previewTemplate = (templateId: string) => {
    toast.success('Abrindo preview do template...')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basico': return 'bg-green-100 text-green-800'
      case 'intermediario': return 'bg-yellow-100 text-yellow-800'
      case 'avancado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seguranca': return <Shield className="h-4 w-4" />
      case 'operacao': return <Settings className="h-4 w-4" />
      case 'emergencia': return <AlertTriangle className="h-4 w-4" />
      case 'treinamento': return <BookOpen className="h-4 w-4" />
      default: return <FileCheck className="h-4 w-4" />
    }
  }

  const uniqueNRs = Array.from(new Set(templates.map(t => t.nr))).sort()
  const uniqueIndustries = Array.from(new Set(templates.flatMap(t => t.industry))).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-600 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-green-900">
                  Templates NR Inteligentes
                </CardTitle>
                <p className="text-green-700 mt-1">
                  Templates especializados com IA e compliance automático
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                {filteredTemplates.length} Templates
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                IA Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Norma Regulamentadora</label>
              <Select value={selectedNR} onValueChange={setSelectedNR}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as NRs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as NRs</SelectItem>
                  {uniqueNRs.map(nr => (
                    <SelectItem key={nr} value={nr}>{nr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas categorias</SelectItem>
                  <SelectItem value="seguranca">Segurança</SelectItem>
                  <SelectItem value="operacao">Operação</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Setor</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos setores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos setores</SelectItem>
                  {uniqueIndustries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Templates */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-all duration-300">
            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-gray-400" />
              </div>
              {template.isNew && (
                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                  Novo
                </Badge>
              )}
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header do Template */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-blue-100 text-blue-800 font-semibold">
                      {template.nr}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                    {template.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <Clock className="h-4 w-4 mx-auto text-gray-500 mb-1" />
                    <span className="text-xs text-gray-600">{template.duration}</span>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <CheckCircle2 className="h-4 w-4 mx-auto text-green-500 mb-1" />
                    <span className="text-xs text-green-600">{template.compliance}% Conforme</span>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <Download className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                    <span className="text-xs text-blue-600">{template.downloadCount}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  <Badge className={getDifficultyColor(template.difficulty)} variant="outline">
                    {template.difficulty}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-600" variant="outline">
                    {getCategoryIcon(template.category)}
                    <span className="ml-1 capitalize">{template.category}</span>
                  </Badge>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Recursos:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.features.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Setores */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Setores:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.industry.map((industry, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                        <Building className="h-3 w-3 mr-1" />
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    onClick={() => previewTemplate(template.id)}
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    onClick={() => generateTemplate(template.id)}
                    disabled={isLoading}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Gerar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Nenhum resultado encontrado */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <FileCheck className="h-16 w-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Nenhum template encontrado
                </h3>
                <p className="text-gray-600 mt-1">
                  Tente ajustar os filtros ou buscar por outros termos
                </p>
              </div>
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedNR('')
                  setSelectedCategory('')
                  setSelectedIndustry('')
                }}
                variant="outline"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
