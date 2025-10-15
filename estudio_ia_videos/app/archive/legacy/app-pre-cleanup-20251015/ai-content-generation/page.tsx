'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AIContentGenerationPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/ai-generative')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
