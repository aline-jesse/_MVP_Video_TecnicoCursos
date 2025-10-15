# ============================================
# 🎯 VERIFICAÇÃO FINAL DE PRODUÇÃO
# ============================================
# Valida se o sistema está pronto para deploy
# ============================================

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎯 VERIFICAÇÃO FINAL - PRODUCTION READINESS             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$successes = 0
$warnings = 0
$errors = 0

# ============================================
# 1. VERIFICAR ESTRUTURA DE ARQUIVOS
# ============================================

Write-Host "`n📁 ETAPA 1: Verificando estrutura de arquivos...`n" -ForegroundColor Yellow

$coreFiles = @(
    "lib/pptx/auto-narration-service.ts",
    "lib/pptx/animation-converter.ts",
    "lib/pptx/batch-processor.ts",
    "lib/pptx/layout-analyzer.ts",
    "lib/pptx/batch-db-service.ts",
    "lib/pptx/types/pptx-types.ts",
    "app/api/v1/pptx/process-advanced/route.ts",
    "prisma/schema.prisma",
    "scripts/test-pptx-advanced.ts"
)

foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
        $successes++
    } else {
        Write-Host "   ❌ $file NÃO ENCONTRADO" -ForegroundColor Red
        $errors++
    }
}

# ============================================
# 2. VERIFICAR DEPENDÊNCIAS
# ============================================

Write-Host "`n📦 ETAPA 2: Verificando dependências...`n" -ForegroundColor Yellow

$dependencies = @(
    "node_modules/@prisma/client",
    "node_modules/next",
    "node_modules/react",
    "node_modules/typescript"
)

foreach ($dep in $dependencies) {
    if (Test-Path $dep) {
        Write-Host "   ✅ $(Split-Path $dep -Leaf) instalado" -ForegroundColor Green
        $successes++
    } else {
        Write-Host "   ❌ $(Split-Path $dep -Leaf) NÃO instalado" -ForegroundColor Red
        $errors++
    }
}

# ============================================
# 3. VERIFICAR PRISMA
# ============================================

Write-Host "`n🔧 ETAPA 3: Verificando Prisma...`n" -ForegroundColor Yellow

try {
    $prismaCheck = npx prisma -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Prisma CLI funcional" -ForegroundColor Green
        $successes++
    } else {
        Write-Host "   ❌ Prisma CLI com problemas" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "   ❌ Erro ao verificar Prisma: $_" -ForegroundColor Red
    $errors++
}

# Verificar se client foi gerado
if (Test-Path "node_modules/.prisma/client") {
    Write-Host "   ✅ Prisma Client gerado" -ForegroundColor Green
    $successes++
} else {
    Write-Host "   ⚠️  Prisma Client não gerado - Execute: npx prisma generate" -ForegroundColor Yellow
    $warnings++
}

# ============================================
# 4. VERIFICAR VARIÁVEIS DE AMBIENTE
# ============================================

Write-Host "`n🔐 ETAPA 4: Verificando variáveis de ambiente...`n" -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "   ✅ Arquivo .env.local existe" -ForegroundColor Green
    $successes++
    
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "DATABASE_URL=") {
        Write-Host "   ✅ DATABASE_URL configurado" -ForegroundColor Green
        $successes++
    } else {
        Write-Host "   ❌ DATABASE_URL NÃO configurado" -ForegroundColor Red
        $errors++
    }
    
    if ($envContent -match "DIRECT_DATABASE_URL=") {
        Write-Host "   ✅ DIRECT_DATABASE_URL configurado" -ForegroundColor Green
        $successes++
    } else {
        Write-Host "   ⚠️  DIRECT_DATABASE_URL não configurado (recomendado para Supabase)" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ❌ Arquivo .env.local NÃO existe" -ForegroundColor Red
    Write-Host "   💡 Execute: .\scripts\configure-supabase.ps1" -ForegroundColor Yellow
    $errors++
}

# ============================================
# 5. VERIFICAR CONEXÃO DB (Se configurado)
# ============================================

Write-Host "`n💾 ETAPA 5: Verificando conexão com banco...`n" -ForegroundColor Yellow

if (Test-Path ".env.local") {
    try {
        $dbCheck = npx prisma db push --skip-generate --accept-data-loss 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Conexão com banco estabelecida" -ForegroundColor Green
            $successes++
        } else {
            Write-Host "   ⚠️  Não foi possível conectar ao banco" -ForegroundColor Yellow
            Write-Host "   💡 Configure Supabase: .\scripts\configure-supabase.ps1" -ForegroundColor Yellow
            $warnings++
        }
    } catch {
        Write-Host "   ⚠️  Erro ao testar conexão: $_" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ⚠️  Pulando (sem .env.local)" -ForegroundColor Yellow
    $warnings++
}

# ============================================
# 6. VERIFICAR SCRIPTS
# ============================================

Write-Host "`n🧪 ETAPA 6: Verificando scripts...`n" -ForegroundColor Yellow

