
import React from 'react'
import { cn } from '@/lib/utils'

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd 
      className={cn(
        'inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-bg px-1.5 font-mono text-xs font-medium text-text-muted shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
