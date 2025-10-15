#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🌱 POPULANDO DADOS INICIAIS - CURSOS NR');
console.log('═══════════════════════════════════════════════════════════════\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCourses() {
    const courses = [
        {
            course_code: 'NR12',
            title: 'NR12 - Segurança em Máquinas e Equipamentos',
            description: 'Curso completo sobre segurança no trabalho com máquinas e equipamentos.',
            thumbnail_url: 'nr12-thumb.jpg',
            duration: 480,
            modules_count: 9,
            status: 'active',
            metadata: {
                category: 'Segurança do Trabalho',
                difficulty: 'Intermediário',
                requirements: ['Ensino Fundamental Completo'],
                certification: true
            }
        },
        {
            course_code: 'NR33',
            title: 'NR33 - Segurança em Espaços Confinados',
            description: 'Treinamento essencial para trabalho seguro em espaços confinados.',
            thumbnail_url: 'nr33-thumb.jpg',
            duration: 480,
            modules_count: 8,
            status: 'active',
            metadata: {
                category: 'Segurança do Trabalho',
                difficulty: 'Avançado',
                requirements: ['Ensino Médio Completo'],
                certification: true
            }
        },
        {
            course_code: 'NR35',
            title: 'NR35 - Trabalho em Altura',
            description: 'Capacitação para trabalho seguro em altura conforme legislação.',
            thumbnail_url: 'nr35-thumb.jpg',
            duration: 480,
            modules_count: 10,
            status: 'active',
            metadata: {
                category: 'Segurança do Trabalho',
                difficulty: 'Intermediário',
                requirements: ['Ensino Fundamental Completo', 'Aptidão Física'],
                certification: true
            }
        }
    ];

    console.log('📝 Inserindo cursos...\n');

    for (const course of courses) {
        try {
            const { data, error } = await supabase
                .from('nr_courses')
                .upsert(course, { onConflict: 'course_code' })
                .select();

            if (error) {
                console.log(`❌ ${course.course_code}: ${error.message}`);
            } else {
                console.log(`✅ ${course.course_code}: ${course.title}`);
            }
        } catch (err) {
            console.log(`❌ ${course.course_code}: ${err.message}`);
        }
    }

    console.log('\n📊 Verificando cursos inseridos...\n');

    const { data: allCourses, error } = await supabase
        .from('nr_courses')
        .select('course_code, title, modules_count');

    if (error) {
        console.log(`❌ Erro ao buscar cursos: ${error.message}`);
    } else {
        console.log(`✅ Total de cursos: ${allCourses?.length || 0}`);
        allCourses?.forEach(c => {
            console.log(`   - ${c.course_code}: ${c.title}`);
        });
    }
}

async function seedModules() {
    console.log('\n📝 Inserindo módulos de exemplo (NR12)...\n');

    // Buscar ID do curso NR12
    const { data: nr12Course, error: findCourseError } = await supabase
        .from('nr_courses')
        .select('id')
        .eq('course_code', 'NR12')
        .single();

    if (findCourseError || !nr12Course) {
        console.log('⚠️  Curso NR12 não encontrado, pulando módulos');
        return;
    }

    const modules = [
        {
            course_id: nr12Course.id,
            order_index: 1,
            title: 'Introdução à NR12',
            description: 'Conceitos básicos e objetivos da norma',
            duration: 40,
            content: { topics: ['O que é a NR12', 'Objetivos', 'Aplicação'] }
        },
        {
            course_id: nr12Course.id,
            order_index: 2,
            title: 'Arranjos Físicos e Instalações',
            description: 'Requisitos para arranjos físicos seguros',
            duration: 50,
            content: { topics: ['Organização', 'Sinalização', 'Acesso seguro'] }
        },
        {
            course_id: nr12Course.id,
            order_index: 3,
            title: 'Instalações e Dispositivos Elétricos',
            description: 'Segurança em instalações elétricas',
            duration: 45,
            content: { topics: ['NR10 x NR12', 'Proteções', 'Bloqueio e etiquetagem'] }
        },
        {
            course_id: nr12Course.id,
            order_index: 4,
            title: 'Partida, Acionamento e Parada',
            description: 'Sistemas de controle e segurança',
            duration: 40,
            content: { topics: ['Botões de emergência', 'Parada segura', 'Intertravamentos'] }
        },
        {
            course_id: nr12Course.id,
            order_index: 5,
            title: 'Sistemas de Segurança',
            description: 'Implementação de sistemas de proteção',
            duration: 55,
            content: { topics: ['Grades', 'Cortinas de luz', 'Sensores de presença'] }
        },
        {
            course_id: nr12Course.id,
            order_index: 6,
            title: 'Riscos Mecânicos',
            description: 'Identificação e mitigação de riscos',
            duration: 50,
            content: { topics: ['Cisalhamento', 'Apreensão', 'Impacto'] }
        },
        {
            course_id: nr12Course.id,
            order_index: 7,
            title: 'Manutenção Segura',
            description: 'Procedimentos de manutenção com segurança',
            duration: 45,
            content: { topics: ['Bloqueio e etiquetagem', 'Permissão de trabalho'] }
        },
        {
            course_id: nr12Course.id,
            order_index: 8,
            title: 'Treinamento e Capacitação',
            description: 'Exigências de treinamento NR12',
            duration: 35,
            content: { topics: ['Conteúdo mínimo', 'Periodicidade', 'Registros'] }
        },
        {
            course_id: nr12Course.id,
            order_index: 9,
            title: 'Inspeções e Auditorias',
            description: 'Como realizar inspeções e auditorias conforme NR12',
            duration: 45,
            content: { topics: ['Checklists', 'Relatórios', 'Ações corretivas'] }
        }
    ];

    try {
        const { data, error } = await supabase
            .from('nr_modules')
            .insert(modules)
            .select();

        if (error) {
            console.log(`❌ Erro ao inserir módulos: ${error.message}`);
        } else {
            console.log(`✅ ${data?.length || modules.length} módulos inseridos para NR12`);
        }
    } catch (err) {
        console.log(`❌ Erro ao inserir módulos: ${err.message}`);
    }
}

async function main() {
    try {
        await seedCourses();
        await seedModules();
        
        console.log('\n✅ Seed concluído com sucesso!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    }
}

main();
