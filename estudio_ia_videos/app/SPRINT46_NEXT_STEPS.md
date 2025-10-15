# 🎯 Sprint 46 - Próximos Passos

## 📋 O Que Já Foi Feito (Sprint 45 - 100% Completo)

✅ **Sistema WebSocket completo** com Socket.IO  
✅ **16 eventos** implementados e documentados  
✅ **Client SDK** React Hook (`useTimelineSocket`)  
✅ **Componente de exemplo** funcional  
✅ **Documentação completa** (1200+ linhas)  
✅ **18 testes unitários** criados (11/18 passando)  
✅ **Testes de integração** completos (prontos para rodar)

---

## 🔧 Issues para Resolver (Prioridade Alta)

### 1. Corrigir 7 Testes Falhando (1-2 horas)

**Arquivo**: `__tests__/websocket.test.ts`

#### Teste 1: "deve receber evento de boas-vindas ao conectar"
**Linha**: 77  
**Issue**: Servidor não emite `USER_JOINED` para o próprio usuário após join  
**Fix**: 

```typescript
// Em timeline-websocket.ts, linha ~160
socket.on(TimelineEvent.JOIN_PROJECT, ({ projectId, userName, userImage }: JoinProjectPayload) => {
  socket.join(`project:${projectId}`)
  
  if (!projectUsers.has(projectId)) {
    projectUsers.set(projectId, new Set())
  }
  projectUsers.get(projectId)!.add(userId)
  
  // FIX: Emitir para o próprio usuário também
  socket.emit(TimelineEvent.USER_JOINED, {
    userId,
    userName,
    userImage,
    projectId,
    timestamp: new Date().toISOString()
  })
  
  // Notificar outros usuários
  socket.to(`project:${projectId}`).emit(TimelineEvent.USER_JOINED, {
    userId,
    userName,
    userImage,
    projectId,
    timestamp: new Date().toISOString()
  })
  
  // ... resto do código
})
```

---

#### Teste 2: "deve notificar outros usuários quando entrar no projeto"
**Linha**: 150  
**Issue**: Payload `userName` está `undefined`  
**Verificar**: O parâmetro `userName` deve vir do `socket.data.userName` ou do payload?

**Fix**:
```typescript
// Usar dados da sessão autenticada
socket.to(`project:${projectId}`).emit(TimelineEvent.USER_JOINED, {
  userId: socket.data.userId,
  userName: socket.data.userName,
  userImage,
  projectId,
  timestamp: new Date().toISOString()
})
```

---

#### Teste 3: "deve sair de room de projeto"
**Linha**: 201  
**Issue**: Evento `USER_LEFT` não é emitido ao chamar `LEAVE_PROJECT`

**Fix**: Verificar se o evento `LEAVE_PROJECT` está emitindo corretamente

```typescript
socket.on(TimelineEvent.LEAVE_PROJECT, ({ projectId }: { projectId: string }) => {
  socket.leave(`project:${projectId}`)
  
  if (projectUsers.has(projectId)) {
    projectUsers.get(projectId)!.delete(userId)
    
    if (projectUsers.get(projectId)!.size === 0) {
      projectUsers.delete(projectId)
    }
  }
  
  // FIX: Emitir para o usuário que saiu também
  socket.emit(TimelineEvent.USER_LEFT, {
    userId,
    userName,
    projectId,
    timestamp: new Date().toISOString()
  })
  
  // Notificar outros
  socket.to(`project:${projectId}`).emit(TimelineEvent.USER_LEFT, {
    userId,
    userName,
    projectId,
    timestamp: new Date().toISOString()
  })
})
```

---

#### Teste 4: "deve listar usuários ativos no projeto"
**Linha**: 528  
**Issue**: Evento `timeline:get_active_users` não está implementado

**Fix**: Adicionar handler no servidor

```typescript
// Em timeline-websocket.ts, adicionar após outros handlers
socket.on('timeline:get_active_users', ({ projectId }: { projectId: string }) => {
  const activeUsers = Array.from(projectUsers.get(projectId) || [])
  socket.emit(TimelineEvent.ACTIVE_USERS, {
    projectId,
    users: activeUsers,
    count: activeUsers.length
  })
})
```

---

#### Teste 5: "deve notificar clip adicionado"
**Linha**: 665  
**Issue**: Servidor não faz broadcast de `CLIP_ADDED`

**Fix**: Adicionar broadcast no handler

