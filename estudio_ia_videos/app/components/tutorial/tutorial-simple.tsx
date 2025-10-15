
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Play } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function InteractiveTutorial() {
  const [isVisible, setIsVisible] = useState(false)

  const handleClose = () => {
    setIsVisible(false)
    toast.success('Tutorial fechado')
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        size="sm"
        variant="outline"
      >
        <Play className="h-4 w-4 mr-2" />
        Tutorial
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="max-w-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-lg">Bem-vindo ao Estúdio IA!</h3>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Este é um tutorial interativo que te guiará pelas principais funcionalidades.
          </p>
          <Button onClick={handleClose} className="w-full">
            Começar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
