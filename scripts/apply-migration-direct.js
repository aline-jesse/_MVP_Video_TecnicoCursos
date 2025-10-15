#!/usr/bin/env node

require('dotenv').config();

console.log('🚀 APLICANDO MIGRAÇÃO DIRETAMENTE');
console.log('═══════════════════════════════════════════════════════════════');

async function applyMigration() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔧 URL:', supabaseUrl);
    console.log('🔑 Service Key:', serviceKey ? 'Configurado' : 'Não configurado');

    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Variáveis de ambiente não configuradas');
        process.exit(1);
    }

    try {
        console.log('\n📋 Criando tabela nr_courses...');
        
        const createTableSQL = `
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

        // Tentar criar a tabela via SQL direto
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({ 
                query: createTableSQL 
            })
        });

        console.log('📊 Status da resposta:', response.status);
        const responseText = await response.text();
        console.log('📄 Resposta:', responseText);

        // Verificar se a tabela existe
        console.log('\n🔍 Verificando tabela...');
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/nr_courses?select=*&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            }
        });

        console.log('📊 Status da verificação:', checkResponse.status);
        const checkText = await checkResponse.text();
        console.log('📄 Resultado:', checkText);

    } catch (error) {
        console.error('\n❌ Erro:', error.message);
    }
}

applyMigration().catch(console.error);