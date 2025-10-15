

'use client'

/**
 * 📊 PÁGINA DE ANALYTICS REAL - Sprint 48
 * Dashboard de analytics com dados REAIS (não mock)
 */

import React from 'react'
import AppShell from '../../components/layouts/AppShell'
import RealTimeAnalyticsReal from '../../components/analytics/real-time-analytics-real'
import { Shield, BarChart3, Activity } from 'lucide-react'

export default function AnalyticsRealPage() {
  return (
    <AppShell
      breadcrumbs={[
        { href: '/', label: 'Início' },
        { href: '/analytics-real', label: 'Analytics Real' }
      ]}
      title="Analytics em Tempo Real"
      description="Métricas avançadas de engajamento, performance e uso da plataforma - DADOS REAIS"
    >
      <div className="container mx-auto py-6">
        <RealTimeAnalyticsReal />
      </div>
    </AppShell>
  )
}