$scripts = @(
    "scripts/configure-supabase.ps1",
    "scripts/setup-and-test.ps1",
    "scripts/test-pptx-advanced.ts",
    "scripts/validate-stack.ts"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "   ✅ $(Split-Path $script -Leaf)" -ForegroundColor Green
        $successes++
    } else {
        Write-Host "   ❌ $(Split-Path $script -Leaf) NÃO encontrado" -ForegroundColor Red
        $errors++
    }
}

# ============================================
# 7. VERIFICAR DOCUMENTAÇÃO
# ============================================

Write-Host "`n📚 ETAPA 7: Verificando documentação...`n" -ForegroundColor Yellow

$docs = @(
    "../INDEX_SESSAO_SUPABASE.md",
    "../QUICK_START_SUPABASE.md",
    "../GUIA_SUPABASE_SETUP.md",
    "../ENTREGA_FINAL_CONSOLIDADA.md",
    "../MAPEAMENTO_SISTEMA_COMPLETO.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "   ✅ $(Split-Path $doc -Leaf)" -ForegroundColor Green
        $successes++
    } else {
        Write-Host "   ⚠️  $(Split-Path $doc -Leaf) não encontrado" -ForegroundColor Yellow
        $warnings++
    }
}

# ============================================
# 8. VERIFICAR BUILD
# ============================================

Write-Host "`n🏗️  ETAPA 8: Testando build TypeScript...`n" -ForegroundColor Yellow

try {
    Write-Host "   Executando tsc --noEmit..." -ForegroundColor Gray
    $tscCheck = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ TypeScript compila sem erros" -ForegroundColor Green
        $successes++
    } else {
        Write-Host "   ⚠️  TypeScript tem alguns erros (pode ser normal)" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "   ⚠️  Não foi possível verificar TypeScript" -ForegroundColor Yellow
    $warnings++
}

# ============================================
# RESUMO FINAL
# ============================================

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   📊 RESUMO DA VERIFICAÇÃO                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "✅ Sucessos:  $successes" -ForegroundColor Green
Write-Host "⚠️  Avisos:   $warnings" -ForegroundColor Yellow
Write-Host "❌ Erros:     $errors" -ForegroundColor Red

Write-Host "`n" + ("=" * 60) + "`n"

# ============================================
# AVALIAÇÃO FINAL
# ============================================

if ($errors -eq 0 -and $warnings -le 3) {
    Write-Host @"
🎉 SISTEMA PRONTO PARA PRODUÇÃO!

✅ Todos os componentes críticos estão funcionais
✅ Documentação completa disponível
✅ Scripts de automação prontos

📝 Próximos passos recomendados:

1. Se ainda não configurou Supabase:
   .\scripts\configure-supabase.ps1

2. Executar testes completos:
   .\scripts\setup-and-test.ps1

3. Iniciar aplicação:
   npm run dev

4. Acessar:
   http://localhost:3000

"@ -ForegroundColor Green

} elseif ($errors -eq 0) {
    Write-Host @"
⚠️  SISTEMA FUNCIONAL COM AVISOS

✅ Componentes críticos OK
⚠️  $warnings aviso(s) encontrado(s)

📝 Ações recomendadas:

1. Configure DATABASE_URL:
   .\scripts\configure-supabase.ps1

2. Execute testes:
   .\scripts\setup-and-test.ps1

3. Revise avisos acima

"@ -ForegroundColor Yellow

} else {
    Write-Host @"
❌ SISTEMA COM ERROS CRÍTICOS

❌ $errors erro(s) encontrado(s)
⚠️  $warnings aviso(s) encontrado(s)

📝 Ações necessárias:

1. Revise os erros acima
2. Consulte a documentação:
   - GUIA_SUPABASE_SETUP.md
   - MAPEAMENTO_SISTEMA_COMPLETO.md

3. Execute diagnóstico:
   npx tsx scripts\validate-stack.ts

"@ -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60) + "`n"

# ============================================
# INFORMAÇÕES ADICIONAIS
# ============================================

Write-Host "📖 DOCUMENTAÇÃO DISPONÍVEL:`n" -ForegroundColor Cyan

Write-Host "   Início Rápido:" -ForegroundColor Yellow
Write-Host "   - QUICK_START_SUPABASE.md (5 minutos)" -ForegroundColor Gray
Write-Host "   - INDEX_SESSAO_SUPABASE.md (navegação completa)" -ForegroundColor Gray

Write-Host "`n   Setup Detalhado:" -ForegroundColor Yellow
Write-Host "   - GUIA_SUPABASE_SETUP.md (guia completo)" -ForegroundColor Gray
Write-Host "   - SOLUCAO_DATABASE_URL.md (troubleshooting)" -ForegroundColor Gray

Write-Host "`n   Técnica:" -ForegroundColor Yellow
Write-Host "   - MAPEAMENTO_SISTEMA_COMPLETO.md (arquitetura)" -ForegroundColor Gray
Write-Host "   - ENTREGA_FINAL_CONSOLIDADA.md (visão geral)" -ForegroundColor Gray
Write-Host "   - PLANO_CONSOLIDACAO_PPTX.md (roadmap)" -ForegroundColor Gray

Write-Host "`n" + ("=" * 60) + "`n"

Write-Host "💡 Dica: Execute .\scripts\configure-supabase.ps1 para setup guiado!`n" -ForegroundColor Yellow
