#!/usr/bin/env node

require('dotenv').config();

console.log('🚀 SETUP MANUAL DO SUPABASE');
console.log('═══════════════════════════════════════════════════════════════');

async function setupManual() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Variáveis de ambiente não configuradas');
        process.exit(1);
    }

    console.log('📋 INSTRUÇÕES PARA SETUP MANUAL:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('1. Abra o SQL Editor do Supabase:');
    console.log('   https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/sql');
    console.log('');
    console.log('2. Cole e execute o seguinte SQL:');
    console.log('');
    console.log('-- Criar tabela nr_courses');
    console.log(`CREATE TABLE IF NOT EXISTS public.nr_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nr_number VARCHAR(10) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER DEFAULT 60,
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`);
    console.log('');
    console.log('-- Inserir dados de exemplo');
    console.log(`INSERT INTO public.nr_courses (nr_number, title, description, thumbnail_url, duration_minutes, difficulty_level) 
VALUES 
    ('NR-12', 'Segurança no Trabalho em Máquinas e Equipamentos', 'Curso sobre segurança em máquinas e equipamentos conforme NR-12', '/thumbnails/nr12-thumb.jpg', 120, 'intermediate'),
    ('NR-33', 'Segurança e Saúde nos Trabalhos em Espaços Confinados', 'Curso sobre trabalho em espaços confinados conforme NR-33', '/thumbnails/nr33-thumb.jpg', 90, 'advanced'),
    ('NR-35', 'Trabalho em Altura', 'Curso sobre trabalho em altura conforme NR-35', '/thumbnails/nr35-thumb.jpg', 80, 'intermediate')
ON CONFLICT (nr_number) DO NOTHING;`);
    console.log('');
    console.log('-- Habilitar RLS');
    console.log('ALTER TABLE public.nr_courses ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Política para leitura pública');
    console.log(`CREATE POLICY "Allow public read access" ON public.nr_courses
FOR SELECT USING (true);`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('3. Após executar, pressione ENTER para continuar...');
}

setupManual().catch(console.error);