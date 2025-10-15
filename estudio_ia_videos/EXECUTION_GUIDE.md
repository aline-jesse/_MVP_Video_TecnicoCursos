# 🚀 GUIA DE EXECUÇÃO RÁPIDA
## PPTX Advanced Features v2.1

**Data:** 7 de Outubro de 2025  
**Versão:** 2.1.0

---

## ⚡ INÍCIO RÁPIDO (2 MINUTOS)

### Opção 1: Script Automatizado (Recomendado)

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app

# Executar script de setup e testes
.\scripts\setup-and-test.ps1
```

**O que o script faz:**
1. ✅ Verifica ambiente (.env, node_modules)
2. ✅ Gera cliente Prisma
3. ✅ Executa migração do banco
4. ✅ Roda suite completa de testes
5. ✅ Mostra próximos passos

---

### Opção 2: Passo a Passo Manual

```powershell
cd C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app

# 1. Instalar dependências (se necessário)
npm install

# 2. Gerar cliente Prisma
npx prisma generate

# 3. Executar migração
npx prisma migrate dev --name add_pptx_batch_models

# 4. Executar testes
npx tsx scripts/test-pptx-advanced.ts

# 5. Iniciar servidor
npm run dev
```

---

## 🧪 EXECUTAR TESTES

### Suite Completa de Testes (TypeScript)

```powershell
cd app
npx tsx scripts/test-pptx-advanced.ts
```

**Testes incluídos:**
- ✅ Teste 1: Database Service (Prisma)
- ✅ Teste 2: Layout Analyzer
- ✅ Teste 3: Animation Converter
- ✅ Teste 4: Auto Narration Service
- ✅ Teste 5: Integração Completa

**Saída esperada:**
```
🧪 PPTX ADVANCED FEATURES v2.1 - SUITE DE TESTES COMPLETA
================================================================================

📦 TESTE 1: Database Service (Prisma)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️  Criando batch job...
✅ Batch job criado: clxxx...
✅ Job 1 criado: clyyy...
✅ TESTE 1 CONCLUÍDO COM SUCESSO!

🔍 TESTE 2: Layout Analyzer
...

🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!
```

---

### Testes Jest (Unitários)

```powershell
cd app
npm test __tests__/lib/pptx/pptx-advanced-features.test.ts
```

**22 testes automatizados:**
- 6 testes: Auto Narration Service
- 6 testes: Animation Converter
- 7 testes: Layout Analyzer
- 3 testes: Batch Processor

---

## 💾 VISUALIZAR BANCO DE DADOS

```powershell
cd app
npx prisma studio
```

**Abre interface web em:** `http://localhost:5555`

**Tabelas para verificar:**
- `PPTXBatchJob` - Batch jobs de processamento
- `PPTXProcessingJob` - Jobs individuais
- `Project` - Projetos associados

---

## 🌐 TESTAR API

### 1. Iniciar Servidor

```powershell
cd app
npm run dev
```

**Servidor disponível em:** `http://localhost:3000`

---

### 2. Testar Endpoint POST

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/pptx/process-advanced \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file0=@test.pptx" \
  -F "file1=@test2.pptx" \
  -F "batchName=Teste Manual" \
  -F "generateNarration=true" \
  -F "analyzeQuality=true" \
  -F "maxConcurrent=2"
```

**PowerShell:**
```powershell
$files = @{
    file0 = Get-Item "test.pptx"
    file1 = Get-Item "test2.pptx"
}

