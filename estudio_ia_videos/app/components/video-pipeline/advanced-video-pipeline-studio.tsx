
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Video, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload,
  Settings,
  Zap,
  FileVideo,
  Monitor,
  Smartphone,
  Film,
  Clock,
  Cpu,
  HardDrive,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

// Formatos de exportação suportados
const exportFormats = [
  {
    id: 'mp4-hd',
    name: 'MP4 HD (1080p)',
    extension: 'mp4',
    quality: 'Alta',
    size: '~45MB/min',
    compatibility: '99.9%',
    recommended: true,
    icon: '🎬'
  },
  {
    id: 'mp4-4k',
    name: 'MP4 4K (2160p)',
    extension: 'mp4',
    quality: 'Ultra',
    size: '~180MB/min',
    compatibility: '95%',
    recommended: false,
    icon: '👑'
  },
  {
    id: 'webm-hd',
    name: 'WebM HD',
    extension: 'webm',
    quality: 'Alta',
    size: '~30MB/min',
    compatibility: '85%',
    recommended: false,
    icon: '🌐'
  },
  {
    id: 'gif-720',
    name: 'GIF Animado',
    extension: 'gif',
    quality: 'Média',
    size: '~15MB/min',
    compatibility: '100%',
    recommended: false,
    icon: '🎭'
  }
];

// Presets de qualidade
const qualityPresets = [
  {
    id: 'web',
    name: 'Web/Mobile',
    resolution: '720p',
    bitrate: '2 Mbps',
    fps: 30,
    description: 'Otimizado para visualização online'
  },
  {
    id: 'hd',
    name: 'HD Profissional',
    resolution: '1080p',
    bitrate: '5 Mbps',
    fps: 30,
    description: 'Qualidade profissional para apresentações'
  },
  {
    id: '4k',
    name: '4K Ultra',
    resolution: '2160p',
    bitrate: '15 Mbps',
    fps: 60,
    description: 'Máxima qualidade para projeções'
  },
  {
    id: 'custom',
    name: 'Personalizado',
    resolution: 'Custom',
    bitrate: 'Custom',
    fps: 'Custom',
    description: 'Configuração manual de parâmetros'
  }
];

interface RenderJob {
  id: string;
  name: string;
  format: string;
  quality: string;
  progress: number;
  status: 'queue' | 'processing' | 'completed' | 'error';
  startTime: string;
  estimatedTime?: number;
  fileSize?: string;
}

