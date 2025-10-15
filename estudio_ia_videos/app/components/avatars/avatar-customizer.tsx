

/**
 * 🎨 Avatar Customizer Component
 * Personalização avançada de avatares 3D
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Palette,
  Shirt,
  Eye,
  Smile,
  User,
  Crown,
  Save,
  RefreshCw,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AvatarCustomizerProps {
  avatar: any;
  onCustomizationChange: (customization: any) => void;
  onSaveCustomization: () => void;
}

export default function AvatarCustomizer({ 
  avatar, 
  onCustomizationChange, 
  onSaveCustomization 
}: AvatarCustomizerProps) {
  const [customization, setCustomization] = useState({
    // Aparência Física
    skinTone: 'medium',
    hairColor: 'brown',
    hairStyle: 'short',
    eyeColor: 'brown',
    bodyType: 'average',
    height: 170,
    
    // Roupas
    topWear: 'shirt',
    bottomWear: 'pants', 
    shoes: 'formal',
    accessories: [] as string[],
    
    // Expressões
    defaultExpression: 'neutral',
    eyebrowStyle: 'natural',
    mouthShape: 'medium',
    
    // Animações
    walkStyle: 'confident',
    gestureFrequency: 50,
    blinkRate: 80
  });

  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleCustomizationUpdate = (key: string, value: any) => {
    const newCustomization = { ...customization, [key]: value };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  const handleSave = async () => {
    setIsCustomizing(true);
    try {
      await onSaveCustomization();
      toast.success('Personalização salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar personalização');
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleRandomize = () => {
    const randomCustomization = {
      skinTone: ['light', 'medium', 'dark', 'tan'][Math.floor(Math.random() * 4)],
      hairColor: ['black', 'brown', 'blonde', 'red', 'gray'][Math.floor(Math.random() * 5)],
      hairStyle: ['short', 'medium', 'long', 'curly', 'straight'][Math.floor(Math.random() * 5)],
      eyeColor: ['brown', 'blue', 'green', 'hazel', 'gray'][Math.floor(Math.random() * 5)],
      bodyType: ['slim', 'average', 'athletic', 'heavy'][Math.floor(Math.random() * 4)],
      height: 150 + Math.floor(Math.random() * 50),
      topWear: ['shirt', 'blouse', 'jacket', 'sweater'][Math.floor(Math.random() * 4)],
      bottomWear: ['pants', 'skirt', 'jeans', 'shorts'][Math.floor(Math.random() * 4)],
      shoes: ['formal', 'casual', 'sneakers', 'boots'][Math.floor(Math.random() * 4)],
      accessories: [] as string[],
      defaultExpression: ['neutral', 'friendly', 'serious', 'confident'][Math.floor(Math.random() * 4)],
      eyebrowStyle: ['natural', 'thick', 'thin', 'arched'][Math.floor(Math.random() * 4)],
      mouthShape: ['small', 'medium', 'large', 'wide'][Math.floor(Math.random() * 4)],
      walkStyle: ['casual', 'confident', 'elegant', 'energetic'][Math.floor(Math.random() * 4)],
      gestureFrequency: Math.floor(Math.random() * 100),
      blinkRate: 50 + Math.floor(Math.random() * 50)
    };

    setCustomization(randomCustomization);
    onCustomizationChange(randomCustomization);
    toast.success('Personalização aleatória aplicada!');
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-purple-600" />
          <span>Personalizar Avatar</span>
          <Badge className="bg-purple-100 text-purple-800">
            {avatar?.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="clothing">Roupas</TabsTrigger>
            <TabsTrigger value="expressions">Expressões</TabsTrigger>
            <TabsTrigger value="animations">Animações</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tom de Pele</label>
                <Select value={customization.skinTone} onValueChange={(value) => handleCustomizationUpdate('skinTone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="tan">Bronzeado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cor do Cabelo</label>
                <Select value={customization.hairColor} onValueChange={(value) => handleCustomizationUpdate('hairColor', value)}>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Estilo do Cabelo</label>
                <Select value={customization.hairStyle} onValueChange={(value) => handleCustomizationUpdate('hairStyle', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Curto</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="long">Longo</SelectItem>
                    <SelectItem value="curly">Cacheado</SelectItem>
                    <SelectItem value="straight">Liso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cor dos Olhos</label>
                <Select value={customization.eyeColor} onValueChange={(value) => handleCustomizationUpdate('eyeColor', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brown">Castanho</SelectItem>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="hazel">Mel</SelectItem>
                    <SelectItem value="gray">Cinza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Altura: {customization.height}cm</label>
                <Slider
                  value={[customization.height]}
                  onValueChange={([value]) => handleCustomizationUpdate('height', value)}
                  min={150}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clothing" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parte Superior</label>
                <Select value={customization.topWear} onValueChange={(value) => handleCustomizationUpdate('topWear', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shirt">Camisa</SelectItem>
                    <SelectItem value="blouse">Blusa</SelectItem>
                    <SelectItem value="jacket">Jaqueta</SelectItem>
                    <SelectItem value="sweater">Suéter</SelectItem>
                    <SelectItem value="uniform">Uniforme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Parte Inferior</label>
                <Select value={customization.bottomWear} onValueChange={(value) => handleCustomizationUpdate('bottomWear', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pants">Calça</SelectItem>
                    <SelectItem value="skirt">Saia</SelectItem>
                    <SelectItem value="jeans">Jeans</SelectItem>
                    <SelectItem value="shorts">Shorts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Calçados</label>
                <Select value={customization.shoes} onValueChange={(value) => handleCustomizationUpdate('shoes', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Social</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="sneakers">Tênis</SelectItem>
                    <SelectItem value="boots">Botas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expressions" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Expressão Padrão</label>
                <Select value={customization.defaultExpression} onValueChange={(value) => handleCustomizationUpdate('defaultExpression', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Neutro</SelectItem>
                    <SelectItem value="friendly">Amigável</SelectItem>
                    <SelectItem value="serious">Sério</SelectItem>
                    <SelectItem value="confident">Confiante</SelectItem>
                    <SelectItem value="thoughtful">Pensativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estilo das Sobrancelhas</label>
                <Select value={customization.eyebrowStyle} onValueChange={(value) => handleCustomizationUpdate('eyebrowStyle', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="thick">Grossas</SelectItem>
                    <SelectItem value="thin">Finas</SelectItem>
                    <SelectItem value="arched">Arqueadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Formato da Boca</label>
                <Select value={customization.mouthShape} onValueChange={(value) => handleCustomizationUpdate('mouthShape', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequena</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="wide">Larga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animations" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estilo de Caminhada</label>
                <Select value={customization.walkStyle} onValueChange={(value) => handleCustomizationUpdate('walkStyle', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="confident">Confiante</SelectItem>
                    <SelectItem value="elegant">Elegante</SelectItem>
                    <SelectItem value="energetic">Energético</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Frequência de Gestos: {customization.gestureFrequency}%
                </label>
                <Slider
                  value={[customization.gestureFrequency]}
                  onValueChange={([value]) => handleCustomizationUpdate('gestureFrequency', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Taxa de Piscadas: {customization.blinkRate}%
                </label>
                <Slider
                  value={[customization.blinkRate]}
                  onValueChange={([value]) => handleCustomizationUpdate('blinkRate', value)}
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button
            onClick={handleRandomize}
            variant="outline"
            className="flex-1 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Aleatorizar</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCustomizing}
            className="flex-1 flex items-center space-x-2"
          >
            {isCustomizing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Salvar</span>
          </Button>
        </div>

        {/* Premium Features */}
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Recursos Premium</span>
          </div>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>✨ Mais de 200 opções de personalização</div>
            <div>🎨 Texturas HD e materiais avançados</div>
            <div>🎭 Micro-expressões e gestos únicos</div>
            <div>🎪 Integração com Ready Player Me</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
