
'use client'

/**
 * 📋 TEMPLATES NR REAIS - Página de Redirecionamento
 * Redireciona para templates NR existentes com compliance automático
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function TemplatesNRRealPage() {
  const router = useRouter()

  useEffect(() => {
    // Notificar que está redirecionando
    toast.success('🛡️ Redirecionando para Templates NR...')
    
    // Redirecionar após 2 segundos para permitir leitura da mensagem
    const timer = setTimeout(() => {
      router.push('/templates-nr-especificos')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
      <div className="max-w-md w-full p-6">
        <Card className="text-center border-2 border-dashed border-green-200 dark:border-green-800">
          <CardContent className="p-8 space-y-6">
            
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Templates NR com Compliance
              </h1>
              <p className="text-muted-foreground">
                Sistema unificado redirecionando para templates de Normas Regulamentadoras
              </p>
            </div>

            {/* Loading */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                <span className="text-sm font-medium">Carregando Templates NR...</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Redirecionando automaticamente em instantes...
              </div>
            </div>

            {/* Quick Action */}
            <div className="pt-4 border-t border-border">
              <Link href="/templates-nr-especificos">
                <Button 
                  variant="outline" 
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-200"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Ir Agora para Templates NR
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>✅ Sistema Unificado:</strong> Pipeline único de produção</p>
              <p><strong>🛡️ Compliance Automático:</strong> Validação NR integrada</p>
              <p><strong>🎬 Produção:</strong> Upload → Editor → Export</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
