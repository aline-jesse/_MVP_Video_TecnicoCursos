import dotenv from 'dotenv'
import chalk from 'chalk'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

// Configurar cliente Supabase com role de serviço
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function recover() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🔧 RECUPERAÇÃO DIRETA VIA API                           ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  // 1. Criar tabela users
  console.log(chalk.yellow('\n1️⃣ Criando tabela users...'))
  const { error: usersError } = await supabase.schema('public').createTable('users', {
    id: 'uuid references auth.users on delete cascade primary key',
    email: 'text',
    name: 'text',
    avatar_url: 'text',
    created_at: 'timestamptz default now()'
  })
  if (usersError) {
    console.log(chalk.red(`❌ Erro: ${usersError.message}`))
  } else {
    console.log(chalk.green('✅ Tabela users criada'))
  }

  // 2. Criar tabela projects
  console.log(chalk.yellow('\n2️⃣ Criando tabela projects...'))
  const { error: projectsError } = await supabase.schema('public').createTable('projects', {
    id: 'uuid default uuid_generate_v4() primary key',
    name: 'text not null',
    description: 'text',
    user_id: 'uuid references auth.users(id) on delete cascade not null',
    created_at: 'timestamptz default now()',
    updated_at: 'timestamptz default now()'
  })
  if (projectsError) {
    console.log(chalk.red(`❌ Erro: ${projectsError.message}`))
  } else {
    console.log(chalk.green('✅ Tabela projects criada'))
  }

  // 3. Criar tabela slides
  console.log(chalk.yellow('\n3️⃣ Criando tabela slides...'))
  const { error: slidesError } = await supabase.schema('public').createTable('slides', {
    id: 'uuid default uuid_generate_v4() primary key',
    project_id: 'uuid references projects(id) on delete cascade not null',
    user_id: 'uuid references auth.users(id) on delete cascade not null',
    title: 'text',
    content: 'text',
    order_index: 'integer not null',
    created_at: 'timestamptz default now()',
    updated_at: 'timestamptz default now()'
  })
  if (slidesError) {
    console.log(chalk.red(`❌ Erro: ${slidesError.message}`))
  } else {
    console.log(chalk.green('✅ Tabela slides criada'))
  }

  // 4. Criar tabela render_jobs
  console.log(chalk.yellow('\n4️⃣ Criando tabela render_jobs...'))
  const { error: renderJobsError } = await supabase.schema('public').createTable('render_jobs', {
    id: 'uuid default uuid_generate_v4() primary key',
    project_id: 'uuid references projects(id) on delete cascade not null',
    user_id: 'uuid references auth.users(id) on delete cascade not null',
    status: 'text default \'pending\'',
    progress: 'integer default 0',
    error: 'text',
    output_url: 'text',
    created_at: 'timestamptz default now()',
    updated_at: 'timestamptz default now()',
    started_at: 'timestamptz',
    completed_at: 'timestamptz'
  })
  if (renderJobsError) {
    console.log(chalk.red(`❌ Erro: ${renderJobsError.message}`))
  } else {
    console.log(chalk.green('✅ Tabela render_jobs criada'))
  }

  // 5. Criar tabela analytics_events
  console.log(chalk.yellow('\n5️⃣ Criando tabela analytics_events...'))
  const { error: analyticsError } = await supabase.schema('public').createTable('analytics_events', {
    id: 'uuid default uuid_generate_v4() primary key',
    user_id: 'uuid references auth.users(id) on delete cascade not null',
    event_type: 'text not null',
    event_data: 'jsonb default \'{}\'',
    created_at: 'timestamptz default now()'
  })
  if (analyticsError) {
    console.log(chalk.red(`❌ Erro: ${analyticsError.message}`))
  } else {
    console.log(chalk.green('✅ Tabela analytics_events criada'))
  }

  // 6. Criar tabela nr_courses
  console.log(chalk.yellow('\n6️⃣ Criando tabela nr_courses...'))
  const { error: coursesError } = await supabase.schema('public').createTable('nr_courses', {
    id: 'uuid default uuid_generate_v4() primary key',
    title: 'text not null',
    description: 'text',
    nr_number: 'text not null',
    created_at: 'timestamptz default now()',
    updated_at: 'timestamptz default now()',
    is_published: 'boolean default false'
  })
  if (coursesError) {
    console.log(chalk.red(`❌ Erro: ${coursesError.message}`))
  } else {
    console.log(chalk.green('✅ Tabela nr_courses criada'))
  }

  // 7. Criar tabela nr_modules
  console.log(chalk.yellow('\n7️⃣ Criando tabela nr_modules...'))
  const { error: modulesError } = await supabase.schema('public').createTable('nr_modules', {
    id: 'uuid default uuid_generate_v4() primary key',
    course_id: 'uuid references nr_courses(id) on delete cascade not null',
    title: 'text not null',
    description: 'text',
    order_index: 'integer not null',
    created_at: 'timestamptz default now()',
    updated_at: 'timestamptz default now()',
    is_published: 'boolean default false'
  })
  if (modulesError) {
    console.log(chalk.red(`❌ Erro: ${modulesError.message}`))
  } else {
    console.log(chalk.green('✅ Tabela nr_modules criada'))
  }

  // 8. Habilitar RLS para todas as tabelas
  console.log(chalk.yellow('\n8️⃣ Habilitando RLS...'))
  const tables = ['users', 'projects', 'slides', 'render_jobs', 'analytics_events', 'nr_courses', 'nr_modules']
  for (const table of tables) {
    const { error } = await supabase.rpc('enable_rls', { table_name: table })
    if (error) {
      console.log(chalk.red(`❌ Erro ao habilitar RLS em ${table}: ${error.message}`))
    } else {
      console.log(chalk.green(`✓ RLS habilitado em ${table}`))
    }
  }

  // 9. Criar índices
  console.log(chalk.yellow('\n9️⃣ Criando índices...'))
  const indices = [
    'create index if not exists projects_user_id_idx on public.projects(user_id)',
    'create index if not exists slides_project_id_idx on public.slides(project_id)',
    'create index if not exists slides_user_id_idx on public.slides(user_id)',
    'create index if not exists render_jobs_project_id_idx on public.render_jobs(project_id)',
    'create index if not exists render_jobs_user_id_idx on public.render_jobs(user_id)',
    'create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id)',
    'create index if not exists nr_modules_course_id_idx on public.nr_modules(course_id)'
  ]
  
  for (const sql of indices) {
    const { error } = await supabase.rpc('create_index', { sql })
    if (error) {
      console.log(chalk.red(`❌ Erro ao criar índice: ${error.message}`))
      console.log(chalk.gray(sql))
    } else {
      console.log(chalk.green('✓ Índice criado'))
    }
  }

  // 10. Inserir cursos NR iniciais
  console.log(chalk.yellow('\n🔟 Inserindo dados iniciais...'))
  const { error: insertError } = await supabase
    .from('nr_courses')
    .insert([
      {
        title: 'NR-10',
        description: 'Segurança em Instalações e Serviços em Eletricidade',
        nr_number: '10',
        is_published: true
      },
      {
        title: 'NR-11',
        description: 'Transporte, Movimentação, Armazenagem e Manuseio de Materiais',
        nr_number: '11',
        is_published: true
      },
      {
        title: 'NR-12',
        description: 'Segurança no Trabalho em Máquinas e Equipamentos',
        nr_number: '12',
        is_published: true
      }
    ])
  if (insertError) {
    console.log(chalk.red(`❌ Erro ao inserir cursos: ${insertError.message}`))
  } else {
    console.log(chalk.green('✅ Cursos inseridos'))
  }

  console.log(chalk.green('\n✨ Recuperação concluída!'))
  console.log(chalk.gray('\nExecute o diagnóstico para verificar o estado.'))
}

recover().catch(error => {
  console.error(chalk.red('\n❌ Erro fatal durante recuperação:'))
  console.error(error)
  process.exit(1)
})