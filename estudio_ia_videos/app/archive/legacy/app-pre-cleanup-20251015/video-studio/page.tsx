
'use client'

import React, { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, Play, Download, Settings, User, Volume2,
  CheckCircle, AlertCircle, Loader2, Video, Clock,
  FileText, Mic, UserCircle, Film
} from 'lucide-react'

interface Project {
  id: string
  name: string
  slideCount: number
  slides: Array<{
    id: string
    title: string
    content: string
    order: number
  }>
}

interface Job {
  id: string
  status: string
  project_id: string
  estimated_duration: number
}

interface VideoResult {
  url: string
  duration: number
  resolution: string
  format: string
  file_size: number
}

export default function VideoStudioPage() {
  const { data: session } = useSession()
  
  // State management
  const [currentStep, setCurrentStep] = useState<'upload' | 'configure' | 'render' | 'complete'>('upload')
  const [project, setProject] = useState<Project | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-female-1')
  const [selectedVoice, setSelectedVoice] = useState('br-female-1')
  const [job, setJob] = useState<Job | null>(null)
  const [renderProgress, setRenderProgress] = useState(0)
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [rendering, setRendering] = useState(false)

  // Step 1: Handle PPTX Upload
  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/v1/pptx/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      const data = await response.json()
      setProject(data.project)
      setCurrentStep('configure')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  // Step 2: Start video generation
  const startVideoGeneration = useCallback(async () => {
    if (!project) return

    setRendering(true)
    setError(null)

    try {
      // Create render job
      const response = await fetch('/api/v1/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          avatar_id: selectedAvatar,
          voice_id: selectedVoice
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      const jobData = await response.json()
      setJob(jobData.job)
      setCurrentStep('render')
      
      // Start polling job status
      pollJobStatus(jobData.job.id)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start render')
      setRendering(false)
    }
  }, [project, selectedAvatar, selectedVoice])

  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/v1/jobs/status/${jobId}`)
        if (response.ok) {
          const status = await response.json()
          
          if (status.progress) {
            setRenderProgress(status.progress.percentage || 0)
          }

          if (status.status === 'completed' && status.result) {
            setVideoResult(status.result)
            setCurrentStep('complete')
            setRendering(false)
            return // Stop polling
          }

          if (status.status === 'failed') {
            setError(status.error || 'Render failed')
            setRendering(false)
            return // Stop polling
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }

      // Continue polling if job is still active
      setTimeout(poll, 2000)
    }

    poll()
  }, [])

  // File drop handler
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const pptxFile = files.find(f => f.name.toLowerCase().endsWith('.pptx'))
    
    if (pptxFile) {
      handleFileUpload(pptxFile)
    } else {
      setError('Selecione um arquivo .PPTX')
    }
  }, [handleFileUpload])

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Login Necessário</CardTitle>
            <CardDescription>
              Faça login para acessar o Video Studio
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Video Studio MVP
        </h1>
        <p className="text-muted-foreground">
          Pipeline completo: PPTX → TTS → Avatar → Vídeo MP4
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { key: 'upload', label: 'Upload PPTX', icon: Upload },
              { key: 'configure', label: 'Configurar', icon: Settings },
              { key: 'render', label: 'Renderizar', icon: Video },
              { key: 'complete', label: 'Concluído', icon: CheckCircle }
            ].map((step, index) => {
              const isActive = currentStep === step.key
              const isCompleted = ['upload', 'configure', 'render', 'complete'].indexOf(currentStep) > index
              const Icon = step.icon
              
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-2 text-center">{step.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Upload */}
      {currentStep === 'upload' && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Importar Apresentação
            </CardTitle>
            <CardDescription>
              Faça upload de sua apresentação PowerPoint (.pptx)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                  <p>Processando apresentação...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg">Arraste seu arquivo .pptx aqui</p>
                    <p className="text-sm text-gray-600">ou clique para selecionar</p>
                  </div>
                  <input
                    type="file"
                    accept=".pptx"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button onClick={() => document.getElementById('file-upload')?.click()}>
                    Selecionar Arquivo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure */}
      {currentStep === 'configure' && project && (
        <div className="space-y-6">
          {/* Project Info */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Projeto Importado</CardTitle>
              <CardDescription>{project.slideCount} slides extraídos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.slides.map((slide) => (
                  <div key={slide.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <Badge variant="outline">{slide.order}</Badge>
                    <div>
                      <h4 className="font-medium">{slide.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{slide.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração do Vídeo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Avatar Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Apresentador Avatar</label>
                  <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avatar-female-1">
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4" />
                          Ana Silva (Feminino)
                        </div>
                      </SelectItem>
                      <SelectItem value="avatar-male-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Carlos Santos (Masculino)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voz da Narração</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="br-female-1">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          Ana (Brasileira)
                        </div>
                      </SelectItem>
                      <SelectItem value="br-male-1">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Carlos (Brasileiro)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={startVideoGeneration}
                disabled={rendering}
                className="w-full"
                size="lg"
              >
                {rendering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Vídeo...
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 mr-2" />
                    Gerar Vídeo com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Render Progress */}
      {currentStep === 'render' && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Renderizando Vídeo
            </CardTitle>
            <CardDescription>
              Pipeline IA: TTS → Avatar → Composição → MP4
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-sm text-gray-600">{renderProgress}%</span>
              </div>
              <Progress value={renderProgress} className="w-full" />
            </div>

            {/* Processing Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: 'TTS', icon: Mic, complete: renderProgress > 25 },
                { step: 'Avatar', icon: UserCircle, complete: renderProgress > 50 },
                { step: 'Render', icon: Video, complete: renderProgress > 75 },
                { step: 'Export', icon: Download, complete: renderProgress >= 100 }
              ].map((item) => (
                <div key={item.step} className="text-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                    item.complete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">{item.step}</p>
                </div>
              ))}
            </div>

            {job && (
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  Job ID: {job.id} • Tempo estimado: {Math.ceil(job.estimated_duration / 60)} minutos
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Completed */}
      {currentStep === 'complete' && videoResult && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Vídeo Gerado com Sucesso!
            </CardTitle>
            <CardDescription>
              Seu vídeo está pronto para download ou compartilhamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-1">
                <Clock className="w-6 h-6 text-blue-600 mx-auto" />
                <p className="text-sm font-medium">Duração</p>
                <p className="text-lg font-bold">{videoResult.duration}s</p>
              </div>
              <div className="text-center space-y-1">
                <Video className="w-6 h-6 text-green-600 mx-auto" />
                <p className="text-sm font-medium">Resolução</p>
                <p className="text-lg font-bold">{videoResult.resolution}</p>
              </div>
              <div className="text-center space-y-1">
                <Film className="w-6 h-6 text-purple-600 mx-auto" />
                <p className="text-sm font-medium">Formato</p>
                <p className="text-lg font-bold">{videoResult.format.toUpperCase()}</p>
              </div>
              <div className="text-center space-y-1">
                <Download className="w-6 h-6 text-amber-600 mx-auto" />
                <p className="text-sm font-medium">Tamanho</p>
                <p className="text-lg font-bold">{(videoResult.file_size / 1024 / 1024).toFixed(1)}MB</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1" asChild>
                <a href={videoResult.url} download>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar MP4
                </a>
              </Button>
              <Button variant="outline" className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Pré-visualizar
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setCurrentStep('upload')
                  setProject(null)
                  setVideoResult(null)
                  setJob(null)
                  setRenderProgress(0)
                }}
              >
                Novo Vídeo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
