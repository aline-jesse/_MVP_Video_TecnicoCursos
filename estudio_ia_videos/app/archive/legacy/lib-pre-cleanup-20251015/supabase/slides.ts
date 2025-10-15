import { supabase, supabaseAdmin } from './client'

const getClient = () => (typeof window === 'undefined' ? supabaseAdmin : supabase)

type SlideRow = {
  id: string
  project_id: string
  order_index: number
  title: string | null
  content: string | null
  duration: number | null
  background_color?: string | null
  background_image?: string | null
  avatar_config?: Record<string, unknown> | null
  audio_config?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
}

type SlideInsert = Omit<SlideRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }

/**
 * Busca todos os slides de um projeto específico.
 * @param projectId - O ID do projeto.
 * @returns Uma lista de slides ordenados por 'order_index'.
 */
export async function getSlidesByProjectId(projectId: string): Promise<SlideRow[]> {
  const client = getClient()
  const { data, error } = await client
    .from('slides')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching slides:', error);
    throw new Error(error.message);
  }

  return (data as SlideRow[]) || [];
}

/**
 * Atualiza a ordem dos slides em lote.
 * @param updates - Um array de objetos, cada um com o ID do slide e o novo 'order_index'.
 */
export async function updateSlidesOrder(updates: { id: string; order_index: number }[]) {
  const client = getClient()
  const { data, error } = await client.from('slides').upsert(updates);

  if (error) {
    console.error('Error updating slides order:', error);
    throw new Error(error.message);
  }

  return data as SlideRow[];
}

/**
 * Adiciona um novo slide a um projeto.
 * @param slideData - Os dados do novo slide.
 * @returns O slide recém-criado.
 */
export async function addSlide(slideData: SlideInsert) {
  const client = getClient()
  const { data, error } = await client
        .from('slides')
        .insert([slideData])
        .select();

    if (error) {
        console.error('Error adding slide:', error);
        throw new Error(error.message);
    }

  return data && data[0] ? (data[0] as SlideRow) : null;
}

/**
 * Atualiza os dados de um slide específico.
 * @param slideId - O ID do slide a ser atualizado.
 * @param updates - Os campos a serem atualizados.
 * @returns O slide atualizado.
 */
export async function updateSlide(slideId: string, updates: Partial<SlideRow>) {
  const client = getClient()
  const { data, error } = await client
        .from('slides')
        .update(updates)
        .eq('id', slideId)
        .select();

    if (error) {
        console.error('Error updating slide:', error);
        throw new Error(error.message);
    }

  return data && data[0] ? (data[0] as SlideRow) : null;
}

/**
 * Deleta um slide.
 * @param slideId - O ID do slide a ser deletado.
 */
export async function deleteSlide(slideId: string) {
  const client = getClient()
  const { error } = await client
        .from('slides')
        .delete()
        .eq('id', slideId);

    if (error) {
        console.error('Error deleting slide:', error);
        throw new Error(error.message);
    }

    return true;
}
