export const dynamic = 'force-dynamic';

/**
 * 🎨 Admin Settings API - Gerenciamento das configurações do sistema
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth/admin-middleware'
import { SystemSettingsManager } from '@/lib/admin/system-settings'

export async function GET(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const settings = await SystemSettingsManager.getCurrentSettings()
      return NextResponse.json(settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar configurações' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const data = await request.json()
      
      // Validate required fields
      if (!data.companyName || !data.primaryColor) {
        return NextResponse.json(
          { error: 'Campos obrigatórios: companyName, primaryColor' },
          { status: 400 }
        )
      }

      // Validate color formats
      const colorFields = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor']
      for (const field of colorFields) {
        if (data[field] && !data[field].match(/^#[0-9A-Fa-f]{6}$/)) {
          return NextResponse.json(
            { error: `Cor inválida para ${field}. Use formato HEX (#000000)` },
            { status: 400 }
          )
        }
      }

      const updatedSettings = await SystemSettingsManager.updateSettings(data)
      
      return NextResponse.json(updatedSettings)
      
    } catch (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar configurações' },
        { status: 500 }
      )
    }
  })
}
