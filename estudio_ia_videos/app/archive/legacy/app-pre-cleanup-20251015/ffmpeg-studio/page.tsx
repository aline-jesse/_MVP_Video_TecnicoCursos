
/**
 * 🎬 FFmpeg Studio - Página Principal
 * Sistema completo de renderização com FFmpeg real
 */

'use client'

import AppShell from '../../components/layouts/AppShell'
import FFmpegRenderStudio from '../../components/ffmpeg/ffmpeg-render-studio'

export default function FFmpegStudioPage() {
  
  const handleRenderComplete = (outputUrl: string) => {
    console.log('Renderização completa:', outputUrl)
    // Implementar notificação ou redirect
  }

  const handleRenderStart = (jobId: string) => {
    console.log('Renderização iniciada:', jobId)
    // Implementar tracking ou analytics
  }

  return (
    <AppShell 
      title="FFmpeg Studio"
      description="Sistema profissional de renderização de vídeos"
      showBreadcrumbs={true}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Studio', href: '/studio' },
        { label: 'FFmpeg Studio', href: '/ffmpeg-studio' }
      ]}
    >
      <FFmpegRenderStudio
        onRenderComplete={handleRenderComplete}
      />
    </AppShell>
  )
}
