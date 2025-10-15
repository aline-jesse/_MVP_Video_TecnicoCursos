-- ============================================
-- SCRIPT DE TESTE PARA VERIFICAR CONFIGURAÇÃO
-- Execute este script para verificar se tudo está funcionando
-- ============================================

-- ============================================
-- 1. VERIFICAR SE TODAS AS TABELAS EXISTEM
-- ============================================
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ============================================
-- 2. VERIFICAR POLÍTICAS RLS
-- ============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ============================================
-- 3. VERIFICAR BUCKETS DE STORAGE
-- ============================================
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets
ORDER BY name;

-- ============================================
-- 4. VERIFICAR DADOS DE EXEMPLO
-- ============================================
-- Contar cursos NR
SELECT 
    'nr_courses' as tabela,
    COUNT(*) as total_registros
FROM public.nr_courses

UNION ALL

-- Contar módulos NR
SELECT 
    'nr_modules' as tabela,
    COUNT(*) as total_registros
FROM public.nr_modules

UNION ALL

-- Contar usuários
SELECT 
    'users' as tabela,
    COUNT(*) as total_registros
FROM public.users

UNION ALL

-- Contar projetos
SELECT 
    'projects' as tabela,
    COUNT(*) as total_registros
FROM public.projects

ORDER BY tabela;

-- ============================================
-- 5. VERIFICAR ÍNDICES
-- ============================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 6. VERIFICAR TRIGGERS
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 7. VERIFICAR FUNÇÕES CRIADAS
-- ============================================
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_updated_at_column', 'is_admin')
ORDER BY routine_name;

-- ============================================
-- 8. TESTE DE CONEXÃO BÁSICA
-- ============================================
SELECT 
    'Conexão com banco de dados' as teste,
    'SUCESSO' as resultado,
    NOW() as timestamp;

-- ============================================
-- 9. VERIFICAR CONFIGURAÇÕES DE AUTENTICAÇÃO
-- ============================================
SELECT 
    'auth.users' as tabela,
    COUNT(*) as total_usuarios
FROM auth.users;

-- ============================================
-- RESULTADO DOS TESTES
-- ============================================
-- Se todos os comandos acima executaram sem erro,
-- sua configuração do Supabase está funcionando corretamente!