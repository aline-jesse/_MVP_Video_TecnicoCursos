
/**
 * 🛡️ ERROR BOUNDARY AVANÇADO
 * Componente para capturar e tratar erros React de forma elegante
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { errorLogger } from './error-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // Se true, não propaga erro para boundary pai
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  userFeedback: string;
  feedbackSent: boolean;
  retryCount: number;
  isRetrying: boolean;
}

export class AdvancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      userFeedback: '',
      feedbackSent: false,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro
    errorLogger.logError({
      message: `React Error Boundary: ${error.message}`,
      error,
      context: {
        component: 'ErrorBoundary',
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
        retryCount: this.state.retryCount,
      },
      handled: true,
    });

    // Callback personalizado
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });

    // Auto-retry para erros transitórios
    if (this.isTransientError(error) && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  private isTransientError(error: Error): boolean {
    const transientPatterns = [
      /network/i,
      /fetch/i,
      /timeout/i,
      /connection/i,
      /load/i,
    ];
    
    return transientPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  private scheduleRetry = () => {
    this.setState({ isRetrying: true });
    
    setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        isRetrying: false,
        retryCount: prevState.retryCount + 1,
      }));
    }, this.retryDelay * Math.pow(2, this.state.retryCount)); // Exponential backoff
  };

  private handleManualRetry = () => {
    errorLogger.logInfo(`Manual retry attempted`, {
      component: 'ErrorBoundary',
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
    });

    this.scheduleRetry();
  };

  private handleReload = () => {
    errorLogger.logInfo(`Page reload initiated`, {
      component: 'ErrorBoundary',
      errorId: this.state.errorId,
    });
    
    window.location.reload();
  };

  private handleGoHome = () => {
    errorLogger.logInfo(`Navigation to home initiated`, {
      component: 'ErrorBoundary',
      errorId: this.state.errorId,
    });
    
    window.location.href = '/';
  };

  private handleSendFeedback = async () => {
    if (!this.state.userFeedback.trim()) return;

    try {
      errorLogger.logInfo(`User feedback sent`, {
        component: 'ErrorBoundary',
        errorId: this.state.errorId,
        feedback: this.state.userFeedback,
      });

      // Simular envio de feedback (implementar API real se necessário)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.setState({ feedbackSent: true });
    } catch (error) {
      errorLogger.logError({
        message: 'Failed to send user feedback',
        error: error as Error,
        context: { component: 'ErrorBoundary' },
      });
    }
  };

  private formatError(error: Error): string {
    if (process.env.NODE_ENV === 'development') {
      return `${error.name}: ${error.message}\n\n${error.stack}`;
    }
    
    // Em produção, mostrar apenas informações básicas
    return `${error.name}: ${error.message}`;
  }

  render() {
    if (this.state.hasError) {
      // Se um fallback customizado foi fornecido, usá-lo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Se está fazendo retry, mostrar loading
      if (this.state.isRetrying) {
        return (
          <div className="flex items-center justify-center min-h-[400px] p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-sm text-muted-foreground">
                    Tentando novamente... ({this.state.retryCount}/{this.maxRetries})
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <div>
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Oops! Algo deu errado
                  </CardTitle>
                  <CardDescription>
                    Encontramos um erro inesperado. Nosso time foi notificado automaticamente.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>ID do Erro:</strong> {this.state.errorId}
                  <br />
                  <small className="text-muted-foreground">
                    Use este ID ao contatar o suporte
                  </small>
                </AlertDescription>
              </Alert>

              {/* Detalhes do erro (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <AlertDescription>
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium mb-2">
                        Detalhes Técnicos (Dev Mode)
                      </summary>
                      <pre className="whitespace-pre-wrap text-xs bg-black/10 dark:bg-white/10 p-2 rounded">
                        {this.formatError(this.state.error)}
                      </pre>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {/* Ações principais */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={this.handleManualRetry}
                  variant="default"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="sm"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Home
                </Button>
              </div>

              {/* Feedback do usuário */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">
                  Ajude-nos a melhorar
                </h4>
                
                {!this.state.feedbackSent ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Descreva o que você estava fazendo quando o erro ocorreu..."
                      value={this.state.userFeedback}
                      onChange={(e) => this.setState({ userFeedback: e.target.value })}
                      className="min-h-[80px]"
                    />
                    <Button
                      onClick={this.handleSendFeedback}
                      variant="outline"
                      size="sm"
                      disabled={!this.state.userFeedback.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Feedback
                    </Button>
                  </div>
                ) : (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      ✅ Obrigado! Seu feedback foi enviado.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Informações de retry */}
              {this.state.retryCount > 0 && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Tentativas de recuperação: {this.state.retryCount}/{this.maxRetries}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para facilitar o uso
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AdvancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AdvancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Error Boundary específico para seções críticas
export function CriticalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <AdvancedErrorBoundary
      onError={(error, errorInfo) => {
        // Log crítico
        errorLogger.logError({
          message: `Critical Section Error: ${error.message}`,
          error,
          context: {
            component: 'CriticalErrorBoundary',
            critical: true,
            componentStack: errorInfo.componentStack,
          },
        });
      }}
    >
      {children}
    </AdvancedErrorBoundary>
  );
}
