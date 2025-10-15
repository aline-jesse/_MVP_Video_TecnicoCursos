# Guia de Instalação Completa - Supabase

Este guia irá te ajudar a configurar completamente o Supabase para o projeto, incluindo todas as tabelas, políticas de segurança e buckets de armazenamento.

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Variáveis de ambiente configuradas no arquivo `.env`

## 🚀 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Verifique se o arquivo `.env` contém todas as variáveis necessárias:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

### 2. Executar Scripts SQL

Execute os scripts na seguinte ordem no **SQL Editor** do Supabase:

#### 2.1. Schema Principal
```sql
-- Execute o conteúdo de: supabase/complete-schema.sql
```
Este script criará:
- ✅ Todas as tabelas necessárias
- ✅ Índices para performance
- ✅ Triggers para updated_at
- ✅ Função para criar perfil de usuário automaticamente

#### 2.2. Políticas de Segurança (RLS)
```sql
-- Execute o conteúdo de: supabase/rls-policies.sql
```
Este script configurará:
- ✅ Row Level Security em todas as tabelas
- ✅ Políticas de acesso baseadas em usuário
- ✅ Permissões para administradores

### 3. Configurar Storage

#### 3.1. Criar Buckets
No painel do Supabase, vá para **Storage** e crie os seguintes buckets:

| Bucket | Público | Descrição |
|--------|---------|-----------|
| `videos` | ❌ Não | Armazenamento de vídeos dos cursos |
| `thumbnails` | ✅ Sim | Miniaturas de cursos e vídeos |
| `avatars` | ✅ Sim | Avatares dos usuários |

#### 3.2. Configurar Políticas de Storage
```sql
-- Execute o conteúdo de: supabase/storage-setup.sql
```

### 4. Popular Dados de Exemplo (Opcional)

Para testar o sistema com dados de exemplo:

```sql
-- Execute o conteúdo de: supabase/sample-data.sql
```

Este script criará:
- ✅ Cursos NR (NR-12, NR-33, NR-35)
- ✅ Módulos de exemplo
- ✅ Funções para criar/limpar dados de teste
- ✅ Views para relatórios

### 5. Testar a Integração

#### 5.1. Teste via Interface Web
Acesse: `http://localhost:3000/supabase-test`

#### 5.2. Teste via API
Faça uma requisição GET para: `http://localhost:3000/api/supabase-test`

## 🔧 Configurações Adicionais

### Autenticação

O sistema suporta:
- ✅ Email/Senha
- ✅ OAuth (Google, GitHub)
- ✅ Recuperação de senha

### Funções Edge (Opcional)

Para funcionalidades avançadas, você pode criar Edge Functions:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Criar função
supabase functions new process-video
```

### Webhooks (Opcional)

Configure webhooks para:
- Processamento de vídeos
- Notificações em tempo real
- Sincronização de dados

## 📊 Monitoramento

### Métricas Importantes

1. **Uso de Storage**: Monitore o espaço usado pelos buckets
2. **Consultas**: Verifique queries lentas no painel
3. **Autenticação**: Monitore logins e registros

### Logs

Acesse os logs em:
- **Logs > API**: Para requisições da API
- **Logs > Auth**: Para autenticação
- **Logs > Database**: Para consultas SQL

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão
```
Error: Invalid API key
```
**Solução**: Verifique as variáveis de ambiente

#### 2. Erro de Permissão
```
Error: Row Level Security policy violation
```
**Solução**: Verifique se as políticas RLS foram aplicadas

#### 3. Erro de Storage
```
Error: Bucket not found
```
**Solução**: Verifique se os buckets foram criados

### Comandos Úteis

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar buckets
SELECT * FROM storage.buckets;
```

## 📚 Próximos Passos

1. **Backup**: Configure backups automáticos
2. **Monitoramento**: Configure alertas
3. **Performance**: Otimize consultas frequentes
4. **Segurança**: Revise políticas de acesso

## 🆘 Suporte

- **Documentação**: https://supabase.com/docs
- **Comunidade**: https://github.com/supabase/supabase/discussions
- **Status**: https://status.supabase.com

---

✅ **Instalação Completa!** 

Seu projeto agora está totalmente integrado com o Supabase e pronto para uso em produção.