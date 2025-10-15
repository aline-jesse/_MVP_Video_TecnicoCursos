-- ============================================
-- MIGRAÇÃO COMPLETA PARA SUPABASE
-- Data: 7 de outubro de 2025
-- Versão: v7.0 - Estúdio IA Vídeos
-- ============================================

-- ============================================
-- 1. SCHEMA PRINCIPAL (Baseado no Prisma existente)
-- ============================================

-- Tabela de usuários (compatível com Auth do Supabase)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image TEXT,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizações
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membros da organização
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, user_id)
);

-- Projetos
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active',
    
    -- PPTX Processing Fields
    pptx_metadata JSONB,
    pptx_assets JSONB,
    pptx_timeline JSONB,
    pptx_stats JSONB,
    images_extracted INTEGER DEFAULT 0,
    processing_time DOUBLE PRECISION,
    phase TEXT,
    failed_at TEXT,
    
    -- Metadata
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slides
CREATE TABLE IF NOT EXISTS slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    slide_number INTEGER NOT NULL,
    duration DOUBLE PRECISION DEFAULT 3.0,
    
    -- PPTX Extracted Data
    extracted_text TEXT,
    slide_notes TEXT,
    slide_layout JSONB,
    slide_images JSONB,
    slide_elements JSONB,
    slide_metrics JSONB,
    background_type TEXT,
    background_color TEXT,
    background_image TEXT,
    
    -- Avatar & Voice
    avatar_model_id UUID,
    voice_profile_id UUID,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uploads de arquivos
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(255),
    upload_type VARCHAR(50),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs de renderização
CREATE TABLE IF NOT EXISTS render_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    -- Configurações do job
    avatar_model_id UUID,
    voice_profile_id UUID,
    status VARCHAR(50) DEFAULT 'pending',
    quality VARCHAR(50) DEFAULT 'standard',
    resolution VARCHAR(50) DEFAULT '1080p',
    
    -- Conteúdo
    script_text TEXT,
    audio_file_url TEXT,
    
    -- Configurações avançadas
    enable_audio2face BOOLEAN DEFAULT false,
    enable_real_time_lipsync BOOLEAN DEFAULT false,
    enable_ray_tracing BOOLEAN DEFAULT false,
    camera_angle VARCHAR(50) DEFAULT 'front',
    lighting_preset VARCHAR(50) DEFAULT 'studio',
    background_type VARCHAR(50) DEFAULT 'green_screen',
    
    -- Progresso e resultados
    progress_percentage INTEGER DEFAULT 0,
    estimated_duration_seconds INTEGER,
    actual_duration_seconds INTEGER,
    output_video_url TEXT,
    output_thumbnail_url TEXT,
    output_metadata JSONB,
    
    -- Métricas de qualidade
    lipsync_accuracy DECIMAL(5,2),
    render_time_seconds INTEGER,
    file_size_bytes BIGINT,
    processing_log JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    processing_cost DECIMAL(10,2),
    credits_used INTEGER,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics de eventos
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    project_id UUID REFERENCES projects(id),
    
    -- Evento
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- Contexto
    session_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exports de vídeo
CREATE TABLE IF NOT EXISTS video_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    render_job_id UUID REFERENCES render_jobs(id),
    
    -- Configurações do export
    format VARCHAR(50) DEFAULT 'mp4',
    quality VARCHAR(50) DEFAULT 'high',
    resolution VARCHAR(50) DEFAULT '1080p',
    fps INTEGER DEFAULT 30,
    
    -- URLs e metadados
    file_url TEXT,
    thumbnail_url TEXT,
    file_size BIGINT,
    duration_seconds DOUBLE PRECISION,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para busca de texto
CREATE INDEX IF NOT EXISTS idx_slides_extracted_text ON slides USING gin(to_tsvector('portuguese', extracted_text));
CREATE INDEX IF NOT EXISTS idx_projects_title ON projects USING gin(to_tsvector('portuguese', title));

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_slides_project_id ON slides(project_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_project_id ON render_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- ============================================
-- 3. TRIGGERS PARA TIMESTAMPS AUTOMÁTICOS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para as tabelas principais
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_render_jobs_updated_at BEFORE UPDATE ON render_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_exports ENABLE ROW LEVEL SECURITY;

-- Políticas para organizations
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their organizations" ON organizations
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Políticas para projects
CREATE POLICY "Users can view organization projects" ON projects
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create projects in their organizations" ON projects
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        ) AND created_by = auth.uid()
    );

