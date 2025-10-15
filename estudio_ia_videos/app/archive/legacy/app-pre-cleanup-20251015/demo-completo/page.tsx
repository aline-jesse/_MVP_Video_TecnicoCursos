
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Play, CheckCircle, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Import dos protótipos
import { UploadPrototype } from '@/components/prototypes/upload-prototype'
import { EditorPrototype } from '@/components/prototypes/editor-prototype'
import { PreviewPrototype } from '@/components/prototypes/preview-prototype'
import { CompliancePrototype } from '@/components/prototypes/compliance-prototype'
import { DashboardPrototype } from '@/components/prototypes/dashboard-prototype'

export default function DemoCompletoPage() {
  const [currentStep, setCurrentStep] = useState<'dashboard' | 'upload' | 'editor' | 'preview' | 'compliance'>('dashboard')
  const [projectData, setProjectData] = useState<any>(null)

  const handleUploadComplete = (result: any) => {
    setProjectData(result)
    toast.success('Projeto criado! Redirecionando para o editor...')
    setTimeout(() => {
      setCurrentStep('editor')
    }, 2000)
  }

  const handleEditorSave = () => {
    toast.success('Projeto salvo! Gerando preview...')
    setTimeout(() => {
      setCurrentStep('preview')
    }, 1500)
  }

  const handleEditorPreview = () => {
    setCurrentStep('preview')
  }

  const handlePreviewExport = () => {
    toast.success('Vídeo exportado! Verificando compliance...')
    setTimeout(() => {
      setCurrentStep('compliance')
    }, 2000)
  }

  const handleCreateProject = () => {
    setCurrentStep('upload')
  }

  const handleOpenProject = (project: any) => {
    setProjectData(project)
    setCurrentStep('editor')
  }

  const steps = [
    { id: 'dashboard', title: 'Dashboard', icon: '🏠', completed: true },
    { id: 'upload', title: 'Upload', icon: '📤', completed: currentStep !== 'dashboard' },
    { id: 'editor', title: 'Editor', icon: '✏️', completed: ['preview', 'compliance'].includes(currentStep) },
    { id: 'preview', title: 'Preview', icon: '👁️', completed: currentStep === 'compliance' },
    { id: 'compliance', title: 'Compliance', icon: '✅', completed: false }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-4">
            🎬 Estúdio IA de Vídeos - Demo Completo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Fluxo completo navegável: Upload → Editor → Preview → Export
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-4 py-2">
            ✨ TODOS os Mockups Convertidos em Protótipos Navegáveis
          </Badge>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep === step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : step.completed 
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {step.completed && currentStep !== step.id ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="text-lg">{step.icon}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium ${
                      currentStep === step.id 
                        ? 'text-blue-600' 
                        : step.completed 
                          ? 'text-green-600'
                          : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {currentStep === 'dashboard' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  Dashboard Unificado - Protótipo Navegável
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardPrototype 
                  onCreateProject={handleCreateProject}
                  onOpenProject={handleOpenProject}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-green-600" />
                  Sistema de Upload PPTX - Totalmente Funcional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UploadPrototype onComplete={handleUploadComplete} />
                
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('dashboard')}
                  >
                    ← Voltar ao Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'editor' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  Editor Canvas - Estilo Animaker Profissional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <EditorPrototype 
                  project={projectData}
                  onSave={handleEditorSave}
                  onPreview={handleEditorPreview}
                  onExport={handlePreviewExport}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-6 w-6 text-orange-600" />
                  Player de Vídeo - Preview em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewPrototype 
                  project={projectData}
                  onExport={handlePreviewExport}
                />
                
                <div className="mt-6 flex justify-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('editor')}
                  >
                    ← Voltar ao Editor
                  </Button>
                  <Button 
                    onClick={handlePreviewExport}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Continuar para Compliance →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'compliance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Sistema de Compliance NR - Análise Automática
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CompliancePrototype 
                  projectContent={projectData?.content}
                  onUpdate={(report) => {
                    console.log('Compliance report:', report)
                    toast.success('Relatório de compliance atualizado!')
                  }}
                />
                
                <div className="mt-6 flex justify-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('preview')}
                  >
                    ← Voltar ao Preview
                  </Button>
                  <Button 
                    onClick={() => {
                      setCurrentStep('dashboard')
                      toast.success('🎉 Fluxo completo finalizado! Voltando ao dashboard...')
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Finalizar e Voltar ao Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Helper */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">🚀 Navegação Rápida</h3>
              <div className="flex flex-wrap justify-center gap-2">
                <Button 
                  size="sm" 
                  variant={currentStep === 'dashboard' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  size="sm" 
                  variant={currentStep === 'upload' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('upload')}
                >
                  Upload
                </Button>
                <Button 
                  size="sm" 
                  variant={currentStep === 'editor' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('editor')}
                >
                  Editor
                </Button>
                <Button 
                  size="sm" 
                  variant={currentStep === 'preview' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('preview')}
                >
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  variant={currentStep === 'compliance' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('compliance')}
                >
                  Compliance
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                ✅ Sistema 100% navegável - Nenhum placeholder "Em Desenvolvimento"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
