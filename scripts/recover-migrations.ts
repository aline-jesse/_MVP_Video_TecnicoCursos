import dotenv from 'dotenv'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Kysely } from 'kysely'
import { PostgresDialect } from 'kysely/postgres'
import pg from 'pg'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configuração do banco
const {
  SUPABASE_DB_HOST: host = 'localhost',
  SUPABASE_DB_PORT: port = '5432',
  SUPABASE_DB_NAME: database = 'postgres', 
  SUPABASE_DB_USER: user = 'postgres',
  SUPABASE_DB_PASSWORD: password = ''
} = process.env

// Cliente SQL
const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      host,
      port: parseInt(port),
      database,
      user,
      password
    })
  })
})

async function recover() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🔧 RECUPERAÇÃO VIA MIGRATIONS                           ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  try {
    // 1. Criar tabela de migrations
    await db.schema
      .createTable('migrations')
      .addColumn('id', 'serial', col => col.primaryKey())
      .addColumn('name', 'varchar(255)', col => col.notNull())
      .addColumn('executed_at', 'timestamptz', col => col.defaultTo('now()'))
      .execute()
    
    console.log(chalk.green('✅ Tabela de migrations criada'))

    // 2. Criar funções utilitárias
    await db.schema
      .createIndex('migrations_name_idx')
      .on('migrations')
      .column('name')
      .execute()

    await db.raw(`
      create or replace function auth.is_admin() 
      returns boolean as $$
      begin
        return true;
      end;
      $$ language plpgsql security definer;
    `).execute()

    console.log(chalk.green('✅ Funções criadas'))

    // 3. Aplicar migrations em ordem
    const migrations = [
      {
        name: '001_create_users',
        up: `
          create table if not exists public.users (
            id uuid references auth.users on delete cascade,
            email text,
            name text,
            avatar_url text,
            created_at timestamptz default now(),
            primary key (id)
          );
          alter table public.users enable row level security;
        `
      },
      {
        name: '002_create_projects',
        up: `
          create table if not exists public.projects (
            id uuid default uuid_generate_v4() primary key,
            name text not null,
            description text,
            user_id uuid references auth.users(id) on delete cascade not null,
            created_at timestamptz default now(),
            updated_at timestamptz default now()
          );
          alter table public.projects enable row level security;
          create index projects_user_id_idx on public.projects(user_id);
        `
      },
      {
        name: '003_create_slides',
        up: `
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
          create index slides_project_id_idx on public.slides(project_id);
          create index slides_user_id_idx on public.slides(user_id);
        `
      },
      {
        name: '004_create_render_jobs',
        up: `
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
          create index render_jobs_project_id_idx on public.render_jobs(project_id);
          create index render_jobs_user_id_idx on public.render_jobs(user_id);
        `
      },
      {
        name: '005_create_analytics',
        up: `
          create table if not exists public.analytics_events (
            id uuid default uuid_generate_v4() primary key,
            user_id uuid references auth.users(id) on delete cascade not null,
            event_type text not null,
            event_data jsonb default '{}',
            created_at timestamptz default now()
          );
          alter table public.analytics_events enable row level security;
          create index analytics_events_user_id_idx on public.analytics_events(user_id);
        `
      },
      {
        name: '006_create_nr_courses',
        up: `
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
        `
      },
      {
        name: '007_create_nr_modules',
        up: `
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
          create index nr_modules_course_id_idx on public.nr_modules(course_id);
        `
      },
      {
        name: '008_create_rls_policies',
        up: `
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
      },
      {
        name: '009_seed_data',
        up: `
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
      }
    ]

    // Aplicar cada migration
    for (const migration of migrations) {
      const exists = await db
        .selectFrom('migrations')
        .select('id')
        .where('name', '=', migration.name)
        .execute()

      if (exists.length === 0) {
        console.log(chalk.yellow(`\n🔄 Aplicando migration ${migration.name}...`))
        
        try {
          await db.transaction().execute(async trx => {
            await trx.raw(migration.up).execute()
            await trx
              .insertInto('migrations')
              .values({ name: migration.name })
              .execute()
          })
          console.log(chalk.green('✅ Migration aplicada com sucesso'))
        } catch (error) {
          console.log(chalk.red(`❌ Erro: ${error.message}`))
          throw error
        }
      } else {
        console.log(chalk.gray(`⏭️  Migration ${migration.name} já aplicada`))
      }
    }

    console.log(chalk.green('\n✨ Recuperação concluída!'))
    console.log(chalk.gray('\nExecute o diagnóstico para verificar o estado.'))

  } catch (error) {
    console.error(chalk.red('\n❌ Erro fatal durante recuperação:'))
    console.error(error)
    throw error
  } finally {
    await db.destroy()
  }
}

recover().catch(console.error)