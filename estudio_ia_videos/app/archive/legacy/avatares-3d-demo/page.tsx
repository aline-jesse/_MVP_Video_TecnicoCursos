'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  PlayCircle,
  Settings,
  Monitor,
  Sparkles,
  Brain,
  Mic,
  Video
} from 'lucide-react';

// Importar componentes melhorados
import { AvatarGallery } from '@/components/avatars/avatar-gallery';
import { AvatarStudio } from '@/components/avatars/avatar-studio';
import { RenderMonitor } from '@/components/avatars/render-monitor';

interface SystemStats {
  audio2Face: {
    status: 'online' | 'offline' | 'maintenance';
    version: string;
    uptime: number;
    activeConnections: number;
    processingQueue: number;
  };
  rendering: {
    activeJobs: number;
    queuedJobs: number;
    completedToday: number;
    averageTime: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage: number;
    diskUsage: number;
  };
  performance: {
    lipSyncAccuracy: number;
    renderQuality: number;
    responseTime: number;
  };
}

export default function Avatares3DDemo() {
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const [systemStats, setSystemStats] = useState<SystemStats>({
    audio2Face: {
      status: 'online',
      version: '2023.2.1',
      uptime: 99.8,
      activeConnections: 3,
      processingQueue: 2
    },
    rendering: {
      activeJobs: 5,
      queuedJobs: 12,
      completedToday: 47,
      averageTime: 3.2
    },
    system: {
      cpuUsage: 68,
      memoryUsage: 45,
      gpuUsage: 82,
      diskUsage: 34
    },
    performance: {
      lipSyncAccuracy: 97.5,
      renderQuality: 95.8,
      responseTime: 1.2
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Simular atualizações em tempo real
    const statsInterval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        system: {
          cpuUsage: Math.max(30, Math.min(90, prev.system.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.max(20, Math.min(80, prev.system.memoryUsage + (Math.random() - 0.5) * 8)),
          gpuUsage: Math.max(40, Math.min(95, prev.system.gpuUsage + (Math.random() - 0.5) * 12)),
          diskUsage: prev.system.diskUsage
        },
        rendering: {
          ...prev.rendering,
          activeJobs: Math.max(0, prev.rendering.activeJobs + Math.floor((Math.random() - 0.5) * 3))
        }
      }));
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(statsInterval);
    };
  }, []);

  const handleAvatarSelect = (avatar: any) => {
    setSelectedAvatar(avatar);
    setActiveTab('studio');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'maintenance': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700">Inicializando Audio2Face Pipeline...</h2>
          <p className="text-gray-500">Carregando avatares hiper-realistas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Avatares 3D Hiper-Realistas
              </h1>
              <p className="text-lg text-gray-600">
                FASE 2: Audio2Face Integration & Pipeline Avançado
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Sparkles className="h-4 w-4 mr-2" />
                FASE 2 Ativa
              </Badge>
              <Badge 
                variant={systemStats.audio2Face.status === 'online' ? 'default' : 'destructive'}
                className="px-3 py-1"
              >
                <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(systemStats.audio2Face.status)}`} />
                Audio2Face {getStatusText(systemStats.audio2Face.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Audio2Face Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audio2Face</CardTitle>
              <Brain className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {systemStats.audio2Face.uptime}%
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime • v{systemStats.audio2Face.version}
              </p>
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span>Conexões Ativas:</span>
                  <span className="font-medium">{systemStats.audio2Face.activeConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fila de Processamento:</span>
                  <span className="font-medium">{systemStats.audio2Face.processingQueue}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rendering Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renderização</CardTitle>
              <Video className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemStats.rendering.activeJobs}
              </div>
              <p className="text-xs text-muted-foreground">
                Jobs Ativos
              </p>
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span>Na Fila:</span>
                  <span className="font-medium">{systemStats.rendering.queuedJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Concluídos Hoje:</span>
                  <span className="font-medium">{systemStats.rendering.completedToday}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {systemStats.performance.lipSyncAccuracy}%
              </div>
              <p className="text-xs text-muted-foreground">
                Precisão Lip-Sync
              </p>
              <div className="mt-2 text-xs">
                <div className="flex justify-between">
                  <span>Qualidade:</span>
                  <span className="font-medium">{systemStats.performance.renderQuality}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo Resposta:</span>
                  <span className="font-medium">{systemStats.performance.responseTime}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Resources */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistema</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>CPU</span>
                  <span className="font-medium">{systemStats.system.cpuUsage}%</span>
                </div>
                <Progress value={systemStats.system.cpuUsage} className="h-1" />
                
                <div className="flex items-center justify-between text-xs">
                  <span>GPU</span>
                  <span className="font-medium">{systemStats.system.gpuUsage}%</span>
                </div>
                <Progress value={systemStats.system.gpuUsage} className="h-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Pipeline de Avatares 3D</CardTitle>
                <CardDescription>
                  Galeria, Studio e Monitoramento com integração Audio2Face
                </CardDescription>
              </div>
              {selectedAvatar && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Avatar Selecionado:</p>
                  <p className="font-semibold text-blue-600">{selectedAvatar.name}</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedAvatar.quality}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gallery" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Galeria</span>
                </TabsTrigger>
                <TabsTrigger value="studio" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Studio</span>
                </TabsTrigger>
                <TabsTrigger value="monitor" className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Monitor</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gallery" className="mt-6">
                <AvatarGallery 
                  onAvatarSelect={handleAvatarSelect}
                  selectedAvatar={selectedAvatar}
                />
              </TabsContent>

              <TabsContent value="studio" className="mt-6">
                <AvatarStudio 
                  selectedAvatar={selectedAvatar}
                  onAvatarChange={setSelectedAvatar}
                />
              </TabsContent>

              <TabsContent value="monitor" className="mt-6">
                <RenderMonitor />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            FASE 2: Avatares 3D Hiper-Realistas com Audio2Face Integration
          </p>
          <p className="mt-1">
            Pipeline avançado de renderização • Lip-sync de alta precisão • Qualidade cinematográfica
          </p>
        </div>
      </div>
    </div>
  );
}