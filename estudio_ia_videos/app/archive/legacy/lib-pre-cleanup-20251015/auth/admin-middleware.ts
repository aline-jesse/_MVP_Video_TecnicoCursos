
/**
 * 🔐 Admin Middleware - Verificação de permissões de administrador
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function withAdminAuth(
  request: NextRequest, 
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  try {
    const token = await getToken({ req: request })
    
    // Verificar se o usuário está autenticado
    if (!token) {
      return NextResponse.json(
        { error: 'Acesso negado - Login necessário' },
        { status: 401 }
      )
    }

    // Verificar se o usuário é admin
    const userEmail = token.email
    const isAdmin = userEmail?.includes('admin') || userEmail === 'admin@estudio.ai' // Simplified check
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado - Permissões de administrador necessárias' },
        { status: 403 }
      )
    }

    // Adicionar informações do usuário ao request
    (request as any).user = {
      id: token.sub,
      email: token.email,
      name: token.name,
      role: 'admin'
    }

    return handler(request)
    
  } catch (error) {
    console.error('Admin middleware error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false
  return email.includes('admin') || email === 'admin@estudio.ai'
}
