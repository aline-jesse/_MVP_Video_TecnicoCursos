# Sistema de Compliance NR Inteligente

## Visão Geral

O Sistema de Compliance NR Inteligente é uma solução completa para validação automática de conteúdo de Normas Regulamentadoras (NR) usando Inteligência Artificial. O sistema oferece análise em tempo real, sugestões inteligentes e relatórios detalhados de conformidade.

## Funcionalidades Principais

### 1. Validação Automática de Conteúdo
- **Parser de conteúdo NR** com regras específicas para cada norma
- **Análise estrutural** baseada em templates predefinidos
- **Análise semântica** usando GPT-4 para compreensão contextual
- **Sistema de scoring** com pesos configuráveis por tópico

### 2. IA para Análise em Tempo Real
- **Validação rápida** com debounce para feedback instantâneo
- **Análise completa** com armazenamento em banco de dados
- **Sugestões inteligentes** baseadas em análise de IA
- **Detecção de pontos críticos** e tópicos ausentes

### 3. Dashboard de Compliance
- **Métricas em tempo real** de validações e scores
- **Gráficos de tendência** para acompanhamento histórico
- **Análise por NR** com distribuição de scores
- **Relatórios de conformidade** detalhados

### 4. Sistema de Alertas
- **Alertas críticos** para scores abaixo de 60%
- **Avisos** para scores entre 60-79%
- **Notificações** para pontos críticos ausentes
- **Filtragem por severidade** e auto-refresh

### 5. Integração no Editor
- **Widget de compliance** integrado ao fluxo de criação
- **Validação automática** durante a edição
- **Sugestões contextuais** em tempo real
- **Aplicação automática** de correções

## Normas Regulamentadoras Suportadas

O sistema atualmente suporta as seguintes NRs:

- **NR-06**: Equipamento de Proteção Individual
- **NR-10**: Segurança em Instalações e Serviços em Eletricidade
- **NR-11**: Transporte, Movimentação, Armazenagem e Manuseio de Materiais
- **NR-12**: Segurança no Trabalho em Máquinas e Equipamentos
- **NR-18**: Condições e Meio Ambiente de Trabalho na Indústria da Construção
- **NR-20**: Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis
- **NR-23**: Proteção Contra Incêndios
- **NR-33**: Segurança e Saúde nos Trabalhos em Espaços Confinados
- **NR-35**: Trabalho em Altura

## Arquitetura do Sistema

### Backend Components

#### 1. GPT4ComplianceAnalyzer (`app/lib/ai/gpt4-client.ts`)
- Cliente especializado para análise de compliance usando GPT-4
- Métodos para análise completa e rápida
- Prompts otimizados para cada tipo de NR

#### 2. SmartComplianceValidator (`app/lib/compliance/smart-validator.ts`)
- Validador inteligente que combina análise estrutural e semântica
- Cálculo de scores ponderados
- Geração de relatórios detalhados

#### 3. Templates NR (`app/lib/compliance/templates/`)
- Templates estruturados para cada NR
- Definição de tópicos obrigatórios, pesos e pontos críticos
- Regras estruturais e frases-chave

#### 4. APIs de Compliance (`app/api/compliance/`)
- `/validate`: Validação completa e rápida
- `/metrics`: Métricas e estatísticas
- `/alerts`: Sistema de alertas

### Frontend Components

#### 1. ComplianceDashboard (`app/components/compliance/compliance-dashboard.tsx`)
- Dashboard principal com métricas e gráficos
- Tabs para visão geral, tendências, análise por NR e alertas

#### 2. ComplianceWidget (`app/components/compliance/compliance-widget.tsx`)
- Widget compacto para integração em editores
- Modos expandido e compacto
- Feedback visual em tempo real

#### 3. ComplianceEditorIntegration (`app/components/compliance/compliance-editor-integration.tsx`)
- Integração completa para editores de conteúdo
- Editor com validação em tempo real
- Painel lateral com sugestões e alertas

#### 4. ComplianceAlerts (`app/components/compliance/compliance-alerts.tsx`)
- Sistema de alertas em tempo real
- Filtragem por severidade
- Auto-refresh configurável

