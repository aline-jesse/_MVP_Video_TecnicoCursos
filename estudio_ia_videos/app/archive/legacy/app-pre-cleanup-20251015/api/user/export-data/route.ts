
/**
 * GET /api/user/export-data
 * Exportar dados do usuário (LGPD)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { LGPDCompliance } from '@/lib/security/lgpd-compliance'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await LGPDCompliance.exportUserData(session.user.id)

    return NextResponse.json(data, {
      headers: {
        'Content-Disposition': `attachment; filename="user-data-${session.user.id}.json"`
      }
    })
  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}
