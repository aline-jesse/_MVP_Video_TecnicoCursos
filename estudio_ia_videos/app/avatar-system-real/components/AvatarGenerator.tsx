'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Palette, 
  Shirt, 
  Eye, 
  Smile, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Camera,
  Video
} from 'lucide-react';

interface AvatarConfig {
  gender: 'male' | 'female' | 'neutral';
  age: number;
  ethnicity: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  bodyType: string;
  clothing: string;
  accessories: string[];
}

interface AvatarGeneratorProps {
  onAvatarGenerated?: (avatar: any) => void;
}

export default function AvatarGenerator({ onAvatarGenerated }: AvatarGeneratorProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    gender: 'neutral',
    age: 30,
    ethnicity: 'mixed',
    hairStyle: 'medium',
    hairColor: 'brown',
    eyeColor: 'brown',
    skinTone: 'medium',
    bodyType: 'average',
    clothing: 'business',
    accessories: []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedAvatar, setGeneratedAvatar] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleConfigChange = (key: keyof AvatarConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateAvatar = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simular processo de geração de avatar 3D
      const steps = [
        'Inicializando modelo 3D...',
        'Aplicando características faciais...',
        'Configurando textura da pele...',
        'Adicionando cabelo e olhos...',
        'Aplicando roupas e acessórios...',
        'Renderizando avatar final...',
        'Otimizando para animação...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(((i + 1) / steps.length) * 100);
      }

      // Simular avatar gerado
      const avatar = {
        id: `avatar_${Date.now()}`,
        config,
        modelUrl: '/models/avatar_generated.glb',
        textureUrl: '/textures/avatar_texture.jpg',
        animationUrls: {
          idle: '/animations/idle.fbx',
          talking: '/animations/talking.fbx',
          gestures: '/animations/gestures.fbx'
        },
        metadata: {
          polygonCount: 15000,
          textureResolution: '2048x2048',
          rigged: true,
          blendShapes: 52
        }
      };

      setGeneratedAvatar(avatar);
      onAvatarGenerated?.(avatar);
    } catch (error) {
      console.error('Erro ao gerar avatar:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAvatar = () => {
    setGeneratedAvatar(null);
    setGenerationProgress(0);
    setIsPreviewMode(false);
  };

  const exportAvatar = (format: 'glb' | 'fbx' | 'obj') => {
    if (!generatedAvatar) return;
    
    // Simular exportação
    const link = document.createElement('a');
    link.href = `data:application/octet-stream,${generatedAvatar.id}.${format}`;
    link.download = `${generatedAvatar.id}.${format}`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gerador de Avatares 3D
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações */}
            <div className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="appearance">Aparência</TabsTrigger>
                  <TabsTrigger value="clothing">Roupas</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Gênero</Label>
                      <Select 
                        value={config.gender} 
                        onValueChange={(value) => handleConfigChange('gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                          <SelectItem value="neutral">Neutro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Etnia</Label>
                      <Select 
                        value={config.ethnicity} 
                        onValueChange={(value) => handleConfigChange('ethnicity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caucasian">Caucasiano</SelectItem>
                          <SelectItem value="african">Africano</SelectItem>
                          <SelectItem value="asian">Asiático</SelectItem>
                          <SelectItem value="hispanic">Hispânico</SelectItem>
                          <SelectItem value="mixed">Misto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Idade: {config.age} anos</Label>
                    <Slider
                      value={[config.age]}
                      onValueChange={(value) => handleConfigChange('age', value[0])}
                      min={18}
                      max={80}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Tipo Corporal</Label>
                    <Select 
                      value={config.bodyType} 
                      onValueChange={(value) => handleConfigChange('bodyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slim">Magro</SelectItem>
                        <SelectItem value="average">Médio</SelectItem>
                        <SelectItem value="athletic">Atlético</SelectItem>
                        <SelectItem value="heavy">Robusto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Estilo do Cabelo</Label>
                      <Select 
                        value={config.hairStyle} 
                        onValueChange={(value) => handleConfigChange('hairStyle', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Curto</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="long">Longo</SelectItem>
                          <SelectItem value="bald">Careca</SelectItem>
                          <SelectItem value="curly">Cacheado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Cor do Cabelo</Label>
                      <Select 
                        value={config.hairColor} 
                        onValueChange={(value) => handleConfigChange('hairColor', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="black">Preto</SelectItem>
                          <SelectItem value="brown">Castanho</SelectItem>
                          <SelectItem value="blonde">Loiro</SelectItem>
                          <SelectItem value="red">Ruivo</SelectItem>
                          <SelectItem value="gray">Grisalho</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cor dos Olhos</Label>
                      <Select 
                        value={config.eyeColor} 
                        onValueChange={(value) => handleConfigChange('eyeColor', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brown">Castanho</SelectItem>
                          <SelectItem value="blue">Azul</SelectItem>
                          <SelectItem value="green">Verde</SelectItem>
                          <SelectItem value="hazel">Avelã</SelectItem>
                          <SelectItem value="gray">Cinza</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tom de Pele</Label>
                      <Select 
                        value={config.skinTone} 
                        onValueChange={(value) => handleConfigChange('skinTone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="olive">Oliva</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="clothing" className="space-y-4">
                  <div>
                    <Label>Estilo de Roupa</Label>
                    <Select 
                      value={config.clothing} 
                      onValueChange={(value) => handleConfigChange('clothing', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Executivo</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="medical">Médico</SelectItem>
                        <SelectItem value="safety">Segurança</SelectItem>
                        <SelectItem value="uniform">Uniforme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Acessórios</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Óculos', 'Relógio', 'Colar', 'Brincos', 'Chapéu'].map((accessory) => (
                        <Badge
                          key={accessory}
                          variant={config.accessories.includes(accessory) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newAccessories = config.accessories.includes(accessory)
                              ? config.accessories.filter(a => a !== accessory)
                              : [...config.accessories, accessory];
                            handleConfigChange('accessories', newAccessories);
                          }}
                        >
                          {accessory}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button 
                  onClick={generateAvatar} 
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Avatar
                    </>
                  )}
                </Button>
                
                {generatedAvatar && (
                  <Button variant="outline" onClick={resetAvatar}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {isGenerating ? (
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Gerando avatar 3D...</p>
                      <Progress value={generationProgress} className="w-48" />
                      <p className="text-xs text-gray-500">{Math.round(generationProgress)}%</p>
                    </div>
                  </div>
                ) : generatedAvatar ? (
                  <div className="w-full h-full relative">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                      >
                        {isPreviewMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Preview do avatar aparecerá aqui</p>
                  </div>
                )}
              </div>

              {generatedAvatar && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Polígonos:</span> {generatedAvatar.metadata.polygonCount.toLocaleString()}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Textura:</span> {generatedAvatar.metadata.textureResolution}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Rigged:</span> {generatedAvatar.metadata.rigged ? 'Sim' : 'Não'}
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Blend Shapes:</span> {generatedAvatar.metadata.blendShapes}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => exportAvatar('glb')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      GLB
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => exportAvatar('fbx')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      FBX
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => exportAvatar('obj')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      OBJ
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}