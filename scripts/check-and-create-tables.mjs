#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env da raiz do projeto
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 SETUP COMPLETO DO BANCO DE DADOS');
console.log('═══════════════════════════════════════════════════════════════\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const directUrl = process.env.DIRECT_DATABASE_URL;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTablesDirectly() {
    console.log('📝 Criando tabelas usando SDK Supabase...\n');
    
    const tables = [
        {
            name: 'users',
            sql: `
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    avatar_url TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
            `
        },
        {
            name: 'projects',
            sql: `
                CREATE TABLE IF NOT EXISTS projects (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(500) NOT NULL,
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'draft',
                    settings JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `
        },
        {
            name: 'slides',
            sql: `
                CREATE TABLE IF NOT EXISTS slides (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
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
            `
        },
        {
            name: 'render_jobs',
            sql: `
                CREATE TABLE IF NOT EXISTS render_jobs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                    status VARCHAR(50) DEFAULT 'pending',
                    progress INTEGER DEFAULT 0,
                    output_url TEXT,
                    error_message TEXT,
                    render_settings JSONB DEFAULT '{}'::jsonb,
                    started_at TIMESTAMPTZ,
                    completed_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            `
        },
        {
            name: 'analytics_events',
            sql: `
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                    event_type VARCHAR(100) NOT NULL,
                    event_data JSONB DEFAULT '{}'::jsonb,
                    session_id VARCHAR(255),
                    ip_address VARCHAR(50),
                    user_agent TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            `
        },
        {
            name: 'nr_courses',
            sql: `
                CREATE TABLE IF NOT EXISTS nr_courses (
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
            `
        },
        {
            name: 'nr_modules',
            sql: `
                CREATE TABLE IF NOT EXISTS nr_modules (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    course_id UUID REFERENCES nr_courses(id) ON DELETE CASCADE,
                    order_index INTEGER NOT NULL,
                    title VARCHAR(500) NOT NULL,
                    description TEXT,
                    video_url TEXT,
                    duration INTEGER,
                    is_preview BOOLEAN DEFAULT false,
                    content JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `
        }
    ];
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const table of tables) {
        try {
            // Tentar criar via API query (pode não funcionar em todos os casos)
            const { data, error } = await supabase
                .from(table.name)
                .select('id')
                .limit(1);
            
            if (error && error.code === 'PGRST116') {
                // Tabela não existe - precisamos criar via SQL direto
                console.log(`❌ Tabela '${table.name}' não existe e não pode ser criada via API`);
                errors++;
            } else if (error) {
                console.log(`⚠️  Tabela '${table.name}': ${error.message}`);
                errors++;
            } else {
                console.log(`✅ Tabela '${table.name}' já existe`);
                skipped++;
            }
        } catch (err) {
            console.log(`❌ Erro ao verificar tabela '${table.name}': ${err.message}`);
            errors++;
        }
    }
    
    console.log(`\n📊 Resultado: ${created} criadas, ${skipped} já existiam, ${errors} erros\n`);
    
    return { created, skipped, errors };
}

async function checkTables() {
    console.log('🔍 Verificando tabelas criadas...\n');
    
    const tableNames = ['users', 'projects', 'slides', 'render_jobs', 'analytics_events', 'nr_courses', 'nr_modules'];
    const existing = [];
    const missing = [];
    
    for (const tableName of tableNames) {
        try {
            const { error } = await supabase
                .from(tableName)
                .select('id')
                .limit(1);
            
            if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
                missing.push(tableName);
                console.log(`❌ Tabela '${tableName}' não encontrada`);
            } else {
                existing.push(tableName);
                console.log(`✅ Tabela '${tableName}' existe`);
            }
        } catch (err) {
            missing.push(tableName);
            console.log(`❌ Tabela '${tableName}' não acessível`);
        }
    }
    
    console.log(`\n📊 Status: ${existing.length}/7 tabelas encontradas\n`);
    
    return { existing, missing };
}

async function main() {
    try {
        // Verificar estado atual
        const { existing, missing } = await checkTables();
        
        if (missing.length === 0) {
            console.log('✅ Todas as tabelas já existem!\n');
            console.log('💡 Para criar as políticas RLS, execute:');
            console.log('   npm run setup:supabase\n');
            process.exit(0);
        }
        
        console.log(`⚠️  Faltam ${missing.length} tabelas: ${missing.join(', ')}\n`);
        console.log('💡 PRÓXIMOS PASSOS:\n');
        console.log('1. Acesse o Supabase Dashboard:');
        console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql')}\n`);
        console.log('2. Cole o conteúdo de database-schema.sql no SQL Editor');
        console.log('3. Execute o SQL');
        console.log('4. Execute este script novamente para verificar\n');
        
        // Mostrar conteúdo do schema
        const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('═══════════════════════════════════════════════════════════════');
            console.log('📄 CONTEÚDO DO SCHEMA (copie e cole no SQL Editor):');
            console.log('═══════════════════════════════════════════════════════════════\n');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            console.log(schema);
        }
        
    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    }
}

main();
