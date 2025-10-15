-- Fase 1: Sistema TTS Completo e Integração com Avatares
-- Migração para tabelas específicas do sistema TTS e Avatar 3D
-- Data: 2025-01-30

-- =====================================================
-- 1. TABELA DE JOBS TTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tts_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Configurações de entrada
    text TEXT NOT NULL,
    engine VARCHAR(50) NOT NULL CHECK (engine IN ('elevenlabs', 'azure', 'google', 'aws', 'synthetic')),
    voice_id VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'pt-BR',
    
    -- Configurações avançadas
    settings JSONB DEFAULT '{}', -- speed, pitch, emotion, quality, etc.
    
    -- Status e progresso
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Resultados
    audio_url VARCHAR(500),
    duration DECIMAL(10,3), -- duração em segundos
    file_size BIGINT, -- tamanho em bytes
    
    -- Dados de análise para lip-sync
    visemes JSONB, -- array de dados de visemas
    phonemes JSONB, -- array de fonemas detectados
    audio_analysis JSONB, -- dados MFCC e análise espectral
    
    -- Metadados e qualidade
    quality_score DECIMAL(3,2), -- 0.00 a 1.00
    engine_metadata JSONB DEFAULT '{}',
    
    -- Controle de erro
    error_message TEXT,
    error_code VARCHAR(50),
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE AVATARES 3D
-- =====================================================
CREATE TABLE IF NOT EXISTS public.avatars_3d (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('professional', 'casual', 'technical', 'executive', 'instructor')),
    
    -- Aparência
    appearance JSONB NOT NULL DEFAULT '{}', -- gender, ethnicity, age_range, clothing, hair_style, facial_features
    
    -- Configurações técnicas
    model_url VARCHAR(500) NOT NULL,
    model_type VARCHAR(50) DEFAULT 'ready_player_me',
    model_quality VARCHAR(20) DEFAULT 'hd' CHECK (model_quality IN ('standard', 'hd', 'ultra_hd')),
    
    -- Animações e capacidades
    animations JSONB DEFAULT '{}', -- idle, speaking, gestures, expressions, reactions
    blend_shapes JSONB DEFAULT '{}', -- mapeamento de blend shapes para visemas
    voice_compatibility TEXT[], -- array de voice_ids compatíveis
    
    -- Especializações
    specializations TEXT[] DEFAULT '{}', -- nr, treinamento, apresentacao, vendas, suporte
    
    -- Metadados
    premium BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    popularity_score DECIMAL(3,2) DEFAULT 0.00,
    
    -- Proprietário
    created_by VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA DE JOBS DE SINCRONIZAÇÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sync_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    tts_job_id UUID REFERENCES public.tts_jobs(id) ON DELETE CASCADE,
    avatar_id UUID REFERENCES public.avatars_3d(id) ON DELETE CASCADE,
    
    -- Configurações de sincronização
    sync_mode VARCHAR(20) DEFAULT 'auto' CHECK (sync_mode IN ('auto', 'manual', 'hybrid')),
    precision VARCHAR(20) DEFAULT 'high' CHECK (precision IN ('low', 'medium', 'high', 'ultra')),
    
    -- Configurações avançadas
    settings JSONB DEFAULT '{}', -- frameRate, smoothing, intensity, enableEmotions, etc.
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'syncing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Resultados
    sync_data JSONB, -- dados de sincronização lip-sync
    preview_url VARCHAR(500), -- URL do preview 3D
    
    -- Métricas de qualidade
    sync_accuracy DECIMAL(5,2), -- precisão da sincronização (0.00 a 100.00)
    processing_time INTEGER, -- tempo de processamento em ms
    
    -- Controle de erro
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE JOBS DE RENDERIZAÇÃO DE VÍDEO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.video_render_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    sync_job_id UUID REFERENCES public.sync_jobs(id) ON DELETE CASCADE,
    
    -- Configurações de renderização
    resolution VARCHAR(10) DEFAULT '1080p' CHECK (resolution IN ('720p', '1080p', '4K')),
    frame_rate INTEGER DEFAULT 30,
    quality VARCHAR(20) DEFAULT 'production' CHECK (quality IN ('draft', 'preview', 'production', 'cinema')),
    format VARCHAR(10) DEFAULT 'mp4' CHECK (format IN ('mp4', 'webm', 'mov')),
    codec VARCHAR(10) DEFAULT 'h264' CHECK (codec IN ('h264', 'h265', 'vp9', 'av1')),
    
    -- Configurações avançadas
    settings JSONB DEFAULT '{}', -- bitrate, enableGPU, enableParallel, background, etc.
    
    -- Status e progresso
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'preprocessing', 'rendering', 'post_processing', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Estimativas
    estimated_duration INTEGER, -- duração estimada em segundos
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Resultados
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    duration DECIMAL(10,3), -- duração real em segundos
    file_size BIGINT, -- tamanho em bytes
    
    -- Métricas de performance
    render_time INTEGER, -- tempo total de renderização em ms
    memory_usage BIGINT, -- uso de memória em bytes
    cpu_usage DECIMAL(5,2), -- uso de CPU em %
    gpu_usage DECIMAL(5,2), -- uso de GPU em %
    
    -- Metadados técnicos
    technical_metadata JSONB DEFAULT '{}', -- codec info, bitrate real, etc.
    
    -- Controle de erro
    error_message TEXT,
    error_code VARCHAR(50),
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE CACHE INTELIGENTE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cache_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Chave e tipo de cache
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_type VARCHAR(50) NOT NULL CHECK (cache_type IN ('tts_audio', 'sync_data', 'avatar_render', 'video_final')),
    
    -- Dados
    data_url VARCHAR(500), -- URL do arquivo em cache
    metadata JSONB DEFAULT '{}', -- metadados do cache
    
    -- Controle de tamanho
    size_bytes BIGINT NOT NULL,
    
    -- Controle de acesso
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- TTL e expiração
    ttl_seconds INTEGER DEFAULT 86400, -- 24 horas por padrão
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE MÉTRICAS DE PERFORMANCE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação
    metric_type VARCHAR(50) NOT NULL, -- tts, sync, render, cache, system
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métricas específicas
    metrics JSONB NOT NULL DEFAULT '{}',
    
    -- Agregação temporal
    period VARCHAR(20) DEFAULT 'minute' CHECK (period IN ('minute', 'hour', 'day')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tts_jobs
CREATE INDEX IF NOT EXISTS idx_tts_jobs_user_id ON public.tts_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_tts_jobs_status ON public.tts_jobs(status);
CREATE INDEX IF NOT EXISTS idx_tts_jobs_engine ON public.tts_jobs(engine);
CREATE INDEX IF NOT EXISTS idx_tts_jobs_created_at ON public.tts_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_tts_jobs_project_id ON public.tts_jobs(project_id);

-- Índices para avatars_3d
CREATE INDEX IF NOT EXISTS idx_avatars_3d_category ON public.avatars_3d(category);
CREATE INDEX IF NOT EXISTS idx_avatars_3d_slug ON public.avatars_3d(slug);
CREATE INDEX IF NOT EXISTS idx_avatars_3d_premium ON public.avatars_3d(premium);
CREATE INDEX IF NOT EXISTS idx_avatars_3d_popularity ON public.avatars_3d(popularity_score DESC);

-- Índices para sync_jobs
CREATE INDEX IF NOT EXISTS idx_sync_jobs_user_id ON public.sync_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON public.sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_tts_job_id ON public.sync_jobs(tts_job_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_avatar_id ON public.sync_jobs(avatar_id);

-- Índices para video_render_jobs
CREATE INDEX IF NOT EXISTS idx_video_render_jobs_user_id ON public.video_render_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_render_jobs_status ON public.video_render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_render_jobs_sync_job_id ON public.video_render_jobs(sync_job_id);
CREATE INDEX IF NOT EXISTS idx_video_render_jobs_created_at ON public.video_render_jobs(created_at);

-- Índices para cache_entries
CREATE INDEX IF NOT EXISTS idx_cache_entries_cache_key ON public.cache_entries(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_entries_cache_type ON public.cache_entries(cache_type);
CREATE INDEX IF NOT EXISTS idx_cache_entries_expires_at ON public.cache_entries(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_entries_last_accessed ON public.cache_entries(last_accessed);

-- Índices para performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON public.performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON public.performance_metrics(period);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_tts_jobs_updated_at BEFORE UPDATE ON public.tts_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_avatars_3d_updated_at BEFORE UPDATE ON public.avatars_3d FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sync_jobs_updated_at BEFORE UPDATE ON public.sync_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_render_jobs_updated_at BEFORE UPDATE ON public.video_render_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cache_entries_updated_at BEFORE UPDATE ON public.cache_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.tts_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para tts_jobs
CREATE POLICY "Users can view own tts jobs" ON public.tts_jobs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own tts jobs" ON public.tts_jobs FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own tts jobs" ON public.tts_jobs FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own tts jobs" ON public.tts_jobs FOR DELETE USING (user_id = auth.uid()::text);

-- Políticas para avatars_3d
CREATE POLICY "Anyone can view public avatars" ON public.avatars_3d FOR SELECT USING (is_public = true OR created_by = auth.uid()::text);
CREATE POLICY "Users can insert avatars" ON public.avatars_3d FOR INSERT WITH CHECK (created_by = auth.uid()::text);
CREATE POLICY "Users can update own avatars" ON public.avatars_3d FOR UPDATE USING (created_by = auth.uid()::text);
CREATE POLICY "Users can delete own avatars" ON public.avatars_3d FOR DELETE USING (created_by = auth.uid()::text);

-- Políticas para sync_jobs
CREATE POLICY "Users can view own sync jobs" ON public.sync_jobs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own sync jobs" ON public.sync_jobs FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own sync jobs" ON public.sync_jobs FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own sync jobs" ON public.sync_jobs FOR DELETE USING (user_id = auth.uid()::text);

-- Políticas para video_render_jobs
CREATE POLICY "Users can view own video render jobs" ON public.video_render_jobs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own video render jobs" ON public.video_render_jobs FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own video render jobs" ON public.video_render_jobs FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own video render jobs" ON public.video_render_jobs FOR DELETE USING (user_id = auth.uid()::text);

-- Políticas para cache_entries (apenas sistema pode acessar)
CREATE POLICY "System can manage cache" ON public.cache_entries FOR ALL USING (true);

-- Políticas para performance_metrics (apenas sistema pode inserir, admins podem ver)
CREATE POLICY "System can insert metrics" ON public.performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view metrics" ON public.performance_metrics FOR SELECT USING (true);

-- =====================================================
-- PERMISSÕES PARA ROLES
-- =====================================================

-- Permissões para anon (usuários não autenticados)
GRANT SELECT ON public.avatars_3d TO anon;

-- Permissões para authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON public.tts_jobs TO authenticated;
GRANT ALL PRIVILEGES ON public.avatars_3d TO authenticated;
GRANT ALL PRIVILEGES ON public.sync_jobs TO authenticated;
GRANT ALL PRIVILEGES ON public.video_render_jobs TO authenticated;
GRANT ALL PRIVILEGES ON public.cache_entries TO authenticated;
GRANT ALL PRIVILEGES ON public.performance_metrics TO authenticated;

-- =====================================================
-- DADOS INICIAIS - AVATARES 3D
-- =====================================================

INSERT INTO public.avatars_3d (name, slug, category, appearance, model_url, animations, voice_compatibility, specializations, premium, popularity_score) VALUES
-- Avatares Técnicos
('Marcos - Especialista em NR', 'marcos-nr-specialist', 'technical', 
 '{"gender": "male", "ethnicity": "pardo", "age_range": "adulto", "clothing": "uniforme", "hair_style": "curto_profissional", "facial_features": "expressivo_confiante"}',
 '/avatars/models/marcos-nr.glb',
 '{"idle": ["respiracao_natural", "olhar_atento"], "speaking": ["labios_sincronizados", "movimento_cabeca"], "gestures": ["apontar_seguranca", "demonstrar_epi", "alertar_perigo"]}',
 ARRAY['sp-carlos-tech', 'sp-roberto-safety', 'mg-eduardo-industrial'],
 ARRAY['nr', 'treinamento'],
 false, 9.2),

('Ana - Executiva Corporativa', 'ana-executive', 'executive',
 '{"gender": "female", "ethnicity": "caucasiano", "age_range": "adulto", "clothing": "formal", "hair_style": "longo_elegante", "facial_features": "profissional_carismatica"}',
 '/avatars/models/ana-executive.glb',
 '{"idle": ["postura_ereta", "sorriso_profissional"], "speaking": ["gesticulacao_elegante", "contato_visual"], "gestures": ["apresentar_slides", "enfatizar_pontos", "acolher_audiencia"]}',
 ARRAY['sp-ana-corporate', 'rj-patricia-executive', 'rs-lucia-professional'],
 ARRAY['apresentacao', 'treinamento', 'vendas'],
 true, 9.5),

('João - Instrutor de Segurança', 'joao-safety-instructor', 'instructor',
 '{"gender": "male", "ethnicity": "afrodescendente", "age_range": "senior", "clothing": "eps", "hair_style": "grisalho_experiente", "facial_features": "experiente_confiavel"}',
 '/avatars/models/joao-instructor.glb',
 '{"idle": ["vigilancia_ativa", "observacao_ambiente"], "speaking": ["demonstracao_pratica", "enfase_seguranca"], "gestures": ["mostrar_equipamentos", "simular_procedimentos", "alertar_riscos"]}',
 ARRAY['ba-joao-instructor', 'pe-antonio-safety', 'ce-francisco-mentor'],
 ARRAY['nr', 'treinamento'],
 false, 9.8);

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.tts_jobs IS 'Jobs de síntese de texto para fala com múltiplos engines';
COMMENT ON TABLE public.avatars_3d IS 'Biblioteca de avatares 3D para renderização';
COMMENT ON TABLE public.sync_jobs IS 'Jobs de sincronização labial entre áudio e avatar';
COMMENT ON TABLE public.video_render_jobs IS 'Jobs de renderização final de vídeo com avatar';
COMMENT ON TABLE public.cache_entries IS 'Sistema de cache inteligente multi-camada';
COMMENT ON TABLE public.performance_metrics IS 'Métricas de performance do sistema em tempo real';

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.cache_entries 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular estatísticas de cache
CREATE OR REPLACE FUNCTION get_cache_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_entries', COUNT(*),
        'total_size_mb', ROUND(SUM(size_bytes)::NUMERIC / 1024 / 1024, 2),
        'hit_rate', ROUND(AVG(access_count)::NUMERIC, 2),
        'by_type', json_object_agg(cache_type, type_stats)
    ) INTO stats
    FROM (
        SELECT 
            cache_type,
            json_build_object(
                'count', COUNT(*),
                'size_mb', ROUND(SUM(size_bytes)::NUMERIC / 1024 / 1024, 2),
                'avg_access', ROUND(AVG(access_count)::NUMERIC, 2)
            ) as type_stats
        FROM public.cache_entries
        GROUP BY cache_type
    ) t;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;