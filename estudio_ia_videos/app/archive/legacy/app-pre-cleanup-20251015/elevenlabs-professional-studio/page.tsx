
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Volume2, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ElevenLabsProfessionalStudioPage() {
  const router = useRouter()

  useEffect(() => {
    toast.success('🔊 Redirecionando para ElevenLabs Studio...')
    const timer = setTimeout(() => {
      router.push('/elevenlabs-studio')
    }, 1500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <Volume2 className="h-6 w-6 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold">Redirecionando...</h2>
        <p className="text-muted-foreground">Levando você para ElevenLabs Studio</p>
      </div>
    </div>
  )
}
