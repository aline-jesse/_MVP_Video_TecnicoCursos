import { createServerClientInstance } from '../supabase/server'
import type { RenderJob } from '../supabase'

export async function listRenderJobs(projectId: string): Promise<RenderJob[]> {
  const supabase = createServerClientInstance()
  const { data, error } = await supabase
    .from('render_jobs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load render jobs: ${error.message}`)
  }

  return (data ?? []) as RenderJob[]
}

export async function getRenderJob(jobId: string): Promise<RenderJob | null> {
  const supabase = createServerClientInstance()
  const { data, error } = await supabase
    .from('render_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load render job: ${error.message}`)
  }

  return (data ?? null) as RenderJob | null
}

export async function updateRenderJob(jobId: string, patch: Partial<RenderJob>): Promise<void> {
  const supabase = createServerClientInstance()
  const { error } = await supabase
    .from('render_jobs')
    .update(patch)
    .eq('id', jobId)

  if (error) {
    throw new Error(`Failed to update render job: ${error.message}`)
  }
}

export { type RenderJob } from '../supabase'
