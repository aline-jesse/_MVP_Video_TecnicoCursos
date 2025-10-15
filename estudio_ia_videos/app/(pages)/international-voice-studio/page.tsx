import { Metadata } from 'next'
import InternationalVoiceStudio from '@/components/multi-language/international-voice-studio'

export const metadata: Metadata = {
  title: 'International Voice Studio | Estúdio IA de Vídeos',
  description: 'Estúdio multilíngue com 76 vozes premium em 12 idiomas e tradução automática profissional',
}

export default function InternationalVoiceStudioPage() {
  return <InternationalVoiceStudio />
}