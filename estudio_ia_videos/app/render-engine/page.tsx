
import { Metadata } from 'next'
import ProfessionalRenderEngine from '../components/render/professional-render-engine'

export const metadata: Metadata = {
  title: 'Professional Render Engine - Estúdio IA de Vídeos',
  description: 'Engine de renderização profissional com FFmpeg para vídeos de alta qualidade'
}

export default function RenderEnginePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Professional Render Engine</h1>
          <p className="text-muted-foreground">
            Sistema de renderização profissional com FFmpeg para vídeos de cinema-grade
          </p>
        </div>
        
        <ProfessionalRenderEngine />
      </div>
    </div>
  )
}
