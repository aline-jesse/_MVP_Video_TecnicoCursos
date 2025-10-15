
'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface LoadingOverlayProps {
  visible: boolean
  message?: string
  fullScreen?: boolean
}

export function LoadingOverlay({ visible, message, fullScreen = false }: LoadingOverlayProps) {
  if (!visible) return null

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50",
        fullScreen ? "fixed inset-0" : "absolute inset-0"
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
  )
}

export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
    </div>
  )
}
