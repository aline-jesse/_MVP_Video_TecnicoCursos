
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play,
  Square, 
  Download,
  Settings,
  Zap,
  Eye,
  Clock,
  HardDrive,
  Cpu,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  FileVideo,
  Film,
  Clapperboard,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Share2,
  Cloud
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RenderJob {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startTime: Date
  estimatedTime?: number
  outputFormat: string
  quality: string
  resolution: string
  fileSize?: number
}

interface RenderSettings {
  format: 'mp4' | 'webm' | 'mov' | 'avi'
  quality: 'low' | 'medium' | 'high' | 'ultra'
  resolution: '720p' | '1080p' | '4K' | '8K'
  framerate: 24 | 30 | 60
  bitrate: number
  codec: 'h264' | 'h265' | 'vp9' | 'av1'
  audio: {
    codec: 'aac' | 'mp3' | 'flac'
    bitrate: 128 | 192 | 320
    sampleRate: 44100 | 48000
  }
}

interface SystemMetrics {
  cpu: number
  memory: number
  gpu: number
  disk: number
  network: number
  temperature: number
}

export default function AdvancedRenderPipeline() {
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([
    {
      id: 'job-1',
      name: 'Treinamento NR-12 - Segurança com Máquinas',
      status: 'processing',
      progress: 67,
      startTime: new Date(Date.now() - 5 * 60 * 1000),
      estimatedTime: 8,
      outputFormat: 'MP4',
      quality: 'High',
      resolution: '1080p'
    },
    {
      id: 'job-2', 
      name: 'Tutorial Avatar 3D - Narração Corporativa',
      status: 'completed',
      progress: 100,
      startTime: new Date(Date.now() - 20 * 60 * 1000),
      outputFormat: 'MP4',
      quality: 'Ultra',
      resolution: '4K',
      fileSize: 2.4
    },
    {
      id: 'job-3',
      name: 'Demo PPTX - Apresentação Executiva',
      status: 'pending',
      progress: 0,
      startTime: new Date(),
      outputFormat: 'WEBM',
      quality: 'Medium',
      resolution: '720p'
    }
  ])

  const [renderSettings, setRenderSettings] = useState<RenderSettings>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    framerate: 30,
    bitrate: 8000,
    codec: 'h264',
    audio: {
      codec: 'aac',
      bitrate: 192,
      sampleRate: 48000
    }
  })

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    gpu: 78,
    disk: 34,
    network: 23,
    temperature: 67
  })

  const [selectedPreset, setSelectedPreset] = useState<string>('youtube')

  // System monitoring - Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        gpu: Math.max(0, Math.min(100, prev.gpu + (Math.random() - 0.5) * 15)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 3)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 20)),
        temperature: Math.max(40, Math.min(85, prev.temperature + (Math.random() - 0.5) * 2))
      }))

      setRenderJobs(prev => prev.map(job => {
        if (job.status === 'processing' && job.progress < 100) {
          return {
            ...job,
            progress: Math.min(100, job.progress + Math.random() * 3)
          }
        }
        return job
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Preset configurations
  const presets = {
    youtube: {
      name: 'YouTube HD',
      format: 'mp4' as const,
      quality: 'high' as const,
      resolution: '1080p' as const,
      framerate: 30,
      bitrate: 8000,
      codec: 'h264' as const
    },
    social: {
      name: 'Social Media',
      format: 'mp4' as const,
      quality: 'medium' as const,
      resolution: '720p' as const,
      framerate: 30,
      bitrate: 4000,
      codec: 'h264' as const
    },
    presentation: {
      name: 'Apresentação',
      format: 'mp4' as const,
      quality: 'ultra' as const,
      resolution: '4K' as const,
      framerate: 24,
      bitrate: 20000,
      codec: 'h265' as const
    },
    mobile: {
      name: 'Mobile',
      format: 'mp4' as const,
      quality: 'medium' as const,
      resolution: '720p' as const,
      framerate: 30,
      bitrate: 2000,
      codec: 'h264' as const
    }
  }

  const applyPreset = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets]
    if (preset) {
      setRenderSettings(prev => ({
        ...prev,
        format: preset.format,
        quality: preset.quality,
        resolution: preset.resolution,
        framerate: preset.framerate as 24 | 30 | 60,
        bitrate: preset.bitrate,
        codec: preset.codec
      }))
      setSelectedPreset(presetKey)
    }
  }

  const startRender = useCallback(async (jobId?: string) => {
    const newJob: RenderJob = {
      id: jobId || `job-${Date.now()}`,
      name: `Novo Render - ${format(new Date(), 'HH:mm')}`,
      status: 'processing',
      progress: 0,
      startTime: new Date(),
      estimatedTime: 12,
      outputFormat: renderSettings.format.toUpperCase(),
      quality: renderSettings.quality,
      resolution: renderSettings.resolution
    }

    if (jobId) {
      setRenderJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'processing', progress: 0, startTime: new Date() } : job
      ))
    } else {
      setRenderJobs(prev => [newJob, ...prev])
    }

    // Simulate render progress
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 3
      if (progress >= 100) {
        clearInterval(progressInterval)
        setRenderJobs(prev => prev.map(job => 
          job.id === (jobId || newJob.id) ? { 
            ...job, 
            status: 'completed', 
            progress: 100,
            fileSize: Math.random() * 3 + 1 
          } : job
        ))
      } else {
        setRenderJobs(prev => prev.map(job => 
          job.id === (jobId || newJob.id) ? { ...job, progress } : job
        ))
      }
    }, 1000)
  }, [renderSettings])

  const cancelRender = useCallback((jobId: string) => {
    setRenderJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'cancelled' } : job
    ))
  }, [])

  const getStatusIcon = (status: RenderJob['status']) => {
    switch (status) {
      case 'processing': return <Loader className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: RenderJob['status']) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatFileSize = (sizeInGB: number) => {
    if (sizeInGB < 1) {
      return `${Math.round(sizeInGB * 1024)} MB`
    }
    return `${sizeInGB.toFixed(1)} GB`
  }

  const SystemMetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    unit = '%' 
  }: {
    title: string
    value: number
    icon: any
    color: string
    unit?: string
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", color)} />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <span className="text-sm font-bold">
            {Math.round(value)}{unit}
          </span>
        </div>
        <Progress value={value} className="mt-2 h-2" />
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline de Renderização</h1>
            <p className="text-gray-600 mt-2">
              Sistema avançado de renderização com monitoramento em tempo real
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="w-3 h-3 mr-1" />
              Sistema Ativo
            </Badge>
            
            <Button onClick={() => startRender()} className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" />
              Iniciar Render
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs">Jobs de Render</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="outputs">Saídas</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="grid gap-6">
            {renderJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(job.status)}
                        <h3 className="font-semibold">{job.name}</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="block font-medium text-gray-900">Formato</span>
                          {job.outputFormat}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-900">Qualidade</span>
                          {job.quality}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-900">Resolução</span>
                          {job.resolution}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-900">Início</span>
                          {format(job.startTime, 'HH:mm:ss', { locale: ptBR })}
                        </div>
                        {job.fileSize && (
                          <div>
                            <span className="block font-medium text-gray-900">Tamanho</span>
                            {formatFileSize(job.fileSize)}
                          </div>
                        )}
                      </div>

                      {job.status === 'processing' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{Math.round(job.progress)}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                          {job.estimatedTime && (
                            <p className="text-xs text-gray-500">
                              Tempo estimado: {Math.round(job.estimatedTime * (1 - job.progress / 100))} min restantes
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {job.status === 'processing' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelRender(job.id)}
                        >
                          <Square className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                      
                      {job.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => startRender(job.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      
                      {job.status === 'completed' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Presets de Renderização</CardTitle>
                <CardDescription>
                  Configurações otimizadas para diferentes plataformas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(presets).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant={selectedPreset === key ? "default" : "outline"}
                      onClick={() => applyPreset(key)}
                      className="justify-start"
                    >
                      {key === 'youtube' && <Globe className="w-4 h-4 mr-2" />}
                      {key === 'social' && <Share2 className="w-4 h-4 mr-2" />}
                      {key === 'presentation' && <Monitor className="w-4 h-4 mr-2" />}
                      {key === 'mobile' && <Smartphone className="w-4 h-4 mr-2" />}
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Video Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Vídeo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="format">Formato</Label>
                    <Select 
                      value={renderSettings.format} 
                      onValueChange={(value: 'mp4' | 'webm' | 'mov' | 'avi') => 
                        setRenderSettings(prev => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                        <SelectItem value="mov">MOV</SelectItem>
                        <SelectItem value="avi">AVI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quality">Qualidade</Label>
                    <Select 
                      value={renderSettings.quality} 
                      onValueChange={(value: 'low' | 'medium' | 'high' | 'ultra') => 
                        setRenderSettings(prev => ({ ...prev, quality: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="ultra">Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="resolution">Resolução</Label>
                    <Select 
                      value={renderSettings.resolution} 
                      onValueChange={(value: '720p' | '1080p' | '4K' | '8K') => 
                        setRenderSettings(prev => ({ ...prev, resolution: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="4K">4K UHD</SelectItem>
                        <SelectItem value="8K">8K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="framerate">Frame Rate</Label>
                    <Select 
                      value={renderSettings.framerate.toString()} 
                      onValueChange={(value) => 
                        setRenderSettings(prev => ({ ...prev, framerate: parseInt(value) as 24 | 30 | 60 }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 fps</SelectItem>
                        <SelectItem value="30">30 fps</SelectItem>
                        <SelectItem value="60">60 fps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bitrate">Bitrate: {renderSettings.bitrate} kbps</Label>
                  <Slider
                    id="bitrate"
                    min={1000}
                    max={50000}
                    step={1000}
                    value={[renderSettings.bitrate]}
                    onValueChange={([bitrate]) => 
                      setRenderSettings(prev => ({ ...prev, bitrate }))
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="codec">Codec de Vídeo</Label>
                  <Select 
                    value={renderSettings.codec} 
                    onValueChange={(value: 'h264' | 'h265' | 'vp9' | 'av1') => 
                      setRenderSettings(prev => ({ ...prev, codec: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h264">H.264 (Compatível)</SelectItem>
                      <SelectItem value="h265">H.265 (Eficiente)</SelectItem>
                      <SelectItem value="vp9">VP9 (Web)</SelectItem>
                      <SelectItem value="av1">AV1 (Moderno)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Áudio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="audio-codec">Codec de Áudio</Label>
                  <Select 
                    value={renderSettings.audio.codec} 
                    onValueChange={(value: 'aac' | 'mp3' | 'flac') => 
                      setRenderSettings(prev => ({ 
                        ...prev, 
                        audio: { ...prev.audio, codec: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aac">AAC</SelectItem>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="flac">FLAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="audio-bitrate">Bitrate de Áudio</Label>
                  <Select 
                    value={renderSettings.audio.bitrate.toString()} 
                    onValueChange={(value) => 
                      setRenderSettings(prev => ({ 
                        ...prev, 
                        audio: { ...prev.audio, bitrate: parseInt(value) as 128 | 192 | 320 }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">128 kbps</SelectItem>
                      <SelectItem value="192">192 kbps</SelectItem>
                      <SelectItem value="320">320 kbps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sample-rate">Taxa de Amostragem</Label>
                  <Select 
                    value={renderSettings.audio.sampleRate.toString()} 
                    onValueChange={(value) => 
                      setRenderSettings(prev => ({ 
                        ...prev, 
                        audio: { ...prev.audio, sampleRate: parseInt(value) as 44100 | 48000 }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SystemMetricCard
              title="CPU"
              value={systemMetrics.cpu}
              icon={Cpu}
              color="text-blue-500"
            />
            <SystemMetricCard
              title="Memória"
              value={systemMetrics.memory}
              icon={Activity}
              color="text-green-500"
            />
            <SystemMetricCard
              title="GPU"
              value={systemMetrics.gpu}
              icon={Zap}
              color="text-purple-500"
            />
            <SystemMetricCard
              title="Disco"
              value={systemMetrics.disk}
              icon={HardDrive}
              color="text-orange-500"
            />
            <SystemMetricCard
              title="Rede"
              value={systemMetrics.network}
              icon={Globe}
              color="text-cyan-500"
            />
            <SystemMetricCard
              title="Temp"
              value={systemMetrics.temperature}
              icon={AlertTriangle}
              color={systemMetrics.temperature > 75 ? "text-red-500" : "text-yellow-500"}
              unit="°C"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Render Engine</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>FFmpeg</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      v6.1.1
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>CUDA</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Disponível
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>OpenCL</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">99.8%</p>
                    <p className="text-sm text-gray-600">Uptime do Sistema</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Renders Completados Hoje</span>
                    <Badge variant="outline">47</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo Médio de Render</span>
                    <Badge variant="outline">8.3 min</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Sucesso</span>
                    <Badge variant="outline">98.7%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Queue Atual</span>
                    <Badge variant="outline">3 jobs</Badge>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">156 GB</p>
                    <p className="text-sm text-gray-600">Vídeos Processados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outputs Tab */}
        <TabsContent value="outputs" className="space-y-6">
          <div className="grid gap-4">
            {renderJobs
              .filter(job => job.status === 'completed')
              .map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-green-100">
                          <FileVideo className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{job.name}</h4>
                          <p className="text-sm text-gray-600">
                            {job.outputFormat} • {job.resolution} • {job.fileSize && formatFileSize(job.fileSize)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Cloud className="w-4 h-4 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
