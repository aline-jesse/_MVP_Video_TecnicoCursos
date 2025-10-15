

'use client'

/**
 * 🤝 PÁGINA DE COLABORAÇÃO AVANÇADA - Sprint 17
 * Sistema completo de colaboração em tempo real
 */

import React from 'react'
import AppShell from '../../components/layouts/AppShell'
import CollaborationAdvanced from '../../components/collaboration/collaboration-advanced'
import { Shield, Users, MessageSquare } from 'lucide-react'

export default function CollaborationAdvancedPage() {
  return (
    <AppShell
      breadcrumbs={[
        { href: '/', label: 'Início' },
        { href: '/collaboration-advanced', label: 'Colaboração Avançada' }
      ]}
      title="Sistema de Colaboração Avançado"
      description="Gerencie comentários, versões, equipe e compartilhamento em tempo real"
    >
      <div className="container mx-auto py-6">
        <CollaborationAdvanced />
      </div>
    </AppShell>
  )
}