$params = @{
    batchName = "Teste Manual"
    generateNarration = "true"
    analyzeQuality = "true"
    maxConcurrent = "2"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/pptx/process-advanced" `
    -Method POST `
    -Headers @{ Authorization = "Bearer YOUR_TOKEN" } `
    -Form (@{} + $files + $params)
```

---

### 3. Obter Status

```bash
# Status de batch job específico
GET http://localhost:3000/api/v1/pptx/process-advanced?batchJobId=batch_abc123

# Listar todos os batch jobs
GET http://localhost:3000/api/v1/pptx/process-advanced
```

---

### 4. Cancelar Job

```bash
DELETE http://localhost:3000/api/v1/pptx/process-advanced?batchJobId=batch_abc123
```

---

## 📊 MONITORAR LOGS

### Logs da Aplicação

```powershell
# No terminal onde npm run dev está rodando
# Você verá:
📦 Recebendo requisição de processamento avançado de PPTX...
📁 15 arquivo(s) recebido(s)
⚙️ Opções: { generateNarration: true, ... }
💾 Criando batch job no banco de dados...
✅ Batch job criado: batch_xyz
📊 DB atualizado: 1/15 - file1.pptx (45%)
✅ Processamento em lote concluído
```

---

### Logs do Banco de Dados

```powershell
# Ver queries executadas
$env:DEBUG = "prisma:query"
npm run dev

# Ou verificar diretamente no Prisma Studio
npx prisma studio
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Prisma Client not found"

**Solução:**
```powershell
npx prisma generate
```

---

### Problema: "Migration failed"

**Solução:**
```powershell
# Verificar DATABASE_URL no .env.local
cat .env.local | Select-String "DATABASE_URL"

# Resetar banco (CUIDADO: apaga dados!)
npx prisma migrate reset

# Ou aplicar manualmente
npx prisma db push
```

---

### Problema: "Testes falhando"

**Solução:**
```powershell
# 1. Verificar se migração foi executada
npx prisma migrate status

# 2. Limpar cache
Remove-Item -Recurse -Force node_modules\.cache

# 3. Reinstalar
npm install

# 4. Gerar cliente novamente
npx prisma generate
```

---

### Problema: "API retorna 401 Unauthorized"

**Solução:**
```powershell
# Verificar autenticação no código
# Por enquanto, remover middleware de auth para testes

# Ou obter token válido
# Ver documentação de autenticação do projeto
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

### Documentos Disponíveis

1. **INDEX_PPTX_DOCS.md** - Índice de toda documentação
2. **QUICK_START_PPTX.md** - Guia rápido (5 minutos)
3. **PPTX_ADVANCED_FEATURES.md** - Documentação técnica (50+ páginas)
4. **PPTX_PRISMA_INTEGRATION.md** - Integração com banco de dados
5. **PPTX_FINAL_DELIVERY.md** - Entrega final completa
6. **EXECUTION_GUIDE.md** - Este guia

### Navegação Rápida

```powershell
# Ver índice de documentação
code ..\..\..\INDEX_PPTX_DOCS.md

# Quick Start
code ..\..\..\QUICK_START_PPTX.md

# Documentação técnica completa
code ..\..\..\PPTX_ADVANCED_FEATURES.md
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Antes de usar em produção

- [ ] Migração executada com sucesso
- [ ] Testes TypeScript passando (5/5)
- [ ] Testes Jest passando (22/22)
- [ ] API respondendo corretamente
- [ ] Banco de dados persistindo dados
- [ ] Variáveis de ambiente configuradas:
  - [ ] `DATABASE_URL`
  - [ ] `AZURE_TTS_KEY` ou `ELEVENLABS_API_KEY`
  - [ ] `AWS_S3_BUCKET` e credenciais
- [ ] Upload de arquivo PPTX real testado
- [ ] Progresso em tempo real funcionando
- [ ] Qualidade de código validada

---

## 🚀 DEPLOY

### Staging

```powershell
# Build
npm run build

# Migração de produção
npx prisma migrate deploy

# Iniciar
npm start
```

### Produção

```powershell
# Variáveis de ambiente
# DATABASE_URL=postgresql://...
# AZURE_TTS_KEY=...
# AWS_S3_BUCKET=...

# Deploy (exemplo Vercel)
vercel --prod

# Ou Docker
docker build -t pptx-api .
docker run -p 3000:3000 pptx-api
```

---

## 📞 SUPORTE

### Recursos

- 📖 [Documentação Completa](../../../INDEX_PPTX_DOCS.md)
- 🐛 [Troubleshooting](../../../PPTX_ADVANCED_FEATURES.md#troubleshooting)
- 💡 [Dicas Rápidas](../../../QUICK_START_PPTX.md#dicas-rápidas)

### Contato

- 📧 Email: suporte@estudioiavideos.com
- 💬 Slack: #pptx-support
- 🐛 Issues: GitHub Issues

---

## 🎉 TUDO PRONTO!

Execute o script de setup e comece a usar:

```powershell
.\scripts\setup-and-test.ps1
```

**Boa sorte! 🚀**
