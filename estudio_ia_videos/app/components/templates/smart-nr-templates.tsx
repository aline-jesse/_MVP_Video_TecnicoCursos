
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
  Search,
  Filter,
  Download,
  Eye,
  Zap,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Shield,
  Wrench,
  HardHat,
  AlertTriangle,
  FileText,
  Target,
  Briefcase,
  Building2,
  Factory,
  Truck
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface NRTemplate {
  id: string
  name: string
  norma: string
  description: string
  category: 'seguranca' | 'saude' | 'meio-ambiente' | 'qualidade'
  industry: string[]
  duration: string
  slides: number
  compliance: number
  thumbnail: string
  features: string[]
  lastUpdated: string
  downloads: number
  rating: number
  isNew?: boolean
  isPremium?: boolean
  aiOptimized: boolean
}

const mockNRTemplates: NRTemplate[] = [
  {
    id: 'nr12-maquinas',
    name: 'NR-12 Segurança em Máquinas e Equipamentos',
    norma: 'NR-12',
    description: 'Template completo para treinamento em segurança de máquinas e equipamentos de trabalho',
    category: 'seguranca',
    industry: ['Industrial', 'Manufatura', 'Metalurgia'],
    duration: '45 min',
    slides: 32,
    compliance: 98,
    thumbnail: '/nr12-thumb.jpg',
    features: [
      'Procedimentos de bloqueio',
      'Inspeções de segurança',
      'EPIs específicos',
      'Casos práticos reais',
      'Quiz interativo'
    ],
    lastUpdated: '2025-09-20',
    downloads: 2847,
    rating: 4.9,
    isNew: true,
    aiOptimized: true
  },
  {
    id: 'nr33-espacos-confinados',
    name: 'NR-33 Segurança e Saúde em Espaços Confinados',
    norma: 'NR-33',
    description: 'Treinamento completo para trabalho seguro em espaços confinados',
    category: 'seguranca',
    industry: ['Petróleo & Gás', 'Química', 'Saneamento'],
    duration: '60 min',
    slides: 48,
    compliance: 100,
    thumbnail: '/nr33-thumb.jpg',
    features: [
      'Identificação de espaços confinados',
      'Permissão de trabalho',
      'Monitoramento atmosférico',
      'Resgate em emergências',
      'Simulação 3D'
    ],
    lastUpdated: '2025-09-18',
    downloads: 3521,
    rating: 5.0,
    isPremium: true,
    aiOptimized: true
  },
  {
    id: 'nr35-trabalho-altura',
    name: 'NR-35 Trabalho em Altura',
    norma: 'NR-35',
    description: 'Capacitação para trabalho seguro em altura com equipamentos adequados',
    category: 'seguranca',
    industry: ['Construção Civil', 'Telecomunicações', 'Energia'],
    duration: '40 min',
    slides: 36,
    compliance: 96,
    thumbnail: '/nr35-thumb.jpg',
    features: [
      'Análise de risco',
      'Sistemas de proteção',
      'Inspeção de EPIs',
      'Procedimentos de resgate',
      'Realidade virtual'
    ],
    lastUpdated: '2025-09-15',
    downloads: 4205,
    rating: 4.8,
    aiOptimized: true
  },
  {
    id: 'nr10-eletrica',
    name: 'NR-10 Segurança em Instalações Elétricas',
    norma: 'NR-10',
    description: 'Treinamento fundamental para trabalho com eletricidade',
    category: 'seguranca',
    industry: ['Elétrico', 'Manutenção', 'Construção'],
    duration: '50 min',
    slides: 42,
    compliance: 94,
    thumbnail: '/nr12-eletrico.jpg',
    features: [
      'Riscos elétricos',
      'Medidas de proteção',
      'Procedimentos de trabalho',
      'Primeiros socorros',
      'Casos reais'
    ],
    lastUpdated: '2025-09-12',
    downloads: 5632,
    rating: 4.7,
    aiOptimized: true
  },
  {
    id: 'nr18-construcao',
    name: 'NR-18 Condições e Meio Ambiente de Trabalho na Indústria da Construção',
    norma: 'NR-18',
    description: 'Segurança específica para canteiros de obras',
    category: 'seguranca',
    industry: ['Construção Civil', 'Engenharia'],
    duration: '55 min',
    slides: 45,
    compliance: 97,
    thumbnail: '/corporativa-thumb.jpg',
    features: [
      'PCMAT',
      'Áreas de vivência',
      'Equipamentos de proteção coletiva',
      'Ordem e limpeza',
      'Gestão de segurança'
    ],
    lastUpdated: '2025-09-10',
    downloads: 3890,
    rating: 4.6,
    aiOptimized: false
  }
]