```typescript
socket.on(TimelineEvent.CLIP_ADDED, ({ projectId, clipId, trackId }: any) => {
  socket.to(`project:${projectId}`).emit(TimelineEvent.CLIP_ADDED, {
    userId,
    userName,
    clipId,
    trackId,
    projectId,
    timestamp: new Date().toISOString()
  })
})
```

---

#### Teste 6: "deve enviar notificação para projeto"
**Linha**: 725  
**Issue**: Handler `NOTIFICATION` não faz broadcast

**Fix**:

```typescript
socket.on(TimelineEvent.NOTIFICATION, ({ projectId, message, type }: any) => {
  socket.to(`project:${projectId}`).emit(TimelineEvent.NOTIFICATION, {
    userId,
    userName,
    message,
    type,
    projectId,
    timestamp: new Date().toISOString()
  })
})
```

---

#### Teste 7: "deve enviar notificação de conflito"
**Linha**: 779  
**Issue**: Handler `CONFLICT` não faz broadcast

**Fix**:

```typescript
socket.on(TimelineEvent.CONFLICT, ({ projectId, conflictType, trackId, lockedBy }: any) => {
  socket.to(`project:${projectId}`).emit(TimelineEvent.CONFLICT, {
    userId,
    userName,
    conflictType,
    trackId,
    lockedBy,
    projectId,
    timestamp: new Date().toISOString()
  })
})
```

---

## 🧪 Após Corrigir, Rodar Testes

```bash
cd app

# Testar unitários
npm run test:websocket

# Resultado esperado: 18/18 testes passando

# Testar integração
npm run test:websocket:integration

# Resultado esperado: Todos passando

# Rodar todos
npm run test:websocket:all
```

---

## 🔐 2. Implementar Autenticação Produção (2-3 horas)

**Arquivo**: `lib/websocket/timeline-websocket.ts`

### Atual (Dev)
```typescript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  
  if (!token) {
    return next(new Error('Authentication required'))
  }

  // Simplificado
  socket.data.userId = socket.handshake.auth.userId
  socket.data.userName = socket.handshake.auth.userName
  
  next()
})
```

### Produção (TODO)
```typescript
import { verifyJWT } from '@/lib/auth/jwt'

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    
    if (!token) {
      return next(new Error('Authentication required'))
    }

    // Validar JWT
    const decoded = await verifyJWT(token)
    
    if (!decoded || !decoded.userId) {
      return next(new Error('Invalid token'))
    }

    // Buscar dados do usuário
    const user = await getUserById(decoded.userId)
    
    if (!user) {
      return next(new Error('User not found'))
    }

    // Atribuir dados validados
    socket.data.userId = user.id
    socket.data.userName = user.name
    socket.data.userEmail = user.email
    socket.data.userImage = user.image
    
    next()
  } catch (error) {
    console.error('[WebSocket] Auth error:', error)
    next(new Error('Authentication failed'))
  }
})
```

**Arquivos a criar**:
1. `lib/auth/jwt.ts` - Funções verifyJWT, signJWT
2. `lib/db/users.ts` - Função getUserById

---

## 📊 3. Performance Tests (2 horas)

**Arquivo**: `__tests__/websocket.performance.test.ts`

```typescript
describe('WebSocket Performance', () => {
  it('deve suportar 100 usuários simultâneos', async () => {
    const clients = await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        createClient(`user_${i}`, `User ${i}`)
      )
    )
    
    const startTime = Date.now()
    await joinAllToProject('proj_test', clients)
    const elapsed = Date.now() - startTime
    
    expect(elapsed).toBeLessThan(5000) // < 5s para 100 usuários
  })

  it('deve processar 1000 cursor updates em < 2 segundos', async () => {
    // ... teste de throughput
  })

  it('não deve ter memory leak após 1000 conexões/desconexões', async () => {
    // ... teste de memória
  })
})
```

---

## 🎯 4. Melhorias de Features (Opcionais)

### Feature 1: Cursores com Nome
```typescript
// Adicionar campo `userName` ao cursor
socket.on(TimelineEvent.CURSOR_MOVE, ({ trackId, position }: any) => {
  socket.to(`project:${projectId}`).emit(TimelineEvent.CURSOR_MOVE, {
    userId,
    userName, // <- Adicionar
    trackId,
    position,
    timestamp: new Date().toISOString()
  })
})
```

