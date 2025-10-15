
/**
 * 🎙️ Estúdio IA de Vídeos - Sprint 11
 * Voice Cloning Personalizado
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Mic,
  Upload,
  Play,
  Pause,
  Download,
  Activity,
  User,
  Zap,
  Settings,
  Volume2,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  FileAudio,
  Headphones
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  accent: string;
  gender: string;
  sampleCount: number;
  quality: number;
  status: 'training' | 'ready' | 'processing';
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

interface CloningSample {
  id: string;
  name: string;
  duration: number;
  quality: 'excellent' | 'good' | 'poor';
  text: string;
  audioUrl: string;
  uploadedAt: Date;
}

export default function VoiceCloningPage() {
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [cloningSamples, setCloningSamples] = useState<CloningSample[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [testText, setTestText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadVoiceProfiles();
    loadCloningSamples();
  }, []);

  const loadVoiceProfiles = () => {
    setVoiceProfiles([
      {
        id: 'profile-1',
        name: 'Voz Empresarial',
        language: 'pt-BR',
        accent: 'São Paulo',
        gender: 'Masculino',
        sampleCount: 15,
        quality: 92,
        status: 'ready',
        createdAt: new Date('2024-08-15'),
        lastUsed: new Date(Date.now() - 3600000),
        useCount: 247
      },
      {
        id: 'profile-2',
        name: 'Voz Técnica',
        language: 'pt-BR',
        accent: 'Rio de Janeiro',
        gender: 'Feminino',
        sampleCount: 12,
        quality: 88,
        status: 'ready',
        createdAt: new Date('2024-08-20'),
        lastUsed: new Date(Date.now() - 7200000),
        useCount: 156
      },
      {
        id: 'profile-3',
        name: 'Voz Treinamento',
        language: 'pt-BR',
        accent: 'Minas Gerais',
        gender: 'Masculino',
        sampleCount: 8,
        quality: 75,
        status: 'training',
        createdAt: new Date(),
        useCount: 0
      }
    ]);
  };

  const loadCloningSamples = () => {
    setCloningSamples([
      {
        id: 'sample-1',
        name: 'Amostra Segurança',
        duration: 45,
        quality: 'excellent',
        text: 'A segurança do trabalho é fundamental para proteger a vida dos colaboradores...',
        audioUrl: '/audio/sample-1.mp3',
        uploadedAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'sample-2',
        name: 'Amostra Procedimentos',
        duration: 38,
        quality: 'good',
        text: 'Antes de iniciar qualquer atividade, verifique se todos os EPIs estão adequados...',
        audioUrl: '/audio/sample-2.mp3',
        uploadedAt: new Date(Date.now() - 7200000)
      },
      {
        id: 'sample-3',
        name: 'Amostra Emergência',
        duration: 52,
        quality: 'excellent',
        text: 'Em caso de emergência, mantenha a calma e siga os procedimentos estabelecidos...',
        audioUrl: '/audio/sample-3.mp3',
        uploadedAt: new Date(Date.now() - 10800000)
      }
    ]);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    const timer = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);

    toast.success('Gravação iniciada!');
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast.success('Gravação finalizada!');
    
    // Simular adição de nova amostra
    const newSample: CloningSample = {
      id: `sample-${Date.now()}`,
      name: `Amostra ${cloningSamples.length + 1}`,
      duration: recordingTime,
      quality: recordingTime > 30 ? 'excellent' : recordingTime > 15 ? 'good' : 'poor',
      text: 'Texto da gravação...',
      audioUrl: '/audio/new-sample.mp3',
      uploadedAt: new Date()
    };
    
    setCloningSamples(prev => [...prev, newSample]);
  };

  const trainVoiceProfile = () => {
    if (cloningSamples.length < 5) {
      toast.error('São necessárias pelo menos 5 amostras para treinar um perfil de voz');
      return;
    }

    setTrainingProgress(0);
    toast.success('Iniciando treinamento do perfil de voz...');

    const timer = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          toast.success('Perfil de voz treinado com sucesso!');
          
          // Adicionar novo perfil
          const newProfile: VoiceProfile = {
            id: `profile-${Date.now()}`,
            name: 'Minha Voz Personalizada',
            language: 'pt-BR',
            accent: 'Personalizado',
            gender: 'Personalizado',
            sampleCount: cloningSamples.length,
            quality: 95,
            status: 'ready',
            createdAt: new Date(),
            useCount: 0
          };
          
          setVoiceProfiles(prev => [...prev, newProfile]);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const testVoice = () => {
    if (!testText.trim()) {
      toast.error('Digite um texto para testar a voz');
      return;
    }

    setIsPlaying(true);
    toast.success('Gerando áudio com sua voz clonada...');

    setTimeout(() => {
      setIsPlaying(false);
      toast.success('Teste de voz concluído!');
    }, 3000);
  };

  const deleteProfile = (profileId: string) => {
    setVoiceProfiles(prev => prev.filter(p => p.id !== profileId));
    toast.success('Perfil de voz removido!');
  };

  const deleteSample = (sampleId: string) => {
    setCloningSamples(prev => prev.filter(s => s.id !== sampleId));
    toast.success('Amostra removida!');
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 90) return 'text-green-600';
    if (quality >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ready: 'bg-green-100 text-green-800',
      training: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getSampleQualityColor = (quality: string) => {
    const colors = {
      excellent: 'text-green-600',
      good: 'text-yellow-600',
      poor: 'text-red-600'
    };
    return colors[quality as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Mic className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Voice Cloning Personalizado
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Clone sua voz com IA avançada para criar narrações personalizadas e autênticas
          </p>
        </div>

        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profiles">Perfis de Voz</TabsTrigger>
            <TabsTrigger value="recording">Gravação</TabsTrigger>
            <TabsTrigger value="training">Treinamento</TabsTrigger>
            <TabsTrigger value="testing">Teste de Voz</TabsTrigger>
          </TabsList>

          {/* Perfis de Voz Tab */}
          <TabsContent value="profiles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voiceProfiles.map((profile) => (
                <Card key={profile.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{profile.name}</CardTitle>
                          <p className="text-sm text-gray-600">{profile.accent} • {profile.gender}</p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(profile.status)}>
                        {profile.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Qualidade:</span>
                        <span className={`font-semibold ${getQualityColor(profile.quality)}`}>
                          {profile.quality}%
                        </span>
                      </div>
                      <Progress value={profile.quality} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Amostras:</span>
                        <p className="font-semibold">{profile.sampleCount}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Usos:</span>
                        <p className="font-semibold">{profile.useCount}</p>
                      </div>
                    </div>

                    {profile.lastUsed && (
                      <p className="text-xs text-gray-500">
                        Último uso: {profile.lastUsed.toLocaleString()}
                      </p>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => setSelectedProfile(profile.id)}
                        variant={selectedProfile === profile.id ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        {selectedProfile === profile.id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                      <Button 
                        onClick={() => deleteProfile(profile.id)}
                        variant="outline" 
                        size="sm"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gravação Tab */}
          <TabsContent value="recording" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recording Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mic className="h-5 w-5 mr-2" />
                    Gravação de Amostras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center ${
                      isRecording ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <Mic className={`h-16 w-16 ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>

                    {isRecording && (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-red-600">
                          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </div>
                        <Progress value={(recordingTime / 60) * 100} className="h-2" />
                      </div>
                    )}

                    <div className="flex justify-center space-x-4">
                      {!isRecording ? (
                        <Button onClick={startRecording} size="lg" className="flex items-center space-x-2">
                          <Mic className="h-5 w-5" />
                          <span>Iniciar Gravação</span>
                        </Button>
                      ) : (
                        <Button onClick={stopRecording} variant="destructive" size="lg">
                          <Pause className="h-5 w-5 mr-2" />
                          Parar Gravação
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Dicas para Gravação:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Grave em ambiente silencioso</li>
                      <li>• Mantenha distância consistente do microfone</li>
                      <li>• Leia com entonação natural</li>
                      <li>• Grave pelo menos 10 amostras de 30-60s</li>
                      <li>• Use textos variados (técnico, conversacional)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Samples */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload de Amostras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Arraste arquivos de áudio ou clique para fazer upload
                    </p>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Arquivos
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos suportados: MP3, WAV, M4A (máx. 10MB cada)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Amostras Carregadas ({cloningSamples.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cloningSamples.map((sample) => (
                        <div key={sample.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{sample.name}</p>
                              <p className="text-xs text-gray-600">
                                {sample.duration}s • {sample.quality}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button 
                              onClick={() => deleteSample(sample.id)}
                              variant="outline" 
                              size="sm"
                            >
                              <AlertCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Treinamento Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Treinamento de Voz IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Status do Treinamento</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Amostras disponíveis:</span>
                        <Badge variant="outline">{cloningSamples.length}/10 recomendadas</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Qualidade média:</span>
                        <span className="font-semibold text-green-600">
                          {Math.round(cloningSamples.reduce((acc, s) => 
                            acc + (s.quality === 'excellent' ? 95 : s.quality === 'good' ? 80 : 60), 0
                          ) / cloningSamples.length || 0)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Duração total:</span>
                        <span className="font-semibold">
                          {cloningSamples.reduce((acc, s) => acc + s.duration, 0)}s
                        </span>
                      </div>
                    </div>

                    {trainingProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Progresso:</span>
                          <span className="font-semibold">{trainingProgress}%</span>
                        </div>
                        <Progress value={trainingProgress} className="h-3" />
                      </div>
                    )}

                    <Button 
                      onClick={trainVoiceProfile}
                      disabled={cloningSamples.length < 5 || trainingProgress > 0}
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {trainingProgress > 0 ? 'Treinando...' : 'Iniciar Treinamento'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Configurações Avançadas</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Modelo de IA:</label>
                        <Select defaultValue="xtts-v2">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="xtts-v2">XTTS v2 (Recomendado)</SelectItem>
                            <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                            <SelectItem value="coqui">Coqui TTS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Qualidade de Síntese:</label>
                        <Select defaultValue="high">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ultra">Ultra (Mais lento)</SelectItem>
                            <SelectItem value="high">Alta (Recomendado)</SelectItem>
                            <SelectItem value="medium">Média (Mais rápido)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Épocas de Treinamento:</label>
                        <Select defaultValue="100">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50 (Rápido)</SelectItem>
                            <SelectItem value="100">100 (Recomendado)</SelectItem>
                            <SelectItem value="200">200 (Máxima qualidade)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teste Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Headphones className="h-5 w-5 mr-2" />
                  Teste de Voz Clonada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Selecionar Perfil de Voz:</label>
                    <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um perfil de voz" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceProfiles.filter(p => p.status === 'ready').map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name} ({profile.quality}% qualidade)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Texto para Teste:</label>
                    <textarea
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      placeholder="Digite o texto que deseja ouvir com sua voz clonada..."
                      className="w-full h-32 p-3 border rounded-lg resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {testText.length}/500 caracteres
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={testVoice}
                      disabled={!selectedProfile || !testText.trim() || isPlaying}
                      className="flex-1"
                    >
                      {isPlaying ? (
                        <>
                          <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                          Reproduzindo...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Testar Voz
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Amostras de Exemplo */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Textos de Exemplo para Teste:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'A segurança do trabalho é uma responsabilidade compartilhada entre empresa e colaborador.',
                      'Antes de iniciar qualquer atividade, verifique se todos os equipamentos estão em perfeito estado.',
                      'Em caso de emergência, mantenha a calma e acione imediatamente os procedimentos de segurança.',
                      'O uso correto dos EPIs é obrigatório e pode salvar sua vida em situações de risco.'
                    ].map((text, index) => (
                      <Card key={index} className="cursor-pointer hover:bg-gray-50" onClick={() => setTestText(text)}>
                        <CardContent className="p-3">
                          <p className="text-sm">{text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Voice Cloning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {voiceProfiles.length}
                </div>
                <p className="text-sm text-gray-600">Perfis Criados</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cloningSamples.length}
                </div>
                <p className="text-sm text-gray-600">Amostras Gravadas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {voiceProfiles.reduce((sum, p) => sum + p.useCount, 0)}
                </div>
                <p className="text-sm text-gray-600">Usos Totais</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(voiceProfiles.reduce((sum, p) => sum + p.quality, 0) / voiceProfiles.length || 0)}%
                </div>
                <p className="text-sm text-gray-600">Qualidade Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
