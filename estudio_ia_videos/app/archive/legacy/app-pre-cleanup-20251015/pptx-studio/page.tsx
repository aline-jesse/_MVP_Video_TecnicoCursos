'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Play,
  Download,
  Settings,
  Palette,
  Wand2,
  Video,
  Image,
  FileText,
  Layers,
  Zap,
  Sparkles,
  Crown,
  Star,
  Trophy,
  Rocket,
  Target,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  Shield,
  Globe,
  Cpu,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Headphones,
  Mic,
  Camera,
} from 'lucide-react';

// Types
interface PPTXProject {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  progress: number;
  originalFile: string;
  slides: SlideData[];
  createdAt: Date;
  lastModified: Date;
}

interface SlideData {
  id: string;
  title: string;
  content: string;
  image?: string;
  duration: number;
  transition?: string;
  voiceOver?: {
    text: string;
    voice: string;
    speed: number;
  };
  animations?: string[];
}

interface Template {
  id: string;
  name: string;
  category: string;
  preview: string;
  slides: number;
  duration: string;
  style: string;
}

export default function PPTXStudio() {
  const [currentProject, setCurrentProject] = useState<PPTXProject | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // URL parameters handling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['upload', 'editor', 'templates', 'export', 'analytics'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Mock templates data
  const templates: Template[] = [
    {
      id: '1',
      name: 'Business Presentation',
      category: 'Corporate',
      preview: '/templates/business.jpg',
      slides: 15,
      duration: '5-7 min',
      style: 'Professional'
    },
    {
      id: '2',
      name: 'Educational Course',
      category: 'Education',
      preview: '/templates/education.jpg',
      slides: 20,
      duration: '8-10 min',
      style: 'Clean & Modern'
    },
    {
      id: '3',
      name: 'Marketing Pitch',
      category: 'Marketing',
      preview: '/templates/marketing.jpg',
      slides: 12,
      duration: '4-6 min',
      style: 'Creative'
    }
  ];

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/v1/pptx/upload-production', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadProgress(100);
        
        // Create project from upload result
        const newProject: PPTXProject = {
          id: result.projectId || Date.now().toString(),
          name: file.name.replace('.pptx', ''),
          status: 'processing',
          progress: 0,
          originalFile: file.name,
          slides: result.slides || [],
          createdAt: new Date(),
          lastModified: new Date()
        };
        
        setCurrentProject(newProject);
        setActiveTab('editor');
        
        // Start processing simulation
        simulateProcessing(newProject);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro no upload: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Simulate processing
  const simulateProcessing = (project: PPTXProject) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setCurrentProject(prev => prev ? { ...prev, progress } : null);
      
      if (progress >= 100) {
        clearInterval(interval);
        setCurrentProject(prev => prev ? { ...prev, status: 'ready', progress: 100 } : null);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PPTX Studio
              </h1>
              <p className="text-gray-600 mt-2">
                Transforme suas apresentações em vídeos profissionais com IA
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Crown className="w-4 h-4 mr-1" />
              Sistema Consolidado
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Upload de Apresentação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processando arquivo...</span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Arraste seu arquivo PPTX aqui
                        </h3>
                        <p className="text-gray-500 mt-1">
                          Ou clique para selecionar um arquivo
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pptx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        id="pptx-upload"
                      />
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <label htmlFor="pptx-upload" className="cursor-pointer">
                          Selecionar Arquivo
                        </label>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Recent Projects Preview */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Projetos Recentes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">Projeto {i}</h5>
                              <p className="text-sm text-gray-500">2 dias atrás</p>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Pronto
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  Editor de Slides
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentProject ? (
                  <div className="space-y-6">
                    {/* Project Info */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{currentProject.name}</h3>
                        <p className="text-sm text-gray-500">
                          {currentProject.slides.length} slides • Criado em {currentProject.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={currentProject.status === 'ready' ? 'default' : 'outline'}
                        className={currentProject.status === 'ready' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {currentProject.status === 'processing' && 'Processando...'}
                        {currentProject.status === 'ready' && 'Pronto para edição'}
                        {currentProject.status === 'error' && 'Erro'}
                      </Badge>
                    </div>

                    {currentProject.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processando slides...</span>
                          <span>{currentProject.progress}%</span>
                        </div>
                        <Progress value={currentProject.progress} />
                      </div>
                    )}

                    {currentProject.status === 'ready' && (
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Slides Preview */}
                        <div className="lg:col-span-3">
                          <h4 className="font-semibold mb-4">Timeline de Slides</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }, (_, i) => (
                              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-3">
                                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-2 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-400">{i + 1}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">Slide {i + 1}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Controles</h4>
                          
                          <Card>
                            <CardContent className="p-4 space-y-3">
                              <h5 className="font-medium">Narração</h5>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Escolha uma voz" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pt-br-female">Português (Feminina)</SelectItem>
                                  <SelectItem value="pt-br-male">Português (Masculina)</SelectItem>
                                  <SelectItem value="en-us-female">Inglês (Feminina)</SelectItem>
                                  <SelectItem value="en-us-male">Inglês (Masculina)</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button size="sm" className="w-full">
                                <Mic className="w-4 h-4 mr-2" />
                                Gerar Narração
                              </Button>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4 space-y-3">
                              <h5 className="font-medium">Transições</h5>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Tipo de transição" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fade">Fade</SelectItem>
                                  <SelectItem value="slide">Slide</SelectItem>
                                  <SelectItem value="zoom">Zoom</SelectItem>
                                  <SelectItem value="flip">Flip</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex items-center space-x-2">
                                <Label htmlFor="duration" className="text-sm">Duração:</Label>
                                <Input id="duration" type="number" defaultValue="3" className="flex-1" />
                                <span className="text-sm text-gray-500">s</span>
                              </div>
                            </CardContent>
                          </Card>

                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <Play className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum projeto carregado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Faça upload de um arquivo PPTX para começar a editar
                    </p>
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Templates de Vídeo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`hover:shadow-lg transition-all cursor-pointer ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-6">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{template.name}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Categoria:</span>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Slides:</span>
                            <span>{template.slides}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duração:</span>
                            <span>{template.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estilo:</span>
                            <span>{template.style}</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          variant={selectedTemplate?.id === template.id ? 'default' : 'outline'}
                        >
                          {selectedTemplate?.id === template.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Selecionado
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2" />
                              Usar Template
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Template Selecionado: {selectedTemplate.name}</h4>
                    <p className="text-gray-600 mb-4">
                      Este template será aplicado ao seu projeto atual. As configurações de estilo, 
                      transições e layout serão automaticamente ajustadas.
                    </p>
                    <div className="flex gap-4">
                      <Button>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Aplicar Template
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-600" />
                  Exportar Vídeo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-4">Configurações de Export</h4>
                      <div className="space-y-4">
                        <div>
                          <Label>Qualidade do Vídeo</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a qualidade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                              <SelectItem value="720p">HD (720p)</SelectItem>
                              <SelectItem value="4k">4K Ultra HD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Formato</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o formato" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mp4">MP4 (Recomendado)</SelectItem>
                              <SelectItem value="avi">AVI</SelectItem>
                              <SelectItem value="mov">MOV</SelectItem>
                              <SelectItem value="webm">WebM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Taxa de Quadros (FPS)</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o FPS" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24">24 FPS (Cinema)</SelectItem>
                              <SelectItem value="30">30 FPS (Padrão)</SelectItem>
                              <SelectItem value="60">60 FPS (Suave)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="watermark" />
                          <Label htmlFor="watermark">Incluir marca d'água</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="subtitles" />
                          <Label htmlFor="subtitles">Gerar legendas automáticas</Label>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      Iniciar Renderização
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Preview Final</h4>
                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center text-white">
                        <Video className="w-12 h-12 mx-auto mb-2" />
                        <p>Preview do vídeo final</p>
                        <p className="text-sm opacity-75">1920x1080 • 5:30 min</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Tamanho estimado:</span>
                        <span className="font-medium">~45 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tempo de renderização:</span>
                        <span className="font-medium">~3-5 minutos</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Qualidade:</span>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <Star className="w-3 h-3 mr-1" />
                          Alta Qualidade
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Estatísticas de Uso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">127</div>
                        <div className="text-sm text-gray-500">Vídeos Criados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">89%</div>
                        <div className="text-sm text-gray-500">Taxa de Sucesso</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tempo médio de processamento</span>
                        <span className="font-medium">4.2 min</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Qualidade média</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Formato mais usado</span>
                        <Badge variant="outline">MP4 Full HD</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Tendências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="font-medium">Templates Corporativos</div>
                          <div className="text-sm text-gray-500">Mais populares este mês</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">+45%</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Rocket className="w-8 h-8 text-green-600" />
                        <div>
                          <div className="font-medium">Narração IA</div>
                          <div className="text-sm text-gray-500">Funcionalidade em alta</div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">+67%</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                        <div>
                          <div className="font-medium">Efeitos Avançados</div>
                          <div className="text-sm text-gray-500">Crescimento consistente</div>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">+23%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}