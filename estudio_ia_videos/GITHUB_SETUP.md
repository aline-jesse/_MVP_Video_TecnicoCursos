
# 🐙 GUIA COMPLETO: GITHUB SETUP

## 📋 **INSTRUÇÕES PASSO A PASSO**

### **1. CRIAR REPOSITÓRIO NO GITHUB**

1. **Acesse:** [github.com](https://github.com)
2. **Clique:** "New repository" (botão verde)
3. **Configure:**
   - **Repository name:** `estudio-ia-videos`
   - **Description:** `🎭 Sistema avançado para vídeos com IA - TTS real, avatares 3D, conversão PPTX`
   - **Visibility:** Public
   - **NÃO marcar:** README, .gitignore, license (já temos)
4. **Criar repositório**

### **2. OPÇÃO A: SCRIPT AUTOMÁTICO (RECOMENDADO)**

```bash
# Tornar o script executável
chmod +x deploy-to-github.sh

# Executar o script
./deploy-to-github.sh
```

O script irá:
- ✅ Solicitar seu username GitHub
- ✅ Configurar o remote automaticamente
- ✅ Fazer commit das mudanças
- ✅ Push para o GitHub
- ✅ Exibir o link do repositório

### **3. OPÇÃO B: COMANDOS MANUAIS**

```bash
# Substituir SEU_USUARIO pelo seu username real
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/estudio-ia-videos.git

# Verificar remote
git remote -v

# Push inicial
git push -u origin master

# Se der erro, tentar com force (primeira vez)
git push -u origin master --force
```

### **4. CONFIGURAÇÃO DE CREDENCIAIS (SE NECESSÁRIO)**

```bash
# Configurar nome e email (se não configurado)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Para autenticação HTTPS (recomendado: usar token)
# Gere um Personal Access Token no GitHub:
# Settings > Developer settings > Personal access tokens
```

---

## 🎯 **ESTRUTURA DO REPOSITÓRIO**

Quando enviado, seu repositório terá:

```
estudio-ia-videos/
├── 📁 app/                    # Aplicação Next.js
├── 📁 docs/                   # Documentação
├── 📁 public/                 # Assets públicos
├── 📄 README.md              # Documentação principal
├── 📄 .gitignore             # Arquivos ignorados
├── 📄 TALKING_PHOTO_REAL_*   # Documentação técnica
├── 📄 ANALISE_TECNICA_*      # Análises detalhadas
├── 📄 SPRINT*_CHANGELOG.md   # Histórico de changes
└── 🚀 deploy-to-github.sh    # Script de deploy
```

---

## ✅ **VERIFICAÇÃO DE SUCESSO**

Após o push, verifique:

1. **GitHub Repository:** `https://github.com/SEU_USUARIO/estudio-ia-videos`
2. **Arquivos presentes:** README.md, app/, docs/, etc.
3. **Commits visíveis:** Histórico de desenvolvimento
4. **Issues/Wiki:** Configurar se necessário

---

## 🚀 **DEPLOY AUTOMÁTICO (OPCIONAL)**

### **Vercel (Recomendado)**
1. Acesse [vercel.com](https://vercel.com)
2. Conecte com GitHub
3. Importe o repositório `estudio-ia-videos`
4. Deploy automático ativado!

### **Netlify**
1. Acesse [netlify.com](https://netlify.com)
2. "New site from Git" > GitHub
3. Selecione o repositório
4. Configure build: `cd app && yarn build`

---

## 📞 **SUPORTE**

Se encontrar problemas:

1. **Erro de autenticação:** Configure token GitHub
2. **Erro de push:** Use `--force` no primeiro push
3. **Repositório não existe:** Verifique se criou no GitHub
4. **Permissões:** Verifique se é owner/collaborator

---

## 🎉 **PARABÉNS!**

Seu **Estúdio IA de Vídeos** está agora no GitHub! 

**Próximos passos:**
- ⭐ Marque com estrela
- 📝 Configure GitHub Pages
- 🚀 Deploy em produção
- 🤝 Convide colaboradores
