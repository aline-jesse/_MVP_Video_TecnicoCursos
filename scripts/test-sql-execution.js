const fs = require('fs');
require('dotenv').config();

console.log('🚀 Testando execução SQL...');

// Verificar variáveis
console.log('📋 Verificando variáveis de ambiente...');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ OK' : '❌ MISSING');
console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ OK' : '❌ MISSING');
console.log('DB_URL:', process.env.DIRECT_DATABASE_URL ? '✅ OK' : '❌ MISSING');

// Verificar arquivos
console.log('\n📁 Verificando arquivos SQL...');
const files = ['database-schema.sql', 'database-rls-policies.sql', 'seed-nr-courses.sql'];
files.forEach(file => {
    console.log(`${file}:`, fs.existsSync(file) ? '✅ OK' : '❌ MISSING');
});

// Testar conexão
async function testConnection() {
    try {
        const { Client } = require('pg');
        const client = new Client({
            connectionString: process.env.DIRECT_DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('\n🔌 Testando conexão...');
        await client.connect();
        console.log('✅ Conexão estabelecida!');
        
        // Testar query simples
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Query teste OK:', result.rows[0].current_time);
        
        // Verificar tabelas existentes
        const tables = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);
        
        console.log('\n📊 Tabelas existentes:');
        if (tables.rows.length === 0) {
            console.log('❌ Nenhuma tabela encontrada - banco precisa ser configurado');
        } else {
            tables.rows.forEach(row => console.log(`✅ ${row.tablename}`));
        }
        
        await client.end();
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        return false;
    }
}

testConnection();