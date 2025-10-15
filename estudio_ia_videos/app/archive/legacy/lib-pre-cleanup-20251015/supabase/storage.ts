import { supabase } from './client'

type RenderJobRow = {
    id: string
    project_id: string | null
    status: string | null
    progress?: number | null
    output_url?: string | null
    error_message?: string | null
    render_settings?: Record<string, unknown> | null
    started_at?: string | null
    completed_at?: string | null
    created_at?: string | null
}

/**
 * Inicia um novo job de renderização.
 * @param projectId - O ID do projeto a ser renderizado.
 * @param renderSettings - Configurações específicas para a renderização.
 * @returns O job de renderização criado.
 */
export async function startRenderJob(projectId: string, renderSettings: object = {}) {
    const { data, error } = await supabase
        .from('render_jobs')
        .insert([{ project_id: projectId, status: 'pending', render_settings: renderSettings }])
        .select();

    if (error) {
        console.error('Error starting render job:', error);
        throw new Error(error.message);
    }

    return data ? data[0] : null;
}

/**
 * Atualiza o status e o progresso de um job de renderização.
 * @param jobId - O ID do job.
 * @param updates - Os campos a serem atualizados (status, progress, etc.).
 * @returns O job atualizado.
 */
export async function updateRenderJob(jobId: string, updates: { status?: string; progress?: number; output_url?: string; error_message?: string }) {
    const { data, error } = await supabase
        .from('render_jobs')
        .update({ ...updates, ...(updates.status === 'processing' && { started_at: new Date().toISOString() }), ...(updates.status === 'completed' && { completed_at: new Date().toISOString() })})
        .eq('id', jobId)
        .select();

    if (error) {
        console.error('Error updating render job:', error);
        throw new Error(error.message);
    }

    return data ? data[0] : null;
}

/**
 * Faz o upload de um arquivo de vídeo para o Supabase Storage.
 * @param file - O arquivo de vídeo a ser enviado.
 * @param fileName - O nome do arquivo no bucket.
 * @returns A URL pública do arquivo.
 */
export async function uploadVideoToStorage(file: File, fileName: string) {
    const { data, error } = await supabase.storage
        .from('videos') // Nome do bucket
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error uploading video:', error);
        throw new Error(error.message);
    }

    const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(fileName);
    
    return publicUrl;
}
