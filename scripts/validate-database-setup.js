#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

console.log('🔍 VALIDAÇÃO DO SETUP DO BANCO DE DADOS');
console.log('═══════════════════════════════════════════════════════════════');

async function validateDatabaseSetup() {
    try {
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Variáveis Supabase não encontradas no .env');
        }
        
        console.log('✅ Credenciais Supabase encontradas');
        console.log('🔌 Conectando ao Supabase...');
        
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        
        console.log('✅ Cliente Supabase criado!');

        // Verificar tabelas esperadas
        const expectedTables = [
            'users',
            'projects', 
            'slides',
            'render_jobs',
            'analytics_events',
            'nr_courses',
            'nr_modules'
        ];

        console.log('\n📋 Verificando tabelas...');
        let tablesFound = 0;
        
        for (const tableName of expectedTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                    
                if (error) {
                    console.log(`❌ ${tableName}: ${error.message}`);
                } else {
                    console.log(`✅ ${tableName}: OK`);
                    tablesFound++;
                }
            } catch (err) {
                console.log(`❌ ${tableName}: ${err.message}`);
            }
        }

        // Verificar cursos NR especificamente
        console.log('\n🎓 Verificando cursos NR...');
        try {
            const { data: courses, error } = await supabase
                .from('nr_courses')
                .select('course_code, title')
                .order('course_code');
                
            if (error) {
                console.log(`❌ Erro ao buscar cursos: ${error.message}`);
            } else if (courses && courses.length > 0) {
                console.log(`✅ ${courses.length} cursos NR encontrados:`);
                courses.forEach(course => console.log(`   • ${course.course_code}: ${course.title}`));
            } else {
                console.log('⚠️ Nenhum curso NR encontrado');
            }
        } catch (err) {
            console.log(`❌ Erro ao verificar cursos: ${err.message}`);
        }

        // Verificar storage buckets
        console.log('\n🗄️ Verificando storage buckets...');
        const expectedBuckets = ['videos', 'avatars', 'thumbnails', 'assets'];
        
        try {
            const { data: buckets, error } = await supabase.storage.listBuckets();
            
            if (error) {
                console.log(`❌ Erro ao listar buckets: ${error.message}`);
            } else {
                console.log(`✅ ${buckets.length} buckets encontrados:`);
                buckets.forEach(bucket => {
                    const isExpected = expectedBuckets.includes(bucket.name);
                    console.log(`   ${isExpected ? '✅' : '⚠️'} ${bucket.name}`);
                });
                
                const missingBuckets = expectedBuckets.filter(
                    expected => !buckets.find(bucket => bucket.name === expected)
                );
                
                if (missingBuckets.length > 0) {
                    console.log('\n❌ Buckets faltando:');
                    missingBuckets.forEach(bucket => console.log(`   • ${bucket}`));
                }
            }
        } catch (err) {
            console.log(`❌ Erro ao verificar storage: ${err.message}`);
        }

        // Resumo final
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 RESUMO DA VALIDAÇÃO:');
        console.log(`   • Tabelas encontradas: ${tablesFound}/${expectedTables.length}`);
        
        if (tablesFound === expectedTables.length) {
            console.log('🎉 BANCO DE DADOS CONFIGURADO CORRETAMENTE!');
            console.log('✅ Todas as tabelas necessárias estão presentes');
            console.log('✅ Sistema pronto para uso');
        } else if (tablesFound > 0) {
            console.log('⚠️ CONFIGURAÇÃO PARCIAL');
            console.log('⚠️ Algumas tabelas estão faltando');
            console.log('💡 Execute os scripts SQL manualmente no Supabase Dashboard');
        } else {
            console.log('❌ BANCO NÃO CONFIGURADO');
            console.log('❌ Nenhuma tabela encontrada');
            console.log('💡 Execute a configuração completa do banco');
        }
        console.log('═══════════════════════════════════════════════════════════════');

        return tablesFound === expectedTables.length;

    } catch (error) {
        console.error('\n❌ Erro durante validação:', error.message);
        
        console.log('\n💡 INSTRUÇÕES PARA CONFIGURAÇÃO MANUAL:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/sql');
        console.log('2. Execute os seguintes arquivos na ordem:');
        console.log('   a) database-schema.sql');
        console.log('   b) database-rls-policies.sql');
        console.log('   c) seed-nr-courses.sql');
        console.log('3. Execute este script novamente para validar');
        
        return false;
    }
}

validateDatabaseSetup().then(success => {
    process.exit(success ? 0 : 1);
}).catch(console.error);