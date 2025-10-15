

/**
 * 🎭 Interface Vidnoz - Talking Photo Professional
 * Interface idêntica ao Vidnoz para Talking Photos
 */

'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Play,
  Download,
  Settings,
  User,
  Mic,
  Globe,
  Sparkles,
  Camera,
  ImageIcon,
  Video,
  Music,
  Palette,
  Eye,
  VolumeX,
  Volume2,
  RotateCcw,
  Maximize2,
  Share2,
  Crown,
  Zap,
  Brain,
  Heart,
  Star,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface VidnozAvatar {
  id: string;
  name: string;
  gender: 'masculino' | 'feminino';
  style: 'realista' | 'cartoon' | '3d' | 'anime';
  ethnicity: string;
  age: 'jovem' | 'adulto' | 'idoso';
  profession?: string;
  thumbnail: string;
  premium: boolean;
  new: boolean;
  popular: boolean;
}

interface VidnozVoice {
  id: string;
  name: string;
  language: string;
  accent: string;
  gender: 'masculino' | 'feminino';
  age: 'jovem' | 'adulto' | 'idoso';
  tone: 'friendly' | 'professional' | 'energetic' | 'calm';
  premium: boolean;
}

export default function VidnozInterface() {
  const [selectedTab, setSelectedTab] = useState('AI_Talking_Photo');
  const [selectedAvatar, setSelectedAvatar] = useState<VidnozAvatar | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VidnozVoice | null>(null);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarLibrary: VidnozAvatar[] = [
    {
      id: 'professional-woman-1',
      name: 'Ana',
      gender: 'feminino',
      style: 'realista',
      ethnicity: 'brasileira',
      age: 'adulto',
      profession: 'Instrutora de Segurança',
      thumbnail: '/avatares/ana-professional.jpg',
      premium: false,
      new: true,
      popular: true
    },
    {
      id: 'professional-man-1',
      name: 'Carlos',
      gender: 'masculino',
      style: 'realista',
      ethnicity: 'brasileiro',
      age: 'adulto',
      profession: 'Engenheiro de Segurança',
      thumbnail: '/avatares/carlos-professional.jpg',
      premium: false,
      new: false,
      popular: true
    },
    {
      id: 'tech-woman-1',
      name: 'Marina',
      gender: 'feminino',
      style: '3d',
      ethnicity: 'brasileira',
      age: 'jovem',
      profession: 'Técnica em SST',
      thumbnail: '/avatares/marina-tech.jpg',
      premium: true,
      new: true,
      popular: false
    },
    {
      id: 'supervisor-man-1',
      name: 'Roberto',
      gender: 'masculino',
      style: 'realista',
      ethnicity: 'brasileiro',
      age: 'adulto',
      profession: 'Supervisor de Obras',
      thumbnail: '/avatares/roberto-supervisor.jpg',
      premium: false,
      new: false,
      popular: true
    },
    {
      id: 'instructor-woman-1',
      name: 'Fernanda',
      gender: 'feminino',
      style: 'realista',
      ethnicity: 'brasileira',
      age: 'adulto',
      profession: 'Instrutora Corporativa',
      thumbnail: '/avatares/fernanda-instructor.jpg',
      premium: true,
      new: false,
      popular: true
    },
    {
      id: 'engineer-man-1',
      name: 'João',
      gender: 'masculino',
      style: '3d',
      ethnicity: 'brasileiro',
      age: 'jovem',
      profession: 'Engenheiro Jr.',
      thumbnail: '/avatares/joao-engineer.jpg',
      premium: false,
      new: true,
      popular: false
    },
    {
      id: 'safety-woman-1',
      name: 'Patricia',
      gender: 'feminino',
      style: 'realista',
      ethnicity: 'brasileira',
      age: 'adulto',
      profession: 'Especialista em NRs',
      thumbnail: '/avatares/patricia-safety.jpg',
      premium: true,
      new: false,
      popular: true
    },
    {
      id: 'consultant-man-1',
      name: 'Diego',
      gender: 'masculino',
      style: 'realista',
      ethnicity: 'brasileiro',
      age: 'adulto',
      profession: 'Consultor SST',
      thumbnail: '/avatares/diego-consultant.jpg',
      premium: false,
      new: false,
      popular: false
    },
    {
      id: 'trainer-woman-1',
      name: 'Carla',
      gender: 'feminino',
      style: 'cartoon',
      ethnicity: 'brasileira',
      age: 'jovem',
      profession: 'Treinadora',
      thumbnail: '/avatares/carla-trainer.jpg',
      premium: false,
      new: true,
      popular: true
    },
    {
      id: 'manager-man-1',
      name: 'Rafael',
      gender: 'masculino',
      style: '3d',
      ethnicity: 'brasileiro',
      age: 'adulto',
      profession: 'Gerente de Segurança',
      thumbnail: '/avatares/rafael-manager.jpg',
      premium: true,
      new: false,
      popular: true
    },
    {
      id: 'specialist-woman-1',
      name: 'Luciana',
      gender: 'feminino',
      style: 'realista',
      ethnicity: 'brasileira',
      age: 'adulto',
      profession: 'Especialista Técnica',
      thumbnail: '/avatares/luciana-specialist.jpg',
      premium: true,
      new: true,
      popular: true
    }
  ];

  const voiceLibrary: VidnozVoice[] = [
    {
      id: 'br-female-1',
      name: 'Nancy',
      language: 'Português (BR)',
      accent: 'São Paulo',
      gender: 'feminino',
      age: 'adulto',
      tone: 'friendly',
      premium: false
    },
    {
      id: 'br-male-1',
      name: 'Ricardo',
      language: 'Português (BR)',
      accent: 'Rio de Janeiro',
      gender: 'masculino',
      age: 'adulto',
      tone: 'professional',
      premium: false
    },
    {
      id: 'br-female-2',
      name: 'Isabela',
      language: 'Português (BR)',
      accent: 'Minas Gerais',
      gender: 'feminino',
      age: 'jovem',
      tone: 'energetic',
      premium: true
    },
    {
      id: 'br-male-2',
      name: 'Fernando',
      language: 'Português (BR)',
      accent: 'Bahia',
      gender: 'masculino',
      age: 'adulto',
      tone: 'calm',
      premium: false
    },
    {
      id: 'br-female-3',
      name: 'Beatriz',
      language: 'Português (BR)',
      accent: 'Rio Grande do Sul',
      gender: 'feminino',
      age: 'adulto',
      tone: 'professional',
      premium: true
    },
    {
      id: 'br-male-3',
      name: 'Marcos',
      language: 'Português (BR)',
      accent: 'Paraná',
      gender: 'masculino',
      age: 'jovem',
      tone: 'friendly',
      premium: false
    }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Formato não suportado. Use apenas imagens');
        return;
      }
      setUploadedPhoto(file);
      toast.success('Foto carregada com sucesso');
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error('Digite o texto para síntese');
      return;
    }
    
    if (!selectedAvatar && !uploadedPhoto) {
      toast.error('Selecione um avatar ou faça upload de uma foto');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simular processo de geração
      const stages = [
        'Analisando texto...',
        'Preparando avatar...',
        'Sincronizando lábios...',
        'Renderizando vídeo...',
        'Finalizando...'
      ];

      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGenerationProgress((i + 1) * 20);
        toast.loading(stages[i], { duration: 1000 });
      }

      toast.success('Vídeo Talking Photo gerado com sucesso!');
    } catch (error) {
      toast.error('Erro na geração do vídeo');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const getAvatarBadges = (avatar: VidnozAvatar) => {
    const badges = [];
    if (avatar.premium) badges.push(<Badge key="premium" className="bg-yellow-100 text-yellow-800">PRO</Badge>);
    if (avatar.new) badges.push(<Badge key="new" className="bg-green-100 text-green-800">Novo</Badge>);
    if (avatar.popular) badges.push(<Badge key="popular" className="bg-blue-100 text-blue-800">Popular</Badge>);
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header Vidnoz Style */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <Camera className="h-12 w-12 text-purple-600" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Vidnoz AI Talking Photo Free
              </h1>
              <p className="text-gray-600 text-lg">
                Bring Photos to Life
              </p>
            </div>
            <Sparkles className="h-12 w-12 text-pink-600" />
          </div>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Make your realistic talking photo online free with efficiency. Upload or select a photo, input text and create a talking photo AI online free in 100+ languages with Vidnoz AI free talking avatar creator.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Avatar Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-900 rounded-lg mb-4 overflow-hidden relative">
                  {uploadedPhoto ? (
                    <img
                      src={URL.createObjectURL(uploadedPhoto)}
                      alt="Uploaded photo"
                      className="w-full h-full object-cover"
                    />
                  ) : selectedAvatar ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white space-y-4">
                        <User className="h-16 w-16 mx-auto" />
                        <div>
                          <div className="text-lg font-bold">{selectedAvatar.name}</div>
                          <div className="text-sm text-gray-300">{selectedAvatar.profession}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400 space-y-4">
                        <ImageIcon className="h-16 w-16 mx-auto" />
                        <div>Selecione um avatar ou faça upload</div>
                      </div>
                    </div>
                  )}

                  {/* Control Overlays */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-black/20 backdrop-blur text-white border-white/20"
                      onClick={() => {
                        toast.success('Configurações de fundo abertas');
                        // Implementar abertura de modal de background
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      BG
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-black/20 backdrop-blur text-white border-white/20"
                      onClick={() => {
                        toast.success('Legendas ativadas');
                        // Toggle closed captions
                      }}
                    >
                      CC
                      ON
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-black/20 backdrop-blur text-white border-white/20"
                      onClick={() => {
                        toast.success('Editor de movimento aberto');
                        // Abrir editor de motion
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      Motion
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-black/20 backdrop-blur text-white border-white/20 text-red-400"
                      onClick={() => {
                        toast.success('Estilos premium carregados');
                        // Abrir galeria de estilos premium
                      }}
                    >
                      HOT
                      Style
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-black/20 backdrop-blur text-white border-white/20"
                      onClick={() => {
                        toast.success('Editor de crop aberto');
                        // Abrir ferramenta de crop
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Crop
                    </Button>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button 
                      onClick={handleGenerate}
                      size="lg" 
                      className="rounded-full w-20 h-20 bg-white/20 backdrop-blur border-white/20 hover:bg-white/30"
                    >
                      <Play className="h-8 w-8 text-white" />
                    </Button>
                  </div>
                </div>

                {/* Generate Progress */}
                {isGenerating && (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Gerando vídeo...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mb-4"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="h-5 w-5 mr-2 animate-spin" />
                      Generate Video
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>

                {/* Pro Features */}
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Crown className="h-3 w-3 mr-1" />
                      PRO
                    </Badge>
                    <span className="text-sm">Remove watermark</span>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Crown className="h-3 w-3 mr-1" />
                      PRO
                    </Badge>
                    <span className="text-sm">Unlock voice limits</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Controls */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white">
                <TabsTrigger value="AI_Talking_Photo" className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>AI Talking Photo</span>
                </TabsTrigger>
                <TabsTrigger value="Realistic_Avatar" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Realistic Avatar</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="AI_Talking_Photo" className="space-y-6">
                {/* Step 1 - Choose Avatar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Badge className="bg-purple-100 text-purple-800">1</Badge>
                      <span>Choose an avatar</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Upload Section */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Upload className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Upload
                          </Button>
                          <p className="text-sm text-gray-500 mt-1">
                            Formatos suportados: JPG, PNG | Máximo: 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Avatar Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {avatarLibrary.map((avatar) => (
                        <div
                          key={avatar.id}
                          className={`relative cursor-pointer group ${
                            selectedAvatar?.id === avatar.id 
                              ? 'ring-2 ring-purple-500' 
                              : 'hover:ring-2 hover:ring-gray-300'
                          }`}
                          onClick={() => setSelectedAvatar(avatar)}
                        >
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-12 w-12 text-gray-400" />
                            </div>
                          </div>
                          
                          {/* Badges */}
                          <div className="absolute top-1 left-1 space-y-1">
                            {getAvatarBadges(avatar)}
                          </div>

                          {/* Name */}
                          <div className="text-center mt-2">
                            <div className="text-sm font-medium">{avatar.name}</div>
                            <div className="text-xs text-gray-500">{avatar.profession}</div>
                          </div>

                          {/* Selection Indicator */}
                          {selectedAvatar?.id === avatar.id && (
                            <div className="absolute inset-0 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <div className="bg-purple-500 rounded-full p-1">
                                <Eye className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2 - Text Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Badge className="bg-purple-100 text-purple-800">2</Badge>
                      <span>Input text for speech</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-auto"
                        onClick={() => {
                          toast.success('Recurso de clonagem de voz iniciado!')
                          // Simular funcionalidade de clonagem
                          setTimeout(() => {
                            toast.success('Upload de amostra de voz necessário para continuar')
                          }, 1500)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Clone my own voice
                      </Button>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Embrace the AI revolution, drive your creativity with Vidnoz cutting-edge AI tools.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Digite o texto que o avatar deve falar..."
                      className="min-h-32"
                      maxLength={300}
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{inputText.length}/300</span>
                    </div>

                    {/* Language and Voice Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select defaultValue="pt-br">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-br">
                            <div className="flex items-center space-x-2">
                              <span>🇧🇷</span>
                              <span>English (US)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="en-us">
                            <div className="flex items-center space-x-2">
                              <span>🇺🇸</span>
                              <span>English (US)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select 
                        value={selectedVoice?.id} 
                        onValueChange={(value) => {
                          const voice = voiceLibrary.find(v => v.id === value);
                          setSelectedVoice(voice || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar voz" />
                        </SelectTrigger>
                        <SelectContent>
                          {voiceLibrary.map(voice => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div className="flex items-center space-x-2">
                                <span>{voice.gender === 'feminino' ? '♀️' : '♂️'}</span>
                                <span>{voice.name}</span>
                                {voice.premium && <Crown className="h-3 w-3 text-yellow-500" />}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select defaultValue="friendly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">
                            <div className="flex items-center space-x-2">
                              <Heart className="h-3 w-3" />
                              <span>Friendly</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="energetic">Energetic</SelectItem>
                          <SelectItem value="calm">Calm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Voice Preview */}
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (!selectedVoice) {
                            toast.error('Selecione uma voz primeiro')
                            return
                          }
                          toast.success(`Prévia da voz: ${selectedVoice.name}`)
                          // Simular preview de áudio
                          setTimeout(() => {
                            toast.success('Preview de áudio reproduzido com sucesso!')
                          }, 2000)
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      {selectedVoice && (
                        <div className="text-sm">
                          <span className="font-medium">{selectedVoice.name}</span>
                          <span className="text-gray-500 ml-2">
                            {selectedVoice.accent} - {selectedVoice.tone}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="Realistic_Avatar" className="space-y-6">
                {/* Coming Soon */}
                <Card>
                  <CardContent className="text-center py-12">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Avatares Realísticos</h3>
                    <p className="text-gray-600 mb-4">
                      Funcionalidade em desenvolvimento com avatares ultra-realísticos
                    </p>
                    <Badge className="bg-orange-100 text-orange-800">Em Breve</Badge>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

