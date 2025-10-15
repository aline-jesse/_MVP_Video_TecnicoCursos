-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Políticas de segurança para proteger os dados
-- Data: 09/10/2025

-- ============================================
-- HABILITAR RLS NAS TABELAS
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nr_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nr_modules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA TABELA: users
-- ============================================

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- POLÍTICAS PARA TABELA: projects
-- ============================================

-- Usuários podem ver apenas seus próprios projetos
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem criar projetos
CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas seus próprios projetos
CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar apenas seus próprios projetos
CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA TABELA: slides
-- ============================================

-- Usuários podem ver slides de seus projetos
CREATE POLICY "Users can view own slides" ON public.slides
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = slides.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Usuários podem criar slides em seus projetos
CREATE POLICY "Users can create slides" ON public.slides
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = slides.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Usuários podem atualizar slides de seus projetos
CREATE POLICY "Users can update own slides" ON public.slides
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = slides.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Usuários podem deletar slides de seus projetos
CREATE POLICY "Users can delete own slides" ON public.slides
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = slides.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- ============================================
-- POLÍTICAS PARA TABELA: render_jobs
-- ============================================

-- Usuários podem ver render jobs de seus projetos
CREATE POLICY "Users can view own render jobs" ON public.render_jobs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = render_jobs.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Usuários podem criar render jobs em seus projetos
CREATE POLICY "Users can create render jobs" ON public.render_jobs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = render_jobs.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Usuários podem atualizar render jobs de seus projetos
CREATE POLICY "Users can update own render jobs" ON public.render_jobs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = render_jobs.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- ============================================
-- POLÍTICAS PARA TABELA: analytics_events
-- ============================================

-- Usuários podem ver apenas seus próprios eventos
CREATE POLICY "Users can view own analytics" ON public.analytics_events
    FOR SELECT
    USING (auth.uid() = user_id);

-- Qualquer usuário autenticado pode criar eventos
CREATE POLICY "Authenticated users can create analytics" ON public.analytics_events
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- POLÍTICAS PARA TABELA: nr_courses
-- ============================================

-- Todos podem ver os cursos (conteúdo público)
CREATE POLICY "Anyone can view courses" ON public.nr_courses
    FOR SELECT
    USING (true);

-- Apenas admins podem criar/atualizar/deletar cursos
-- (Nota: Ajuste conforme seu sistema de permissões)

-- ============================================
-- POLÍTICAS PARA TABELA: nr_modules
-- ============================================

-- Todos podem ver os módulos (conteúdo público)
CREATE POLICY "Anyone can view modules" ON public.nr_modules
    FOR SELECT
    USING (true);

-- Apenas admins podem criar/atualizar/deletar módulos
-- (Nota: Ajuste conforme seu sistema de permissões)

-- ============================================
-- FUNÇÕES AUXILIARES PARA ADMIN
-- ============================================

-- Criar uma função para verificar se o usuário é admin
-- (Você precisará ajustar isso conforme seu sistema)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o usuário tem uma claim de admin
    RETURN (
        SELECT COALESCE(
            (auth.jwt() -> 'app_metadata' -> 'role')::text = '"admin"',
            false
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS DE ADMIN PARA CURSOS
-- ============================================

-- Admins podem criar cursos
CREATE POLICY "Admins can create courses" ON public.nr_courses
    FOR INSERT
    WITH CHECK (is_admin());

-- Admins podem atualizar cursos
CREATE POLICY "Admins can update courses" ON public.nr_courses
    FOR UPDATE
    USING (is_admin());

-- Admins podem deletar cursos
CREATE POLICY "Admins can delete courses" ON public.nr_courses
    FOR DELETE
    USING (is_admin());

-- ============================================
-- POLÍTICAS DE ADMIN PARA MÓDULOS
-- ============================================

-- Admins podem criar módulos
CREATE POLICY "Admins can create modules" ON public.nr_modules
    FOR INSERT
    WITH CHECK (is_admin());

-- Admins podem atualizar módulos
CREATE POLICY "Admins can update modules" ON public.nr_modules
    FOR UPDATE
    USING (is_admin());

-- Admins podem deletar módulos
CREATE POLICY "Admins can delete modules" ON public.nr_modules
    FOR DELETE
    USING (is_admin());

-- ============================================
-- GRANTS PARA ROLES
-- ============================================

-- Permitir que usuários autenticados acessem as tabelas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Permitir que usuários anônimos vejam conteúdo público
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.nr_courses TO anon;
GRANT SELECT ON public.nr_modules TO anon;
