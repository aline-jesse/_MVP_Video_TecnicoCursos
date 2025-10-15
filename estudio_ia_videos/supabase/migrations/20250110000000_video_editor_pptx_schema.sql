-- =====================================================
-- SCHEMA DO EDITOR DE VÍDEO E PPTX
-- Migração para criar todas as tabelas do sistema de edição
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABELA DE PROJETOS
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'video', -- 'video', 'pptx', 'mixed'
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'in_progress', 'completed', 'archived'
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,
    
    -- Configurações do projeto
    settings JSONB DEFAULT '{
        "width": 1920,
        "height": 1080,
        "fps": 30,
        "duration": 60,
        "quality": "high",
        "format": "mp4"
    }',
    
    -- Metadados
    thumbnail_url TEXT,
    preview_url TEXT,
    final_video_url TEXT,
    file_size BIGINT DEFAULT 0,
    render_progress INTEGER DEFAULT 0,
    
    -- Colaboração
    collaborators UUID[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(255) UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_projects_owner_id (owner_id),
    INDEX idx_projects_organization_id (organization_id),
    INDEX idx_projects_type (type),
    INDEX idx_projects_status (status),
    INDEX idx_projects_created_at (created_at),
    INDEX idx_projects_share_token (share_token)
);

-- =====================================================
-- TABELA DE TIMELINE
-- =====================================================
CREATE TABLE IF NOT EXISTS timeline_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'text', 'image', 'pptx', '3d'
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Configurações da track
    color VARCHAR(7) DEFAULT '#6b7280',
    height INTEGER DEFAULT 80,
    visible BOOLEAN DEFAULT TRUE,
    locked BOOLEAN DEFAULT FALSE,
    muted BOOLEAN DEFAULT FALSE,
    
    -- Propriedades específicas
    properties JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_timeline_tracks_project_id (project_id),
    INDEX idx_timeline_tracks_type (type),
    INDEX idx_timeline_tracks_order_index (order_index)
);

-- =====================================================
-- TABELA DE ELEMENTOS DA TIMELINE
-- =====================================================
CREATE TABLE IF NOT EXISTS timeline_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES timeline_tracks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Posicionamento temporal
    start_time DECIMAL(10,3) NOT NULL DEFAULT 0, -- em segundos
    duration DECIMAL(10,3) NOT NULL DEFAULT 1,
    end_time DECIMAL(10,3) GENERATED ALWAYS AS (start_time + duration) STORED,
    
    -- Tipo e conteúdo
    type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'text', 'image', 'pptx_slide', '3d_avatar'
    content TEXT NOT NULL,
    source_url TEXT,
    
    -- Propriedades visuais e de áudio
    properties JSONB DEFAULT '{
        "volume": 1.0,
        "opacity": 1.0,
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100,
        "rotation": 0,
        "scale": 1.0
    }',
    
    -- Efeitos e transições
    effects JSONB DEFAULT '[]',
    transitions JSONB DEFAULT '{}',
    
    -- Metadados
    thumbnail_url TEXT,
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_timeline_elements_track_id (track_id),
    INDEX idx_timeline_elements_project_id (project_id),
    INDEX idx_timeline_elements_type (type),
    INDEX idx_timeline_elements_start_time (start_time),
    INDEX idx_timeline_elements_end_time (end_time)
);

-- =====================================================
-- TABELA DE UPLOADS PPTX
-- =====================================================
CREATE TABLE IF NOT EXISTS pptx_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações do arquivo
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    -- Status do processamento
    status VARCHAR(50) NOT NULL DEFAULT 'uploaded', -- 'uploaded', 'processing', 'completed', 'failed'
    processing_progress INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Dados extraídos
    slide_count INTEGER DEFAULT 0,
    slides_data JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    
    -- URLs geradas
    preview_url TEXT,
    slides_urls TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Índices
    INDEX idx_pptx_uploads_project_id (project_id),
    INDEX idx_pptx_uploads_user_id (user_id),
    INDEX idx_pptx_uploads_status (status),
    INDEX idx_pptx_uploads_created_at (created_at)
);

-- =====================================================
-- TABELA DE SLIDES PPTX
-- =====================================================
CREATE TABLE IF NOT EXISTS pptx_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES pptx_uploads(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Informações do slide
    slide_number INTEGER NOT NULL,
    title TEXT,
    content TEXT,
    notes TEXT,
    
    -- Recursos visuais
    image_url TEXT,
    thumbnail_url TEXT,
    background_color VARCHAR(7),
    
    -- Configurações de vídeo
    duration DECIMAL(10,3) DEFAULT 5.0,
    transition_type VARCHAR(50) DEFAULT 'fade',
    transition_duration DECIMAL(10,3) DEFAULT 0.5,
    
    -- Áudio e narração
    audio_url TEXT,
    tts_text TEXT,
    voice_settings JSONB DEFAULT '{}',
    
    -- Animações e efeitos
    animations JSONB DEFAULT '[]',
    effects JSONB DEFAULT '[]',
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_pptx_slides_upload_id (upload_id),
    INDEX idx_pptx_slides_project_id (project_id),
    INDEX idx_pptx_slides_slide_number (slide_number)
);

