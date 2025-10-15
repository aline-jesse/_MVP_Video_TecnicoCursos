/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔑 GERADOR DE SECRETS E CONFIGURAÇÕES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Gera automaticamente secrets e atualiza .env
 * Versão: 1.0
 * Data: 10/10/2025
 * 
 * Funcionalidades:
 * - Gera NEXTAUTH_SECRET seguro (base64, 32 bytes)
 * - Define NEXTAUTH_URL baseado no ambiente
 * - Atualiza .env preservando valores existentes
 * - Backup automático do .env anterior
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface GeneratedSecrets {
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  REDIS_URL?: string;
}

class SecretsGenerator {
  private projectRoot: string;
  private envPath: string;
  private envContent: string = '';
  private envVars: Map<string, string> = new Map();

  constructor() {
    this.projectRoot = path.join(process.cwd(), '..');
    this.envPath = path.join(this.projectRoot, '.env');
    this.loadEnv();
  }

  private log(message: string, level: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };

    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };

    console.log(`${colors[level]}${icons[level]} ${message}${colors.reset}`);
  }

  private loadEnv() {
    if (fs.existsSync(this.envPath)) {
      this.envContent = fs.readFileSync(this.envPath, 'utf-8');
      
      // Parse existing variables
      this.envContent.split('\n').forEach(line => {
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
          this.envVars.set(key, value);
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GERAÇÃO DE SECRETS
  // ═══════════════════════════════════════════════════════════════════════

  private generateNextAuthSecret(): string {
    // Gera 32 bytes aleatórios e converte para base64
    return crypto.randomBytes(32).toString('base64');
  }

  private determineNextAuthUrl(): string {
    // Tenta detectar ambiente
    const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      return 'http://localhost:3000';
    }

    // Vercel
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // Railway
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    }

    // Default para desenvolvimento
    return 'http://localhost:3000';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ANÁLISE DE NECESSIDADES
  // ═══════════════════════════════════════════════════════════════════════

  analyzeNeeds(): GeneratedSecrets {
    const needed: GeneratedSecrets = {};

    // NEXTAUTH_SECRET
    if (!this.envVars.has('NEXTAUTH_SECRET') || !this.envVars.get('NEXTAUTH_SECRET')) {
      needed.NEXTAUTH_SECRET = this.generateNextAuthSecret();
      this.log('🔑 NEXTAUTH_SECRET será gerado', 'warning');
    } else {
      this.log('✅ NEXTAUTH_SECRET já existe', 'success');
    }

    // NEXTAUTH_URL
    if (!this.envVars.has('NEXTAUTH_URL') || !this.envVars.get('NEXTAUTH_URL')) {
      needed.NEXTAUTH_URL = this.determineNextAuthUrl();
      this.log('🌐 NEXTAUTH_URL será configurado', 'warning');
    } else {
      this.log('✅ NEXTAUTH_URL já existe', 'success');
    }

    // REDIS_URL (opcional, não gerar automaticamente)
    if (!this.envVars.has('REDIS_URL')) {
      this.log('ℹ️  REDIS_URL não configurado (opcional)', 'info');
    } else {
      this.log('✅ REDIS_URL já existe', 'success');
    }

    return needed;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ATUALIZAÇÃO DO .ENV
  // ═══════════════════════════════════════════════════════════════════════

  private backupEnv() {
    if (!fs.existsSync(this.envPath)) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.projectRoot, `.env.backup.${timestamp}`);
    
    fs.copyFileSync(this.envPath, backupPath);
    this.log(`💾 Backup criado: .env.backup.${timestamp}`, 'success');
  }

  updateEnv(secrets: GeneratedSecrets): void {
    if (Object.keys(secrets).length === 0) {
      this.log('✨ Nenhuma atualização necessária!', 'success');
      return;
    }

    // Criar backup
    this.backupEnv();

    // Atualizar variáveis
    Object.entries(secrets).forEach(([key, value]) => {
      this.envVars.set(key, value);
    });

    // Reconstruir arquivo .env
    let newContent = '';
    
    // Preservar comentários e ordem
    const lines = this.envContent.split('\n');
    const processedKeys = new Set<string>();

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Comentário ou linha vazia - preservar
      if (!trimmed || trimmed.startsWith('#')) {
        newContent += line + '\n';
        return;
      }

      // Linha com variável
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/i);
      if (match) {
        const key = match[1];
        processedKeys.add(key);
        
        // Usar valor atualizado se houver
        if (this.envVars.has(key)) {
          const value = this.envVars.get(key);
          newContent += `${key}=${value}\n`;
        } else {
          newContent += line + '\n';
        }
      } else {
        newContent += line + '\n';
      }
    });

    // Adicionar novas variáveis ao final
    this.envVars.forEach((value, key) => {
      if (!processedKeys.has(key)) {
        newContent += `\n# Gerado automaticamente em ${new Date().toISOString()}\n`;
        newContent += `${key}=${value}\n`;
      }
    });

    // Salvar arquivo
    fs.writeFileSync(this.envPath, newContent, 'utf-8');
    this.log('💾 Arquivo .env atualizado com sucesso!', 'success');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RELATÓRIO
  // ═══════════════════════════════════════════════════════════════════════

  printReport(secrets: GeneratedSecrets) {
    this.log('\n╔═══════════════════════════════════════════════════════════════════╗', 'info');
    this.log('║              📋 RELATÓRIO DE SECRETS GERADOS                     ║', 'info');
    this.log('╚═══════════════════════════════════════════════════════════════════╝\n', 'info');

    if (Object.keys(secrets).length === 0) {
      this.log('✅ Todas as variáveis já estão configuradas!', 'success');
      return;
    }

    this.log('🔑 Secrets gerados:\n', 'info');

    Object.entries(secrets).forEach(([key, value]) => {
      this.log(`   ${key}:`, 'success');
      
      // Mascarar parte do valor para segurança
      let displayValue = value;
      if (key === 'NEXTAUTH_SECRET' && value.length > 10) {
        displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 5);
      }
      
      this.log(`   ${displayValue}\n`, 'info');
    });

    this.log('⚠️  IMPORTANTE:', 'warning');
    this.log('   - Secrets foram adicionados ao .env', 'warning');
    this.log('   - NUNCA commite o arquivo .env', 'warning');
    this.log('   - Backup criado com timestamp', 'warning');
    this.log('   - Configure as mesmas variáveis no servidor de produção\n', 'warning');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                   ║');
  console.log('║           🔑 GERADOR DE SECRETS v1.0                             ║');
  console.log('║                                                                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const generator = new SecretsGenerator();

  // Analisar necessidades
  console.log('🔍 Analisando variáveis existentes...\n');
  const secrets = generator.analyzeNeeds();

  if (Object.keys(secrets).length === 0) {
    console.log('\n✨ Perfeito! Todas as variáveis opcionais já estão configuradas!\n');
    process.exit(0);
  }

  // Perguntar confirmação
  console.log(`\n📝 ${Object.keys(secrets).length} variável(is) será(ão) adicionada(s):\n`);
  Object.keys(secrets).forEach(key => {
    console.log(`   - ${key}`);
  });

  console.log('\n⚠️  Isso irá modificar seu arquivo .env (backup será criado)');
  console.log('   Pressione CTRL+C para cancelar ou aguarde 3 segundos...\n');

  // Aguardar 3 segundos
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Atualizar .env
  console.log('💾 Atualizando .env...\n');
  generator.updateEnv(secrets);

  // Imprimir relatório
  generator.printReport(secrets);

  console.log('✅ Processo concluído com sucesso!\n');
  console.log('🚀 Próximos passos:');
  console.log('   1. Execute: npx tsx validate-environment.ts');
  console.log('   2. Verifique se todos os itens passaram');
  console.log('   3. Configure as mesmas variáveis no ambiente de produção\n');

  process.exit(0);
}

main().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
