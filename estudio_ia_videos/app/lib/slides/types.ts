import type { Database } from '../supabase'

type SlideTable = Database['public']['Tables']['slides']

export type SlideInsert = SlideTable['Insert']

export type SlideUpdate = {
  id: string
  project_id: string
  order_index: number
  title?: string | null
  content?: SlideTable['Insert']['content']
  duration?: number | null
  background_color?: string | null
  background_image?: string | null
  avatar_config?: SlideTable['Insert']['avatar_config']
  audio_config?: SlideTable['Insert']['audio_config']
}
