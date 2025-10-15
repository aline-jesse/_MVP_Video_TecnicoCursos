/**
 * Script para criar o bucket 'videos' com configurações corretas
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carregar .env
function loadEnv() {
  let envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    envPath = path.join(process.cwd(), '..', '.env');
  }
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createVideosBucket() {
  console.log('\n📦 Criando bucket "videos"...\n');
  
  // Tentar com limite de 100MB ao invés de 500MB
  const { data, error } = await supabase.storage.createBucket('videos', {
    public: false,
    fileSizeLimit: 104857600, // 100 MB em bytes
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime']
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Bucket "videos" já existe!\n');
      return true;
    } else {
      console.log('❌ Erro ao criar bucket:', error.message);
      console.log('\n💡 Tentando criar sem limitações...\n');
      
      // Tentar sem especificar limitações
      const { data: data2, error: error2 } = await supabase.storage.createBucket('videos', {
        public: false
      });
      
      if (error2) {
        console.log('❌ Falhou novamente:', error2.message);
        console.log('\n📝 SOLUÇÃO MANUAL NECESSÁRIA:');
        console.log('   1. Abra: https://supabase.com/dashboard/project/ofhzrdiadxigrvmrhaiz/storage/buckets');
        console.log('   2. Clique "New bucket"');
        console.log('   3. Nome: videos');
        console.log('   4. Público: NO');
        console.log('   5. File size limit: 100 MB');
        console.log('   6. Clique "Create bucket"\n');
        return false;
      } else {
        console.log('✅ Bucket "videos" criado com sucesso (sem limitações)!\n');
        return true;
      }
    }
  } else {
    console.log('✅ Bucket "videos" criado com sucesso!\n');
    return true;
  }
}

async function verifyAllBuckets() {
  console.log('📋 Verificando todos os buckets...\n');
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.log('❌ Erro ao listar buckets:', error.message);
    return;
  }
  
  const expectedBuckets = ['videos', 'avatars', 'thumbnails', 'assets'];
  const foundBuckets = buckets?.map((b: any) => b.name) || [];
  
  console.log(`Total: ${foundBuckets.length}/${expectedBuckets.length}\n`);
  
  expectedBuckets.forEach(name => {
    const found = foundBuckets.includes(name);
    console.log(`${found ? '✅' : '❌'} ${name}`);
  });
  
  console.log('\n');
  
  if (foundBuckets.length === expectedBuckets.length) {
    console.log('🎉 Todos os 4 buckets estão criados!\n');
    console.log('✅ SETUP SUPABASE 100% COMPLETO!\n');
    return true;
  } else {
    console.log(`⚠️  ${expectedBuckets.length - foundBuckets.length} bucket(s) faltando\n`);
    return false;
  }
}

async function main() {
  const success = await createVideosBucket();
  await verifyAllBuckets();
  
  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(console.error);
