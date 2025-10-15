
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio as Waveform,
  Sparkles,
  Zap,
  Target,
  Mic,
  Music,
  Settings,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Headphones,
  Radio,
  Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos para sincronização de áudio
interface AudioTrack {
  id: string;
  name: string;
  type: 'speech' | 'music' | 'effect' | 'ambient';
  duration: number;
  volume: number;
  muted: boolean;
  solo: boolean;
  syncStatus: 'perfect' | 'good' | 'warning' | 'error';
  waveform: number[];
  transcription?: string;
  markers: AudioMarker[];
  color: string;
}

interface AudioMarker {
  id: string;
  time: number;
  type: 'word' | 'sentence' | 'paragraph' | 'scene';
  content: string;
  confidence: number;
}

interface SyncAnalysis {
  overallScore: number;
  speechClarity: number;
  backgroundMusic: number;
  effectsTiming: number;
  lipSyncAccuracy: number;
  suggestions: string[];
}

export default function AudioSyncAI() {
  // Estados principais
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(120);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Tracks de áudio
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([
    {
      id: 'speech1',
      name: 'Narração Principal (PT-BR)',
      type: 'speech',
      duration: 115,
      volume: 85,
      muted: false,
      solo: false,
      syncStatus: 'good',
      color: '#3b82f6',
      transcription: 'A segurança no trabalho com máquinas é fundamental para prevenir acidentes. Neste treinamento, vamos abordar os principais aspectos da NR-12.',
      waveform: Array.from({length: 230}, (_, i) => Math.sin(i * 0.1) * 30 + 40 + Math.random() * 20),
      markers: [
        {
          id: 'm1',
          time: 0,
          type: 'paragraph',
          content: 'Introdução à segurança',
          confidence: 0.95
        },
        {
          id: 'm2',
          time: 15,
          type: 'sentence',
          content: 'Máquinas e equipamentos',
          confidence: 0.92
        },
        {
          id: 'm3',
          time: 45,
          type: 'sentence',
          content: 'Procedimentos de segurança',
          confidence: 0.88
        },
        {
          id: 'm4',
          time: 80,
          type: 'paragraph',
          content: 'Conclusão e próximos passos',
          confidence: 0.91
        }
      ]
    },
    {
      id: 'music1',
      name: 'Música de Fundo Corporativa',
      type: 'music',
      duration: 120,
      volume: 25,
      muted: false,
      solo: false,
      syncStatus: 'perfect',
      color: '#10b981',
      waveform: Array.from({length: 240}, (_, i) => Math.sin(i * 0.05) * 15 + 20 + Math.random() * 10),
      markers: [
        {
          id: 'm5',
          time: 0,
          type: 'scene',
          content: 'Intro musical',
          confidence: 0.98
        },
        {
          id: 'm6',
          time: 30,
          type: 'scene',
          content: 'Seção principal',
          confidence: 0.96
        },
        {
          id: 'm7',
          time: 90,
          type: 'scene',
          content: 'Fade out',
          confidence: 0.94
        }
      ]
    },
    {
      id: 'effects1',
      name: 'Efeitos Sonoros',
      type: 'effect',
      duration: 80,
      volume: 60,
      muted: false,
      solo: false,
      syncStatus: 'warning',
      color: '#f59e0b',
      waveform: Array.from({length: 160}, (_, i) => (Math.random() - 0.5) * 50 + Math.sin(i * 0.3) * 20),
      markers: [
        {
          id: 'm8',
          time: 12,
          type: 'word',
          content: 'Click de transição',
          confidence: 0.85
        },
        {
          id: 'm9',
          time: 35,
          type: 'word',
          content: 'Som de máquina',
          confidence: 0.79
        },
        {
          id: 'm10',
          time: 67,
          type: 'word',
          content: 'Alerta de segurança',
          confidence: 0.83
        }
      ]
    }
  ]);

  // Análise de sincronização IA
  const [syncAnalysis, setSyncAnalysis] = useState<SyncAnalysis>({
    overallScore: 8.7,
    speechClarity: 9.2,
    backgroundMusic: 8.5,
    effectsTiming: 7.8,
    lipSyncAccuracy: 8.9,
    suggestions: [
      'Ajustar volume da música de fundo entre 45s-60s',
      'Sincronizar efeito sonoro aos 35s com movimento na tela',
      'Melhorar clareza da fala entre 67s-72s',
      'Adicionar pausa de 0.5s após palavra-chave aos 28s'
    ]
  });

  // Estados IA
  const [aiFeatures, setAiFeatures] = useState({
    autoLipSync: true,
    speechEnhancement: true,
    backgroundOptimization: true,
    smartMarkers: true,
    realTimeAnalysis: true
  });

  // Convert time to pixel position
  const timeToX = (time: number) => {
    return (time / totalDuration) * 600;
  };

  // Generate waveform visualization
  const generateWaveform = (data: number[], color: string) => {
    return data.map((amplitude, index) => {
      const x = (index / data.length) * 600;
      const height = Math.abs(amplitude);
      return (
        <rect
          key={index}
          x={x}
          y={30 - height / 2}
          width={600 / data.length}
          height={height}
          fill={color}
          opacity={0.7}
        />
      );
    });
  };

  // Auto-sync simulation
  const handleAutoSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    const steps = [
      'Analisando áudio...',
      'Detectando fala...',
      'Identificando marcadores...',
      'Otimizando sincronização...',
      'Aplicando ajustes...',
      'Finalizando...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSyncProgress((i + 1) / steps.length * 100);
    }
    
    // Simulate improvements
    setSyncAnalysis(prev => ({
      ...prev,
      overallScore: Math.min(prev.overallScore + 0.8, 10),
      speechClarity: Math.min(prev.speechClarity + 0.5, 10),
      effectsTiming: Math.min(prev.effectsTiming + 1.2, 10),
      lipSyncAccuracy: Math.min(prev.lipSyncAccuracy + 0.3, 10)
    }));
    
    setIsSyncing(false);
  };

  // Playback control
  const handlePlay = () => setIsPlaying(!isPlaying);

  // Auto-play simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, totalDuration]);

  // Toggle track mute
  const toggleMute = (trackId: string) => {
    setAudioTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  // Update track volume
  const updateVolume = (trackId: string, volume: number) => {
    setAudioTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'perfect': return CheckCircle;
      case 'good': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Sincronização de Áudio IA
            </h1>
            <p className="text-gray-400">
              Sincronização automática inteligente com análise em tempo real
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Sparkles className="mr-1 h-3 w-3" />
              Score: {syncAnalysis.overallScore.toFixed(1)}/10
            </Badge>
            <Button 
              onClick={handleAutoSync} 
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Auto-Sync IA
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sync Progress */}
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Sincronização em Progresso</span>
                <span className="text-sm font-mono">{syncProgress.toFixed(0)}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          </motion.div>
        )}

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Score Geral</p>
                  <p className="text-lg font-bold text-green-400">{syncAnalysis.overallScore.toFixed(1)}/10</p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Clareza Fala</p>
                  <p className="text-lg font-bold text-blue-400">{syncAnalysis.speechClarity.toFixed(1)}/10</p>
                </div>
                <Mic className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Música Fundo</p>
                  <p className="text-lg font-bold text-purple-400">{syncAnalysis.backgroundMusic.toFixed(1)}/10</p>
                </div>
                <Music className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Timing Efeitos</p>
                  <p className="text-lg font-bold text-yellow-400">{syncAnalysis.effectsTiming.toFixed(1)}/10</p>
                </div>
                <Waves className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Lip-Sync</p>
                  <p className="text-lg font-bold text-pink-400">{syncAnalysis.lipSyncAccuracy.toFixed(1)}/10</p>
                </div>
                <Radio className="h-8 w-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-300px)]">
        {/* Main Audio Timeline */}
        <div className="col-span-8">
          <Card className="bg-gray-900 border-gray-800 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Timeline de Áudio Multi-Track</CardTitle>
                
                {/* Playback Controls */}
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlay}
                    className={isPlaying ? 'text-red-400' : 'text-green-400'}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <div className="text-sm font-mono px-3 py-1 bg-gray-800 rounded">
                    {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Headphones className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-[450px]">
                {audioTracks.map((track, index) => {
                  const StatusIcon = getStatusIcon(track.syncStatus);
                  
                  return (
                    <div key={track.id} className="mb-6 border border-gray-800 rounded-lg overflow-hidden">
                      {/* Track Header */}
                      <div className="bg-gray-800 p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: track.color }}
                          />
                          <div>
                            <h4 className="font-medium text-sm">{track.name}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${track.type === 'speech' ? 'text-blue-400' : track.type === 'music' ? 'text-green-400' : 'text-yellow-400'}`}
                              >
                                {track.type.toUpperCase()}
                              </Badge>
                              <StatusIcon className={`h-3 w-3 ${getStatusColor(track.syncStatus)}`} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Volume Control */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMute(track.id)}
                              className={track.muted ? 'text-red-400' : 'text-gray-400'}
                            >
                              {track.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <Slider
                              value={[track.volume]}
                              onValueChange={([value]) => updateVolume(track.id, value)}
                              max={100}
                              step={1}
                              className="w-16"
                            />
                            <span className="text-xs text-gray-400 w-8">
                              {track.volume}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Waveform Visualization */}
                      <div className="relative bg-gray-950 p-4" style={{ height: '100px' }}>
                        <svg className="w-full h-full">
                          {/* Timeline grid */}
                          {Array.from({ length: 11 }, (_, i) => (
                            <line
                              key={i}
                              x1={i * 60}
                              y1={0}
                              x2={i * 60}
                              y2={60}
                              stroke="#374151"
                              strokeWidth="1"
                              opacity="0.3"
                            />
                          ))}
                          
                          {/* Waveform */}
                          {generateWaveform(track.waveform, track.color)}
                          
                          {/* Audio Markers */}
                          {track.markers.map(marker => (
                            <g key={marker.id}>
                              <line
                                x1={timeToX(marker.time)}
                                y1={0}
                                x2={timeToX(marker.time)}
                                y2={60}
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                opacity="0.8"
                              />
                              <circle
                                cx={timeToX(marker.time)}
                                cy={10}
                                r={3}
                                fill="#8b5cf6"
                              />
                              <text
                                x={timeToX(marker.time)}
                                y={8}
                                textAnchor="middle"
                                fontSize="8"
                                fill="white"
                                className="font-mono"
                              >
                                {marker.content.substring(0, 8)}...
                              </text>
                            </g>
                          ))}

                          {/* Playhead */}
                          <line
                            x1={timeToX(currentTime)}
                            y1={0}
                            x2={timeToX(currentTime)}
                            y2={60}
                            stroke="#ef4444"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>

                      {/* Transcription (for speech tracks) */}
                      {track.type === 'speech' && track.transcription && (
                        <div className="bg-gray-800 p-3 border-t border-gray-700">
                          <p className="text-xs text-gray-300">
                            <span className="text-gray-400">Transcrição: </span>
                            {track.transcription}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Controls & Analysis */}
        <div className="col-span-4 space-y-4">
          <Tabs defaultValue="analysis">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analysis">Análise</TabsTrigger>
              <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis">
              <div className="space-y-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Sugestões IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {syncAnalysis.suggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-xs bg-gray-800 p-2 rounded flex items-start space-x-2"
                          >
                            <Sparkles className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{suggestion}</span>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Status de Sincronização</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {audioTracks.map(track => {
                      const StatusIcon = getStatusIcon(track.syncStatus);
                      return (
                        <div key={track.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: track.color }}
                            />
                            <span className="text-xs text-gray-300">
                              {track.name.substring(0, 15)}...
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <StatusIcon className={`h-3 w-3 ${getStatusColor(track.syncStatus)}`} />
                            <span className={`text-xs ${getStatusColor(track.syncStatus)}`}>
                              {track.syncStatus}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tools">
              <div className="space-y-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Ferramentas IA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Mic className="mr-2 h-3 w-3" />
                      Melhorar Fala
                    </Button>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <Music className="mr-2 h-3 w-3" />
                      Otimizar Música
                    </Button>
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                      <Waves className="mr-2 h-3 w-3" />
                      Balancear Efeitos
                    </Button>
                    <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700">
                      <Radio className="mr-2 h-3 w-3" />
                      Sync Automático
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Configurações IA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(aiFeatures).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAiFeatures(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                          className={`h-6 w-12 p-0 ${value ? 'bg-blue-600' : 'bg-gray-700'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-2' : '-translate-x-2'}`} />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Export & Import</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      <Upload className="mr-2 h-3 w-3" />
                      Importar Áudio
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="mr-2 h-3 w-3" />
                      Exportar Mix
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
