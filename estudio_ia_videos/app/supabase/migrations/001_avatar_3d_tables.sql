-- ============================================
-- FASE 2: Avatares 3D Hiper-Realistas
-- Migração: Tabelas principais para avatares 3D
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

-- Status de renderização
CREATE TYPE render_status AS ENUM (
    'pending',
    'queued', 
    'processing',
    'completed',
    'failed',
    'cancelled'
);

-- Qualidade de renderização
CREATE TYPE render_quality AS ENUM (
    'draft',
    'standard',
    'high',
    'ultra'
);

-- Resolução de vídeo
CREATE TYPE video_resolution AS ENUM (
    '480p',
    '720p',
    '1080p',
    '1440p',
    '4k'
);

-- Tipo de avatar
CREATE TYPE avatar_type AS ENUM (
    'realistic',
    'stylized',
    'cartoon',
    'professional'
);

-- Gênero do avatar
CREATE TYPE avatar_gender AS ENUM (
    'male',
    'female',
    'neutral'
);

-- Idiomas suportados
CREATE TYPE supported_language AS ENUM (
    'pt-BR',
    'en-US',
    'es-ES',
    'fr-FR',
    'de-DE',
    'it-IT',
    'ja-JP',
    'ko-KR',
    'zh-CN'
);

-- ============================================
-- TABELA: avatar_models
-- Modelos de avatares 3D disponíveis
-- ============================================
CREATE TABLE avatar_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_type avatar_type NOT NULL DEFAULT 'realistic',
    gender avatar_gender NOT NULL,
    
    -- Arquivos do modelo
    model_file_url TEXT NOT NULL,
    texture_file_url TEXT,
    animation_file_url TEXT,
    thumbnail_url TEXT,
    
    -- Características físicas
    age_range VARCHAR(50),
    ethnicity VARCHAR(100),
    hair_color VARCHAR(50),
    eye_color VARCHAR(50),
    
    -- Capacidades técnicas
    supports_audio2face BOOLEAN DEFAULT false,
    supports_voice_cloning BOOLEAN DEFAULT false,
    supports_real_time BOOLEAN DEFAULT false,
    blend_shapes_count INTEGER DEFAULT 0,
    
    -- Metadados
    file_size BIGINT,
    model_version VARCHAR(50),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT avatar_models_name_unique UNIQUE(name)
);

-- ============================================
-- TABELA: voice_profiles
-- Perfis de voz para clonagem
-- ============================================
CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Configurações de voz
    language supported_language NOT NULL DEFAULT 'pt-BR',
    gender avatar_gender NOT NULL,
    age_range VARCHAR(50),
    accent VARCHAR(100),
    
    -- Arquivos de áudio de referência
    sample_audio_url TEXT NOT NULL,
    training_data_url TEXT,
    
    -- Configurações técnicas
    sample_rate INTEGER DEFAULT 22050,
    bit_depth INTEGER DEFAULT 16,
    duration_seconds DECIMAL(10,2),
    
    -- Qualidade e métricas
    quality_score DECIMAL(3,2) DEFAULT 0.0,
    similarity_score DECIMAL(3,2) DEFAULT 0.0,
    naturalness_score DECIMAL(3,2) DEFAULT 0.0,
    
    -- Metadados
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: render_jobs
-- Jobs de renderização de avatares 3D
-- ============================================
CREATE TABLE render_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    user_id UUID NOT NULL REFERENCES auth.users(id),
    avatar_model_id UUID NOT NULL REFERENCES avatar_models(id),
    voice_profile_id UUID REFERENCES voice_profiles(id),
    
    -- Configurações de renderização
    status render_status DEFAULT 'pending',
    quality render_quality DEFAULT 'standard',
    resolution video_resolution DEFAULT '1080p',
    
    -- Conteúdo
    script_text TEXT NOT NULL,
    audio_file_url TEXT,
    
    -- Configurações técnicas
    enable_audio2face BOOLEAN DEFAULT false,
    enable_real_time_lipsync BOOLEAN DEFAULT false,
    enable_ray_tracing BOOLEAN DEFAULT false,
    camera_angle VARCHAR(50) DEFAULT 'front',
    lighting_preset VARCHAR(50) DEFAULT 'studio',
    background_type VARCHAR(50) DEFAULT 'green_screen',
    
    -- Progresso e métricas
    progress_percentage INTEGER DEFAULT 0,
    estimated_duration_seconds INTEGER,
    actual_duration_seconds INTEGER,
    
    -- Resultados
    output_video_url TEXT,
    output_thumbnail_url TEXT,
    output_metadata JSONB,
    
    -- Métricas de qualidade
    lipsync_accuracy DECIMAL(5,2),
    render_time_seconds INTEGER,
    file_size_bytes BIGINT,
    
    -- Logs e erros
    processing_log JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Custos
    processing_cost DECIMAL(10,4),
    credits_used INTEGER,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: audio2face_sessions
