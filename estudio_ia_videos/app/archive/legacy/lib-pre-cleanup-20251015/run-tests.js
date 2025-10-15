#!/usr/bin/env node
/**
 * 🚀 RUNNER DE TESTES - Implementações Reais
 * 
 * Executa os testes das implementações reais
 * com verificação de dependências e ambiente
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🔍 VERIFICANDO AMBIENTE...\n');

// Verificar Node.js
const nodeVersion = process.version;
console.log(`✅ Node.js: ${nodeVersion}`);

// Verificar dependências
const requiredPackages = [
  '@prisma/client',
  'bullmq',
  'ioredis',
  'xml2js'
];

let missingPackages = [];

requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg}: instalado`);
  } catch {
    console.log(`❌ ${pkg}: NÃO ENCONTRADO`);
    missingPackages.push(pkg);
  }
});

if (missingPackages.length > 0) {
  console.log('\n⚠️  INSTALANDO DEPENDÊNCIAS FALTANTES...\n');
  
  const install = spawn('npm', ['install', ...missingPackages], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  install.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Dependências instaladas!\n');
      runTests();
    } else {
      console.error('\n❌ Erro ao instalar dependências');
      process.exit(1);
    }
  });
} else {
  console.log('\n✅ Todas as dependências estão instaladas!\n');
  runTests();
}

function runTests() {
  console.log('🧪 EXECUTANDO TESTES...\n');
  
  const tsNode = spawn('npx', [
    'ts-node',
    '--transpile-only',
    path.join(__dirname, 'test-implementations.ts')
  ], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  tsNode.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Testes concluídos com sucesso!');
    } else {
      console.error('\n❌ Testes falharam');
    }
    process.exit(code);
  });
}
