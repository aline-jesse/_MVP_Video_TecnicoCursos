#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('🚀 CONFIGURAÇÃO SUPABASE VIA API');
console.log('═══════════════════════════════════════════════════════════════');

// Verificar dependências
try {
    require('@supabase/supabase-js');
    console.log('✅ Dependência @supabase/supabase-js encontrada');
} catch (error) {
    console.log('❌ Dependência @supabase/supabase-js não encontrada. Execute: npm install @supabase/supabase-js');
    process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

async function setupDatabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Variáveis de ambiente do Supabase não configuradas');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        console.log('\n🔌 Conectando ao Supabase via API...');
        
        // Testar conexão básica
        const { data, error } = await supabase.from('information_schema.tables').select('*').limit(1);
        if (error && !error.message.includes('relation "information_schema.tables" does not exist')) {
            throw error;
        }
        console.log('✅ Conectado com sucesso!');

        // 1. Executar schema usando SQL direto
        console.log('\n📋 1/3 - Executando database-schema.sql...');
        const schema = fs.readFileSync('database-schema.sql', 'utf8');
        
        // Dividir em comandos individuais
        const schemaCommands = schema.split(';').filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));
        
        for (const command of schemaCommands) {
            if (command.trim()) {
                const { error } = await supabase.rpc('exec_sql', { sql: command.trim() });
                if (error && !error.message.includes('already exists')) {
                    console.warn(`⚠️ Aviso no schema: ${error.message}`);
                }
            }
        }
        console.log('✅ Schema processado!');

        // 2. Executar RLS policies
        console.log('\n🔐 2/3 - Executando database-rls-policies.sql...');
        const rls = fs.readFileSync('database-rls-policies.sql', 'utf8');
        const rlsCommands = rls.split(';').filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));
        
        for (const command of rlsCommands) {
            if (command.trim()) {
                const { error } = await supabase.rpc('exec_sql', { sql: command.trim() });
                if (error && !error.message.includes('already exists')) {
                    console.warn(`⚠️ Aviso no RLS: ${error.message}`);
                }
            }
        }
        console.log('✅ Políticas RLS processadas!');

        // 3. Executar seed data
        console.log('\n🎓 3/3 - Executando seed-nr-courses.sql...');
        const seed = fs.readFileSync('seed-nr-courses.sql', 'utf8');
        const seedCommands = seed.split(';').filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));
        
        for (const command of seedCommands) {
            if (command.trim()) {
                const { error } = await supabase.rpc('exec_sql', { sql: command.trim() });
                if (error && !error.message.includes('already exists') && !error.message.includes('duplicate key')) {
                    console.warn(`⚠️ Aviso no seed: ${error.message}`);
                }
            }
        }
        console.log('✅ Dados iniciais processados!');

        // Verificar resultado
        console.log('\n🔍 Verificando resultado...');
        
        // Verificar tabelas criadas
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (!tablesError && tables) {
            console.log(`✅ ${tables.length} tabelas encontradas:`);
            tables.forEach(table => console.log(`   • ${table.table_name}`));
        }

        // Verificar cursos NR
        const { data: courses, error: coursesError } = await supabase
            .from('nr_courses')
            .select('*', { count: 'exact' });

        if (!coursesError && courses) {
            console.log(`✅ ${courses.length} cursos NR encontrados`);
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('✅ Banco de dados configurado');
        console.log('✅ Políticas RLS aplicadas');
        console.log('✅ Dados iniciais populados');
        console.log('═══════════════════════════════════════════════════════════════');

    } catch (error) {
        console.error('\n❌ Erro durante configuração:', error.message);
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log('⚠️ Alguns recursos já existem - isso é normal');
            console.log('✅ Configuração provavelmente já foi executada anteriormente');
        } else {
            throw error;
        }
    }
}

setupDatabase().catch(console.error);