-- =====================================================
-- TABELA DE RENDERIZAÇÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS render_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Configurações de renderização
    composition_id VARCHAR(100) NOT NULL,
    output_format VARCHAR(20) DEFAULT 'mp4',
    quality VARCHAR(20) DEFAULT 'high', -- 'low', 'medium', 'high', 'ultra'
    resolution VARCHAR(20) DEFAULT '1920x1080',
    fps INTEGER DEFAULT 30,
    
    -- Status e progresso
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed', 'cancelled'
    progress INTEGER DEFAULT 0,
    current_frame INTEGER DEFAULT 0,
    total_frames INTEGER DEFAULT 0,
    
    -- Resultados
    output_path TEXT,
    output_url TEXT,
    file_size BIGINT DEFAULT 0,
    duration DECIMAL(10,3) DEFAULT 0,
    
    -- Tempo de processamento
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processing_time INTEGER DEFAULT 0, -- em segundos
    
    -- Erros e logs
    error_message TEXT,
    error_stack TEXT,
    logs TEXT,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_render_jobs_project_id (project_id),
    INDEX idx_render_jobs_user_id (user_id),
    INDEX idx_render_jobs_status (status),
    INDEX idx_render_jobs_created_at (created_at)
);

-- =====================================================
-- TABELA DE AVATARES 3D
-- =====================================================
CREATE TABLE IF NOT EXISTS avatars_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Informações do avatar
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Configurações Ready Player Me
    rpm_avatar_id VARCHAR(255),
    rpm_model_url TEXT,
    rpm_config JSONB DEFAULT '{}',
    
    -- Configurações de animação
    animations JSONB DEFAULT '[]',
    voice_settings JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'processing'
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_avatars_3d_user_id (user_id),
    INDEX idx_avatars_3d_project_id (project_id),
    INDEX idx_avatars_3d_status (status),
    INDEX idx_avatars_3d_rpm_avatar_id (rpm_avatar_id)
);

-- =====================================================
-- TABELA DE COLABORAÇÃO EM TEMPO REAL
-- =====================================================
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações da sessão
    session_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'disconnected'
    
    -- Dados da sessão
    cursor_position JSONB DEFAULT '{}',
    selected_elements UUID[] DEFAULT '{}',
    current_tool VARCHAR(50),
    
    -- Metadados
    user_agent TEXT,
    ip_address INET,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_collaboration_sessions_project_id (project_id),
    INDEX idx_collaboration_sessions_user_id (user_id),
    INDEX idx_collaboration_sessions_status (status),
    INDEX idx_collaboration_sessions_session_token (session_token)
);

-- =====================================================
-- TABELA DE HISTÓRICO DE MUDANÇAS
-- =====================================================
CREATE TABLE IF NOT EXISTS project_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Informações da mudança
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'move', 'copy'
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'track', 'element', 'slide'
    entity_id UUID,
    
    -- Dados da mudança
    changes JSONB NOT NULL,
    previous_data JSONB,
    new_data JSONB,
    
    -- Metadados
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    INDEX idx_project_history_project_id (project_id),
    INDEX idx_project_history_user_id (user_id),
    INDEX idx_project_history_action (action),
    INDEX idx_project_history_entity_type (entity_type),
    INDEX idx_project_history_created_at (created_at)
);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_tracks_updated_at
    BEFORE UPDATE ON timeline_tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_elements_updated_at
    BEFORE UPDATE ON timeline_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pptx_uploads_updated_at
    BEFORE UPDATE ON pptx_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pptx_slides_updated_at
    BEFORE UPDATE ON pptx_slides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_render_jobs_updated_at
    BEFORE UPDATE ON render_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avatars_3d_updated_at
    BEFORE UPDATE ON avatars_3d
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at
    BEFORE UPDATE ON collaboration_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pptx_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pptx_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;

-- Políticas para projetos
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        auth.uid() = ANY(collaborators) OR
        (is_public = TRUE)
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (
        auth.uid() = owner_id OR 
        auth.uid() = ANY(collaborators)
    );

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = owner_id);

-- Políticas para timeline tracks
CREATE POLICY "Users can manage tracks in their projects" ON timeline_tracks
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE auth.uid() = owner_id OR auth.uid() = ANY(collaborators)
        )
    );

