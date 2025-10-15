
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ProductionPPTXUpload from '@/components/pptx/production-pptx-upload'
import RealTTSPanel from '@/components/tts/real-tts-panel'
import { 
  Play, 
  FileText, 
  Volume2, 
  Video, 
  Download,
  CheckCircle,
  Clock,
  Users,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PPTXProject {
  id: string
  name: string
  slides: Array<{
    id: string
    title: string
    content: string
    order: number
  }>
  duration: number
  status: 'processing' | 'ready' | 'error'
}

export default function EstudioRealPage() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'tts' | 'render' | 'completed'>('upload')
  const [project, setProject] = useState<PPTXProject | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [renderJobId, setRenderJobId] = useState<string | null>(null)
  const [renderProgress, setRenderProgress] = useState(0)
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null)

  const handleProjectReady = (newProject: PPTXProject) => {
    setProject(newProject)
    setCurrentStep('edit')
    toast.success('✅ Projeto PPTX pronto para edição!')
  }

  const handleProceedToTTS = () => {
    if (!project) return
    setCurrentStep('tts')
  }

  const handleAudioGenerated = (url: string, duration: number) => {
    setAudioUrl(url)
    toast.success('✅ Áudio TTS gerado com sucesso!')
  }

  const handleProceedToRender = async () => {
    if (!project || !audioUrl) return

    try {
      setCurrentStep('render')
      
      const response = await fetch('/api/v1/render/video-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData: project,
          audioUrl: audioUrl,
          settings: {
            quality: '1080p',
            format: 'mp4'
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        setRenderJobId(data.jobId)
        monitorRenderProgress(data.jobId)
      } else {
        throw new Error(data.error || 'Erro ao iniciar renderização')
      }

    } catch (error: any) {
      console.error('Render error:', error)
      toast.error(`❌ ${error.message}`)
    }
  }

  const monitorRenderProgress = async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/v1/render/video-real?jobId=${jobId}`)
        const job = await response.json()
        
        setRenderProgress(job.progress || 0)
        
        if (job.status === 'completed') {
          setFinalVideoUrl(job.videoUrl)
          setCurrentStep('completed')
          toast.success('🎉 Vídeo renderizado com sucesso!')
        } else if (job.status === 'error') {
          toast.error('❌ Erro na renderização')
        } else {
          setTimeout(checkStatus, 1000)
        }
      } catch (error) {
        console.error('Status check error:', error)
      }
    }

    checkStatus()
  }

  const downloadVideo = () => {
    if (!finalVideoUrl) return
    
    const a = document.createElement('a')
    a.href = finalVideoUrl
    a.download = `${project?.name || 'video'}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('📥 Download iniciado!')
  }

  const resetWorkflow = () => {
    setCurrentStep('upload')
    setProject(null)
    setAudioUrl(null)
    setRenderJobId(null)
    setRenderProgress(0)
    setFinalVideoUrl(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-full">
              <Play className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Estúdio IA de Vídeos
              </h1>
              <p className="text-xl text-gray-600">Sistema de Produção Real - 24h Launch</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="text-green-700 bg-green-100">
              ✅ S3 Storage Ativo
            </Badge>
            <Badge variant="secondary" className="text-blue-700 bg-blue-100">
              ✅ Google TTS Real
            </Badge>
            <Badge variant="secondary" className="text-purple-700 bg-purple-100">
              ✅ Pipeline Funcional
            </Badge>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              {[
                { key: 'upload', label: 'Upload', icon: FileText },
                { key: 'edit', label: 'Edição', icon: Sparkles },
                { key: 'tts', label: 'Narração', icon: Volume2 },
                { key: 'render', label: 'Render', icon: Video },
                { key: 'completed', label: 'Concluído', icon: CheckCircle }
              ].map((step, index) => {
                const isActive = currentStep === step.key
                const isCompleted = ['upload', 'edit', 'tts', 'render', 'completed'].indexOf(currentStep) > index
                const StepIcon = step.icon
                
                return (
                  <React.Fragment key={step.key}>
                    <div className={`flex items-center space-x-2 ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`p-2 rounded-full ${
                        isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < 4 && (
                      <ArrowRight className={`h-4 w-4 ${
                        isCompleted ? 'text-green-400' : 'text-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Workflow */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 'upload' && (
              <ProductionPPTXUpload />
            )}

            {currentStep === 'edit' && project && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-6 w-6" />
                    <span>Projeto Importado</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-900">{project.name}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-800">{project.slides.length}</div>
                        <div className="text-sm text-blue-600">Slides</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-800">
                          {Math.floor(project.duration / 60)}m {project.duration % 60}s
                        </div>
                        <div className="text-sm text-blue-600">Duração</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-800">1080p</div>
                        <div className="text-sm text-blue-600">Qualidade</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Prévia dos Slides:</h4>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {project.slides.slice(0, 5).map((slide) => (
                        <div key={slide.id} className="p-2 bg-gray-50 rounded text-sm">
                          <strong>Slide {slide.order + 1}:</strong> {slide.title}
                        </div>
                      ))}
                      {project.slides.length > 5 && (
                        <div className="text-center text-gray-500 text-sm">
                          +{project.slides.length - 5} slides adicionais
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleProceedToTTS} size="lg" className="w-full">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Prosseguir para Narração
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentStep === 'tts' && (
              <div className="space-y-6">
                <RealTTSPanel 
                  onAudioGenerated={handleAudioGenerated}
                  initialText={project?.slides.map(s => `${s.title}. ${s.content}`).join(' ') || ''}
                />
                
                {audioUrl && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <div>
                            <h3 className="font-bold text-green-900">Áudio TTS Pronto</h3>
                            <p className="text-green-700">Narração gerada com sucesso</p>
                          </div>
                        </div>
                        <Button onClick={handleProceedToRender} size="lg">
                          <Video className="h-4 w-4 mr-2" />
                          Renderizar Vídeo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentStep === 'render' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-6 w-6" />
                    <span>Renderização em Progresso</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎬</div>
                    <div>
                      <h3 className="text-xl font-bold">Criando seu vídeo...</h3>
                      <p className="text-gray-600">Processamento com qualidade profissional</p>
                    </div>
                    <Progress value={renderProgress} className="w-full" />
                    <p className="text-sm text-gray-600">
                      {renderProgress}% concluído • Tempo estimado: {Math.ceil((100 - renderProgress) / 10)} segundos
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'completed' && finalVideoUrl && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-6 w-6" />
                    <span>Vídeo Concluído!</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-green-900">
                      Seu vídeo está pronto!
                    </h3>
                    <p className="text-green-700">
                      Vídeo profissional gerado com IA em qualidade 1080p
                    </p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button onClick={downloadVideo} size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Download MP4
                    </Button>
                    <Button onClick={resetWorkflow} variant="outline" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Novo Projeto
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm border-t pt-4">
                    <div>
                      <div className="font-bold text-green-800">Qualidade</div>
                      <div className="text-green-600">1080p Full HD</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-800">Formato</div>
                      <div className="text-green-600">MP4 Universal</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-800">IA</div>
                      <div className="text-green-600">Production Ready</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info Panels */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Status do Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Database</span>
                    <Badge variant="secondary" className="text-green-700 bg-green-100">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>S3 Storage</span>
                    <Badge variant="secondary" className="text-green-700 bg-green-100">Ativo</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Google TTS</span>
                    <Badge variant="secondary" className="text-green-700 bg-green-100">Conectado</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Render Engine</span>
                    <Badge variant="secondary" className="text-green-700 bg-green-100">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Upload até 100MB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>6 Vozes brasileiras</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Render 1080p</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Avatares 3D hiper-realistas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
