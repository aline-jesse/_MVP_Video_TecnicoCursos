
'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ImageIcon, AlertTriangle } from 'lucide-react'

interface ImageFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  fallbackIcon?: 'image' | 'alert'
}

export function ImageFallback({ 
  src, 
  alt, 
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  fallbackIcon = 'image'
}: ImageFallbackProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageError = useCallback(() => {
    console.warn(`🖼️ Imagem não encontrada: ${src}`)
    setImageError(true)
    setIsLoading(false)
  }, [src])

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  if (imageError) {
    const FallbackIcon = fallbackIcon === 'alert' ? AlertTriangle : ImageIcon
    
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className} ${
          fill ? 'absolute inset-0' : ''
        }`}
        style={fill ? {} : { width, height }}
      >
        <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
          <FallbackIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs text-center">Imagem não encontrada</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div 
          className={`bg-muted animate-pulse ${className} ${
            fill ? 'absolute inset-0' : ''
          }`}
          style={fill ? {} : { width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </>
  )
}
