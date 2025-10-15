# 🔍 DIAGNÓSTICO - ERRO 500 PERSISTENTE

**Data:** 11 de outubro de 2025, 01:30 AM  
**Status:** 🔴 EM INVESTIGAÇÃO  

---

## 📊 SITUAÇÃO ATUAL

### ✅ O que JÁ FOI corrigido:

1. **Loop infinito de popup** ✅
2. **Erro 500 - Banco de dados (PostgreSQL → SQLite)** ✅
3. **Erro 404 - Servidor reiniciado** ✅
4. **Erros de TypeScript**:
   - Buffer → Uint8Array ✅
   - notes removido ✅
   - layout removido ✅
   - animations removido ✅
   - images removido ✅
   - Notificações (image, actions, timestamp) ✅

### ❌ O que AINDA falha:

**Erro 500 no upload de PPTX**
```
POST http://localhost:3000/api/pptx/upload 500 (Internal Server Error)
Upload failed: Error: Failed to process PPTX file
```

---

## 🔍 ONDE ESTÁ O ERRO?

### Código Cliente (Frontend): ✅ CORRETO
- `production-pptx-upload.tsx` está funcionando
- Request é enviado corretamente
- Erro handling está correto

### Código TypeScript: ✅ CORRETO
- Sem erros de compilação
- Todos os tipos ajustados

### Código Servidor (API): ⚠️ RUNTIME ERROR
- O código compila sem erros
- Erro acontece durante execução
- Erro é capturado no `catch` da API

---

## 🎯 O ERRO REAL ESTÁ NOS LOGS DO SERVIDOR

### Por que precisamos dos logs?

O código tem este tratamento de erro:

```typescript
} catch (error) {
  console.error('[PPTX Upload] Error:', error);  // ← ESTE LOG TEM A RESPOSTA!
  
  return NextResponse.json(
    {
      error: 'Failed to process PPTX file',
      details: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 }
  );
}
```

**O `console.error` mostra:**
- Qual função causou o erro
- Qual linha do código falhou
- Qual foi o erro exato (Prisma? Parser? File System?)

---

## 📋 COMO OBTER OS LOGS

### Passo 1: Localize a janela do servidor

Há uma janela PowerShell aberta com:
```
> npm run dev
   ▲ Next.js 14.2.28
   - Local:        http://localhost:3000
   - ready in 2.3s
```

### Passo 2: Faça o upload novamente

1. Acesse: http://localhost:3000/pptx-production
2. Selecione um arquivo PPTX
3. Clique em Upload

### Passo 3: Veja a mensagem de erro

**Imediatamente após o upload**, a janela do servidor mostrará:

```
[PPTX Upload] Error: [MENSAGEM DE ERRO AQUI]
    at [FUNÇÃO] ([ARQUIVO]:linha:coluna)
    at async [OUTRA FUNÇÃO] ([ARQUIVO]:linha:coluna)
```

### Passo 4: Copie TODA a mensagem

Selecione desde `[PPTX Upload] Error:` até o final do stack trace.

---

## 🔮 ERROS POSSÍVEIS (Hipóteses)

### Hipótese 1: Erro no PPTXParser
```
Error: Cannot read property 'slides' of undefined
```
**Causa:** Parser não conseguiu processar o PPTX  
**Solução:** Verificar formato do arquivo

### Hipótese 2: Erro no Prisma
```
PrismaClientKnownRequestError: Invalid `db.project.create()` invocation
```
**Causa:** Campo obrigatório faltando no schema  
**Solução:** Ajustar dados enviados ao Prisma

### Hipótese 3: Erro de File System
```
Error: ENOENT: no such file or directory, mkdir 'temp/projects/...'
```
**Causa:** Não consegue criar diretórios  
**Solução:** Verificar permissões ou criar manualmente

### Hipótese 4: Erro de Memória
```
Error: JavaScript heap out of memory
```
**Causa:** Arquivo PPTX muito grande  
**Solução:** Aumentar limite de memória do Node.js

---

## 🛠️ AÇÕES BASEADAS EM CADA ERRO

### Se o erro for: `slides is undefined`

```typescript
// Adicionar validação:
if (!pptxData || !pptxData.slides) {
  return NextResponse.json(
    { error: 'Failed to extract slides from PPTX' },
    { status: 400 }
  );
}
```

### Se o erro for: `Prisma validation error`

```typescript
// Verificar campos obrigatórios:
const project = await db.project.create({
  data: {
    name: projectName || file.name,
    userId: user.id,  // ← Pode estar faltando
    status: 'draft',  // ← Pode estar faltando
    // ...
  }
});
```

### Se o erro for: `Directory not found`

```powershell
# Criar diretório manualmente:
mkdir C:\xampp\htdocs\_MVP_Video_TecnicoCursos_v7\estudio_ia_videos\app\temp\projects
```

### Se o erro for: `Out of memory`

```powershell
# Aumentar memória do Node.js:
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

---

## 📝 TEMPLATE PARA REPORTAR O ERRO

Copie este template e preencha:

```
🔴 LOGS DO SERVIDOR:

[Cole aqui TODA a mensagem de erro da janela PowerShell]

---

ℹ️ INFORMAÇÕES ADICIONAIS:

1. Tamanho do arquivo PPTX: [X] MB
2. Número de slides: [X] slides
3. Formato: .pptx ou .ppt?
4. Erro aparece sempre ou às vezes?
5. Já funcionou antes ou nunca funcionou?
```

---

## 🎯 PRÓXIMOS PASSOS

1. ⏳ **Aguarde** o servidor recompilar (~10s)
2. 🔄 **Recarregue** http://localhost:3000/pptx-production
3. 📤 **Faça upload** de um PPTX pequeno (teste)
4. 👀 **Veja** a janela do servidor PowerShell
5. 📋 **Copie** a mensagem de erro COMPLETA
6. 📢 **Cole** aqui para continuarmos

---

## 💡 DICA IMPORTANTE

**Sem os logs do servidor, não podemos continuar!**

O erro 500 é genérico. O log do servidor tem o erro **específico** que precisamos corrigir.

É como ir ao médico e dizer "estou doente" sem falar os sintomas. Precisamos dos "sintomas" (logs) para dar o "diagnóstico" (solução).

---

**Criado em:** 11 de outubro de 2025, 01:30 AM  
**Aguardando:** Logs do servidor do usuário
