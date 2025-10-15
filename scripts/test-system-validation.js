#!/usr/bin/env node

/**
 * 🧪 VALIDAÇÃO COMPLETA DO SISTEMA DE PRODUÇÃO DE VÍDEOS
 * 
 * Este script executa uma validação completa do sistema para verificar:
 * - Conexão com Supabase
 * - Estrutura do banco de dados
 * - Configuração de Storage
 * - Funcionalidades principais
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Configurações
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.cyan}\n🚀 ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}📋 ${msg}${colors.reset}`)
};

// Resultados dos testes
const testResults = {
  supabaseConnection: false,
  databaseTables: false,
  storageBuckets: false,
  nrCoursesData: false,
  environmentVariables: false,
  fileStructure: false
};

/**
 * Teste 1: Verificar variáveis de ambiente
 */
async function testEnvironmentVariables() {
  log.header('TESTE 1: Variáveis de Ambiente');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'AZURE_SPEECH_KEY',
    'AZURE_SPEECH_REGION',
    'ELEVENLABS_API_KEY'
  ];
  
  let foundVars = 0;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log.success(`${varName}: Configurada`);
      foundVars++;
    } else {
      log.error(`${varName}: Não encontrada`);
    }
  });
  
  testResults.environmentVariables = foundVars === requiredVars.length;
  log.info(`Variáveis de ambiente: ${foundVars}/${requiredVars.length} configuradas`);
  
  return testResults.environmentVariables;
}

/**
 * Teste 2: Conexão com Supabase
 */
async function testSupabaseConnection() {
  log.header('TESTE 2: Conexão com Supabase');
  
  if (!supabaseUrl || !supabaseKey) {
    log.error('Credenciais do Supabase não configuradas');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('render_jobs')
      .select('count')
      .limit(1);
    
    if (error && !error.message.includes('relation')) {
      log.error(`Erro de conexão: ${error.message}`);
      return false;
    }
    
    log.success('Conexão com Supabase estabelecida');
    testResults.supabaseConnection = true;
    return true;
    
  } catch (error) {
    log.error(`Erro ao conectar com Supabase: ${error.message}`);
    return false;
  }
}

/**
 * Teste 3: Estrutura do banco de dados
 */
async function testDatabaseTables() {
  log.header('TESTE 3: Estrutura do Banco de Dados');
  
  if (!testResults.supabaseConnection) {
    log.error('Conexão com Supabase necessária');
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const expectedTables = [
    'users',
    'projects', 
    'slides',
    'render_jobs',
    'analytics_events',
    'nr_courses',
    'nr_modules'
  ];
  
  let foundTables = 0;
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        log.error(`Tabela "${table}" não encontrada`);
      } else {
        log.success(`Tabela "${table}" OK`);
        foundTables++;
      }
    } catch (error) {
      log.error(`Erro ao verificar tabela "${table}": ${error.message}`);
    }
  }
  
  testResults.databaseTables = foundTables === expectedTables.length;
  log.info(`Tabelas do banco: ${foundTables}/${expectedTables.length} encontradas`);
  
  return testResults.databaseTables;
}

/**
 * Teste 4: Storage Buckets
 */
async function testStorageBuckets() {
  log.header('TESTE 4: Storage Buckets');
  
  if (!testResults.supabaseConnection) {
    log.error('Conexão com Supabase necessária');
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const expectedBuckets = ['videos', 'avatars', 'thumbnails', 'assets'];
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      log.error(`Erro ao listar buckets: ${error.message}`);
      return false;
    }
    
    let foundBuckets = 0;
    
    expectedBuckets.forEach(bucketName => {
      const bucket = buckets.find(b => b.name === bucketName);
      if (bucket) {
        log.success(`Bucket "${bucketName}" encontrado`);
        foundBuckets++;
      } else {
        log.error(`Bucket "${bucketName}" não encontrado`);
      }
    });
    
    testResults.storageBuckets = foundBuckets === expectedBuckets.length;
    log.info(`Storage buckets: ${foundBuckets}/${expectedBuckets.length} configurados`);
    
    return testResults.storageBuckets;
    
  } catch (error) {
    log.error(`Erro ao verificar storage: ${error.message}`);
    return false;
  }
}

