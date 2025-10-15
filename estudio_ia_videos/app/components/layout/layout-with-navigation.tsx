
'use client'

import React, { ReactNode } from 'react'
import NavigationSprint25 from '../navigation/navigation-sprint25'

interface LayoutWithNavigationProps {
  children: ReactNode
}

export default function LayoutWithNavigation({ children }: LayoutWithNavigationProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationSprint25 />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
