#!/usr/bin/env node

require('dotenv').config();

console.log('🧪 VERIFICAÇÃO DO SETUP SUPABASE');
console.log('═══════════════════════════════════════════════════════════════');

async function verifySetup() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔧 URL:', supabaseUrl);
    console.log('🔑 Service Key:', serviceKey ? 'Configurado' : 'Não configurado');

    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Variáveis de ambiente não configuradas');
        process.exit(1);
    }

    try {
        console.log('\n🔍 Testando acesso à tabela nr_courses...');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/nr_courses?select=*`, {
            method: 'GET',
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            }
        });

        console.log('📊 Status da resposta:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Tabela nr_courses encontrada!');
            console.log('📊 Registros encontrados:', data.length);
            
            if (data.length > 0) {
                console.log('\n📋 Dados encontrados:');
                data.forEach((course, index) => {
                    console.log(`${index + 1}. ${course.nr_number}: ${course.title}`);
                });
            }
            
            console.log('\n🎉 SETUP DO SUPABASE CONCLUÍDO COM SUCESSO!');
            return true;
        } else {
            const error = await response.text();
            console.log('❌ Erro:', error);
            
            if (response.status === 404) {
                console.log('\n⚠️ A tabela nr_courses não foi encontrada.');
                console.log('\n📋 INSTRUÇÕES PARA SETUP MANUAL:');
                console.log('1. Abra: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/sql');
                console.log('2. Cole e execute o SQL da migração criada');
                console.log('3. Execute este script novamente para verificar');
            }
            return false;
        }

    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        return false;
    }
}

verifySetup().then(success => {
    process.exit(success ? 0 : 1);
}).catch(console.error)