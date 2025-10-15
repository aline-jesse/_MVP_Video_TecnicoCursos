
/**
 * Página de teste para Parser PPTX Avançado
 * Sprint 48 - FASE 2
 */

'use client';

import { useState } from 'react';
import { usePPTXUpload } from '@/hooks/use-pptx-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function PPTXTestPage() {
  const { uploadPPTX, progress, result, error, isUploading, isComplete, isError, reset } = usePPTXUpload();
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.pptx')) {
      alert('Por favor, selecione um arquivo .pptx');
      return;
    }

    try {
      await uploadPPTX(file);
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pptxFile = files.find(f => f.name.endsWith('.pptx'));
    
    if (pptxFile) {
      handleFileSelect(pptxFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          🧪 Teste do Parser PPTX Avançado
        </h1>
        <p className="text-muted-foreground">
          Sprint 48 - FASE 2: Parser que extrai slides, textos, imagens e layouts reais
        </p>
      </div>

      {/* Upload Area */}
      {!isComplete && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload de PPTX</CardTitle>
            <CardDescription>
              Arraste um arquivo .pptx ou clique para selecionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-4">
                Arraste um arquivo PPTX aqui
              </p>
              <input
                type="file"
                accept=".pptx"
                onChange={handleInputChange}
                className="hidden"
                id="file-input"
                disabled={isUploading}
              />
              <Button
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={isUploading}
              >
                Selecionar Arquivo
              </Button>
            </div>

            {/* Progress */}
            {isUploading && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{progress.message}</span>
                  <span className="text-muted-foreground">{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} />
              </div>
            )}

            {/* Error */}
            {isError && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isComplete && result && (
        <div className="space-y-6">
          {/* Success Alert */}
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              PPTX parseado com sucesso! Projeto criado: {result.projectId}
            </AlertDescription>
          </Alert>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Metadados
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Título</p>
                <p className="font-medium">{result.metadata.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Autor</p>
                <p className="font-medium">{result.metadata.author}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Slides</p>
                <p className="font-medium">{result.metadata.slideCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID do Projeto</p>
                <p className="font-mono text-xs">{result.projectId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Slides */}
          <Card>
            <CardHeader>
              <CardTitle>Slides Parseados ({result.slides.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.slides.map((slide) => (
                <Card key={slide.slideNumber} className="border-muted">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">
                        {slide.slideNumber}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">{slide.title}</h3>
                        
                        {slide.content.length > 0 && (
                          <div className="space-y-1">
                            {slide.content.map((text, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">
                                • {text}
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-muted rounded">
                            Layout: {slide.layout}
                          </span>
                          {slide.imageCount > 0 && (
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {slide.imageCount} {slide.imageCount === 1 ? 'imagem' : 'imagens'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={reset}>
              Fazer Novo Upload
            </Button>
            <Button variant="outline" asChild>
              <a href={`/canvas?projectId=${result.projectId}`}>
                Abrir no Canvas
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
