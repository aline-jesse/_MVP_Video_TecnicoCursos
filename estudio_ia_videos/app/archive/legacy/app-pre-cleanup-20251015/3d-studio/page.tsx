'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Box, Sparkles, Eye, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function Studio3DPage() {
  const [activeTab, setActiveTab] = useState('environments')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/app/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Box className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">3D Studio</h1>
                <p className="text-sm text-gray-600">Ambientes 3D consolidados</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            <Box className="h-3 w-3 mr-1" />3D
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Módulo Consolidado:</strong> Todas as ferramentas 3D em um só lugar.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="environments"><Box className="h-4 w-4 mr-2" />Ambientes</TabsTrigger>
            <TabsTrigger value="advanced"><Sparkles className="h-4 w-4 mr-2" />Avançado</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-2" />Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="environments" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Ambientes 3D</CardTitle></CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Box className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    <p className="text-lg font-medium">Visualização 3D</p>
                    <p className="text-sm text-gray-600">Ambientes 3D em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Recursos Avançados 3D</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600">Ferramentas avançadas em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Preview 3D</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600">Sistema de preview em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
