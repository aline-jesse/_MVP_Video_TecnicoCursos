/**
 * 🎙️ API de Créditos TTS
 * GET /api/tts/credits - Verificar créditos disponíveis
 */

import { NextRequest, NextResponse } from 'next/server'
import { TTSManager } from '@/lib/tts/manager'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') || 'elevenlabs'

    // Buscar créditos do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tts_credits_used, tts_credits_limit')
      .eq('id', session.user.id)
      .single()

    const creditsUsed = profile?.tts_credits_used || 0
    const creditsLimit = profile?.tts_credits_limit || 10000
    const creditsRemaining = creditsLimit - creditsUsed

    // Buscar info do provider (se ElevenLabs)
    let providerInfo = null
    
    if (provider === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
      try {
        const ttsManager = new TTSManager({
          elevenlabs: {
            apiKey: process.env.ELEVENLABS_API_KEY,
          },
        })

        providerInfo = await ttsManager.getUsageInfo('elevenlabs')
      } catch (error) {
        console.error('Error fetching provider info:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          used: creditsUsed,
          limit: creditsLimit,
          remaining: creditsRemaining,
          percentage: (creditsUsed / creditsLimit) * 100,
        },
        provider: providerInfo,
      },
    })

  } catch (error) {
    console.error('Error fetching credits:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}
