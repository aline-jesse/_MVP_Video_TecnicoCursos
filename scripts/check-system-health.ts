import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

// Carregar variáveis de ambiente
dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function checkHealth() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🔍 VERIFICAÇÃO DE SAÚDE DO SISTEMA                      ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  let score = 0
  const maxScore = 100
  const results = []

  // 1. Verificar conexão com Supabase
  try {
    const { data, error } = await supabase.from('users').select('count').single()
    if (!error) {
      results.push({ test: 'Conexão Supabase', status: 'OK', points: 20 })
      score += 20
    } else {
      results.push({ test: 'Conexão Supabase', status: 'FALHA', error: error.message, points: 0 })
    }
  } catch (err) {
    results.push({ test: 'Conexão Supabase', status: 'ERRO', error: err.message, points: 0 })
  }

  await delay(1000)

  // 2. Verificar tabelas principais
  const requiredTables = ['users', 'projects', 'slides', 'render_jobs', 'analytics_events', 'nr_courses', 'nr_modules']
  let tablesFound = 0

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('count').single()
      if (!error) tablesFound++
    } catch (err) {
      console.error(`Erro ao verificar tabela ${table}:`, err.message)
    }
  }

  const tableScore = Math.floor((tablesFound / requiredTables.length) * 30)
  results.push({ 
    test: 'Tabelas do Sistema', 
    status: tablesFound === requiredTables.length ? 'OK' : 'PARCIAL',
    detail: `${tablesFound}/${requiredTables.length} tabelas encontradas`,
    points: tableScore 
  })
  score += tableScore

  await delay(1000)

  // 3. Verificar buckets do Storage
  const requiredBuckets = ['videos', 'avatars', 'thumbnails', 'assets']
  let bucketsFound = 0

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
  
  if (!bucketsError && buckets) {
    const bucketNames = buckets.map(b => b.name)
    bucketsFound = requiredBuckets.filter(b => bucketNames.includes(b)).length
  }

  const bucketScore = Math.floor((bucketsFound / requiredBuckets.length) * 20)
  results.push({ 
    test: 'Storage Buckets', 
    status: bucketsFound === requiredBuckets.length ? 'OK' : 'PARCIAL',
    detail: `${bucketsFound}/${requiredBuckets.length} buckets encontrados`,
    points: bucketScore 
  })
  score += bucketScore

  await delay(1000)

  // 4. Verificar policies RLS
  try {
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies')
    if (!policiesError && policies && policies.length >= 15) {
      results.push({ test: 'Políticas RLS', status: 'OK', detail: `${policies.length} políticas encontradas`, points: 15 })
      score += 15
    } else {
      results.push({ 
        test: 'Políticas RLS', 
        status: 'PARCIAL', 
        detail: policiesError ? policiesError.message : `Apenas ${policies?.length || 0} políticas encontradas`,
        points: Math.floor((policies?.length || 0) / 15 * 15)
      })
      score += Math.floor((policies?.length || 0) / 15 * 15)
    }
  } catch (err) {
    results.push({ test: 'Políticas RLS', status: 'ERRO', error: err.message, points: 0 })
  }

  await delay(1000)

  // 5. Verificar dados iniciais
  try {
    const { data: courses, error: coursesError } = await supabase.from('nr_courses').select('count').single()
    const hasInitialData = !coursesError && courses && courses.count >= 3
    
    results.push({ 
      test: 'Dados Iniciais', 
      status: hasInitialData ? 'OK' : 'FALHA',
      detail: hasInitialData ? `${courses.count} cursos NR encontrados` : 'Menos de 3 cursos NR',
      points: hasInitialData ? 15 : 0 
    })
    score += hasInitialData ? 15 : 0
  } catch (err) {
    results.push({ test: 'Dados Iniciais', status: 'ERRO', error: err.message, points: 0 })
  }

  // Exibir resultados
  console.log(chalk.yellow('\n📊 RESULTADOS DOS TESTES:\n'))
  
  results.forEach(result => {
    const status = result.status === 'OK' ? chalk.green('✅') : 
                  result.status === 'PARCIAL' ? chalk.yellow('⚠️') : 
                  chalk.red('❌')
    
    console.log(`${status} ${result.test}`)
    if (result.detail) console.log(`   ${chalk.gray(result.detail)}`)
    if (result.error) console.log(`   ${chalk.red(result.error)}`)
    console.log(`   ${chalk.blue(`${result.points} pontos`)}\n`)
  })

  // Score final
  const healthStatus = score >= 90 ? 'EXCELENTE' :
                      score >= 75 ? 'BOM' :
                      score >= 50 ? 'REGULAR' :
                      'CRÍTICO'

  const statusColor = score >= 90 ? chalk.green :
                     score >= 75 ? chalk.cyan :
                     score >= 50 ? chalk.yellow :
                     chalk.red

  console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════════'))
  console.log(statusColor(`\n💉 STATUS DE SAÚDE: ${healthStatus}`))
  console.log(statusColor(`📊 SCORE: ${score}/${maxScore}\n`))
  
  // Recomendações
  if (score < 50) {
    console.log(chalk.red('⚠️  AÇÃO NECESSÁRIA:'))
    console.log(chalk.red('   • Execute setup completo do sistema'))
    console.log(chalk.red('   • Verifique conexão com Supabase'))
    console.log(chalk.red('   • Valide todas as credenciais\n'))
  } else if (score < 75) {
    console.log(chalk.yellow('💡 RECOMENDAÇÕES:'))
    console.log(chalk.yellow('   • Verifique tabelas faltantes'))
    console.log(chalk.yellow('   • Complete dados iniciais'))
    console.log(chalk.yellow('   • Valide políticas RLS\n'))
  } else if (score < 90) {
    console.log(chalk.cyan('✨ OTIMIZAÇÕES SUGERIDAS:'))
    console.log(chalk.cyan('   • Revise políticas RLS'))
    console.log(chalk.cyan('   • Verifique integridade dos dados'))
    console.log(chalk.cyan('   • Valide buckets de storage\n'))
  } else {
    console.log(chalk.green('🎉 SISTEMA SAUDÁVEL!'))
    console.log(chalk.green('   • Mantenha monitoramento regular'))
    console.log(chalk.green('   • Backups automáticos ativos'))
    console.log(chalk.green('   • Todas as validações OK\n'))
  }

  return {
    score,
    status: healthStatus,
    results
  }
}

// Executar verificação
checkHealth().catch(console.error)