export default function SmartNRTemplates() {
  const [templates, setTemplates] = useState<NRTemplate[]>(mockNRTemplates)
  const [filteredTemplates, setFilteredTemplates] = useState<NRTemplate[]>(mockNRTemplates)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedNorma, setSelectedNorma] = useState<string>('all')
  const [showOnlyAI, setShowOnlyAI] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Filtros
  useEffect(() => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.norma.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    if (selectedNorma !== 'all') {
      filtered = filtered.filter(template => template.norma === selectedNorma)
    }

    if (showOnlyAI) {
      filtered = filtered.filter(template => template.aiOptimized)
    }

    setFilteredTemplates(filtered)
  }, [searchTerm, selectedCategory, selectedNorma, showOnlyAI, templates])

  const generateCustomTemplate = async () => {
    setIsGenerating(true)
    toast.info('Gerando template personalizado com IA...')
    
    try {
      // Simulação de geração IA
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newTemplate: NRTemplate = {
        id: 'custom-' + Date.now(),
        name: 'Template Personalizado - NR-23 (IA Generated)',
        norma: 'NR-23',
        description: 'Template gerado automaticamente pela IA baseado nas suas necessidades específicas',
        category: 'seguranca',
        industry: ['Geral'],
        duration: '35 min',
        slides: 28,
        compliance: 99,
        thumbnail: '/nr12-thumb.jpg',
        features: [
          'Conteúdo adaptado IA',
          'Slides otimizados',
          'Compliance automático',
          'Casos específicos da empresa',
          'Linguagem personalizada'
        ],
        lastUpdated: new Date().toISOString().split('T')[0],
        downloads: 0,
        rating: 0,
        isNew: true,
        aiOptimized: true
      }
      
      setTemplates([newTemplate, ...templates])
      toast.success('Template personalizado gerado com sucesso!')
      
    } catch (error) {
      toast.error('Erro ao gerar template. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadTemplate = (template: NRTemplate) => {
    toast.success(`Template "${template.name}" baixado com sucesso!`)
    
    // Atualizar contador de downloads
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, downloads: t.downloads + 1 }
        : t
    ))
  }

  const previewTemplate = (template: NRTemplate) => {
    toast.info(`Abrindo preview do template "${template.name}"`)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seguranca': return <Shield className="h-4 w-4" />
      case 'saude': return <HardHat className="h-4 w-4" />
      case 'meio-ambiente': return <BookOpen className="h-4 w-4" />
      case 'qualidade': return <Target className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getIndustryIcon = (industry: string) => {
    if (industry.includes('Construção')) return <Building2 className="h-4 w-4" />
    if (industry.includes('Industrial')) return <Factory className="h-4 w-4" />
    if (industry.includes('Petróleo')) return <Truck className="h-4 w-4" />
    return <Briefcase className="h-4 w-4" />
  }

  const normas = ['all', ...Array.from(new Set(templates.map(t => t.norma)))]
  const categories = ['all', 'seguranca', 'saude', 'meio-ambiente', 'qualidade']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Smart NR Templates</h1>
            <p className="text-muted-foreground">
              Templates inteligentes para Normas Regulamentadoras com compliance automático
            </p>
          </div>
        </div>
        <Button 
          onClick={generateCustomTemplate}
          disabled={isGenerating}
          className="flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Gerando...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>Gerar Personalizado</span>
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="all">Todas as categorias</option>
                <option value="seguranca">Segurança</option>
                <option value="saude">Saúde</option>
                <option value="meio-ambiente">Meio Ambiente</option>
                <option value="qualidade">Qualidade</option>
              </select>
            </div>

            {/* Norma Filter */}
            <div className="space-y-2">
              <Label>Norma</Label>
              <select
                value={selectedNorma}
                onChange={(e) => setSelectedNorma(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                {normas.map(norma => (
                  <option key={norma} value={norma}>
                    {norma === 'all' ? 'Todas as normas' : norma}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Filter */}
            <div className="space-y-2">
              <Label>Filtros Especiais</Label>
              <div className="flex items-center space-x-2 p-2 border rounded-md">
                <Switch
                  checked={showOnlyAI}
                  onCheckedChange={setShowOnlyAI}
                />
                <Label className="text-sm">Apenas IA Otimizados</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <div className="relative">
              {/* Thumbnail */}
              <div className="aspect-video relative bg-muted rounded-t-lg overflow-hidden">
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/nr12-thumb.jpg'
                  }}
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {template.isNew && (
                    <Badge variant="destructive" className="text-xs">Novo</Badge>
                  )}
                  {template.isPremium && (
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  )}
                  {template.aiOptimized && (
                    <Badge className="text-xs bg-purple-600">IA</Badge>
                  )}
                </div>
                
                {/* Compliance Score */}
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-xs bg-white/90">
                    {template.compliance}% NR
                  </Badge>
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button size="sm" onClick={() => previewTemplate(template)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => downloadTemplate(template)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <Badge variant="outline" className="text-xs">
                    {template.norma}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  ⭐ {template.rating > 0 ? template.rating : 'Novo'}
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{template.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{template.slides} slides</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{template.downloads}</span>
                </div>
              </div>

              <Separator />

              {/* Industries */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Indústrias</div>
                <div className="flex flex-wrap gap-1">
                  {template.industry.slice(0, 2).map((industry) => (
                    <Badge key={industry} variant="outline" className="text-xs">
                      {industry}
                    </Badge>
                  ))}
                  {template.industry.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.industry.length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Destaques</div>
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-1 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => downloadTemplate(template)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Usar Template
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => previewTemplate(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum template encontrado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Não encontramos templates que correspondam aos seus critérios de busca. 
              Tente ajustar os filtros ou gerar um template personalizado.
            </p>
            <Button onClick={generateCustomTemplate} className="mt-4">
              <Zap className="h-4 w-4 mr-2" />
              Gerar Template Personalizado
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              <div className="text-xs text-muted-foreground">Templates Disponíveis</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {templates.filter(t => t.aiOptimized).length}
              </div>
              <div className="text-xs text-muted-foreground">IA Otimizados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(templates.reduce((acc, t) => acc + t.compliance, 0) / templates.length)}%
              </div>
              <div className="text-xs text-muted-foreground">Compliance Médio</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {templates.reduce((acc, t) => acc + t.downloads, 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Downloads Totais</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
