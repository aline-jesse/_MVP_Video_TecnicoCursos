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

async function runDiagnostics() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🔍 DIAGNÓSTICO DO BANCO DE DADOS                        ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  try {
    // 1. Verificar conexão básica
    console.log(chalk.yellow('1️⃣  Testando conexão básica...'))
    const { data: version, error: versionError } = await supabase
      .from('_dynamic_version')
      .select('*')
      .single()
    
    if (versionError) {
      console.log(chalk.red(`❌ Erro: ${versionError.message}`))
    } else {
      console.log(chalk.green('✅ Conexão OK'))
    }
    console.log()

    // 2. Verificar tabelas existentes
    console.log(chalk.yellow('2️⃣  Listando tabelas existentes...'))
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_schema,table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log(chalk.red(`❌ Erro: ${tablesError.message}`))
    } else {
      console.log(chalk.green(`✅ ${tables.length} tabelas encontradas:`))
      tables.forEach(table => {
        console.log(chalk.gray(`   • ${table.table_name}`))
      })
    }
    console.log()

    // 3. Verificar funções
    console.log(chalk.yellow('3️⃣  Verificando funções...'))
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_schema,routine_name')
      .eq('routine_schema', 'public')
    
    if (functionsError) {
      console.log(chalk.red(`❌ Erro: ${functionsError.message}`))
    } else {
      console.log(chalk.green(`✅ ${functions.length} funções encontradas:`))
      functions.forEach(func => {
        console.log(chalk.gray(`   • ${func.routine_name}`))
      })
    }
    console.log()

    // 4. Testar execução de SQL
    console.log(chalk.yellow('4️⃣  Testando execução de SQL...'))
    const testSQL = 'SELECT NOW();'
    const { data: sqlTest, error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: testSQL 
    })
    
    if (sqlError) {
      console.log(chalk.red(`❌ Erro: ${sqlError.message}`))
      console.log(chalk.gray(`   SQL: ${testSQL}`))
    } else {
      console.log(chalk.green('✅ Execução SQL OK'))
    }
    console.log()

    // 5. Verificar RLS
    console.log(chalk.yellow('5️⃣  Verificando RLS...'))
    const { data: rls, error: rlsError } = await supabase.rpc('get_policies')
    
    if (rlsError) {
      console.log(chalk.red(`❌ Erro: ${rlsError.message}`))
    } else {
      console.log(chalk.green(`✅ ${rls.length} políticas encontradas:`))
      rls.forEach(policy => {
        console.log(chalk.gray(`   • ${policy.table_name}: ${policy.policy_name}`))
      })
    }
    console.log()

    // 6. Verificar Storage
    console.log(chalk.yellow('6️⃣  Verificando Storage...'))
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log(chalk.red(`❌ Erro: ${bucketsError.message}`))
    } else {
      console.log(chalk.green(`✅ ${buckets.length} buckets encontrados:`))
      buckets.forEach(bucket => {
        console.log(chalk.gray(`   • ${bucket.name}`))
      })
    }
    console.log()

    // 7. Verificar permissões
    console.log(chalk.yellow('7️⃣  Verificando permissões...'))
    const { data: grants, error: grantsError } = await supabase
      .from('information_schema.role_table_grants')
      .select('*')
      .eq('table_schema', 'public')
    
    if (grantsError) {
      console.log(chalk.red(`❌ Erro: ${grantsError.message}`))
    } else {
      console.log(chalk.green(`✅ ${grants.length} permissões encontradas`))
      grants.forEach(grant => {
        console.log(chalk.gray(`   • ${grant.grantee}: ${grant.privilege_type} on ${grant.table_name}`))
      })
    }

    // Resumo
    console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════════'))
    console.log(chalk.yellow('\n📊 RESUMO DO DIAGNÓSTICO:\n'))
    
    const summary = {
      connection: !versionError,
      tables: tables?.length || 0,
      functions: functions?.length || 0,
      sql_exec: !sqlError,
      rls_policies: rls?.length || 0,
      storage_buckets: buckets?.length || 0,
      permissions: grants?.length || 0
    }
    
    const score = Object.values(summary).filter(Boolean).length / 7 * 100
    
    console.log(chalk.cyan('🔹 Conexão: ') + (summary.connection ? chalk.green('✓') : chalk.red('✗')))
    console.log(chalk.cyan('🔹 Tabelas: ') + chalk.white(summary.tables))
    console.log(chalk.cyan('🔹 Funções: ') + chalk.white(summary.functions))
    console.log(chalk.cyan('🔹 Exec SQL: ') + (summary.sql_exec ? chalk.green('✓') : chalk.red('✗')))
    console.log(chalk.cyan('🔹 Políticas RLS: ') + chalk.white(summary.rls_policies))
    console.log(chalk.cyan('🔹 Buckets: ') + chalk.white(summary.storage_buckets))
    console.log(chalk.cyan('🔹 Permissões: ') + chalk.white(summary.permissions))
    
    console.log(chalk.yellow('\nScore de Saúde: ') + chalk.green(`${Math.round(score)}%`))
    
    if (score < 50) {
      console.log(chalk.red('\n⚠️  Sistema necessita recuperação completa'))
    } else if (score < 80) {
      console.log(chalk.yellow('\n⚠️  Sistema precisa de atenção'))
    } else {
      console.log(chalk.green('\n✨ Sistema saudável'))
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Erro durante diagnóstico:'))
    console.error(chalk.red(error.message))
    throw error
  }
}

// Executar diagnóstico
runDiagnostics().catch(console.error)