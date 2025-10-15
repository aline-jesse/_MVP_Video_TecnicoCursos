/**
 * Componente de Upload PPTX - Implementação Funcional Completa
 * Interface moderna e responsiva para upload e processamento de arquivos PPTX
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, FileText, Image, Clock, CheckCircle, AlertCircle, X } from 'lucide-react'

interface PPTXUploadResult {
  success: boolean
  message: string
  data?: {
    projectId: string
    metadata: {
      title: string
      author: string
      slideCount: number
      created: Date
      modified: Date
    }
    slideCount: number
    totalImages: number
    slides: Array<{
      id: string
      title: string
      contentPreview: string[]
      imageCount: number
      hasNotes: boolean
      hasAnimations: boolean
    }>
  }
  error?: string
}

interface PPTXUploaderProps {
  onUploadComplete?: (result: PPTXUploadResult) => void
  onUploadStart?: () => void
  maxFileSize?: number // em MB
  className?: string
}

export default function PPTXUploader({
  onUploadComplete,
  onUploadStart,
  maxFileSize = 50,
  className = ''
}: PPTXUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<PPTXUploadResult | null>(null)
  const [projectName, setProjectName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    // Verificar extensão
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return 'Apenas arquivos PPTX são aceitos'
    }

    // Verificar tamanho
    const maxSizeBytes = maxFileSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande. Máximo permitido: ${maxFileSize}MB`
    }

    return null
  }, [maxFileSize])

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      setUploadResult({
        success: false,
        message: error,
        error
      })
      return
    }

    setSelectedFile(file)
    setUploadResult(null)
    
    // Auto-gerar nome do projeto baseado no arquivo
    if (!projectName) {
      const name = file.name.replace('.pptx', '').replace(/[_-]/g, ' ')
      setProjectName(name)
    }
  }, [validateFile, projectName])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const uploadFile = useCallback(async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    onUploadStart?.()

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (projectName.trim()) {
        formData.append('projectName', projectName.trim())
      }

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const response = await fetch('/api/pptx/test', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result: PPTXUploadResult = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload')
      }

      setUploadResult(result)
      onUploadComplete?.(result)

      // Limpar formulário após sucesso
      setTimeout(() => {
        setSelectedFile(null)
        setProjectName('')
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 2000)

    } catch (error) {
      const errorResult: PPTXUploadResult = {
        success: false,
        message: 'Erro ao fazer upload do arquivo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
      setUploadResult(errorResult)
      onUploadComplete?.(errorResult)
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, projectName, onUploadStart, onUploadComplete])

  const clearSelection = useCallback(() => {
    setSelectedFile(null)
    setProjectName('')
    setUploadResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <Clock className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
            <div>
              <p className="text-lg font-medium text-gray-700">Processando PPTX...</p>
              <p className="text-sm text-gray-500">Extraindo slides, imagens e metadados</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{Math.round(uploadProgress)}% concluído</p>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <div>
              <p className="text-lg font-medium text-gray-700">Arquivo Selecionado</p>
              <p className="text-sm text-gray-600">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearSelection()
              }}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Arraste um arquivo PPTX aqui
              </p>
              <p className="text-sm text-gray-500">
                ou clique para selecionar
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Máximo {maxFileSize}MB • Apenas arquivos .pptx
            </p>
          </div>
        )}
      </div>

      {/* Campo Nome do Projeto */}
      {selectedFile && !isUploading && (
        <div className="mt-4 space-y-2">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
            Nome do Projeto (opcional)
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Digite um nome para o projeto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Botão de Upload */}
      {selectedFile && !isUploading && (
        <button
          onClick={uploadFile}
          className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Processar PPTX
        </button>
      )}

      {/* Resultado do Upload */}
      {uploadResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploadResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {uploadResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${
                uploadResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadResult.message}
              </p>
              
              {uploadResult.success && uploadResult.data && (
                <div className="mt-3 space-y-2 text-sm text-green-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{uploadResult.data.slideCount} slides</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Image className="w-4 h-4" />
                      <span>{uploadResult.data.totalImages} imagens</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <p className="font-medium">{uploadResult.data.metadata.title}</p>
                    <p className="text-xs text-green-600">
                      por {uploadResult.data.metadata.author}
                    </p>
                  </div>
                </div>
              )}

              {!uploadResult.success && uploadResult.error && (
                <p className="mt-1 text-sm text-red-600">
                  {uploadResult.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Informações de Recursos */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Recursos Suportados:
        </h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Extração automática de texto e títulos</li>
          <li>• Preservação de imagens e layouts</li>
          <li>• Detecção de notas do apresentador</li>
          <li>• Identificação de animações</li>
          <li>• Metadados completos do arquivo</li>
        </ul>
      </div>
    </div>
  )
}