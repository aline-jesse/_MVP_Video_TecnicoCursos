# ============================================
# 🗄️ CREATE DATABASE SCHEMA - SUPABASE
# ============================================
# Script para criar o schema completo do banco de dados
# Data: 09/10/2025

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🗄️ CRIAÇÃO DE SCHEMA DO BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configurações
$SUPABASE_URL = "https://ofhzrdiadxigrvmrhaiz.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9maHpyZGlhZHhpZ3J2bXJoYWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcxMTc2MSwiZXhwIjoyMDc1Mjg3NzYxfQ.0bVv7shwyo9aSGP5vbopBlZTS5MUDKkLtTCTYh36gug"

# SQL para criar as tabelas
$SQL_SCHEMA = @"
-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- TABELA: projects
-- ============================================
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

-- ============================================
-- TABELA: slides
-- ============================================
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

-- ============================================
-- TABELA: render_jobs
-- ============================================
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

-- ============================================
-- TABELA: analytics_events
-- ============================================
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

-- ============================================
-- TABELA: nr_courses (Cursos NR)
-- ============================================
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

-- ============================================
-- TABELA: nr_modules (Módulos dos Cursos)
-- ============================================
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

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_slides_project_id ON public.slides(project_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_project_id ON public.render_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_nr_modules_course_id ON public.nr_modules(course_id);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ language 'plpgsql';

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
"@

Write-Host "📝 SQL Schema preparado" -ForegroundColor Green
Write-Host ""

# Salvar SQL em arquivo
$sqlFilePath = Join-Path $PSScriptRoot "database-schema.sql"
$SQL_SCHEMA | Out-File -FilePath $sqlFilePath -Encoding UTF8
Write-Host "💾 Schema salvo em: $sqlFilePath" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Para aplicar o schema, você tem duas opções:" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPÇÃO 1 - Via Dashboard Supabase (Recomendado):" -ForegroundColor Cyan
Write-Host "   1. Acesse: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/editor" -ForegroundColor White
Write-Host "   2. Vá para 'SQL Editor'" -ForegroundColor White
Write-Host "   3. Cole o conteúdo do arquivo 'database-schema.sql'" -ForegroundColor White
Write-Host "   4. Clique em 'Run'" -ForegroundColor White
Write-Host ""

Write-Host "OPÇÃO 2 - Via psql (Linha de Comando):" -ForegroundColor Cyan
Write-Host '   psql "postgresql://postgres:Tr1unf0%40@db.ofhzrdiadxigrvmrhaiz.supabase.co:5432/postgres" -f database-schema.sql' -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 TABELAS QUE SERÃO CRIADAS:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. ✅ users             - Usuários do sistema" -ForegroundColor Green
Write-Host "   2. ✅ projects          - Projetos de vídeo" -ForegroundColor Green
Write-Host "   3. ✅ slides            - Slides dos projetos" -ForegroundColor Green
Write-Host "   4. ✅ render_jobs       - Jobs de renderização" -ForegroundColor Green
Write-Host "   5. ✅ analytics_events  - Eventos de analytics" -ForegroundColor Green
Write-Host "   6. ✅ nr_courses        - Cursos NR12, NR33, NR35" -ForegroundColor Green
Write-Host "   7. ✅ nr_modules        - Módulos dos cursos" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 RECURSOS ADICIONAIS CRIADOS:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "   • Índices para performance" -ForegroundColor Yellow
Write-Host "   • Triggers para atualização automática de timestamps" -ForegroundColor Yellow
Write-Host "   • Foreign keys e cascades configurados" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Red
Write-Host "   Após criar as tabelas, configure as políticas RLS (Row Level Security)" -ForegroundColor Yellow
Write-Host "   para proteger os dados dos usuários!" -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
