

'use client'

/**
 * 👥 COLLABORATION V2 - Sprint 17
 * Sistema de colaboração em tempo real
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AppShell from '@/components/layouts/AppShell'
import CollaborationHub from '@/components/collaboration/collaboration-hub'
import { EmergencyErrorBoundary } from '@/lib/advanced-analytics-emergency'
import { Loader2 } from 'lucide-react'

function SafeCollaborationContent() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <AppShell 
      title="Colaboração Team Pro"
      description="Sistema de colaboração em tempo real com comentários e controle de versões"
      showBreadcrumbs={true}
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Colaboração', href: '/collaboration-v2' }
      ]}
    >
      <CollaborationHub />
    </AppShell>
  )
}

export default function CollaborationV2Page() {
  return (
    <EmergencyErrorBoundary>
      <SafeCollaborationContent />
    </EmergencyErrorBoundary>
  )
}

