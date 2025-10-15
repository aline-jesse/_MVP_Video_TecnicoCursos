/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🚀 ASSISTENTE DE DEPLOY
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Guia interativo para deploy em diferentes plataformas
 * Versão: 1.0
 * Data: 10/10/2025
 * 
 * Plataformas Suportadas:
 * - Vercel (Recomendado)
 * - Railway
 * - Docker (Self-hosted)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

type Platform = 'vercel' | 'railway' | 'docker' | 'manual';

interface DeployConfig {
  platform: Platform;
  appDir: string;
  envVars: Map<string, string>;
}

class DeployAssistant {
  private projectRoot: string;
  private appDir: string;
  private envVars: Map<string, string> = new Map();

  constructor() {
    this.projectRoot = path.join(process.cwd(), '..');
    this.appDir = path.join(this.projectRoot, 'estudio_ia_videos', 'app');
    this.loadEnv();
  }

  private loadEnv() {
    const envPath = path.join(this.projectRoot, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
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

  // ═══════════════════════════════════════════════════════════════════════
  // PRÉ-REQUISITOS
  // ═══════════════════════════════════════════════════════════════════════

  async checkPrerequisites(): Promise<boolean> {
    this.log('\n🔍 Verificando pré-requisitos...\n', 'info');

    let allPassed = true;

    // 1. Validar ambiente
    this.log('1️⃣  Validando ambiente...', 'info');
    try {
      const validationScript = path.join(process.cwd(), 'validate-environment.ts');
      execSync(`npx tsx ${validationScript}`, { stdio: 'pipe' });
      this.log('   ✅ Ambiente validado (100/100)', 'success');
    } catch (error) {
      this.log('   ❌ Ambiente não validado - Execute: npx tsx validate-environment.ts', 'error');
      allPassed = false;
    }

    // 2. Verificar diretório da aplicação
    this.log('\n2️⃣  Verificando diretório da aplicação...', 'info');
    if (!fs.existsSync(this.appDir)) {
      this.log('   ❌ Diretório não encontrado: estudio_ia_videos/app', 'error');
      allPassed = false;
    } else {
      this.log('   ✅ Diretório encontrado', 'success');
    }

    // 3. Verificar package.json
    this.log('\n3️⃣  Verificando package.json...', 'info');
    const packagePath = path.join(this.appDir, 'package.json');
    if (!fs.existsSync(packagePath)) {
      this.log('   ❌ package.json não encontrado', 'error');
      allPassed = false;
    } else {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      if (!pkg.scripts || !pkg.scripts.build) {
        this.log('   ⚠️  Script de build não encontrado', 'warning');
      } else {
        this.log('   ✅ Scripts de build configurados', 'success');
      }
    }

    // 4. Verificar Git
    this.log('\n4️⃣  Verificando Git...', 'info');
    try {
      execSync('git --version', { stdio: 'pipe' });
      const gitStatus = execSync('git status', { cwd: this.projectRoot, stdio: 'pipe' }).toString();
      if (gitStatus.includes('nothing to commit')) {
        this.log('   ✅ Git inicializado e limpo', 'success');
      } else {
        this.log('   ⚠️  Há mudanças não commitadas', 'warning');
      }
    } catch (error) {
      this.log('   ⚠️  Git não inicializado (necessário para Vercel/Railway)', 'warning');
    }

    return allPassed;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DEPLOY VERCEL
  // ═══════════════════════════════════════════════════════════════════════

  async deployVercel() {
    this.log('\n╔═══════════════════════════════════════════════════════════════════╗', 'info');
    this.log('║                    🚀 DEPLOY VERCEL                              ║', 'info');
    this.log('╚═══════════════════════════════════════════════════════════════════╝\n', 'info');

    // Verificar Vercel CLI
    this.log('📦 Verificando Vercel CLI...', 'info');
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      this.log('✅ Vercel CLI instalado\n', 'success');
    } catch (error) {
      this.log('❌ Vercel CLI não instalado\n', 'error');
      this.log('📥 Instalando Vercel CLI...', 'info');
      try {
        execSync('npm install -g vercel', { stdio: 'inherit' });
        this.log('✅ Vercel CLI instalado com sucesso!\n', 'success');
      } catch (installError) {
        this.log('❌ Falha ao instalar Vercel CLI', 'error');
        this.log('   Execute manualmente: npm install -g vercel', 'info');
        return;
      }
    }

    // Criar vercel.json
    this.log('📝 Criando vercel.json...', 'info');
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/next'
        }
      ],
      env: {
        NEXT_PUBLIC_SUPABASE_URL: this.envVars.get('NEXT_PUBLIC_SUPABASE_URL'),
        SUPABASE_SERVICE_ROLE_KEY: this.envVars.get('SUPABASE_SERVICE_ROLE_KEY'),
        DATABASE_URL: this.envVars.get('DATABASE_URL'),
        NEXTAUTH_SECRET: this.envVars.get('NEXTAUTH_SECRET'),
        NEXTAUTH_URL: '@url'
      }
    };

