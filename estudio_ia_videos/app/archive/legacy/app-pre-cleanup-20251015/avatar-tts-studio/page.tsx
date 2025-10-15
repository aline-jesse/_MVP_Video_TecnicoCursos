
'use client'

import React from 'react'
import AppShell from '@/components/layouts/AppShell'
import { AvatarTTSPrototype } from '@/components/prototypes/avatar-tts-prototype'

export default function AvatarTTSStudioPage() {
  return (
    <AppShell
      breadcrumbs={[
        { href: '/', label: 'Início' },
        { href: '/avatar-tts-studio', label: 'Avatar TTS Studio' }
      ]}
      title="Avatar 3D + TTS Studio"
      description="Sistema completo de geração de avatares 3D com narração por IA"
    >
      <div className="container mx-auto py-6">
        <AvatarTTSPrototype 
          onGenerate={(config) => {
            console.log('Avatar TTS Config:', config)
          }}
        />
      </div>
    </AppShell>
  )
}
