
/**
 * 📁 Página de Upload PPTX para Editor Animaker
 * Interface dedicada para processamento avançado de PPTX
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Sparkles, Upload, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimakerPPTXUploader } from '@/components/upload/animaker-pptx-uploader'
import { AnimakerProject } from '@/lib/pptx-parser-animaker'

export default function PPTXUploadAnimaker() {
  const router = useRouter()

  const handleProjectCreated = (project: AnimakerProject) => {
    console.log('Projeto criado:', project)
    // Redirecionamento será feito pelo próprio uploader
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Upload PPTX Avançado
                </h1>
                <p className="text-sm text-gray-600">
                  Parser com extração de elementos interativos para editor Animaker
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-100 text-purple-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Editor Animaker
              </Badge>
              <Badge variant="outline">
                Parsing Real
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Info */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">
                  Parser Avançado
                </h3>
                <p className="text-sm text-purple-700">
                  Extração completa de textos, imagens, posicionamento e animações do PPTX
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Editor Interativo
                </h3>
                <p className="text-sm text-blue-700">
                  Canvas com elementos editáveis: drag, resize, rotate em tempo real
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-900 mb-2">
                  Timeline Multicamadas
                </h3>
                <p className="text-sm text-green-700">
                  Layers independentes com keyframes e controles profissionais
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upload Component */}
        <AnimakerPPTXUploader 
          onProjectCreated={handleProjectCreated}
          onCancel={handleCancel}
        />

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Como funciona o Editor Animaker?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
                  <span>Upload do PPTX com parsing avançado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">2</div>
                  <span>Elementos ficam editáveis no canvas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">3</div>
                  <span>Timeline com layers e keyframes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">4</div>
                  <span>Export em MP4 com renderização real</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
