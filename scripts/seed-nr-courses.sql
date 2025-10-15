-- ============================================
-- DADOS INICIAIS - CURSOS NR
-- ============================================
-- Script para popular cursos NR12, NR33, NR35
-- Data: 09/10/2025

-- ============================================
-- CURSO NR12 - Segurança em Máquinas e Equipamentos
-- ============================================

INSERT INTO public.nr_courses (course_code, title, description, thumbnail_url, duration, modules_count, status, metadata)
VALUES (
    'NR12',
    'NR12 - Segurança em Máquinas e Equipamentos',
    'Curso completo sobre segurança no trabalho com máquinas e equipamentos de trabalho, abordando os principais riscos e medidas de proteção.',
    'nr12-thumb.jpg',
    480, -- 8 horas em minutos
    9,
    'active',
    '{
        "category": "Segurança do Trabalho",
        "difficulty": "Intermediário",
        "requirements": ["Ensino Fundamental Completo"],
        "certification": true
    }'::jsonb
) ON CONFLICT (course_code) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    thumbnail_url = EXCLUDED.thumbnail_url,
    updated_at = NOW();

-- Módulos do NR12
INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    1,
    'Introdução à NR12',
    'Apresentação da norma regulamentadora NR12 e sua importância para a segurança do trabalho',
    'nr12-intro.jpg',
    45,
    '{
        "topics": [
            "O que é a NR12",
            "Histórico e evolução da norma",
            "Importância da segurança em máquinas",
            "Responsabilidades legais"
        ],
        "resources": ["vídeo", "slides", "quiz"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    2,
    'Objetivos e Campo de Aplicação',
    'Compreenda os objetivos da NR12 e onde ela deve ser aplicada',
    'nr12-objetivos.jpg',
    40,
    '{
        "topics": [
            "Objetivos da NR12",
            "Campo de aplicação",
            "Equipamentos abrangidos",
            "Exceções e casos especiais"
        ],
        "resources": ["vídeo", "slides", "exemplos práticos"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    3,
    'Arranjo Físico e Instalações',
    'Requisitos de espaço e organização para operação segura',
    'nr12-arranjo.jpg',
    50,
    '{
        "topics": [
            "Espaços mínimos requeridos",
            "Circulação e vias de acesso",
            "Iluminação adequada",
            "Pisos e áreas de trabalho"
        ],
        "resources": ["vídeo", "slides", "plantas baixas exemplo"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    4,
    'Instalações Elétricas',
    'Segurança em instalações e dispositivos elétricos de máquinas',
    'nr12-eletrico.jpg',
    60,
    '{
        "topics": [
            "Quadros elétricos",
            "Dispositivos de segurança elétrica",
            "Aterramento",
            "Manutenção elétrica segura"
        ],
        "resources": ["vídeo", "slides", "diagramas elétricos"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    5,
    'Dispositivos de Partida, Acionamento e Parada',
    'Sistemas de controle seguro de máquinas',
    'nr12-partida.jpg',
    55,
    '{
        "topics": [
            "Botões de emergência",
            "Sistemas de partida segura",
            "Dispositivos de parada",
            "Bloqueios e intertravamentos"
        ],
        "resources": ["vídeo", "slides", "demonstrações práticas"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    6,
    'Sistemas de Segurança',
    'Proteções e dispositivos de segurança em máquinas',
    'nr12-seguranca.jpg',
    70,
    '{
        "topics": [
            "Proteções fixas e móveis",
            "Cortinas de luz",
            "Sensores de presença",
            "Bloqueios mecânicos",
            "Válvulas de segurança"
        ],
        "resources": ["vídeo", "slides", "casos práticos"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    7,
    'Procedimentos de Trabalho e Segurança',
    'Como trabalhar de forma segura com máquinas',
    'nr12-procedimentos.jpg',
    65,
    '{
        "topics": [
            "Análise de risco",
            "Procedimentos operacionais padrão",
            "Permissão de trabalho",
            "Check-list de segurança",
            "EPIs necessários"
        ],
        "resources": ["vídeo", "slides", "modelos de documentos"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    8,
    'Capacitação e Treinamento',
    'Requisitos de capacitação para operadores',
    'nr12-treinamento.jpg',
    50,
    '{
        "topics": [
            "Capacitação básica",
            "Capacitação específica",
            "Reciclagem periódica",
            "Certificação de operadores",
            "Registro de treinamentos"
        ],
        "resources": ["vídeo", "slides", "certificados modelo"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

INSERT INTO public.nr_modules (course_id, order_index, title, description, thumbnail_url, duration, content)
SELECT 
    c.id,
    9,
    'Manutenção e Inspeção',
    'Práticas seguras de manutenção de máquinas',
    'nr12-manutencao.jpg',
    45,
    '{
        "topics": [
            "Plano de manutenção",
            "Lock-out/Tag-out",
            "Inspeções periódicas",
            "Registros de manutenção",
            "Substituição de componentes"
        ],
        "resources": ["vídeo", "slides", "checklists"]
    }'::jsonb
FROM public.nr_courses c WHERE c.course_code = 'NR12'
ON CONFLICT DO NOTHING;

-- ============================================
-- CURSO NR33 - Segurança em Espaços Confinados
-- ============================================

INSERT INTO public.nr_courses (course_code, title, description, thumbnail_url, duration, modules_count, status, metadata)
VALUES (
    'NR33',
    'NR33 - Segurança e Saúde em Espaços Confinados',
    'Curso sobre trabalho seguro em espaços confinados, identificação de riscos e procedimentos de emergência.',
    'nr33-thumb.jpg',
    960, -- 16 horas
    8,
    'active',
    '{
        "category": "Segurança do Trabalho",
        "difficulty": "Avançado",
        "requirements": ["NR35 ou experiência em segurança"],
        "certification": true,
        "mandatory_practical": true
    }'::jsonb
) ON CONFLICT (course_code) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================
-- CURSO NR35 - Trabalho em Altura
-- ============================================

INSERT INTO public.nr_courses (course_code, title, description, thumbnail_url, duration, modules_count, status, metadata)
VALUES (
    'NR35',
    'NR35 - Trabalho em Altura',
    'Treinamento completo para trabalho seguro em altura, com foco em prevenção de quedas e uso de EPIs.',
    'nr35-thumb.jpg',
    480, -- 8 horas
    10,
    'active',
    '{
        "category": "Segurança do Trabalho",
        "difficulty": "Intermediário",
        "requirements": ["Aptidão física", "Exame médico válido"],
        "certification": true,
        "validity_months": 24,
        "mandatory_practical": true
    }'::jsonb
) ON CONFLICT (course_code) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

-- Ver todos os cursos
SELECT 
    course_code,
    title,
    modules_count,
    duration,
    status
FROM public.nr_courses
ORDER BY course_code;

-- Ver módulos por curso
SELECT 
    c.course_code,
    m.order_index,
    m.title,
    m.duration
FROM public.nr_modules m
JOIN public.nr_courses c ON c.id = m.course_id
ORDER BY c.course_code, m.order_index;
