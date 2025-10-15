-- ============================================
-- FASE 2: Avatares 3D Hiper-Realistas
-- Migração: Dados iniciais (Seed Data)
-- ============================================

-- ============================================
-- MODELOS DE AVATARES PADRÃO
-- ============================================

INSERT INTO avatar_models (
    name,
    display_name,
    description,
    avatar_type,
    gender,
    model_file_url,
    texture_file_url,
    thumbnail_url,
    age_range,
    ethnicity,
    hair_color,
    eye_color,
    supports_audio2face,
    supports_voice_cloning,
    supports_real_time,
    blend_shapes_count,
    model_version,
    is_active,
    is_premium
) VALUES 
-- Avatar Masculino Profissional
(
    'male_professional_01',
    'Marcus - Executivo',
    'Avatar masculino profissional, ideal para apresentações corporativas e treinamentos empresariais',
    'professional',
    'male',
    '/models/avatars/male_professional_01/model.fbx',
    '/models/avatars/male_professional_01/textures.png',
    '/models/avatars/male_professional_01/thumbnail.jpg',
    '30-45',
    'Caucasiano',
    'Castanho',
    'Castanho',
    true,
    true,
    true,
    52,
    '1.0.0',
    true,
    false
),

-- Avatar Feminino Profissional
(
    'female_professional_01',
    'Ana - Executiva',
    'Avatar feminino profissional, perfeita para apresentações e comunicação corporativa',
    'professional',
    'female',
    '/models/avatars/female_professional_01/model.fbx',
    '/models/avatars/female_professional_01/textures.png',
    '/models/avatars/female_professional_01/thumbnail.jpg',
    '25-40',
    'Latina',
    'Castanho Escuro',
    'Castanho',
    true,
    true,
    true,
    52,
    '1.0.0',
    true,
    false
),

-- Avatar Masculino Casual
(
    'male_casual_01',
    'João - Instrutor',
    'Avatar masculino casual, ideal para cursos e treinamentos informais',
    'realistic',
    'male',
    '/models/avatars/male_casual_01/model.fbx',
    '/models/avatars/male_casual_01/textures.png',
    '/models/avatars/male_casual_01/thumbnail.jpg',
    '25-35',
    'Brasileiro',
    'Preto',
    'Castanho Escuro',
    true,
    true,
    false,
    48,
    '1.0.0',
    true,
    false
),

-- Avatar Feminino Casual
(
    'female_casual_01',
    'Maria - Instrutora',
    'Avatar feminino casual, perfeita para cursos e apresentações educacionais',
    'realistic',
    'female',
    '/models/avatars/female_casual_01/model.fbx',
    '/models/avatars/female_casual_01/textures.png',
    '/models/avatars/female_casual_01/thumbnail.jpg',
    '22-32',
    'Brasileira',
    'Loiro',
    'Azul',
    true,
    true,
    false,
    48,
    '1.0.0',
    true,
    false
),

-- Avatar Premium Masculino
(
    'male_premium_01',
    'Dr. Roberto - Especialista',
    'Avatar masculino premium com alta qualidade para apresentações executivas',
    'realistic',
    'male',
    '/models/avatars/male_premium_01/model.fbx',
    '/models/avatars/male_premium_01/textures.png',
    '/models/avatars/male_premium_01/thumbnail.jpg',
    '40-55',
    'Caucasiano',
    'Grisalho',
    'Azul',
    true,
    true,
    true,
    64,
    '1.2.0',
    true,
    true
),

-- Avatar Premium Feminino
(
    'female_premium_01',
    'Dra. Carla - Especialista',
    'Avatar feminino premium com alta qualidade para apresentações executivas',
    'realistic',
    'female',
    '/models/avatars/female_premium_01/model.fbx',
    '/models/avatars/female_premium_01/textures.png',
    '/models/avatars/female_premium_01/thumbnail.jpg',
    '35-50',
    'Afro-brasileira',
    'Preto',
    'Castanho Escuro',
    true,
    true,
    true,
    64,
    '1.2.0',
    true,
    true
);

-- ============================================
-- PERFIS DE VOZ PADRÃO
-- ============================================

INSERT INTO voice_profiles (
    name,
    display_name,
    description,
    language,
    gender,
    age_range,
    accent,
    sample_audio_url,
    sample_rate,
    bit_depth,
    duration_seconds,
    quality_score,
    similarity_score,
    naturalness_score,
    is_active,
    is_premium
) VALUES 
-- Voz Masculina Brasileira
(
    'male_br_professional',
    'Voz Masculina Profissional BR',
    'Voz masculina brasileira, tom profissional e claro',
    'pt-BR',
    'male',
    '30-45',
    'Paulista',
    '/voices/samples/male_br_professional.wav',
    22050,
    16,
    30.5,
    0.92,
    0.89,
    0.94,
    true,
    false
),

-- Voz Feminina Brasileira
(
    'female_br_professional',
    'Voz Feminina Profissional BR',
    'Voz feminina brasileira, tom profissional e acolhedor',
    'pt-BR',
    'female',
    '25-40',
    'Carioca',
    '/voices/samples/female_br_professional.wav',
    22050,
    16,
    28.3,
    0.94,
    0.91,
    0.96,
    true,
    false
),