const AdvancedVideoPipelineStudio: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('mp4-hd');
  const [selectedPreset, setSelectedPreset] = useState<string>('hd');
  const [isProcessing, setIsProcessing] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  
  // Configurações avançadas
  const [resolution, setResolution] = useState([1080]);
  const [bitrate, setBitrate] = useState([5000]);
  const [fps, setFps] = useState([30]);
  const [audioQuality, setAudioQuality] = useState([320]);
  
  // Fila de renderização
  const [renderQueue, setRenderQueue] = useState<RenderJob[]>([
    {
      id: '1',
      name: 'Treinamento NR-12 - Prensas Hidráulicas',
      format: 'MP4 HD',
      quality: '1080p',
      progress: 100,
      status: 'completed',
      startTime: '10:30',
      fileSize: '287MB'
    },
    {
      id: '2',
      name: 'NR-35 - Trabalho em Altura - Módulo 1',
      format: 'MP4 HD',
      quality: '1080p',
      progress: 67,
      status: 'processing',
      startTime: '10:45',
      estimatedTime: 45
    },
    {
      id: '3',
      name: 'NR-33 - Espaços Confinados - Básico',
      format: 'WebM HD',
      quality: '720p',
      progress: 0,
      status: 'queue',
      startTime: '11:00'
    }
  ]);

  // Preview em tempo real
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Simular renderização
  const startRendering = async () => {
    setIsProcessing(true);
    setRenderProgress(0);
    
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 300);
  };

  const togglePreview = () => {
    if (videoRef.current) {
      if (isPreviewPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const selectedFormatData = exportFormats.find(f => f.id === selectedFormat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎬 Advanced Video Pipeline
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pipeline profissional de renderização de vídeo com FFmpeg. 
            Multi-formato, qualidade 4K e sistema de filas inteligente.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
              FFmpeg Powered
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
              4K Support
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
              Real-time Preview
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Painel Principal */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="export" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="export">Exportar</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="queue">Fila</TabsTrigger>
                <TabsTrigger value="settings">Config</TabsTrigger>
              </TabsList>

              {/* Tab Exportação */}
              <TabsContent value="export" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileVideo className="h-5 w-5 mr-2" />
                      Formatos de Exportação
                    </CardTitle>
                    <CardDescription>
                      Selecione o formato e qualidade de exportação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {exportFormats.map((format) => (
                        <div
                          key={format.id}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${
                            selectedFormat === format.id
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedFormat(format.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg flex items-center">
                                <span className="mr-2">{format.icon}</span>
                                {format.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {format.extension.toUpperCase()} • {format.quality}
                              </p>
                            </div>
                            {format.recommended && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                Recomendado
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Tamanho:</span>
                              <span className="font-medium">{format.size}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Compatibilidade:</span>
                              <span className="font-medium">{format.compatibility}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Presets de Qualidade */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Presets de Qualidade</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {qualityPresets.map((preset) => (
                          <div
                            key={preset.id}
                            className={`p-3 border rounded-lg cursor-pointer text-center ${
                              selectedPreset === preset.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPreset(preset.id)}
                          >
                            <h4 className="font-medium text-sm">{preset.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {preset.resolution}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress da Renderização */}
                    {renderProgress > 0 && renderProgress < 100 && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center mb-4">
                            <h3 className="font-semibold">Renderizando Vídeo</h3>
                            <p className="text-sm text-gray-600">Processando com FFmpeg...</p>
                          </div>
                          <Progress value={renderProgress} className="h-3" />
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>{Math.round(renderProgress)}% concluído</span>
                            <span>~{Math.round((100 - renderProgress) / 2)} min restantes</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Resultado da Renderização */}
                    {renderProgress === 100 && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center mb-4">
                            <h3 className="font-semibold text-green-600">✅ Vídeo Renderizado!</h3>
                            <p className="text-sm text-gray-600">Arquivo pronto para download</p>
                          </div>
                          <div className="flex justify-center space-x-4">
                            <Button>
                              <Download className="h-4 w-4 mr-2" />
                              Download ({selectedFormatData?.extension.toUpperCase()})
                            </Button>
                            <Button variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={startRendering}
                      disabled={isProcessing}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Renderizando...' : 'Iniciar Renderização'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Preview */}
              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Monitor className="h-5 w-5 mr-2" />
                      Preview em Tempo Real
                    </CardTitle>
                    <CardDescription>
                      Visualize o vídeo durante a edição
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Player de Preview */}
                    <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        src="/api/placeholder-video.mp4"
                        onEnded={() => setIsPreviewPlaying(false)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          size="lg"
                          className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70"
                          onClick={togglePreview}
                        >
                          {isPreviewPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Controles de Preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={togglePreview}>
                          {isPreviewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline">
                          <Square className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600">00:00 / 02:45</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Smartphone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Monitor className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Film className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Informações do Preview */}
                    <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Resolução</p>
                        <p className="font-semibold">1920×1080</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">FPS</p>
                        <p className="font-semibold">30</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Duração</p>
                        <p className="font-semibold">2:45</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Fila de Renderização */}
              <TabsContent value="queue" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Fila de Renderização
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {renderQueue.length} jobs
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Sistema de filas inteligente para renderização em lote
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {renderQueue.map((job) => (
                        <div key={job.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{job.name}</h4>
                              <p className="text-sm text-gray-600">
                                {job.format} • {job.quality} • Iniciado às {job.startTime}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(job.status)}
                              <Badge variant="outline">
                                {job.status === 'completed' ? 'Concluído' :
                                 job.status === 'processing' ? 'Processando' :
                                 job.status === 'error' ? 'Erro' : 'Na fila'}
                              </Badge>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mb-3">
                            <Progress value={job.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{job.progress}% concluído</span>
                              {job.estimatedTime && job.status === 'processing' && (
                                <span>~{job.estimatedTime}min restantes</span>
                              )}
                              {job.fileSize && job.status === 'completed' && (
                                <span>{job.fileSize}</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            {job.status === 'completed' && (
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            )}
                            {job.status === 'processing' && (
                              <Button size="sm" variant="outline">
                                <Pause className="h-3 w-3 mr-1" />
                                Pausar
                              </Button>
                            )}
                            {job.status === 'queue' && (
                              <>
                                <Button size="sm" variant="outline">
                                  <Play className="h-3 w-3 mr-1" />
                                  Iniciar
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Editar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar à Fila
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Configurações */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configurações de Vídeo */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Configurações de Vídeo</CardTitle>
                      <CardDescription>
                        Ajustes avançados de renderização
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Resolução - Altura ({resolution[0]}p)
                        </Label>
                        <Slider
                          value={resolution}
                          onValueChange={setResolution}
                          min={480}
                          max={2160}
                          step={120}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Bitrate ({bitrate[0]} kbps)
                        </Label>
                        <Slider
                          value={bitrate}
                          onValueChange={setBitrate}
                          min={1000}
                          max={20000}
                          step={500}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          FPS ({fps[0]})
                        </Label>
                        <Slider
                          value={fps}
                          onValueChange={setFps}
                          min={24}
                          max={60}
                          step={6}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Codec de Vídeo
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar codec" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="h264">H.264 (Recomendado)</SelectItem>
                            <SelectItem value="h265">H.265/HEVC</SelectItem>
                            <SelectItem value="vp8">VP8</SelectItem>
                            <SelectItem value="vp9">VP9</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Configurações de Áudio */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Configurações de Áudio</CardTitle>
                      <CardDescription>
                        Qualidade e formato do áudio
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Qualidade de Áudio ({audioQuality[0]} kbps)
                        </Label>
                        <Slider
                          value={audioQuality}
                          onValueChange={setAudioQuality}
                          min={64}
                          max={512}
                          step={32}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Codec de Áudio
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar codec" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aac">AAC (Recomendado)</SelectItem>
                            <SelectItem value="mp3">MP3</SelectItem>
                            <SelectItem value="opus">Opus</SelectItem>
                            <SelectItem value="vorbis">Vorbis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Canais de Áudio
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar canais" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mono">Mono</SelectItem>
                            <SelectItem value="stereo">Estéreo</SelectItem>
                            <SelectItem value="surround">5.1 Surround</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Taxa de Amostragem
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar taxa" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="44100">44.1 kHz</SelectItem>
                            <SelectItem value="48000">48 kHz (Recomendado)</SelectItem>
                            <SelectItem value="96000">96 kHz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurar Padrões
                  </Button>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-6">
            {/* Estatísticas do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Cpu className="h-5 w-5 mr-2" />
                  Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CPU Uso</span>
                    <span className="font-semibold">34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">RAM Uso</span>
                    <span className="font-semibold">8.2 / 16 GB</span>
                  </div>
                  <Progress value={51} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">GPU Uso</span>
                    <span className="font-semibold">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas de Renderização */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vídeos Renderizados</span>
                    <span className="font-semibold">892</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tempo Total</span>
                    <span className="font-semibold">127h 34m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dados Processados</span>
                    <span className="font-semibold">2.8 TB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Velocidade Média</span>
                    <span className="font-semibold">2.3x realtime</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  Armazenamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usado</span>
                    <span className="font-semibold">847 GB / 2 TB</span>
                  </div>
                  <Progress value={42} className="h-2" />
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Vídeos Finais</span>
                      <span>623 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assets/Recursos</span>
                      <span>187 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache/Temp</span>
                      <span>37 GB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Zap className="h-4 w-4 mr-2" />
                Renderização Rápida
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload FFmpeg Config
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export All Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedVideoPipelineStudio;
