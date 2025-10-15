-- ============================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO BANCO DE DADOS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. CRIAÇÃO DAS TABELAS PRINCIPAIS
-- ============================================

-- TABELA: users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- TABELA: projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: slides
CREATE TABLE IF NOT EXISTS public.slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title VARCHAR(500),
    content TEXT,
    duration INTEGER DEFAULT 5,
    background_color VARCHAR(50),
    background_image TEXT,
    avatar_config JSONB DEFAULT '{}'::jsonb,
    audio_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: render_jobs
CREATE TABLE IF NOT EXISTS public.render_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    output_url TEXT,
    error_message TEXT,
    render_settings JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    session_id VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: nr_courses (Cursos NR)
CREATE TABLE IF NOT EXISTS public.nr_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(10) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    modules_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: nr_modules (Módulos dos Cursos)
CREATE TABLE IF NOT EXISTS public.nr_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.nr_courses(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    duration INTEGER,
    content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABELAS PARA COMPATIBILIDADE COM TESTES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    thumbnail_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    video_url TEXT,
    duration INTEGER,
    order_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- ============================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_slides_project_id ON public.slides(project_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_project_id ON public.render_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_nr_modules_course_id ON public.nr_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_author_id ON public.courses(author_id);
CREATE INDEX IF NOT EXISTS idx_videos_course_id ON public.videos(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON public.user_progress(course_id);

-- ============================================
-- 3. TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON public.slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nr_courses_updated_at BEFORE UPDATE ON public.nr_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nr_modules_updated_at BEFORE UPDATE ON public.nr_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. DADOS DE EXEMPLO
-- ============================================
INSERT INTO public.nr_courses (course_code, title, description, thumbnail_url, duration, modules_count) VALUES
('NR12', 'Segurança no Trabalho em Máquinas e Equipamentos', 'Curso completo sobre NR-12 - Segurança no Trabalho em Máquinas e Equipamentos', '/nr12-thumb.jpg', 480, 6),
('NR33', 'Segurança e Saúde nos Trabalhos em Espaços Confinados', 'Curso sobre NR-33 - Trabalhos em Espaços Confinados', '/nr33-thumb.jpg', 360, 4),
('NR35', 'Trabalho em Altura', 'Curso sobre NR-35 - Trabalho em Altura', '/nr35-thumb.jpg', 240, 3)
ON CONFLICT (course_code) DO NOTHING;

-- Módulos NR12
INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration) VALUES
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 1, 'Introdução à NR-12', 'Conceitos básicos e objetivos da norma', '/nr12-intro.jpg', 80),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 2, 'Arranjos Físicos e Instalações', 'Requisitos para arranjos físicos seguros', '/nr12-arranjo.jpg', 90),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 3, 'Instalações e Dispositivos Elétricos', 'Segurança em instalações elétricas', '/nr12-eletrico.jpg', 85),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 4, 'Dispositivos de Partida, Acionamento e Parada', 'Sistemas de controle e segurança', '/nr12-partida.jpg', 75),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 5, 'Sistemas de Segurança', 'Implementação de sistemas de proteção', '/nr12-seguranca.jpg', 95),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 6, 'Objetivos e Campo de Aplicação', 'Aplicação prática da norma', '/nr12-objetivos.jpg', 55)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. CONFIGURAÇÃO DE STORAGE
-- ============================================
-- Criar buckets para armazenamento
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('videos', 'videos', true),
('thumbnails', 'thumbnails', true),
('renders', 'renders', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SCRIPT EXECUTADO COM SUCESSO!
-- ============================================
-- Próximos passos:
-- 1. Configure as políticas RLS executando o arquivo rls-policies.sql
-- 2. Teste a conexão através da página /supabase-test
-- 3. Verifique se todas as tabelas foram criadas corretamente