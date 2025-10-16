const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando credenciais TTS...');

// Arquivo .env.local do estudio_ia_videos
const envLocalPath = path.join(__dirname, 'estudio_ia_videos', '.env.local');

if (fs.existsSync(envLocalPath)) {
  let content = fs.readFileSync(envLocalPath, 'utf8');
  
  // Descomentar e configurar Azure Speech
  content = content.replace(
    /# AZURE_TTS_KEY="your-azure-key"/g,
    'AZURE_SPEECH_KEY="YOUR_AZURE_SPEECH_KEY_HERE"'
  );
  
  content = content.replace(
    /# AZURE_TTS_REGION="brazilsouth"/g,
    'AZURE_SPEECH_REGION="brazilsouth"'
  );
  
  // Descomentar e configurar ElevenLabs
  content = content.replace(
    /# ELEVENLABS_API_KEY="your-elevenlabs-key"/g,
    'ELEVENLABS_API_KEY="YOUR_ELEVENLABS_API_KEY_HERE"'
  );
  
  fs.writeFileSync(envLocalPath, content);
  console.log('✅ Credenciais TTS configuradas em .env.local');
} else {
  console.log('❌ Arquivo .env.local não encontrado');
}

// Arquivo .env principal
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Adicionar credenciais TTS se não existirem
  if (!content.includes('AZURE_SPEECH_KEY')) {
    content += '\n\n# ============================================\n';
    content += '# 🎙️ TTS SERVICES\n';
    content += '# ============================================\n\n';
    content += 'AZURE_SPEECH_KEY="YOUR_AZURE_SPEECH_KEY_HERE"\n';
    content += 'AZURE_SPEECH_REGION="brazilsouth"\n';
    content += 'ELEVENLABS_API_KEY="YOUR_ELEVENLABS_API_KEY_HERE"\n';
    
    fs.writeFileSync(envPath, content);
    console.log('✅ Credenciais TTS adicionadas ao .env principal');
  } else {
    console.log('ℹ️ Credenciais TTS já existem no .env principal');
  }
} else {
  console.log('❌ Arquivo .env não encontrado');
}

console.log('\n🎉 Configuração TTS completa!');
console.log('📋 Serviços configurados:');
console.log('  ✅ Azure Speech Services (Região: Brazil South)');
console.log('  ✅ ElevenLabs API');