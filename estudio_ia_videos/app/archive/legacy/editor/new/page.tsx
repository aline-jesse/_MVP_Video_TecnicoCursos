
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { 
  Upload,
  FileText,
  ArrowLeft,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { processProjectPPTX } from '@/hooks/use-projects'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Details, 2: Upload, 3: Processing
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')
  const [progress, setProgress] = useState(0)

  const handleProjectDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectData.name.trim()) {
      toast.error('Nome do projeto é obrigatório')
      return
    }
    setStep(2)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file
    if (!selectedFile.name.endsWith('.pptx')) {
      toast.error('Por favor, selecione um arquivo PPTX')
      return
    }

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      toast.error('Arquivo muito grande. Limite: 100MB')
      return
    }

    setFile(selectedFile)
    toast.success('Arquivo PPTX selecionado com sucesso!')
  }

  const handleUploadAndProcess = async () => {
    if (!file) {
      toast.error('Selecione um arquivo PPTX primeiro')
      return
    }

    setProcessing(true)
    setStep(3)
    setProcessingStage('Preparando upload...')
    setProgress(10)

    try {
      // Simulate progress updates
      const progressSteps = [
        { stage: 'Fazendo upload do arquivo...', progress: 20 },
        { stage: 'Extraindo conteúdo dos slides...', progress: 40 },
        { stage: 'Analisando texto com IA...', progress: 60 },
        { stage: 'Gerando narração com TTS...', progress: 80 },
        { stage: 'Finalizando projeto...', progress: 95 }
      ]

      for (const step of progressSteps) {
        setProcessingStage(step.stage)
        setProgress(step.progress)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Actual API call
      const result = await processProjectPPTX(file, projectData.name)
      
      setProgress(100)
      setProcessingStage('Processamento concluído!')
      
      toast.success('Projeto criado com sucesso!')
      
      // Redirect to project editor after a short delay
      setTimeout(() => {
        router.push(`/editor/${result.projectId}`)
      }, 2000)

    } catch (error) {
      console.error('Error processing PPTX:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar PPTX')
      setProcessing(false)
      setStep(2) // Go back to upload step
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold">Novo Projeto</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Step {step} de 3
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Step 1: Project Details */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Detalhes do Projeto
              </CardTitle>
              <CardDescription>
                Informe o nome e descrição do seu projeto de treinamento
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleProjectDetailsSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Projeto *</Label>
                  <Input
                    id="name"
                    value={projectData.name}
                    onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: NR-12 - Segurança em Máquinas e Equipamentos"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={projectData.description}
                    onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva brevemente o conteúdo do treinamento..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Continuar
                    <Zap className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: File Upload */}
        {step === 2 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Upload do Arquivo PPTX
              </CardTitle>
              <CardDescription>
                Selecione seu arquivo de apresentação PowerPoint (.pptx)
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Project Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">{projectData.name}</h3>
                  {projectData.description && (
                    <p className="text-sm text-gray-600 mt-1">{projectData.description}</p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="file-upload">Arquivo PPTX *</Label>
                  <div className="mt-2">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pptx"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {file && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                {/* Upload Requirements */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Requisitos do arquivo:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Formato: .pptx (PowerPoint)</li>
                    <li>• Tamanho máximo: 100MB</li>
                    <li>• Conteúdo: Textos e imagens serão extraídos</li>
                    <li>• Idioma: Português brasileiro recomendado</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  
                  <Button 
                    onClick={handleUploadAndProcess}
                    disabled={!file}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Processar com IA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Processando Projeto
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Projeto Criado!
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {processing ? 'Aguarde enquanto processamos seu arquivo PPTX' : 'Redirecionando para o editor...'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{processingStage}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* Processing Steps */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-700">Upload do arquivo concluído</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    {progress >= 40 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : progress >= 20 ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={progress >= 40 ? "text-green-700" : progress >= 20 ? "text-blue-700" : "text-gray-500"}>
                      Extração de conteúdo dos slides
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    {progress >= 60 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : progress >= 40 ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={progress >= 60 ? "text-green-700" : progress >= 40 ? "text-blue-700" : "text-gray-500"}>
                      Análise de conteúdo com IA
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    {progress >= 80 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : progress >= 60 ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={progress >= 80 ? "text-green-700" : progress >= 60 ? "text-blue-700" : "text-gray-500"}>
                      Geração de narração (TTS)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    {progress >= 100 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : progress >= 80 ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={progress >= 100 ? "text-green-700" : progress >= 80 ? "text-blue-700" : "text-gray-500"}>
                      Finalização do projeto
                    </span>
                  </div>
                </div>

                {!processing && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 text-sm">
                      Seu projeto foi criado com sucesso! Você será redirecionado para o editor em instantes.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
      </main>
    </div>
  )
}
