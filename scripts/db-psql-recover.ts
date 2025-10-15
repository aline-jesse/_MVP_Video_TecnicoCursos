import dotenv from 'dotenv'
import chalk from 'chalk'
import { spawn } from 'child_process'

dotenv.config()

// Configuração do banco
const {
  SUPABASE_DB_HOST: host = 'localhost',
  SUPABASE_DB_PORT: port = '5432',
  SUPABASE_DB_NAME: database = 'postgres', 
  SUPABASE_DB_USER: user = 'postgres',
  SUPABASE_DB_PASSWORD: password = ''
} = process.env

// Comandos SQL para recuperação
const sqlCommands = [
  // Criar extension pgcrypto se não existir
  'create extension if not exists pgcrypto;',
  
  // Criar schema public se não existir
  'create schema if not exists public;',
  
  // Criar função exec_sql
  `create or replace function public.exec_sql(sql text)
  returns void as $$
  begin
    execute sql;
  end;
  $$ language plpgsql security definer;`,

  // Criar tabelas
  `create table if not exists public.users (
    id uuid references auth.users on delete cascade,
    email text,
    name text,
    avatar_url text,
    created_at timestamptz default now(),
    primary key (id)
  );`,
  
  'alter table public.users enable row level security;',

  // Demais tabelas e configurações...
]

// Executa psql com o SQL
const psql = spawn('psql', [
  '-h', host,
  '-p', port,
  '-U', user,
  '-d', database,
  '-c', sqlCommands.join('\n')
], {
  env: { ...process.env, PGPASSWORD: password }
})

// Log de saída
psql.stdout.on('data', (data) => {
  console.log(chalk.green(data.toString()))
})

psql.stderr.on('data', (data) => {
  console.error(chalk.red(data.toString()))
})

psql.on('close', (code) => {
  if (code === 0) {
    console.log(chalk.green('\n✨ Recuperação via psql concluída!'))
  } else {
    console.error(chalk.red(`\n❌ Erro na recuperação (código ${code})`))
  }
})