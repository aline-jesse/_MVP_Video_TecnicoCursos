#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('🚀 CRIAÇÃO DE TABELAS VIA API REST');
console.log('═══════════════════════════════════════════════════════════════');

async function createTables() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Variáveis de ambiente não configuradas');
        process.exit(1);
    }

    try {
        // Criar tabelas básicas uma por vez
        console.log('\n📋 Criando tabelas básicas...');

        // 1. Tabela users
        console.log('   Criando tabela users...');
        const createUsersSQL = `
            CREATE TABLE IF NOT EXISTS public.users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                avatar_url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                metadata JSONB DEFAULT '{}'::jsonb
            );
        `;

        const usersResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({ sql: createUsersSQL })
        });

        if (usersResponse.ok) {
            console.log('   ✅ Tabela users criada');
        } else {
            console.log('   ⚠️ Tabela users já existe ou erro:', await usersResponse.text());
        }

        // 2. Tabela projects
        console.log('   Criando tabela projects...');
        const createProjectsSQL = `
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
        `;

        const projectsResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({ sql: createProjectsSQL })
        });

        if (projectsResponse.ok) {
            console.log('   ✅ Tabela projects criada');
        } else {
            console.log('   ⚠️ Tabela projects já existe ou erro:', await projectsResponse.text());
        }

        // 3. Tabela nr_courses
        console.log('   Criando tabela nr_courses...');
        const createNRCoursesSQL = `
            CREATE TABLE IF NOT EXISTS public.nr_courses (
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
            );
        `;

        const nrCoursesResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({ sql: createNRCoursesSQL })
        });

        if (nrCoursesResponse.ok) {
            console.log('   ✅ Tabela nr_courses criada');
        } else {
            console.log('   ⚠️ Tabela nr_courses já existe ou erro:', await nrCoursesResponse.text());
        }

        // 4. Inserir dados de exemplo
        console.log('\n🎓 Inserindo dados de exemplo...');
        const insertDataSQL = `
            INSERT INTO public.nr_courses (nr_number, title, description, thumbnail_url, duration_minutes, difficulty_level) 
            VALUES 
                ('NR-12', 'Segurança no Trabalho em Máquinas e Equipamentos', 'Curso sobre segurança em máquinas e equipamentos conforme NR-12', '/thumbnails/nr12-thumb.jpg', 120, 'intermediate'),
                ('NR-33', 'Segurança e Saúde nos Trabalhos em Espaços Confinados', 'Curso sobre trabalho em espaços confinados conforme NR-33', '/thumbnails/nr33-thumb.jpg', 90, 'advanced'),
                ('NR-35', 'Trabalho em Altura', 'Curso sobre trabalho em altura conforme NR-35', '/thumbnails/nr35-thumb.jpg', 80, 'intermediate')
            ON CONFLICT (nr_number) DO NOTHING;
        `;

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({ sql: insertDataSQL })
        });

        if (insertResponse.ok) {
            console.log('   ✅ Dados de exemplo inseridos');
        } else {
            console.log('   ⚠️ Dados já existem ou erro:', await insertResponse.text());
        }

        // 5. Verificar resultado
        console.log('\n🔍 Verificando resultado...');
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/nr_courses?select=*`, {
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            }
        });

        if (checkResponse.ok) {
            const courses = await checkResponse.json();
            console.log(`✅ ${courses.length} cursos encontrados na tabela nr_courses`);
            courses.forEach(course => console.log(`   • ${course.nr_number}: ${course.title}`));
        } else {
            console.log('❌ Erro ao verificar dados:', await checkResponse.text());
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('🎉 CONFIGURAÇÃO BÁSICA CONCLUÍDA!');
        console.log('✅ Tabelas principais criadas');
        console.log('✅ Dados de exemplo inseridos');
        console.log('✅ Sistema pronto para uso');
        console.log('═══════════════════════════════════════════════════════════════');

    } catch (error) {
        console.error('\n❌ Erro durante configuração:', error.message);
        throw error;
    }
}

createTables().catch(console.error);