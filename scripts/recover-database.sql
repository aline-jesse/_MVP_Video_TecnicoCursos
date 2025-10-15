-- =============================================================================
-- SCRIPT DE RECUPERAÇÃO DO BANCO - 14/10/2025 16:47
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FASE 1: LIMPEZA
-- -----------------------------------------------------------------------------

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- -----------------------------------------------------------------------------
-- FASE 2: FUNÇÕES UTILITÁRIAS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_policies()
RETURNS TABLE (
  schema_name text,
  table_name text,
  policy_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT n.nspname::text, c.relname::text, pol.polname::text
  FROM pg_policy pol
  JOIN pg_class c ON c.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- FASE 3: TABELAS PRINCIPAIS
-- -----------------------------------------------------------------------------

-- Tabela: users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela: projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela: slides
CREATE TABLE IF NOT EXISTS public.slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela: render_jobs
CREATE TABLE IF NOT EXISTS public.render_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    error TEXT,
    output_url TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela: analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: nr_courses
CREATE TABLE IF NOT EXISTS public.nr_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    nr_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela: nr_modules
CREATE TABLE IF NOT EXISTS public.nr_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.nr_courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- -----------------------------------------------------------------------------
-- FASE 4: ÍNDICES
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS slides_project_id_idx ON public.slides(project_id);
CREATE INDEX IF NOT EXISTS slides_order_index_idx ON public.slides(order_index);
CREATE INDEX IF NOT EXISTS render_jobs_project_id_idx ON public.render_jobs(project_id);
CREATE INDEX IF NOT EXISTS render_jobs_status_idx ON public.render_jobs(status);
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS nr_modules_course_id_idx ON public.nr_modules(course_id);
CREATE INDEX IF NOT EXISTS nr_modules_order_index_idx ON public.nr_modules(order_index);

-- -----------------------------------------------------------------------------
-- FASE 5: RLS POLICIES
-- -----------------------------------------------------------------------------

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nr_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nr_modules ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Slides Policies
CREATE POLICY "Users can view project slides"
    ON public.slides FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = slides.project_id
        AND user_id = auth.uid()
    ));

CREATE POLICY "Users can manage project slides"
    ON public.slides FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = slides.project_id
        AND user_id = auth.uid()
    ));

-- Render Jobs Policies
CREATE POLICY "Users can view own render jobs"
    ON public.render_jobs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = render_jobs.project_id
        AND user_id = auth.uid()
    ));

CREATE POLICY "Users can create render jobs for own projects"
    ON public.render_jobs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_id
        AND user_id = auth.uid()
    ));

-- Analytics Events Policies
CREATE POLICY "Users can view own analytics"
    ON public.analytics_events FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own analytics"
    ON public.analytics_events FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- NR Courses Policies (Públicas)
CREATE POLICY "Anyone can view NR courses"
    ON public.nr_courses FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage NR courses"
    ON public.nr_courses FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND metadata->>'role' = 'admin'
    ));

-- NR Modules Policies (Públicas)
CREATE POLICY "Anyone can view NR modules"
    ON public.nr_modules FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage NR modules"
    ON public.nr_modules FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND metadata->>'role' = 'admin'
    ));

-- -----------------------------------------------------------------------------
-- FASE 6: DADOS INICIAIS
-- -----------------------------------------------------------------------------

-- Inserir cursos NR iniciais
INSERT INTO public.nr_courses (title, description, nr_number, status, metadata)
VALUES
    ('NR-10: Segurança em Instalações Elétricas', 
     'Curso completo sobre segurança em instalações e serviços com eletricidade', 
     'NR-10',
     'published',
     '{"version": "2023", "hours": 40, "category": "segurança"}'::jsonb),
    
    ('NR-12: Segurança no Trabalho com Máquinas', 
     'Capacitação em segurança para operação de máquinas e equipamentos', 
     'NR-12',
     'published',
     '{"version": "2023", "hours": 30, "category": "segurança"}'::jsonb),
    
    ('NR-35: Trabalho em Altura',
     'Treinamento completo para trabalhos em altura acima de 2 metros',
     'NR-35',
     'published',
     '{"version": "2023", "hours": 20, "category": "segurança"}'::jsonb);

-- Inserir módulos para NR-10
INSERT INTO public.nr_modules (course_id, title, description, order_index)
SELECT 
    id as course_id,
    'Introdução à NR-10' as title,
    'Conceitos básicos e fundamentos da norma' as description,
    1 as order_index
FROM public.nr_courses
WHERE nr_number = 'NR-10';

INSERT INTO public.nr_modules (course_id, title, description, order_index)
SELECT 
    id as course_id,
    'Riscos em Instalações Elétricas' as title,
    'Identificação e prevenção de riscos elétricos' as description,
    2 as order_index
FROM public.nr_courses
WHERE nr_number = 'NR-10';

-- Inserir módulos para NR-12
INSERT INTO public.nr_modules (course_id, title, description, order_index)
SELECT 
    id as course_id,
    'Princípios da NR-12' as title,
    'Fundamentos e aplicações da norma' as description,
    1 as order_index
FROM public.nr_courses
WHERE nr_number = 'NR-12';

-- Inserir módulos para NR-35
INSERT INTO public.nr_modules (course_id, title, description, order_index)
SELECT 
    id as course_id,
    'Trabalho em Altura: Conceitos' as title,
    'Fundamentos e definições do trabalho em altura' as description,
    1 as order_index
FROM public.nr_courses
WHERE nr_number = 'NR-35';

-- -----------------------------------------------------------------------------
-- FASE 7: VALIDAÇÃO
-- -----------------------------------------------------------------------------

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar políticas RLS
SELECT * FROM public.get_policies();

-- Verificar dados iniciais
SELECT count(*) as nr_courses_count FROM public.nr_courses;
SELECT count(*) as nr_modules_count FROM public.nr_modules;