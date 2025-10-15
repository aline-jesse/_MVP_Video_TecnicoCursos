
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Para o MVP, usar autenticação simplificada sem banco
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Para demo do MVP, aceitar qualquer email válido
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Para MVP, simular criação de usuário bem-sucedida
    return NextResponse.json({
      message: 'Conta criada com sucesso! Use a senha "demo123" para fazer login.',
      user: {
        email,
        name: name || email.split('@')[0]
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro no signup:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Endpoint de cadastro ativo' },
    { status: 200 }
  )
}
