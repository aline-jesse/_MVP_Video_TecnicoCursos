

/**
 * 🎨 Advanced Video Effects Engine - Sprint 13
 * Motor de efeitos avançados com partículas 3D e transições cinematográficas
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Palette,
  Sparkles,
  Zap,
  Film,
  Eye,
  Settings,
  Play,
  Download,
  Wand2,
  Layers,
  RefreshCw,
  Target,
  Clock,
  Star,
  Wand2 as Magic
} from 'lucide-react';
import Image from 'next/image';

interface VideoEffect {
  id: string;
  name: string;
  category: 'particle' | 'transition' | 'color' | 'motion' | 'composite';
  description: string;
  parameters: { [key: string]: any };
  renderTime: number;
  complexity: 'low' | 'medium' | 'high';
  preview?: string;
}

interface AppliedEffect {
  id: string;
  effectId: string;
  name: string;
  parameters: any;
  position: number;
  duration: number;
}

export default function VideoEffectsAdvancedPage() {
  const [effects, setEffects] = useState<VideoEffect[]>([]);
  const [appliedEffects, setAppliedEffects] = useState<AppliedEffect[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEffect, setSelectedEffect] = useState<VideoEffect | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);

  useEffect(() => {
    loadEffects();
  }, [selectedCategory]);

  const loadEffects = async () => {
    try {
      const response = await fetch(`/api/v2/video-effects/advanced?category=${selectedCategory === 'all' ? '' : selectedCategory}`);
      const data = await response.json();
      
      if (data.success) {
        setEffects(data.effects);
      }
    } catch (error) {
      console.error('Erro ao carregar efeitos:', error);
    }
  };

  const applyEffect = async (effect: VideoEffect, customParameters?: any) => {
    setIsApplying(true);
    setPreviewProgress(0);
    
    try {
      const response = await fetch('/api/v2/video-effects/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          effectId: effect.id,
          parameters: customParameters || effect.parameters,
          targetVideo: 'current_project'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Simular progresso
        const interval = setInterval(() => {
          setPreviewProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsApplying(false);
              
              // Adicionar efeito aplicado
              const newAppliedEffect: AppliedEffect = {
                id: `applied_${Date.now()}`,
                effectId: effect.id,
                name: effect.name,
                parameters: customParameters || effect.parameters,
                position: appliedEffects.length,
                duration: 2.0
              };
              setAppliedEffects([...appliedEffects, newAppliedEffect]);
              
              return 100;
            }
            return prev + 10;
          });
        }, data.estimatedTime / 10);
      }
    } catch (error) {
      console.error('Erro ao aplicar efeito:', error);
      setIsApplying(false);
    }
  };

  const removeAppliedEffect = (effectId: string) => {
    setAppliedEffects(appliedEffects.filter(effect => effect.id !== effectId));
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'particle': return <Sparkles className="h-4 w-4" />;
      case 'transition': return <Film className="h-4 w-4" />;
      case 'color': return <Palette className="h-4 w-4" />;
      case 'motion': return <Zap className="h-4 w-4" />;
      case 'composite': return <Layers className="h-4 w-4" />;
      default: return <Wand2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎨 Advanced Video Effects Engine
          </h1>
          <p className="text-gray-600 text-lg">
            Partículas 3D, Transições Cinematográficas e Efeitos Profissionais - Sprint 13
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="particle">Partículas 3D</SelectItem>
                <SelectItem value="transition">Transições</SelectItem>
                <SelectItem value="color">Correção de Cor</SelectItem>
                <SelectItem value="motion">Motion Graphics</SelectItem>
                <SelectItem value="composite">Composição</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-purple-600">
              {effects.length} Efeitos Disponíveis
            </Badge>
            <Button variant="outline" onClick={loadEffects}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Efeitos */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Magic className="h-5 w-5" />
                  <span>Biblioteca de Efeitos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {effects.map((effect) => (
                    <div
                      key={effect.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-purple-300 hover:shadow-md ${
                        selectedEffect?.id === effect.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedEffect(effect)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(effect.category)}
                          <span className="font-medium">{effect.name}</span>
                        </div>
                        <Badge className={getComplexityColor(effect.complexity)}>
                          {effect.complexity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {effect.description}
                      </p>
                      
                      {effect.preview && (
                        <div className="relative w-full h-24 bg-gray-100 rounded mb-3">
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                            Preview: {effect.name}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Render: {effect.renderTime}ms</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            applyEffect(effect);
                          }}
                          disabled={isApplying}
                        >
                          {isApplying ? <Clock className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Controle */}
          <div className="space-y-4">
            {/* Efeito Selecionado */}
            {selectedEffect && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Configurações</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedEffect.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(selectedEffect.parameters).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      {typeof value === 'number' ? (
                        <Slider
                          value={[value]}
                          onValueChange={([newValue]) => {
                            setSelectedEffect({
                              ...selectedEffect,
                              parameters: { ...selectedEffect.parameters, [key]: newValue }
                            });
                          }}
                          min={0}
                          max={typeof value === 'number' && value <= 1 ? 1 : 100}
                          step={typeof value === 'number' && value <= 1 ? 0.1 : 1}
                        />
                      ) : (
                        <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                          {String(value)}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Button 
                    className="w-full"
                    onClick={() => applyEffect(selectedEffect)}
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Aplicar Efeito
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Preview Progress */}
            {isApplying && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Aplicando Efeito</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={previewProgress} className="mb-2" />
                  <div className="text-xs text-gray-500 text-center">
                    {previewProgress}% completo
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Efeitos Aplicados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>Efeitos Aplicados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedEffects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Film className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum efeito aplicado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {appliedEffects.map((effect, index) => (
                      <div key={effect.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{effect.name}</div>
                          <div className="text-xs text-gray-500">
                            Posição: {effect.position} • Duração: {effect.duration}s
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAppliedEffect(effect.id)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Resultados */}
        {appliedEffects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Preview Final</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto" style={{ aspectRatio: '16/9' }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Film className="h-16 w-16 text-gray-400 mx-auto" />
                      <div className="font-medium text-gray-600">
                        Vídeo com {appliedEffects.length} efeitos aplicados
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <Button variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

