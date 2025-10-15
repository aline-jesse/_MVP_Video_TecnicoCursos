
/**
 * 🧪 DEMONSTRAÇÃO DO SISTEMA DE TRATAMENTO DE ERROS
 * Componente de demonstração para testar todas as funcionalidades de erro
 */

'use client';

import React from 'react';
import { 
  Bug, 
  Wifi, 
  Server, 
  Clock, 
  Shield, 
  AlertTriangle,
  Play,
  RefreshCw,
  FileX
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Importar componentes de tratamento de erro
import { 
  ErrorDisplay, 
  NetworkErrorDisplay,
  TimeoutErrorDisplay,
  ServerErrorDisplay,
  AuthErrorDisplay,
  SuccessDisplay,
  ErrorType 
} from './error-messages';

import { 
  AdvancedErrorBoundary,
  CriticalErrorBoundary 
} from '@/lib/error-handling/error-boundary';

import { 
  GracefulImage,
  GracefulVideo,
  GracefulDataLoader,
  GracefulTTSPlayer,
  GracefulSkeleton
} from './graceful-degradation';

import { 
  useErrorRecovery,
  useApiRecovery,
  useConnectionRecovery,
  useComponentRecovery
} from '@/hooks/use-error-recovery';

import { 
  useFormValidation,
  ValidationErrorDisplay,
  FieldError,
  formValidator
} from '@/lib/error-handling/form-validation';

import { apiClient, ApiErrorUtils } from '@/lib/error-handling/api-error-handler';
import { errorLogger } from '@/lib/error-handling/error-logger';
import { useOfflineStatus } from '@/lib/error-handling/offline-support';

// Componente que gera erro para teste
function ErrorGeneratorComponent({ errorType }: { errorType: string }) {
  React.useEffect(() => {
    if (errorType === 'throw') {
      throw new Error('Componente de teste gerou erro intencionalmente');
    }
  }, [errorType]);

  if (errorType === 'render') {
    // @ts-ignore - Erro intencional
    return <div>{undefined.property}</div>;
  }

  return <div>Componente funcionando normalmente</div>;
}

export function ErrorHandlingDemo() {
  const { toast } = useToast();
  const { isOffline, isOnline } = useOfflineStatus();
  
  // Estados para demonstrações
  const [selectedErrorType, setSelectedErrorType] = React.useState<ErrorType>(ErrorType.NETWORK);
  const [showErrorBoundary, setShowErrorBoundary] = React.useState(false);
  const [errorBoundaryType, setErrorBoundaryType] = React.useState('');
  const [customErrorMessage, setCustomErrorMessage] = React.useState('');
  
  // Hook de recuperação de conexão
  const connectionRecovery = useConnectionRecovery({
    maxRetries: 3,
    retryDelay: 2000,
    onError: (error, attempt) => {
      console.log(`Connection test failed (attempt ${attempt}):`, error.message);
    },
    onRecovered: (attempt) => {
      toast({
        title: "Conexão Restaurada",
        description: `Conexão restaurada após ${attempt} tentativas`,
        variant: "default",
      });
    }
  });

  // Hook de recuperação de API
  const apiRecovery = useApiRecovery('/api/test', {
    recoveryOptions: {
      maxRetries: 3,
      retryDelay: 1000,
      onError: (error, attempt) => {
        console.log(`API call failed (attempt ${attempt}):`, error.message);
      }
    }
  });

  // Hook de recuperação de componente
  const componentRecovery = useComponentRecovery('DemoComponent');

  // Validação de formulário
  const formValidation = useFormValidation(
    {
      name: '',
      email: '',
      message: '',
      nrType: '',
    },
    {
      name: { required: true, minLength: 2 },
      email: { required: true, email: true },
      message: { required: true, minLength: 10, maxLength: 500 },
      nrType: { required: true },
    }
  );

  // Funções para demonstrar erros
  const simulateNetworkError = () => {
    errorLogger.logError({
      message: 'Simulated network error',
      error: new Error('Network connection failed'),
      context: { component: 'ErrorDemo', simulation: true }
    });
    
    toast({
      title: "Erro de Rede Simulado",
      description: "Verifique o console para ver os logs",
      variant: "destructive",
    });
  };

  const simulateApiError = async () => {
    try {
      const response = await apiClient.get('/api/nonexistent-endpoint');
      console.log(response);
    } catch (error) {
      toast({
        title: "Erro de API Capturado",
        description: "Erro foi tratado pelo sistema de recuperação",
        variant: "destructive",
      });
    }
  };

  const testFormValidation = async () => {
    const result = await formValidation.validateForm();
    if (result.isValid) {
      toast({
        title: "Formulário Válido",
        description: "Todos os campos estão corretos!",
        variant: "default",
      });
    } else {
      toast({
        title: "Erros de Validação",
        description: `${result.errors.length} erro(s) encontrado(s)`,
        variant: "destructive",
      });
    }
  };

  const triggerComponentError = () => {
    setShowErrorBoundary(true);
    setErrorBoundaryType('throw');
  };

  const resetErrorBoundary = () => {
    setShowErrorBoundary(false);
    setErrorBoundaryType('');
    componentRecovery.reset();
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">
          🛡️ Sistema de Tratamento de Erros
        </h1>
        <p className="text-muted-foreground mb-4">
          Demonstração completa do sistema avançado de tratamento de erros
        </p>
        
        <div className="flex justify-center space-x-4">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
          <Badge variant="outline">
            Logs: {errorLogger.getErrorStats().totalErrors}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="boundaries">Boundaries</TabsTrigger>
          <TabsTrigger value="graceful">Degradação</TabsTrigger>
          <TabsTrigger value="recovery">Recuperação</TabsTrigger>
          <TabsTrigger value="validation">Validação</TabsTrigger>
          <TabsTrigger value="logging">Logging</TabsTrigger>
        </TabsList>

        {/* Tab: Mensagens de Erro */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Componentes de Mensagens de Erro</CardTitle>
              <CardDescription>
                Diferentes tipos de mensagens de erro amigáveis ao usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Controles */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant={selectedErrorType === ErrorType.NETWORK ? "default" : "outline"}
                  onClick={() => setSelectedErrorType(ErrorType.NETWORK)}
                >
                  Rede
                </Button>
                <Button 
                  size="sm"
                  variant={selectedErrorType === ErrorType.TIMEOUT ? "default" : "outline"}
                  onClick={() => setSelectedErrorType(ErrorType.TIMEOUT)}
                >
                  Timeout
                </Button>
                <Button 
                  size="sm"
                  variant={selectedErrorType === ErrorType.SERVER ? "default" : "outline"}
                  onClick={() => setSelectedErrorType(ErrorType.SERVER)}
                >
                  Servidor
                </Button>
                <Button 
                  size="sm"
                  variant={selectedErrorType === ErrorType.AUTH ? "default" : "outline"}
                  onClick={() => setSelectedErrorType(ErrorType.AUTH)}
                >
                  Autenticação
                </Button>
              </div>

              {/* Exemplos de mensagens */}
              <div className="space-y-4">
                {selectedErrorType === ErrorType.NETWORK && (
                  <NetworkErrorDisplay 
                    onRetry={simulateNetworkError}
                    retryCount={1}
                    maxRetries={3}
                  />
                )}
                
                {selectedErrorType === ErrorType.TIMEOUT && (
                  <TimeoutErrorDisplay 
                    onRetry={simulateApiError}
                    estimatedTime={30}
                  />
                )}
                
                {selectedErrorType === ErrorType.SERVER && (
                  <ServerErrorDisplay 
                    onRetry={simulateApiError}
                    errorId="demo-error-12345"
                  />
                )}
                
                {selectedErrorType === ErrorType.AUTH && (
                  <AuthErrorDisplay 
                    onLogin={() => toast({ title: "Login simulado" })}
                  />
                )}
              </div>

              {/* Mensagem de sucesso para contraste */}
              <SuccessDisplay 
                title="Demonstração de Sucesso"
                message="Este é um exemplo de mensagem de sucesso"
                onDismiss={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Error Boundaries */}
        <TabsContent value="boundaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Boundaries Avançados</CardTitle>
              <CardDescription>
                Captura e tratamento elegante de erros React
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={triggerComponentError} variant="destructive">
                  Gerar Erro
                </Button>
                <Button onClick={resetErrorBoundary} variant="outline">
                  Reset
                </Button>
              </div>

              <AdvancedErrorBoundary onError={(error, errorInfo) => {
                console.log('Error Boundary caught:', error, errorInfo);
              }}>
                {showErrorBoundary ? (
                  <ErrorGeneratorComponent errorType={errorBoundaryType} />
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-md">
                    <p className="text-green-800 dark:text-green-200">
                      ✅ Componente funcionando normalmente
                    </p>
                  </div>
                )}
              </AdvancedErrorBoundary>

              <CriticalErrorBoundary>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                  <p className="text-blue-800 dark:text-blue-200">
                    🛡️ Seção crítica protegida por Error Boundary
                  </p>
                </div>
              </CriticalErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Degradação Graciosa */}
        <TabsContent value="graceful" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Degradação Graciosa</CardTitle>
              <CardDescription>
                Componentes que degradam graciosamente em caso de falha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Imagem com fallback */}
                <div>
                  <h4 className="font-medium mb-2">Imagem com Fallback</h4>
                  <GracefulImage
                    src="https://upload.wikimedia.org/wikipedia/commons/6/63/Generic_placeholder_page.jpg"
                    alt="Imagem de teste"
                    className="w-full h-32 rounded-md object-cover"
                    showError={true}
                  />
                </div>

                {/* Vídeo com fallback */}
                <div>
                  <h4 className="font-medium mb-2">Vídeo com Fallback</h4>
                  <GracefulVideo
                    src="https://nonexistent-video.mp4"
                    className="w-full h-32 rounded-md"
                  />
                </div>
              </div>

              {/* TTS Player */}
              <div>
                <h4 className="font-medium mb-2">TTS Player Gracioso</h4>
                <GracefulTTSPlayer 
                  text="Este é um teste de texto para voz"
                  onError={(error) => console.log('TTS Error:', error)}
                />
              </div>

              {/* Data Loader */}
              <div>
                <h4 className="font-medium mb-2">Carregador de Dados</h4>
                <GracefulDataLoader
                  loadFunction={async () => {
                    throw new Error('Falha simulada');
                  }}
                  fallbackData={{ message: 'Dados de fallback' }}
                  render={(data, isLoading, error) => (
                    <div className="p-4 bg-muted rounded-md">
                      {isLoading && <p>Carregando...</p>}
                      {error && <p className="text-red-500">Erro: {error.message}</p>}
                      <p>Dados: {JSON.stringify(data)}</p>
                    </div>
                  )}
                  loadingComponent={<GracefulSkeleton type="card" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Recuperação */}
        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recuperação Automática</CardTitle>
              <CardDescription>
                Hooks para recuperação automática de erros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recuperação de Conexão */}
              <div>
                <h4 className="font-medium mb-2">Teste de Conexão</h4>
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={connectionRecovery.execute}
                    disabled={connectionRecovery.loading}
                  >
                    {connectionRecovery.loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wifi className="h-4 w-4 mr-2" />
                    )}
                    Testar Conexão
                  </Button>
                  
                  <Badge variant={connectionRecovery.error ? "destructive" : "default"}>
                    {connectionRecovery.isRecovering ? 
                      `Tentando... (${connectionRecovery.retryCount}/${connectionRecovery.maxRetries})` :
                      connectionRecovery.error ? 
                        "Falhou" : 
                        "OK"
                    }
                  </Badge>
                </div>
              </div>

              {/* Recuperação de API */}
              <div>
                <h4 className="font-medium mb-2">Chamada de API</h4>
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={apiRecovery.execute}
                    disabled={apiRecovery.loading}
                  >
                    {apiRecovery.loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Server className="h-4 w-4 mr-2" />
                    )}
                    Chamar API
                  </Button>
                  
                  <Badge variant={apiRecovery.error ? "destructive" : "default"}>
                    {apiRecovery.isRecovering ? 
                      `Tentando... (${apiRecovery.retryCount}/${apiRecovery.maxRetries})` :
                      apiRecovery.error ? 
                        "Erro" : 
                        "OK"
                    }
                  </Badge>
                </div>
                
                {apiRecovery.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-sm">
                    Erro: {apiRecovery.error.message}
                  </div>
                )}
              </div>

              {/* Recuperação de Componente */}
              <div>
                <h4 className="font-medium mb-2">Recuperação de Componente</h4>
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={() => componentRecovery.reportError(new Error('Erro simulado'))}
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Simular Erro
                  </Button>
                  
                  {componentRecovery.hasError && (
                    <Button 
                      onClick={componentRecovery.recover}
                      variant="outline"
                      disabled={!componentRecovery.canRecover}
                    >
                      Recuperar ({componentRecovery.recoveryCount}/{componentRecovery.maxRecoveries})
                    </Button>
                  )}
                </div>
                
                {componentRecovery.hasError && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded text-sm">
                    Componente em erro: {componentRecovery.errorInfo?.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Validação */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validação de Formulários</CardTitle>
              <CardDescription>
                Sistema robusto de validação com mensagens amigáveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formValidation.data.name}
                      onChange={(e) => formValidation.updateField('name', e.target.value)}
                      className={formValidation.hasFieldError('name') ? 'border-red-500' : ''}
                    />
                    <FieldError fieldName="name" errors={formValidation.errors} />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formValidation.data.email}
                      onChange={(e) => formValidation.updateField('email', e.target.value)}
                      className={formValidation.hasFieldError('email') ? 'border-red-500' : ''}
                    />
                    <FieldError fieldName="email" errors={formValidation.errors} />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={formValidation.data.message}
                      onChange={(e) => formValidation.updateField('message', e.target.value)}
                      className={formValidation.hasFieldError('message') ? 'border-red-500' : ''}
                    />
                    <FieldError fieldName="message" errors={formValidation.errors} />
                  </div>

                  <Button 
                    onClick={testFormValidation}
                    disabled={formValidation.isValidating}
                  >
                    {formValidation.isValidating ? 'Validando...' : 'Validar Formulário'}
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Status da Validação</h4>
                  
                  <div className="space-y-2">
                    <Badge variant={formValidation.isValid ? "default" : "destructive"}>
                      {formValidation.isValid ? "Válido" : "Inválido"}
                    </Badge>
                    
                    {formValidation.errors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Erros Encontrados:</h5>
                        <ValidationErrorDisplay errors={formValidation.errors} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Logging */}
        <TabsContent value="logging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Logging</CardTitle>
              <CardDescription>
                Captura e análise de logs de erro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customError">Mensagem de Erro Personalizada</Label>
                    <Textarea
                      id="customError"
                      value={customErrorMessage}
                      onChange={(e) => setCustomErrorMessage(e.target.value)}
                      placeholder="Digite uma mensagem de erro para testar..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm"
                      onClick={() => {
                        errorLogger.logError({
                          message: customErrorMessage || 'Erro de teste',
                          context: { component: 'ErrorDemo' }
                        });
                        toast({ title: "Erro logado", description: "Verifique o console" });
                      }}
                    >
                      Log Error
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        errorLogger.logWarning(customErrorMessage || 'Warning de teste');
                        toast({ title: "Warning logado" });
                      }}
                    >
                      Log Warning
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        errorLogger.logInfo(customErrorMessage || 'Info de teste');
                        toast({ title: "Info logado" });
                      }}
                    >
                      Log Info
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Estatísticas de Erro</h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const stats = errorLogger.getErrorStats();
                      return (
                        <div>
                          <p><strong>Total de Erros:</strong> {stats.totalErrors}</p>
                          <p><strong>Session ID:</strong> <code className="text-xs">{stats.sessionInfo.sessionId}</code></p>
                          <p><strong>Duração da Sessão:</strong> {Math.floor(stats.sessionInfo.duration / 1000)}s</p>
                          
                          {stats.totalErrors > 0 && (
                            <div className="mt-2">
                              <p><strong>Tipos de Erro:</strong></p>
                              <ul className="ml-4">
                                {Object.entries(stats.errorsByType).map(([type, count]) => (
                                  <li key={type}>• {type}: {String(count)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ErrorHandlingDemo;
