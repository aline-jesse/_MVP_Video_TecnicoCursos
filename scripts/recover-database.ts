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

async function executeSQL(sql: string) {
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  let results = []
  
  for (const statement of statements) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        results.push({ status: 'error', sql: statement, error: error.message })
      } else {
        results.push({ status: 'success', sql: statement })
      }
      
      await delay(500) // Evitar rate limit
      
    } catch (err) {
      results.push({ status: 'error', sql: statement, error: err.message })
    }
  }
  
  return results
}

async function recoverDatabase() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🚀 RECUPERAÇÃO DO BANCO DE DADOS                        ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  // Ler SQL
  const sqlPath = path.join(__dirname, 'recover-database.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  // Executar fases
  const phases = sql.split('-- FASE')
  let currentPhase = 1

  for (const phase of phases) {
    if (!phase.trim()) continue
    
    const phaseTitle = phase.split('\n')[0].trim()
    console.log(chalk.yellow(`\n📦 FASE ${currentPhase}: ${phaseTitle}\n`))
    
    const statements = phase
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
    
    for (const statement of statements) {
      try {
        const start = Date.now()
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
        const duration = Date.now() - start
        
        if (error) {
          console.log(chalk.red(`❌ Erro: ${error.message}`))
          console.log(chalk.gray(`   SQL: ${statement.substring(0, 100)}...`))
        } else {
          console.log(chalk.green(`✅ Executado em ${duration}ms`))
          console.log(chalk.gray(`   ${statement.substring(0, 100)}...`))
        }
        
        await delay(500)
        
      } catch (err) {
        console.log(chalk.red(`❌ Erro: ${err.message}`))
        console.log(chalk.gray(`   SQL: ${statement.substring(0, 100)}...`))
      }
    }
    
    currentPhase++
  }

  // Validação final
  console.log(chalk.yellow('\n📊 VALIDAÇÃO FINAL\n'))
  
  try {
    // 1. Verificar tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) throw tablesError
    
    const tableCount = tables?.length || 0
    console.log(chalk.cyan(`📋 Tabelas criadas: ${tableCount}/7`))
    
    // 2. Verificar políticas
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies')
    
    if (policiesError) throw policiesError
    
    const policyCount = policies?.length || 0
    console.log(chalk.cyan(`🔒 Políticas RLS: ${policyCount}`))
    
    // 3. Verificar dados
    const { data: courses, error: coursesError } = await supabase
      .from('nr_courses')
      .select('count')
      .single()
    
    if (coursesError) throw coursesError
    
    console.log(chalk.cyan(`📚 Cursos NR: ${courses?.count || 0}/3`))
    
    // Score final
    const score = Math.floor(
      ((tableCount / 7) * 0.4 + 
       (policyCount / 15) * 0.3 + 
       ((courses?.count || 0) / 3) * 0.3) * 100
    )
    
    console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════════'))
    console.log(chalk.green(`\n✨ RECUPERAÇÃO CONCLUÍDA!`))
    console.log(chalk.green(`📊 Score Final: ${score}/100`))
    
    if (score >= 90) {
      console.log(chalk.green('\n🎉 Sistema completamente recuperado!'))
    } else if (score >= 75) {
      console.log(chalk.yellow('\n⚠️ Sistema parcialmente recuperado - verificar pendências'))
    } else {
      console.log(chalk.red('\n❌ Recuperação incompleta - necessária intervenção manual'))
    }
    
  } catch (err) {
    console.log(chalk.red(`\n❌ Erro na validação: ${err.message}`))
  }
}

// Executar recuperação
recoverDatabase().catch(console.error)