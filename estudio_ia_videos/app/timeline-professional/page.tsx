
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Clock,
  Layers,
  Sparkles,
  Zap,
  Target,
  Volume2,
  Palette,
  Monitor,
  BarChart3,
  Settings,
  Home,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Importar os componentes
import AdvancedTimelineEditor from '@/components/timeline-professional/advanced-timeline-editor';
import KeyframeAnimationSystem from '@/components/timeline-professional/keyframe-animation-system';
import AudioSyncAI from '@/components/timeline-professional/audio-sync-ia-system';
import MotionGraphicsEngine from '@/components/timeline-professional/motion-graphics-ai-engine';

export default function TimelineProfessionalPage() {
  const [activeTab, setActiveTab] = useState('timeline-editor');

  // Analytics do sistema
  const systemStats = {
    totalProjects: 23,
    activeTimelines: 8,
    renderingQueue: 2,
    aiOptimizations: 47,
    systemHealth: 96.8,
    performance: {
      timeline: 9.2,
      keyframes: 8.9,
      audio: 9.1,
      graphics: 8.7
    }
  };

  const modules = [
    {
      id: 'timeline-editor',
      title: 'Timeline Editor Profissional',
      description: 'Editor timeline multi-track com controles avançados',
      icon: Clock,
      color: 'blue',
      status: 'Ativo',
      performance: systemStats.performance.timeline
    },
    {
      id: 'keyframe-system',
      title: 'Sistema de Keyframes',
      description: 'Controle preciso de animações e interpolação',
      icon: Target,
      color: 'purple',
      status: 'Ativo',
      performance: systemStats.performance.keyframes
    },
    {
      id: 'audio-sync',
      title: 'Sincronização de Áudio IA',
      description: 'Sincronização automática inteligente',
      icon: Volume2,
      color: 'green',
      status: 'Ativo',
      performance: systemStats.performance.audio
    },
    {
      id: 'motion-graphics',
      title: 'Engine de Motion Graphics',
      description: 'Sistema avançado de gráficos em movimento',
      icon: Palette,
      color: 'pink',
      status: 'Ativo',
      performance: systemStats.performance.graphics
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/10 text-green-400 border-green-500/30',
      pink: 'bg-pink-500/10 text-pink-400 border-pink-500/30'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (activeTab !== 'overview') {
    // Renderizar componente específico
    const renderActiveComponent = () => {
      switch (activeTab) {
        case 'timeline-editor':
          return <AdvancedTimelineEditor />;
        case 'keyframe-system':
          return <KeyframeAnimationSystem />;
        case 'audio-sync':
          return <AudioSyncAI />;
        case 'motion-graphics':
          return <MotionGraphicsEngine />;
        default:
          return null;
      }
    };

    return (
      <div className="relative">
        {/* Back to Overview Button */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="bg-gray-900/80 backdrop-blur-sm border-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Overview
          </Button>
        </div>
        {renderActiveComponent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                <Home className="h-5 w-5" />
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Timeline Professional Suite
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Sistema completo de edição timeline profissional com IA integrada
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Monitor className="mr-1 h-3 w-3" />
              Sistema: {systemStats.systemHealth}%
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              <BarChart3 className="mr-1 h-3 w-3" />
              Performance: Excelente
            </Badge>
          </div>
        </div>

        {/* System Overview Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Projetos Ativos</p>
                  <p className="text-2xl font-bold text-blue-400">{systemStats.totalProjects}</p>
                </div>
                <Layers className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Timelines Ativas</p>
                  <p className="text-2xl font-bold text-purple-400">{systemStats.activeTimelines}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Fila Renderização</p>
                  <p className="text-2xl font-bold text-green-400">{systemStats.renderingQueue}</p>
                </div>
                <Play className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Otimizações IA</p>
                  <p className="text-2xl font-bold text-yellow-400">{systemStats.aiOptimizations}</p>
                </div>
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Saúde Sistema</p>
                  <p className="text-2xl font-bold text-pink-400">{systemStats.systemHealth}%</p>
                </div>
                <Zap className="h-8 w-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Module Cards */}
        <div className="col-span-8">
          <div className="grid grid-cols-2 gap-6 h-full">
            {modules.map((module, index) => {
              const IconComponent = module.icon;
              
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className="bg-gray-900 border-gray-800 h-full cursor-pointer transition-all duration-300 hover:border-gray-600 hover:shadow-lg group"
                    onClick={() => setActiveTab(module.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${module.color === 'blue' ? 'bg-blue-500/20' : 
                            module.color === 'purple' ? 'bg-purple-500/20' : 
                            module.color === 'green' ? 'bg-green-500/20' : 'bg-pink-500/20'}`}>
                            <IconComponent className={`h-6 w-6 ${
                              module.color === 'blue' ? 'text-blue-400' : 
                              module.color === 'purple' ? 'text-purple-400' : 
                              module.color === 'green' ? 'text-green-400' : 'text-pink-400'
                            }`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-white transition-colors">
                              {module.title}
                            </CardTitle>
                            <Badge variant="outline" className={getColorClasses(module.color)}>
                              {module.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors">
                        {module.description}
                      </p>
                      
                      {/* Performance Indicator */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Performance</span>
                          <span className="text-xs font-mono font-medium text-white">
                            {module.performance.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              module.color === 'blue' ? 'bg-blue-500' : 
                              module.color === 'purple' ? 'bg-purple-500' : 
                              module.color === 'green' ? 'bg-green-500' : 'bg-pink-500'
                            }`}
                            style={{ width: `${(module.performance / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Access Button */}
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          className={`w-full ${
                            module.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 
                            module.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : 
                            module.color === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-pink-600 hover:bg-pink-700'
                          }`}
                        >
                          Abrir {module.title}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar - System Info & Quick Actions */}
        <div className="col-span-4 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Sistema Timeline Pro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Recursos Principais:</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Editor timeline multi-track profissional</li>
                  <li>• Sistema de keyframes avançado</li>
                  <li>• Sincronização automática de áudio</li>
                  <li>• Motion graphics com IA</li>
                  <li>• Renderização em tempo real</li>
                  <li>• Otimizações automáticas</li>
                </ul>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <h4 className="font-medium text-sm mb-3">Status do Sistema:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">CPU</span>
                    <span className="text-green-400">32%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">RAM</span>
                    <span className="text-blue-400">58%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">GPU</span>
                    <span className="text-purple-400">45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Storage</span>
                    <span className="text-yellow-400">23%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Novo Projeto Timeline
              </Button>
              <Button className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configurações do Sistema
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Otimização IA Automática
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Projetos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Treinamento NR-12</p>
                    <p className="text-xs text-gray-400">Timeline: 2:30 min</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Segurança Corporativa</p>
                    <p className="text-xs text-gray-400">Timeline: 5:15 min</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">EPI Workshop</p>
                    <p className="text-xs text-gray-400">Timeline: 3:45 min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
