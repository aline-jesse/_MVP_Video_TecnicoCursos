import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    return NextResponse.json({
      user: session?.user || null,
      expires: session?.expires || null
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({
      user: null,
      expires: null
    })
  }
}