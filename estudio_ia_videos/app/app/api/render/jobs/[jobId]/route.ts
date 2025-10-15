import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClientInstance } from '@/lib/supabase/server'

type RouteContext = {
  params: {
    jobId: string
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { jobId } = context.params

  if (!jobId) {
    return NextResponse.json({ error: 'jobId param is required' }, { status: 400 })
  }

  const supabase = createServerClientInstance()
  const { data, error } = await supabase
    .from('render_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({
      error: 'Failed to load render job',
      details: error.message,
    }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Render job not found' }, { status: 404 })
  }

  return NextResponse.json({ job: data })
}
