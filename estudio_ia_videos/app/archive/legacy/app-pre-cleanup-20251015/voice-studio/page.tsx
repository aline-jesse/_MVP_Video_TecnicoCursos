'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect: voice-studio → international-voice-studio
 */
export default function VoiceStudioRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/app/international-voice-studio')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecionando para Voice Studio...</p>
    </div>
  )
}
