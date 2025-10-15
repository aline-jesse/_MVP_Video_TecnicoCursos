import { supabase, supabaseAdmin } from './client'

const getClient = () => (typeof window === 'undefined' ? supabaseAdmin : supabase)

type ProjectRow = {
    id: string
    user_id: string
    title: string
    description?: string | null
    status?: string | null
    settings?: Record<string, unknown> | null
    created_at?: string | null
    updated_at?: string | null
}

type ProjectInsert = Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }

/**
 * Cria um novo projeto para o usuário logado.
 * @param projectData - Dados iniciais do projeto (título, descrição).
 * @param userId - O ID do usuário.
 * @returns O projeto recém-criado.
 */
export async function createProject(projectData: ProjectInsert): Promise<ProjectRow | null> {
    const client = getClient()
    const { data, error } = await client
        .from('projects')
        .insert([projectData])
        .select();

    if (error) {
        console.error('Error creating project:', error);
        throw new Error(error.message);
    }

    return data && data[0] ? (data[0] as ProjectRow) : null;
}

/**
 * Busca um projeto pelo seu ID.
 * @param projectId - O ID do projeto.
 * @returns Os dados do projeto.
 */
export async function getProjectById(projectId: string): Promise<ProjectRow | null> {
    const client = getClient()
    const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error) {
        console.error('Error fetching project:', error);
        throw new Error(error.message);
    }

    return (data as ProjectRow) ?? null;
}
