
'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AppBreadcrumbs } from '@/components/navigation/app-breadcrumbs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AdminUnifiedLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AdminUnifiedLayout({
  children,
  title,
  description,
}: AdminUnifiedLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <AppBreadcrumbs />
            </div>
            {title && (
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {description && (
                  <p className="text-muted-foreground text-sm mt-1">{description}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
