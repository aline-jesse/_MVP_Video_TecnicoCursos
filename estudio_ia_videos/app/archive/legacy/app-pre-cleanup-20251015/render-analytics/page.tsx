

'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import RenderAnalytics from '../../components/render/render-analytics'
import RealTimeMonitor from '../../components/render/real-time-monitor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { AlertCircle, BarChart3, Activity, TrendingUp } from 'lucide-react'

export default function RenderAnalyticsPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <BarChart3 className="w-12 h-12 animate-pulse text-blue-600 mx-auto" />
          <p className="text-muted-foreground">Carregando Analytics...</p>
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
              Faça login para acessar o Render Analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                O Render Analytics oferece insights detalhados sobre performance, 
                custos e otimizações do sistema de renderização.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <BarChart3 className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Render Analytics</h1>
              <TrendingUp className="w-12 h-12" />
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Dashboard avançado de analytics para monitoramento de performance, 
              custos e otimização do sistema de renderização
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Tempo Real
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics Detalhado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime">
            <RealTimeMonitor />
          </TabsContent>

          <TabsContent value="analytics">
            <RenderAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

