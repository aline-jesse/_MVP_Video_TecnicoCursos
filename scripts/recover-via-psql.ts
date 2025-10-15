// Importar pacotes
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { spawn } from 'child_process'
import dotenv from 'dotenv'
import chalk from 'chalk'

// Configurar ambiente
dotenv.config()
const __dirname = dirname(fileURLToPath(import.meta.url))

// Extrair credenciais do DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL)
const config = {
  host: dbUrl.hostname,
  port: dbUrl.port,
  database: dbUrl.pathname.slice(1),
  user: dbUrl.username,
  password: dbUrl.password
}

// Função para executar SQL via psql
async function executeSql() {
  console.log(chalk.cyan('\n╔════════════════════════════════════════════════════════════════════╗'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('║           🔄 RECUPERAÇÃO DO BANCO VIA PSQL                        ║'))
  console.log(chalk.cyan('║                                                                    ║'))
  console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════════╝\n'))

  return new Promise((resolve, reject) => {
    const sqlFile = join(__dirname, 'recover.sql')
    
    const psql = spawn('psql', [
      '-h', config.host,
      '-p', config.port,
      '-d', config.database,
      '-U', config.user,
      '-f', sqlFile
    ], {
      env: { ...process.env, PGPASSWORD: config.password }
    })

    let output = ''
    let errorOutput = ''

    psql.stdout.on('data', (data) => {
      const text = data.toString()
      output += text
      console.log(chalk.gray(text))
    })

    psql.stderr.on('data', (data) => {
      const text = data.toString()
      errorOutput += text
      console.error(chalk.red(text))
    })

    psql.on('close', (code) => {
      console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════════\n'))
      
      if (code === 0) {
        console.log(chalk.green('✨ Recuperação concluída com sucesso!'))
        console.log(chalk.gray('\nVerificando resultado...\n'))
        
        // Analisar saída
        const hasErrors = errorOutput.toLowerCase().includes('error')
        const hasFatalErrors = errorOutput.toLowerCase().includes('fatal')
        
        if (hasErrors || hasFatalErrors) {
          console.log(chalk.yellow('⚠️  Avisos encontrados no log:'))
          console.log(chalk.gray(errorOutput))
          console.log(chalk.yellow('\nVerifique se os avisos são esperados.'))
        } else {
          console.log(chalk.green('✅ Nenhum erro encontrado!'))
        }
        
        resolve({ success: true, output, errorOutput })
      } else {
        console.log(chalk.red(`❌ Erro na recuperação (código ${code})`))
        console.log(chalk.red('\nDetalhes do erro:'))
        console.log(chalk.gray(errorOutput))
        reject(new Error(`Falha na execução do SQL (código ${code})`))
      }
    })
  })
}

// Executar recuperação
executeSql().catch(console.error)