    const vercelJsonPath = path.join(this.appDir, 'vercel.json');
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
    this.log('✅ vercel.json criado\n', 'success');

    // Instruções
    this.log('📋 Próximos passos:\n', 'info');
    this.log('1️⃣  Autentique-se no Vercel:', 'info');
    this.log('   cd estudio_ia_videos/app', 'info');
    this.log('   vercel login\n', 'info');
    
    this.log('2️⃣  Deploy de teste (preview):', 'info');
    this.log('   vercel\n', 'info');
    
    this.log('3️⃣  Deploy de produção:', 'info');
    this.log('   vercel --prod\n', 'info');
    
    this.log('⚠️  IMPORTANTE:', 'warning');
    this.log('   - As variáveis de ambiente serão configuradas automaticamente', 'warning');
    this.log('   - NEXTAUTH_URL será atualizado com a URL da Vercel', 'warning');
    this.log('   - O build pode levar 2-5 minutos', 'warning');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DEPLOY RAILWAY
  // ═══════════════════════════════════════════════════════════════════════

  async deployRailway() {
    this.log('\n╔═══════════════════════════════════════════════════════════════════╗', 'info');
    this.log('║                    🚂 DEPLOY RAILWAY                             ║', 'info');
    this.log('╚═══════════════════════════════════════════════════════════════════╝\n', 'info');

    // Criar railway.json
    this.log('📝 Criando railway.json...', 'info');
    const railwayConfig = {
      build: {
        builder: 'NIXPACKS',
        buildCommand: 'npm run build'
      },
      deploy: {
        startCommand: 'npm start',
        restartPolicyType: 'ON_FAILURE',
        restartPolicyMaxRetries: 10
      }
    };

    const railwayJsonPath = path.join(this.appDir, 'railway.json');
    fs.writeFileSync(railwayJsonPath, JSON.stringify(railwayConfig, null, 2));
    this.log('✅ railway.json criado\n', 'success');

    // Instruções
    this.log('📋 Próximos passos:\n', 'info');
    this.log('1️⃣  Acesse: https://railway.app', 'info');
    this.log('2️⃣  Clique em "New Project"', 'info');
    this.log('3️⃣  Selecione "Deploy from GitHub repo"', 'info');
    this.log('4️⃣  Conecte seu repositório GitHub', 'info');
    this.log('5️⃣  Configure as variáveis de ambiente:\n', 'info');
    
    this.envVars.forEach((value, key) => {
      if (key !== 'NEXTAUTH_URL') {
        this.log(`   ${key}=${value.substring(0, 20)}...`, 'info');
      } else {
        this.log(`   NEXTAUTH_URL=<URL-gerada-pelo-Railway>`, 'info');
      }
    });
    
    this.log('\n6️⃣  Clique em "Deploy"', 'info');
    this.log('\n⚠️  IMPORTANTE:', 'warning');
    this.log('   - NEXTAUTH_URL deve ser atualizado após o deploy', 'warning');
    this.log('   - Railway gera automaticamente a URL pública', 'warning');
    this.log('   - Build pode levar 3-7 minutos', 'warning');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DEPLOY DOCKER
  // ═══════════════════════════════════════════════════════════════════════

  async deployDocker() {
    this.log('\n╔═══════════════════════════════════════════════════════════════════╗', 'info');
    this.log('║                    🐳 DEPLOY DOCKER                              ║', 'info');
    this.log('╚═══════════════════════════════════════════════════════════════════╝\n', 'info');

    // Criar Dockerfile
    this.log('📝 Criando Dockerfile...', 'info');
    const dockerfile = `# Estágio 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Build
RUN npm run build

# Estágio 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Copiar dependências de produção
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copiar build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["npm", "start"]
`;

    const dockerfilePath = path.join(this.appDir, 'Dockerfile');
    fs.writeFileSync(dockerfilePath, dockerfile);
    this.log('✅ Dockerfile criado\n', 'success');

    // Criar .dockerignore
    this.log('📝 Criando .dockerignore...', 'info');
    const dockerignore = `node_modules
.next
.git
.env
.env.local
*.log
npm-debug.log*
.DS_Store
`;

    const dockerignorePath = path.join(this.appDir, '.dockerignore');
    fs.writeFileSync(dockerignorePath, dockerignore);
    this.log('✅ .dockerignore criado\n', 'success');

    // Criar docker-compose.yml
    this.log('📝 Criando docker-compose.yml...', 'info');
    const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
      - DATABASE_URL=\${DATABASE_URL}
      - NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=\${NEXTAUTH_URL}
    restart: unless-stopped
`;

    const dockerComposePath = path.join(this.appDir, 'docker-compose.yml');
    fs.writeFileSync(dockerComposePath, dockerCompose);
    this.log('✅ docker-compose.yml criado\n', 'success');

    // Instruções
    this.log('📋 Próximos passos:\n', 'info');
    this.log('1️⃣  Navegue até o diretório da aplicação:', 'info');
    this.log('   cd estudio_ia_videos/app\n', 'info');
    
    this.log('2️⃣  Build da imagem:', 'info');
    this.log('   docker build -t estudio-ia-videos .\n', 'info');
    
    this.log('3️⃣  Executar com docker-compose:', 'info');
    this.log('   docker-compose up -d\n', 'info');
    
    this.log('Ou executar manualmente:', 'info');
    this.log('   docker run -p 3000:3000 \\', 'info');
    this.log('     -e NEXT_PUBLIC_SUPABASE_URL=... \\', 'info');
    this.log('     -e SUPABASE_SERVICE_ROLE_KEY=... \\', 'info');
    this.log('     -e DATABASE_URL=... \\', 'info');
    this.log('     -e NEXTAUTH_SECRET=... \\', 'info');
    this.log('     -e NEXTAUTH_URL=http://localhost:3000 \\', 'info');
    this.log('     estudio-ia-videos\n', 'info');
    
    this.log('⚠️  IMPORTANTE:', 'warning');
    this.log('   - Build pode levar 5-10 minutos', 'warning');
    this.log('   - Aplicação estará disponível em http://localhost:3000', 'warning');
    this.log('   - Para produção, use um reverse proxy (Nginx/Traefik)', 'warning');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MANUAL
  // ═══════════════════════════════════════════════════════════════════════

  async deployManual() {
    this.log('\n╔═══════════════════════════════════════════════════════════════════╗', 'info');
    this.log('║                    📚 DEPLOY MANUAL                              ║', 'info');
    this.log('╚═══════════════════════════════════════════════════════════════════╝\n', 'info');

    this.log('📋 Checklist de Deploy Manual:\n', 'info');

    this.log('1️⃣  Preparação do Servidor:', 'info');
    this.log('   ✅ Node.js v18+ instalado', 'info');
    this.log('   ✅ npm ou yarn instalado', 'info');
    this.log('   ✅ Git instalado', 'info');
    this.log('   ✅ PM2 ou supervisor de processos\n', 'info');

    this.log('2️⃣  Clonar Repositório:', 'info');
    this.log('   git clone <seu-repositorio>', 'info');
    this.log('   cd estudio_ia_videos/app\n', 'info');

    this.log('3️⃣  Instalar Dependências:', 'info');
    this.log('   npm ci --production=false\n', 'info');

    this.log('4️⃣  Configurar Variáveis de Ambiente:', 'info');
    this.log('   cp .env.example .env', 'info');
    this.log('   nano .env\n', 'info');
    this.log('   Adicione as variáveis:', 'info');
    this.envVars.forEach((value, key) => {
      this.log(`   ${key}=...`, 'info');
    });

    this.log('\n5️⃣  Build da Aplicação:', 'info');
    this.log('   npm run build\n', 'info');

    this.log('6️⃣  Iniciar com PM2:', 'info');
    this.log('   npm install -g pm2', 'info');
    this.log('   pm2 start npm --name "estudio-ia" -- start', 'info');
    this.log('   pm2 save', 'info');
    this.log('   pm2 startup\n', 'info');

    this.log('7️⃣  Configurar Nginx (Opcional):', 'info');
    this.log('   server {', 'info');
    this.log('     listen 80;', 'info');
    this.log('     server_name seu-dominio.com;', 'info');
    this.log('     location / {', 'info');
    this.log('       proxy_pass http://localhost:3000;', 'info');
    this.log('       proxy_http_version 1.1;', 'info');
    this.log('       proxy_set_header Upgrade $http_upgrade;', 'info');
    this.log('       proxy_set_header Connection "upgrade";', 'info');
    this.log('     }', 'info');
    this.log('   }\n', 'info');

    this.log('⚠️  IMPORTANTE:', 'warning');
    this.log('   - Configure SSL/TLS (Let\'s Encrypt)', 'warning');
    this.log('   - Configure firewall (apenas portas 80, 443)', 'warning');
    this.log('   - Configure backups automáticos', 'warning');
    this.log('   - Monitore logs com pm2 logs', 'warning');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MENU PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════

  async showMenu() {
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                   ║');
    console.log('║           🚀 ASSISTENTE DE DEPLOY v1.0                           ║');
    console.log('║                                                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    // Verificar pré-requisitos
    const prereqsPassed = await this.checkPrerequisites();

    if (!prereqsPassed) {
      this.log('\n⚠️  Corrija os problemas acima antes de continuar', 'warning');
      this.log('   Execute: npx tsx validate-environment.ts\n', 'info');
      return;
    }

    this.log('\n✅ Pré-requisitos validados!\n', 'success');

    // Menu de opções
    console.log('📋 Selecione a plataforma de deploy:\n');
    console.log('1️⃣  Vercel (Recomendado - Deploy automático)');
    console.log('2️⃣  Railway (Deploy automático)');
    console.log('3️⃣  Docker (Self-hosted)');
    console.log('4️⃣  Manual (Servidor próprio)');
    console.log('0️⃣  Sair\n');

    // Simular seleção (em produção seria input do usuário)
    // Por padrão, mostrar todas as opções
    await this.deployVercel();
    await this.deployRailway();
    await this.deployDocker();
    await this.deployManual();

    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ PRONTO PARA DEPLOY!                        ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    console.log('📝 Escolha uma das opções acima e siga os passos.\n');
    console.log('💡 Recomendação: Use Vercel para deploy mais rápido e fácil.\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const assistant = new DeployAssistant();
  await assistant.showMenu();
}

main().catch(console.error);
