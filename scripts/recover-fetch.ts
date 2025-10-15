import dotenv from 'dotenv'
import chalk from 'chalk'
import { createClient } from '@supabase/supabase-js'
import { PostgrestResponse } from '@supabase/postgrest-js'

dotenv.config()

// Configurar cliente Supabase
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

async function execute(sql: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        sql
      })
    })
    
    if (!response.ok) {
      throw new Error(await response.text())
    }
    
    return true
  } catch (error) {
    console.error(chalk.red(`❌ Erro SQL: ${error.message}`))
    console.error(chalk.gray('SQL:\n' + sql))
    return false
  }
}

async function recover() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🔧 RECUPERAÇÃO COM NOVO CLIENTE                         ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  try {
    // 1. Reset schema
    console.log(chalk.yellow('\n1️⃣ Resetando schema...'))
    await execute('drop schema public cascade; create schema public;')
    console.log(chalk.green('✅ Schema resetado'))

    // 2. Enable extensions
    console.log(chalk.yellow('\n2️⃣ Habilitando extensions...'))
    await execute('create extension if not exists pgcrypto; create extension if not exists "uuid-ossp";')
    console.log(chalk.green('✅ Extensions habilitadas'))

    // 3. Create tables
    console.log(chalk.yellow('\n3️⃣ Criando tabelas...'))
    await execute(`
      create table public.users (
        id uuid references auth.users on delete cascade,
        email text,
        name text,
        avatar_url text,
        created_at timestamptz default now(),
        primary key (id)
      );
      alter table public.users enable row level security;

      create table public.projects (
        id uuid default uuid_generate_v4() primary key,
        name text not null,
        description text,
        user_id uuid references auth.users(id) on delete cascade not null,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );
      alter table public.projects enable row level security;

      create table public.slides (
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

      create table public.render_jobs (
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

      create table public.analytics_events (
        id uuid default uuid_generate_v4() primary key,
        user_id uuid references auth.users(id) on delete cascade not null,
        event_type text not null,
        event_data jsonb default '{}',
        created_at timestamptz default now()
      );
      alter table public.analytics_events enable row level security;

      create table public.nr_courses (
        id uuid default uuid_generate_v4() primary key,
        title text not null,
        description text,
        nr_number text not null,
        created_at timestamptz default now(),
        updated_at timestamptz default now(),
        is_published boolean default false
      );
      alter table public.nr_courses enable row level security;

      create table public.nr_modules (
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
    `)
    console.log(chalk.green('✅ Tabelas criadas'))

    // 4. Create indexes
    console.log(chalk.yellow('\n4️⃣ Criando índices...'))
    await execute(`
      create index if not exists projects_user_id_idx on public.projects(user_id);
      create index if not exists slides_project_id_idx on public.slides(project_id);
      create index if not exists slides_user_id_idx on public.slides(user_id);
      create index if not exists render_jobs_project_id_idx on public.render_jobs(project_id);
      create index if not exists render_jobs_user_id_idx on public.render_jobs(user_id);
      create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
      create index if not exists nr_modules_course_id_idx on public.nr_modules(course_id);
    `)
    console.log(chalk.green('✅ Índices criados'))

    // 5. Create admin helper function
    console.log(chalk.yellow('\n5️⃣ Criando função admin...'))
    await execute(`
      create or replace function auth.is_admin() 
      returns boolean as $$
      begin
        return true;
      end;
      $$ language plpgsql security definer;
    `)
    console.log(chalk.green('✅ Função admin criada'))

    // 6. Create RLS policies
    console.log(chalk.yellow('\n6️⃣ Criando políticas RLS...'))
    await execute(`
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
    `)
    console.log(chalk.green('✅ Políticas RLS criadas'))

    // 7. Create support functions
    console.log(chalk.yellow('\n7️⃣ Criando funções de suporte...'))
    await execute(`
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
        return;
      end;
      $$ language plpgsql security definer;

      create or replace function public.exec_sql(sql text)
      returns void as $$
      begin
        execute sql;
      end;
      $$ language plpgsql security definer;
    `)
    console.log(chalk.green('✅ Funções de suporte criadas'))

    // 8. Insert initial data
    console.log(chalk.yellow('\n8️⃣ Inserindo dados iniciais...'))
    await execute(`
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
    `)
    console.log(chalk.green('✅ Dados iniciais inseridos'))

    // 9. Create analytics_events triggers
    console.log(chalk.yellow('\n9️⃣ Criando triggers...'))
    await execute(`
      create or replace function public.update_updated_at()
      returns trigger as $$
      begin
        new.updated_at = now();
        return new;
      end;
      $$ language plpgsql;

      create trigger set_updated_at
        before update on public.projects
        for each row
        execute procedure public.update_updated_at();

      create trigger set_updated_at
        before update on public.slides
        for each row
        execute procedure public.update_updated_at();

      create trigger set_updated_at
        before update on public.render_jobs
        for each row
        execute procedure public.update_updated_at();

      create trigger set_updated_at
        before update on public.nr_courses
        for each row
        execute procedure public.update_updated_at();

      create trigger set_updated_at
        before update on public.nr_modules
        for each row
        execute procedure public.update_updated_at();
    `)
    console.log(chalk.green('✅ Triggers criados'))

    console.log(chalk.green('\n✨ Recuperação concluída!'))
    console.log(chalk.gray('\nExecute o diagnóstico para verificar o estado.'))

  } catch (error) {
    console.error(chalk.red('\n❌ Erro fatal durante recuperação:'))
    console.error(error)
    throw error
  }
}

recover().catch(console.error)