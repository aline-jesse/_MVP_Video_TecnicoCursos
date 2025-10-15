
'use client'

/**
 * 🖼️ IMAGE FALLBACK - Resolve imagens 404 automaticamente
 */

import React, { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface ImageFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  placeholder?: React.ReactNode
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
}

const FALLBACK_IMAGES = {
  'nr35-thumb.jpg': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
  'nr12-thumb.jpg': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=200&fit=crop',
  'nr33-thumb.jpg': 'https://placehold.co/1200x600/e2e8f0/1e293b?text=A_professional_or_corporate_themed_thumbnail_image',
  'avatar-executivo-thumb.jpg': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
  'corporativa-thumb.jpg': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop'
}

export function ImageFallback({
  src,
  alt,
  width = 300,
  height = 200,
  className = '',
  fallbackSrc,
  placeholder,
  aspectRatio = 'auto'
}: ImageFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square'
      case 'video': return 'aspect-video'
      case 'portrait': return 'aspect-[3/4]'
      default: return ''
    }
  }

  const getFallbackImage = (originalSrc: string) => {
    const filename = originalSrc.split('/').pop() || ''
    return FALLBACK_IMAGES[filename as keyof typeof FALLBACK_IMAGES] || fallbackSrc
  }

  const handleError = () => {
    const fallback = getFallbackImage(src)
    
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback)
      setHasError(false)
    } else {
      setHasError(true)
    }
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  if (hasError) {
    return (
      <div 
        className={`${getAspectRatioClass()} bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height: aspectRatio === 'auto' ? height : undefined }}
      >
        {placeholder || (
          <div className="text-center text-gray-500">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Imagem não encontrada</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`${getAspectRatioClass()} relative ${className}`}
      style={{ width, height: aspectRatio === 'auto' ? height : undefined }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`rounded-lg object-cover ${aspectRatio !== 'auto' ? 'absolute inset-0 w-full h-full' : ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized
      />
    </div>
  )
}

export default ImageFallback
