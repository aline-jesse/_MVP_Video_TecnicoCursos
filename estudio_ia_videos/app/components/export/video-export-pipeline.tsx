
'use client'

/**
 * 🎬 VIDEO EXPORT PIPELINE - Sprint 18
 * Pipeline avançado de exportação com múltiplos formatos
 */

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { toast } from 'react-hot-toast'
import {
  Download,
  Play,
  Pause,
  Settings,
  Video,
  Image as ImageIcon,
  Film,
  FileVideo,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Share2,
  Upload,
  Clock,
  HardDrive,
  Cpu,
  Zap,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  RotateCw
} from 'lucide-react'

interface ExportPreset {
  id: string
  name: string
  description: string
  format: 'mp4' | 'webm' | 'mov' | 'gif' | 'png-sequence'
  resolution: {
    width: number
    height: number
    label: string
  }
  fps: number
  quality: number
  bitrate?: number
  codec: string
  fileSize: string
  platform: 'web' | 'mobile' | 'desktop' | 'social' | 'presentation'
  icon: React.ReactNode
  isPremium: boolean
}

interface ExportJob {
  id: string
  name: string
  preset: ExportPreset
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startTime: Date
  endTime?: Date
  fileUrl?: string
  fileSize?: string
  errorMessage?: string
}

const EXPORT_PRESETS: ExportPreset[] = [
  // Redes Sociais
  {
    id: 'youtube-hd',
    name: 'YouTube HD',
    description: 'Otimizado para YouTube em alta qualidade',
    format: 'mp4',
    resolution: { width: 1920, height: 1080, label: '1080p' },
    fps: 30,
    quality: 85,
    bitrate: 8000,
    codec: 'H.264',
    fileSize: '~45MB/min',
    platform: 'social',
    icon: <Video className="h-4 w-4" />,
    isPremium: false
  },
  {
    id: 'instagram-story',
    name: 'Instagram Stories',
    description: 'Formato vertical para Stories do Instagram',
    format: 'mp4',
    resolution: { width: 1080, height: 1920, label: '1080x1920' },
    fps: 30,
    quality: 80,
    bitrate: 5000,
    codec: 'H.264',
    fileSize: '~25MB/min',
    platform: 'social',
    icon: <Smartphone className="h-4 w-4" />,
    isPremium: false
  },
  {
    id: 'linkedin-video',
    name: 'LinkedIn Video',
    description: 'Otimizado para posts no LinkedIn',
    format: 'mp4',
    resolution: { width: 1280, height: 720, label: '720p' },
    fps: 30,
    quality: 75,
    bitrate: 4000,
    codec: 'H.264',
    fileSize: '~20MB/min',
    platform: 'social',
    icon: <Globe className="h-4 w-4" />,
    isPremium: false
  },
  
  // Apresentações
  {
    id: 'presentation-hd',
    name: 'Apresentação HD',
    description: 'Para projetores e telas grandes',
    format: 'mp4',
    resolution: { width: 1920, height: 1080, label: '1080p' },
    fps: 24,
    quality: 90,
    bitrate: 10000,
    codec: 'H.264',
    fileSize: '~50MB/min',
    platform: 'presentation',
    icon: <Monitor className="h-4 w-4" />,
    isPremium: false
  },
  
  // Mobile
  {
    id: 'mobile-optimized',
    name: 'Mobile Otimizado',
    description: 'Tamanho reduzido para dispositivos móveis',
    format: 'mp4',
    resolution: { width: 720, height: 1280, label: '720x1280' },
    fps: 30,
    quality: 70,
    bitrate: 2500,
    codec: 'H.264',
    fileSize: '~12MB/min',
    platform: 'mobile',
    icon: <Smartphone className="h-4 w-4" />,
    isPremium: false
  },
  
  // Web
  {
    id: 'web-streaming',
    name: 'Web Streaming',
    description: 'Otimizado para streaming na web',
    format: 'webm',
    resolution: { width: 1280, height: 720, label: '720p' },
    fps: 30,
    quality: 75,
    bitrate: 3500,
    codec: 'VP9',
    fileSize: '~18MB/min',
    platform: 'web',
    icon: <Globe className="h-4 w-4" />,
    isPremium: false
  },
  
  // Premium
  {
    id: '4k-ultra',
    name: '4K Ultra HD',
    description: 'Máxima qualidade para produção profissional',
    format: 'mov',
    resolution: { width: 3840, height: 2160, label: '4K' },
    fps: 30,
    quality: 95,
    bitrate: 20000,
    codec: 'ProRes',
    fileSize: '~200MB/min',
    platform: 'desktop',
    icon: <Film className="h-4 w-4" />,
    isPremium: true
  },
  {
    id: 'png-sequence',
    name: 'Sequência PNG',
    description: 'Imagens PNG para edição externa',
    format: 'png-sequence',
    resolution: { width: 1920, height: 1080, label: '1080p' },
    fps: 30,
    quality: 100,
    codec: 'PNG',
    fileSize: '~500MB/min',
    platform: 'desktop',
    icon: <ImageIcon className="h-4 w-4" />,
    isPremium: true
  }
]

