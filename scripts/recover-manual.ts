import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Configuração
dotenv.config()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Utilitários
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function recoverDatabase() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🔄 RECUPERAÇÃO MANUAL DO BANCO                          ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  try {
    // 1. Dropar schema
    console.log(chalk.yellow('1️⃣  Limpando schema...\n'))
    await supabase.rpc('exec_sql', { 
      sql: 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;' 
    })
    await delay(2000)

    // 2. Permissões
    console.log(chalk.yellow('2️⃣  Configurando permissões...\n'))
    const grants = [
      'GRANT ALL ON SCHEMA public TO postgres;',
      'GRANT USAGE ON SCHEMA public TO anon;',
      'GRANT USAGE ON SCHEMA public TO authenticated;',
      'GRANT USAGE ON SCHEMA public TO service_role;'
    ]
    for (const grant of grants) {
      await supabase.rpc('exec_sql', { sql: grant })
      await delay(500)
    }

    // 3. Funções
    console.log(chalk.yellow('3️⃣  Criando funções utilitárias...\n'))
    const functions = [
      `CREATE OR REPLACE FUNCTION public.get_policies()
       RETURNS TABLE (schema_name text, table_name text, policy_name text)
       AS $$ BEGIN
         RETURN QUERY SELECT n.nspname::text, c.relname::text, pol.polname::text
         FROM pg_policy pol
         JOIN pg_class c ON c.oid = pol.polrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace;
       END; $$ LANGUAGE plpgsql SECURITY DEFINER;`,
      
      `CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
       RETURNS void AS $$
       BEGIN EXECUTE sql; END;
       $$ LANGUAGE plpgsql SECURITY DEFINER;`
    ]
    for (const func of functions) {
      await supabase.rpc('exec_sql', { sql: func })
      await delay(500)
    }

    // 4. Tabelas
    console.log(chalk.yellow('4️⃣  Criando tabelas...\n'))
    const tables = {
      users: `
        CREATE TABLE public.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          avatar_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );`,
      
      projects: `
        CREATE TABLE public.projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );`,
      
      slides: `
        CREATE TABLE public.slides (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
          content JSONB NOT NULL,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );`,
      
      render_jobs: `
        CREATE TABLE public.render_jobs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'pending',
          progress INTEGER DEFAULT 0,
          error TEXT,
          output_url TEXT,
          started_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );`,
      
      analytics_events: `
        CREATE TABLE public.analytics_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
          event_type VARCHAR(100) NOT NULL,
          event_data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`,
      
      nr_courses: `
        CREATE TABLE public.nr_courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(500) NOT NULL,
          description TEXT,
          nr_number VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );`,
      
      nr_modules: `
        CREATE TABLE public.nr_modules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID REFERENCES public.nr_courses(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );`
    }
    
    for (const [name, sql] of Object.entries(tables)) {
      console.log(chalk.gray(`   Criando tabela ${name}...`))
      await supabase.rpc('exec_sql', { sql })
      await delay(1000)
    }

    // 5. Índices
    console.log(chalk.yellow('\n5️⃣  Criando índices...\n'))
    const indices = [
      'CREATE INDEX projects_user_id_idx ON public.projects(user_id);',
      'CREATE INDEX slides_project_id_idx ON public.slides(project_id);',
      'CREATE INDEX slides_order_index_idx ON public.slides(order_index);',
      'CREATE INDEX render_jobs_project_id_idx ON public.render_jobs(project_id);',
      'CREATE INDEX render_jobs_status_idx ON public.render_jobs(status);',
      'CREATE INDEX analytics_events_user_id_idx ON public.analytics_events(user_id);',
      'CREATE INDEX analytics_events_type_idx ON public.analytics_events(event_type);',
      'CREATE INDEX nr_modules_course_id_idx ON public.nr_modules(course_id);',
      'CREATE INDEX nr_modules_order_index_idx ON public.nr_modules(order_index);'
    ]
    for (const index of indices) {
      await supabase.rpc('exec_sql', { sql: index })
      await delay(500)
    }

    // 6. RLS
    console.log(chalk.yellow('6️⃣  Configurando RLS...\n'))
    const tables_rls = [
      'users', 'projects', 'slides', 'render_jobs',
      'analytics_events', 'nr_courses', 'nr_modules'
    ]
    for (const table of tables_rls) {
      await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;` 
      })
      await delay(500)
    }

    // 7. Policies
    console.log(chalk.yellow('7️⃣  Criando policies...\n'))
    const policies = [
      `CREATE POLICY "Users can view own profile" ON public.users 
       FOR SELECT USING (auth.uid() = id);`,
      
      `CREATE POLICY "Users can update own profile" ON public.users 
       FOR UPDATE USING (auth.uid() = id);`,
      
      `CREATE POLICY "Users can view own projects" ON public.projects 
       FOR SELECT USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can create own projects" ON public.projects 
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can update own projects" ON public.projects 
       FOR UPDATE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can delete own projects" ON public.projects 
       FOR DELETE USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can view project slides" ON public.slides 
       FOR SELECT USING (EXISTS (
         SELECT 1 FROM public.projects
         WHERE id = slides.project_id
         AND user_id = auth.uid()
       ));`,
      
      `CREATE POLICY "Users can manage project slides" ON public.slides 
       FOR ALL USING (EXISTS (
         SELECT 1 FROM public.projects
         WHERE id = slides.project_id
         AND user_id = auth.uid()
       ));`,
      
      `CREATE POLICY "Users can view own render jobs" ON public.render_jobs 
       FOR SELECT USING (EXISTS (
         SELECT 1 FROM public.projects
         WHERE id = render_jobs.project_id
         AND user_id = auth.uid()
       ));`,
      
      `CREATE POLICY "Users can create render jobs for own projects" ON public.render_jobs 
       FOR INSERT WITH CHECK (EXISTS (
         SELECT 1 FROM public.projects
         WHERE id = project_id
         AND user_id = auth.uid()
       ));`,
      
      `CREATE POLICY "Users can view own analytics" ON public.analytics_events 
       FOR SELECT USING (user_id = auth.uid());`,
      
      `CREATE POLICY "Users can create own analytics" ON public.analytics_events 
       FOR INSERT WITH CHECK (user_id = auth.uid());`,
      
      `CREATE POLICY "Anyone can view NR courses" ON public.nr_courses 
       FOR SELECT USING (true);`,
      
      `CREATE POLICY "Admins can manage NR courses" ON public.nr_courses 
       FOR ALL USING (EXISTS (
         SELECT 1 FROM public.users
         WHERE id = auth.uid()
         AND metadata->>'role' = 'admin'
       ));`,
      
      `CREATE POLICY "Anyone can view NR modules" ON public.nr_modules 
       FOR SELECT USING (true);`,
      
      `CREATE POLICY "Admins can manage NR modules" ON public.nr_modules 
       FOR ALL USING (EXISTS (
         SELECT 1 FROM public.users
         WHERE id = auth.uid()
         AND metadata->>'role' = 'admin'
       ));`
    ]
    for (const policy of policies) {
      await supabase.rpc('exec_sql', { sql: policy })
      await delay(500)
    }

    // 8. Dados Iniciais
    console.log(chalk.yellow('8️⃣  Inserindo dados iniciais...\n'))
    
    // Cursos NR
    const coursesSQL = `
      INSERT INTO public.nr_courses (title, description, nr_number, status, metadata)
      VALUES
        ('NR-10: Segurança em Instalações Elétricas', 
         'Curso completo sobre segurança em instalações e serviços com eletricidade', 
         'NR-10',
         'published',
         '{"version": "2023", "hours": 40, "category": "segurança"}'::jsonb),
        
        ('NR-12: Segurança no Trabalho com Máquinas', 
         'Capacitação em segurança para operação de máquinas e equipamentos', 
         'NR-12',
         'published',
         '{"version": "2023", "hours": 30, "category": "segurança"}'::jsonb),
        
        ('NR-35: Trabalho em Altura',
         'Treinamento completo para trabalhos em altura acima de 2 metros',
         'NR-35',
         'published',
         '{"version": "2023", "hours": 20, "category": "segurança"}'::jsonb);`
    
    await supabase.rpc('exec_sql', { sql: coursesSQL })
    await delay(1000)
    
    // Módulos NR
    const modulesSQL = [
      `INSERT INTO public.nr_modules (course_id, title, description, order_index)
       SELECT 
         id as course_id,
         'Introdução à NR-10' as title,
         'Conceitos básicos e fundamentos da norma' as description,
         1 as order_index
       FROM public.nr_courses
       WHERE nr_number = 'NR-10';`,
      
      `INSERT INTO public.nr_modules (course_id, title, description, order_index)
       SELECT 
         id as course_id,
         'Riscos em Instalações Elétricas' as title,
         'Identificação e prevenção de riscos elétricos' as description,
         2 as order_index
       FROM public.nr_courses
       WHERE nr_number = 'NR-10';`,
      
      `INSERT INTO public.nr_modules (course_id, title, description, order_index)
       SELECT 
         id as course_id,
         'Princípios da NR-12' as title,
         'Fundamentos e aplicações da norma' as description,
         1 as order_index
       FROM public.nr_courses
       WHERE nr_number = 'NR-12';`,
      
      `INSERT INTO public.nr_modules (course_id, title, description, order_index)
       SELECT 
         id as course_id,
         'Trabalho em Altura: Conceitos' as title,
         'Fundamentos e definições do trabalho em altura' as description,
         1 as order_index
       FROM public.nr_courses
       WHERE nr_number = 'NR-35';`
    ]
    
    for (const moduleSQL of modulesSQL) {
      await supabase.rpc('exec_sql', { sql: moduleSQL })
      await delay(500)
    }

    console.log(chalk.green('\n✨ Recuperação concluída com sucesso!\n'))
    console.log(chalk.yellow('🔍 Validando resultado...\n'))

    // Verificar tabelas
    const { data: tables_check } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    console.log(chalk.cyan(`📊 Tabelas criadas: ${tables_check?.length || 0}/7`))

    // Verificar policies
    const { data: policies_check } = await supabase.rpc('get_policies')
    console.log(chalk.cyan(`🔒 Políticas RLS: ${policies_check?.length || 0}`))

    // Verificar dados
    const { data: courses_check } = await supabase
      .from('nr_courses')
      .select('count')
      .single()
    
    console.log(chalk.cyan(`📚 Cursos NR: ${courses_check?.count || 0}/3`))

    console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════════\n'))
    
    return {
      success: true,
      tables: tables_check?.length || 0,
      policies: policies_check?.length || 0,
      courses: courses_check?.count || 0
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Erro durante a recuperação:'))
    console.error(chalk.red(error.message))
    throw error
  }
}

// Executar recuperação
recoverDatabase().catch(console.error)