/**
 * Teste 5: Dados dos cursos NR
 */
async function testNRCoursesData() {
  log.header('TESTE 5: Dados dos Cursos NR');
  
  if (!testResults.databaseTables) {
    log.error('Tabelas do banco necessárias');
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: courses, error } = await supabase
      .from('nr_courses')
      .select('course_code, title');
    
    if (error) {
      log.error(`Erro ao buscar cursos: ${error.message}`);
      return false;
    }
    
    if (!courses || courses.length === 0) {
      log.error('Nenhum curso NR encontrado');
      return false;
    }
    
    log.success(`${courses.length} cursos NR encontrados:`);
    courses.forEach(course => {
      log.info(`  • ${course.course_code}: ${course.title}`);
    });
    
    testResults.nrCoursesData = true;
    return true;
    
  } catch (error) {
    log.error(`Erro ao verificar cursos NR: ${error.message}`);
    return false;
  }
}

/**
 * Teste 6: Estrutura de arquivos
 */
async function testFileStructure() {
  log.header('TESTE 6: Estrutura de Arquivos');
  
  const criticalFiles = [
    'package.json',
    'next.config.js',
    '.env',
    'app/layout.tsx',
    'app/page.tsx',
    'database-schema.sql',
    'database-rls-policies.sql',
    'seed-nr-courses.sql'
  ];
  
  let foundFiles = 0;
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log.success(`Arquivo "${file}" encontrado`);
      foundFiles++;
    } else {
      log.error(`Arquivo "${file}" não encontrado`);
    }
  });
  
  testResults.fileStructure = foundFiles === criticalFiles.length;
  log.info(`Arquivos críticos: ${foundFiles}/${criticalFiles.length} encontrados`);
  
  return testResults.fileStructure;
}

/**
 * Gerar relatório final
 */
function generateFinalReport() {
  log.header('RELATÓRIO FINAL DO SISTEMA');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(result => result).length;
  const systemHealth = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\n📊 Status do Sistema: ${systemHealth}% funcional`);
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}\n`);
  
  // Detalhes dos testes
  Object.entries(testResults).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} - ${testName}`);
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (systemHealth === 100) {
    log.success('🎉 SISTEMA 100% FUNCIONAL!');
    console.log('\nPróximos passos:');
    console.log('1. Iniciar servidor: npm run dev');
    console.log('2. Acessar: http://localhost:3000');
    console.log('3. Testar upload de PPTX');
    console.log('4. Testar geração de vídeos\n');
  } else if (systemHealth >= 70) {
    log.warning('⚠️  SISTEMA PARCIALMENTE FUNCIONAL');
    console.log('\nAções necessárias:');
    
    if (!testResults.databaseTables) {
      console.log('• Executar scripts SQL no Supabase Dashboard');
    }
    if (!testResults.storageBuckets) {
      console.log('• Criar buckets de storage no Supabase');
    }
    if (!testResults.nrCoursesData) {
      console.log('• Executar seed-nr-courses.sql');
    }
    if (!testResults.environmentVariables) {
      console.log('• Configurar variáveis de ambiente no .env');
    }
    console.log('');
  } else {
    log.error('❌ SISTEMA COM PROBLEMAS CRÍTICOS');
    console.log('\nRecomendação: Execute o setup completo');
    console.log('• Verificar configuração do Supabase');
    console.log('• Executar todos os scripts SQL');
    console.log('• Configurar variáveis de ambiente\n');
  }
  
  return systemHealth;
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log('🚀 INICIANDO VALIDAÇÃO COMPLETA DO SISTEMA\n');
  
  try {
    await testEnvironmentVariables();
    await testSupabaseConnection();
    await testDatabaseTables();
    await testStorageBuckets();
    await testNRCoursesData();
    await testFileStructure();
    
    const systemHealth = generateFinalReport();
    
    process.exit(systemHealth >= 70 ? 0 : 1);
    
  } catch (error) {
    log.error(`Erro durante validação: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executar validação
runAllTests();