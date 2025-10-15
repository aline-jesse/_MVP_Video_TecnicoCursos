-- Criação das tabelas principais do sistema de vídeos
-- Executar no Supabase SQL Editor

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'video',
    status VARCHAR(50) DEFAULT 'draft',
    owner_id VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de slides dos projetos
CREATE TABLE IF NOT EXISTS public.project_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    slide_number INTEGER NOT NULL,
    title VARCHAR(500),
    content TEXT,
    audio_url VARCHAR(500),
    image_url VARCHAR(500),
    duration DECIMAL(10,2) DEFAULT 5.0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, slide_number)
);

-- Tabela de jobs de renderização
CREATE TABLE IF NOT EXISTS public.render_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    output_url VARCHAR(500),
    error_message TEXT,
    settings JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de templates
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    settings JSONB DEFAULT '{}',
    preview_url VARCHAR(500),
    is_public BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assets (imagens, vídeos, áudios)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio'
    url VARCHAR(500) NOT NULL,
    size_bytes BIGINT,
    mime_type VARCHAR(100),
    owner_id VARCHAR(255) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_slides_project_id ON public.project_slides(project_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_project_id ON public.render_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_user_id ON public.render_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON public.render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON public.assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(type);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_slides_updated_at BEFORE UPDATE ON public.project_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_render_jobs_updated_at BEFORE UPDATE ON public.render_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Habilitar
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
-- Projetos: usuários podem ver e editar apenas seus próprios projetos
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (owner_id = auth.uid()::text OR is_public = true);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (owner_id = auth.uid()::text);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (owner_id = auth.uid()::text);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (owner_id = auth.uid()::text);

-- Slides: usuários podem acessar slides de projetos que possuem
CREATE POLICY "Users can view slides of own projects" ON public.project_slides FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_slides.project_id AND (owner_id = auth.uid()::text OR is_public = true))
);
CREATE POLICY "Users can insert slides in own projects" ON public.project_slides FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_slides.project_id AND owner_id = auth.uid()::text)
);
CREATE POLICY "Users can update slides in own projects" ON public.project_slides FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_slides.project_id AND owner_id = auth.uid()::text)
);
CREATE POLICY "Users can delete slides in own projects" ON public.project_slides FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_slides.project_id AND owner_id = auth.uid()::text)
);

-- Render Jobs: usuários podem ver apenas seus próprios jobs
CREATE POLICY "Users can view own render jobs" ON public.render_jobs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own render jobs" ON public.render_jobs FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own render jobs" ON public.render_jobs FOR UPDATE USING (user_id = auth.uid()::text);

-- Templates: todos podem ver templates públicos, apenas criadores podem editar
CREATE POLICY "Anyone can view public templates" ON public.templates FOR SELECT USING (is_public = true OR created_by = auth.uid()::text);
CREATE POLICY "Users can insert templates" ON public.templates FOR INSERT WITH CHECK (created_by = auth.uid()::text);
CREATE POLICY "Users can update own templates" ON public.templates FOR UPDATE USING (created_by = auth.uid()::text);
CREATE POLICY "Users can delete own templates" ON public.templates FOR DELETE USING (created_by = auth.uid()::text);

-- Assets: usuários podem ver assets públicos e próprios
CREATE POLICY "Users can view accessible assets" ON public.assets FOR SELECT USING (owner_id = auth.uid()::text OR is_public = true);
CREATE POLICY "Users can insert own assets" ON public.assets FOR INSERT WITH CHECK (owner_id = auth.uid()::text);
CREATE POLICY "Users can update own assets" ON public.assets FOR UPDATE USING (owner_id = auth.uid()::text);
CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE USING (owner_id = auth.uid()::text);

-- Permissões para roles anon e authenticated
GRANT SELECT ON public.projects TO anon;
GRANT ALL PRIVILEGES ON public.projects TO authenticated;

GRANT SELECT ON public.project_slides TO anon;
GRANT ALL PRIVILEGES ON public.project_slides TO authenticated;

GRANT SELECT ON public.render_jobs TO anon;
GRANT ALL PRIVILEGES ON public.render_jobs TO authenticated;

GRANT SELECT ON public.templates TO anon;
GRANT ALL PRIVILEGES ON public.templates TO authenticated;

GRANT SELECT ON public.assets TO anon;
GRANT ALL PRIVILEGES ON public.assets TO authenticated;

-- Inserir alguns dados de exemplo
INSERT INTO public.templates (name, description, category, settings, is_public) VALUES
('Template Básico', 'Template simples para apresentações', 'presentation', '{"width": 1920, "height": 1080, "fps": 30}', true),
('Template Corporativo', 'Template profissional para empresas', 'business', '{"width": 1920, "height": 1080, "fps": 30}', true),
('Template Educacional', 'Template para conteúdo educativo', 'education', '{"width": 1920, "height": 1080, "fps": 30}', true);

-- Comentários para documentação
COMMENT ON TABLE public.projects IS 'Tabela principal de projetos de vídeo';
COMMENT ON TABLE public.project_slides IS 'Slides individuais de cada projeto';
COMMENT ON TABLE public.render_jobs IS 'Jobs de renderização de vídeos';
COMMENT ON TABLE public.templates IS 'Templates disponíveis para projetos';
COMMENT ON TABLE public.assets IS 'Assets (imagens, vídeos, áudios) do sistema';