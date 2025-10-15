'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Settings, 
  Volume2, 
  Mic, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface TTSEngine {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  latency: number;
  quota: {
    used: number;
    limit: number;
  };
  voices: Voice[];
}

interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  style?: string;
  preview?: string;
}

interface TTSJob {
  id: string;
  text: string;
  engine: string;
  voice: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  audioUrl?: string;
  duration?: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

interface TTSStats {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  avgProcessingTime: number;
  totalAudioGenerated: number; // em segundos
}

export default function TTSDashboard() {
  // Estados
  const [engines, setEngines] = useState<TTSEngine[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [jobs, setJobs] = useState<TTSJob[]>([]);
  const [stats, setStats] = useState<TTSStats>({
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    avgProcessingTime: 0,
    totalAudioGenerated: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingJobId, setPlayingJobId] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadEngines();
    loadJobs();
    loadStats();
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(() => {
      loadJobs();
      loadStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Carregar engines disponíveis
  const loadEngines = async () => {
    try {
      const response = await fetch('/api/tts/generate');
      const data = await response.json();
      
      // Simular dados dos engines
      const mockEngines: TTSEngine[] = [
        {
          id: 'elevenlabs',
          name: 'ElevenLabs',
          status: 'online',
          latency: 1200,
          quota: { used: 45000, limit: 100000 },
          voices: [
            { id: 'rachel', name: 'Rachel', language: 'en-US', gender: 'female', style: 'conversational' },
            { id: 'josh', name: 'Josh', language: 'en-US', gender: 'male', style: 'professional' }
          ]
        },
        {
          id: 'azure',
          name: 'Azure Cognitive Services',
          status: 'online',
          latency: 800,
          quota: { used: 12000, limit: 50000 },
          voices: [
            { id: 'pt-BR-FranciscaNeural', name: 'Francisca', language: 'pt-BR', gender: 'female' },
            { id: 'pt-BR-AntonioNeural', name: 'Antonio', language: 'pt-BR', gender: 'male' }
          ]
        },
        {
          id: 'google',
          name: 'Google Cloud TTS',
          status: 'online',
          latency: 950,
          quota: { used: 8500, limit: 30000 },
          voices: [
            { id: 'pt-BR-Wavenet-A', name: 'Wavenet A', language: 'pt-BR', gender: 'female' },
            { id: 'pt-BR-Wavenet-B', name: 'Wavenet B', language: 'pt-BR', gender: 'male' }
          ]
        }
      ];
      
      setEngines(mockEngines);
      if (mockEngines.length > 0 && !selectedEngine) {
        setSelectedEngine(mockEngines[0].id);
      }
    } catch (error) {
      toast.error('Erro ao carregar engines de TTS');
    }
  };

  // Carregar jobs
  const loadJobs = async () => {
    try {
      // Simular carregamento de jobs
      const mockJobs: TTSJob[] = [
        {
          id: '1',
          text: 'Olá, bem-vindos ao nosso curso de inteligência artificial.',
          engine: 'elevenlabs',
          voice: 'rachel',
          status: 'completed',
          progress: 100,
          audioUrl: '/audio/sample1.mp3',
          duration: 5.2,
          createdAt: new Date(Date.now() - 300000),
          completedAt: new Date(Date.now() - 295000)
        },
        {
          id: '2',
          text: 'Nesta aula, vamos aprender sobre redes neurais e deep learning.',
          engine: 'azure',
          voice: 'pt-BR-FranciscaNeural',
          status: 'processing',
          progress: 65,
          createdAt: new Date(Date.now() - 60000)
        }
      ];
      
      setJobs(mockJobs);
    } catch (error) {
      toast.error('Erro ao carregar jobs');
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      // Simular estatísticas
      setStats({
        totalJobs: 156,
        successfulJobs: 148,
        failedJobs: 8,
        avgProcessingTime: 4.2,
        totalAudioGenerated: 1847.5
      });
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
    }
  };

  // Gerar áudio
  const generateAudio = async () => {
    if (!text.trim() || !selectedEngine || !selectedVoice) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          engine: selectedEngine,
          voice: selectedVoice,
          options: {
            speed: 1.0,
            pitch: 1.0,
            volume: 1.0
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na geração de áudio');
      }

      const result = await response.json();
      
      // Adicionar job à lista
      const newJob: TTSJob = {
        id: result.jobId || Date.now().toString(),
        text,
        engine: selectedEngine,
        voice: selectedVoice,
        status: 'processing',
        progress: 0,
        createdAt: new Date()
      };
      
      setJobs(prev => [newJob, ...prev]);
      setText('');
      
      toast.success('Geração de áudio iniciada!');
      
      // Simular progresso
      simulateProgress(newJob.id);
      
    } catch (error) {
      toast.error('Erro ao gerar áudio');
    } finally {
      setIsGenerating(false);
    }
  };

  // Simular progresso do job
  const simulateProgress = (jobId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Atualizar job como completo
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { 
                ...job, 
                status: 'completed', 
                progress: 100,
                audioUrl: '/audio/generated.mp3',
                duration: Math.random() * 10 + 2,
                completedAt: new Date()
              }
            : job
        ));
        
        toast.success('Áudio gerado com sucesso!');
      } else {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, progress } : job
        ));
      }
    }, 500);
  };

  // Reproduzir áudio
  const playAudio = (job: TTSJob) => {
    if (!job.audioUrl) return;

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingJobId(null);
    }

    const audio = new Audio(job.audioUrl);
    audio.onended = () => {
      setCurrentAudio(null);
      setPlayingJobId(null);
    };
    
    audio.play();
    setCurrentAudio(audio);
    setPlayingJobId(job.id);
  };

  // Pausar áudio
  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingJobId(null);
    }
  };

  // Download do áudio
  const downloadAudio = (job: TTSJob) => {
    if (!job.audioUrl) return;
    
    const link = document.createElement('a');
    link.href = job.audioUrl;
    link.download = `tts_${job.id}.mp3`;
    link.click();
  };

  // Obter vozes do engine selecionado
  const getAvailableVoices = (): Voice[] => {
    const engine = engines.find(e => e.id === selectedEngine);
    return engine?.voices || [];
  };

  // Obter status do engine
  const getEngineStatus = (status: TTSEngine['status']) => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Online</Badge>;
      case 'offline':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Offline</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
    }
  };

  // Obter status do job
  const getJobStatus = (status: TTSJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'processing':
        return <Badge variant="default"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processando</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Concluído</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">TTS Dashboard</h1>
          <p className="text-muted-foreground">
            Geração de áudio com múltiplos engines de Text-to-Speech
          </p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Jobs</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalJobs > 0 ? ((stats.successfulJobs / stats.totalJobs) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProcessingTime.toFixed(1)}s</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áudio Gerado</CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.totalAudioGenerated / 60)}m {Math.floor(stats.totalAudioGenerated % 60)}s
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Gerar Áudio</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="engines">Engines</TabsTrigger>
        </TabsList>

        {/* Tab: Gerar Áudio */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Novo Áudio</CardTitle>
              <CardDescription>
                Insira o texto e configure as opções para gerar áudio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engine">Engine TTS</Label>
                  <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um engine" />
                    </SelectTrigger>
                    <SelectContent>
                      {engines.map((engine) => (
                        <SelectItem key={engine.id} value={engine.id}>
                          {engine.name} - {engine.latency}ms
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="voice">Voz</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma voz" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVoices().map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name} ({voice.language}) - {voice.gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="text">Texto</Label>
                <Textarea
                  id="text"
                  placeholder="Digite o texto que será convertido em áudio..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                />
                <div className="text-sm text-muted-foreground">
                  {text.length} caracteres
                </div>
              </div>
              
              <Button 
                onClick={generateAudio} 
                disabled={isGenerating || !text.trim() || !selectedEngine || !selectedVoice}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Gerar Áudio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Jobs */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Jobs</CardTitle>
              <CardDescription>
                Acompanhe o status dos seus jobs de geração de áudio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum job encontrado
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium truncate">{job.text}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{job.engine}</span>
                            <span>•</span>
                            <span>{job.voice}</span>
                            <span>•</span>
                            <span>{job.createdAt.toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getJobStatus(job.status)}
                        </div>
                      </div>
                      
                      {job.status === 'processing' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{Math.round(job.progress)}%</span>
                          </div>
                          <Progress value={job.progress} />
                        </div>
                      )}
                      
                      {job.status === 'completed' && job.audioUrl && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => playingJobId === job.id ? pauseAudio() : playAudio(job)}
                          >
                            {playingJobId === job.id ? (
                              <><Pause className="w-4 h-4 mr-1" /> Pausar</>
                            ) : (
                              <><Play className="w-4 h-4 mr-1" /> Reproduzir</>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAudio(job)}
                          >
                            <Download className="w-4 h-4 mr-1" /> Download
                          </Button>
                          {job.duration && (
                            <span className="text-sm text-muted-foreground">
                              {job.duration.toFixed(1)}s
                            </span>
                          )}
                        </div>
                      )}
                      
                      {job.status === 'failed' && job.error && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{job.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Engines */}
        <TabsContent value="engines">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {engines.map((engine) => (
              <Card key={engine.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{engine.name}</CardTitle>
                    {getEngineStatus(engine.status)}
                  </div>
                  <CardDescription>
                    Latência: {engine.latency}ms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quota Utilizada</span>
                      <span>{((engine.quota.used / engine.quota.limit) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(engine.quota.used / engine.quota.limit) * 100} />
                    <div className="text-xs text-muted-foreground mt-1">
                      {engine.quota.used.toLocaleString()} / {engine.quota.limit.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Vozes Disponíveis</h4>
                    <div className="space-y-1">
                      {engine.voices.slice(0, 3).map((voice) => (
                        <div key={voice.id} className="text-sm flex justify-between">
                          <span>{voice.name}</span>
                          <span className="text-muted-foreground">{voice.language}</span>
                        </div>
                      ))}
                      {engine.voices.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{engine.voices.length - 3} mais vozes
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
