
/**
 * 🌐 TRATAMENTO DE ERROS DE API
 * Sistema robusto para tratamento de erros de API com retry, cache e fallback
 */

import { errorLogger } from './error-logger';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
  retryable?: boolean;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    cached?: boolean;
    retryCount?: number;
    timestamp: number;
  };
}

export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  enableCache?: boolean; // Renomeado para evitar conflito com RequestInit.cache
  cacheTTL?: number;
  fallback?: any;
  abortSignal?: AbortSignal;
  headers?: Record<string, string>;
  useAuth?: boolean;
}

// Cache simples em memória
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key: string, data: any, ttl: number = 300000): void { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

class ApiErrorHandler {
  private static instance: ApiErrorHandler;
  private cache = new ApiCache();
  private defaultTimeout = 30000; // 30 segundos
  private defaultRetries = 3;
  private defaultRetryDelay = 1000;

  static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  private createApiError(
    message: string, 
    status?: number, 
    code?: string, 
    details?: any
  ): ApiError {
    const error = new Error(message) as ApiError;
    error.name = 'ApiError';
    error.status = status;
    error.code = code;
    error.details = details;
    error.timestamp = Date.now();
    error.retryable = this.isRetryableError(status, code);
    
    return error;
  }

  private isRetryableError(status?: number, code?: string): boolean {
    // Erros que podem ser tentados novamente
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'ABORT'];
    
    return (
      (status && retryableStatuses.includes(status)) ||
      (code && retryableCodes.includes(code)) ||
      false
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCacheKey(url: string, options?: any): string {
    return `api:${url}:${JSON.stringify(options || {})}`;
  }

  private async fetchWithTimeout(
    url: string, 
    options: RequestInit & { timeout?: number }
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createApiError(
          `Request timeout after ${timeout}ms`,
          408,
          'TIMEOUT'
        );
      }
      
      throw error;
    }
  }

  async request<T = any>(
    url: string,
    options: RequestInit & ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      enableCache = false,
      cacheTTL = 300000,
      fallback,
      timeout = this.defaultTimeout,
      useAuth = true,
      ...fetchOptions
    } = options;

    const cacheKey = this.getCacheKey(url, fetchOptions);
    let retryCount = 0;

    // Verificar cache
    if (enableCache) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          meta: {
            cached: true,
            timestamp: Date.now()
          }
        };
      }
    }

    // Headers padrão
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(typeof fetchOptions.headers === 'object' && fetchOptions.headers ? 
          Object.fromEntries(
            fetchOptions.headers instanceof Headers ? 
            Array.from(fetchOptions.headers.entries()) :
            Object.entries(fetchOptions.headers)
          ) : {}),
    };

    // Adicionar autenticação se necessário
    if (useAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const makeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const response = await this.fetchWithTimeout(url, {
          ...fetchOptions,
          headers,
          timeout,
        });

        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
          const errorBody = await response.text();
          let errorData;
          
          try {
            errorData = JSON.parse(errorBody);
          } catch {
            errorData = { message: errorBody };
          }

          throw this.createApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.code,
            errorData
          );
        }

        // Parse da resposta
        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text() as T;
        }

        // Salvar no cache se habilitado
        if (enableCache) {
          this.cache.set(cacheKey, data, cacheTTL);
        }

        return {
          success: true,
          data,
          meta: {
            retryCount,
            timestamp: Date.now()
          }
        };

      } catch (error) {
        const apiError = error instanceof Error ? 
          (error as ApiError).status ? error as ApiError :
          this.createApiError(
            error.message,
            undefined,
            'NETWORK_ERROR',
            error
          ) : 
          this.createApiError('Unknown error', undefined, 'UNKNOWN');

        // Log do erro
        errorLogger.logError({
          message: `API Request failed: ${url}`,
          error: apiError,
          context: {
            url,
            method: fetchOptions.method || 'GET',
            status: apiError.status,
            retryCount,
            component: 'ApiErrorHandler'
          }
        });

        // Tentar novamente se for um erro recuperável
        if (apiError.retryable && retryCount < retries) {
          retryCount++;
          const delayMs = retryDelay * Math.pow(2, retryCount - 1); // Exponential backoff
          
          errorLogger.logInfo(`Retrying API request (${retryCount}/${retries}) after ${delayMs}ms`, {
            component: 'ApiErrorHandler',
            url,
            retryCount
          });

          await this.delay(delayMs);
          return makeRequest();
        }

        // Se há fallback, usá-lo
        if (fallback !== undefined) {
          errorLogger.logInfo(`Using fallback data for failed request`, {
            component: 'ApiErrorHandler',
            url
          });

          return {
            success: false,
            data: fallback,
            error: apiError,
            meta: {
              retryCount,
              timestamp: Date.now()
            }
          };
        }

        // Retornar erro
        return {
          success: false,
          error: apiError,
          meta: {
            retryCount,
            timestamp: Date.now()
          }
        };
      }
    };

    return makeRequest();
  }

  // Métodos de conveniência
  async get<T = any>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(url: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  // Utilitários
  clearCache(): void {
    this.cache.clear();
  }

  deleteCacheEntry(url: string, options?: any): void {
    const cacheKey = this.getCacheKey(url, options);
    this.cache.delete(cacheKey);
  }
}

// Singleton export
export const apiClient = ApiErrorHandler.getInstance();

// Hook React para facilitar o uso
export function useApiRequest<T = any>() {
  const request = async (
    url: string,
    options?: RequestInit & ApiRequestOptions
  ): Promise<ApiResponse<T>> => {
    return apiClient.request<T>(url, options);
  };

  return {
    request,
    get: (url: string, options?: ApiRequestOptions) => apiClient.get<T>(url, options),
    post: (url: string, data?: any, options?: ApiRequestOptions) => apiClient.post<T>(url, data, options),
    put: (url: string, data?: any, options?: ApiRequestOptions) => apiClient.put<T>(url, data, options),
    patch: (url: string, data?: any, options?: ApiRequestOptions) => apiClient.patch<T>(url, data, options),
    delete: (url: string, options?: ApiRequestOptions) => apiClient.delete<T>(url, options),
  };
}

// Utilitários para tratamento de erros específicos
export const ApiErrorUtils = {
  isNetworkError: (error: ApiError): boolean => {
    return error.code === 'NETWORK_ERROR' || !navigator.onLine;
  },

  isTimeoutError: (error: ApiError): boolean => {
    return error.code === 'TIMEOUT' || error.status === 408;
  },

  isServerError: (error: ApiError): boolean => {
    return error.status ? error.status >= 500 : false;
  },

  isClientError: (error: ApiError): boolean => {
    return error.status ? error.status >= 400 && error.status < 500 : false;
  },

  isAuthError: (error: ApiError): boolean => {
    return error.status === 401 || error.status === 403;
  },

  getUserFriendlyMessage: (error: ApiError): string => {
    if (ApiErrorUtils.isNetworkError(error)) {
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (ApiErrorUtils.isTimeoutError(error)) {
      return 'A operação demorou muito para responder. Tente novamente.';
    }
    
    if (ApiErrorUtils.isAuthError(error)) {
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (ApiErrorUtils.isServerError(error)) {
      return 'Problema no servidor. Nossa equipe foi notificada.';
    }
    
    return error.message || 'Erro inesperado. Tente novamente.';
  }
};
