'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Smile, 
  Frown, 
  Meh, 
  Eye, 
  Heart,
  Zap,
  Hand,
  Users,
  Play,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';

interface Expression {
  id: string;
  name: string;
  category: 'emotion' | 'reaction' | 'social' | 'custom';
  intensity: number;
  duration: number;
  blendShapes: Record<string, number>;
  tags: string[];
  thumbnail?: string;
  isCustom: boolean;
  createdAt: Date;
  usageCount: number;
}

interface Gesture {
  id: string;
  name: string;
  category: 'hand' | 'body' | 'head' | 'full' | 'custom';
  duration: number;
  keyframes: Array<{
    time: number;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }>;
  tags: string[];
  thumbnail?: string;
  isCustom: boolean;
  createdAt: Date;
  usageCount: number;
}

interface ExpressionGestureLibraryProps {
  onExpressionSelected?: (expression: Expression) => void;
  onGestureSelected?: (gesture: Gesture) => void;
  onCombinationCreated?: (expression: Expression, gesture: Gesture) => void;
}

export default function ExpressionGestureLibrary({ 
  onExpressionSelected, 
  onGestureSelected, 
  onCombinationCreated 
}: ExpressionGestureLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExpression, setSelectedExpression] = useState<Expression | null>(null);
  const [selectedGesture, setSelectedGesture] = useState<Gesture | null>(null);

  // Biblioteca de expressões pré-definidas
  const [expressions] = useState<Expression[]>([
    {
      id: 'exp_1',
      name: 'Feliz',
      category: 'emotion',
      intensity: 0.8,
      duration: 2,
      blendShapes: { mouthSmile: 0.8, eyeSquintLeft: 0.3, eyeSquintRight: 0.3, cheekPuff: 0.2 },
      tags: ['feliz', 'alegre', 'sorriso'],
      isCustom: false,
      createdAt: new Date(),
      usageCount: 45
    },
    {
      id: 'exp_2',
      name: 'Triste',
      category: 'emotion',
      intensity: 0.7,
      duration: 3,
      blendShapes: { mouthFrown: 0.7, browInnerUp: 0.5, eyeLookDown: 0.4 },
      tags: ['triste', 'melancólico', 'choro'],
      isCustom: false,
      createdAt: new Date(),
      usageCount: 23
    },
    {
      id: 'exp_3',
      name: 'Surpreso',
      category: 'reaction',
      intensity: 0.9,
      duration: 1.5,
      blendShapes: { jawOpen: 0.6, browOuterUp: 0.8, eyeWideLeft: 0.9, eyeWideRight: 0.9 },
      tags: ['surpreso', 'chocado', 'espanto'],
      isCustom: false,
      createdAt: new Date(),
      usageCount: 67
    },
    {
      id: 'exp_4',
      name: 'Raiva',
      category: 'emotion',
      intensity: 0.8,
      duration: 2.5,
      blendShapes: { browDownLeft: 0.8, browDownRight: 0.8, mouthFrown: 0.6, noseSneer: 0.4 },
      tags: ['raiva', 'irritado', 'bravo'],
      isCustom: false,
      createdAt: new Date(),
      usageCount: 34
    },
    {
      id: 'exp_5',
      name: 'Piscadela',
      category: 'social',
      intensity: 1.0,
      duration: 0.5,
      blendShapes: { eyeBlinkLeft: 1.0, mouthSmile: 0.3 },
      tags: ['piscadela', 'flerte', 'cumprimento'],
      isCustom: false,
      createdAt: new Date(),
      usageCount: 89
    }
  ]);

  // Biblioteca de gestos pré-definidos
  const [gestures] = useState<Gesture[]>([
    {
      id: 'gest_1',
      name: 'Acenar',
      category: 'hand',
      duration: 2,
      keyframes: [
        { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
        { time: 0.5, position: { x: 0.2, y: 0.3, z: 0 }, rotation: { x: 0, y: 0, z: 15 }, scale: { x: 1, y: 1, z: 1 } },
        { time: 2, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
      ],
      tags: ['acenar', 'cumprimento', 'tchau'],
      isCustom: false,
      createdAt: new Date(),
      usageCount: 156
    },
    {
      id: 'gest_2',
      name: 'Apontar',
      category: 'hand',
      duration: 1.5,
      keyframes: [
        { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
        { time: 0.5, position: { x: 0.4, y: 0.2, z: 0.3 }, rotation: { x: 0, y: 45, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
        { time: 1.5, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
      ],
      tags: ['apontar', 'indicar', 'mostrar'],
      isCustom: false,
      createdAt: new Date(),
      usageCount: 78
    }
  ]);

  const filteredExpressions = expressions.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredGestures = gestures.filter(gest => {
    const matchesSearch = gest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || gest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emotion': return <Heart className="h-4 w-4" />;
      case 'reaction': return <Zap className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'hand': return <Hand className="h-4 w-4" />;
      case 'body': return <Users className="h-4 w-4" />;
      case 'head': return <Eye className="h-4 w-4" />;
      case 'full': return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getExpressionIcon = (expression: Expression) => {
    if (expression.name.toLowerCase().includes('feliz') || expression.name.toLowerCase().includes('sorriso')) {
      return <Smile className="h-6 w-6" />;
    } else if (expression.name.toLowerCase().includes('triste')) {
      return <Frown className="h-6 w-6" />;
    } else if (expression.name.toLowerCase().includes('surpreso')) {
      return <Eye className="h-6 w-6" />;
    } else {
      return <Meh className="h-6 w-6" />;
    }
  };

  const playExpression = (expression: Expression) => {
    setSelectedExpression(expression);
    onExpressionSelected?.(expression);
  };

  const playGesture = (gesture: Gesture) => {
    setSelectedGesture(gesture);
    onGestureSelected?.(gesture);
  };

  const createCombination = () => {
    if (selectedExpression && selectedGesture) {
      onCombinationCreated?.(selectedExpression, selectedGesture);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Biblioteca de Expressões e Gestos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barra de Pesquisa e Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar expressões e gestos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <Tabs defaultValue="expressions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expressions">Expressões</TabsTrigger>
              <TabsTrigger value="gestures">Gestos</TabsTrigger>
              <TabsTrigger value="combinations">Combinações</TabsTrigger>
            </TabsList>

            <TabsContent value="expressions" className="space-y-4">
              {/* Grid de Expressões */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredExpressions.map((expression) => (
                  <Card 
                    key={expression.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedExpression?.id === expression.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => playExpression(expression)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {getExpressionIcon(expression)}
                        </div>
                        <h3 className="font-medium text-sm">{expression.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {expression.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {expression.duration}s
                          <Eye className="h-3 w-3" />
                          {expression.usageCount}
                        </div>
                        <Button size="sm" variant="outline" className="h-6 px-2">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gestures" className="space-y-4">
              {/* Grid de Gestos */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredGestures.map((gesture) => (
                  <Card 
                    key={gesture.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedGesture?.id === gesture.id ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => playGesture(gesture)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          {getCategoryIcon(gesture.category)}
                        </div>
                        <h3 className="font-medium text-sm">{gesture.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {gesture.category}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {gesture.duration}s
                          <Eye className="h-3 w-3" />
                          {gesture.usageCount}
                        </div>
                        <Button size="sm" variant="outline" className="h-6 px-2">
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="combinations" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seleção de Expressão */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Expressão Selecionada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedExpression ? (
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {getExpressionIcon(selectedExpression)}
                        </div>
                        <div>
                          <h3 className="font-medium">{selectedExpression.name}</h3>
                          <p className="text-sm text-gray-600">
                            {selectedExpression.category} • {selectedExpression.duration}s
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Smile className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Selecione uma expressão</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Seleção de Gesto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gesto Selecionado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedGesture ? (
                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          {getCategoryIcon(selectedGesture.category)}
                        </div>
                        <div>
                          <h3 className="font-medium">{selectedGesture.name}</h3>
                          <p className="text-sm text-gray-600">
                            {selectedGesture.category} • {selectedGesture.duration}s
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Hand className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Selecione um gesto</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Botão de Combinação */}
              <div className="text-center">
                <Button 
                  onClick={createCombination}
                  disabled={!selectedExpression || !selectedGesture}
                  size="lg"
                  className="px-8"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Combinação
                </Button>
                {selectedExpression && selectedGesture && (
                  <p className="text-sm text-gray-600 mt-2">
                    Combinar "{selectedExpression.name}" + "{selectedGesture.name}"
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}