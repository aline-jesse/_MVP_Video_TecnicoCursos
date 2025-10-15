# 🧪 Script de Setup e Teste - PPTX Advanced Features v2.1
# 
# Este script executa:
# 1. Migração do Prisma
# 2. Testes completos de todas as funcionalidades
# 3. Validação da integração

Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 79 -ForegroundColor Cyan
Write-Host "🚀 PPTX ADVANCED FEATURES v2.1 - SETUP E TESTES" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "`n"

# Navegar para o diretório app
Set-Location -Path "C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app"

# ============================================================================
# ETAPA 1: VERIFICAR AMBIENTE
# ============================================================================

Write-Host "📋 ETAPA 1: Verificando ambiente..." -ForegroundColor Yellow
Write-Host ""

# Verificar se .env.local existe
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env.local não encontrado" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "   💡 Copiando .env.example para .env.local..." -ForegroundColor Cyan
        Copy-Item ".env.example" ".env.local"
        Write-Host "   ✅ .env.local criado - Configure suas credenciais!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ ERRO: .env.example não encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Verificar node_modules
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  node_modules não encontrado" -ForegroundColor Yellow
    Write-Host "   📦 Instalando dependências..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependências instaladas" -ForegroundColor Green
    } else {
        Write-Host "   ❌ ERRO: Falha ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n"

# ============================================================================
# ETAPA 2: GERAR CLIENTE PRISMA
# ============================================================================

Write-Host "🔧 ETAPA 2: Gerando cliente Prisma..." -ForegroundColor Yellow
Write-Host ""

npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Cliente Prisma gerado com sucesso" -ForegroundColor Green
} else {
    Write-Host "   ❌ ERRO: Falha ao gerar cliente Prisma!" -ForegroundColor Red
    exit 1
}

Write-Host "`n"

# ============================================================================
# ETAPA 3: EXECUTAR MIGRAÇÃO
# ============================================================================

Write-Host "💾 ETAPA 3: Executando migração do banco de dados..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   ⚠️  Esta operação irá criar/atualizar as tabelas no banco de dados" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "   Deseja continuar? (S/N)"

if ($response -eq "S" -or $response -eq "s") {
    npx prisma migrate dev --name add_pptx_batch_models
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Migração executada com sucesso" -ForegroundColor Green
    } else {
        Write-Host "   ❌ ERRO: Falha na migração!" -ForegroundColor Red
        Write-Host "   💡 Verifique se o DATABASE_URL está correto no .env.local" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "   ⏭️  Migração pulada" -ForegroundColor Yellow
    Write-Host "   ⚠️  Os testes podem falhar sem a migração!" -ForegroundColor Red
}

Write-Host "`n"

# ============================================================================
# ETAPA 4: EXECUTAR TESTES
# ============================================================================

Write-Host "🧪 ETAPA 4: Executando testes..." -ForegroundColor Yellow
Write-Host ""

$runTests = Read-Host "   Deseja executar os testes agora? (S/N)"

if ($runTests -eq "S" -or $runTests -eq "s") {
    Write-Host ""
    Write-Host "   📝 Compilando TypeScript..." -ForegroundColor Cyan
    
    # Compilar o script de teste
    npx tsx scripts/test-pptx-advanced.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n   ✅ Todos os testes passaram!" -ForegroundColor Green
    } else {
        Write-Host "`n   ❌ Alguns testes falharam" -ForegroundColor Red
        Write-Host "   💡 Verifique os logs acima para detalhes" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ⏭️  Testes pulados" -ForegroundColor Yellow
    Write-Host "   💡 Execute manualmente com: npx tsx scripts/test-pptx-advanced.ts" -ForegroundColor Cyan
}

Write-Host "`n"

# ============================================================================
# ETAPA 5: RESUMO E PRÓXIMOS PASSOS
# ============================================================================

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "✅ SETUP CONCLUÍDO!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Visualizar banco de dados:" -ForegroundColor Cyan
Write-Host "      npx prisma studio" -ForegroundColor White
Write-Host ""
Write-Host "   2. Iniciar servidor de desenvolvimento:" -ForegroundColor Cyan
Write-Host "      npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   3. Testar API manualmente:" -ForegroundColor Cyan
Write-Host "      POST http://localhost:3000/api/v1/pptx/process-advanced" -ForegroundColor White
Write-Host ""
Write-Host "   4. Executar testes Jest:" -ForegroundColor Cyan
Write-Host "      npm test __tests__/lib/pptx/pptx-advanced-features.test.ts" -ForegroundColor White
Write-Host ""
Write-Host "   5. Ler documentação:" -ForegroundColor Cyan
Write-Host "      Ver INDEX_PPTX_DOCS.md ou QUICK_START_PPTX.md" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Pronto para uso! " -ForegroundColor Green -NoNewline
Write-Host "Boa sorte! 🚀`n" -ForegroundColor Yellow
