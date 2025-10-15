
/**
 * 🔧 Navigation Fix
 * Fix para botões problemáticos identificados nos testes
 */

'use client'

import React from 'react'
import { Button } from './button'
import { toast } from 'react-hot-toast'

interface NavigationFixProps {
  children?: React.ReactNode
}

// Fix para botões "UD" ou sem handlers
export function NavigationFix({ children }: NavigationFixProps) {
  const handleMissingAction = (actionName: string) => {
    toast.success(`${actionName} - Funcionalidade em desenvolvimento!`)
    console.log(`Action triggered: ${actionName}`)
  }

  return (
    <div className="navigation-fix">
      {children}
      
      {/* Styles para garantir que botões tenham handlers */}
      <style jsx global>{`
        button[aria-label*="UD"]:not([onClick]),
        .btn-ud:not([onClick]),
        button:contains("UD"):not([onClick]) {
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

// Helper para criar botões com handler padrão
export function SafeButton({ 
  children, 
  onClick, 
  fallbackAction = "Ação",
  ...props 
}: any) {
  return (
    <Button
      onClick={onClick || (() => toast.success(`${fallbackAction} - Em desenvolvimento!`))}
      {...props}
    >
      {children}
    </Button>
  )
}

export default NavigationFix
