export const dynamic = 'force-dynamic';

/**
 * 📤 Settings Export API - Exportar configurações do sistema
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth/admin-middleware'
import { SystemSettingsManager } from '@/lib/admin/system-settings'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const settings = await SystemSettingsManager.exportSettings()
      
      // Remove sensitive data from export
      const exportData = {
        ...settings,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      }

      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="system-settings-${new Date().toISOString().split('T')[0]}.json"`,
          'Content-Type': 'application/json'
        }
      })
      
    } catch (error) {
      console.error('Error exporting settings:', error)
      return NextResponse.json(
        { error: 'Erro ao exportar configurações' },
        { status: 500 }
      )
    }
  })
}