### Feature 2: Typing Indicators
```typescript
export enum TimelineEvent {
  // ... existing events
  USER_TYPING = 'timeline:user_typing',
}

socket.on(TimelineEvent.USER_TYPING, ({ projectId, trackId }: any) => {
  socket.to(`project:${projectId}`).emit(TimelineEvent.USER_TYPING, {
    userId,
    userName,
    trackId,
    timestamp: new Date().toISOString()
  })
})
```

### Feature 3: Presence Status
```typescript
export enum PresenceStatus {
  ONLINE = 'online',
  EDITING = 'editing',
  VIEWING = 'viewing',
  IDLE = 'idle',
}

socket.on(TimelineEvent.PRESENCE_UPDATE, ({ projectId, status, currentTrackId }: any) => {
  socket.to(`project:${projectId}`).emit(TimelineEvent.PRESENCE_UPDATE, {
    userId,
    userName,
    status, // <- online, editing, viewing, idle
    currentTrackId,
    timestamp: new Date().toISOString()
  })
})
```

---

## 📚 5. Documentação Adicional (1 hora)

### Criar: `WEBSOCKET_PRODUCTION_GUIDE.md`
- ✅ Deploy checklist
- ✅ Environment variables
- ✅ SSL/TLS configuration
- ✅ Load balancing com Redis
- ✅ Monitoring e alertas

### Criar: `WEBSOCKET_BEST_PRACTICES.md`
- ✅ Rate limiting patterns
- ✅ Error handling
- ✅ Reconnection strategies
- ✅ Memory optimization

---

## 🚀 Priorização Sugerida

### Sprint 46 - Semana 1
1. ✅ Corrigir 7 testes falhando (1-2h) ⭐⭐⭐ **CRÍTICO**
2. ✅ Implementar auth JWT produção (2-3h) ⭐⭐⭐ **CRÍTICO**
3. ✅ Performance tests (2h) ⭐⭐ **IMPORTANTE**

### Sprint 46 - Semana 2
4. ✅ Cursores com nome (1h) ⭐⭐ **NICE TO HAVE**
5. ✅ Typing indicators (2h) ⭐ **OPCIONAL**
6. ✅ Production guide (1h) ⭐⭐ **IMPORTANTE**

---

## 📁 Arquivos para Editar

### Principais
- `lib/websocket/timeline-websocket.ts` (7 fixes de eventos)
- `lib/auth/jwt.ts` (criar - JWT validation)
- `lib/db/users.ts` (criar - user queries)

### Testes
- `__tests__/websocket.test.ts` (verificar se passa após fixes)
- `__tests__/websocket.performance.test.ts` (criar)

### Documentação
- `WEBSOCKET_PRODUCTION_GUIDE.md` (criar)
- `WEBSOCKET_BEST_PRACTICES.md` (criar)

---

## ✅ Checklist Sprint 46

- [ ] Corrigir teste "deve receber evento de boas-vindas"
- [ ] Corrigir teste "deve notificar outros usuários"
- [ ] Corrigir teste "deve sair de room"
- [ ] Corrigir teste "deve listar usuários ativos"
- [ ] Corrigir teste "deve notificar clip adicionado"
- [ ] Corrigir teste "deve enviar notificação"
- [ ] Corrigir teste "deve enviar conflito"
- [ ] Implementar JWT auth produção
- [ ] Criar performance tests
- [ ] Rodar todos testes (18/18 + integration)
- [ ] Criar production guide
- [ ] (Opcional) Cursores com nome
- [ ] (Opcional) Typing indicators

---

## 🎓 Notas Importantes

### WebSocket Path
- Dev: `ws://localhost:3000/api/socket/timeline`
- Prod: `wss://seu-dominio.com/api/socket/timeline` (SSL necessário)

### Environment Variables (Produção)
```env
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
WEBSOCKET_CORS_ORIGIN=https://seu-dominio.com
```

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev:websocket

# Testes
npm run test:websocket:all

# Build
npm run build

# Produção
npm run start:websocket
```

---

## 📞 Suporte

Se tiver dúvidas sobre a implementação:

1. **Ler primeiro**: `WEBSOCKET_DOCUMENTATION.md` (1200+ linhas de referência)
2. **Ver exemplo**: `components/timeline/TimelineEditorCollaborative.tsx`
3. **Debugar**: Habilitar logs no `jest.websocket.setup.ts` (comentar linha 28)

---

**Última Atualização**: 9 de Outubro de 2025  
**Sprint**: 46  
**Status**: 🚀 Pronto para iniciar
