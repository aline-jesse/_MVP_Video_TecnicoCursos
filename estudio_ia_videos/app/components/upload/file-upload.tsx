/**
 * 📤 Componente de Upload de Arquivos
 * Interface drag-and-drop com preview e progresso
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useUpload, UploadFile } from '@/hooks/use-upload'
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  projectId?: string
  fileType?: 'presentation' | 'image' | 'video' | 'audio'
  maxFiles?: number
  maxSize?: number // em MB
  accept?: string
  onUploadComplete?: (files: UploadFile[]) => void
  onUploadError?: (error: string) => void
}

export default function FileUpload({
  projectId,
  fileType,
  maxFiles = 5,
  maxSize = 100,
  accept,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { uploadFile, uploading, progress, error } = useUpload()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    // Validar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Arquivo ${file.name} excede ${maxSize}MB`
    }

    // Validar tipo se especificado
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const fileExtension = `.${file.name.split('.').pop()}`
      const isAccepted = acceptedTypes.some(
        type => type === file.type || type === fileExtension
      )
      if (!isAccepted) {
        return `Tipo de arquivo ${file.name} não aceito`
      }
    }

    return null
  }, [maxSize, accept])

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files)
    
    // Validar quantidade
    if (selectedFiles.length + fileArray.length > maxFiles) {
      const error = `Máximo de ${maxFiles} arquivos permitidos`
      onUploadError?.(error)
      return
    }

    // Validar cada arquivo
    const validFiles: File[] = []
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        onUploadError?.(validationError)
        continue
      }
      validFiles.push(file)
    }

    setSelectedFiles(prev => [...prev, ...validFiles])
  }, [selectedFiles.length, maxFiles, validateFile, onUploadError])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return

    const uploaded: UploadFile[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      setUploadingIndex(i)
      
      const file = await uploadFile(selectedFiles[i], {
        projectId,
        type: fileType,
      })

      if (file) {
        uploaded.push(file)
      }
    }

    setUploadingIndex(null)
    setUploadedFiles(prev => [...prev, ...uploaded])
    setSelectedFiles([])
    onUploadComplete?.(uploaded)
  }, [selectedFiles, uploadFile, projectId, fileType, onUploadComplete])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8" />
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8" />
    if (file.type.includes('presentation')) return <FileText className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Arquivos</CardTitle>
        <CardDescription>
          Arraste e solte ou clique para selecionar arquivos (máx. {maxFiles} arquivos, {maxSize}MB cada)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-gray-300",
            uploading && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept={accept}
            onChange={handleChange}
            disabled={uploading}
          />

          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          
          <p className="text-lg font-medium mb-2">
            {dragActive ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos'}
          </p>
          
          <p className="text-sm text-muted-foreground">
            {accept ? `Aceita: ${accept}` : 'Todos os tipos aceitos'}
          </p>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos selecionados ({selectedFiles.length})</h4>
            
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="text-muted-foreground">
                  {getFileIcon(file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {uploadingIndex === index ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progress && (
                      <span className="text-sm">{progress.percentage}%</span>
                    )}
                  </div>
                ) : uploadingIndex !== null ? (
                  <Badge variant="secondary">Aguardando</Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {/* Progress Bar */}
            {uploading && progress && (
              <div className="space-y-2">
                <Progress value={progress.percentage} />
                <p className="text-sm text-center text-muted-foreground">
                  {formatFileSize(progress.loaded)} de {formatFileSize(progress.total)}
                </p>
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <Button
                onClick={handleUpload}
                className="w-full"
                disabled={selectedFiles.length === 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                Enviar {selectedFiles.length} arquivo{selectedFiles.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Arquivos enviados ({uploadedFiles.length})</h4>
            
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-green-50"
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <Badge variant="outline" className="bg-white">
                  Concluído
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
