'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect: render-pipeline → video-render-pipeline
 */
export default function RenderPipelineRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/app/video-render-pipeline')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecionando para Render Pipeline...</p>
    </div>
  )
}
