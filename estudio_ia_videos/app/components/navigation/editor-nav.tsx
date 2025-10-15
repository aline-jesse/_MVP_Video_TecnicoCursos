
/**
 * 🧭 Navigation Link para Editor Animaker
 * Link para ser incluído nos menus principais
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit3, Sparkles } from 'lucide-react'

interface EditorNavProps {
  className?: string
  variant?: 'button' | 'link' | 'card'
}

export function EditorNav({ className = '', variant = 'button' }: EditorNavProps) {
  if (variant === 'link') {
    return (
      <Link 
        href="/editor-animaker" 
        className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors ${className}`}
      >
        <Edit3 className="w-4 h-4" />
        Editor Animaker
        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
          NOVO
        </Badge>
      </Link>
    )
  }

  if (variant === 'card') {
    return (
      <Link href="/editor-animaker">
        <div className={`p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${className}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Editor Animaker</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                NOVO
              </Badge>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Editor visual completo com drag-and-drop, timeline profissional e painéis idênticos ao Animaker
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-3 h-3" />
            <span>Importação PPTX completa</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href="/editor-animaker">
      <Button className={`gap-2 ${className}`}>
        <Edit3 className="w-4 h-4" />
        Editor Animaker
        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs ml-2">
          NOVO
        </Badge>
      </Button>
    </Link>
  )
}
