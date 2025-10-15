
'use client'

/**
 * 🎨 CANVAS EDITOR PRO PAGE - Sprint 18
 * Página principal do editor de canvas profissional
 */

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports para componentes pesados
const ProfessionalCanvasEditor = dynamic(
  () => import('@/components/canvas-editor/professional-canvas-editor'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
)

export default function CanvasEditorProPage() {
  return (
    <div className="h-screen">
      <ProfessionalCanvasEditor />
    </div>
  )
}
