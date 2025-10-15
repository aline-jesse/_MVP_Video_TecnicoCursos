
'use client'

/**
 * 🧪 Página de Teste PPTX Upload & Processing
 * Testa o fluxo completo: Upload S3 → Processing → Timeline
 */

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EnhancedPPTXUpload } from '@/components/pptx/enhanced-pptx-upload'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TestTube, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function TestPPTXPage() {
  const handleUploadComplete = (result: any) => {
    console.log('🎉 Upload Completo:', result)
    toast.success(`✅ Processamento concluído! ${result.slides} slides processados`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Teste PPTX Upload & Processing
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Teste o fluxo completo: Upload S3 → Processing → Timeline Generation
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">S3 Upload</p>
                  <p className="text-sm text-green-600">AWS Configurado ✅</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">PPTX Parser</p>
                  <p className="text-sm text-green-600">Enhanced Parser ✅</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">APIs</p>
                  <p className="text-sm text-green-600">200+ Endpoints ✅</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Component */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-6 w-6 text-blue-600" />
              Teste de Upload PPTX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedPPTXUpload 
              onProcessComplete={handleUploadComplete}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">📝 Como testar:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Selecione um arquivo PPTX (máximo 100MB)</li>
              <li>Aguarde o upload para S3</li>
              <li>Processamento automático será executado</li>
              <li>Verifique os logs no console do navegador</li>
              <li>Toast de sucesso aparecerá quando completo</li>
            </ol>
            
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800">
                <strong>💡 Dica:</strong> Abra o Console do Navegador (F12) para ver os logs detalhados do processamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
