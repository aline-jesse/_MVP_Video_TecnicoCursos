
/**
 * 🌐 Estúdio IA de Vídeos - Sprint 11
 * 3D Environments Imersivos Avançados
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Box,
  Layers,
  Lightbulb,
  Camera,
  Palette,
  Zap,
  Download,
  Upload,
  Eye,
  Settings,
  Play,
  RotateCcw,
  Move3D,
  Sparkles,
  Globe,
  Cpu,
  Monitor,
  Smartphone,
  VolumeX,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Environment3D {
  id: string;
  name: string;
  category: string;
  description: string;
  previewUrl: string;
  complexity: 'low' | 'medium' | 'high';
  renderTime: number;
  popularity: number;
  tags: string[];
  isCustom: boolean;
  createdAt: Date;
}

interface SceneConfiguration {
  lighting: {
    type: string;
    intensity: number;
    color: string;
    shadows: boolean;
  };
  camera: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    fov: number;
  };
  environment: {
    skybox: string;
    fog: boolean;
    fogDensity: number;
  };
  materials: {
    quality: string;
    reflections: boolean;
    refractions: boolean;
  };
}

export default function Environments3DAdvancedPage() {
  const [environments, setEnvironments] = useState<Environment3D[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [sceneConfig, setSceneConfig] = useState<SceneConfiguration>({
    lighting: {
      type: 'directional',
      intensity: 1.0,
      color: '#ffffff',
      shadows: true
    },
    camera: {
      position: { x: 0, y: 5, z: 10 },
      rotation: { x: -15, y: 0, z: 0 },
      fov: 75
    },
    environment: {
      skybox: 'day',
      fog: false,
      fogDensity: 0.1
    },
    materials: {
      quality: 'high',
      reflections: true,
      refractions: false
    }
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = () => {
    setEnvironments([
      {
        id: 'env-1',
        name: 'Fábrica Industrial',
        category: 'Industrial',
        description: 'Ambiente fabril completo com máquinas, esteiras e áreas de produção',
        previewUrl: '/3d/factory-preview.jpg',
        complexity: 'high',
        renderTime: 45,
        popularity: 94,
        tags: ['NR-12', 'Máquinas', 'Produção', 'Segurança'],
        isCustom: false,
        createdAt: new Date('2024-08-01')
      },
      {
        id: 'env-2',
        name: 'Canteiro de Obras',
        category: 'Construção',
        description: 'Obra em construção com andaimes, guindastes e áreas de trabalho em altura',
        previewUrl: '/3d/construction-preview.jpg',
        complexity: 'high',
        renderTime: 38,
        popularity: 89,
        tags: ['NR-35', 'Altura', 'Andaimes', 'Guindastes'],
        isCustom: false,
        createdAt: new Date('2024-08-05')
      },
      {
        id: 'env-3',
        name: 'Subestação Elétrica',
        category: 'Energia',
        description: 'Subestação com transformadores, painéis elétricos e sistemas de proteção',
        previewUrl: '/3d/electrical-preview.jpg',
        complexity: 'medium',
        renderTime: 28,
        popularity: 87,
        tags: ['NR-10', 'Elétrica', 'Transformadores', 'Alta Tensão'],
        isCustom: false,
        createdAt: new Date('2024-08-10')
      },
      {
        id: 'env-4',
        name: 'Laboratório Químico',
        category: 'Laboratório',
        description: 'Laboratório com bancadas, equipamentos e sistema de ventilação',
        previewUrl: '/3d/lab-preview.jpg',
        complexity: 'medium',
        renderTime: 32,
        popularity: 82,
        tags: ['NR-15', 'Químicos', 'EPIs', 'Ventilação'],
        isCustom: false,
        createdAt: new Date('2024-08-12')
      },
      {
        id: 'env-5',
        name: 'Escritório Corporativo',
        category: 'Corporativo',
        description: 'Ambiente de escritório moderno com estações de trabalho ergonômicas',
        previewUrl: '/3d/office-preview.jpg',
        complexity: 'low',
        renderTime: 15,
        popularity: 76,
        tags: ['NR-17', 'Ergonomia', 'Escritório', 'Corporativo'],
        isCustom: false,
        createdAt: new Date('2024-08-15')
      },
      {
        id: 'env-6',
        name: 'Meu Ambiente Personalizado',
        category: 'Personalizado',
        description: 'Ambiente criado com base nas suas especificações',
        previewUrl: '/3d/custom-preview.jpg',
        complexity: 'medium',
        renderTime: 35,
        popularity: 0,
        tags: ['Custom', 'Personalizado'],
        isCustom: true,
        createdAt: new Date()
      }
    ]);
  };

  const selectEnvironment = (envId: string) => {
    setSelectedEnvironment(envId);
    const env = environments.find(e => e.id === envId);
    if (env) {
      toast.success(`Ambiente "${env.name}" selecionado!`);
    }
  };

  const updateLighting = (property: string, value: any) => {
    setSceneConfig(prev => ({
      ...prev,
      lighting: {
        ...prev.lighting,
        [property]: value
      }
    }));
  };

  const updateCamera = (property: string, value: any) => {
    setSceneConfig(prev => ({
      ...prev,
      camera: {
        ...prev.camera,
        [property]: value
      }
    }));
  };

  const updateEnvironment = (property: string, value: any) => {
    setSceneConfig(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        [property]: value
      }
    }));
  };

  const startPreview = () => {
    setIsPreviewMode(true);
    toast.success('Modo preview ativado!');
  };

  const renderEnvironment = () => {
    if (!selectedEnvironment) {
      toast.error('Selecione um ambiente primeiro');
      return;
    }

    setRenderProgress(0);
    toast.success('Iniciando renderização 3D...');

    const timer = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          toast.success('Renderização 3D concluída!');
          return 100;
        }
        return prev + 3;
      });
    }, 200);
  };

  const createCustomEnvironment = () => {
    toast.success('Abrindo criador de ambientes 3D...');
    // Simular abertura de ferramenta de criação
  };

  const exportEnvironment = () => {
    if (!selectedEnvironment) {
      toast.error('Selecione um ambiente para exportar');
      return;
    }
    toast.success('Exportando ambiente 3D...');
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[complexity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getComplexityLabel = (complexity: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    };
    return labels[complexity as keyof typeof labels] || complexity;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Globe className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              3D Environments Imersivos
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Crie experiências de treinamento totalmente imersivas com ambientes 3D realistas e interativos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Galeria de Ambientes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Galeria de Ambientes 3D</h3>
              <Button onClick={createCustomEnvironment} variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Criar Personalizado
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {environments.map((env) => (
                <Card 
                  key={env.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedEnvironment === env.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => selectEnvironment(env.id)}
                >
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg flex items-center justify-center">
                      <Box className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Badge className={getComplexityColor(env.complexity)}>
                        {getComplexityLabel(env.complexity)}
                      </Badge>
                      {env.isCustom && (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{env.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{env.popularity}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">{env.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {env.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Render: ~{env.renderTime}s</span>
                        <span>{env.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Configurações da Cena */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações da Cena</h3>
            
            <Tabs defaultValue="lighting" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lighting">Iluminação</TabsTrigger>
                <TabsTrigger value="camera">Câmera</TabsTrigger>
              </TabsList>

              <TabsContent value="lighting" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Iluminação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tipo de Luz:</label>
                      <Select 
                        value={sceneConfig.lighting.type} 
                        onValueChange={(value) => updateLighting('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="directional">Direcional</SelectItem>
                          <SelectItem value="point">Pontual</SelectItem>
                          <SelectItem value="ambient">Ambiente</SelectItem>
                          <SelectItem value="spot">Spot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Intensidade: {sceneConfig.lighting.intensity}</label>
                      <Slider
                        value={[sceneConfig.lighting.intensity]}
                        onValueChange={(value) => updateLighting('intensity', value[0])}
                        max={2}
                        min={0}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Cor da Luz:</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={sceneConfig.lighting.color}
                          onChange={(e) => updateLighting('color', e.target.value)}
                          className="w-12 h-8"
                        />
                        <Input
                          value={sceneConfig.lighting.color}
                          onChange={(e) => updateLighting('color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Sombras:</label>
                      <input
                        type="checkbox"
                        checked={sceneConfig.lighting.shadows}
                        onChange={(e) => updateLighting('shadows', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="camera" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Camera className="h-4 w-4 mr-2" />
                      Câmera
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Campo de Visão: {sceneConfig.camera.fov}°</label>
                      <Slider
                        value={[sceneConfig.camera.fov]}
                        onValueChange={(value) => updateCamera('fov', value[0])}
                        max={120}
                        min={30}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Posição (X, Y, Z):</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          value={sceneConfig.camera.position.x}
                          onChange={(e) => updateCamera('position', {
                            ...sceneConfig.camera.position,
                            x: parseFloat(e.target.value) || 0
                          })}
                          placeholder="X"
                        />
                        <Input
                          type="number"
                          value={sceneConfig.camera.position.y}
                          onChange={(e) => updateCamera('position', {
                            ...sceneConfig.camera.position,
                            y: parseFloat(e.target.value) || 0
                          })}
                          placeholder="Y"
                        />
                        <Input
                          type="number"
                          value={sceneConfig.camera.position.z}
                          onChange={(e) => updateCamera('position', {
                            ...sceneConfig.camera.position,
                            z: parseFloat(e.target.value) || 0
                          })}
                          placeholder="Z"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rotação (X, Y, Z):</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          value={sceneConfig.camera.rotation.x}
                          onChange={(e) => updateCamera('rotation', {
                            ...sceneConfig.camera.rotation,
                            x: parseFloat(e.target.value) || 0
                          })}
                          placeholder="X"
                        />
                        <Input
                          type="number"
                          value={sceneConfig.camera.rotation.y}
                          onChange={(e) => updateCamera('rotation', {
                            ...sceneConfig.camera.rotation,
                            y: parseFloat(e.target.value) || 0
                          })}
                          placeholder="Y"
                        />
                        <Input
                          type="number"
                          value={sceneConfig.camera.rotation.z}
                          onChange={(e) => updateCamera('rotation', {
                            ...sceneConfig.camera.rotation,
                            z: parseFloat(e.target.value) || 0
                          })}
                          placeholder="Z"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Preview e Render */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Monitor className="h-4 w-4 mr-2" />
                  Preview & Render
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button 
                    onClick={startPreview}
                    variant="outline" 
                    className="flex-1"
                    disabled={!selectedEnvironment}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    onClick={renderEnvironment}
                    className="flex-1"
                    disabled={!selectedEnvironment || renderProgress > 0}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Render
                  </Button>
                </div>

                {renderProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Renderizando...</span>
                      <span className="text-sm font-semibold">{renderProgress}%</span>
                    </div>
                    <Progress value={renderProgress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ambiente Qualidade e Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="h-5 w-5 mr-2" />
              Qualidade e Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium">Qualidade de Render:</label>
                <Select defaultValue="ultra">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Rápido)</SelectItem>
                    <SelectItem value="medium">Médio (Balanceado)</SelectItem>
                    <SelectItem value="high">Alto (Lento)</SelectItem>
                    <SelectItem value="ultra">Ultra (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Resolução:</label>
                <Select defaultValue="1080p">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    <SelectItem value="1440p">1440p (2K)</SelectItem>
                    <SelectItem value="2160p">2160p (4K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Ray Tracing:</label>
                <Select defaultValue="enabled">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disabled">Desabilitado</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="enabled">Habilitado</SelectItem>
                    <SelectItem value="ultra">Ultra (RTX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Anti-Aliasing:</label>
                <Select defaultValue="fxaa">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="fxaa">FXAA</SelectItem>
                    <SelectItem value="msaa">MSAA</SelectItem>
                    <SelectItem value="taa">TAA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas de Uso */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Ambientes 3D</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {environments.length}
                </div>
                <p className="text-sm text-gray-600">Ambientes Disponíveis</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {environments.filter(e => e.isCustom).length}
                </div>
                <p className="text-sm text-gray-600">Ambientes Personalizados</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {Math.round(environments.reduce((sum, e) => sum + e.renderTime, 0) / environments.length)}s
                </div>
                <p className="text-sm text-gray-600">Tempo Médio Render</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(environments.reduce((sum, e) => sum + e.popularity, 0) / environments.length)}%
                </div>
                <p className="text-sm text-gray-600">Satisfação Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
