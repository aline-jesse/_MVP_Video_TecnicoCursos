
import { Metadata } from 'next'
import AdvancedVideoPipeline from '@/components/video-pipeline/advanced-video-pipeline'

export const metadata: Metadata = {
  title: 'Advanced Video Pipeline | Estúdio IA de Vídeos',
  description: 'Pipeline profissional de renderização com FFmpeg, múltiplos formatos e sistema de filas inteligente',
}

export default function AdvancedVideoPipelinePage() {
  return <AdvancedVideoPipeline />
}
