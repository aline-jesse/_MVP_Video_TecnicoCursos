
# ✅ CHECKLIST DE TESTES MANUAIS - GO LIVE
# Estúdio IA de Vídeos

**Objetivo**: Validar manualmente todos os fluxos críticos do sistema após deploy em produção.  
**URL**: https://treinx.abacusai.app/  
**Executor**: [Seu Nome]  
**Data**: ___/___/2025

---

## 📋 INSTRUÇÕES GERAIS

1. Execute os testes **na ordem** apresentada
2. Marque ✅ ou ❌ em cada item
3. Se encontrar bug, anote na seção "BUGS ENCONTRADOS" no final
4. Tire screenshots de erros críticos
5. Tempo estimado total: **60-90 minutos**

---

## 1️⃣ AUTENTICAÇÃO & SSO (15 minutos)

### A. Signup (Criar Conta)
- [ ] Acesse https://treinx.abacusai.app/signup
- [ ] Preencha:
  - Email: teste.golive+[timestamp]@gmail.com
  - Nome: Usuario Teste
  - Senha: SenhaSegura123!
  - Confirmar senha: SenhaSegura123!
- [ ] Clique "Criar Conta"
- [ ] Aguarde redirecionamento para dashboard
- [ ] Verifique se nome aparece no header (canto superior direito)

**Resultado Esperado**: ✅ Conta criada, usuário logado, dashboard carregado

### B. Logout
- [ ] Clique no avatar/nome (canto superior direito)
- [ ] Clique "Sair" ou "Logout"
- [ ] Verifique redirecionamento para /login

**Resultado Esperado**: ✅ Usuário deslogado, sessão encerrada

### C. Login (Credenciais)
- [ ] Na tela de login, insira:
  - Email: [email criado no passo A]
  - Senha: SenhaSegura123!
- [ ] Clique "Entrar"
- [ ] Aguarde redirecionamento para dashboard

**Resultado Esperado**: ✅ Login bem-sucedido, dashboard carregado

### D. SSO Google (se configurado)
- [ ] Faça logout
- [ ] Na tela de login, clique "Continuar com Google"
- [ ] Selecione conta Google
- [ ] Autorize acesso
- [ ] Aguarde redirecionamento

**Resultado Esperado**: ✅ Login via Google funcional (ou botão desabilitado se não configurado)

### E. Reset de Senha (Opcional)
- [ ] Faça logout
- [ ] Clique "Esqueci minha senha"
- [ ] Digite email cadastrado
- [ ] Verifique recebimento de email
- [ ] Clique no link do email
- [ ] Defina nova senha

**Resultado Esperado**: ✅ Email recebido, senha alterada com sucesso

---

## 2️⃣ UPLOAD & PROCESSAMENTO PPTX (20 minutos)

### A. Upload de Arquivo
- [ ] Acesse dashboard (após login)
- [ ] Clique "Novo Projeto" ou "Upload PPTX"
- [ ] Selecione arquivo de teste: `/home/ubuntu/estudio_ia_videos/NR 11 – SEGURANÇA NA OPERAÇÃO DE EMPILHADEIRAS.pptx`
  - (Ou qualquer .pptx com 5-20 slides)
- [ ] Aguarde upload (barra de progresso deve aparecer)
- [ ] Verifique se projeto aparece na lista

**Resultado Esperado**: ✅ Upload 100%, projeto listado no dashboard

**Tempo de upload**: ______ segundos (anotar para referência)

### B. Processamento & Preview
- [ ] Clique no projeto recém-criado
- [ ] Aguarde processamento dos slides
- [ ] Verifique se slides aparecem em miniatura
- [ ] Clique em diferentes slides no painel lateral
- [ ] Verifique se preview muda no canvas central

**Resultado Esperado**: ✅ Todos os slides visíveis, navegação funcional

**Número de slides detectados**: ______ slides

### C. Edição de Metadados
- [ ] Clique no ícone de configurações/editar (⚙️ ou ✏️)
- [ ] Altere:
  - Título: "Teste GO LIVE - [Data]"
  - Descrição: "Validação manual pós-deploy"
- [ ] Salve alterações
- [ ] Volte ao dashboard
- [ ] Verifique se título foi atualizado na lista

**Resultado Esperado**: ✅ Metadados salvos e visíveis

---

## 3️⃣ EDITOR CANVAS (25 minutos)

