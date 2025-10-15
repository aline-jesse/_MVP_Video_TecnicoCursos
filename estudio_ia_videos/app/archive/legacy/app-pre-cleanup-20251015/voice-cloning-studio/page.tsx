
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mic, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function VoiceCloningStudioPage() {
  const router = useRouter()

  useEffect(() => {
    toast.success('🎙️ Redirecionando para Voice Cloning...')
    const timer = setTimeout(() => {
      router.push('/voice-cloning')
    }, 1500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <Mic className="h-6 w-6 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold">Redirecionando...</h2>
        <p className="text-muted-foreground">Levando você para Voice Cloning</p>
      </div>
    </div>
  )
}
