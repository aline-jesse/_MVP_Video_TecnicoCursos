
import { Loader2, Sparkles } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Estúdio IA de Vídeos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Carregando funcionalidades avançadas...
          </p>
        </div>
      </div>
    </div>
  )
}