-- Políticas para slides
CREATE POLICY "Users can view project slides" ON slides
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE organization_id IN (
                SELECT organization_id 
                FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Políticas para render_jobs
CREATE POLICY "Users can view their render jobs" ON render_jobs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create render jobs" ON render_jobs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- 5. VIEWS PARA ANALYTICS E DASHBOARDS
-- ============================================

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    date_trunc('day', created_at) as date,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_jobs,
    AVG(render_time_seconds) as avg_render_time,
    AVG(lipsync_accuracy) as avg_lipsync_accuracy
FROM render_jobs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date_trunc('day', created_at)
ORDER BY date DESC;

-- View para estatísticas de avatares
CREATE OR REPLACE VIEW avatar_usage_stats AS
SELECT 
    am.id,
    am.name,
    am.display_name,
    am.avatar_type,
    am.gender,
    COUNT(rj.id) as total_renders,
    COUNT(rj.id) FILTER (WHERE rj.status = 'completed') as completed_renders,
    AVG(rj.lipsync_accuracy) as avg_lipsync_accuracy,
    AVG(rj.render_time_seconds) as avg_render_time
FROM avatar_models am
LEFT JOIN render_jobs rj ON am.id = rj.avatar_model_id
WHERE am.is_active = true
GROUP BY am.id, am.name, am.display_name, am.avatar_type, am.gender
ORDER BY total_renders DESC;

-- View para estatísticas de vozes
CREATE OR REPLACE VIEW voice_usage_stats AS
SELECT 
    vp.id,
    vp.name,
    vp.display_name,
    vp.language,
    vp.gender,
    COUNT(rj.id) as total_uses,
    AVG(rj.lipsync_accuracy) as avg_lipsync_accuracy,
    vp.quality_score,
    vp.naturalness_score
FROM voice_profiles vp
LEFT JOIN render_jobs rj ON vp.id = rj.voice_profile_id
WHERE vp.is_active = true
GROUP BY vp.id, vp.name, vp.display_name, vp.language, vp.gender, vp.quality_score, vp.naturalness_score
ORDER BY total_uses DESC;

-- ============================================
-- 6. FUNÇÕES UTILITÁRIAS
-- ============================================

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas do usuário
CREATE OR REPLACE FUNCTION get_user_render_stats(user_id UUID)
RETURNS TABLE (
    total_renders BIGINT,
    completed_renders BIGINT,
    failed_renders BIGINT,
    total_render_time DOUBLE PRECISION,
    avg_lipsync_accuracy DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_renders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_renders,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_renders,
        SUM(render_time_seconds) as total_render_time,
        AVG(lipsync_accuracy) as avg_lipsync_accuracy
    FROM render_jobs
    WHERE render_jobs.user_id = get_user_render_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. DADOS INICIAIS DEMO
-- ============================================

-- Inserir organização demo (se não existir)
INSERT INTO organizations (id, name, slug, description, created_by)
SELECT 
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Estúdio IA Demo',
    'estudio-ia-demo',
    'Organização de demonstração para testes',
    NULL
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001'::UUID);

-- ============================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE users IS 'Usuários do sistema - compatível com Supabase Auth';
COMMENT ON TABLE organizations IS 'Organizações para modelo multi-tenant';
COMMENT ON TABLE projects IS 'Projetos de vídeo com processamento PPTX real';
COMMENT ON TABLE slides IS 'Slides extraídos de apresentações PPTX';
COMMENT ON TABLE render_jobs IS 'Jobs de renderização com avatares 3D e IA';
COMMENT ON TABLE analytics_events IS 'Eventos para analytics e métricas';

COMMENT ON COLUMN projects.pptx_metadata IS 'Metadados extraídos do arquivo PPTX';
COMMENT ON COLUMN projects.pptx_assets IS 'Assets extraídos (imagens, vídeos, fontes)';
COMMENT ON COLUMN projects.pptx_timeline IS 'Timeline com cenas e transições';
COMMENT ON COLUMN projects.images_extracted IS 'Número de imagens extraídas do PPTX';

COMMENT ON COLUMN render_jobs.enable_audio2face IS 'Usar NVIDIA Audio2Face para lip-sync';
COMMENT ON COLUMN render_jobs.lipsync_accuracy IS 'Precisão do lip-sync (0-100%)';

-- ============================================
-- MIGRAÇÃO CONCLUÍDA ✅
-- ============================================