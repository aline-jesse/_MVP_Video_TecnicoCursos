

'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import RenderNavigation from '../../components/navigation/render-navigation'
import { AlertCircle, Video } from 'lucide-react'

export default function RenderSystemPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Video className="w-12 h-12 animate-pulse text-purple-600 mx-auto" />
          <p className="text-muted-foreground">Carregando Sistema de Renderização...</p>
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
              Faça login para acessar o Sistema de Renderização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Video className="h-4 w-4" />
              <AlertDescription>
                O Sistema de Renderização oferece diferentes níveis de recursos,
                desde MVP básico até sistema profissional avançado com IA.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <RenderNavigation />
      </div>
    </div>
  )
}

