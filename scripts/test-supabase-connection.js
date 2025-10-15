#!/usr/bin/env node

const fs = require('fs');
require('dotenv').config();

console.log('🔍 TESTE DE CONECTIVIDADE SUPABASE');
console.log('═══════════════════════════════════════════════════════════════');

// Verificar dependências
try {
    require('pg');
    console.log('✅ Dependência pg encontrada');
} catch (error) {
    console.log('❌ Dependência pg não encontrada. Execute: npm install pg');
    process.exit(1);
}

const { Client } = require('pg');

async function testConnection() {
    // Tentar com URL direta primeiro
    const directUrl = process.env.DIRECT_DATABASE_URL;
    console.log('\n🔌 Testando conexão direta...');
    console.log('URL:', directUrl ? directUrl.replace(/:[^:]*@/, ':***@') : 'Não encontrada');

    const client = new Client({
        connectionString: directUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conexão direta bem-sucedida!');

        // Testar consulta simples
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Consulta de teste executada:', result.rows[0].current_time);

        // Verificar tabelas existentes
        const tables = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);

        console.log(`\n📋 Tabelas existentes (${tables.rows.length}):`);
        if (tables.rows.length === 0) {
            console.log('   • Nenhuma tabela encontrada - banco precisa ser configurado');
        } else {
            tables.rows.forEach(row => console.log(`   • ${row.tablename}`));
        }

        return true;

    } catch (error) {
        console.error('\n❌ Erro na conexão direta:', error.message);
        return false;
    } finally {
        await client.end();
    }
}

async function testSupabaseSDK() {
    console.log('\n🔌 Testando Supabase SDK...');
    
    try {
        const { createClient } = require('@supabase/supabase-js');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.log('❌ Variáveis Supabase não encontradas');
            return false;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Testar consulta simples
        const { data, error } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public')
            .limit(5);
            
        if (error) {
            console.log('❌ Erro no SDK:', error.message);
            return false;
        }
        
        console.log('✅ Supabase SDK funcionando!');
        console.log(`✅ ${data.length} tabelas encontradas via SDK`);
        return true;
        
    } catch (error) {
        console.log('❌ Erro no SDK:', error.message);
        return false;
    }
}

async function main() {
    const directSuccess = await testConnection();
    const sdkSuccess = await testSupabaseSDK();
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 RESULTADO DOS TESTES:');
    console.log(`   • Conexão Direta: ${directSuccess ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`   • Supabase SDK: ${sdkSuccess ? '✅ OK' : '❌ FALHOU'}`);
    
    if (directSuccess || sdkSuccess) {
        console.log('\n🎉 PELO MENOS UMA CONEXÃO FUNCIONOU!');
        console.log('✅ Pode prosseguir com a configuração do banco');
    } else {
        console.log('\n❌ NENHUMA CONEXÃO FUNCIONOU');
        console.log('⚠️ Verifique as credenciais no arquivo .env');
    }
    console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);