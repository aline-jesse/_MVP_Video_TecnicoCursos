#!/usr/bin/env node

/**
 * Script para configurar credenciais TTS automaticamente
 * Configura Azure Speech Services, ElevenLabs e Google TTS
 */

const fs = require('fs');
const path = require('path');

// Configurações padrão para TTS
const TTS_CONFIG = {
  // Azure Speech Services (Configuração padrão para Brasil)
  AZURE_SPEECH_KEY: "YOUR_AZURE_SPEECH_KEY_HERE",
  AZURE_SPEECH_REGION: "brazilsouth",
  
  // ElevenLabs (Chave de demonstração - substitua pela real)
  ELEVENLABS_API_KEY: "YOUR_ELEVENLABS_API_KEY_HERE",
  
  // Google TTS (Opcional - adicione se necessário)
  GOOGLE_TTS_API_KEY: "",
  GOOGLE_TTS_PROJECT_ID: ""
};

function updateEnvFile(filePath, config) {
  console.log(`📝 Atualizando arquivo: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Atualizar ou adicionar cada configuração
  Object.entries(config).forEach(([key, value]) => {
    if (!value) return; // Pular valores vazios
    
    const commentedPattern = new RegExp(`^\\s*#\\s*${key}=.*$`, 'gm');
    const activePattern = new RegExp(`^\\s*${key}=.*$`, 'gm');
    
    if (content.match(commentedPattern)) {
      // Descomentar e atualizar
      content = content.replace(commentedPattern, `${key}="${value}"`);
      console.log(`✅ Descomentado e atualizado: ${key}`);
      updated = true;
    } else if (content.match(activePattern)) {
      // Atualizar valor existente
      content = content.replace(activePattern, `${key}="${value}"`);
      console.log(`🔄 Atualizado: ${key}`);
      updated = true;
    } else {
      // Adicionar nova linha na seção TTS
      const ttsSection = '# 🎙️ TTS SERVICES';
      if (content.includes(ttsSection)) {
        const insertPoint = content.indexOf(ttsSection) + ttsSection.length;
        const beforeInsert = content.substring(0, insertPoint);
        const afterInsert = content.substring(insertPoint);
        content = beforeInsert + `\n${key}="${value}"` + afterInsert;
        console.log(`➕ Adicionado: ${key}`);
        updated = true;
      }
    }
  });
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Arquivo atualizado: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️ Nenhuma alteração necessária: ${filePath}`);
    return false;
  }
}

function validateTTSConfig() {
  console.log('\n🔍 Validando configuração TTS...');
  
  const envFiles = [
    path.join(__dirname, '.env'),
    path.join(__dirname, 'estudio_ia_videos', '.env.local')
  ];
  
  let allValid = true;
  
  envFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n📄 Verificando: ${path.basename(filePath)}`);
    
    Object.keys(TTS_CONFIG).forEach(key => {
      const pattern = new RegExp(`^\\s*${key}=(.*)$`, 'm');
      const match = content.match(pattern);
      
      if (match && match[1] && match[1] !== '""' && !match[1].includes('your-')) {
        console.log(`✅ ${key}: Configurado`);
      } else {
        console.log(`❌ ${key}: Não configurado ou valor padrão`);
        allValid = false;
      }
    });
  });
  
  return allValid;
}

async function main() {
  console.log('🚀 Configurando credenciais TTS...\n');
  
  const envFiles = [
    path.join(__dirname, '.env'),
    path.join(__dirname, 'estudio_ia_videos', '.env.local')
  ];
  
  let totalUpdated = 0;
  
  // Atualizar arquivos .env
  envFiles.forEach(filePath => {
    if (updateEnvFile(filePath, TTS_CONFIG)) {
      totalUpdated++;
    }
  });
  
  console.log(`\n📊 Resumo: ${totalUpdated} arquivo(s) atualizado(s)`);
  
  // Validar configuração
  const isValid = validateTTSConfig();
  
  if (isValid) {
    console.log('\n🎉 Configuração TTS completa e válida!');
    console.log('\n📋 Serviços configurados:');
    console.log('  ✅ Azure Speech Services (Região: Brazil South)');
    console.log('  ✅ ElevenLabs API');
    console.log('\n🔧 Próximos passos:');
    console.log('  1. Reinicie o servidor de desenvolvimento');
    console.log('  2. Teste a geração de áudio TTS');
    console.log('  3. Verifique os logs para confirmar conectividade');
  } else {
    console.log('\n⚠️ Algumas configurações podem precisar de ajustes manuais');
    console.log('Verifique os arquivos .env e .env.local');
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateEnvFile, validateTTSConfig, TTS_CONFIG };