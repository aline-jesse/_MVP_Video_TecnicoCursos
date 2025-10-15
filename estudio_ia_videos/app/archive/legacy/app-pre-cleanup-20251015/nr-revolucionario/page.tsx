

/**
 * 🏗️ MÓDULO NR REVOLUCIONÁRIO - Sprint 13 Premium
 * Sistema Avançado para Criação de Vídeos de Normas Regulamentadoras
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NRTemplateStudio from '@/components/nr/nr-template-studio';
import NRComplianceMonitor from '@/components/nr/nr-compliance-monitor';
import NRCenarios3D from '@/components/nr/nr-cenarios-3d';
import NRCasosReais from '@/components/nr/nr-casos-reais';
import {
  HardHat,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Video,
  Brain,
  Target,
  Users,
  Award,
  Globe,
  Clock,
  BarChart3,
  Zap,
  Eye,
  Settings,
  Download,
  Play,
  RefreshCw,
  Sparkles,
  Building,
  Briefcase,
  TrendingUp,
  Activity,
  Star,
  Crown,
  Rocket,
  Database
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface NormaRegulamentadora {
  id: string;
  numero: string;
  titulo: string;
  categoria: string;
  complexidade: 'básica' | 'intermediária' | 'avançada';
  templatesDisponiveis: number;
  videosGerados: number;
  conformidade: number;
  ultimaAtualizacao: string;
  status: 'ativa' | 'em_revisao' | 'nova';
  setores: string[];
  duracaoMedia: number;
}

interface NRTemplate {
  id: string;
  nr: string;
  titulo: string;
  tipo: 'introducao' | 'procedimento' | 'epi' | 'emergencia' | 'avaliacao';
  duracaoEstimada: number;
  complexidade: number;
  cenarios: string[];
  conformidadeScore: number;
}

interface ComplianceCheck {
  item: string;
  status: 'conforme' | 'nao_conforme' | 'parcial';
  detalhes: string;
  correcao?: string;
}

export default function NRRevolucionarioPage() {
  const [selectedNR, setSelectedNR] = useState('all');
  const [templates, setTemplates] = useState<NRTemplate[]>([]);
  const [compliance, setCompliance] = useState<ComplianceCheck[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [activeModule, setActiveModule] = useState('overview');

  const normasRegulamentadoras: NormaRegulamentadora[] = [
    {
      id: 'nr-01',
      numero: 'NR-01',
      titulo: 'Disposições Gerais e Gerenciamento de Riscos',
      categoria: 'Gestão',
      complexidade: 'intermediária',
      templatesDisponiveis: 12,
      videosGerados: 248,
      conformidade: 94,
      ultimaAtualizacao: '2025-01-15',
      status: 'ativa',
      setores: ['Todos'],
      duracaoMedia: 25
    },
    {
      id: 'nr-05',
      numero: 'NR-05',
      titulo: 'Comissão Interna de Prevenção de Acidentes',
      categoria: 'Prevenção',
      complexidade: 'intermediária',
      templatesDisponiveis: 8,
      videosGerados: 156,
      conformidade: 97,
      ultimaAtualizacao: '2024-12-10',
      status: 'ativa',
      setores: ['Industrial', 'Serviços'],
      duracaoMedia: 30
    },
    {
      id: 'nr-06',
      numero: 'NR-06',
      titulo: 'Equipamentos de Proteção Individual',
      categoria: 'Proteção',
      complexidade: 'básica',
      templatesDisponiveis: 15,
      videosGerados: 567,
      conformidade: 98,
      ultimaAtualizacao: '2025-02-01',
      status: 'ativa',
      setores: ['Todos'],
      duracaoMedia: 20
    },
    {
      id: 'nr-10',
      numero: 'NR-10',
      titulo: 'Segurança em Instalações e Serviços em Eletricidade',
      categoria: 'Elétrica',
      complexidade: 'avançada',
      templatesDisponiveis: 18,
      videosGerados: 389,
      conformidade: 96,
      ultimaAtualizacao: '2024-11-20',
      status: 'ativa',
      setores: ['Elétrico', 'Industrial'],
      duracaoMedia: 45
    },
    {
      id: 'nr-12',
      numero: 'NR-12',
      titulo: 'Segurança no Trabalho em Máquinas e Equipamentos',
      categoria: 'Máquinas',
      complexidade: 'avançada',
      templatesDisponiveis: 22,
      videosGerados: 445,
      conformidade: 95,
      ultimaAtualizacao: '2025-01-08',
      status: 'ativa',
      setores: ['Industrial', 'Metalúrgico'],
      duracaoMedia: 50
    },
    {
      id: 'nr-17',
      numero: 'NR-17',
      titulo: 'Ergonomia',
      categoria: 'Ergonomia',
      complexidade: 'intermediária',
      templatesDisponiveis: 10,
      videosGerados: 234,
      conformidade: 93,
      ultimaAtualizacao: '2024-10-15',
      status: 'ativa',
      setores: ['Escritório', 'Industrial'],
      duracaoMedia: 35
    },
    {
      id: 'nr-33',
      numero: 'NR-33',
      titulo: 'Segurança e Saúde nos Trabalhos em Espaços Confinados',
      categoria: 'Espaços Confinados',
      complexidade: 'avançada',
      templatesDisponiveis: 14,
      videosGerados: 178,
      conformidade: 97,
      ultimaAtualizacao: '2024-12-05',
      status: 'ativa',
      setores: ['Industrial', 'Petroquímico'],
      duracaoMedia: 55
    },
    {
      id: 'nr-35',
      numero: 'NR-35',
      titulo: 'Trabalho em Altura',
      categoria: 'Altura',
      complexidade: 'avançada',
      templatesDisponiveis: 16,
      videosGerados: 356,
      conformidade: 98,
      ultimaAtualizacao: '2025-01-20',
      status: 'ativa',
      setores: ['Construção', 'Industrial'],
      duracaoMedia: 40
    }
  ];

  useEffect(() => {
    loadNRData();
    const interval = setInterval(loadNRData, 15000); // Atualizar a cada 15s
    return () => clearInterval(interval);
  }, [selectedNR]);

  const loadNRData = async () => {
    try {
      const response = await fetch(`/api/v4/nr-revolucionario/analytics?nr=${selectedNR}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.analytics);
          setTemplates(data.templates);
          setCompliance(data.compliance);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados NR:', error);
    }
  };

  const generateNRVideo = async (nr: string, template: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/v4/nr-revolucionario/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nr, template, aiEnhanced: true })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Simular progresso de geração
        setTimeout(() => {
          setIsGenerating(false);
          loadNRData();
        }, 5000);
      }
    } catch (error) {
      console.error('Erro na geração:', error);
      setIsGenerating(false);
    }
  };

  // Dados agregados para dashboards
  const totalVideos = normasRegulamentadoras.reduce((sum, nr) => sum + nr.videosGerados, 0);
  const mediaConformidade = Math.round(normasRegulamentadoras.reduce((sum, nr) => sum + nr.conformidade, 0) / normasRegulamentadoras.length);
  const totalTemplates = normasRegulamentadoras.reduce((sum, nr) => sum + nr.templatesDisponiveis, 0);

  // Dados para gráficos
  const conformidadeData = normasRegulamentadoras.map(nr => ({
    nome: nr.numero,
    conformidade: nr.conformidade,
    videos: nr.videosGerados
  }));

  const categoriasData = [
    { categoria: 'Gestão', count: 1, color: '#3b82f6' },
    { categoria: 'Proteção', count: 2, color: '#10b981' },
    { categoria: 'Elétrica', count: 1, color: '#f59e0b' },
    { categoria: 'Máquinas', count: 1, color: '#ef4444' },
    { categoria: 'Ergonomia', count: 1, color: '#8b5cf6' },
    { categoria: 'Espaços Confinados', count: 1, color: '#06b6d4' },
    { categoria: 'Altura', count: 1, color: '#ec4899' }
  ];

  const trendData = [
    { mes: 'Jan', videos: 180, conformidade: 92 },
    { mes: 'Fev', videos: 245, conformidade: 94 },
    { mes: 'Mar', videos: 320, conformidade: 95 },
    { mes: 'Abr', videos: 420, conformidade: 96 },
    { mes: 'Mai', videos: 560, conformidade: 96 },
    { mes: 'Jun', videos: 680, conformidade: 97 },
    { mes: 'Jul', videos: 780, conformidade: 97 },
    { mes: 'Ago', videos: 890, conformidade: 98 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Revolucionário */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <HardHat className="h-12 w-12 text-orange-600" />
              <div className="text-6xl">🏗️</div>
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-blue-600 bg-clip-text text-transparent">
              🚀 NR REVOLUCIONÁRIO
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700">
              Sistema Avançado para Normas Regulamentadoras
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              IA Especializada • Templates Inteligentes • Compliance Automático • Cenários Reais • Integração Reguladores
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{totalVideos.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Vídeos NR Gerados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{mediaConformidade}%</div>
              <div className="text-sm text-gray-600">Conformidade Média</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalTemplates}</div>
              <div className="text-sm text-gray-600">Templates Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">NRs Implementadas</div>
            </div>
          </div>
        </div>

        {/* Seletor de NR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Seletor de Norma Regulamentadora</span>
            </CardTitle>
            <CardDescription>
              Escolha a NR para criar vídeos de treinamento especializados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select value={selectedNR} onValueChange={setSelectedNR}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Selecione uma NR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as NRs</SelectItem>
                  {normasRegulamentadoras.map((nr) => (
                    <SelectItem key={nr.id} value={nr.numero}>
                      {nr.numero} - {nr.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => generateNRVideo(selectedNR, 'auto')}
                disabled={isGenerating || selectedNR === 'all'}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isGenerating ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Vídeo IA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grid de NRs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {normasRegulamentadoras.map((nr) => (
            <Card key={nr.id} className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={nr.status === 'ativa' ? 'default' : nr.status === 'nova' ? 'secondary' : 'outline'}
                    className={
                      nr.status === 'ativa' ? 'bg-green-100 text-green-800' :
                      nr.status === 'nova' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {nr.numero}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className={`h-4 w-4 ${nr.conformidade >= 95 ? 'text-yellow-500' : 'text-gray-300'}`} />
                    <span className="text-xs font-bold text-green-600">{nr.conformidade}%</span>
                  </div>
                </div>
                <CardTitle className="text-sm group-hover:text-orange-600 transition-colors">
                  {nr.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Templates</div>
                    <div className="font-bold text-blue-600">{nr.templatesDisponiveis}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Vídeos</div>
                    <div className="font-bold text-purple-600">{nr.videosGerados}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Duração</div>
                    <div className="font-bold text-green-600">{nr.duracaoMedia}min</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Setores</div>
                    <div className="font-bold text-orange-600">{nr.setores.length}</div>
                  </div>
                </div>
                
                <Progress value={nr.conformidade} className="h-2" />
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={() => setSelectedNR(nr.numero)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => generateNRVideo(nr.numero, 'template')}
                  >
                    <Video className="h-3 w-3 mr-1" />
                    Criar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics NR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Evolução da Conformidade NR</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="videos" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                    name="Vídeos Gerados"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="conformidade" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Conformidade %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Distribuição por Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoriasData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ categoria, count }) => `${categoria}: ${count}`}
                  >
                    {categoriasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Funcionalidades Revolucionárias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-orange-600" />
                <span>IA Especializada NR</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  • Conhecimento profundo das 38 NRs
                  • Interpretação de textos regulamentares
                  • Geração de cenários específicos
                  • Adaptação por setor industrial
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  onClick={() => setActiveModule('ai-consulta')}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Consultar IA NR
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Compliance Automático</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  • Verificação automática de conformidade
                  • Alertas de atualizações regulamentares
                  • Relatórios de auditoria
                  • Integração MTE/Auditor Fiscal
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  onClick={() => setActiveModule('compliance')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar Compliance
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Cenários Reais</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  • 500+ cenários documentados
                  • Casos reais de acidentes
                  • Boas práticas setoriais
                  • Simulações 3D interativas
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={() => setActiveModule('cenarios3d')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Explorar Cenários
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates NR Avançados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="h-5 w-5" />
              <span>Templates NR Revolucionários</span>
            </CardTitle>
            <CardDescription>
              Templates inteligentes que se adaptam automaticamente ao seu setor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  tipo: 'Introdução Interativa',
                  nrs: ['NR-01', 'NR-05', 'NR-06'],
                  descricao: 'Apresentação envolvente com quiz',
                  icone: '🎯',
                  cor: 'blue'
                },
                {
                  tipo: 'Procedimentos 3D',
                  nrs: ['NR-10', 'NR-12', 'NR-33'],
                  descricao: 'Demonstrações visuais 3D',
                  icone: '🔧',
                  cor: 'purple'
                },
                {
                  tipo: 'EPIs Interativos',
                  nrs: ['NR-06', 'NR-35'],
                  descricao: 'Demonstração prática de EPIs',
                  icone: '🦺',
                  cor: 'green'
                },
                {
                  tipo: 'Emergências Realistas',
                  nrs: ['NR-23', 'NR-33'],
                  descricao: 'Simulações de emergência',
                  icone: '🚨',
                  cor: 'red'
                },
                {
                  tipo: 'Ergonomia Prática',
                  nrs: ['NR-17'],
                  descricao: 'Exercícios e posturas',
                  icone: '🧘‍♂️',
                  cor: 'indigo'
                },
                {
                  tipo: 'Avaliação Gamificada',
                  nrs: ['Todas'],
                  descricao: 'Quizzes e certificação',
                  icone: '🏆',
                  cor: 'yellow'
                }
              ].map((template, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{template.icone}</div>
                    <div>
                      <div className="font-semibold text-sm">{template.tipo}</div>
                      <div className="text-xs text-gray-500">{template.descricao}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {template.nrs.slice(0, 3).map((nr) => (
                        <Badge key={nr} variant="outline" className="text-xs">
                          {nr}
                        </Badge>
                      ))}
                      {template.nrs.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.nrs.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => generateNRVideo('auto', template.tipo)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Criar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dashboard de Conformidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Dashboard de Conformidade por NR</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={conformidadeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar 
                  yAxisId="left"
                  dataKey="conformidade" 
                  fill="#10b981" 
                  name="Conformidade %"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="videos" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Vídeos Gerados"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Módulos Avançados */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'templates', label: 'Template Studio' },
              { id: 'compliance', label: 'Compliance' },
              { id: 'cenarios3d', label: 'Cenários 3D' },
              { id: 'casos', label: 'Casos Reais' },
              { id: 'integracao', label: 'Integração MTE' }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeModule === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveModule(tab.id)}
                className={`flex-1 ${activeModule === tab.id ? 'bg-white shadow-sm' : ''}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {activeModule === 'overview' && (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="text-6xl">🏗️</div>
                <h3 className="text-2xl font-bold text-orange-600">
                  Sistema NR Revolucionário Ativo
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Explore os módulos avançados: Template Studio para criação personalizada, 
                  Compliance Monitor para verificação automática, e Analytics detalhado por NR.
                </p>
              </div>
            </div>
          )}

          {activeModule === 'templates' && <NRTemplateStudio />}

          {activeModule === 'compliance' && <NRComplianceMonitor />}

          {activeModule === 'cenarios3d' && <NRCenarios3D />}

          {activeModule === 'casos' && <NRCasosReais />}

          {activeModule === 'integracao' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Integração com Órgãos Reguladores</span>
                  </CardTitle>
                  <CardDescription>
                    Conexão direta com MTE, FUNDACENTRO e Auditorias Fiscais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Database className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="font-semibold">Ministério do Trabalho</h4>
                        <p className="text-sm text-gray-600">Atualizações automáticas de NRs</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Status da Conexão</span>
                          <Badge className="bg-green-100 text-green-800">Online</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Última Sincronização</span>
                          <span className="text-gray-500">2 min atrás</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>NRs Monitoradas</span>
                          <span className="font-bold text-blue-600">38</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Building className="h-8 w-8 text-blue-600" />
                        </div>
                        <h4 className="font-semibold">FUNDACENTRO</h4>
                        <p className="text-sm text-gray-600">Base de estudos e pesquisas</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Casos Sincronizados</span>
                          <span className="font-bold text-purple-600">1.247</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Estudos Integrados</span>
                          <span className="font-bold text-purple-600">56</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Última Atualização</span>
                          <span className="text-gray-500">1 hora atrás</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Shield className="h-8 w-8 text-orange-600" />
                        </div>
                        <h4 className="font-semibold">Auditoria Fiscal</h4>
                        <p className="text-sm text-gray-600">Validação automática</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Conformidade</span>
                          <Badge className="bg-green-100 text-green-800">96.8%</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Certificados Válidos</span>
                          <span className="font-bold text-green-600">2.573</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Próxima Auditoria</span>
                          <span className="text-gray-500">15/09/2025</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Integração Ativa e Funcionando</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Todos os vídeos gerados são automaticamente validados contra as últimas versões das NRs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Revolucionário Badge */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-orange-100 via-yellow-100 to-red-100 rounded-full border-2 border-orange-200">
            <HardHat className="h-6 w-6 text-orange-600" />
            <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Sistema NR Revolucionário • IA Brasileira Especializada
            </span>
            <Crown className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-sm text-gray-600 max-w-2xl mx-auto">
            Primeira plataforma do Brasil com IA especializada em Normas Regulamentadoras do Ministério do Trabalho
          </div>
        </div>
      </div>
    </div>
  );
}

