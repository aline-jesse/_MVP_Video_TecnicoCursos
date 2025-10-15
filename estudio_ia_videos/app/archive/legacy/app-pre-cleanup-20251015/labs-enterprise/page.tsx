
'use client'

import React from 'react'
import AppShell from '@/components/layouts/AppShell'
import { LabsPrototype } from '@/components/prototypes/labs-prototype'

export default function LabsEnterprisePage() {
  return (
    <AppShell
      breadcrumbs={[
        { href: '/', label: 'Início' },
        { href: '/labs-enterprise', label: 'Labs & Enterprise' }
      ]}
      title="Estúdio Labs & Enterprise"
      description="Recursos experimentais, IA avançada e funcionalidades enterprise"
    >
      <div className="container mx-auto py-6">
        <LabsPrototype />
      </div>
    </AppShell>
  )
}
