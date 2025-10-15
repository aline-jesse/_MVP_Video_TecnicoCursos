/**
 * 🎨 Batch PPTX Upload Component
 * Interface para upload e processamento em lote de arquivos PPTX
 */

'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle, Loader2, Play, Pause } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BatchJob {
  id: string
  filename: string
  fileSize: number
  status: 'pending' | 'uploading' | 'processing' | 'generating-narration' | 'completed' | 'failed' | 'cancelled'
  progress: number
  error?: string
  result?: {
    projectId: string
    slideCount: number
    duration: number
    thumbnailUrl?: string
    narrationGenerated: boolean
  }
}

export default function BatchPPTXUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [jobs, setJobs] = useState<BatchJob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null)
  
  // Opções
  const [generateNarration, setGenerateNarration] = useState(true)
  const [analyzeQuality, setAnalyzeQuality] = useState(true)
  const [convertAnimations, setConvertAnimations] = useState(true)
  const [narrationProvider, setNarrationProvider] = useState<'azure' | 'elevenlabs'>('azure')
  const [narrationVoice, setNarrationVoice] = useState('pt-BR-FranciscaNeural')
  const [maxConcurrent, setMaxConcurrent] = useState(3)

  // Drag & Drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pptxFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.pptx') || file.name.endsWith('.ppt')
    )
    
    setFiles(prev => [...prev, ...pptxFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt']
    },
    multiple: true
  })

  // Remover arquivo
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Processar arquivos
  const handleProcess = async () => {
    if (files.length === 0) return

    setIsProcessing(true)

    try {
      const formData = new FormData()
      
      // Adicionar arquivos
      files.forEach((file, index) => {
        formData.append(`file${index}`, file)
      })

      // Adicionar opções
      formData.append('generateNarration', String(generateNarration))
      formData.append('analyzeQuality', String(analyzeQuality))
      formData.append('convertAnimations', String(convertAnimations))
      formData.append('maxConcurrent', String(maxConcurrent))
      formData.append('narrationProvider', narrationProvider)
      formData.append('narrationVoice', narrationVoice)

      const response = await fetch('/api/v1/pptx/process-advanced', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro no processamento')
      }

      const result = await response.json()
      
      setJobs(result.jobs)
      setCurrentBatchId(result.batchJobId ?? null)
      
      // Poll para atualização de progresso
      if (
        result.batchJobId &&
        result.jobs.some((j: BatchJob) => j.status !== 'completed' && j.status !== 'failed' && j.status !== 'cancelled')
      ) {
        startProgressPolling(result.batchJobId)
      }

    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao processar arquivos')
    } finally {
      setIsProcessing(false)
    }
  }

  // Polling de progresso
  const startProgressPolling = (batchId: string) => {
    if (!batchId) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/pptx/process-advanced?batchJobId=${batchId}`)
        const data = await response.json()
        
        setJobs(data.jobs)
        
        // Parar quando todos terminarem
        const allDone = data.jobs.every((j: BatchJob) => 
          j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled'
        )
        
        if (allDone) {
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Erro ao atualizar progresso:', error)
        clearInterval(interval)
      }
    }, 2000) // A cada 2 segundos
  }

  // Cancelar job
  const cancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/v1/pptx/process-advanced?jobId=${jobId}`, {
        method: 'DELETE'
      })
      
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'cancelled' as const } : j
      ))
    } catch (error) {
      console.error('Erro ao cancelar:', error)
    }
  }

  // Status badge
  const getStatusBadge = (status: BatchJob['status']) => {
    const variants: Record<typeof status, { variant: string; icon: any; label: string }> = {
      'pending': { variant: 'secondary', icon: Pause, label: 'Aguardando' },
      'uploading': { variant: 'default', icon: Loader2, label: 'Enviando' },
      'processing': { variant: 'default', icon: Loader2, label: 'Processando' },
      'generating-narration': { variant: 'default', icon: Loader2, label: 'Gerando Narração' },
      'completed': { variant: 'success', icon: CheckCircle, label: 'Concluído' },
      'failed': { variant: 'destructive', icon: AlertCircle, label: 'Falhou' },
      'cancelled': { variant: 'secondary', icon: X, label: 'Cancelado' }
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const totalCompleted = jobs.filter(j => j.status === 'completed').length
  const totalFailed = jobs.filter(j => j.status === 'failed').length
  const overallProgress = jobs.length > 0 
    ? Math.round((totalCompleted / jobs.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload em Lote de PPTX</CardTitle>
          <CardDescription>
            Arraste múltiplos arquivos PowerPoint ou clique para selecionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-primary font-medium">Solte os arquivos aqui...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Arraste arquivos PPTX aqui
                </p>
                <p className="text-sm text-gray-500">
                  ou clique para selecionar arquivos
                </p>
              </>
            )}
          </div>

          {/* Lista de arquivos */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-medium">Arquivos Selecionados ({files.length})</h3>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opções */}
      <Card>
        <CardHeader>
          <CardTitle>Opções de Processamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Narração Automática */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="narration">Gerar Narração Automática</Label>
              <p className="text-xs text-gray-500">
                Converte notas do slide em áudio TTS
              </p>
            </div>
            <Switch
              id="narration"
              checked={generateNarration}
              onCheckedChange={setGenerateNarration}
            />
          </div>

          {generateNarration && (
            <div className="space-y-4 ml-6 pl-4 border-l-2">
              <div>
                <Label>Provider TTS</Label>
                <Select value={narrationProvider} onValueChange={(v: any) => setNarrationProvider(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="azure">Azure (Microsoft)</SelectItem>
                    <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Voz</Label>
                <Select value={narrationVoice} onValueChange={setNarrationVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR-FranciscaNeural">Francisca (Feminina)</SelectItem>
                    <SelectItem value="pt-BR-AntonioNeural">Antonio (Masculino)</SelectItem>
                    <SelectItem value="pt-BR-BrendaNeural">Brenda (Feminina)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Análise de Qualidade */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quality">Análise de Qualidade</Label>
              <p className="text-xs text-gray-500">
                Detecta problemas de contraste, fontes, etc.
              </p>
            </div>
            <Switch
              id="quality"
              checked={analyzeQuality}
              onCheckedChange={setAnalyzeQuality}
            />
          </div>

          {/* Conversão de Animações */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Converter Animações</Label>
              <p className="text-xs text-gray-500">
                Preserva animações do PowerPoint
              </p>
            </div>
            <Switch
              id="animations"
              checked={convertAnimations}
              onCheckedChange={setConvertAnimations}
            />
          </div>

          {/* Concorrência */}
          <div>
            <Label>Arquivos Simultâneos: {maxConcurrent}</Label>
            <input
              type="range"
              min="1"
              max="5"
              value={maxConcurrent}
              onChange={(e) => setMaxConcurrent(parseInt(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Processar */}
      <Button
        onClick={handleProcess}
        disabled={files.length === 0 || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Processar {files.length} Arquivo(s)
          </>
        )}
      </Button>

      {/* Progresso Geral */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso</CardTitle>
            <CardDescription>
              {totalCompleted}/{jobs.length} concluídos
              {totalFailed > 0 && ` • ${totalFailed} falharam`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="mb-4" />
            
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{job.filename}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(job.fileSize)}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  {(job.status !== 'completed' && job.status !== 'failed' && job.status !== 'cancelled') && (
                    <>
                      <Progress value={job.progress} className="mb-2" />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">{job.progress}%</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelJob(job.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </>
                  )}

                  {job.status === 'completed' && job.result && (
                    <div className="mt-2 text-sm text-gray-600">
                      ✅ {job.result.slideCount} slides • {Math.round(job.result.duration/1000)}s
                      {job.result.narrationGenerated && ' • 🎙️ Narração gerada'}
                    </div>
                  )}

                  {job.status === 'failed' && job.error && (
                    <p className="mt-2 text-sm text-red-600">
                      ❌ {job.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
