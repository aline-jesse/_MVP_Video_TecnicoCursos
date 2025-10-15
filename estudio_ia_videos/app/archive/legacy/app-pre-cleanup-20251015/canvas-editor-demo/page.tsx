
'use client'

/**
 * 🎨 Canvas Editor Demo Page - Sprint 27
 */

import { useState } from 'react'
import AdvancedCanvasEditorSprint27 from '@/components/canvas-editor-pro/advanced-canvas-sprint27'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CanvasEditorDemoPage() {
  const [savedData, setSavedData] = useState<any>(null)

  const handleSave = (data: any) => {
    setSavedData(data)
    console.log('Canvas data saved:', data)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-white">
          Canvas Editor Sprint 27 - Demo
        </h1>
      </div>

      {/* Canvas Editor */}
      <div className="flex-1">
        <AdvancedCanvasEditorSprint27
          width={1920}
          height={1080}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
