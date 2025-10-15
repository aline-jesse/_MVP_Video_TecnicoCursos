
/**
 * 📊 Estúdio IA de Vídeos - Sprint 5
 * Página Principal do Video Analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import VideoAnalyticsDashboard from '@/components/video-analytics/analytics-dashboard';
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  Play,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';

export default function VideoAnalyticsPage() {
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [videos, setVideos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'trending' | 'declining'>('all');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/video-analytics/list');
      const data = await response.json();
      setVideos(data);
      if (data.length > 0) {
        setSelectedVideo(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      // Mock data for demonstration
      const mockVideos = [
        {
          id: 'video-1',
          title: 'NR-35: Trabalho em Altura - Treinamento Completo',
          views: 15420,
          sentiment: 0.78,
          trend: 'up',
          duration: 780,
          createdAt: '2025-08-25'
        },
        {
          id: 'video-2', 
          title: 'NR-10: Segurança em Instalações Elétricas',
          views: 12350,
          sentiment: 0.72,
          trend: 'up',
          duration: 650,
          createdAt: '2025-08-20'
        },
        {
          id: 'video-3',
          title: 'NR-33: Espaços Confinados - Procedimentos',
          views: 8920,
          sentiment: 0.65,
          trend: 'down',
          duration: 520,
          createdAt: '2025-08-18'
        }
      ];
      setVideos(mockVideos);
      setSelectedVideo(mockVideos[0].id);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || video.trend === (filterStatus === 'trending' ? 'up' : 'down');
    return matchesSearch && matchesFilter;
  });

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '📈' : '📉';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.7) return 'text-green-600';
    if (sentiment >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Video Analytics Avançado
          </h1>
          <p className="text-gray-600 text-lg">
            Análise completa de engajamento, sentiment e performance dos seus vídeos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Video List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Seus Vídeos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar vídeos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Todos os vídeos</option>
                    <option value="trending">Em alta</option>
                    <option value="declining">Em declínio</option>
                  </select>
                </div>

                {/* Video List */}
                <div className="space-y-3">
                  {filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedVideo === video.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                        <span className="text-lg">{getTrendIcon(video.trend)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Play className="h-3 w-3" />
                            <span>{video.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={video.trend === 'up' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {video.trend === 'up' ? 'Crescendo' : 'Declínio'}
                          </Badge>
                          <span className={`text-xs font-bold ${getSentimentColor(video.sentiment)}`}>
                            {(video.sentiment * 100).toFixed(0)}% 😊
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredVideos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum vídeo encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Comparar Vídeos
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Tendências
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Analytics Dashboard */}
          <div className="lg:col-span-3">
            {selectedVideo ? (
              <VideoAnalyticsDashboard videoId={selectedVideo} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Selecione um Vídeo
                    </h3>
                    <p className="text-gray-500">
                      Escolha um vídeo da lista para ver análises detalhadas
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
