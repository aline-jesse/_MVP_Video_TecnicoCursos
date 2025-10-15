-- ============================================
-- FASE 2: Avatares 3D Hiper-Realistas
-- Migração: Políticas RLS (Row Level Security)
-- ============================================

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE avatar_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio2face_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA avatar_models
-- ============================================

-- Leitura: Todos podem ver modelos ativos
CREATE POLICY "avatar_models_select_policy" ON avatar_models
    FOR SELECT USING (is_active = true);

-- Inserção: Apenas usuários autenticados podem criar modelos
CREATE POLICY "avatar_models_insert_policy" ON avatar_models
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Atualização: Apenas o criador ou admin pode atualizar
CREATE POLICY "avatar_models_update_policy" ON avatar_models
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Exclusão: Apenas o criador ou admin pode excluir
CREATE POLICY "avatar_models_delete_policy" ON avatar_models
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- POLÍTICAS PARA voice_profiles
-- ============================================

-- Leitura: Todos podem ver perfis ativos
CREATE POLICY "voice_profiles_select_policy" ON voice_profiles
    FOR SELECT USING (is_active = true);

-- Inserção: Apenas usuários autenticados podem criar perfis
CREATE POLICY "voice_profiles_insert_policy" ON voice_profiles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Atualização: Apenas o criador ou admin pode atualizar
CREATE POLICY "voice_profiles_update_policy" ON voice_profiles
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Exclusão: Apenas o criador ou admin pode excluir
CREATE POLICY "voice_profiles_delete_policy" ON voice_profiles
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- POLÍTICAS PARA render_jobs
-- ============================================

-- Leitura: Usuários podem ver apenas seus próprios jobs
CREATE POLICY "render_jobs_select_policy" ON render_jobs
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Inserção: Apenas usuários autenticados podem criar jobs
CREATE POLICY "render_jobs_insert_policy" ON render_jobs
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = user_id
    );

-- Atualização: Usuários podem atualizar apenas seus próprios jobs
CREATE POLICY "render_jobs_update_policy" ON render_jobs
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Exclusão: Usuários podem excluir apenas seus próprios jobs
CREATE POLICY "render_jobs_delete_policy" ON render_jobs
    FOR DELETE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- POLÍTICAS PARA audio2face_sessions
-- ============================================

-- Leitura: Usuários podem ver sessões de seus próprios jobs
CREATE POLICY "audio2face_sessions_select_policy" ON audio2face_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM render_jobs 
            WHERE id = render_job_id 
            AND (
                user_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE id = auth.uid() 
                    AND raw_user_meta_data->>'role' = 'admin'
                )
            )
        )
    );

-- Inserção: Sistema pode criar sessões para jobs válidos
CREATE POLICY "audio2face_sessions_insert_policy" ON audio2face_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM render_jobs 
            WHERE id = render_job_id
        )
    );

-- Atualização: Sistema pode atualizar sessões
CREATE POLICY "audio2face_sessions_update_policy" ON audio2face_sessions
    FOR UPDATE USING (true);

-- ============================================
-- POLÍTICAS PARA avatar_analytics
-- ============================================

-- Leitura: Usuários podem ver apenas suas próprias analytics
CREATE POLICY "avatar_analytics_select_policy" ON avatar_analytics
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Inserção: Sistema pode inserir analytics
CREATE POLICY "avatar_analytics_insert_policy" ON avatar_analytics
    FOR INSERT WITH CHECK (true);

-- ============================================
-- POLÍTICAS PARA system_stats
-- ============================================

-- Leitura: Apenas admins podem ver estatísticas do sistema
CREATE POLICY "system_stats_select_policy" ON system_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Inserção: Sistema pode inserir estatísticas
CREATE POLICY "system_stats_insert_policy" ON system_stats
    FOR INSERT WITH CHECK (true);

-- Atualização: Sistema pode atualizar estatísticas
CREATE POLICY "system_stats_update_policy" ON system_stats
    FOR UPDATE USING (true);

-- ============================================
-- PERMISSÕES PARA ROLES
-- ============================================

-- Conceder permissões básicas para role anon (usuários não autenticados)
GRANT SELECT ON avatar_models TO anon;
GRANT SELECT ON voice_profiles TO anon;

-- Conceder permissões completas para role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON avatar_models TO authenticated;
GRANT ALL PRIVILEGES ON voice_profiles TO authenticated;
GRANT ALL PRIVILEGES ON render_jobs TO authenticated;
GRANT ALL PRIVILEGES ON audio2face_sessions TO authenticated;
GRANT ALL PRIVILEGES ON avatar_analytics TO authenticated;

-- Conceder permissões limitadas para system_stats
GRANT SELECT ON system_stats TO authenticated;

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário pode acessar render job
CREATE OR REPLACE FUNCTION can_access_render_job(job_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM render_jobs 
        WHERE id = job_id 
        AND (user_id = render_jobs.user_id OR is_admin(user_id))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas do usuário
CREATE OR REPLACE FUNCTION get_user_render_stats(user_id UUID)
RETURNS TABLE (
    total_jobs BIGINT,
    completed_jobs BIGINT,
    failed_jobs BIGINT,
    avg_render_time DECIMAL,
    avg_lipsync_accuracy DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_jobs,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
        AVG(render_time_seconds) as avg_render_time,
        AVG(lipsync_accuracy) as avg_lipsync_accuracy
    FROM render_jobs 
    WHERE render_jobs.user_id = get_user_render_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON POLICY "avatar_models_select_policy" ON avatar_models IS 'Permite leitura de modelos ativos para todos';
COMMENT ON POLICY "render_jobs_select_policy" ON render_jobs IS 'Usuários podem ver apenas seus próprios jobs de renderização';
COMMENT ON FUNCTION is_admin(UUID) IS 'Verifica se um usuário tem privilégios de administrador';
COMMENT ON FUNCTION get_user_render_stats(UUID) IS 'Retorna estatísticas de renderização para um usuário específico';