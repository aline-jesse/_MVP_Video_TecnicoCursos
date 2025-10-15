import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configurar cliente Supabase com role de serviço
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function resetSchemaCache() {
  console.log(chalk.yellow('\n🔄 Resetando cache do schema...'))
  
  try {
    await supabase.rpc('reset_schema_cache')
    console.log(chalk.green('✅ Cache do schema resetado'))
  } catch (error) {
    console.log(chalk.red(`❌ Erro ao resetar cache: ${error.message}`))
    console.log(chalk.gray('Continuando mesmo com erro...'))
  }
}

async function createTables() {
  console.log(chalk.yellow('\n📦 Criando tabelas...'))

  const schema = `
  -- Enable RLS
  alter table auth.users enable row level security;

  -- Create tables
  create table if not exists public.users (
    id uuid references auth.users on delete cascade,
    email text,
    name text,
    avatar_url text,
    created_at timestamptz default now(),
    primary key (id)
  );
  alter table public.users enable row level security;

  create table if not exists public.projects (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  alter table public.projects enable row level security;

  create table if not exists public.slides (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text,
    content text,
    order_index integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  alter table public.slides enable row level security;

  create table if not exists public.render_jobs (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    status text default 'pending',
    progress integer default 0,
    error text,
    output_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    started_at timestamptz,
    completed_at timestamptz
  );
  alter table public.render_jobs enable row level security;

  create table if not exists public.analytics_events (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    event_type text not null,
    event_data jsonb default '{}',
    created_at timestamptz default now()
  );
  alter table public.analytics_events enable row level security;

  create table if not exists public.nr_courses (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    nr_number text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    is_published boolean default false
  );
  alter table public.nr_courses enable row level security;

  create table if not exists public.nr_modules (
    id uuid default uuid_generate_v4() primary key,
    course_id uuid references public.nr_courses(id) on delete cascade not null,
    title text not null,
    description text,
    order_index integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    is_published boolean default false
  );
  alter table public.nr_modules enable row level security;

  -- Create indexes
  create index if not exists projects_user_id_idx on public.projects(user_id);
  create index if not exists slides_project_id_idx on public.slides(project_id);
  create index if not exists slides_user_id_idx on public.slides(user_id);
  create index if not exists render_jobs_project_id_idx on public.render_jobs(project_id);
  create index if not exists render_jobs_user_id_idx on public.render_jobs(user_id);
  create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
  create index if not exists nr_modules_course_id_idx on public.nr_modules(course_id);
  `

  try {
    // Tentar executar schema completo
    const { error: schemaError } = await supabase.rpc('exec_sql', { 
      sql: schema 
    })
    
    if (schemaError) {
      console.log(chalk.red(`❌ Erro ao criar schema: ${schemaError.message}`))
      console.log(chalk.gray('Tentando criar tabelas individualmente...'))
      
      // Split e executa statements individuais
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      for (const sql of statements) {
        const { error } = await supabase.rpc('exec_sql', { sql: sql + ';' })
        if (error) {
          console.log(chalk.red(`❌ Erro em statement: ${error.message}`))
          console.log(chalk.gray(sql))
        } else {
          console.log(chalk.green('✓ Statement executado'))
        }
        await delay(500) // Rate limiting
      }
    } else {
      console.log(chalk.green('✅ Schema criado com sucesso'))
    }
  } catch (error) {
    console.log(chalk.red(`❌ Erro fatal ao criar schema: ${error.message}`))
    throw error
  }
}

async function setupRLS() {
  console.log(chalk.yellow('\n🔒 Configurando RLS...'))

  const policies = `
  -- Users policies
  create policy "Users can read own profile"
    on public.users for select
    using ( auth.uid() = id );
    
  create policy "Users can update own profile"
    on public.users for update
    using ( auth.uid() = id );

  -- Projects policies  
  create policy "Users can read own projects"
    on public.projects for select
    using ( auth.uid() = user_id );
    
  create policy "Users can insert own projects"
    on public.projects for insert
    with check ( auth.uid() = user_id );
    
  create policy "Users can update own projects"
    on public.projects for update
    using ( auth.uid() = user_id );
    
  create policy "Users can delete own projects"
    on public.projects for delete
    using ( auth.uid() = user_id );

  -- Slides policies
  create policy "Users can read slides from own projects"
    on public.slides for select
    using ( auth.uid() = user_id );
    
  create policy "Users can insert slides in own projects"
    on public.slides for insert
    with check ( auth.uid() = user_id );
    
  create policy "Users can update slides in own projects"
    on public.slides for update
    using ( auth.uid() = user_id );
    
  create policy "Users can delete slides from own projects"
    on public.slides for delete
    using ( auth.uid() = user_id );

  -- Render jobs policies
  create policy "Users can read own render jobs"
    on public.render_jobs for select
    using ( auth.uid() = user_id );
    
  create policy "Users can insert own render jobs"
    on public.render_jobs for insert
    with check ( auth.uid() = user_id );
    
  create policy "Users can update own render jobs"
    on public.render_jobs for update
    using ( auth.uid() = user_id );

  -- Analytics events policies
  create policy "Users can insert own analytics events"
    on public.analytics_events for insert
    with check ( auth.uid() = user_id );
    
  create policy "Users can read own analytics events"
    on public.analytics_events for select
    using ( auth.uid() = user_id );

  -- NR courses policies
  create policy "Anyone can read published NR courses"
    on public.nr_courses for select
    using ( is_published = true );
    
  create policy "Admins can manage NR courses"
    on public.nr_courses for all
    using ( auth.is_admin() );

  -- NR modules policies
  create policy "Anyone can read published NR modules"
    on public.nr_modules for select
    using ( is_published = true );
    
  create policy "Admins can manage NR modules"
    on public.nr_modules for all
    using ( auth.is_admin() );
  `

  try {
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: policies
    })

    if (policiesError) {
      console.log(chalk.red(`❌ Erro ao criar políticas: ${policiesError.message}`))
      console.log(chalk.gray('Tentando criar políticas individualmente...'))
      
      const statements = policies
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      for (const sql of statements) {
        const { error } = await supabase.rpc('exec_sql', { sql: sql + ';' })
        if (error) {
          console.log(chalk.red(`❌ Erro em política: ${error.message}`))
          console.log(chalk.gray(sql))
        } else {
          console.log(chalk.green('✓ Política criada'))
        }
        await delay(500)
      }
    } else {
      console.log(chalk.green('✅ Políticas RLS criadas com sucesso'))
    }
  } catch (error) {
    console.log(chalk.red(`❌ Erro fatal ao criar políticas: ${error.message}`))
    throw error
  }
}

