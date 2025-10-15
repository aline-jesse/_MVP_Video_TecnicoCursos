
import { Metadata } from 'next'
import ElevenLabsProfessionalStudio from '@/components/tts/elevenlabs-professional-studio'

export const metadata: Metadata = {
  title: 'ElevenLabs Professional Studio | Estúdio IA de Vídeos',
  description: 'Estúdio profissional de clonagem de voz e síntese de fala com 29 vozes premium e IA avançada',
}

export default function ElevenLabsPage() {
  return <ElevenLabsProfessionalStudio />
}