-- Políticas para timeline elements
CREATE POLICY "Users can manage elements in their projects" ON timeline_elements
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE auth.uid() = owner_id OR auth.uid() = ANY(collaborators)
        )
    );

-- Políticas para PPTX uploads
CREATE POLICY "Users can manage their PPTX uploads" ON pptx_uploads
    FOR ALL USING (
        auth.uid() = user_id OR
        project_id IN (
            SELECT id FROM projects 
            WHERE auth.uid() = owner_id OR auth.uid() = ANY(collaborators)
        )
    );

-- Políticas para PPTX slides
CREATE POLICY "Users can view slides in their projects" ON pptx_slides
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE auth.uid() = owner_id OR auth.uid() = ANY(collaborators)
        )
    );

-- Políticas para render jobs
CREATE POLICY "Users can manage their render jobs" ON render_jobs
    FOR ALL USING (
        auth.uid() = user_id OR
        project_id IN (
            SELECT id FROM projects 
            WHERE auth.uid() = owner_id OR auth.uid() = ANY(collaborators)
        )
    );

-- Políticas para avatares 3D
CREATE POLICY "Users can manage their avatars" ON avatars_3d
    FOR ALL USING (
        auth.uid() = user_id OR
        (is_public = TRUE AND current_setting('request.method', true) = 'GET')
    );

-- Políticas para colaboração
CREATE POLICY "Users can manage collaboration in their projects" ON collaboration_sessions
    FOR ALL USING (
        auth.uid() = user_id OR
        project_id IN (
            SELECT id FROM projects 
            WHERE auth.uid() = owner_id OR auth.uid() = ANY(collaborators)
        )
    );

-- Políticas para histórico
CREATE POLICY "Users can view history of their projects" ON project_history
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE auth.uid() = owner_id OR auth.uid() = ANY(collaborators)
        )
    );

-- =====================================================
-- PERMISSÕES PARA ROLES
-- =====================================================

-- Conceder permissões para role authenticated
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Conceder permissões limitadas para role anon (apenas leitura de projetos públicos)
GRANT SELECT ON projects TO anon;
GRANT SELECT ON timeline_tracks TO anon;
GRANT SELECT ON timeline_elements TO anon;
GRANT SELECT ON pptx_slides TO anon;
GRANT SELECT ON avatars_3d TO anon;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para gerar token de compartilhamento
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Função para limpar sessões inativas
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions(inactive_hours INTEGER DEFAULT 24)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_time TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_time := NOW() - INTERVAL '1 hour' * inactive_hours;
    
    UPDATE collaboration_sessions 
    SET status = 'disconnected'
    WHERE last_activity_at < cutoff_time AND status = 'active';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================

-- View para estatísticas de projetos
CREATE OR REPLACE VIEW project_stats AS
SELECT 
    p.id,
    p.name,
    p.type,
    p.status,
    p.owner_id,
    COUNT(DISTINCT tt.id) as track_count,
    COUNT(DISTINCT te.id) as element_count,
    COUNT(DISTINCT pu.id) as pptx_count,
    COUNT(DISTINCT rj.id) as render_count,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN timeline_tracks tt ON p.id = tt.project_id
LEFT JOIN timeline_elements te ON p.id = te.project_id
LEFT JOIN pptx_uploads pu ON p.id = pu.project_id
LEFT JOIN render_jobs rj ON p.id = rj.project_id
GROUP BY p.id, p.name, p.type, p.status, p.owner_id, p.created_at, p.updated_at;

-- View para atividade de renderização
CREATE OR REPLACE VIEW render_activity AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_jobs,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_jobs,
    AVG(CASE WHEN processing_time > 0 THEN processing_time END) as avg_processing_time
FROM render_jobs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE projects IS 'Tabela principal para armazenar projetos de vídeo e PPTX';
COMMENT ON TABLE timeline_tracks IS 'Tracks da timeline para organização de elementos';
COMMENT ON TABLE timeline_elements IS 'Elementos individuais na timeline (vídeo, áudio, texto, etc.)';
COMMENT ON TABLE pptx_uploads IS 'Uploads de arquivos PPTX e seu status de processamento';
COMMENT ON TABLE pptx_slides IS 'Slides individuais extraídos dos arquivos PPTX';
COMMENT ON TABLE render_jobs IS 'Jobs de renderização de vídeo usando Remotion';
COMMENT ON TABLE avatars_3d IS 'Avatares 3D criados com Ready Player Me';
COMMENT ON TABLE collaboration_sessions IS 'Sessões de colaboração em tempo real';
COMMENT ON TABLE project_history IS 'Histórico de mudanças nos projetos para auditoria';

-- Finalização
SELECT 'Schema do Editor de Vídeo e PPTX instalado com sucesso!' as status;