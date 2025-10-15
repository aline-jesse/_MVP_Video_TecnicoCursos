
/**
 * 🔧 Botão de Configurações Flutuante
 * Acesso rápido às configurações do sistema
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Settings, Wrench, AlertTriangle, CheckCircle } from 'lucide-react'

interface ConfigButtonProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left'
  show?: boolean
}

export function ConfigButton({ position = 'bottom-left', show = true }: ConfigButtonProps) {
  const [hasIssues] = useState(() => {
    // Verificar se há configurações básicas em falta
    const hasGoogleTTS = !!process.env.GOOGLE_TTS_API_KEY
    const hasS3 = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    return !hasGoogleTTS && !hasS3
  })

  if (!show) return null

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4', 
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`fixed ${positionClasses[position]} z-50`}>
            <Link href="/admin/configuracoes">
              <Button
                size="sm"
                variant={hasIssues ? "destructive" : "outline"}
                className="shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-2">
                  {hasIssues ? (
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-200" />
                  )}
                  
                  <span className="hidden md:inline">
                    {hasIssues ? 'Configurar' : 'Configurações'}
                  </span>
                  
                  {hasIssues && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      !
                    </Badge>
                  )}
                </div>
              </Button>
            </Link>
          </div>
        </TooltipTrigger>
        <TooltipContent side={position.includes('right') ? 'left' : 'right'}>
          {hasIssues ? (
            <div className="text-center">
              <p className="font-semibold text-orange-600">Configuração Necessária</p>
              <p className="text-sm text-gray-600">
                Configure APIs para funcionalidade completa
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-semibold text-green-600">Sistema Configurado</p>
              <p className="text-sm text-gray-600">
                Gerenciar credenciais e integrações
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Componente para mostrar status das configurações 
export function ConfigStatus() {
  const services = [
    { name: 'Google TTS', enabled: !!process.env.GOOGLE_TTS_API_KEY },
    { name: 'AWS S3', enabled: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) },
    { name: 'ElevenLabs', enabled: !!process.env.ELEVENLABS_API_KEY },
    { name: 'OpenAI', enabled: !!process.env.OPENAI_API_KEY }
  ]

  const enabledCount = services.filter(s => s.enabled).length
  const totalCount = services.length

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Wrench className="w-4 h-4" />
      <span>Configurações: {enabledCount}/{totalCount} serviços</span>
      {enabledCount === totalCount ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-orange-500" />
      )}
    </div>
  )
}
