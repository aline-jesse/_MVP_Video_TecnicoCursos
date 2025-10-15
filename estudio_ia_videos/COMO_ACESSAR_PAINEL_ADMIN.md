
# 🔐 Como Acessar o Painel Admin

## 📋 Status Atual

✅ **Usuário Admin Criado**: Existe um usuário administrador no banco de dados
✅ **Painel Admin Implementado**: Interface completa de configurações
✅ **Verificação de Permissões**: Sistema de segurança funcionando
✅ **Servidor Rodando**: Aplicação disponível em http://localhost:3000

## 🚀 Como Fazer Login como Admin

### Método 1: Login Direto (Recomendado)
1. Acesse: http://localhost:3000
2. Clique em "Entrar" ou "Começar Agora"
3. Use as credenciais do administrador:
   - **Email**: `admin@estudio.ai`
   - **Senha**: `123456` (ou qualquer senha com 3+ caracteres)

### Método 2: Acessar Dashboard Primeiro
1. Faça login com qualquer email válido
2. Uma vez logado, se for admin, aparecerá o link "Painel Admin" no menu do usuário (canto superior direito)

## 🎛️ Acessando o Painel Admin

Após fazer login como admin:

1. **Via Menu do Usuário**:
   - Clique no avatar no canto superior direito
   - Selecione "Painel Admin"

2. **Via URL Direta**:
   - Acesse: http://localhost:3000/admin

## 🔧 Funcionalidades do Painel Admin

O painel oferece:

### 🎨 Identidade Visual
- Upload de logo personalizado
- Upload de favicon
- Personalização de cores primárias e secundárias
- Configuração de cores de fundo e texto

### 🏢 Informações Institucionais  
- Nome da empresa
- Subtítulo/slogan
- URL do site
- Email de suporte

### ⚙️ Configurações Avançadas
- Família de fonte
- Título do documento
- URLs de política de privacidade
- URLs de termos de serviço

### 📁 Gerenciamento
- Exportar configurações
- Importar configurações
- Preview em tempo real
- Backup automático

## 🐛 Troubleshooting

### Se não conseguir ver "Painel Admin" no menu:
1. Confirme que está logado com `admin@estudio.ai`
2. Verifique se aparece o ícone de Shield (escudo) no dropdown
3. Tente logout e login novamente

### Se tiver erro 403 (Acesso Negado):
- O sistema detectou que o usuário não é admin
- Confirme o email usado no login

### Se tiver erro 401 (Não Autorizado):
- Faça login novamente
- Limpe cookies do navegador se necessário

## 🆘 Suporte Técnico

### Verificar Status do Sistema
```bash
cd /home/ubuntu/estudio_ia_videos/app
yarn node -e "
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'admin@estudio.ai' } })
  .then(admin => console.log('Admin encontrado:', admin ? 'SIM' : 'NÃO'))
  .catch(e => console.error('Erro:', e.message))
  .finally(() => prisma.\$disconnect());
"
```

### Recriar Usuário Admin (se necessário)
```bash
cd /home/ubuntu/estudio_ia_videos/app
yarn prisma db seed
```

### Logs de Debug
```bash
cd /home/ubuntu/estudio_ia_videos/app
tail -f dev.log
```

## 🔄 Próximos Passos

1. **Primeira Configuração**: Personalize logo, cores e informações da empresa
2. **Teste Preview**: Use o painel de preview para ver as mudanças em tempo real
3. **Backup**: Exporte as configurações personalizadas
4. **Teste Completo**: Navegue pela aplicação para verificar se as personalizações foram aplicadas

---
**Documento criado em**: 25 de setembro de 2025
**Status**: Sistema funcionando ✅
**Versão**: Sprint 17 - Admin Panel Complete