-- Sessões do NVIDIA Audio2Face
-- ============================================
CREATE TABLE audio2face_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    render_job_id UUID NOT NULL REFERENCES render_jobs(id),
    
    -- Configurações da sessão
    session_id VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    sample_rate INTEGER DEFAULT 22050,
    
    -- Arquivos de entrada
    audio_file_path TEXT NOT NULL,
    blend_shapes_file_path TEXT,
    
    -- Resultados
    arkit_curves_url TEXT,
    blend_shapes_data JSONB,
    
    -- Métricas
    processing_time_seconds INTEGER,
    accuracy_score DECIMAL(5,2),
    
    -- Status
    status render_status DEFAULT 'pending',
    error_message TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT audio2face_sessions_session_id_unique UNIQUE(session_id)
);

-- ============================================
-- TABELA: avatar_analytics
-- Analytics de uso de avatares
-- ============================================
CREATE TABLE avatar_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    user_id UUID REFERENCES auth.users(id),
    avatar_model_id UUID REFERENCES avatar_models(id),
    render_job_id UUID REFERENCES render_jobs(id),
    
    -- Métricas de uso
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    
    -- Contexto
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: system_stats
-- Estatísticas do sistema
-- ============================================
CREATE TABLE system_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Métricas gerais
    total_renders INTEGER DEFAULT 0,
    active_jobs INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    failed_jobs INTEGER DEFAULT 0,
    
    -- Métricas de performance
    avg_render_time_seconds DECIMAL(10,2),
    avg_lipsync_accuracy DECIMAL(5,2),
    success_rate DECIMAL(5,2),
    
    -- Recursos do sistema
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    gpu_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    
    -- Status dos serviços
    audio2face_status VARCHAR(50) DEFAULT 'unknown',
    redis_status VARCHAR(50) DEFAULT 'unknown',
    database_status VARCHAR(50) DEFAULT 'unknown',
    
    -- Timestamps
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índices para performance
CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);
CREATE INDEX idx_render_jobs_created_at ON render_jobs(created_at);
CREATE INDEX idx_render_jobs_avatar_model_id ON render_jobs(avatar_model_id);

CREATE INDEX idx_avatar_models_type ON avatar_models(avatar_type);
CREATE INDEX idx_avatar_models_gender ON avatar_models(gender);
CREATE INDEX idx_avatar_models_active ON avatar_models(is_active);

CREATE INDEX idx_voice_profiles_language ON voice_profiles(language);
CREATE INDEX idx_voice_profiles_gender ON voice_profiles(gender);
CREATE INDEX idx_voice_profiles_active ON voice_profiles(is_active);

CREATE INDEX idx_audio2face_sessions_render_job_id ON audio2face_sessions(render_job_id);
CREATE INDEX idx_audio2face_sessions_status ON audio2face_sessions(status);

CREATE INDEX idx_avatar_analytics_user_id ON avatar_analytics(user_id);
CREATE INDEX idx_avatar_analytics_event_type ON avatar_analytics(event_type);
CREATE INDEX idx_avatar_analytics_created_at ON avatar_analytics(created_at);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_avatar_models_updated_at BEFORE UPDATE ON avatar_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voice_profiles_updated_at BEFORE UPDATE ON voice_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_render_jobs_updated_at BEFORE UPDATE ON render_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audio2face_sessions_updated_at BEFORE UPDATE ON audio2face_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE avatar_models IS 'Modelos de avatares 3D disponíveis para renderização';
COMMENT ON TABLE voice_profiles IS 'Perfis de voz para clonagem e síntese';
COMMENT ON TABLE render_jobs IS 'Jobs de renderização de vídeos com avatares 3D';
COMMENT ON TABLE audio2face_sessions IS 'Sessões do NVIDIA Audio2Face para lip-sync';
COMMENT ON TABLE avatar_analytics IS 'Analytics de uso e performance dos avatares';
COMMENT ON TABLE system_stats IS 'Estatísticas do sistema em tempo real';