
'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Algo deu errado!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada e está trabalhando para resolver o problema.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-left text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
              {error.message}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={reset}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar novamente</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao início</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
