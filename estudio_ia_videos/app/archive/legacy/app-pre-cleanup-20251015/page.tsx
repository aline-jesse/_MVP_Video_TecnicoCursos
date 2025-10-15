
"use client"

import React from 'react'
import EnhancedDashboardV3 from '../components/enhanced-features/enhanced-dashboard-v3'
import LayoutWithNavigation from '../components/layout/layout-with-navigation'

export default function HomePage() {
  return (
    <LayoutWithNavigation>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <EnhancedDashboardV3 />
        </div>
      </div>
    </LayoutWithNavigation>
  )
}
