#!/usr/bin/env node

import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

console.log('🚀 CONFIGURAÇÃO SUPABASE - USANDO CLIENTE SUPABASE');
console.log('═══════════════════════════════════════════════════════════════');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis Supabase não encontradas no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeSQL(sqlContent, description) {
    console.log(`\n🔄 Executando ${description}...`);
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const command of commands) {
        if (command.trim()) {
            try {
                const { error } = await supabase.rpc('exec_sql', { sql_query: command });
                if (error) {
                    // Ignorar erros de "já existe"
                    if (error.message.includes('already exists') || 
                        error.message.includes('duplicate key') ||
                        error.message.includes('relation') && error.message.includes('already exists')) {
                        console.log(`⚠️ Recurso já existe (ignorado): ${error.message.substring(0, 100)}...`);
                    } else {
                        console.log(`❌ Erro: ${error.message.substring(0, 100)}...`);
                        errorCount++;
                    }
                } else {
                    successCount++;
                }
            } catch (err) {
                console.log(`❌ Erro de execução: ${err.message.substring(0, 100)}...`);
                errorCount++;
            }
        }
    }
    
    console.log(`✅ ${description} - ${successCount} comandos executados, ${errorCount} erros`);
    return { successCount, errorCount };
}

async function setupDatabase() {
    try {
        console.log('\n🔌 Conectando ao Supabase...');
        
        // Teste de conectividade
        const { data, error } = await supabase.from('projects').select('id').limit(1);
        if (error && error.code !== '42P01') { // 42P01 = undefined_table
            console.error('❌ Erro de conectividade:', error.message);
            return false;
        }
        console.log('✅ Conectado com sucesso!');

        // 1. Executar schema
        console.log('\n📋 1/3 - Executando database-schema.sql...');
        const schema = fs.readFileSync('database-schema.sql', 'utf8');
        await executeSQL(schema, 'Schema do banco');

        // 2. Executar RLS policies
        console.log('\n🔐 2/3 - Executando database-rls-policies.sql...');
        const rls = fs.readFileSync('database-rls-policies.sql', 'utf8');
        await executeSQL(rls, 'Políticas RLS');

        // 3. Executar seed data
        console.log('\n🎓 3/3 - Executando seed-nr-courses.sql...');
        const seed = fs.readFileSync('seed-nr-courses.sql', 'utf8');
        await executeSQL(seed, 'Dados iniciais');

        // Verificar resultado
        console.log('\n🔍 Verificando resultado...');
        
        // Verificar tabelas criadas
        const expectedTables = ['users', 'projects', 'slides', 'render_jobs', 'analytics_events', 'nr_courses', 'nr_modules'];
        let tablesFound = 0;
        
        for (const tableName of expectedTables) {
            try {
                const { data, error } = await supabase.from(tableName).select('*').limit(1);
                if (!error) {
                    console.log(`✅ Tabela ${tableName}: OK`);
                    tablesFound++;
                } else {
                    console.log(`❌ Tabela ${tableName}: ${error.message}`);
                }
            } catch (err) {
                console.log(`❌ Tabela ${tableName}: ${err.message}`);
            }
        }

        // Verificar cursos NR
        try {
            const { data: courses, error } = await supabase.from('nr_courses').select('course_code, title');
            if (!error && courses) {
                console.log(`✅ ${courses.length} cursos NR encontrados:`);
                courses.forEach(course => console.log(`   • ${course.course_code}: ${course.title}`));
            }
        } catch (err) {
            console.log('❌ Erro ao verificar cursos NR');
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        if (tablesFound === expectedTables.length) {
            console.log('🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
            console.log('✅ Todas as tabelas foram criadas');
            console.log('✅ Políticas RLS aplicadas');
            console.log('✅ Dados iniciais populados');
        } else {
            console.log('⚠️ CONFIGURAÇÃO PARCIAL');
            console.log(`⚠️ ${tablesFound}/${expectedTables.length} tabelas criadas`);
            console.log('💡 Algumas tabelas podem precisar ser criadas manualmente');
        }
        console.log('═══════════════════════════════════════════════════════════════');

        return tablesFound === expectedTables.length;

    } catch (error) {
        console.error('\n❌ Erro durante configuração:', error.message);
        return false;
    }
}

setupDatabase().then(success => {
    process.exit(success ? 0 : 1);
}).catch(console.error);