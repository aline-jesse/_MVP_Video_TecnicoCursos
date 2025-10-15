-- ============================================
-- DADOS DE EXEMPLO PARA TESTE
-- ============================================
-- Execute este script após criar as tabelas e configurar RLS

-- ============================================
-- CURSOS NR DE EXEMPLO
-- ============================================
INSERT INTO public.nr_courses (course_code, title, description, thumbnail_url, duration, modules_count) VALUES
('NR12', 'Segurança no Trabalho em Máquinas e Equipamentos', 'Curso completo sobre NR-12 - Segurança no Trabalho em Máquinas e Equipamentos', '/nr12-thumb.jpg', 480, 6),
('NR33', 'Segurança e Saúde nos Trabalhos em Espaços Confinados', 'Curso sobre NR-33 - Trabalhos em Espaços Confinados', '/nr33-thumb.jpg', 360, 4),
('NR35', 'Trabalho em Altura', 'Curso sobre NR-35 - Trabalho em Altura', '/nr35-thumb.jpg', 240, 3)
ON CONFLICT (course_code) DO NOTHING;

-- ============================================
-- MÓDULOS NR12
-- ============================================
INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration) VALUES
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 1, 'Introdução à NR-12', 'Conceitos básicos e objetivos da norma', '/nr12-intro.jpg', 80),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 2, 'Arranjos Físicos e Instalações', 'Requisitos para arranjos físicos seguros', '/nr12-arranjo.jpg', 90),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 3, 'Instalações e Dispositivos Elétricos', 'Segurança em instalações elétricas', '/nr12-eletrico.jpg', 85),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 4, 'Dispositivos de Partida, Acionamento e Parada', 'Sistemas de controle e segurança', '/nr12-partida.jpg', 75),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 5, 'Sistemas de Segurança', 'Implementação de sistemas de proteção', '/nr12-seguranca.jpg', 95),
((SELECT id FROM public.nr_courses WHERE course_code = 'NR12'), 6, 'Objetivos e Campo de Aplicação', 'Aplicação prática da norma', '/nr12-objetivos.jpg', 55);

-- ============================================
-- EXEMPLO DE USUÁRIO ADMIN (OPCIONAL)
-- ============================================
-- Este usuário será criado automaticamente quando alguém se registrar
-- Você pode atualizar o role manualmente após o registro

-- ============================================
-- FUNÇÃO PARA POPULAR DADOS DE TESTE
-- ============================================
CREATE OR REPLACE FUNCTION public.create_sample_course_data(user_id UUID)
RETURNS VOID AS $$
DECLARE
    course_id UUID;
    video_id UUID;
BEGIN
    -- Criar curso de exemplo
    INSERT INTO public.courses (title, description, author_id, thumbnail_url)
    VALUES (
        'Curso de Exemplo - Segurança no Trabalho',
        'Este é um curso de exemplo para demonstrar o sistema',
        user_id,
        '/example-course-thumb.jpg'
    )
    RETURNING id INTO course_id;
    
    -- Criar vídeos de exemplo
    INSERT INTO public.videos (title, description, video_url, course_id, order_index, duration)
    VALUES 
    ('Introdução ao Curso', 'Vídeo introdutório', 'https://example.com/video1.mp4', course_id, 1, 300),
    ('Conceitos Básicos', 'Conceitos fundamentais', 'https://example.com/video2.mp4', course_id, 2, 450),
    ('Aplicação Prática', 'Exemplos práticos', 'https://example.com/video3.mp4', course_id, 3, 600);
    
    RAISE NOTICE 'Dados de exemplo criados para o usuário %', user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO PARA LIMPAR DADOS DE TESTE
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_sample_data()
RETURNS VOID AS $$
BEGIN
    -- Deletar progresso de usuários
    DELETE FROM public.user_progress WHERE video_id IN (
        SELECT id FROM public.videos WHERE course_id IN (
            SELECT id FROM public.courses WHERE title LIKE '%Exemplo%'
        )
    );
    
    -- Deletar vídeos de exemplo
    DELETE FROM public.videos WHERE course_id IN (
        SELECT id FROM public.courses WHERE title LIKE '%Exemplo%'
    );
    
    -- Deletar cursos de exemplo
    DELETE FROM public.courses WHERE title LIKE '%Exemplo%';
    
    RAISE NOTICE 'Dados de exemplo removidos';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ============================================
CREATE OR REPLACE VIEW public.course_stats AS
SELECT 
    c.id,
    c.title,
    c.author_id,
    COUNT(v.id) as total_videos,
    COALESCE(SUM(v.duration), 0) as total_duration,
    COUNT(DISTINCT up.user_id) as enrolled_users,
    c.created_at
FROM public.courses c
LEFT JOIN public.videos v ON c.id = v.course_id
LEFT JOIN public.user_progress up ON v.id = up.video_id
GROUP BY c.id, c.title, c.author_id, c.created_at;

CREATE OR REPLACE VIEW public.user_course_progress AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    c.id as course_id,
    c.title as course_title,
    COUNT(v.id) as total_videos,
    COUNT(up.id) as watched_videos,
    COUNT(CASE WHEN up.completed THEN 1 END) as completed_videos,
    ROUND(
        (COUNT(CASE WHEN up.completed THEN 1 END)::float / COUNT(v.id)::float) * 100, 2
    ) as completion_percentage
FROM public.users u
CROSS JOIN public.courses c
LEFT JOIN public.videos v ON c.id = v.course_id
LEFT JOIN public.user_progress up ON v.id = up.video_id AND u.id = up.user_id
GROUP BY u.id, u.name, c.id, c.title;