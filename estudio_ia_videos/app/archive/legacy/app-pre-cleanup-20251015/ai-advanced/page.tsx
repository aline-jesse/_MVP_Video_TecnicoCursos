
/**
 * 🤖 Estúdio IA de Vídeos - Sprint 11
 * IA Generativa Avançada (GPT-4o, Claude, Llama)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Brain,
  Sparkles,
  Zap,
  Wand2,
  FileText,
  MessageSquare,
  Video,
  Mic,
  Image,
  Settings,
  Download,
  Copy,
  RefreshCw,
  Lightbulb,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Cpu,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  responseTime: number;
  accuracy: number;
  status: 'active' | 'maintenance' | 'beta';
}

interface GenerationRequest {
  id: string;
  type: 'script' | 'content' | 'quiz' | 'summary';
  model: string;
  prompt: string;
  result: string;
  tokens: number;
  cost: number;
  duration: number;
  quality: number;
  createdAt: Date;
}

interface AIAnalytics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageQuality: number;
  averageResponseTime: number;
  popularModels: { model: string; usage: number }[];
}

export default function AIAdvancedPage() {
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationRequest[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationType, setGenerationType] = useState<string>('script');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);

  useEffect(() => {
    loadAIModels();
    loadGenerationHistory();
    loadAnalytics();
  }, []);

  const loadAIModels = () => {
    setAiModels([
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Modelo mais avançado para geração de conteúdo e análise',
        capabilities: ['Texto', 'Imagem', 'Code', 'Análise'],
        maxTokens: 128000,
        costPerToken: 0.00003,
        responseTime: 2.3,
        accuracy: 96,
        status: 'active'
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        description: 'Excelente para tarefas complexas e análise profunda',
        capabilities: ['Texto', 'Análise', 'Código', 'Raciocínio'],
        maxTokens: 200000,
        costPerToken: 0.000015,
        responseTime: 3.1,
        accuracy: 94,
        status: 'active'
      },
      {
        id: 'llama-3-70b',
        name: 'Llama 3 70B',
        provider: 'Meta',
        description: 'Modelo open-source para geração rápida e eficiente',
        capabilities: ['Texto', 'Code', 'Multilingual'],
        maxTokens: 8192,
        costPerToken: 0.000005,
        responseTime: 1.8,
        accuracy: 89,
        status: 'beta'
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'Google',
        description: 'Modelo multimodal para texto, imagem e vídeo',
        capabilities: ['Texto', 'Imagem', 'Vídeo', 'Multimodal'],
        maxTokens: 32768,
        costPerToken: 0.00001,
        responseTime: 2.7,
        accuracy: 91,
        status: 'active'
      },
      {
        id: 'grok-2',
        name: 'Grok-2',
        provider: 'xAI',
        description: 'Modelo com acesso a dados em tempo real',
        capabilities: ['Texto', 'Real-time', 'Web Search'],
        maxTokens: 16384,
        costPerToken: 0.00002,
        responseTime: 2.1,
        accuracy: 87,
        status: 'beta'
      }
    ]);
  };

  const loadGenerationHistory = () => {
    setGenerationHistory([
      {
        id: 'gen-1',
        type: 'script',
        model: 'gpt-4o',
        prompt: 'Criar roteiro para treinamento NR-35 sobre trabalho em altura',
        result: 'Roteiro completo de 15 minutos sobre procedimentos de segurança...',
        tokens: 1250,
        cost: 0.0375,
        duration: 2.3,
        quality: 95,
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'gen-2',
        type: 'quiz',
        model: 'claude-3-opus',
        prompt: 'Gerar quiz de 10 perguntas sobre NR-10',
        result: 'Quiz interativo com perguntas sobre segurança elétrica...',
        tokens: 890,
        cost: 0.01335,
        duration: 3.1,
        quality: 92,
        createdAt: new Date(Date.now() - 7200000)
      }
    ]);
  };

  const loadAnalytics = () => {
    setAnalytics({
      totalRequests: 847,
      totalTokens: 1284500,
      totalCost: 45.67,
      averageQuality: 93.2,
      averageResponseTime: 2.4,
      popularModels: [
        { model: 'GPT-4o', usage: 45 },
        { model: 'Claude 3 Opus', usage: 32 },
        { model: 'Llama 3 70B', usage: 23 }
      ]
    });
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Digite um prompt para gerar conteúdo');
      return;
    }

    const model = aiModels.find(m => m.id === selectedModel);
    if (!model) {
      toast.error('Selecione um modelo de IA');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    toast.success(`Gerando ${generationType} com ${model.name}...`);

    const timer = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          
          // Simular resultado da geração
          const newGeneration: GenerationRequest = {
            id: `gen-${Date.now()}`,
            type: generationType as any,
            model: selectedModel,
            prompt: prompt,
            result: `Resultado gerado pelo ${model.name} para: ${prompt.substring(0, 50)}...`,
            tokens: Math.floor(Math.random() * 2000) + 500,
            cost: (Math.floor(Math.random() * 50) + 10) / 100,
            duration: Math.random() * 3 + 1,
            quality: Math.floor(Math.random() * 20) + 80,
            createdAt: new Date()
          };
          
          setGenerationHistory(prev => [newGeneration, ...prev]);
          setIsGenerating(false);
          toast.success('Conteúdo gerado com sucesso!');
          return 100;
        }
        return prev + 3;
      });
    }, 100);
  };

  const copyResult = (result: string) => {
    copyToClipboard(result);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para área de transferência!');
  };

  const getModelStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      beta: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'script': return FileText;
      case 'quiz': return Target;
      case 'content': return Sparkles;
      case 'summary': return BarChart3;
      default: return Brain;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              IA Generativa Avançada
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Acesse os modelos de IA mais avançados do mundo para criar conteúdo excepcional
          </p>
        </div>

        <Tabs defaultValue="generation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generation">Geração</TabsTrigger>
            <TabsTrigger value="models">Modelos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Generation Tab */}
          <TabsContent value="generation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Generation Controls */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wand2 className="h-5 w-5 mr-2" />
                      Gerador de Conteúdo IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Modelo de IA:</label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {aiModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name} ({model.provider})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Tipo de Conteúdo:</label>
                        <Select value={generationType} onValueChange={setGenerationType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="script">Roteiro de Vídeo</SelectItem>
                            <SelectItem value="content">Conteúdo Educacional</SelectItem>
                            <SelectItem value="quiz">Quiz Interativo</SelectItem>
                            <SelectItem value="summary">Resumo Técnico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Prompt:</label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Descreva detalhadamente o que você quer que a IA gere..."
                        className="min-h-32"
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {prompt.length}/2000 caracteres
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Temperature: {temperature[0]}</label>
                        <Slider
                          value={temperature}
                          onValueChange={setTemperature}
                          max={2}
                          min={0}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Max Tokens: {maxTokens[0]}</label>
                        <Slider
                          value={maxTokens}
                          onValueChange={setMaxTokens}
                          max={4096}
                          min={256}
                          step={256}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={generateContent}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                          Gerando... {generationProgress}%
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Gerar Conteúdo
                        </>
                      )}
                    </Button>

                    {isGenerating && (
                      <Progress value={generationProgress} className="h-2" />
                    )}
                  </CardContent>
                </Card>

                {/* Recent Results */}
                {generationHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Resultado Mais Recente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge>{generationHistory[0].type}</Badge>
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{generationHistory[0].quality}%</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">
                            {generationHistory[0].result}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>
                            {generationHistory[0].tokens} tokens • ${generationHistory[0].cost.toFixed(3)} • {generationHistory[0].duration.toFixed(1)}s
                          </span>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => copyResult(generationHistory[0].result)}
                              variant="outline" 
                              size="sm"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Model Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Cpu className="h-4 w-4 mr-2" />
                      Modelo Selecionado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const model = aiModels.find(m => m.id === selectedModel);
                      if (!model) return null;
                      
                      return (
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold">{model.name}</h4>
                            <p className="text-sm text-gray-600">{model.provider}</p>
                          </div>
                          
                          <p className="text-sm">{model.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Precisão:</span>
                              <span className="font-semibold">{model.accuracy}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Tempo Resposta:</span>
                              <span className="font-semibold">{model.responseTime}s</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Custo/Token:</span>
                              <span className="font-semibold">${model.costPerToken.toFixed(6)}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Capacidades:</p>
                            <div className="flex flex-wrap gap-1">
                              {model.capabilities.map((cap, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Prompts Sugeridos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        'Criar roteiro de 10 minutos sobre NR-33 (espaços confinados)',
                        'Gerar quiz de 15 perguntas sobre primeiros socorros',
                        'Criar conteúdo sobre uso correto de EPIs',
                        'Resumir principais pontos da NR-12 sobre máquinas'
                      ].map((suggestion, index) => (
                        <Button
                          key={index}
                          onClick={() => setPrompt(suggestion)}
                          variant="outline"
                          size="sm"
                          className="w-full text-left justify-start text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiModels.map((model) => (
                <Card key={model.id} className={selectedModel === model.id ? 'ring-2 ring-purple-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{model.name}</h4>
                        <p className="text-sm text-gray-600">{model.provider}</p>
                      </div>
                      <Badge className={getModelStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Precisão:</span>
                        <span className="font-semibold">{model.accuracy}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max Tokens:</span>
                        <span className="font-semibold">{model.maxTokens.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Custo:</span>
                        <span className="font-semibold">${model.costPerToken.toFixed(6)}/token</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Capacidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.map((cap, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => setSelectedModel(model.id)}
                      variant={selectedModel === model.id ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                    >
                      {selectedModel === model.id ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="space-y-4">
              {generationHistory.map((generation) => {
                const IconComponent = getTypeIcon(generation.type);
                return (
                  <Card key={generation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-purple-600" />
                          <div>
                            <h4 className="font-semibold capitalize">{generation.type}</h4>
                            <p className="text-sm text-gray-600">{generation.model}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{generation.quality}%</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Prompt:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {generation.prompt}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Resultado:</p>
                        <div className="text-sm bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                          {generation.result}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        <span>
                          {generation.tokens} tokens • ${generation.cost.toFixed(3)} • {generation.duration.toFixed(1)}s
                        </span>
                        <span>{generation.createdAt.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => copyResult(generation.result)}
                          variant="outline" 
                          size="sm"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          onClick={() => setPrompt(generation.prompt)}
                          variant="outline" 
                          size="sm"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reutilizar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.totalRequests.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Total Requests</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Cpu className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {(analytics.totalTokens / 1000000).toFixed(1)}M
                      </div>
                      <p className="text-sm text-gray-600">Tokens Processados</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        ${analytics.totalCost.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">Custo Total</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">
                        {analytics.averageQuality.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">Qualidade Média</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Modelos Mais Utilizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.popularModels.map((model, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{model.model}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${model.usage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-12 text-right">
                              {model.usage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
