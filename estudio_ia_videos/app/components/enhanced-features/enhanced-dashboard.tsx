
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Video, 
  Zap, 
  BarChart3, 
  Users, 
  Shield,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Play,
  Edit,
  Settings,
  Wand2,
  BookOpen,
  Smartphone,
  Mic,
  Languages,
  Film,
  Globe,
  Headphones,
  Filter,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalProjects: number;
  totalSlides: number;
  totalDuration: number;
  completionRate: number;
  activeUsers: number;
  nrCompliance: number;
}

interface RecentProject {
  id: string;
  name: string;
  status: 'draft' | 'processing' | 'ready' | 'rendering';
  progress: number;
  createdAt: string;
  slides: number;
  nrTypes?: string[];
}

const EnhancedDashboard: React.FC = () => {
  const router = useRouter();
  const [filterVisible, setFilterVisible] = useState(false);

  // Mock data - em produção, vir de API
  const stats: DashboardStats = {
    totalProjects: 53, // Updated for Sprint 20
    totalSlides: 1425,
    totalDuration: 241, // minutos
    completionRate: 96, // Improved with new features
    activeUsers: 18, // More users with new features
    nrCompliance: 92 // Better compliance with AI features
  };

  // Handle button clicks to fix inactive buttons
  const handleFilter = () => {
    setFilterVisible(!filterVisible);
    toast.success('Filtros ' + (filterVisible ? 'ocultados' : 'exibidos'));
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const recentProjects: RecentProject[] = [
    {
      id: '1',
      name: 'Treinamento NR-12 Máquinas',
      status: 'ready',
      progress: 100,
      createdAt: '2024-01-15',
      slides: 28,
      nrTypes: ['NR-12']
    },
    {
      id: '2', 
      name: 'Segurança em Espaços Confinados',
      status: 'processing',
      progress: 65,
      createdAt: '2024-01-14',
      slides: 35,
      nrTypes: ['NR-33']
    },
    {
      id: '3',
      name: 'Trabalho em Altura - Básico',
      status: 'draft',
      progress: 25,
      createdAt: '2024-01-13', 
      slides: 42,
      nrTypes: ['NR-35']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'rendering': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Pronto';
      case 'processing': return 'Processando';
      case 'rendering': return 'Renderizando';
      default: return 'Rascunho';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Estúdio IA de Vídeos - Sprint 21: Real-time Collaboration & AI Content Intelligence
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleFilter}>
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Link href="/pptx-production">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Novo Projeto PPTX
            </Button>
          </Link>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      {filterVisible && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600 dark:text-blue-400">
              <Search className="h-4 w-4 mr-2" />
              Filtros Avançados - Sprint 20
            </CardTitle>
            <CardDescription>
              Configure filtros para projetos, NRs e funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status do Projeto</label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                  <option>Todos os Status</option>
                  <option>Rascunho</option>
                  <option>Processando</option>
                  <option>Pronto</option>
                  <option>Renderizando</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Normas Regulamentadoras</label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                  <option>Todas as NRs</option>
                  <option>NR-12 (Máquinas)</option>
                  <option>NR-33 (Espaços Confinados)</option>
                  <option>NR-35 (Trabalho em Altura)</option>
                  <option>NR-06 (EPIs)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Funcionalidades</label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                  <option>Todas as Features</option>
                  <option>Voice Cloning</option>
                  <option>Video Pipeline</option>
                  <option>Multi-idiomas</option>
                  <option>Analytics BI</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                  <option>Último mês</option>
                  <option>Últimos 3 meses</option>
                  <option>Último ano</option>
                  <option>Todo o período</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => toast.success('Filtros aplicados!')}>
                Aplicar Filtros
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success('Filtros limpos!')}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-gray-600 text-sm">Projetos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalSlides}</p>
                <p className="text-gray-600 text-sm">Slides</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{Math.round(stats.totalDuration / 60)}h</p>
                <p className="text-gray-600 text-sm">Conteúdo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-gray-600 text-sm">Taxa Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-cyan-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-gray-600 text-sm">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.nrCompliance}%</p>
                <p className="text-gray-600 text-sm">Compliance NR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seções Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projetos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Projetos Recentes
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso dos seus treinamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{project.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>{project.slides} slides</span>
                      <span>•</span>
                      <span>{getStatusText(project.status)}</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      {project.nrTypes?.map(nr => (
                        <Badge key={nr} variant="outline" className="text-xs">
                          {nr}
                        </Badge>
                      ))}
                    </div>

                    <Progress value={project.progress} className="h-1" />
                  </div>
                  
                  <div className="ml-4">
                    <Button size="sm" variant="outline">
                      {project.status === 'ready' ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <BarChart3 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Link href="/projects">
                <Button variant="outline" className="w-full">
                  Ver Todos os Projetos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sprint 20 - New Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Sprint 20 - Novidades
            </CardTitle>
            <CardDescription>
              Voice Cloning, Video Pipeline e Multi-idiomas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {/* ElevenLabs Professional Studio */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Mic className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">ElevenLabs Studio</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">29 vozes premium + clonagem</p>
                  </div>
                </div>
                <Link href="/elevenlabs-professional-studio">
                  <Button size="sm">
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* Advanced Video Pipeline */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Film className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Video Pipeline</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">FFmpeg + 8 presets profissionais</p>
                  </div>
                </div>
                <Link href="/advanced-video-pipeline">
                  <Button size="sm">
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* International Voice Studio */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Languages className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Multi-idiomas</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">76 vozes em 12 idiomas</p>
                  </div>
                </div>
                <Link href="/international-voice-studio">
                  <Button size="sm">
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sprint 19 Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Analytics & BI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Sprint 19 - Analytics & IA
            </CardTitle>
            <CardDescription>
              Funcionalidades avançadas do Estúdio IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Business Intelligence */}
              <Link href="/business-intelligence-dashboard">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Business Intelligence</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Analytics executivo em tempo real
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      ✨ Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* AI Content Generator */}
              <Link href="/ai-content-generator">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wand2 className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Gerador IA de Conteúdo</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Criação inteligente de treinamentos
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      ✨ Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Smart NR Templates */}
              <Link href="/smart-nr-templates">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium">Templates NR Inteligentes</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Biblioteca premium com compliance
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      ✨ Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Team Collaboration Hub */}
              <Link href="/team-collaboration-hub">
                <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-orange-600" />
                      <div>
                        <h4 className="font-medium">Colaboração em Equipe</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Trabalho em tempo real
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      ✨ Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/pptx-production">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Upload className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium">PPTX Profissional</h4>
                        <p className="text-sm text-gray-600">
                          Upload e conversão avançada
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Sprint 17
                    </Badge>
                  </div>
                </div>
              </Link>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-medium">Compliance NR</h4>
                      <p className="text-sm text-gray-600">
                        Detecção automática de normas
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    87% Precisão
                  </Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Avatares 3D</h4>
                      <p className="text-sm text-gray-600">
                        Apresentadores hiper-realistas
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">
                    Pro
                  </Badge>
                </div>
              </div>

              {/* Sprint 19 - Novos Recursos */}
              <Link href="/business-intelligence-dashboard">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Business Intelligence</h4>
                        <p className="text-sm text-gray-600">
                          Analytics executivo em tempo real
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      🆕 Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/ai-content-generator">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wand2 className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Gerador IA de Conteúdo</h4>
                        <p className="text-sm text-gray-600">
                          Criação inteligente de treinamentos
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      🆕 Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/smart-nr-templates">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium">Templates NR Inteligentes</h4>
                        <p className="text-sm text-gray-600">
                          Biblioteca premium com compliance
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      🆕 Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/team-collaboration-hub">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-indigo-600" />
                      <div>
                        <h4 className="font-medium">Hub de Colaboração</h4>
                        <p className="text-sm text-gray-600">
                          Trabalho em equipe em tempo real
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      🆕 Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/mobile-studio-pwa">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-6 w-6 text-cyan-600" />
                      <div>
                        <h4 className="font-medium">Mobile Studio PWA</h4>
                        <p className="text-sm text-gray-600">
                          Experiência mobile offline-first
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-cyan-100 text-cyan-800">
                      🆕 Sprint 19
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Sprint 20 - Novos Recursos Avançados */}
              <Link href="/voice-cloning-studio">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 text-purple-600 flex items-center justify-center text-lg">🎙️</div>
                      <div>
                        <h4 className="font-medium">Voice Cloning Studio</h4>
                        <p className="text-sm text-gray-600">
                          Clonagem de voz com ElevenLabs + 29 vozes premium
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      🚀 Sprint 20
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Sprint 21 - Real-time Collaboration & AI Intelligence */}
              <Link href="/live-editing-room">
                <div className="p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-colors border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 text-blue-600 flex items-center justify-center text-lg">🤝</div>
                      <div>
                        <h4 className="font-medium">Live Editing Room</h4>
                        <p className="text-sm text-gray-600">
                          Edição colaborativa em tempo real + comentários
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      ✨ Sprint 21
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/ai-content-intelligence">
                <div className="p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 cursor-pointer transition-colors border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 text-purple-600 flex items-center justify-center text-lg">🧠</div>
                      <div>
                        <h4 className="font-medium">AI Content Intelligence</h4>
                        <p className="text-sm text-gray-600">
                          Análise preditiva + otimização automática
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                      ✨ Sprint 21
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/version-control">
                <div className="p-4 border rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 text-indigo-600 flex items-center justify-center text-lg">📚</div>
                      <div>
                        <h4 className="font-medium">Version Control</h4>
                        <p className="text-sm text-gray-600">
                          Controle de versões Git-like para vídeos
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                      ✨ Sprint 21
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/smart-recommendations">
                <div className="p-4 border rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 cursor-pointer transition-colors border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 text-amber-600 flex items-center justify-center text-lg">✨</div>
                      <div>
                        <h4 className="font-medium">Smart Recommendations</h4>
                        <p className="text-sm text-gray-600">
                          Sugestões inteligentes baseadas em ML
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      ✨ Sprint 21
                    </Badge>
                  </div>
                </div>
              </Link>

              <Link href="/video-pipeline-studio">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 text-blue-600 flex items-center justify-center text-lg">🎬</div>
                      <div>
                        <h4 className="font-medium">Advanced Video Pipeline</h4>
                        <p className="text-sm text-gray-600">
                          Renderização 4K com FFmpeg + sistema de filas
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                      🚀 Sprint 20
                    </Badge>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">2.3s</div>
            <p className="text-gray-600 text-sm mb-4">Por slide processado</p>
            <Progress value={85} />
            <p className="text-xs text-gray-500 mt-2">85% mais rápido que concorrentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualidade de Extração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">98.5%</div>
            <p className="text-gray-600 text-sm mb-4">Precisão no conteúdo</p>
            <Progress value={98.5} />
            <p className="text-xs text-gray-500 mt-2">IA de última geração</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satisfação do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <div className="text-3xl font-bold mr-2">4.8</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">Avaliação média</p>
            <Progress value={96} />
            <p className="text-xs text-gray-500 mt-2">96% recomendam</p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Transforme suas apresentações em vídeos profissionais
          </h2>
          <p className="text-blue-100 mb-6">
            Use IA avançada para criar treinamentos de segurança do trabalho conformes com as Normas Regulamentadoras
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/pptx-production">
              <Button size="lg" variant="secondary">
                <Upload className="h-5 w-5 mr-2" />
                Começar Agora
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Play className="h-5 w-5 mr-2" />
              Ver Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;
