
/**
 * 📱 PÁGINA OFFLINE
 * Página exibida quando o usuário está offline
 */

'use client';

import React from 'react';
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  FileText, 
  Settings, 
  Clock,
  CheckCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useOfflineStatus, offlineManager } from '@/lib/error-handling/offline-support';

export default function OfflinePage() {
  const { isOffline, isOnline } = useOfflineStatus();
  const [lastSync, setLastSync] = React.useState<Date | null>(null);
  const [cachedProjects, setCachedProjects] = React.useState<any[]>([]);
  const [queuedActions, setQueuedActions] = React.useState(0);

  React.useEffect(() => {
    // Carregar dados em cache
    const projects = offlineManager.getCachedData('projects');
    setCachedProjects(Array.isArray(projects) ? projects.slice(0, 5) : []);

    // Simular dados de sync
    const lastSyncData = offlineManager.getCachedData('lastSync');
    if (lastSyncData) {
      setLastSync(new Date(lastSyncData));
    }

    // Atualizar status periodicamente
    const interval = setInterval(() => {
      // Simulação - em implementação real, consultar o manager
      setQueuedActions(Math.floor(Math.random() * 5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} minutos atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} horas atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dias atrás`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <WifiOff className="h-12 w-12 text-orange-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Modo Offline
              </h1>
              <p className="text-lg text-muted-foreground">
                Você está desconectado da internet
              </p>
            </div>
          </div>
          
          <Badge 
            variant={isOnline ? "default" : "secondary"}
            className="text-sm"
          >
            {isOnline ? "Conectado" : "Offline"}
          </Badge>
        </div>

        {/* Status de Conexão */}
        <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Sem conexão com a internet
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Algumas funcionalidades estão limitadas, mas você ainda pode acessar conteúdo em cache.
                </p>
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Conexão
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Informações de Sincronização */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <CardTitle>Sincronização</CardTitle>
                  <CardDescription>Status da última sincronização</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Última sincronização:</p>
                <p className="font-medium">{formatLastSync(lastSync)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Ações pendentes:</p>
                <p className="font-medium">
                  {queuedActions > 0 ? `${queuedActions} ações` : 'Nenhuma ação pendente'}
                </p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  ⚡ Suas alterações serão sincronizadas automaticamente quando a conexão for restaurada.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo Disponível */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <CardTitle>Conteúdo Disponível</CardTitle>
                  <CardDescription>Dados salvos localmente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cachedProjects.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    {cachedProjects.length} projeto(s) em cache:
                  </p>
                  {cachedProjects.map((project, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        {project.title || `Projeto ${index + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum conteúdo em cache
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Funcionalidades Disponíveis Offline */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>O que você pode fazer offline</CardTitle>
            <CardDescription>Funcionalidades que funcionam sem conexão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700 dark:text-green-300">✅ Disponível</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Visualizar projetos em cache</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Editar configurações locais</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Acessar documentação offline</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Preparar conteúdo para sync</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-orange-700 dark:text-orange-300">⏸️ Limitado</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <WifiOff className="h-4 w-4 text-orange-500" />
                    <span>Renderização de vídeos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <WifiOff className="h-4 w-4 text-orange-500" />
                    <span>Upload de arquivos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <WifiOff className="h-4 w-4 text-orange-500" />
                    <span>Sincronização em tempo real</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <WifiOff className="h-4 w-4 text-orange-500" />
                    <span>APIs externas (TTS, IA)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button onClick={handleRefresh} className="min-w-[140px]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Reconectar
          </Button>
          
          <Button onClick={handleGoHome} variant="outline" className="min-w-[140px]">
            <Home className="h-4 w-4 mr-2" />
            Ir para Home
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-xs text-muted-foreground">
            Estúdio IA de Vídeos • Modo Offline Ativo
          </p>
        </div>
      </div>
    </div>
  );
}