-- Voz Masculina Casual
(
    'male_br_casual',
    'Voz Masculina Casual BR',
    'Voz masculina brasileira, tom casual e amigável',
    'pt-BR',
    'male',
    '25-35',
    'Mineiro',
    '/voices/samples/male_br_casual.wav',
    22050,
    16,
    25.7,
    0.88,
    0.85,
    0.90,
    true,
    false
),

-- Voz Feminina Casual
(
    'female_br_casual',
    'Voz Feminina Casual BR',
    'Voz feminina brasileira, tom casual e educativo',
    'pt-BR',
    'female',
    '22-32',
    'Gaúcho',
    '/voices/samples/female_br_casual.wav',
    22050,
    16,
    32.1,
    0.90,
    0.87,
    0.92,
    true,
    false
),

-- Voz Premium Masculina
(
    'male_br_premium',
    'Dr. Roberto - Voz Premium',
    'Voz masculina premium com alta naturalidade',
    'pt-BR',
    'male',
    '40-55',
    'Paulista',
    '/voices/samples/male_br_premium.wav',
    44100,
    24,
    45.2,
    0.97,
    0.95,
    0.98,
    true,
    true
),

-- Voz Premium Feminina
(
    'female_br_premium',
    'Dra. Carla - Voz Premium',
    'Voz feminina premium com alta naturalidade',
    'pt-BR',
    'female',
    '35-50',
    'Baiano',
    '/voices/samples/female_br_premium.wav',
    44100,
    24,
    42.8,
    0.96,
    0.94,
    0.97,
    true,
    true
),

-- Vozes Internacionais
(
    'male_en_professional',
    'Professional Male Voice EN',
    'Professional English male voice for international content',
    'en-US',
    'male',
    '30-45',
    'American',
    '/voices/samples/male_en_professional.wav',
    22050,
    16,
    35.4,
    0.93,
    0.90,
    0.95,
    true,
    false
),

(
    'female_en_professional',
    'Professional Female Voice EN',
    'Professional English female voice for international content',
    'en-US',
    'female',
    '25-40',
    'American',
    '/voices/samples/female_en_professional.wav',
    22050,
    16,
    33.7,
    0.95,
    0.92,
    0.97,
    true,
    false
);

-- ============================================
-- ESTATÍSTICAS INICIAIS DO SISTEMA
-- ============================================

INSERT INTO system_stats (
    total_renders,
    active_jobs,
    completed_jobs,
    failed_jobs,
    avg_render_time_seconds,
    avg_lipsync_accuracy,
    success_rate,
    cpu_usage,
    memory_usage,
    gpu_usage,
    disk_usage,
    audio2face_status,
    redis_status,
    database_status
) VALUES (
    0,
    0,
    0,
    0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    'initializing',
    'connected',
    'connected'
);

-- ============================================
-- FUNÇÕES PARA DADOS DE EXEMPLO
-- ============================================

-- Função para criar job de exemplo (apenas para demonstração)
CREATE OR REPLACE FUNCTION create_demo_render_job(demo_user_id UUID)
RETURNS UUID AS $$
DECLARE
    job_id UUID;
    avatar_id UUID;
    voice_id UUID;
BEGIN
    -- Selecionar avatar padrão
    SELECT id INTO avatar_id FROM avatar_models WHERE name = 'male_professional_01' LIMIT 1;
    
    -- Selecionar voz padrão
    SELECT id INTO voice_id FROM voice_profiles WHERE name = 'male_br_professional' LIMIT 1;
    
    -- Criar job de demonstração
    INSERT INTO render_jobs (
        user_id,
        avatar_model_id,
        voice_profile_id,
        script_text,
        quality,
        resolution,
        enable_audio2face,
        enable_real_time_lipsync,
        camera_angle,
        lighting_preset,
        background_type,
        status
    ) VALUES (
        demo_user_id,
        avatar_id,
        voice_id,
        'Bem-vindos ao nosso sistema de avatares 3D hiper-realistas. Este é um exemplo de renderização com sincronização labial avançada.',
        'standard',
        '1080p',
        true,
        true,
        'front',
        'studio',
        'green_screen',
        'pending'
    ) RETURNING id INTO job_id;
    
    RETURN job_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para estatísticas de avatares
CREATE VIEW avatar_stats AS
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
GROUP BY am.id, am.name, am.display_name, am.avatar_type, am.gender;

-- View para estatísticas de vozes
CREATE VIEW voice_stats AS
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
GROUP BY vp.id, vp.name, vp.display_name, vp.language, vp.gender, vp.quality_score, vp.naturalness_score;

-- View para dashboard de renderização
CREATE VIEW render_dashboard AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
    COUNT(*) FILTER (WHERE status = 'processing') as processing_jobs,
    AVG(render_time_seconds) FILTER (WHERE status = 'completed') as avg_render_time,
    AVG(lipsync_accuracy) FILTER (WHERE status = 'completed') as avg_lipsync_accuracy
FROM render_jobs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON VIEW avatar_stats IS 'Estatísticas de uso e performance dos modelos de avatares';
COMMENT ON VIEW voice_stats IS 'Estatísticas de uso e qualidade dos perfis de voz';
COMMENT ON VIEW render_dashboard IS 'Dashboard com métricas de renderização dos últimos 30 dias';
COMMENT ON FUNCTION create_demo_render_job(UUID) IS 'Cria um job de renderização de demonstração para testes';