
/**
 * 📊 Estúdio IA de Vídeos - Sprint 10
 * Página de Analytics Comportamental
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  MousePointer,
  Play,
  Pause,
  Rewind,
  FastForward,
  Heart,
  Brain,
  Zap,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BehavioralData, HeatmapSection, EngagementMetrics, RiskPrediction } from '@/types/sprint10';

export default function BehavioralAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [behavioralData, setBehavioralData] = useState<BehavioralData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapSection[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);

  useEffect(() => {
    loadBehavioralData();
    loadHeatmapData();
    loadEngagementMetrics();
    loadRiskPredictions();
  }, [selectedPeriod]);

  const loadBehavioralData = () => {
    setBehavioralData({
      totalUsers: 2847,
      activeUsers: 1923,
      avgSessionTime: 18.5,
      completionRate: 87.3,
      dropoffRate: 12.7,
      engagementScore: 8.4,
      learningEffectiveness: 92.1,
      satisfactionScore: 4.6
    });
  };

  const loadHeatmapData = () => {
    setHeatmapData([
      {
        section: 'Introdução',
        interactions: 945,
        avgTime: 2.3,
        clicks: 127,
        attention: 89
      },
      {
        section: 'Conceitos Básicos',
        interactions: 823,
        avgTime: 4.7,
        clicks: 234,
        attention: 92
      },
      {
        section: 'Procedimentos',
        interactions: 756,
        avgTime: 6.2,
        clicks: 189,
        attention: 85
      },
      {
        section: 'Exemplos Práticos',
        interactions: 689,
        avgTime: 5.1,
        clicks: 312,
        attention: 94
      },
      {
        section: 'Quiz Final',
        interactions: 634,
        avgTime: 3.8,
        clicks: 156,
        attention: 87
      }
    ]);
  };

  const loadEngagementMetrics = () => {
    setEngagementMetrics({
      videoPlayRate: 94.2,
      avgWatchTime: 85.7,
      interactionRate: 67.8,
      socialShares: 23,
      bookmarks: 156,
      notes: 89,
      discussions: 45,
      retakes: 178
    });
  };

  const loadRiskPredictions = () => {
    setRiskPredictions([
      {
        id: 'user-1',
        name: 'João Silva',
        department: 'Operações',
        riskScore: 78,
        riskLevel: 'high',
        factors: ['Baixo engajamento', 'Sessões curtas', 'Poucas interações'],
        recommendation: 'Intervenção personalizada recomendada',
        lastActivity: '2 dias atrás'
      },
      {
        id: 'user-2',
        name: 'Maria Santos',
        department: 'Manutenção',
        riskScore: 45,
        riskLevel: 'medium',
        factors: ['Progresso lento', 'Poucas revisões'],
        recommendation: 'Acompanhamento adicional',
        lastActivity: '1 dia atrás'
      },
      {
        id: 'user-3',
        name: 'Carlos Lima',
        department: 'Segurança',
        riskScore: 23,
        riskLevel: 'low',
        factors: ['Bom progresso', 'Alta interação'],
        recommendation: 'Continuar monitoramento regular',
        lastActivity: '3 horas atrás'
      }
    ]);
  };

  const getRiskLevelColor = (level: 'low' | 'medium' | 'high') => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[level] || colors.low;
  };

  const getAttentionColor = (attention: number) => {
    if (attention >= 90) return 'bg-green-500';
    if (attention >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const exportReport = () => {
    toast.success('Relatório exportado com sucesso!');
  };

  const generateInsights = () => {
    toast.success('Gerando insights comportamentais...');
  };

  const viewRiskDetails = (predictionId: string) => {
    const prediction = riskPredictions.find(p => p.id === predictionId);
    if (prediction) {
      toast.success(`Visualizando detalhes de risco para ${prediction.name}`);
      // Simular abertura de modal com detalhes
    }
  };

  const createIntervention = (predictionId: string) => {
    const prediction = riskPredictions.find(p => p.id === predictionId);
    if (prediction) {
      toast.success(`Criando intervenção personalizada para ${prediction.name}`);
      // Simular criação de plano de intervenção
      setRiskPredictions(prev =>
        prev.map(p =>
          p.id === predictionId
            ? { ...p, riskScore: Math.max(0, p.riskScore - 10) }
            : p
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <BarChart3 className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Analytics Comportamental
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Análise profunda do comportamento de aprendizado com heatmaps, predições e insights de IA
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button onClick={generateInsights} variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              Gerar Insights
            </Button>
            <Button onClick={exportReport}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {behavioralData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {behavioralData.activeUsers.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-xs text-green-600 mt-1">
                  +{Math.round((behavioralData.activeUsers / behavioralData.totalUsers) * 100)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {behavioralData.avgSessionTime}min
                </div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-xs text-green-600 mt-1">+12% vs período anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {behavioralData.completionRate}%
                </div>
                <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                <p className="text-xs text-green-600 mt-1">+3.2% vs período anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {behavioralData.engagementScore}/10
                </div>
                <p className="text-sm text-gray-600">Score Engajamento</p>
                <p className="text-xs text-green-600 mt-1">+0.7 vs período anterior</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heatmap de Interações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Heatmap de Atenção por Seção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {heatmapData.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">{section.section}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {section.interactions} interações
                        </Badge>
                        <Badge className={getAttentionColor(section.attention)}>
                          {section.attention}% atenção
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress value={section.attention} className="h-3" />
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{section.avgTime}min médio</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MousePointer className="h-3 w-3" />
                        <span>{section.clicks} cliques</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>{Math.round(section.interactions/10)} actions/min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Engajamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Métricas de Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementMetrics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <Play className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-blue-600">
                        {engagementMetrics.videoPlayRate}%
                      </div>
                      <p className="text-sm text-gray-600">Taxa de Play</p>
                    </div>
                    <div className="text-center">
                      <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-green-600">
                        {engagementMetrics.avgWatchTime}%
                      </div>
                      <p className="text-sm text-gray-600">Tempo Assistido</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taxa de Interação</span>
                      <span className="font-semibold">{engagementMetrics.interactionRate}%</span>
                    </div>
                    <Progress value={engagementMetrics.interactionRate} className="h-2" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Compartilhamentos:</span>
                        <span className="font-semibold">{engagementMetrics.socialShares}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Favoritos:</span>
                        <span className="font-semibold">{engagementMetrics.bookmarks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anotações:</span>
                        <span className="font-semibold">{engagementMetrics.notes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discussões:</span>
                        <span className="font-semibold">{engagementMetrics.discussions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Predições de Risco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Predições de Risco de Aprendizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskPredictions.map((prediction) => (
                <div key={prediction.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{prediction.name}</h4>
                        <p className="text-sm text-gray-600">{prediction.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getRiskLevelColor(prediction.riskLevel)}>
                        Risco {prediction.riskLevel}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">Score: {prediction.riskScore}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-sm font-medium">Fatores de Risco:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Recomendação:</p>
                      <p className="text-sm text-gray-600">{prediction.recommendation}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Última atividade: {prediction.lastActivity}</span>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => viewRiskDetails(prediction.id)}
                        size="sm" 
                        variant="outline"
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        onClick={() => createIntervention(prediction.id)}
                        size="sm"
                      >
                        Criar Intervenção
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights de IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Insights de IA Comportamental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Padrão Identificado</h4>
                </div>
                <p className="text-sm text-blue-800">
                  Usuários que assistem vídeos entre 9h-11h têm 23% mais engajamento e 18% melhor retenção.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Oportunidade</h4>
                </div>
                <p className="text-sm text-green-800">
                  Seções com exemplos práticos têm 35% mais interações. Recomenda-se aumentar conteúdo prático.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">Alerta</h4>
                </div>
                <p className="text-sm text-yellow-800">
                  12% dos usuários abandonam na seção de "Procedimentos". Considere simplificar o conteúdo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
