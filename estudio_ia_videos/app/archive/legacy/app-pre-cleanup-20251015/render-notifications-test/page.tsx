/**
 * 🧪 Página de Teste - Sistema de Notificações de Render
 * Demonstra o funcionamento completo do sistema de notificações
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RenderNotifications } from '@/src/components/RenderNotifications';
import { RenderNotificationTest } from '@/src/components/RenderNotificationTest';
import { Bell, Zap, CheckCircle, AlertCircle, Clock, Wifi } from 'lucide-react';

export default function RenderNotificationsTestPage() {
  // Simular um usuário logado para teste
  const testUserId = 'test-user-123';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Sistema de Notificações de Render
          </h1>
          <p className="text-gray-600">
            Teste completo do sistema de notificações em tempo real
          </p>
          <Badge variant="outline" className="text-sm">
            Versão de Teste
          </Badge>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Wifi className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Conexão SSE</h3>
              <p className="text-xs text-gray-500">Server-Sent Events</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">API Endpoints</h3>
              <p className="text-xs text-gray-500">Notificações & Eventos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Supabase RLS</h3>
              <p className="text-xs text-gray-500">Políticas de Segurança</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Tempo Real</h3>
              <p className="text-xs text-gray-500">Atualizações Instantâneas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Componente de Notificações */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Componente de Notificações
                </CardTitle>
                <CardDescription>
                  Componente integrado que aparece no header da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center p-8 bg-gray-50 rounded-lg">
                  <RenderNotifications 
                    userId={testUserId}
                    className="scale-110"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Funcionalidades:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Conexão SSE em tempo real</li>
                    <li>Lista de jobs ativos</li>
                    <li>Indicador de status de conexão</li>
                    <li>Notificações toast automáticas</li>
                    <li>Progresso visual dos renders</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Teste */}
          <div>
            <RenderNotificationTest userId={testUserId} />
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Endpoints da API</CardTitle>
              <CardDescription>
                Rotas implementadas para o sistema de notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono text-blue-600">
                  POST /api/render/notifications
                </code>
                <p className="text-xs text-gray-600 mt-1">
                  Atualizar status de job e enviar notificação
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono text-green-600">
                  GET /api/render/events
                </code>
                <p className="text-xs text-gray-600 mt-1">
                  Stream SSE para notificações em tempo real
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono text-purple-600">
                  GET /api/render/notifications
                </code>
                <p className="text-xs text-gray-600 mt-1">
                  Listar jobs ativos do usuário
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fluxo de Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fluxo de Dados</CardTitle>
              <CardDescription>
                Como as notificações fluem pelo sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Job criado na fila</p>
                  <p className="text-xs text-gray-500">BullMQ + Redis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Status salvo no Supabase</p>
                  <p className="text-xs text-gray-500">Tabela render_jobs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Notificação enviada via SSE</p>
                  <p className="text-xs text-gray-500">EventSource API</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium">UI atualizada em tempo real</p>
                  <p className="text-xs text-gray-500">React hooks + toast</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como Testar</CardTitle>
            <CardDescription>
              Instruções para testar o sistema de notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-2">1. Job Simples</h4>
                <p className="text-sm text-blue-700">
                  Clique em "Criar Job Simples" para criar uma notificação básica que aparecerá instantaneamente.
                </p>
              </div>
              
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-900 mb-2">2. Simular Progresso</h4>
                <p className="text-sm text-green-700">
                  Use "Simular Progresso" para ver uma barra de progresso em tempo real de 0% a 100%.
                </p>
              </div>
              
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-semibold text-red-900 mb-2">3. Simular Erro</h4>
                <p className="text-sm text-red-700">
                  Teste "Simular Erro" para ver como erros são tratados e exibidos ao usuário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}