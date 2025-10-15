
'use client'

import React, { useState } from 'react'
import AppShell from '@/components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Zap,
  Clock,
  Play,
  Settings,
  Info,
  Video
} from 'lucide-react'
import Link from 'next/link'
import { ProductionPPTXUploadV2 } from '@/components/pptx/production-pptx-upload-v2'
import { EnhancedPPTXUpload } from '@/components/pptx/enhanced-pptx-upload'
import { toast } from 'react-hot-toast'

export default function PPTXUploadRealPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)

  const handleProcessComplete = (result: any) => {
    setProcessingStatus('complete')
    toast.success('PPTX processado com sucesso!')
    console.log('Upload resultado:', result)
  }

  const handleCancel = () => {
    setProcessingStatus(null)
    toast('Upload cancelado')
  }

  return (
    <AppShell 
      title="Upload PPTX - Sistema Profissional"
      description="Converta apresentações PowerPoint em vídeos interativos com IA"
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sistema Real
              </Badge>
              <Badge variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                S3 + IA
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Processamento médio: 2-5 min</span>
          </div>
        </div>

        {/* Status Alert */}
        {processingStatus === 'complete' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Upload concluído!</strong> Sua apresentação foi processada e está pronta para edição.
            </AlertDescription>
          </Alert>
        )}

        {processingStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro no processamento.</strong> Tente novamente ou use um arquivo diferente.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Upload Area - Main */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="upload"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Profissional
                </TabsTrigger>
                <TabsTrigger
                  value="enhanced"
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Upload com IA
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Upload Profissional PPTX
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload direto para AWS S3 com processamento em tempo real
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ProductionPPTXUploadV2 
                      onProcessComplete={handleProcessComplete}
                      onCancel={handleCancel}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="enhanced" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Upload com IA Avançada
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Análise inteligente de conteúdo e geração automática de timeline
                    </p>
                  </CardHeader>
                  <CardContent>
                    <EnhancedPPTXUpload 
                      onProcessComplete={handleProcessComplete}
                      onCancel={handleCancel}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Features Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Funcionalidades
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Upload Real S3</div>
                    <div className="text-muted-foreground text-xs">Armazenamento seguro na nuvem</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Análise IA</div>
                    <div className="text-muted-foreground text-xs">Extração automática de conteúdo</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Timeline Automática</div>
                    <div className="text-muted-foreground text-xs">Geração de cenas e transições</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Processamento Real</div>
                    <div className="text-muted-foreground text-xs">APIs funcionais integradas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specs Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Especificações
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Formatos:</span>
                  <span className="font-medium">PPTX, PPT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tamanho máx:</span>
                  <span className="font-medium">100 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processamento:</span>
                  <span className="font-medium">2-5 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Armazenamento:</span>
                  <span className="font-medium">AWS S3</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    toast.success('Tutorial em desenvolvimento!')
                    // TODO: Implementar modal de tutorial
                    console.log('Tutorial solicitado')
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Ver Tutorial
                </Button>
                
                <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                  <Link href="/ai-templates">
                    <Zap className="h-4 w-4 mr-2" />
                    Templates IA
                  </Link>
                </Button>
                
                <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                  <Link href="/canvas-editor-professional">
                    <Settings className="h-4 w-4 mr-2" />
                    Editor Avançado
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
