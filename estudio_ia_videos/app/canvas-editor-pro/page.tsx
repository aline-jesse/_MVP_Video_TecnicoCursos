

import React from 'react'
import ProfessionalCanvasEditorV3 from '@/components/canvas-editor-pro/professional-canvas-editor-v3'

export default function CanvasEditorProPage() {
  const handleExportTimeline = (timelineData: any) => {
    console.log('Timeline exported:', timelineData)
    // Aqui seria integrado com o sistema de timeline do PPTX
  }

  const handleSceneUpdate = (sceneData: any) => {
    console.log('Scene updated:', sceneData)
    // Aqui seria sincronizado com o sistema de cenas
  }

  return (
    <div className="min-h-screen">
      <ProfessionalCanvasEditorV3
        width={1920}
        height={1080}
        backgroundColor="#ffffff"
        onExportTimeline={handleExportTimeline}
        onSceneUpdate={handleSceneUpdate}
        initialObjects={[]}
      />
    </div>
  )
}

