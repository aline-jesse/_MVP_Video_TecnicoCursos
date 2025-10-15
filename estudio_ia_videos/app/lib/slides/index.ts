import { getServiceRoleClient } from '../supabase'
import type { Slide } from '../supabase'
import type { SlideInsert, SlideUpdate } from './types'

export async function listSlides(projectId: string): Promise<Slide[]> {
  const supabase = getServiceRoleClient()
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })
    .returns<Slide[]>()

  if (error) {
    throw new Error(`Failed to load slides: ${error.message}`)
  }

  return data ?? []
}

export async function upsertSlides(slides: SlideUpdate[]): Promise<void> {
  const supabase = getServiceRoleClient()
  const payload: SlideInsert[] = slides.map((slide) => {
    const base: SlideInsert = {
      id: slide.id,
      project_id: slide.project_id,
      order_index: slide.order_index,
    }

    if (slide.title !== undefined) {
      base.title = slide.title ?? null
    }

    if (slide.content !== undefined) {
      base.content = slide.content ?? null
    }

    if (slide.duration !== undefined) {
      base.duration = slide.duration ?? null
    }

    if (slide.background_color !== undefined) {
      base.background_color = slide.background_color ?? null
    }

    if (slide.background_image !== undefined) {
      base.background_image = slide.background_image ?? null
    }

    if (slide.avatar_config !== undefined) {
      base.avatar_config = slide.avatar_config ?? null
    }

    if (slide.audio_config !== undefined) {
      base.audio_config = slide.audio_config ?? null
    }

    return base
  })

  const { error } = await supabase.from('slides').upsert(payload, { onConflict: 'id' })

  if (error) {
    throw new Error(`Failed to save slides: ${error.message}`)
  }
}

export async function createSlides(slides: SlideInsert[]): Promise<Slide[]> {
  const supabase = getServiceRoleClient()
  const { data, error } = await supabase
    .from('slides')
    .insert(slides)
    .select('*')
    .order('order_index', { ascending: true })
    .returns<Slide[]>()

  if (error) {
    throw new Error(`Failed to create slides: ${error.message}`)
  }

  return data ?? []
}

export async function deleteSlide(id: string): Promise<void> {
  const supabase = getServiceRoleClient()
  const { error } = await supabase.from('slides').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete slide: ${error.message}`)
  }
}

export { type Slide } from '../supabase'
export * from './types'
