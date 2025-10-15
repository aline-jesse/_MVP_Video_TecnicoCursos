
/**
 * DELETE /api/user/delete-account
 * Deletar conta e dados (LGPD)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { LGPDCompliance } from '@/lib/security/lgpd-compliance'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await LGPDCompliance.deleteUserData(session.user.id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar conta:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar conta' },
      { status: 500 }
    )
  }
}