### Hooks e Utilitários

#### 1. useComplianceRealtime (`app/hooks/use-compliance-realtime.ts`)
- Hook React para validação em tempo real
- Gerenciamento de estado de validação
- Funções utilitárias para status e cores

## Como Usar

### 1. Página de Teste
Acesse `/compliance/test` para testar todas as funcionalidades:
- Editor integrado com validação em tempo real
- Dashboard com métricas
- Sistema de alertas
- Widgets de compliance

### 2. Dashboard Principal
Acesse `/compliance` para visualizar:
- Dashboard de métricas
- Validador de conteúdo
- Alertas de compliance

### 3. Integração em Projetos

#### Usando o Widget de Compliance
```tsx
import { ComplianceWidget } from '@/components/compliance/compliance-widget';

<ComplianceWidget
  projectId="seu-projeto-id"
  nrType="NR-12"
  content={conteudo}
  autoValidate={true}
  compact={false}
/>
```

#### Usando o Editor Integrado
```tsx
import { ComplianceEditorIntegration } from '@/components/compliance/compliance-editor-integration';

<ComplianceEditorIntegration
  projectId="seu-projeto-id"
  initialContent={conteudo}
  initialNrType="NR-12"
  onContentChange={handleContentChange}
  onSave={handleSave}
/>
```

#### Usando o Hook de Tempo Real
```tsx
import { useComplianceRealtime } from '@/hooks/use-compliance-realtime';

const {
  isValidating,
  score,
  suggestions,
  triggerValidation,
  needsImmediateAttention
} = useComplianceRealtime({
  projectId: 'seu-projeto-id',
  nrType: 'NR-12',
  autoValidate: true
});
```

## APIs Disponíveis

### POST /api/compliance/validate
Validação completa de projeto com armazenamento em banco.

**Body:**
```json
{
  "projectId": "string",
  "nrType": "string"
}
```

### PUT /api/compliance/validate
Validação rápida de conteúdo sem armazenamento.

**Body:**
```json
{
  "content": "string",
  "nrType": "string",
  "projectId": "string" // opcional
}
```

### GET /api/compliance/validate
Histórico de validações de um projeto.

**Query:**
- `projectId`: ID do projeto
- `nrType`: Tipo de NR (opcional)

### GET /api/compliance/metrics
Métricas de compliance do usuário.

**Query:**
- `period`: Período em dias (padrão: 30)

### GET /api/compliance/alerts
Alertas de compliance ativos.

**Query:**
- `severity`: Filtro por severidade (critical, warning, info)

## Configuração

### Variáveis de Ambiente
```env
OPENAI_API_KEY=sua-chave-openai
DATABASE_URL=sua-url-database
```

### Banco de Dados
O sistema utiliza as seguintes tabelas:
- `ComplianceValidation`: Resultados de validação
- `NRComplianceRecord`: Registros detalhados de compliance

## Extensibilidade

### Adicionando Nova NR
1. Criar template em `app/lib/compliance/templates/nr-XX.ts`
2. Registrar no `index.ts` do diretório templates
3. Atualizar lista de opções nos componentes

### Customizando Análise de IA
1. Modificar prompts em `GPT4ComplianceAnalyzer`
2. Ajustar pesos e critérios nos templates
3. Personalizar regras estruturais

### Adicionando Métricas
1. Estender APIs de métricas
2. Adicionar novos gráficos no dashboard
3. Criar novos tipos de alertas

## Monitoramento e Logs

O sistema registra:
- Todas as validações realizadas
- Scores e sugestões geradas
- Erros de validação
- Métricas de uso

## Suporte e Manutenção

Para suporte técnico ou dúvidas sobre implementação:
1. Verifique os logs do sistema
2. Consulte a documentação das APIs
3. Teste usando a página `/compliance/test`

## Roadmap

Funcionalidades planejadas:
- [ ] Suporte a mais NRs
- [ ] Análise de imagens e vídeos
- [ ] Integração com sistemas externos
- [ ] Relatórios PDF automatizados
- [ ] API para integrações terceiras