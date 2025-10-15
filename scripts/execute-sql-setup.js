const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filename) {
  try {
    console.log(`\n🔄 Executando ${filename}...`);
    
    const sqlContent = fs.readFileSync(filename, 'utf-8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        console.log(`   Executando: ${command.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`   ❌ Erro: ${error.message}`);
        } else {
          console.log(`   ✅ Sucesso`);
        }
      }
    }
    
    console.log(`✅ ${filename} executado com sucesso!`);
    
  } catch (error) {
    console.error(`❌ Erro ao executar ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando setup do banco de dados...\n');
  
  // Executar scripts em ordem
  await executeSQLFile('database-schema.sql');
  await executeSQLFile('database-rls-policies.sql');
  await executeSQLFile('seed-nr-courses.sql');
  
  console.log('\n🎉 Setup completo!');
}

main().catch(console.error);