interface VideoExportPipelineProps {
  projectName: string
  duration: number
  onExportComplete?: (job: ExportJob) => void
}

export default function VideoExportPipeline({ 
  projectName = "Projeto Sem Nome",
  duration = 30,
  onExportComplete 
}: VideoExportPipelineProps) {
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>(EXPORT_PRESETS[0])
  const [customSettings, setCustomSettings] = useState({
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    quality: 80,
    bitrate: 5000
  })
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [currentTab, setCurrentTab] = useState('presets')
  const [isExporting, setIsExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startExport = async (preset: ExportPreset) => {
    const newJob: ExportJob = {
      id: `job-${Date.now()}`,
      name: `${projectName} - ${preset.name}`,
      preset,
      status: 'queued',
      progress: 0,
      startTime: new Date()
    }

    setExportJobs(prev => [newJob, ...prev])
    setIsExporting(true)

    // Simular processo de exportação
    try {
      // Update to processing
      updateJobStatus(newJob.id, 'processing')

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += Math.random() * 10 + 5) {
        await new Promise(resolve => setTimeout(resolve, 200))
        updateJobProgress(newJob.id, Math.min(100, progress))
      }

      // Complete export
      const completedJob: Partial<ExportJob> = {
        status: 'completed',
        progress: 100,
        endTime: new Date(),
        fileUrl: `/exports/${newJob.id}.${preset.format}`,
        fileSize: calculateFileSize(preset, duration)
      }

      updateJob(newJob.id, completedJob)
      onExportComplete?.(exportJobs.find(j => j.id === newJob.id) as ExportJob)
      toast.success(`Export concluído: ${preset.name}`)
      
    } catch (error) {
      updateJob(newJob.id, {
        status: 'failed',
        progress: 0,
        endTime: new Date(),
        errorMessage: 'Erro durante a exportação'
      })
      toast.error('Falha na exportação')
    } finally {
      setIsExporting(false)
    }
  }

  const updateJobStatus = (jobId: string, status: ExportJob['status']) => {
    setExportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status } : job
    ))
  }

  const updateJobProgress = (jobId: string, progress: number) => {
    setExportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, progress } : job
    ))
  }

  const updateJob = (jobId: string, updates: Partial<ExportJob>) => {
    setExportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ))
  }

  const cancelExport = (jobId: string) => {
    updateJobStatus(jobId, 'cancelled')
    toast('Exportação cancelada')
  }

  const downloadFile = (job: ExportJob) => {
    if (job.fileUrl) {
      // Simular download
      const link = document.createElement('a')
      link.href = job.fileUrl
      link.download = `${job.name}.${job.preset.format}`
      link.click()
      toast.success('Download iniciado')
    }
  }

  const calculateFileSize = (preset: ExportPreset, durationInSeconds: number): string => {
    const durationInMinutes = durationInSeconds / 60
    const sizePerMinute = preset.fileSize.match(/\d+/)?.[0] || '25'
    const totalSize = Math.round(parseInt(sizePerMinute) * durationInMinutes)
    return `${totalSize}MB`
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'processing': return <RotateCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'cancelled': return <X className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Exportar Vídeo</h2>
            <p className="text-muted-foreground">
              {projectName} • Duração: {formatDuration(duration)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            <Button
              onClick={() => startExport(selectedPreset)}
              disabled={isExporting}
              className="min-w-32"
            >
              {isExporting ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Export Panel */}
        <div className="flex-1 p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="custom">Personalizado</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPORT_PRESETS.map((preset) => (
                  <Card
                    key={preset.id}
                    className={`cursor-pointer transition-all ${
                      selectedPreset.id === preset.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPreset(preset)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {preset.icon}
                          <CardTitle className="text-base">{preset.name}</CardTitle>
                        </div>
                        {preset.isPremium && (
                          <Badge className="bg-yellow-500">Premium</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {preset.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Resolução:</span>
                          <span className="font-medium">{preset.resolution.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>FPS:</span>
                          <span className="font-medium">{preset.fps}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Formato:</span>
                          <span className="font-medium uppercase">{preset.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tamanho estimado:</span>
                          <span className="font-medium">
                            {calculateFileSize(preset, duration)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Personalizadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Largura</label>
                      <Input
                        type="number"
                        value={customSettings.resolution.width}
                        onChange={(e) => setCustomSettings(prev => ({
                          ...prev,
                          resolution: { ...prev.resolution, width: parseInt(e.target.value) }
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Altura</label>
                      <Input
                        type="number"
                        value={customSettings.resolution.height}
                        onChange={(e) => setCustomSettings(prev => ({
                          ...prev,
                          resolution: { ...prev.resolution, height: parseInt(e.target.value) }
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Taxa de Quadros (FPS)</label>
                    <div className="mt-2">
                      <Slider
                        value={[customSettings.fps]}
                        onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, fps: value }))}
                        min={24}
                        max={60}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>24 FPS</span>
                        <span>{customSettings.fps} FPS</span>
                        <span>60 FPS</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Qualidade (%)</label>
                    <div className="mt-2">
                      <Slider
                        value={[customSettings.quality]}
                        onValueChange={([value]) => setCustomSettings(prev => ({ ...prev, quality: value }))}
                        min={10}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Baixa</span>
                        <span>{customSettings.quality}%</span>
                        <span>Máxima</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bitrate (kbps)</label>
                    <Input
                      type="number"
                      value={customSettings.bitrate}
                      onChange={(e) => setCustomSettings(prev => ({ ...prev, bitrate: parseInt(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Avançadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Codec de Vídeo</label>
                    <select className="mt-1 w-full p-2 border rounded">
                      <option value="h264">H.264 (Compatibilidade)</option>
                      <option value="h265">H.265 (Menor tamanho)</option>
                      <option value="vp9">VP9 (Web otimizado)</option>
                      <option value="prores">ProRes (Qualidade máxima)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Perfil de Cores</label>
                    <select className="mt-1 w-full p-2 border rounded">
                      <option value="srgb">sRGB (Padrão)</option>
                      <option value="rec709">Rec.709 (HDTV)</option>
                      <option value="rec2020">Rec.2020 (4K HDR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Áudio</label>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <select className="p-2 border rounded">
                        <option value="aac">AAC</option>
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                      </select>
                      <select className="p-2 border rounded">
                        <option value="128">128 kbps</option>
                        <option value="192">192 kbps</option>
                        <option value="320">320 kbps</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Hardware Acceleration</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Two-Pass Encoding</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Export Queue Sidebar */}
        <div className="w-96 border-l bg-gray-50">
          <div className="p-4 border-b bg-white">
            <h3 className="font-medium">Fila de Exportação</h3>
            <p className="text-sm text-muted-foreground">
              {exportJobs.filter(j => j.status === 'processing').length} processando
            </p>
          </div>

          <div className="p-4 space-y-4 max-h-full overflow-y-auto">
            {exportJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileVideo className="mx-auto h-12 w-12 mb-2" />
                <p>Nenhuma exportação na fila</p>
              </div>
            ) : (
              exportJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">{job.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {job.preset.resolution.label} • {job.preset.format.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(job.status)}
                          {job.status === 'processing' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelExport(job.id)}
                              className="w-6 h-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {job.status === 'processing' && (
                        <div>
                          <Progress value={job.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(job.progress)}%
                          </p>
                        </div>
                      )}

                      {job.status === 'completed' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Tamanho:</span>
                            <span>{job.fileSize}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Tempo:</span>
                            <span>
                              {job.endTime && job.startTime 
                                ? `${Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s`
                                : '-'
                              }
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => downloadFile(job)}
                            className="w-full"
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}

                      {job.status === 'failed' && (
                        <div>
                          <p className="text-xs text-red-600">{job.errorMessage}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startExport(job.preset)}
                            className="w-full mt-2"
                          >
                            <RotateCw className="h-3 w-3 mr-2" />
                            Tentar Novamente
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-screen overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview do Vídeo</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full"
                style={{ aspectRatio: '16/9' }}
              />
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
              <span className="text-sm text-muted-foreground">
                00:00 / {formatDuration(duration)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
