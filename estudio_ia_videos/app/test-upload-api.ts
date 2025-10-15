/**
 * 🔍 DIAGNÓSTICO COMPLETO - API DE UPLOAD PPTX
 * 
 * Este script testa todos os componentes da API de upload:
 * 1. Conexão com banco de dados (Prisma)
 * 2. Parser de PPTX
 * 3. Sistema de arquivos
 * 4. Validação de usuário
 * 
 * Execute: npx tsx test-upload-api.ts
 */

import { prisma as db } from './lib/db';
import { PPTXParser } from './lib/pptx/parser';
import fs from 'fs';
import path from 'path';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║          🔍 DIAGNÓSTICO - API DE UPLOAD PPTX                      ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

async function testDatabase() {
  console.log('📊 TESTE 1: CONEXÃO COM BANCO DE DADOS');
  console.log('─'.repeat(70));
  
  try {
    // Testar conexão
    await db.$connect();
    console.log('✅ Conexão estabelecida com sucesso\n');
    
    // Testar consulta
    console.log('🔍 Verificando usuários...');
    const userCount = await db.user.count();
    console.log(`   Total de usuários: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  Nenhum usuário encontrado - criando usuário de teste...');
      const testUser = await db.user.create({
        data: {
          email: 'test@estudioiavideos.com',
          name: 'Usuário de Teste',
          role: 'USER',
        },
      });
      console.log(`✅ Usuário de teste criado: ${testUser.email} (ID: ${testUser.id})`);
    } else {
      const firstUser = await db.user.findFirst();
      console.log(`✅ Usuário encontrado: ${firstUser?.email} (ID: ${firstUser?.id})`);
    }
    
    // Testar tabelas do projeto
    console.log('\n🔍 Verificando estrutura de tabelas...');
    const projectCount = await db.project.count();
    console.log(`   Projetos existentes: ${projectCount}`);
    
    console.log('\n✅ BANCO DE DADOS: OK\n');
    return true;
  } catch (error) {
    console.log('\n❌ ERRO NO BANCO DE DADOS!');
    console.error('Detalhes:', error);
    console.log('\n💡 POSSÍVEIS CAUSAS:');
    console.log('   • DATABASE_URL incorreto no .env');
    console.log('   • Banco de dados não está rodando');
    console.log('   • Migrations não foram executadas (npx prisma migrate dev)');
    console.log('   • Cliente Prisma não foi gerado (npx prisma generate)');
    console.log('');
    return false;
  }
}

async function testPPTXParser() {
  console.log('📄 TESTE 2: PARSER DE PPTX');
  console.log('─'.repeat(70));
  
  try {
    // Verificar se o parser pode ser instanciado
    const parser = new PPTXParser();
    console.log('✅ PPTXParser instanciado com sucesso');
    
    // Verificar método de validação
    if (typeof PPTXParser.validatePPTX === 'function') {
      console.log('✅ Método validatePPTX disponível');
    } else {
      console.log('⚠️  Método validatePPTX não encontrado');
    }
    
    console.log('\n✅ PARSER PPTX: OK\n');
    return true;
  } catch (error) {
    console.log('\n❌ ERRO NO PARSER PPTX!');
    console.error('Detalhes:', error);
    console.log('\n💡 POSSÍVEIS CAUSAS:');
    console.log('   • Dependência faltando (npm install)');
    console.log('   • Arquivo lib/pptx/parser.ts com erro');
    console.log('');
    return false;
  }
}

async function testFileSystem() {
  console.log('💾 TESTE 3: SISTEMA DE ARQUIVOS');
  console.log('─'.repeat(70));
  
  try {
    // Verificar diretório de uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    console.log(`📁 Diretório de uploads: ${uploadsDir}`);
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('⚠️  Diretório não existe - criando...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Diretório criado');
    } else {
      console.log('✅ Diretório existe');
    }
    
    // Testar permissão de escrita
    const testFile = path.join(uploadsDir, '.test-write');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Permissão de escrita OK');
    
    console.log('\n✅ SISTEMA DE ARQUIVOS: OK\n');
    return true;
  } catch (error) {
    console.log('\n❌ ERRO NO SISTEMA DE ARQUIVOS!');
    console.error('Detalhes:', error);
    console.log('\n💡 POSSÍVEIS CAUSAS:');
    console.log('   • Sem permissão para criar diretórios');
    console.log('   • Disco cheio');
    console.log('   • Caminho inválido');
    console.log('');
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('🔧 TESTE 4: VARIÁVEIS DE AMBIENTE');
  console.log('─'.repeat(70));
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
  ];
  
  let allRequired = true;
  
  console.log('📋 Variáveis obrigatórias:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      const preview = varName.includes('SECRET') || varName.includes('KEY') 
        ? `${value.substring(0, 10)}...` 
        : value.substring(0, 30) + '...';
      console.log(`   ✅ ${varName}: ${preview}`);
    } else {
      console.log(`   ❌ ${varName}: NÃO DEFINIDA`);
      allRequired = false;
    }
  }
  
  console.log('\n📋 Variáveis opcionais:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: configurada`);
    } else {
      console.log(`   ⚠️  ${varName}: não configurada`);
    }
  }
  
  if (allRequired) {
    console.log('\n✅ VARIÁVEIS DE AMBIENTE: OK\n');
    return true;
  } else {
    console.log('\n⚠️  ALGUMAS VARIÁVEIS OBRIGATÓRIAS FALTANDO\n');
    return false;
  }
}

async function runDiagnostics() {
  const results = {
    env: false,
    database: false,
    parser: false,
    filesystem: false,
  };
  
  // Executar testes
  results.env = await testEnvironmentVariables();
  results.database = await testDatabase();
  results.parser = await testPPTXParser();
  results.filesystem = await testFileSystem();
  
  // Resumo final
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                      📊 RESUMO DO DIAGNÓSTICO                      ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
  
  const tests = [
    { name: 'Variáveis de Ambiente', result: results.env },
    { name: 'Banco de Dados', result: results.database },
    { name: 'Parser PPTX', result: results.parser },
    { name: 'Sistema de Arquivos', result: results.filesystem },
  ];
  
  tests.forEach(test => {
    const icon = test.result ? '✅' : '❌';
    const status = test.result ? 'OK' : 'FALHOU';
    console.log(`${icon} ${test.name.padEnd(25)} ${status}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('   A API de upload deve estar funcionando corretamente.');
    console.log('   Se ainda assim há erro 500, verifique os logs do servidor.\n');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
    console.log('   Corrija os problemas acima antes de tentar fazer upload.\n');
  }
  
  // Desconectar do banco
  await db.$disconnect();
}

// Executar diagnóstico
runDiagnostics().catch((error) => {
  console.error('\n💥 ERRO FATAL NO DIAGNÓSTICO:');
  console.error(error);
  process.exit(1);
});
