import type { Project } from '../supabase'

export type CreateProjectInput = {
  ownerId: string
  name: string
  description?: string | null
  settings?: Project['settings']
}

export type ProjectWithSummary = Project & {
  slideCount: number
  lastRenderAt: string | null
}
