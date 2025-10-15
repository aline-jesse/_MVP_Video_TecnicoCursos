
/**
 * 🔗 Estúdio IA de Vídeos - Sprint 10
 * Página de Integrações Enterprise
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Webhook,
  Database,
  Users,
  Shield,
  BookOpen,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  Link,
  Zap,
  Code,
  Key,
  Cloud,
  Monitor,
  PlayCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Integration, Webhook as WebhookType, ApiKey } from '@/types/sprint10';

export default function IntegrationsPage() {
  const [selectedTab, setSelectedTab] = useState('integrations');
  const [activeIntegrations, setActiveIntegrations] = useState<{id: string, lastSync: Date}[]>([]);
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    loadIntegrations();
    loadWebhooks();
    loadApiKeys();
  }, []);

  const loadIntegrations = () => {
    setAvailableIntegrations([
      {
        id: 'moodle',
        name: 'Moodle LMS',
        description: 'Sistema de gestão de aprendizagem',
        category: 'LMS',
        icon: BookOpen,
        status: 'connected',
        features: ['Sync de usuários', 'Import de cursos', 'Relatórios', 'SSO'],
        color: 'bg-green-500'
      }
    ]);

    setActiveIntegrations([
      { id: 'moodle', lastSync: new Date(Date.now() - 3600000) }
    ]);
  };

  const loadWebhooks = () => {
    setWebhooks([
      {
        id: 'webhook-1',
        name: 'User Registration',
        url: 'https://api.company.com/webhooks/user-registered',
        events: ['user.created', 'user.updated'],
        status: 'active',
        lastTriggered: new Date(Date.now() - 120000),
        successRate: 98.5
      }
    ]);
  };

  const loadApiKeys = () => {
    setApiKeys([
      {
        id: 'api-1',
        name: 'Production API',
        key: 'sk_prod_************************************',
        permissions: ['read', 'write', 'admin'],
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date(Date.now() - 1800000),
        requestCount: 15847
      }
    ]);
  };

  const toggleIntegration = (integrationId: string) => {
    const integration = availableIntegrations.find(i => i.id === integrationId);
    const isActive = activeIntegrations.some(a => a.id === integrationId);

    if (isActive) {
      setActiveIntegrations(prev => prev.filter(a => a.id !== integrationId));
      toast.success(`${integration?.name} desconectado`);
    } else {
      setActiveIntegrations(prev => [...prev, { id: integrationId, lastSync: new Date() }]);
      toast.success(`${integration?.name} conectado com sucesso!`);
    }
  };

  const testWebhook = (webhookId: string) => {
    toast.success('Webhook testado com sucesso!');
  };

  const regenerateApiKey = (apiId: string) => {
    toast.success('Nova chave API gerada!');
  };

  const openIntegrationsSettings = () => {
    toast.success('Abrindo configurações de integrações...');
    // Simular abertura de modal/página de configurações
  };

  const openApiKeysManager = () => {
    toast.success('Abrindo gerenciador de chaves API...');
    // Simular abertura de modal/página de gerenciamento
  };

  const createWebhook = () => {
    const webhookName = prompt('Nome do novo webhook:');
    if (webhookName) {
      const newWebhook: WebhookType = {
        id: `webhook-${Date.now()}`,
        name: webhookName,
        url: 'https://api.example.com/webhook',
        events: ['user.created'],
        status: 'active',
        lastTriggered: new Date(),
        successRate: 100
      };
      setWebhooks([...webhooks, newWebhook]);
      toast.success(`Webhook "${webhookName}" criado com sucesso!`);
    }
  };

  const createApiKey = () => {
    const keyName = prompt('Nome da nova chave API:');
    if (keyName) {
      const newApiKey: ApiKey = {
        id: `api-${Date.now()}`,
        name: keyName,
        key: `sk_prod_${'*'.repeat(32)}`,
        permissions: ['read'],
        createdAt: new Date(),
        lastUsed: new Date(),
        requestCount: 0
      };
      setApiKeys([...apiKeys, newApiKey]);
      toast.success(`Chave API "${keyName}" criada com sucesso!`);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'bg-green-100 text-green-800',
      available: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || variants.available;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Link className="h-8 w-8 text-cyan-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Integrações Enterprise
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conecte com sistemas LMS, RH, BI e mais para uma experiência unificada
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations" onClick={() => setSelectedTab('integrations')}>Integrações</TabsTrigger>
            <TabsTrigger value="webhooks" onClick={() => setSelectedTab('webhooks')}>Webhooks</TabsTrigger>
            <TabsTrigger value="api-keys" onClick={() => setSelectedTab('api-keys')}>API Keys</TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableIntegrations.map((integration) => {
                const IconComponent = integration.icon;
                const isConnected = activeIntegrations.some(a => a.id === integration.id);
                const activeIntegration = activeIntegrations.find(a => a.id === integration.id);

                return (
                  <Card key={integration.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${integration.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <p className="text-sm text-gray-600">{integration.description}</p>
                          </div>
                        </div>
                        <Badge className={getStatusBadge(integration.status)}>
                          {isConnected ? 'Conectado' : 'Disponível'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Recursos:</h4>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {isConnected && activeIntegration && (
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>Última sync: {activeIntegration.lastSync.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => toggleIntegration(integration.id)}
                          variant={isConnected ? "destructive" : "default"}
                          size="sm"
                          className="flex-1"
                        >
                          {isConnected ? 'Desconectar' : 'Conectar'}
                        </Button>
                        {isConnected && (
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Webhooks Configurados</h3>
              <Button onClick={createWebhook}>
                <Webhook className="h-4 w-4 mr-2" />
                Novo Webhook
              </Button>
            </div>

            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Webhook className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{webhook.name}</h4>
                          <p className="text-sm text-gray-600">{webhook.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusBadge(webhook.status)}>
                          {webhook.status}
                        </Badge>
                        <Switch 
                          checked={webhook.status === 'active'}
                          onCheckedChange={() => {}} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Eventos:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {webhook.events.map((event, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Taxa de Sucesso:</p>
                        <p className="text-lg font-bold text-green-600">{webhook.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Último Trigger:</p>
                        <p className="text-sm text-gray-600">
                          {webhook.lastTriggered.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => testWebhook(webhook.id)}
                        variant="outline" 
                        size="sm"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Testar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Code className="h-4 w-4 mr-2" />
                        Logs
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Chaves de API</h3>
              <Button onClick={createApiKey}>
                <Key className="h-4 w-4 mr-2" />
                Nova Chave
              </Button>
            </div>

            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Key className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-semibold">{apiKey.name}</h4>
                          <p className="text-sm text-gray-600 font-mono">{apiKey.key}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {apiKey.requestCount.toLocaleString()} requests
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Permissões:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apiKey.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Criada em:</p>
                        <p className="text-sm text-gray-600">
                          {apiKey.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Último Uso:</p>
                        <p className="text-sm text-gray-600">
                          {apiKey.lastUsed.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => regenerateApiKey(apiKey.id)}
                        variant="outline" 
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerar
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Estatísticas de Integração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activeIntegrations.length}
                </div>
                <p className="text-sm text-gray-600">Integrações Ativas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {webhooks.filter(w => w.status === 'active').length}
                </div>
                <p className="text-sm text-gray-600">Webhooks Ativos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {apiKeys.reduce((sum, key) => sum + key.requestCount, 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">API Calls Total</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  98.7%
                </div>
                <p className="text-sm text-gray-600">Uptime Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
