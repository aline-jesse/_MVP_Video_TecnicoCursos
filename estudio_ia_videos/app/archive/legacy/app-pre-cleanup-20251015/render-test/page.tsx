
/**
 * Página de teste para Render Queue
 * Sprint 48 - FASE 3
 */

'use client';

import { useState } from 'react';
import { useRenderQueue } from '@/hooks/use-render-queue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, CheckCircle2, AlertCircle, Loader2, Film } from 'lucide-react';

export default function RenderTestPage() {
  const [projectId, setProjectId] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  
  const {
    startRender,
    checkStatus,
    reset,
    jobId,
    status,
    isRendering,
    error,
    progress,
    isComplete,
    isFailed,
    videoUrl
  } = useRenderQueue(projectId);

  const handleStart = async () => {
    if (!projectId) {
      alert('Digite um Project ID');
      return;
    }

    try {
      await startRender({
        resolution,
        quality,
        fps: 30,
        format: 'mp4',
        withAudio: true,
        withSubtitles: false
      });
    } catch (err) {
      console.error('Erro ao iniciar render:', err);
    }
  };

  const handleReset = () => {
    reset();
    setProjectId('');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          🎬 Teste do Render Queue
        </h1>
        <p className="text-muted-foreground">
          Sprint 48 - FASE 3: Sistema de render com BullMQ + Redis
        </p>
      </div>

      {/* Configuração */}
      {!isRendering && !isComplete && !isFailed && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Iniciar Render</CardTitle>
            <CardDescription>
              Configure o render de vídeo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                placeholder="ex: clxxx123..."
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                ID do projeto que você quer renderizar
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resolução</Label>
                <Select value={resolution} onValueChange={(v: any) => setResolution(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Qualidade</Label>
                <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
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
            </div>

            <Button 
              onClick={handleStart} 
              className="w-full"
              disabled={!projectId}
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Render
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status do Render */}
      {(isRendering || isComplete || isFailed) && (
        <div className="space-y-6">
          {/* Job Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                Status do Render
              </CardTitle>
              <CardDescription>
                Job ID: {jobId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isRendering && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">Renderizando...</span>
                  </>
                )}
                {isComplete && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Render Completo
                    </span>
                  </>
                )}
                {isFailed && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      Render Falhou
                    </span>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              {isRendering && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {/* Detalhes */}
              {status && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{status.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <p className="font-medium">{status.progress || 0}%</p>
                  </div>
                </div>
              )}

              {/* Resultado */}
              {isComplete && videoUrl && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                  <CheckCircle2 className="h-4 h-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Vídeo renderizado com sucesso!
                    <div className="mt-2">
                      <a 
                        href={videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs underline"
                      >
                        {videoUrl}
                      </a>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Erro */}
              {isFailed && error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!isRendering && (
                  <Button onClick={handleReset}>
                    Novo Render
                  </Button>
                )}
                {isRendering && (
                  <Button 
                    variant="outline" 
                    onClick={() => checkStatus()}
                  >
                    Atualizar Status
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Técnicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend:</span>
                <span className="font-medium">BullMQ + Redis</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Polling:</span>
                <span className="font-medium">2s automático</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concurrency:</span>
                <span className="font-medium">2 workers simultâneos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate Limit:</span>
                <span className="font-medium">10 renders/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retry:</span>
                <span className="font-medium">3 tentativas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
