
/**
 * 📦 BARREL EXPORT - SISTEMA DE TRATAMENTO DE ERROS
 * Exportações centralizadas de todo o sistema de tratamento de erros
 */

// Core Error Handling
export { errorLogger, logError, logWarning, logInfo, logDebug } from './error-logger';
export type { ErrorLog } from './error-logger';

// Error Boundaries
export { 
  AdvancedErrorBoundary, 
  CriticalErrorBoundary, 
  withErrorBoundary 
} from './error-boundary';

// API Error Handling
export { 
  apiClient, 
  ApiErrorUtils, 
  useApiRequest 
} from './api-error-handler';
export type { ApiError, ApiResponse, ApiRequestOptions } from './api-error-handler';

// Offline Support
export { 
  offlineManager, 
  useOfflineStatus, 
  OfflineIndicator 
} from './offline-support';

// Form Validation
export { 
  formValidator, 
  useFormValidation, 
  ValidationErrorDisplay, 
  FieldError 
} from './form-validation';
export type { ValidationRule, ValidationError, ValidationResult } from './form-validation';

// Error Recovery Hooks
export { 
  useErrorRecovery,
  useApiRecovery,
  useConnectionRecovery,
  useComponentRecovery,
  useDebouncedError
} from '../../hooks/use-error-recovery';
export type { ErrorRecoveryOptions } from '../../hooks/use-error-recovery';

// Error Message Components
export { 
  ErrorDisplay,
  NetworkErrorDisplay,
  TimeoutErrorDisplay,
  ServerErrorDisplay,
  AuthErrorDisplay,
  SuccessDisplay,
  ErrorType
} from '../../components/error-handling/error-messages';

// Graceful Degradation Components
export { 
  GracefulImage,
  GracefulVideo,
  GracefulDataLoader,
  GracefulTTSPlayer,
  GracefulSettingsPanel,
  GracefulSkeleton,
  useGracefulDegradation
} from '../../components/error-handling/graceful-degradation';

// Demo Component (para desenvolvimento)
export { default as ErrorHandlingDemo } from '../../components/error-handling/error-demo';

// Utility Functions
export const ErrorHandlingUtils = {
  // Função para configurar tratamento global de erros
  setupGlobalErrorHandling: () => {
    // Handler já configurado no error-logger
    console.log('✅ Global error handling configured');
  },

  // Função para testar conectividade
  testConnection: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD', 
        cache: 'no-cache' 
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Função para obter informações do navegador
  getBrowserInfo: () => (typeof window !== 'undefined' ? {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    }
  } : {}),

  // Função para sanitizar dados sensíveis em logs
  sanitizeLogData: (data: any): any => {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'authorization'];
    
    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized;
    };
    
    return sanitize(data);
  },

  // Função para formatar erros para display
  formatErrorForDisplay: (error: Error | any): {
    title: string;
    message: string;
    type: string;
  } => {
    if (error && typeof error === 'object' && 'status' in error) {
      return {
        title: error.status >= 500 ? 'Erro do Servidor' :
               error.status === 404 ? 'Não Encontrado' :
               error.status === 401 || error.status === 403 ? 'Erro de Autenticação' :
               'Erro de API',
        message: error.message || 'Erro na requisição',
        type: 'api'
      };
    }

    return {
      title: 'Erro Inesperado',
      message: error?.message || 'Algo deu errado',
      type: 'generic'
    };
  },

  // Função para debug - listar todos os erros da sessão
  getSessionErrors: () => {
    if (typeof window !== 'undefined') {
      const { errorLogger } = require('./error-logger');
      return errorLogger.getErrorStats();
    }
    return { totalErrors: 0, errorsByType: {}, recentErrors: [] };
  }
};

// Configurar automaticamente o tratamento global se executando no browser
if (typeof window !== 'undefined') {
  ErrorHandlingUtils.setupGlobalErrorHandling();
}