### A. Abrir Editor
- [ ] Abra o projeto criado anteriormente
- [ ] Selecione o primeiro slide
- [ ] Aguarde carregamento do canvas

**Resultado Esperado**: ✅ Editor carregado, slide visível no canvas

### B. Adicionar Texto
- [ ] Clique em "Adicionar Texto" ou botão "T"
- [ ] Clique no canvas (centro)
- [ ] Digite: "Teste de Texto - GO LIVE"
- [ ] Pressione Enter ou clique fora

**Resultado Esperado**: ✅ Texto aparece no canvas

### C. Formatar Texto
- [ ] Selecione o texto criado (clique nele)
- [ ] Altere:
  - Fonte: Arial → Montserrat (ou outra disponível)
  - Tamanho: 24px
  - Cor: Vermelho (#FF0000)
  - Negrito: Ativado
- [ ] Verifique mudanças no canvas

**Resultado Esperado**: ✅ Formatação aplicada corretamente

### D. Mover & Redimensionar
- [ ] Arraste o texto para o canto superior direito
- [ ] Redimensione pelas bordas (handles)
- [ ] Verifique se movimentação é suave

**Resultado Esperado**: ✅ Movimentação e resize funcionais

### E. Adicionar Imagem
- [ ] Clique em "Adicionar Imagem" ou "Upload"
- [ ] Faça upload de uma imagem local (qualquer .jpg/.png)
- [ ] Aguarde upload
- [ ] Verifique se imagem aparece no canvas
- [ ] Redimensione e posicione

**Resultado Esperado**: ✅ Imagem adicionada e manipulável

### F. Undo/Redo
- [ ] Pressione Ctrl+Z (ou Cmd+Z no Mac)
- [ ] Verifique se última ação foi desfeita
- [ ] Pressione Ctrl+Shift+Z (Redo)
- [ ] Verifique se ação foi refeita

**Resultado Esperado**: ✅ Undo/Redo funcionando

### G. Salvar
- [ ] Clique em "Salvar" (ou Ctrl+S)
- [ ] Aguarde confirmação (toast/mensagem)
- [ ] Recarregue a página (F5)
- [ ] Verifique se alterações persistiram

**Resultado Esperado**: ✅ Alterações salvas, visíveis após reload

---

## 4️⃣ TEXT-TO-SPEECH (15 minutos)

### A. Abrir Painel TTS
- [ ] Selecione um slide no editor
- [ ] Clique em "Narração" ou ícone 🎙️
- [ ] Verifique se painel lateral abre

**Resultado Esperado**: ✅ Painel TTS aberto

### B. Escolher Voz
- [ ] No dropdown "Voz", selecione:
  - Provider: ElevenLabs (ou Azure se preferir)
  - Voz: "Matilda" (ou qualquer voz feminina)
  - Idioma: Português (Brasil)

**Resultado Esperado**: ✅ Voz selecionada

### C. Gerar Áudio
- [ ] No campo de texto, digite:
  ```
  Esta é uma demonstração do sistema de narração com inteligência artificial. 
  O texto está sendo convertido em áudio de alta qualidade.
  ```
- [ ] Clique "Gerar Áudio" ou botão play
- [ ] Aguarde processamento (pode levar 5-15s)

**Resultado Esperado**: ✅ Áudio gerado (barra de progresso/spinner)

**Tempo de geração**: ______ segundos

### D. Reproduzir Áudio
- [ ] Clique no botão play do player de áudio
- [ ] Ouça o áudio completo
- [ ] Verifique qualidade (inteligível, sem ruídos)

**Resultado Esperado**: ✅ Áudio reproduzido com sucesso

**Qualidade**: ⭐⭐⭐⭐⭐ (1-5 estrelas)

### E. Salvar Narração
- [ ] Clique "Adicionar ao Timeline" ou "Salvar Narração"
- [ ] Verifique se ícone de áudio aparece no slide

**Resultado Esperado**: ✅ Narração salva no projeto

---

## 5️⃣ RENDERIZAÇÃO DE VÍDEO (20 minutos)

### A. Iniciar Render
- [ ] Clique em "Renderizar Vídeo" ou botão 🎬
- [ ] Selecione configurações:
  - Resolução: 1920x1080 (Full HD)
  - FPS: 30
  - Qualidade: Alta
- [ ] Clique "Iniciar Renderização"

**Resultado Esperado**: ✅ Processo iniciado, modal/página de progresso aberta

### B. Acompanhar Progresso
- [ ] Observe barra de progresso
- [ ] Verifique se porcentagem aumenta
- [ ] Aguarde conclusão (pode levar 5-15 min)

**Tempo de renderização**: ______ minutos

**Resultado Esperado**: ✅ Render 100% concluído sem erros

### C. Download do Vídeo
- [ ] Clique "Baixar Vídeo" ou "Download"
- [ ] Salve arquivo .mp4 localmente
- [ ] Verifique tamanho do arquivo (> 0 bytes)

**Tamanho do arquivo**: ______ MB

**Resultado Esperado**: ✅ Download bem-sucedido

### D. Validar Vídeo
- [ ] Abra o arquivo .mp4 em player local (VLC, Windows Media Player, etc.)
- [ ] Verifique:
  - Vídeo reproduz
  - Áudio sincronizado com slides
  - Qualidade visual aceitável
  - Sem frames corrompidos

**Resultado Esperado**: ✅ Vídeo funcional e de qualidade

---

## 6️⃣ COLABORAÇÃO REAL-TIME (15 minutos)

> **Nota**: Requer 2 contas/navegadores diferentes (ou modo anônimo)

### A. Compartilhar Projeto
- [ ] No projeto aberto, clique "Compartilhar" ou ícone 👥
- [ ] Digite email de outro usuário (criar outra conta se necessário)
- [ ] Selecione permissão: "Editor" (pode editar)
- [ ] Clique "Enviar Convite"

**Resultado Esperado**: ✅ Convite enviado

### B. Aceitar Convite (Outro Usuário)
- [ ] Faça login com a segunda conta (outro navegador/aba anônima)
- [ ] Verifique notificação de convite
- [ ] Clique "Aceitar"
- [ ] Abra o projeto compartilhado

**Resultado Esperado**: ✅ Projeto acessível para colaborador

### C. Adicionar Comentário
- [ ] (Como colaborador) Selecione um slide
- [ ] Clique em "Comentários" ou ícone 💬
- [ ] Digite: "@Usuario Teste Precisa revisar este slide"
- [ ] Clique "Enviar"

**Resultado Esperado**: ✅ Comentário criado com @menção

### D. Notificação & Resposta (Primeiro Usuário)
- [ ] (Como dono) Verifique se notificação apareceu (sino 🔔)
- [ ] Abra painel de comentários
- [ ] Leia comentário do colaborador
- [ ] Responda: "Entendido, vou ajustar!"
- [ ] Clique "Resolver" no thread

**Resultado Esperado**: ✅ Notificação recebida, resposta enviada, thread resolvido

---

## 7️⃣ PWA MOBILE (10 minutos)

> **Nota**: Requer smartphone (iOS/Android)

### A. Acessar no Mobile
- [ ] Abra navegador no celular (Chrome/Safari)
- [ ] Acesse: https://treinx.abacusai.app/
- [ ] Faça login

**Resultado Esperado**: ✅ Site responsivo, usável em mobile

### B. Instalar PWA
- [ ] No Chrome: Menu (⋮) > "Adicionar à tela inicial"
- [ ] No Safari: Compartilhar > "Adicionar à Tela Inicial"
- [ ] Confirme instalação

**Resultado Esperado**: ✅ Ícone do app aparece na tela inicial

### C. Abrir App Instalado
- [ ] Toque no ícone do app na home screen
- [ ] Verifique se abre em modo fullscreen (sem barra do navegador)
- [ ] Navegue para dashboard

**Resultado Esperado**: ✅ App abre em modo standalone

### D. Modo Offline (Opcional)
- [ ] Ative modo avião no celular
- [ ] Tente abrir um projeto já carregado
- [ ] Verifique se conteúdo em cache aparece

**Resultado Esperado**: ✅ Conteúdo básico funciona offline (ou mensagem de "Sem conexão")

---

## 8️⃣ BILLING & PAGAMENTOS (10 minutos)

> **Nota**: Só funciona se Stripe estiver configurado

### A. Acessar Billing
- [ ] No dashboard, clique "Planos" ou "Billing"
- [ ] Verifique plano atual (deve ser "Free")

**Resultado Esperado**: ✅ Página de billing carregada

### B. Upgrade (Teste)
- [ ] Clique "Upgrade to Pro" ou botão similar
- [ ] Aguarde redirecionamento para checkout Stripe
- [ ] Preencha dados de teste:
  - Número: 4242 4242 4242 4242
  - Expiry: 12/34
  - CVC: 123
  - Nome: Teste GO LIVE
  - Email: teste@email.com
- [ ] Clique "Assinar" ou "Subscribe"

**Resultado Esperado**: ✅ Pagamento processado (modo teste)

### C. Verificar Upgrade
- [ ] Volte ao app (deve redirecionar automaticamente)
- [ ] Acesse novamente página de billing
- [ ] Verifique se plano mudou para "Pro"

**Resultado Esperado**: ✅ Plano atualizado para "Pro"

### D. Downgrade (Opcional)
- [ ] Clique "Cancelar Assinatura" ou "Voltar para Free"
- [ ] Confirme cancelamento
- [ ] Verifique se plano volta para "Free"

**Resultado Esperado**: ✅ Downgrade bem-sucedido

---

## 9️⃣ PERFORMANCE & RESPONSIVIDADE (5 minutos)

### A. Teste de Velocidade
- [ ] Abra DevTools (F12)
- [ ] Vá para aba "Network"
- [ ] Recarregue página inicial (Ctrl+R)
- [ ] Verifique tempo total de carregamento

**Tempo de carregamento**: ______ segundos

**Meta**: < 3s (bom), < 5s (aceitável)

### B. Responsividade Desktop
- [ ] Redimensione janela do navegador
- [ ] Teste larguras: 1920px, 1366px, 1024px
- [ ] Verifique se layout se adapta

**Resultado Esperado**: ✅ Layout responsivo em todas as larguras

### C. Console de Erros
- [ ] Abra DevTools > Console
- [ ] Navegue por diferentes páginas do app
- [ ] Verifique se há erros em vermelho

**Número de erros**: ______

**Meta**: 0 erros críticos

---

## 🐛 BUGS ENCONTRADOS

### Bug #1
**Severidade**: [ ] P0 (Crítico) [ ] P1 (Alto) [ ] P2 (Médio) [ ] P3 (Baixo)  
**Página/Funcionalidade**: ________________________________  
**Descrição**: 


**Passos para Reproduzir**:
1. 
2. 
3. 

**Resultado Esperado**: 

**Resultado Obtido**: 

**Screenshot**: (anexar se possível)

---

### Bug #2
**Severidade**: [ ] P0 (Crítico) [ ] P1 (Alto) [ ] P2 (Médio) [ ] P3 (Baixo)  
**Página/Funcionalidade**: ________________________________  
**Descrição**: 


**Passos para Reproduzir**:
1. 
2. 
3. 

---

### Bug #3
(Adicionar mais conforme necessário)

---

## 📊 RESUMO FINAL

### Estatísticas
- **Total de Testes**: 50+
- **Testes Passados**: ______ ✅
- **Testes Falhados**: ______ ❌
- **Taxa de Sucesso**: ______%
- **Tempo Total**: ______ minutos

### Classificação Geral
- [ ] 🟢 EXCELENTE (95-100% sucesso, 0 bugs P0/P1)
- [ ] 🟡 BOM (85-94% sucesso, bugs P2/P3 apenas)
- [ ] 🟠 ACEITÁVEL (70-84% sucesso, 1-2 bugs P1)
- [ ] 🔴 CRÍTICO (< 70% sucesso, bugs P0 presentes)

### Recomendação Final
- [ ] ✅ **APROVADO PARA PRODUÇÃO** - Sistema estável, pode receber tráfego real
- [ ] ⚠️ **APROVADO COM RESSALVAS** - Alguns bugs não-críticos, monitorar de perto
- [ ] ❌ **REPROVAR** - Bugs críticos impedem uso em produção

### Próximos Passos
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

---

## 📝 NOTAS ADICIONAIS

(Espaço para observações gerais, sugestões, feedbacks)









---

**Checklist concluído por**: ________________________________  
**Data de conclusão**: ____/____/2025  
**Assinatura**: ________________________________

---

## 📎 ANEXOS

- [ ] Screenshots de bugs anexados
- [ ] Vídeo da renderização teste salvo
- [ ] Logs de erros exportados (se houver)
- [ ] Relatório enviado para equipe

---

**Versão do Checklist**: v1.0.0  
**Última atualização**: 03/10/2025
