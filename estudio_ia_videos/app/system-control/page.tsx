'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Activity, 
  CheckCircle, 
  Monitor,
  Database,
  Cpu,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import SystemHealthMonitor from '@/components/system/SystemHealthMonitor';
import FunctionalValidator from '@/components/system/FunctionalValidator';

export default function SystemControlPage() {
  const [activeTab, setActiveTab] = useState('health');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔧 Controle do Sistema
          </h1>
          <p className="text-xl text-gray-600">
            Monitoramento e validação em tempo real das funcionalidades do sistema
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
              <Activity className="h-4 w-4 ml-auto text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Saudável</div>
              <p className="text-xs text-muted-foreground">
                Todos os sistemas operacionais
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Componentes</CardTitle>
              <Database className="h-4 w-4 ml-auto text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">6/6</div>
              <p className="text-xs text-muted-foreground">
                Serviços online
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Cpu className="h-4 w-4 ml-auto text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">Ótima</div>
              <p className="text-xs text-muted-foreground">
                CPU: 23% | RAM: 41%
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Testes</CardTitle>
              <CheckCircle className="h-4 w-4 ml-auto text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">100%</div>
              <p className="text-xs text-muted-foreground">
                Funcionalidades validadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-6 w-6 text-blue-600" />
              <span>Painel de Controle do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="health" className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Monitoramento</span>
                </TabsTrigger>
                <TabsTrigger value="validation" className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Validação</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="health" className="mt-6">
                <SystemHealthMonitor />
              </TabsContent>

              <TabsContent value="validation" className="mt-6">
                <FunctionalValidator />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-4">
                            <h3 className="font-semibold mb-2">Monitoramento Automático</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Atualização automática das métricas do sistema
                            </p>
                            <Button size="sm" variant="outline">
                              Configurar Intervalos
                            </Button>
                          </Card>
                          
                          <Card className="p-4">
                            <h3 className="font-semibold mb-2">Alertas</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Configurar notificações para problemas críticos
                            </p>
                            <Button size="sm" variant="outline">
                              Gerenciar Alertas
                            </Button>
                          </Card>
                          
                          <Card className="p-4">
                            <h3 className="font-semibold mb-2">Logs do Sistema</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Visualizar e gerenciar logs de sistema
                            </p>
                            <Button size="sm" variant="outline">
                              Ver Logs
                            </Button>
                          </Card>
                          
                          <Card className="p-4">
                            <h3 className="font-semibold mb-2">Backup</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Configurar backup automático dos dados
                            </p>
                            <Button size="sm" variant="outline">
                              Configurar Backup
                            </Button>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}