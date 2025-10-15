
/**
 * 🎨 Estúdio IA de Vídeos - Sprint 10
 * Página de IA Generativa Avançada
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles,
  User,
  Palette,
  MessageSquare,
  Wand2,
  Image,
  Video,
  Mic,
  Download,
  Shuffle,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  Brain,
  Zap,
  Star,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GeneratedContent } from '@/types/sprint10';

export default function AIGenerativePage() {
  const [activeTab, setActiveTab] = useState('avatars');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [prompts, setPrompts] = useState({
    avatar: '',
    scenario: '',
    script: '',
    style: 'professional'
  });

  const avatarStyles = [
    { id: 'professional', name: 'Profissional', description: 'Avatar corporativo e sério' },
    { id: 'friendly', name: 'Amigável', description: 'Avatar caloroso e acessível' },
    { id: 'expert', name: 'Especialista', description: 'Avatar técnico e experiente' },
    { id: 'instructor', name: 'Instrutor', description: 'Avatar educativo e didático' }
  ];

  const scenarioTypes = [
    { id: 'construction', name: 'Construção Civil', icon: '🏗️' },
    { id: 'industrial', name: 'Ambiente Industrial', icon: '🏭' },
    { id: 'office', name: 'Escritório', icon: '🏢' },
    { id: 'laboratory', name: 'Laboratório', icon: '🧪' },
    { id: 'warehouse', name: 'Armazém', icon: '📦' },
    { id: 'outdoor', name: 'Área Externa', icon: '🌳' }
  ];

  const generateContent = async (type: 'avatar' | 'scenario' | 'script') => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simular progresso de geração
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Simular chamada para API de IA generativa
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Simular conteúdo gerado baseado no tipo
      let content;
      switch (type) {
        case 'avatar':
          content = {
            type: 'avatar' as const,
            url: '/generated-avatar.jpg',
            style: prompts.style,
            description: 'Avatar profissional gerado com IA',
            variations: [
              { id: 1, url: '/avatar-var-1.jpg', style: 'Sério' },
              { id: 2, url: '/avatar-var-2.jpg', style: 'Sorridente' },
              { id: 3, url: '/avatar-var-3.jpg', style: 'Confiante' }
            ]
          };
          break;
        case 'scenario':
          content = {
            type: 'scenario' as const,
            url: '/generated-scenario.jpg',
            environment: prompts.scenario,
            description: 'Cenário 3D realista para treinamento',
            elements: ['Equipamentos de segurança', 'Sinalização', 'Área de trabalho'],
            lighting: 'Natural com toques dramáticos'
          };
          break;
        case 'script':
          content = {
            type: 'script' as const,
            text: `# Script de Treinamento - ${prompts.script}

## Introdução
Bem-vindos ao treinamento sobre ${prompts.script}. Este módulo foi criado especialmente para garantir a segurança e o conhecimento de todos os participantes.

## Objetivos
- Compreender os riscos envolvidos
- Conhecer os procedimentos de segurança
- Aplicar as melhores práticas
- Desenvolver consciência preventiva

## Desenvolvimento
Durante este treinamento, abordaremos os aspectos mais importantes relacionados à segurança no trabalho, focando em situações práticas e reais do dia a dia.

## Conclusão
A segurança é responsabilidade de todos. Ao final deste módulo, você estará preparado para executar suas atividades de forma segura e eficiente.`,
            duration: '8-12 minutos',
            tone: 'Educativo e envolvente',
            complexity: 'Intermediário'
          };
          break;
        default:
          content = null;
      }

      setGeneratedContent(content);
      toast.success(`${type === 'avatar' ? 'Avatar' : type === 'scenario' ? 'Cenário' : 'Script'} gerado com sucesso!`);
    } catch (error) {
      toast.error('Erro na geração. Tente novamente.');
      console.error('Erro na geração:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  };

  const downloadContent = () => {
    toast.success('Download iniciado!');
  };

  const generateVariations = () => {
    toast.success('Gerando variações...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              IA Generativa Avançada
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Crie avatares, cenários e roteiros personalizados usando inteligência artificial de última geração
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="flex space-x-2 p-1 bg-white rounded-lg border">
            <Button
              onClick={() => setActiveTab('avatars')}
              variant={activeTab === 'avatars' ? 'default' : 'ghost'}
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Avatares 3D</span>
            </Button>
            <Button
              onClick={() => setActiveTab('scenarios')}
              variant={activeTab === 'scenarios' ? 'default' : 'ghost'}
              className="flex items-center space-x-2"
            >
              <Palette className="h-4 w-4" />
              <span>Cenários</span>
            </Button>
            <Button
              onClick={() => setActiveTab('scripts')}
              variant={activeTab === 'scripts' ? 'default' : 'ghost'}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Scripts IA</span>
            </Button>
          </div>
        </div>

        {/* Avatar Generation Tab */}
        {activeTab === 'avatars' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Gerador de Avatares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição do Avatar</label>
                  <Textarea
                    value={prompts.avatar}
                    onChange={(e) => setPrompts({...prompts, avatar: e.target.value})}
                    placeholder="Ex: Engenheiro de segurança, homem, 40 anos, usando capacete branco e colete refletivo..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estilo</label>
                  <Select 
                    value={prompts.style} 
                    onValueChange={(value) => setPrompts({...prompts, style: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarStyles.map(style => (
                        <SelectItem key={style.id} value={style.id}>
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-sm text-gray-600">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => generateContent('avatar')}
                  disabled={isGenerating || !prompts.avatar}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando Avatar...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Gerar Avatar IA
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-gray-600 text-center">
                      Criando modelo 3D personalizado...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Avatar Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent && generatedContent.type === 'avatar' ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <User className="h-16 w-16 text-blue-600 mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold">Avatar Profissional</h3>
                          <p className="text-gray-600">{generatedContent.description}</p>
                        </div>
                        <Badge>{generatedContent.style}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {generatedContent.variations.map(variation => (
                        <div key={variation.id} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <User className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">{variation.style}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={downloadContent} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={generateVariations} variant="outline" className="flex-1">
                        <Shuffle className="h-4 w-4 mr-2" />
                        Variações
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <User className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Seu avatar gerado aparecerá aqui</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scenario Generation Tab */}
        {activeTab === 'scenarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Gerador de Cenários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Ambiente</label>
                  <div className="grid grid-cols-2 gap-2">
                    {scenarioTypes.map(type => (
                      <Button
                        key={type.id}
                        variant="outline"
                        onClick={() => setPrompts({...prompts, scenario: type.name})}
                        className="text-left h-auto p-3"
                      >
                        <div>
                          <div className="text-lg mb-1">{type.icon}</div>
                          <div className="text-sm font-medium">{type.name}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Detalhes do Cenário</label>
                  <Textarea
                    value={prompts.scenario}
                    onChange={(e) => setPrompts({...prompts, scenario: e.target.value})}
                    placeholder="Descreva o cenário desejado..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => generateContent('scenario')}
                  disabled={isGenerating || !prompts.scenario}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Criando Cenário...
                    </>
                  ) : (
                    <>
                      <Image className="h-4 w-4 mr-2" />
                      Gerar Cenário 3D
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-gray-600 text-center">
                      Renderizando ambiente 3D...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cenário Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent && generatedContent.type === 'scenario' ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <Palette className="h-16 w-16 text-green-600 mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold">{generatedContent.environment}</h3>
                          <p className="text-gray-600">{generatedContent.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Elementos Inclusos:</h4>
                        <ul className="space-y-1">
                          {generatedContent.elements.map((element, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              {element}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Iluminação:</h4>
                        <p className="text-sm text-gray-600">{generatedContent.lighting}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={downloadContent} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download 3D
                      </Button>
                      <Button onClick={generateVariations} variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview 360°
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Palette className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Seu cenário 3D aparecerá aqui</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Script Generation Tab */}
        {activeTab === 'scripts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Gerador de Scripts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tema do Treinamento</label>
                  <Input
                    value={prompts.script}
                    onChange={(e) => setPrompts({...prompts, script: e.target.value})}
                    placeholder="Ex: NR-35 Trabalho em Altura"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tom e Estilo</label>
                  <Select defaultValue="educativo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educativo">Educativo</SelectItem>
                      <SelectItem value="conversacional">Conversacional</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="motivacional">Motivacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duração Desejada</label>
                  <Select defaultValue="medio">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curto">5-8 minutos</SelectItem>
                      <SelectItem value="medio">8-12 minutos</SelectItem>
                      <SelectItem value="longo">12-20 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => generateContent('script')}
                  disabled={isGenerating || !prompts.script}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Escrevendo Script...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Gerar Script IA
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-xs text-gray-600 text-center">
                      Criando roteiro personalizado...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Script Gerado</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent && generatedContent.type === 'script' ? (
                  <div className="space-y-4">
                    <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">
                        {generatedContent.text}
                      </pre>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-sm font-medium">Duração</p>
                        <p className="text-xs text-gray-600">{generatedContent.duration}</p>
                      </div>
                      <div>
                        <Mic className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-medium">Tom</p>
                        <p className="text-xs text-gray-600">{generatedContent.tone}</p>
                      </div>
                      <div>
                        <Star className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                        <p className="text-sm font-medium">Nível</p>
                        <p className="text-xs text-gray-600">{generatedContent.complexity}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={downloadContent} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Script
                      </Button>
                      <Button onClick={generateVariations} variant="outline" className="flex-1">
                        <Zap className="h-4 w-4 mr-2" />
                        Gerar TTS
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Seu script gerado aparecerá aqui</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
