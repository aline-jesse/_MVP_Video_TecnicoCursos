
'use client'

import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <FileQuestion className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Página não encontrada
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            A página que você está procurando não existe ou foi movida para outro local.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/" className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Voltar ao início</span>
              </Link>
            </Button>
            
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Página anterior
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
