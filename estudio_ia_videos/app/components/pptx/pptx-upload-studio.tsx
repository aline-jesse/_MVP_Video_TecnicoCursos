'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Play, 
  Clock, 
  User, 
  Calendar,
  Eye,
  Download
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PPTXSlide {
  id: string
  slideNumber: number
  title: string
  content: string
  duration: number
  transition: string
}

interface PPTXMetadata {
  title: string
  author: string
  slideCount: number
  createdAt: string
  modifiedAt: string
  fileSize: number
  theme: string
}

interface PPTXProcessResult {
  metadata: PPTXMetadata
  slides: PPTXSlide[]
  thumbnails: string[]
  totalSlides: number
  estimatedDuration: number
}

export default function PPTXUploadStudio() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processedData, setProcessedData] = useState<PPTXProcessResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pptx')) {
      toast.error('Apenas arquivos PPTX são aceitos')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setProcessedData(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/v1/pptx/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload')
      }

      if (result.success) {
        setProcessedData(result.data)
        toast.success(`Apresentação processada com sucesso! ${result.data.totalSlides} slides encontrados.`)
      } else {
        throw new Error(result.error || 'Erro no processamento')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    maxFiles: 1,
    disabled: isUploading
  })

  const handleCreateVideo = () => {
    if (processedData) {
      toast.success('Iniciando criação de vídeo...')
      // Implementar integração com pipeline de vídeo
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Estúdio PPTX para Vídeo</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Transforme suas apresentações em vídeos profissionais com IA
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload de Apresentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
            `}
          >
            <input {...getInputProps()} />
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            
            {isUploading ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Processando apresentação...</h3>
                <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-gray-500">{uploadProgress}% concluído</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste seu arquivo PPTX aqui'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Ou clique para selecionar um arquivo (máximo 100MB)
                </p>
                <Button disabled={isUploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Arquivo
                </Button>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Data Display */}
      {processedData && (
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Informações da Apresentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="mr-1 h-4 w-4" />
                    Título
                  </div>
                  <p className="font-medium">{processedData.metadata.title}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="mr-1 h-4 w-4" />
                    Autor
                  </div>
                  <p className="font-medium">{processedData.metadata.author}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-4 w-4" />
                    Modificado
                  </div>
                  <p className="font-medium">
                    {new Date(processedData.metadata.modifiedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-4 w-4" />
                    Duração Estimada
                  </div>
                  <p className="font-medium">{formatDuration(processedData.estimatedDuration)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">
                    {processedData.totalSlides} slides
                  </Badge>
                  <Badge variant="outline">
                    {formatFileSize(processedData.metadata.fileSize)}
                  </Badge>
                  <Badge variant="outline">
                    {processedData.metadata.theme}
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button onClick={handleCreateVideo} size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Criar Vídeo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slides Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Slides da Apresentação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {processedData.slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm truncate" title={slide.title}>
                        {slide.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {slide.content || 'Sem conteúdo detectado'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Slide {slide.slideNumber}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {slide.duration}s
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}