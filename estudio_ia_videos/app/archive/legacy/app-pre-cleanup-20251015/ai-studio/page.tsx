'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Wand2, FileText, MessageSquare, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState('generative')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/app/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Studio</h1>
                <p className="text-sm text-gray-600">Ferramentas de IA consolidadas</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-50">
            <Sparkles className="h-3 w-3 mr-1" />Powered by AI
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Módulo Consolidado:</strong> Todas as ferramentas de IA em um só lugar.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generative"><Sparkles className="h-4 w-4 mr-2" />Generativa</TabsTrigger>
            <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-2" />Templates</TabsTrigger>
            <TabsTrigger value="assistant"><MessageSquare className="h-4 w-4 mr-2" />Assistente</TabsTrigger>
            <TabsTrigger value="content"><Wand2 className="h-4 w-4 mr-2" />Conteúdo</TabsTrigger>
          </TabsList>

          <TabsContent value="generative" className="mt-6">
            <Card>
              <CardHeader><CardTitle>IA Generativa</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600">Geração de conteúdo com IA em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Templates IA</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600">Templates inteligentes em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assistant" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Assistente IA</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600">Assistente virtual em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Geração de Conteúdo</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600">Criação automática de conteúdo em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
