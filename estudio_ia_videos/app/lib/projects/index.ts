import { getServiceRoleClient } from '../supabase'
import type { Project } from '../supabase'
import type { CreateProjectInput } from './types'

export async function listProjectsByOwner(ownerId: string): Promise<Project[]> {
  const supabase = getServiceRoleClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`)
  }

  return (data ?? []) as Project[]
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const supabase = getServiceRoleClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to load project: ${error.message}`)
  }

  return (data ?? null) as Project | null
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const supabase = getServiceRoleClient()
  const payload = {
    owner_id: input.ownerId,
    name: input.name,
    description: input.description ?? null,
    status: 'draft' as const,
    settings: input.settings ?? null,
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }

  return data as Project
}

export { type Project } from '../supabase'
export * from './types'
