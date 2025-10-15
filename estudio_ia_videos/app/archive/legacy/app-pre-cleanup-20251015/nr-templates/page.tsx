'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, FileText, CheckCircle, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function NRTemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/app/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Templates NR</h1>
                <p className="text-sm text-gray-600">Normas Regulamentadoras consolidadas</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />Compliance
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Módulo Consolidado:</strong> Todos os templates de NR em um só lugar.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-2" />Templates</TabsTrigger>
            <TabsTrigger value="compliance"><Shield className="h-4 w-4 mr-2" />Compliance</TabsTrigger>
            <TabsTrigger value="automation"><CheckCircle className="h-4 w-4 mr-2" />Automação</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Biblioteca de Templates NR</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['NR-12', 'NR-33', 'NR-35'].map((nr) => (
                    <Card key={nr} className="border-2">
                      <CardContent className="pt-6">
                        <h3 className="font-bold text-lg mb-2">{nr}</h3>
                        <p className="text-sm text-gray-600 mb-4">Templates prontos para uso</p>
                        <Button size="sm" className="w-full">Acessar</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Verificação de Compliance</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600">Sistema de verificação em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Automação de NR</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-600">Automação inteligente em desenvolvimento</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