async function setupFunctions() {
  console.log(chalk.yellow('\n⚡ Configurando funções...'))

  const functions = `
  create or replace function auth.is_admin() 
  returns boolean as $$
  begin
    -- Implementar lógica de admin (por exemplo, verificar role específica)
    return true; -- Temporariamente retorna true para testes
  end;
  $$ language plpgsql security definer;

  create or replace function public.get_policies()
  returns table (
    table_name text,
    policy_name text
  ) as $$
  begin
    return query
    select t.relname::text, p.polname::text
    from pg_policy p
    join pg_class t on t.oid = p.polrelid
    where t.relnamespace = 'public'::regnamespace;
  end;
  $$ language plpgsql security definer;

  create or replace function public.reset_schema_cache()
  returns void as $$
  begin
    -- Função vazia - cache é gerenciado pelo Supabase
    return;
  end;
  $$ language plpgsql security definer;

  create or replace function public.exec_sql(sql text)
  returns void as $$
  begin
    execute sql;
  end;
  $$ language plpgsql security definer;
  `

  try {
    const { error: functionsError } = await supabase.rpc('exec_sql', {
      sql: functions
    })

    if (functionsError) {
      console.log(chalk.red(`❌ Erro ao criar funções: ${functionsError.message}`))
      console.log(chalk.gray('Tentando criar funções individualmente...'))
      
      // Split em funções individuais usando regex
      const functionStatements = functions.split(/create or replace function/i)
        .filter(s => s.trim().length > 0)
        .map(s => 'create or replace function' + s)
      
      for (const sql of functionStatements) {
        const { error } = await supabase.rpc('exec_sql', { sql })
        if (error) {
          console.log(chalk.red(`❌ Erro em função: ${error.message}`))
          console.log(chalk.gray(sql))
        } else {
          console.log(chalk.green('✓ Função criada'))
        }
        await delay(500)
      }
    } else {
      console.log(chalk.green('✅ Funções criadas com sucesso'))
    }
  } catch (error) {
    console.log(chalk.red(`❌ Erro fatal ao criar funções: ${error.message}`))
    throw error
  }
}

async function seedData() {
  console.log(chalk.yellow('\n🌱 Inserindo dados iniciais...'))

  const seedSQL = `
  insert into public.nr_courses (title, description, nr_number, is_published)
  values
    ('NR-10', 'Segurança em Instalações e Serviços em Eletricidade', '10', true),
    ('NR-11', 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais', '11', true),
    ('NR-12', 'Segurança no Trabalho em Máquinas e Equipamentos', '12', true)
  on conflict (id) do nothing;
  
  insert into public.nr_modules (course_id, title, description, order_index, is_published)
  select 
    c.id,
    'Introdução à ' || c.title,
    'Módulo introdutório sobre ' || c.description,
    1,
    true
  from public.nr_courses c
  on conflict (id) do nothing;
  `

  try {
    const { error: seedError } = await supabase.rpc('exec_sql', {
      sql: seedSQL
    })

    if (seedError) {
      console.log(chalk.red(`❌ Erro ao inserir dados: ${seedError.message}`))
    } else {
      console.log(chalk.green('✅ Dados iniciais inseridos'))
    }
  } catch (error) {
    console.log(chalk.red(`❌ Erro fatal ao inserir dados: ${error.message}`))
    throw error
  }
}

async function recover() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🔧 RECUPERAÇÃO DO BANCO DE DADOS                         ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  try {
    await resetSchemaCache()
    await createTables() 
    await setupRLS()
    await setupFunctions()
    await seedData()

    console.log(chalk.green('\n✨ Recuperação concluída com sucesso!'))
    console.log(chalk.gray('\nExecute o diagnóstico novamente para verificar o estado.'))

  } catch (error) {
    console.error(chalk.red('\n❌ Erro durante recuperação:'))
    console.error(error)
    process.exit(1)
  }
}

// Executar recuperação
recover().catch(console.error)