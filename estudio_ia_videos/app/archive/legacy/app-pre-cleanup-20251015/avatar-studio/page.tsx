'use client';

import React, { useState, useEffect } from 'react';
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
  User,
  Video,
  Mic,
  Camera,
  Sparkles,
  Play,
  Pause,
  Download,
  Settings,
  Palette,
  Wand2,
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
  Volume2,
  FileVideo,
  Image,
  Layers,
  Zap,
  Heart,
  ThumbsUp,
  Share,
  Bookmark,
  Upload,
  Eye,
  Sliders,
  Brush,
  Scissors,
  Move,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Grid,
  Maximize,
  Minimize
} from 'lucide-react';

// Types
interface Avatar {
  id: string;
  name: string;
  category: 'realistic' | '3d' | 'cartoon' | 'professional';
  gender: 'male' | 'female' | 'neutral';
  style: string;
  preview: string;
  isCustom?: boolean;
  emotions?: string[];
  languages?: string[];
}

interface TalkingPhotoProject {
  id: string;
  name: string;
  originalImage: string;
  status: 'processing' | 'ready' | 'error';
  progress: number;
  duration: number;
  script: string;
  voice: string;
  avatar?: Avatar;
}

interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  accent: string;
  sample?: string;
}

export default function AvatarStudio() {
  const [activeTab, setActiveTab] = useState('talking-photo');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [currentProject, setCurrentProject] = useState<TalkingPhotoProject | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);

  // URL parameters handling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['talking-photo', '3d', 'hyperreal', 'tts', 'render', 'vidnoz', 'orchestrator', 'generate'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Mock avatars data
  const avatars: Avatar[] = [
    {
      id: 'sarah_executive',
      name: 'Sarah - Executive',
      category: 'professional',
      gender: 'female',
      style: 'Business Professional',
      preview: '/avatars/sarah_executive.jpg',
      emotions: ['neutral', 'smile', 'serious', 'confident'],
      languages: ['pt-BR', 'en-US', 'es-ES']
    },
    {
      id: 'john_presenter',
      name: 'John - Presenter',
      category: 'professional',
      gender: 'male',
      style: 'TV Presenter',
      preview: '/avatars/john_presenter.jpg',
      emotions: ['enthusiastic', 'friendly', 'professional', 'calm'],
      languages: ['pt-BR', 'en-US', 'fr-FR']
    },
    {
      id: 'ana_teacher',
      name: 'Ana - Professora',
      category: 'realistic',
      gender: 'female',
      style: 'Educational',
      preview: '/avatars/ana_teacher.jpg',
      emotions: ['patient', 'encouraging', 'informative', 'warm'],
      languages: ['pt-BR', 'es-ES']
    },
    {
      id: 'carlos_tech',
      name: 'Carlos - Tech Expert',
      category: '3d',
      gender: 'male',
      style: 'Technical Specialist',
      preview: '/avatars/carlos_tech.jpg',
      emotions: ['focused', 'analytical', 'innovative', 'precise'],
      languages: ['pt-BR', 'en-US']
    }
  ];

  // Mock voice options
  const voiceOptions: VoiceOption[] = [
    {
      id: 'pt_br_female_1',
      name: 'Beatriz (Brasil)',
      language: 'pt-BR',
      gender: 'female',
      accent: 'Paulista',
      sample: '/voices/beatriz_sample.mp3'
    },
    {
      id: 'pt_br_male_1',
      name: 'Roberto (Brasil)',
      language: 'pt-BR',
      gender: 'male',
      accent: 'Carioca',
      sample: '/voices/roberto_sample.mp3'
    },
    {
      id: 'en_us_female_1',
      name: 'Emma (USA)',
      language: 'en-US',
      gender: 'female',
      accent: 'American',
      sample: '/voices/emma_sample.mp3'
    },
    {
      id: 'en_us_male_1',
      name: 'David (USA)',
      language: 'en-US',
      gender: 'male',
      accent: 'American',
      sample: '/voices/david_sample.mp3'
    }
  ];

  // Handle image upload for talking photo
  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/talking-photo/generate-production', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setProcessingProgress(100);
        
        const newProject: TalkingPhotoProject = {
          id: result.projectId || Date.now().toString(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          originalImage: URL.createObjectURL(file),
          status: 'ready',
          progress: 100,
          duration: 30,
          script: '',
          voice: voiceOptions[0].id
        };
        
        setCurrentProject(newProject);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro no upload: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate talking photo video
  const generateTalkingPhoto = async () => {
    if (!currentProject || !script.trim()) {
      alert('Por favor, adicione um texto para narração');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const response = await fetch('/api/talking-photo/generate-production-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProject.id,
          script: script,
          voice: selectedVoice?.id || voiceOptions[0].id,
          emotions: ['neutral', 'smile'],
          quality: 'hd'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Simulate processing progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 15;
          setProcessingProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            setCurrentProject(prev => prev ? { ...prev, status: 'ready' } : null);
            alert('Vídeo gerado com sucesso!');
          }
        }, 1000);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Erro na geração: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Avatar Studio
              </h1>
              <p className="text-gray-600 mt-2">
                Crie avatares realistas e talking photos com inteligência artificial
              </p>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Crown className="w-4 h-4 mr-1" />
              Sistema Consolidado
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="talking-photo" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Talking Photo
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Avatar 3D
            </TabsTrigger>
            <TabsTrigger value="hyperreal" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Hyperreal
            </TabsTrigger>
            <TabsTrigger value="tts" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              TTS Studio
            </TabsTrigger>
            <TabsTrigger value="render" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Render
            </TabsTrigger>
            <TabsTrigger value="orchestrator" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Orchestrator
            </TabsTrigger>
          </TabsList>

          {/* Talking Photo Tab */}
          <TabsContent value="talking-photo" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload Area */}
              <Card className="lg:col-span-2 shadow-lg border-0 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-purple-600" />
                    Talking Photo Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!currentProject ? (
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-12 text-center hover:border-purple-400 transition-colors">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Upload da Foto
                          </h3>
                          <p className="text-gray-500 mt-1">
                            Arraste uma imagem ou clique para selecionar
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button asChild className="bg-purple-600 hover:bg-purple-700">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            Selecionar Imagem
                          </label>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Image Preview */}
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={currentProject.originalImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Script Input */}
                      <div className="space-y-2">
                        <Label htmlFor="script">Texto para Narração</Label>
                        <Textarea
                          id="script"
                          placeholder="Digite o texto que o avatar irá falar..."
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{script.length} caracteres</span>
                          <span>~{Math.ceil(script.length / 150)} segundos</span>
                        </div>
                      </div>

                      {/* Voice Selection */}
                      <div className="space-y-2">
                        <Label>Voz da Narração</Label>
                        <Select value={selectedVoice?.id} onValueChange={(value) => {
                          const voice = voiceOptions.find(v => v.id === value);
                          setSelectedVoice(voice || null);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha uma voz" />
                          </SelectTrigger>
                          <SelectContent>
                            {voiceOptions.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                <div className="flex items-center gap-2">
                                  <span>{voice.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {voice.language}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Generation Progress */}
                      {isProcessing && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Gerando vídeo...</span>
                            <span>{processingProgress}%</span>
                          </div>
                          <Progress value={processingProgress} />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <Button 
                          onClick={generateTalkingPhoto}
                          disabled={!script.trim() || isProcessing}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Gerar Talking Photo
                        </Button>
                        <Button variant="outline" onClick={() => setCurrentProject(null)}>
                          <Upload className="w-4 h-4 mr-2" />
                          Nova Imagem
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings Panel */}
              <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Qualidade do Vídeo</Label>
                      <Select defaultValue="hd">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sd">SD (480p)</SelectItem>
                          <SelectItem value="hd">HD (720p)</SelectItem>
                          <SelectItem value="fhd">Full HD (1080p)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Velocidade da Fala</Label>
                      <Select defaultValue="normal">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="slow">Lenta</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="fast">Rápida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Expressão Facial</Label>
                      <Select defaultValue="neutral">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutra</SelectItem>
                          <SelectItem value="smile">Sorrindo</SelectItem>
                          <SelectItem value="serious">Séria</SelectItem>
                          <SelectItem value="friendly">Amigável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="background-removal" />
                      <Label htmlFor="background-removal">Remover fundo automaticamente</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="lip-sync" defaultChecked />
                      <Label htmlFor="lip-sync">Sincronização labial avançada</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Avatar 3D Tab */}
          <TabsContent value="3d" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Avatares 3D
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {avatars.map((avatar) => (
                    <Card 
                      key={avatar.id} 
                      className={`hover:shadow-lg transition-all cursor-pointer ${
                        selectedAvatar?.id === avatar.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedAvatar(avatar)}
                    >
                      <CardContent className="p-6">
                        <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{avatar.name}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Categoria:</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {avatar.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Gênero:</span>
                            <span className="capitalize">{avatar.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Idiomas:</span>
                            <span>{avatar.languages?.length || 0}</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          variant={selectedAvatar?.id === avatar.id ? 'default' : 'outline'}
                        >
                          {selectedAvatar?.id === avatar.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Selecionado
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2" />
                              Selecionar
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedAvatar && (
                  <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Avatar Selecionado: {selectedAvatar.name}</h4>
                    <p className="text-gray-600 mb-4">
                      Estilo: {selectedAvatar.style} • 
                      Emoções disponíveis: {selectedAvatar.emotions?.join(', ')}
                    </p>
                    <div className="flex gap-4">
                      <Button>
                        <Play className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button>
                        <Palette className="w-4 h-4 mr-2" />
                        Personalizar
                      </Button>
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Usar Avatar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hyperreal Tab */}
          <TabsContent value="hyperreal" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Avatares Hyperreal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Avatares Ultra Realistas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tecnologia de ponta para avatares indistinguíveis de pessoas reais
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-lg">
                      <Crown className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Qualidade Cinema</h4>
                      <p className="text-sm text-gray-600">Renderização em 4K com detalhes fotorrealistas</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-lg">
                      <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">IA Avançada</h4>
                      <p className="text-sm text-gray-600">Machine learning para expressões naturais</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-lg">
                      <Trophy className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Resultado Premium</h4>
                      <p className="text-sm text-gray-600">Qualidade profissional para projetos exigentes</p>
                    </div>
                  </div>
                  <Button className="mt-8 bg-purple-600 hover:bg-purple-700" size="lg">
                    <Rocket className="w-5 h-5 mr-2" />
                    Criar Avatar Hyperreal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TTS Studio Tab */}
          <TabsContent value="tts" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-green-600" />
                  TTS Studio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="tts-text">Texto para Conversão</Label>
                      <Textarea
                        id="tts-text"
                        placeholder="Digite o texto que será convertido em áudio..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Voz</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma voz" />
                          </SelectTrigger>
                          <SelectContent>
                            {voiceOptions.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                {voice.name} ({voice.language})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Velocidade</Label>
                          <Select defaultValue="1.0">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.5">0.5x (Muito Lenta)</SelectItem>
                              <SelectItem value="0.75">0.75x (Lenta)</SelectItem>
                              <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                              <SelectItem value="1.25">1.25x (Rápida)</SelectItem>
                              <SelectItem value="1.5">1.5x (Muito Rápida)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Tom</Label>
                          <Select defaultValue="0">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="-2">Muito Grave</SelectItem>
                              <SelectItem value="-1">Grave</SelectItem>
                              <SelectItem value="0">Normal</SelectItem>
                              <SelectItem value="1">Agudo</SelectItem>
                              <SelectItem value="2">Muito Agudo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="ssml" />
                        <Label htmlFor="ssml">Usar SSML (Speech Synthesis Markup Language)</Label>
                      </div>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Mic className="w-4 h-4 mr-2" />
                      Gerar Áudio
                    </Button>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Preview e Controles</h4>
                    <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
                      <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Audio preview aparecerá aqui</p>
                      <div className="flex justify-center gap-4 mt-4">
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium">Histórico de Gerações</h5>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div>
                            <div className="font-medium">Audio {i}</div>
                            <div className="text-sm text-gray-500">2 min atrás</div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Render Tab */}
          <TabsContent value="render" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" />
                  Sistema de Renderização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="font-semibold mb-4">Fila de Renderização</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Avatar Sarah - Apresentação', status: 'processing', progress: 75 },
                          { name: 'Talking Photo - João', status: 'queued', progress: 0 },
                          { name: 'Avatar 3D - Ana', status: 'completed', progress: 100 }
                        ].map((job, i) => (
                          <div key={i} className="p-4 bg-white rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{job.name}</span>
                              <Badge 
                                variant={job.status === 'completed' ? 'default' : 'outline'}
                                className={
                                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {job.status === 'completed' && 'Concluído'}
                                {job.status === 'processing' && 'Processando'}
                                {job.status === 'queued' && 'Na Fila'}
                              </Badge>
                            </div>
                            {job.status === 'processing' && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>Progresso</span>
                                  <span>{job.progress}%</span>
                                </div>
                                <Progress value={job.progress} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4">Configurações de Render</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Qualidade</Label>
                          <Select defaultValue="1080p">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="720p">HD (720p)</SelectItem>
                              <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                              <SelectItem value="4k">4K Ultra HD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>FPS</Label>
                          <Select defaultValue="30">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24">24 FPS</SelectItem>
                              <SelectItem value="30">30 FPS</SelectItem>
                              <SelectItem value="60">60 FPS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Formato</Label>
                          <Select defaultValue="mp4">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mp4">MP4</SelectItem>
                              <SelectItem value="avi">AVI</SelectItem>
                              <SelectItem value="mov">MOV</SelectItem>
                              <SelectItem value="webm">WebM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Codec</Label>
                          <Select defaultValue="h264">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="h264">H.264</SelectItem>
                              <SelectItem value="h265">H.265</SelectItem>
                              <SelectItem value="vp9">VP9</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Status do Sistema</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Sistema Online</span>
                        </div>
                        <p className="text-sm text-gray-600">Todos os serviços funcionando normalmente</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>CPU</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <Progress value={45} className="h-2" />

                        <div className="flex justify-between text-sm">
                          <span>Memória</span>
                          <span className="font-medium">62%</span>
                        </div>
                        <Progress value={62} className="h-2" />

                        <div className="flex justify-between text-sm">
                          <span>GPU</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>

                      <div className="pt-4 border-t">
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Jobs na fila:</span>
                            <span className="font-medium">3</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tempo médio:</span>
                            <span className="font-medium">2.5 min</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Concluídos hoje:</span>
                            <span className="font-medium">47</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orchestrator Tab */}
          <TabsContent value="orchestrator" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Avatar Orchestrator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Central de Controle
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Gerencie todos os aspectos do sistema de avatares
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <Card className="p-6">
                      <Database className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Gerenciar Avatares</h4>
                      <p className="text-sm text-gray-600 mb-4">Organize sua biblioteca de avatares</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Abrir Biblioteca
                      </Button>
                    </Card>

                    <Card className="p-6">
                      <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Analytics</h4>
                      <p className="text-sm text-gray-600 mb-4">Métricas de uso e performance</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Ver Relatórios
                      </Button>
                    </Card>

                    <Card className="p-6">
                      <Cpu className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2">Sistema</h4>
                      <p className="text-sm text-gray-600 mb-4">Configurações e recursos</p>
                      <Button size="sm" variant="outline" className="w-full">
                        Configurar
                      </Button>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
