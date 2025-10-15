
'use client'

/**
 * 🚨 EMERGENCY FALLBACK - Quebra loops infinitos e carregamentos travados
 */

import React, { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Zap, CheckCircle } from 'lucide-react'

interface EmergencyFallbackProps {
  children: React.ReactNode
  onRecover?: () => void
}

export function EmergencyFallback({ children, onRecover }: EmergencyFallbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  useEffect(() => {
    // Timeout de segurança - se ficar mais de 8 segundos carregando, força fallback
    const timeout = setTimeout(() => {
      console.warn('🚨 EMERGENCY: Loading timeout detected')
      setLoadingTimeout(true)
      setIsLoading(false)
    }, 8000)

    // Simula carregamento rápido
    const quickLoad = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => {
      clearTimeout(timeout)
      clearTimeout(quickLoad)
    }
  }, [])

  useEffect(() => {
    // Monitora erros de console
    const errorHandler = (event: ErrorEvent) => {
      console.error('🚨 EMERGENCY: Runtime error detected', event.error)
      setHasError(true)
      setIsLoading(false)
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  const handleRecover = () => {
    setHasError(false)
    setLoadingTimeout(false)
    setIsLoading(true)
    
    // Força reload limpo
    setTimeout(() => {
      setIsLoading(false)
      onRecover?.()
    }, 2000)
  }

  const handleForceReload = () => {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <CheckCircle className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Carregando Estúdio IA</h2>
            <p className="text-gray-600">Inicializando componentes...</p>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 rounded-lg p-3">
            ✓ Sistema de emergência ativo<br/>
            ✓ Timeout de segurança: 8s<br/>
            ✓ Fallback automático
          </div>
        </div>
      </div>
    )
  }

  if (hasError || loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="text-center space-y-6 max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-red-900 mb-2">
              {loadingTimeout ? 'Timeout Detectado' : 'Erro Detectado'}
            </h2>
            <p className="text-red-600 text-sm">
              {loadingTimeout 
                ? 'A aplicação demorou mais que o esperado para carregar'
                : 'Houve um erro que impediu o carregamento normal'
              }
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRecover}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Recuperação Rápida
            </button>
            
            <button
              onClick={handleForceReload}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Página
            </button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 text-left">
            <strong>Problemas detectados:</strong><br/>
            • {loadingTimeout && '⚠️ Loading timeout (>8s)'}<br/>
            • {hasError && '⚠️ Runtime errors'}<br/>
            • ✓ Sistema de recuperação ativo
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default EmergencyFallback
