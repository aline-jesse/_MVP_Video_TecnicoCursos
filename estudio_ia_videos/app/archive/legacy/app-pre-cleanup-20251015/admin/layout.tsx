
import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { isAdminUser } from '@/lib/auth/admin-middleware'
import { redirect } from 'next/navigation'
import { AdminUnifiedLayout } from '@/components/admin/admin-unified-layout'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check authentication and admin permissions
  const session = await getServerSession(authConfig)
  
  if (!session?.user?.email) {
    redirect('/?message=login-required')
  }

  if (!isAdminUser(session.user.email)) {
    redirect('/?message=admin-required')
  }

  return <AdminUnifiedLayout>{children}</AdminUnifiedLayout>
}
