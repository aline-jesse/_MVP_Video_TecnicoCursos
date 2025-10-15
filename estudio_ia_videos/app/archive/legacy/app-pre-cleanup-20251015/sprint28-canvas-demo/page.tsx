
'use client'

/**
 * 🎨 Sprint 28 Canvas Demo - SSR Safe
 * Redirect to new Canvas demo page
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Sprint28CanvasDemoPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/demo/canvas')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para Canvas Editor...</p>
      </div>
    </div>
  )
}
