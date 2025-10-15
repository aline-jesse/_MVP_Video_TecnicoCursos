
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Video, Film, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { usePPTXUpload } from '@/hooks/use-pptx-upload';
import { useRenderQueue } from '@/hooks/use-render-queue';
import { useAnalyticsTrack } from '@/hooks/use-analytics-track';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type FlowStep = 'upload' | 'timeline' | 'render' | 'download' | 'complete';

export default function StudioPage() {
  const router = useRouter();
  const { trackUpload, trackRenderStart, trackDownload } = useAnalyticsTrack();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pptxData, setPptxData] = useState<any>(null);
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const { uploadPPTX, progress: uploadProgressObj, result: uploadResult, error: uploadError } = usePPTXUpload();
  const isUploading = uploadProgressObj.stage !== 'idle' && uploadProgressObj.stage !== 'complete';
  const uploadProgress = uploadProgressObj.progress;
  const { startRender, status: renderStatus, progress: renderProgress } = useRenderQueue(projectId || '');

  // FASE 1: Upload PPTX
  const handlePPTXUpload = async (file: File) => {
    try {
      const result = await uploadPPTX(file);
      
      if (result.success) {
        setPptxData(result);
        await trackUpload(file.size, file.name);
        
        // Auto-criar projeto na timeline
        const projectResponse = await fetch('/api/projects/create-from-pptx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name.replace('.pptx', ''),
            pptxData: result,
          }),
        });

        const project = await projectResponse.json();
        setProjectId(project.id);
        setCurrentStep('timeline');
        
        toast.success('PPTX carregado! Edite na timeline.');
      }
    } catch (error) {
      toast.error('Erro ao carregar PPTX');
      console.error(error);
    }
  };

  // FASE 2: Ir para Timeline
  const goToTimeline = () => {
    if (projectId) {
      router.push(`/timeline-edit?projectId=${projectId}`);
    }
  };

  // FASE 3: Renderizar
  const handleRender = async () => {
    if (!projectId) return;

    try {
      const jobId = await startRender({
        resolution: '1080p',
        fps: 30,
      });

      setRenderJobId(jobId || '');
      await trackRenderStart(projectId);
      setCurrentStep('render');
      
      toast.success('Renderização iniciada!');
    } catch (error) {
      toast.error('Erro ao iniciar renderização');
      console.error(error);
    }
  };

  // FASE 4: Download (quando render completo)
  const handleDownload = async () => {
    if (!videoUrl) return;

    await trackDownload('video', projectId || '');
    
    // Download
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `video-${projectId}.mp4`;
    a.click();
    
    setCurrentStep('complete');
    toast.success('Vídeo baixado com sucesso!');
  };

  // Monitora status do render
  if (renderStatus && renderStatus.status === 'completed' && renderJobId && !videoUrl) {
    // Buscar URL do vídeo
    fetch(`/api/render/result/${renderJobId}`)
      .then(res => res.json())
      .then(data => {
        if (data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setCurrentStep('download');
        }
      })
      .catch(console.error);
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Estúdio de Criação</h1>
        <p className="text-muted-foreground">
          Fluxo completo: Upload PPTX → Edição → Renderização → Download
        </p>
      </div>

      {/* Progress Flow */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progresso do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {/* Step 1: Upload */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                currentStep === 'upload' ? 'bg-blue-600 text-white' :
                ['timeline', 'render', 'download', 'complete'].includes(currentStep) ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {['timeline', 'render', 'download', 'complete'].includes(currentStep) ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  <Upload className="w-6 h-6" />
                }
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${['timeline', 'render', 'download', 'complete'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-200'}`} />
            </div>

            {/* Step 2: Timeline */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                currentStep === 'timeline' ? 'bg-blue-600 text-white' :
                ['render', 'download', 'complete'].includes(currentStep) ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {['render', 'download', 'complete'].includes(currentStep) ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  <Video className="w-6 h-6" />
                }
              </div>
              <span className="text-sm font-medium">Edição</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${['render', 'download', 'complete'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-200'}`} />
            </div>

            {/* Step 3: Render */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                currentStep === 'render' ? 'bg-blue-600 text-white' :
                ['download', 'complete'].includes(currentStep) ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {['download', 'complete'].includes(currentStep) ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  <Film className="w-6 h-6" />
                }
              </div>
              <span className="text-sm font-medium">Renderizar</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${['download', 'complete'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-200'}`} />
            </div>

            {/* Step 4: Download */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                currentStep === 'download' ? 'bg-blue-600 text-white' :
                currentStep === 'complete' ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {currentStep === 'complete' ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  <Download className="w-6 h-6" />
                }
              </div>
              <span className="text-sm font-medium">Download</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">1. Upload</TabsTrigger>
          <TabsTrigger value="timeline" disabled={!projectId}>2. Edição</TabsTrigger>
          <TabsTrigger value="render" disabled={!projectId}>3. Renderizar</TabsTrigger>
          <TabsTrigger value="download" disabled={!videoUrl}>4. Download</TabsTrigger>
        </TabsList>

        {/* TAB 1: UPLOAD */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload de PPTX</CardTitle>
              <CardDescription>
                Faça upload do seu arquivo PowerPoint (.pptx)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-4">Arraste um arquivo PPTX ou clique para selecionar</p>
                <input
                  type="file"
                  accept=".pptx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePPTXUpload(file);
                  }}
                  className="hidden"
                  id="pptx-upload"
                />
                <Button asChild>
                  <label htmlFor="pptx-upload" className="cursor-pointer">
                    Selecionar Arquivo
                  </label>
                </Button>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fazendo upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TIMELINE */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Edição na Timeline</CardTitle>
              <CardDescription>
                Edite seu projeto na timeline profissional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <p className="text-lg mb-4">
                  Seu projeto foi criado! Clique abaixo para editar na timeline.
                </p>
                <Button size="lg" onClick={goToTimeline}>
                  Abrir Timeline
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Informações do Projeto</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>ID: {projectId}</li>
                  <li>Slides: {pptxData?.slideCount || 0}</li>
                  <li>Status: Pronto para edição</li>
                </ul>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setCurrentStep('render')}
              >
                Pular Edição e Renderizar Agora
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: RENDER */}
        <TabsContent value="render">
          <Card>
            <CardHeader>
              <CardTitle>Renderização</CardTitle>
              <CardDescription>
                Gere seu vídeo final em alta qualidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!renderJobId ? (
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <Film className="w-12 h-12 mb-4 text-purple-600" />
                    <h3 className="text-lg font-semibold mb-2">Configurações de Renderização</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                      <li>• Resolução: Full HD (1920x1080)</li>
                      <li>• FPS: 30 fps</li>
                      <li>• Formato: MP4 (H.264)</li>
                      <li>• Qualidade: Alta</li>
                    </ul>
                    <Button 
                      size="lg" 
                      onClick={handleRender}
                      className="w-full"
                    >
                      Iniciar Renderização
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Status: {renderStatus?.status === 'processing' ? 'Renderizando...' : 
                               renderStatus?.status === 'completed' ? 'Completo!' : 
                               renderStatus?.status === 'failed' ? 'Falhou' : 'Aguardando...'}
                    </span>
                    <span className="text-sm">{renderProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>

                  {renderStatus && renderStatus.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">Renderização Completa!</p>
                        <p className="text-sm text-green-700">Seu vídeo está pronto para download.</p>
                      </div>
                    </div>
                  )}

                  {renderStatus && renderStatus.status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-900">Erro na Renderização</p>
                        <p className="text-sm text-red-700">Tente novamente ou contate o suporte.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: DOWNLOAD */}
        <TabsContent value="download">
          <Card>
            <CardHeader>
              <CardTitle>Download do Vídeo</CardTitle>
              <CardDescription>
                Seu vídeo está pronto!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-semibold mb-2">Vídeo Pronto!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Clique no botão abaixo para fazer o download
                </p>
                <Button size="lg" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Vídeo
                </Button>
              </div>

              {videoUrl && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Preview do Vídeo</h3>
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {currentStep === 'complete' && (
        <Card className="mt-8 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-6 h-6" />
              Projeto Completo!
            </CardTitle>
            <CardDescription className="text-green-700">
              Parabéns! Você completou todo o fluxo de criação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => {
                  setCurrentStep('upload');
                  setProjectId(null);
                  setPptxData(null);
                  setRenderJobId(null);
                  setVideoUrl(null);
                }}
              >
                Criar Novo Projeto
              </Button>
              <Button onClick={() => router.push('/dashboard-real')}>
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
