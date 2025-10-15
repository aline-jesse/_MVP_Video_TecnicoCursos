/**
 * Página de Demonstração - Upload PPTX
 * Demonstra a funcionalidade completa do parser e upload PPTX
 */

'use client'

import React, { useState } from 'react'
import PPTXUploader from '../components/pptx/PPTXUploader'
import { FileText, Image, Clock, User, Calendar, Layers } from 'lucide-react'

interface UploadResult {
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

export default function PPTXDemoPage() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadStart = () => {
    setIsUploading(true)
    setUploadResult(null)
  }

  const handleUploadComplete = (result: UploadResult) => {
    setIsUploading(false)
    setUploadResult(result)
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demonstração - Parser PPTX
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Teste nossa implementação funcional de processamento de arquivos PowerPoint. 
            Faça upload de um arquivo PPTX e veja a extração completa de conteúdo, 
            imagens, metadados e estrutura.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <FileText className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Extração de Texto</h3>
            <p className="text-gray-600 text-sm">
              Extrai títulos, conteúdo e notas do apresentador de todos os slides
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <Image className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Processamento de Imagens</h3>
            <p className="text-gray-600 text-sm">
              Extrai e processa todas as imagens com metadados de posição e tamanho
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <Layers className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Estrutura Completa</h3>
            <p className="text-gray-600 text-sm">
              Preserva layouts, animações e hierarquia de elementos
            </p>
          </div>
        </div>

        {/* Upload Component */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Faça Upload do seu PPTX
          </h2>
          
          <PPTXUploader
            onUploadStart={handleUploadStart}
            onUploadComplete={handleUploadComplete}
            maxFileSize={50}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Results Display */}
        {uploadResult && uploadResult.success && uploadResult.data && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Resultado do Processamento
            </h2>

            {/* Metadata Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Metadados do Arquivo
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {uploadResult.data.metadata.title}
                    </p>
                    <p className="text-sm text-gray-600">Título da Apresentação</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {uploadResult.data.metadata.author}
                    </p>
                    <p className="text-sm text-gray-600">Autor</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Layers className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {uploadResult.data.slideCount} slides
                    </p>
                    <p className="text-sm text-gray-600">Total de Slides</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Image className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {uploadResult.data.totalImages} imagens
                    </p>
                    <p className="text-sm text-gray-600">Total de Imagens</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(uploadResult.data.metadata.created)}
                    </p>
                    <p className="text-sm text-gray-600">Data de Criação</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(uploadResult.data.metadata.modified)}
                    </p>
                    <p className="text-sm text-gray-600">Última Modificação</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Slides Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview dos Slides
              </h3>
              
              <div className="grid gap-4">
                {uploadResult.data.slides.map((slide, index) => (
                  <div 
                    key={slide.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                          Slide {index + 1}
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {slide.title || `Slide ${index + 1}`}
                        </h4>
                      </div>
                      
                      <div className="flex space-x-2">
                        {slide.imageCount > 0 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {slide.imageCount} img
                          </span>
                        )}
                        {slide.hasNotes && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Notas
                          </span>
                        )}
                        {slide.hasAnimations && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            Animações
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {slide.contentPreview.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Conteúdo:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {slide.contentPreview.map((content, i) => (
                            <li key={i} className="truncate">
                              {content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Project ID */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID do Projeto:</span> {uploadResult.data.projectId}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Use este ID para acessar o projeto processado via API
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {uploadResult && !uploadResult.success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Erro no Processamento
            </h3>
            <p className="text-red-700 mb-2">{uploadResult.message}</p>
            {uploadResult.error && (
              <p className="text-sm text-red-600">
                Detalhes: {uploadResult.error}
              </p>
            )}
          </div>
        )}

        {/* Technical Info */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Técnicas
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recursos Implementados:</h4>
              <ul className="space-y-1">
                <li>• Parser XML completo com fast-xml-parser</li>
                <li>• Extração de texto e formatação</li>
                <li>• Processamento de imagens embarcadas</li>
                <li>• Detecção de animações e transições</li>
                <li>• Extração de notas do apresentador</li>
                <li>• Validação de estrutura PPTX</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tecnologias Utilizadas:</h4>
              <ul className="space-y-1">
                <li>• JSZip para manipulação de arquivos ZIP</li>
                <li>• fast-xml-parser para parsing XML</li>
                <li>• TypeScript para tipagem forte</li>
                <li>• Jest para testes automatizados</li>
                <li>• React + Next.js para interface</li>
                <li>• Tailwind CSS para estilização</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}