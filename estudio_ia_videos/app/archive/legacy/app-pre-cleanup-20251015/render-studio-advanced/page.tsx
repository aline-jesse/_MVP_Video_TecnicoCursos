

'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import AdvancedRenderStudio from '../../components/render/advanced-render-studio'
import { AlertCircle, Video, Sparkles } from 'lucide-react'

export default function RenderStudioAdvancedPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Video className="w-12 h-12 animate-pulse text-purple-600 mx-auto" />
          <p className="text-muted-foreground">Carregando Render Studio...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Faça login para acessar o Advanced Render Studio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                O Render Studio Avançado oferece renderização profissional com IA, 
                avatares 3D ultra-realistas e pipeline otimizado para produção.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Video className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Advanced Render Studio</h1>
              <Sparkles className="w-12 h-12" />
            </div>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Sistema profissional de renderização de vídeos com IA avançada, 
              avatares 3D ultra-realistas e pipeline otimizado para produção em escala
            </p>
            
            {/* Features highlight */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">4K</div>
                <div className="text-sm text-purple-200">Resolução Máxima</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">60fps</div>
                <div className="text-sm text-purple-200">Taxa de Quadros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">HDR</div>
                <div className="text-sm text-purple-200">Suporte Avançado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">GPU</div>
                <div className="text-sm text-purple-200">Aceleração</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Interface */}
      <AdvancedRenderStudio />
    </div>
  )
}

