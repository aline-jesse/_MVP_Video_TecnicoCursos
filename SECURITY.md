# Security Policy

## 🔒 Reporting a Vulnerability

Se você descobrir uma vulnerabilidade de segurança, **NÃO** abra uma issue pública.

Em vez disso, envie um email para: **security@tecnicocursos.com** (ou contato do responsável)

Inclua:
- Descrição detalhada da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Sugestões de correção (se houver)

Responderemos em até 48 horas.

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 7.x     | :white_check_mark: |
| < 7.0   | :x:                |

## 🔐 Security Best Practices

### Secrets Management
- **NUNCA** commite secrets no repositório
- Use variáveis de ambiente (`.env.local`)
- Rotacione API keys regularmente

### Dependencies
- Mantenha dependências atualizadas
- Execute `npm audit` regularmente
- Use `npm audit fix` quando possível

### Authentication
- Supabase RLS (Row Level Security) habilitado
- Tokens JWT com expiração curta
- Rate limiting nas APIs

### Data Protection
- Criptografia em trânsito (HTTPS)
- Criptografia em repouso (Supabase)
- Backup regular dos dados

## 🚨 Security Checklist

- [ ] Secrets não expostos no código
- [ ] RLS policies configuradas
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] Input validation em todas as entradas
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Audit logs habilitados

## 📞 Contact

Para questões de segurança urgentes, contate imediatamente a equipe de segurança.
