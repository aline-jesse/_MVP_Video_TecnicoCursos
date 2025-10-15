

/**
 * 🎤 Sprint 28 TTS Demo Page
 */

import React from 'react'
import AdvancedTTSPanelSprint28 from '@/components/tts/advanced-tts-panel-sprint28'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function Sprint28TTSDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2">Sprint 28</Badge>
            <h1 className="text-3xl font-bold">TTS Multi-Provider com Redis Cache</h1>
            <p className="text-muted-foreground">
              Geração de áudio com fallback automático, cache inteligente e preview
            </p>
          </div>
          <Link href="/sprint28-demo">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <AdvancedTTSPanelSprint28 />
      </div>
    </div>
  )
}
