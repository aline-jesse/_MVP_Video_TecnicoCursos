-- ============================================
-- CONFIGURAÇÃO DE RLS (ROW LEVEL SECURITY)
-- Execute este script APÓS criar as tabelas
-- ============================================

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nr_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nr_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FUNÇÃO PARA VERIFICAR ADMINISTRADORES
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. POLÍTICAS PARA TABELA USERS
-- ============================================
-- Usuários podem ver seus próprios dados
CREATE POLICY "users_select_own" ON public.users
FOR SELECT USING (auth.uid() = id OR is_admin());

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "users_update_own" ON public.users
FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Usuários podem inserir seus próprios dados
CREATE POLICY "users_insert_own" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id OR is_admin());

-- ============================================
-- 4. POLÍTICAS PARA TABELA PROJECTS
-- ============================================
-- Usuários podem ver seus próprios projetos
CREATE POLICY "projects_select_own" ON public.projects
FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Usuários podem criar projetos
CREATE POLICY "projects_insert_own" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

-- Usuários podem atualizar seus próprios projetos
CREATE POLICY "projects_update_own" ON public.projects
FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Usuários podem deletar seus próprios projetos
CREATE POLICY "projects_delete_own" ON public.projects
FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- 5. POLÍTICAS PARA TABELA SLIDES
-- ============================================
-- Usuários podem ver slides de seus projetos
CREATE POLICY "slides_select_own" ON public.slides
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.projects WHERE id = slides.project_id
  ) OR is_admin()
);

-- Usuários podem criar slides em seus projetos
CREATE POLICY "slides_insert_own" ON public.slides
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.projects WHERE id = slides.project_id
  ) OR is_admin()
);

-- Usuários podem atualizar slides de seus projetos
CREATE POLICY "slides_update_own" ON public.slides
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM public.projects WHERE id = slides.project_id
  ) OR is_admin()
);

-- Usuários podem deletar slides de seus projetos
CREATE POLICY "slides_delete_own" ON public.slides
FOR DELETE USING (
  auth.uid() IN (
    SELECT user_id FROM public.projects WHERE id = slides.project_id
  ) OR is_admin()
);

-- ============================================
-- 6. POLÍTICAS PARA TABELA RENDER_JOBS
-- ============================================
-- Usuários podem ver jobs de seus projetos
CREATE POLICY "render_jobs_select_own" ON public.render_jobs
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.projects WHERE id = render_jobs.project_id
  ) OR is_admin()
);

-- Usuários podem criar jobs para seus projetos
CREATE POLICY "render_jobs_insert_own" ON public.render_jobs
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.projects WHERE id = render_jobs.project_id
  ) OR is_admin()
);

-- Usuários podem atualizar jobs de seus projetos
CREATE POLICY "render_jobs_update_own" ON public.render_jobs
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM public.projects WHERE id = render_jobs.project_id
  ) OR is_admin()
);

-- ============================================
-- 7. POLÍTICAS PARA TABELA ANALYTICS_EVENTS
-- ============================================
-- Usuários podem ver seus próprios eventos
CREATE POLICY "analytics_select_own" ON public.analytics_events
FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Usuários podem inserir seus próprios eventos
CREATE POLICY "analytics_insert_own" ON public.analytics_events
FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

-- ============================================
-- 8. POLÍTICAS PARA CURSOS NR (PÚBLICOS)
-- ============================================
-- Todos podem ver cursos NR
CREATE POLICY "nr_courses_select_all" ON public.nr_courses
FOR SELECT USING (true);

-- Apenas admins podem modificar cursos NR
CREATE POLICY "nr_courses_admin_only" ON public.nr_courses
FOR ALL USING (is_admin());

-- Todos podem ver módulos NR
CREATE POLICY "nr_modules_select_all" ON public.nr_modules
FOR SELECT USING (true);

-- Apenas admins podem modificar módulos NR
CREATE POLICY "nr_modules_admin_only" ON public.nr_modules
FOR ALL USING (is_admin());

-- ============================================
-- 9. POLÍTICAS PARA COURSES (SISTEMA LEGADO)
-- ============================================
-- Todos podem ver cursos
CREATE POLICY "courses_select_all" ON public.courses
FOR SELECT USING (true);

-- Apenas autores podem modificar seus cursos
CREATE POLICY "courses_author_only" ON public.courses
FOR ALL USING (auth.uid() = author_id OR is_admin());

-- ============================================
-- 10. POLÍTICAS PARA VIDEOS
-- ============================================
-- Todos podem ver vídeos
CREATE POLICY "videos_select_all" ON public.videos
FOR SELECT USING (true);

-- Apenas autores dos cursos podem modificar vídeos
CREATE POLICY "videos_author_only" ON public.videos
FOR ALL USING (
  auth.uid() IN (
    SELECT author_id FROM public.courses WHERE id = videos.course_id
  ) OR is_admin()
);

-- ============================================
-- 11. POLÍTICAS PARA USER_PROGRESS
-- ============================================
-- Usuários podem ver seu próprio progresso
CREATE POLICY "user_progress_select_own" ON public.user_progress
FOR SELECT USING (auth.uid() = user_id OR is_admin());

-- Usuários podem inserir seu próprio progresso
CREATE POLICY "user_progress_insert_own" ON public.user_progress
FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

-- Usuários podem atualizar seu próprio progresso
CREATE POLICY "user_progress_update_own" ON public.user_progress
FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- 12. POLÍTICAS PARA STORAGE
-- ============================================
-- Configurar políticas para buckets de storage
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "videos_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "videos_user_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "thumbnails_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "thumbnails_user_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'thumbnails' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "renders_user_access" ON storage.objects
FOR ALL USING (
  bucket_id = 'renders' AND 
  (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
);

-- ============================================
-- RLS CONFIGURADO COM SUCESSO!
-- ============================================
-- Todas as políticas de segurança foram aplicadas.
-- O sistema agora está protegido com Row Level Security.