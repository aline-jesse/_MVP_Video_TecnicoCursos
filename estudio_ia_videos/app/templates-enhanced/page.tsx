'use client';

/**
 * 📚 Enhanced Template Library - Professional template system
 * Advanced template management with categorization and real-time preview
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Search, 
  Filter, 
  Star, 
  Download,
  Eye,
  Calendar,
  Users,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock,
  BookOpen,
  Shield,
  Zap,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'nr' | 'safety' | 'corporate' | 'training' | 'compliance';
  subcategory: string;
  duration: number; // em segundos
  difficulty: 'basic' | 'intermediate' | 'advanced';
  rating: number;
  usageCount: number;
  tags: string[];
  thumbnailUrl: string;
  previewUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  isPopular: boolean;
  isNew: boolean;
  requirements: string[];
  features: string[];
  estimatedTime: string;
  targetAudience: string[];
}

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: 'nr-12-basic',
    title: 'NR-12 - Segurança em Máquinas e Equipamentos',
    description: 'Template completo para treinamento em segurança de máquinas conforme NR-12',
    category: 'nr',
    subcategory: 'NR-12',
    duration: 1800, // 30 minutos
    difficulty: 'intermediate',
    rating: 4.8,
    usageCount: 1250,
    tags: ['segurança', 'máquinas', 'equipamentos', 'nr-12', 'proteção'],
    thumbnailUrl: '/nr12-thumb.jpg',
    previewUrl: '/preview/nr12.mp4',
    authorId: 'system',
    authorName: 'Estúdio IA',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-01'),
    isPremium: false,
    isPopular: true,
    isNew: false,
    requirements: ['Conhecimento básico em segurança', 'Acesso aos equipamentos'],
    features: ['Avatar narrador', 'Animações 3D', 'Quiz interativo', 'Certificado'],
    estimatedTime: '30-45 min',
    targetAudience: ['Operadores', 'Supervisores', 'Técnicos']
  },
  {
    id: 'nr-33-espacos-confinados',
    title: 'NR-33 - Trabalho em Espaços Confinados',
    description: 'Treinamento especializado para trabalho seguro em espaços confinados',
    category: 'nr',
    subcategory: 'NR-33',
    duration: 2400, // 40 minutos
    difficulty: 'advanced',
    rating: 4.9,
    usageCount: 890,
    tags: ['espaços confinados', 'nr-33', 'gases', 'ventilação', 'resgate'],
    thumbnailUrl: '/nr33-thumb.jpg',
    previewUrl: '/preview/nr33.mp4',
    authorId: 'system',
    authorName: 'Estúdio IA',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-09-20'),
    isPremium: true,
    isPopular: true,
    isNew: false,
    requirements: ['Certificação básica', 'Exame médico válido'],
    features: ['Simulação VR', 'Cenários reais', 'Avaliação prática', 'Monitoramento'],
    estimatedTime: '40-60 min',
    targetAudience: ['Trabalhadores qualificados', 'Supervisores', 'Equipe de resgate']
  },
  {
    id: 'nr-35-trabalho-altura',
    title: 'NR-35 - Trabalho em Altura',
    description: 'Capacitação completa para trabalho seguro em altura',
    category: 'nr',
    subcategory: 'NR-35',
    duration: 2700, // 45 minutos
    difficulty: 'intermediate',
    rating: 4.7,
    usageCount: 2100,
    tags: ['altura', 'nr-35', 'cinto', 'ancoragem', 'queda'],
    thumbnailUrl: '/nr35-thumb.jpg',
    previewUrl: '/preview/nr35.mp4',
    authorId: 'system',
    authorName: 'Estúdio IA',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-10-05'),
    isPremium: false,
    isPopular: true,
    isNew: true,
    requirements: ['Exame médico', 'Aptidão física'],
    features: ['Demonstrações práticas', 'Checklist digital', 'Realidade aumentada'],
    estimatedTime: '45-60 min',
    targetAudience: ['Trabalhadores em altura', 'Eletricistas', 'Pintores', 'Soldadores']
  },
  {
    id: 'corporate-onboarding',
    title: 'Integração Corporativa Moderna',
    description: 'Template para integração de novos colaboradores com IA',
    category: 'corporate',
    subcategory: 'Onboarding',
    duration: 1200, // 20 minutos
    difficulty: 'basic',
    rating: 4.5,
    usageCount: 680,
    tags: ['integração', 'rh', 'colaboradores', 'cultura', 'valores'],
    thumbnailUrl: '/corporate-thumb.jpg',
    authorId: 'system',
    authorName: 'Estúdio IA',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-09-15'),
    isPremium: true,
    isPopular: false,
    isNew: true,
    requirements: ['Nenhum'],
    features: ['Avatar personalizado', 'Gamificação', 'Progress tracking'],
    estimatedTime: '20-30 min',
    targetAudience: ['Novos funcionários', 'RH', 'Gestores']
  }
];

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: BookOpen, count: SAMPLE_TEMPLATES.length },
  { id: 'nr', name: 'Normas Regulamentadoras', icon: Shield, count: 3 },
  { id: 'safety', name: 'Segurança do Trabalho', icon: AlertTriangle, count: 0 },
  { id: 'corporate', name: 'Corporativo', icon: Users, count: 1 },
  { id: 'training', name: 'Treinamentos', icon: Target, count: 0 },
  { id: 'compliance', name: 'Compliance', icon: Award, count: 0 }
];

export default function EnhancedTemplateLibrary() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'duration'>('popular');

  // Filter and sort templates
  useEffect(() => {
    let filtered = templates;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.tags.some(tag => tag.toLowerCase().includes(term)) ||
        t.subcategory.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'newest':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchTerm, sortBy]);

  const handleUseTemplate = (template: Template) => {
    toast({
      title: "Template Selecionado",
      description: `Iniciando criação com template: ${template.title}`,
    });
    
    // Aqui seria redirecionado para o editor com o template
    console.log('Using template:', template.id);
  };

  const handlePreview = (template: Template) => {
    toast({
      title: "Preview do Template",
      description: `Abrindo preview: ${template.title}`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    if (cat) {
      const Icon = cat.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <BookOpen className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            📚 Biblioteca de Templates Avançada
          </h1>
          <p className="text-xl text-gray-600">
            Templates profissionais para criar vídeos de treinamento rapidamente
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{templates.length}</div>
              <div className="text-sm text-gray-600">Templates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {templates.filter(t => t.isPopular).length}
              </div>
              <div className="text-sm text-gray-600">Populares</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {templates.filter(t => t.isNew).length}
              </div>
              <div className="text-sm text-gray-600">Novos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {templates.filter(t => t.isPremium).length}
              </div>
              <div className="text-sm text-gray-600">Premium</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar templates por título, categoria, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('popular')}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Popular
                </Button>
                <Button
                  variant={sortBy === 'newest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('newest')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Novos
                </Button>
                <Button
                  variant={sortBy === 'rating' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('rating')}
                >
                  <Award className="h-4 w-4 mr-1" />
                  Avaliação
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories and Templates */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Categorias</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {CATEGORIES.map(category => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <span className="flex-1 text-left">{category.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {category.count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Templates Grid */}
          <div className="lg:col-span-3">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                  <p className="text-gray-600 mb-4">
                    Tente ajustar os filtros ou termo de busca
                  </p>
                  <Button onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}>
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTemplates.map(template => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getCategoryIcon(template.category)}
                            <Badge className={getDifficultyColor(template.difficulty)}>
                              {template.difficulty}
                            </Badge>
                            {template.isPremium && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                            {template.isNew && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Novo
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg leading-tight">
                            {template.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Template Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{template.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{template.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{template.usageCount}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Features */}
                        <div className="text-sm">
                          <div className="font-medium mb-1">Recursos:</div>
                          <div className="text-gray-600">
                            {template.features.slice(0, 2).join(', ')}
                            {template.features.length > 2 && '...'}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => handleUseTemplate(template)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Usar Template
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}