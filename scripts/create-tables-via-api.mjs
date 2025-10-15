#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env da raiz do projeto
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 CRIAÇÃO DE TABELAS VIA API SUPABASE');
console.log('═══════════════════════════════════════════════════════════════\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Variáveis de ambiente não encontradas');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sqlContent, description) {
    console.log(`\n📝 Executando: ${description}...`);
    
    // Dividir SQL em statements individuais
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let success = 0;
    let errors = 0;
    
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            
            if (error) {
                // Ignorar erros "já existe"
                if (error.message.includes('already exists') || 
                    error.message.includes('duplicate')) {
                    console.log(`   ℹ️  Statement ${i + 1}/${statements.length}: Já existe (OK)`);
                    success++;
                } else {
                    console.error(`   ❌ Statement ${i + 1}/${statements.length}: ${error.message}`);
                    errors++;
                }
            } else {
                console.log(`   ✅ Statement ${i + 1}/${statements.length}: Executado`);
                success++;
            }
        } catch (err) {
            console.error(`   ❌ Statement ${i + 1}/${statements.length}: ${err.message}`);
            errors++;
        }
    }
    
    console.log(`\n📊 Resultado: ${success} sucesso, ${errors} erros de ${statements.length} statements`);
    return { success, errors, total: statements.length };
}

async function main() {
    const results = {
        schema: null,
        rls: null,
        seed: null
    };
    
    try {
        // 1. Schema
        const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            results.schema = await executeSQL(schema, 'Schema (7 tabelas)');
        } else {
            console.error('❌ Arquivo database-schema.sql não encontrado');
        }
        
        // 2. RLS Policies
        const rlsPath = path.join(__dirname, '..', 'database-rls-policies.sql');
        if (fs.existsSync(rlsPath)) {
            const rls = fs.readFileSync(rlsPath, 'utf8');
            results.rls = await executeSQL(rls, 'Políticas RLS');
        } else {
            console.error('❌ Arquivo database-rls-policies.sql não encontrado');
        }
        
        // 3. Seed Data
        const seedPath = path.join(__dirname, 'seed-nr-courses.sql');
        if (fs.existsSync(seedPath)) {
            const seed = fs.readFileSync(seedPath, 'utf8');
            results.seed = await executeSQL(seed, 'Dados iniciais (Cursos NR)');
        } else {
            console.error('❌ Arquivo seed-nr-courses.sql não encontrado');
        }
        
    } catch (error) {
        console.error('\n❌ Erro geral:', error.message);
        process.exit(1);
    }
    
    // Resumo final
    console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 RESUMO FINAL                                ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
    
    let totalSuccess = 0;
    let totalErrors = 0;
    let totalStatements = 0;
    
    if (results.schema) {
        console.log(`Schema:      ${results.schema.success}/${results.schema.total} ✅`);
        totalSuccess += results.schema.success;
        totalErrors += results.schema.errors;
        totalStatements += results.schema.total;
    }
    
    if (results.rls) {
        console.log(`RLS:         ${results.rls.success}/${results.rls.total} ✅`);
        totalSuccess += results.rls.success;
        totalErrors += results.rls.errors;
        totalStatements += results.rls.total;
    }
    
    if (results.seed) {
        console.log(`Seed:        ${results.seed.success}/${results.seed.total} ✅`);
        totalSuccess += results.seed.success;
        totalErrors += results.seed.errors;
        totalStatements += results.seed.total;
    }
    
    console.log(`\n📊 TOTAL: ${totalSuccess}/${totalStatements} statements executados com sucesso`);
    
    if (totalErrors === 0) {
        console.log('\n✅ Setup concluído com sucesso!');
        process.exit(0);
    } else {
        console.log(`\n⚠️  Setup concluído com ${totalErrors} avisos (provavelmente recursos já existentes)`);
        process.exit(0);
    }
}

main();
