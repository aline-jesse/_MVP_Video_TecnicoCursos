
# Product Requirements Document (PRD)
## Estúdio IA de Vídeos - Plataforma de Criação de Treinamentos de Segurança do Trabalho

**Versão:** 2.0  
**Data:** 02 de Outubro de 2025  
**Autor:** Equipe de Produto  
**Status:** Em Desenvolvimento (Sprint 17+)

---

## 📋 Índice

1. [Executive Summary](#1-executive-summary)
2. [Visão do Produto](#2-visão-do-produto)
3. [Objetivos e Metas](#3-objetivos-e-metas)
4. [Público-Alvo e Personas](#4-público-alvo-e-personas)
5. [Funcionalidades Principais](#5-funcionalidades-principais)
6. [Requisitos Funcionais](#6-requisitos-funcionais)
7. [Requisitos Não-Funcionais](#7-requisitos-não-funcionais)
8. [Arquitetura e Stack Técnico](#8-arquitetura-e-stack-técnico)
9. [User Stories e Casos de Uso](#9-user-stories-e-casos-de-uso)
10. [Fluxo do Usuário (User Flow)](#10-fluxo-do-usuário-user-flow)
11. [Roadmap e Priorização](#11-roadmap-e-priorização)
12. [Métricas de Sucesso](#12-métricas-de-sucesso)
13. [Riscos e Mitigações](#13-riscos-e-mitigações)
14. [Dependências e Integrações](#14-dependências-e-integrações)
15. [Compliance e Regulamentações](#15-compliance-e-regulamentações)

---

## 1. Executive Summary

### 1.1 Contexto

O **Estúdio IA de Vídeos** é uma plataforma **low-code/no-code** inovadora, integrada ao ecossistema **Trae.ai**, projetada para democratizar a criação de vídeos de treinamento de **Segurança do Trabalho** (Normas Regulamentadoras - NRs) no Brasil. 

A plataforma permite que usuários **sem conhecimento técnico** criem vídeos profissionais com avatares 3D hiper-realistas, dublagem por inteligência artificial (TTS multi-provider) e edição visual simplificada, eliminando a necessidade de estúdios, atores ou equipamentos caros.

### 1.2 Problema

As empresas brasileiras enfrentam desafios significativos para cumprir as **obrigações legais de treinamento em segurança do trabalho**:

- **Custo elevado** de produção de vídeos profissionais (R$ 5.000 - R$ 50.000 por vídeo)
- **Tempo longo** de produção (30-90 dias)
- **Falta de expertise** técnica para criar conteúdo audiovisual
- **Dificuldade de atualização** de conteúdo quando as NRs mudam
- **Baixa personalização** (vídeos genéricos não atendem contextos específicos)
- **Barreira linguística e de acessibilidade** (falta de legendas, idiomas alternativos)

### 1.3 Solução

Uma plataforma **SaaS** que permite:

- **Importar apresentações PPTX** existentes e convertê-las automaticamente em vídeos
- **Criar vídeos do zero** usando templates pré-configurados de NRs
- **Editar visualmente** cenas, textos, avatares e narrações
- **Gerar dublagens realistas** com IA (ElevenLabs, Azure TTS, Google TTS)
- **Exportar vídeos profissionais** em até 24 horas
- **Garantir compliance** com as NRs brasileiras (validação automática)

### 1.4 Proposta de Valor

| Benefício | Antes | Depois |
|-----------|-------|--------|
| **Custo** | R$ 5.000 - R$ 50.000 | R$ 0 - R$ 500 (SaaS) |
| **Tempo** | 30-90 dias | 1-3 dias |
| **Expertise** | Equipe técnica necessária | Usuário leigo |
| **Atualização** | Refazer vídeo do zero | Editar e republicar |
| **Personalização** | Baixa | Alta (100% customizável) |
| **Compliance** | Manual | Automático (IA valida) |

### 1.5 Estado Atual do Projeto

- **Infraestrutura:** 92% funcional
- **Módulos Totais:** 588 (31% funcionais, 69% mockups/demos)
- **Componentes React:** 200+
- **Integrações:** Trae.ai, ElevenLabs, Azure TTS, Google TTS, AWS S3, Prisma ORM
- **Fase Atual:** Sprint 17 (consolidação de funcionalidades core)

---

## 2. Visão do Produto

### 2.1 Visão

> **"Tornar-se a plataforma líder no Brasil para criação de treinamentos de segurança do trabalho, capacitando empresas de todos os portes a produzir vídeos profissionais com IA de forma rápida, acessível e em conformidade com as NRs."**

### 2.2 Missão

Democratizar a produção de conteúdo audiovisual educativo, eliminando barreiras técnicas e financeiras, e garantindo que **toda empresa brasileira** possa cumprir suas obrigações legais de treinamento em segurança do trabalho.

### 2.3 Valores

- **Acessibilidade:** Ferramentas intuitivas para usuários leigos
- **Qualidade:** Vídeos profissionais com avatares 3D e TTS premium
- **Compliance:** Garantia de conformidade com NRs brasileiras
- **Rapidez:** Produção em até 24 horas
- **Inovação:** IA aplicada para automação e inteligência

---

## 3. Objetivos e Metas

### 3.1 Objetivos de Negócio (2025-2026)

1. **Adoção:**
   - Atingir **5.000 usuários ativos** até Q2 2026
   - Alcançar **1.000 vídeos produzidos** até Q4 2025

2. **Revenue:**
   - Gerar **R$ 500K MRR** até Q4 2026
   - Atingir **CAC payback de 6 meses**

3. **Market Positioning:**
   - Tornar-se referência em **NR12, NR33, NR35** (top 3 NRs no Brasil)
   - Integrar-se a **5+ ERPs corporativos** (TOTVS, SAP, Senior)

### 3.2 Objetivos de Produto (Sprint 17-20)

1. **Converter 90% dos módulos mockup em funcionais** (até Sprint 20)
2. **Implementar pipeline completo PPTX → Vídeo** (Sprint 17)
3. **Lançar 10 templates NR certificados** (Sprint 18)
4. **Dashboard Analytics em tempo real** (Sprint 19)
5. **Mobile PWA 100% funcional** (Sprint 20)

### 3.3 KPIs de Produto

| KPI | Meta Q4 2025 | Meta Q2 2026 |
|-----|--------------|--------------|
| **Time to First Video** | < 15 min | < 10 min |
| **Conversion Rate (trial → paid)** | 15% | 25% |
| **NPS (Net Promoter Score)** | 40 | 60 |
| **Churn Rate** | < 8% | < 5% |
| **Video Generation Success Rate** | 90% | 98% |

---

## 4. Público-Alvo e Personas

### 4.1 Segmentos de Mercado

1. **PMEs Industriais** (200-1.000 funcionários)
2. **Grandes Empresas** (1.000+ funcionários)
3. **Consultorias de Segurança do Trabalho**
4. **Instituições de Ensino Técnico** (SENAI, SENAC)
5. **Governo e Órgãos Públicos** (prefeituras, estatais)

### 4.2 Personas Principais

#### Persona 1: Coordenador(a) de Segurança do Trabalho

**Nome:** Maria Silva  
**Idade:** 35 anos  
**Cargo:** Coordenadora de Segurança do Trabalho  
**Empresa:** Indústria metalúrgica com 500 funcionários  
**Educação:** Técnico em Segurança do Trabalho + Pós em Gestão de Riscos

**Contexto:**
- Responsável por treinar operadores de empilhadeiras (NR11) e trabalhadores em altura (NR35)
- Orçamento limitado para treinamentos
- Pressão da diretoria para reduzir acidentes
- Precisa comprovar treinamentos em auditorias

**Dores:**
- Vídeos genéricos da internet não refletem a realidade da fábrica
- Custo alto de produção audiovisual (R$ 20K-50K)
- Dificuldade de atualizar conteúdo quando NRs mudam
- Não tem conhecimento técnico de edição de vídeo

**Objetivos:**
- Criar vídeos personalizados para o contexto da empresa
- Reduzir custos de treinamento em 80%
- Comprovar compliance em auditorias
- Produzir vídeos em até 1 semana

**Como o Estúdio IA ajuda:**
- Importa PPTs existentes e gera vídeos automaticamente
- Templates NR12/NR35 pré-configurados
- Validação automática de compliance
- Custo mensal de R$ 299 (vs R$ 20K por vídeo)

---

#### Persona 2: Consultor(a) de Segurança

**Nome:** João Oliveira  
**Idade:** 42 anos  
**Cargo:** Consultor autônomo de Segurança do Trabalho  
**Clientes:** 15 empresas (PMEs)  
**Educação:** Engenheiro de Segurança do Trabalho

**Contexto:**
- Atende múltiplas empresas simultaneamente
- Precisa criar treinamentos customizados para cada cliente
- Trabalha com orçamento apertado (clientes PME)
- Diferencial competitivo: entrega rápida

**Dores:**
- Criar 15+ vídeos por mês manualmente é inviável
- Clientes não aceitam vídeos genéricos
- Falta de tempo para edição profissional
- Precisa de biblioteca de templates reutilizáveis

**Objetivos:**
- Produzir 3-5 vídeos por semana
- Manter biblioteca de templates por cliente
- Oferecer serviço premium a preço competitivo
- Escalar negócio sem contratar equipe técnica

**Como o Estúdio IA ajuda:**
- Biblioteca de 50+ templates NR
- Clonagem de voz para narração personalizada
- Exportação em lote (batch rendering)
- White-label (marca do consultor)

---

#### Persona 3: Gestor(a) de RH/T&D

**Nome:** Ana Costa  
**Idade:** 38 anos  
**Cargo:** Gerente de Treinamento e Desenvolvimento  
**Empresa:** Rede de varejo com 2.000 funcionários  
**Educação:** Psicologia Organizacional + MBA em Gestão de Pessoas

**Contexto:**
- Responsável por onboarding de novos funcionários
- Precisa treinar equipes em segurança de loja (NR10, NR23)
- Alto turnover (30% ao ano)
- Precisa de conteúdo escalável

**Dores:**
- Treinamentos presenciais custam R$ 150/funcionário
- Vídeos genéricos têm baixo engajamento
- Não consegue medir eficácia dos treinamentos
- Precisa de conteúdo em múltiplos idiomas (português, espanhol)

**Objetivos:**
- Criar biblioteca de onboarding reutilizável
- Reduzir custo de treinamento para R$ 20/funcionário
- Medir engajamento e retenção de conhecimento
- Traduzir conteúdo para filiais internacionais

**Como o Estúdio IA ajuda:**
- Analytics de visualização e engajamento
- TTS multi-idioma (PT, ES, EN)
- Templates de onboarding
- Integração com LMS (Moodle, Totara)

---

## 5. Funcionalidades Principais

### 5.1 Core Features (MVP)

#### 5.1.1 Autenticação e Onboarding
- **Login/Signup** com email e senha
- **Autenticação social** (Google, Microsoft)
- **Onboarding interativo** (tour guiado para novos usuários)
- **Perfis de usuário** (admin, editor, viewer)

#### 5.1.2 Dashboard Central
- **Visão geral de projetos** (grid/lista)
- **Filtros e busca** (por NR, data, status)
- **Métricas rápidas** (vídeos criados, tempo médio, storage usado)
- **Botão "Novo Projeto"** (CTA principal)

#### 5.1.3 Criação de Projeto
- **Modo 1: Importar PPTX**
  - Upload de arquivo (drag-and-drop)
  - Processamento automático de slides
  - Extração de textos, imagens e áudios
  - Conversão para formato de cenas

- **Modo 2: Templates NR**
  - Biblioteca de 10+ templates certificados (NR12, NR33, NR35, etc.)
  - Preview de templates
  - Customização de cores e logos

- **Modo 3: Criar do Zero**
  - Canvas em branco
  - Adicionar cenas manualmente

#### 5.1.4 Editor Visual (Canvas)
- **Timeline horizontal** com miniaturas de cenas
- **Canvas central** com preview em tempo real
- **Painel de propriedades** (esquerda)
  - Adicionar elementos (avatar, texto, imagem, forma)
  - Biblioteca de assets (500+ ícones, 100+ backgrounds)
  - Animações e transições

- **Painel de configuração** (direita)
  - Propriedades do elemento selecionado
  - Edição de textos (fonte, tamanho, cor, alinhamento)
  - Posicionamento e transformações (X, Y, rotação, escala)

- **Controles de cena**
  - Duração (5s, 10s, 15s, customizado)
  - Transição (fade, slide, zoom)
  - Narração (TTS ou upload de áudio)

#### 5.1.5 Sistema de Avatares 3D
- **Biblioteca de avatares hiper-realistas**
  - 10+ avatares (homens, mulheres, diversidade étnica)
  - Roupas contextuais (EPI, corporativo, casual)
  - Expressões faciais (sério, sorridente, preocupado)

- **Customização de avatares**
  - Posição na tela (esquerda, centro, direita)
  - Gestos (apontando, braços cruzados, acenando)
  - Sincronização labial automática com TTS

- **Animações de avatar**
  - Entrada/saída suave
  - Movimentos naturais (respiração, piscadas)
  - Gestos contextuais baseados no texto

#### 5.1.6 Text-to-Speech (TTS) Multi-Provider
- **Provedores integrados:**
  - ElevenLabs (voz premium, ultra-realista)
  - Azure TTS (50+ vozes em PT-BR)
  - Google TTS (fallback)

- **Seleção de voz**
  - Preview de vozes
  - Filtros (gênero, idade, sotaque)
  - Favoritos (salvar vozes preferidas)

- **Controles de narração**
  - Velocidade (0.5x - 2x)
  - Pitch (grave - agudo)
  - Pausa entre frases (0s - 5s)
  - Ênfase em palavras-chave

- **Clonagem de voz** (feature premium)
  - Upload de amostra de 10min
  - Treinamento de modelo customizado
  - Geração de narração com voz clonada

#### 5.1.7 Pipeline de Renderização
- **Renderização em nuvem**
  - Processamento paralelo (múltiplas cenas simultaneamente)
  - Progress bar em tempo real
  - Estimativa de tempo (baseado em duração total)

- **Formatos de exportação**
  - MP4 (H.264, 1080p, 30fps)
  - WebM (VP9, 1080p, 30fps)
  - GIF (preview rápido)

- **Qualidades**
  - Baixa (720p, 2Mbps) - preview
  - Média (1080p, 5Mbps) - distribuição interna
  - Alta (1080p, 10Mbps) - produção final

- **Legendas automáticas**
  - Geração de SRT a partir de TTS
  - Sincronização automática
  - Customização de estilo (fonte, cor, posição)

#### 5.1.8 Biblioteca de Assets
- **Imagens e ícones**
  - 500+ ícones de segurança (EPIs, equipamentos, sinalizações)
  - 100+ backgrounds (fábricas, escritórios, canteiros)
  - 50+ imagens de NRs (ilustrações técnicas)

- **Animações e efeitos**
  - 20+ transições (fade, wipe, zoom)
  - 15+ animações de entrada/saída
  - Efeitos de partículas (fumaça, fogo, poeira)

- **Áudios e músicas**
  - 30+ trilhas instrumentais (corporativo, motivacional)
  - 50+ efeitos sonoros (alertas, sirenes, cliques)
  - Upload de áudio customizado

#### 5.1.9 Templates NR Certificados
- **NR12 - Segurança em Máquinas e Equipamentos**
  - Estrutura: Introdução → Riscos → Proteções → Procedimentos → Conclusão
  - 8 cenas pré-configuradas
  - Avatar com EPI (capacete, luvas, óculos)

- **NR33 - Trabalhos em Espaços Confinados**
  - Estrutura: Definição → Riscos → Permissão → Monitoramento → Resgate
  - 10 cenas pré-configuradas
  - Cenário: ambiente industrial com tanques

- **NR35 - Trabalho em Altura**
  - Estrutura: Legislação → Riscos → Equipamentos → Resgate → Práticas
  - 12 cenas pré-configuradas
  - Avatar com cinto de segurança e trava-quedas

- **Outras NRs disponíveis:**
  - NR10 (Eletricidade), NR11 (Empilhadeiras), NR17 (Ergonomia)
  - NR18 (Construção Civil), NR20 (Inflamáveis), NR23 (Incêndios)

#### 5.1.10 Sistema de Colaboração
- **Compartilhamento de projetos**
  - Link público (visualização)
  - Link privado (edição)
  - Convite por email

- **Comentários e feedback**
  - Comentários em cenas específicas
  - Marcação de usuários (@menção)
  - Resolução de comentários

- **Histórico de versões**
  - Salvamento automático (a cada 2min)
  - Snapshots manuais
  - Restauração de versão anterior

### 5.2 Advanced Features (Post-MVP)

#### 5.2.1 Analytics Avançado
- **Dashboard de métricas**
  - Total de visualizações
  - Taxa de conclusão (watch-through rate)
  - Pontos de abandono (drop-off points)
  - Engajamento por cena

- **Relatórios de compliance**
  - Lista de funcionários treinados
  - Certificados de conclusão (gerados automaticamente)
  - Exportação para auditorias (PDF, Excel)

- **Heatmaps de interação**
  - Cenas mais assistidas
  - Momentos de pausa/replay
  - Feedback qualitativo (likes, comentários)

#### 5.2.2 IA Assistant (Trae.ai Integration)
- **Geração de roteiro por IA**
  - Input: "Criar treinamento sobre NR35 para pintores de fachada"
  - Output: Roteiro estruturado com 10 cenas

- **Sugestões contextuais**
  - Melhoria de textos (grammar, tone)
  - Sugestão de avatares (baseado em contexto)
  - Otimização de narração (pausas, ênfase)

- **Validação de compliance**
  - Verificação automática de itens obrigatórios da NR
  - Alertas de não-conformidade
  - Sugestões de correção

#### 5.2.3 Mobile PWA
- **Aplicativo web progressivo**
  - Instalável (ícone na home)
  - Offline-first (cache inteligente)
  - Push notifications (vídeo renderizado, comentário)

- **Funcionalidades mobile**
  - Criação simplificada (templates)
  - Edição básica (textos, avatares)
  - Visualização de analytics
  - Upload de mídia (câmera, galeria)

#### 5.2.4 Integrações Externas
- **LMS (Learning Management Systems)**
  - SCORM 1.2 / 2004
  - xAPI (Tin Can API)
  - Integração nativa com Moodle, Totara, Canvas

- **ERPs corporativos**
  - TOTVS, SAP, Senior
  - Sincronização de funcionários
  - Exportação de relatórios de treinamento

- **Ferramentas de comunicação**
  - Slack (notificações de conclusão de renderização)
  - Microsoft Teams (compartilhamento de projetos)
  - WhatsApp Business (envio de vídeos)

---

## 6. Requisitos Funcionais

### 6.1 Autenticação (RF-AUTH)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-AUTH-001 | Sistema deve permitir cadastro com email e senha | P0 |
| RF-AUTH-002 | Sistema deve validar formato de email | P0 |
| RF-AUTH-003 | Senha deve ter mínimo 8 caracteres, 1 maiúscula, 1 número | P0 |
| RF-AUTH-004 | Sistema deve permitir login social (Google, Microsoft) | P1 |
| RF-AUTH-005 | Sistema deve enviar email de verificação após cadastro | P1 |
| RF-AUTH-006 | Sistema deve permitir recuperação de senha | P0 |
| RF-AUTH-007 | Sistema deve expirar sessão após 7 dias de inatividade | P2 |

### 6.2 Gerenciamento de Projetos (RF-PROJ)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-PROJ-001 | Sistema deve listar todos os projetos do usuário | P0 |
| RF-PROJ-002 | Sistema deve permitir criar novo projeto (PPTX, template, zero) | P0 |
| RF-PROJ-003 | Sistema deve permitir duplicar projeto existente | P1 |
| RF-PROJ-004 | Sistema deve permitir excluir projeto | P0 |
| RF-PROJ-005 | Sistema deve permitir renomear projeto | P0 |
| RF-PROJ-006 | Sistema deve permitir filtrar projetos por NR | P1 |
| RF-PROJ-007 | Sistema deve permitir buscar projetos por nome | P1 |
| RF-PROJ-008 | Sistema deve ordenar projetos (data, nome, status) | P2 |

### 6.3 Upload e Processamento PPTX (RF-PPTX)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-PPTX-001 | Sistema deve aceitar upload de arquivos .pptx | P0 |
| RF-PPTX-002 | Sistema deve validar tamanho máximo (50MB) | P0 |
| RF-PPTX-003 | Sistema deve extrair textos de slides | P0 |
| RF-PPTX-004 | Sistema deve extrair imagens embutidas | P0 |
| RF-PPTX-005 | Sistema deve extrair áudios de notas de apresentação | P1 |
| RF-PPTX-006 | Sistema deve converter slides em cenas (1 slide = 1 cena) | P0 |
| RF-PPTX-007 | Sistema deve preservar formatação de textos (negrito, itálico) | P2 |
| RF-PPTX-008 | Sistema deve detectar idioma do texto automaticamente | P1 |
| RF-PPTX-009 | Sistema deve exibir progress bar durante processamento | P1 |

### 6.4 Editor Visual (RF-EDIT)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-EDIT-001 | Sistema deve exibir timeline com miniaturas de cenas | P0 |
| RF-EDIT-002 | Sistema deve permitir adicionar nova cena | P0 |
| RF-EDIT-003 | Sistema deve permitir excluir cena | P0 |
| RF-EDIT-004 | Sistema deve permitir reordenar cenas (drag-and-drop) | P0 |
| RF-EDIT-005 | Sistema deve permitir duplicar cena | P1 |
| RF-EDIT-006 | Sistema deve permitir adicionar elementos (avatar, texto, imagem) | P0 |
| RF-EDIT-007 | Sistema deve permitir editar texto (fonte, tamanho, cor) | P0 |
| RF-EDIT-008 | Sistema deve permitir posicionar elementos (X, Y, rotação, escala) | P0 |
| RF-EDIT-009 | Sistema deve permitir configurar duração de cena (5s, 10s, 15s, custom) | P0 |
| RF-EDIT-010 | Sistema deve permitir adicionar transição entre cenas | P1 |
| RF-EDIT-011 | Sistema deve exibir preview em tempo real | P0 |
| RF-EDIT-012 | Sistema deve permitir desfazer/refazer ações (Ctrl+Z / Ctrl+Y) | P1 |
| RF-EDIT-013 | Sistema deve salvar automaticamente a cada 2 minutos | P0 |

### 6.5 Avatares 3D (RF-AVATAR)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-AVATAR-001 | Sistema deve exibir biblioteca com 10+ avatares | P0 |
| RF-AVATAR-002 | Sistema deve permitir selecionar avatar por gênero | P1 |
| RF-AVATAR-003 | Sistema deve permitir customizar roupa do avatar | P1 |
| RF-AVATAR-004 | Sistema deve permitir posicionar avatar na cena | P0 |
| RF-AVATAR-005 | Sistema deve sincronizar lábios com narração (lip-sync) | P0 |
| RF-AVATAR-006 | Sistema deve animar avatar com gestos naturais | P1 |
| RF-AVATAR-007 | Sistema deve permitir configurar expressão facial | P2 |

### 6.6 Text-to-Speech (RF-TTS)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-TTS-001 | Sistema deve gerar narração a partir de texto | P0 |
| RF-TTS-002 | Sistema deve permitir selecionar provedor (ElevenLabs, Azure, Google) | P1 |
| RF-TTS-003 | Sistema deve exibir lista de vozes disponíveis | P0 |
| RF-TTS-004 | Sistema deve permitir preview de voz (sample de 5s) | P1 |
| RF-TTS-005 | Sistema deve permitir ajustar velocidade (0.5x - 2x) | P1 |
| RF-TTS-006 | Sistema deve permitir ajustar pitch (grave - agudo) | P2 |
| RF-TTS-007 | Sistema deve detectar idioma do texto automaticamente | P1 |
| RF-TTS-008 | Sistema deve suportar SSML (Speech Synthesis Markup Language) | P2 |
| RF-TTS-009 | Sistema deve permitir upload de áudio customizado | P1 |

### 6.7 Renderização (RF-RENDER)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-RENDER-001 | Sistema deve renderizar vídeo em MP4 (H.264, 1080p, 30fps) | P0 |
| RF-RENDER-002 | Sistema deve exibir progress bar durante renderização | P0 |
| RF-RENDER-003 | Sistema deve estimar tempo de renderização | P1 |
| RF-RENDER-004 | Sistema deve permitir cancelar renderização | P1 |
| RF-RENDER-005 | Sistema deve enviar notificação quando vídeo estiver pronto | P1 |
| RF-RENDER-006 | Sistema deve permitir download do vídeo | P0 |
| RF-RENDER-007 | Sistema deve gerar legendas automáticas (SRT) | P1 |
| RF-RENDER-008 | Sistema deve permitir exportar em múltiplas qualidades (720p, 1080p) | P2 |

### 6.8 Templates NR (RF-TEMPLATE)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-TEMPLATE-001 | Sistema deve exibir biblioteca com 10+ templates de NRs | P0 |
| RF-TEMPLATE-002 | Sistema deve permitir filtrar templates por NR | P1 |
| RF-TEMPLATE-003 | Sistema deve exibir preview de template | P1 |
| RF-TEMPLATE-004 | Sistema deve permitir customizar cores do template | P1 |
| RF-TEMPLATE-005 | Sistema deve permitir adicionar logo da empresa | P1 |
| RF-TEMPLATE-006 | Sistema deve validar compliance do template com NR | P2 |

### 6.9 Colaboração (RF-COLLAB)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-COLLAB-001 | Sistema deve permitir compartilhar projeto via link | P1 |
| RF-COLLAB-002 | Sistema deve permitir convidar usuários por email | P1 |
| RF-COLLAB-003 | Sistema deve permitir adicionar comentários em cenas | P1 |
| RF-COLLAB-004 | Sistema deve notificar quando usuário for mencionado | P2 |
| RF-COLLAB-005 | Sistema deve exibir histórico de versões | P2 |
| RF-COLLAB-006 | Sistema deve permitir restaurar versão anterior | P2 |

### 6.10 Analytics (RF-ANALYTICS)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-ANALYTICS-001 | Sistema deve rastrear visualizações de vídeos | P1 |
| RF-ANALYTICS-002 | Sistema deve calcular taxa de conclusão | P1 |
| RF-ANALYTICS-003 | Sistema deve identificar pontos de abandono | P2 |
| RF-ANALYTICS-004 | Sistema deve exibir dashboard com métricas principais | P1 |
| RF-ANALYTICS-005 | Sistema deve permitir exportar relatórios em PDF/Excel | P2 |
| RF-ANALYTICS-006 | Sistema deve gerar certificados de conclusão automaticamente | P1 |

---

## 7. Requisitos Não-Funcionais

### 7.1 Performance (RNF-PERF)

| ID | Requisito | Meta |
|----|-----------|------|
| RNF-PERF-001 | Tempo de carregamento da página inicial | < 2s |
| RNF-PERF-002 | Tempo de resposta do editor (adicionar elemento) | < 200ms |
| RNF-PERF-003 | Tempo de processamento PPTX (por slide) | < 5s |
| RNF-PERF-004 | Tempo de geração TTS (por minuto de áudio) | < 30s |
| RNF-PERF-005 | Tempo de renderização (por minuto de vídeo) | < 5min |
| RNF-PERF-006 | Taxa de sucesso de renderização | > 95% |

### 7.2 Escalabilidade (RNF-SCALE)

| ID | Requisito | Meta |
|----|-----------|------|
| RNF-SCALE-001 | Suportar 10.000 usuários simultâneos | Sim |
| RNF-SCALE-002 | Suportar 1.000 renderizações simultâneas | Sim |
| RNF-SCALE-003 | Processar 100 uploads PPTX simultâneos | Sim |
| RNF-SCALE-004 | Storage escalável (multi-tenant S3) | Ilimitado |

### 7.3 Segurança (RNF-SEC)

| ID | Requisito | Implementação |
|----|-----------|---------------|
| RNF-SEC-001 | Senhas devem ser hashadas | bcrypt (10 rounds) |
| RNF-SEC-002 | Comunicação deve ser criptografada | TLS 1.3 |
| RNF-SEC-003 | Uploads devem ser escaneados | Antivirus (ClamAV) |
| RNF-SEC-004 | Arquivos devem ser isolados por usuário | S3 bucket policies |
| RNF-SEC-005 | Logs de auditoria devem ser mantidos | 1 ano |
| RNF-SEC-006 | Compliance com LGPD | Sim |

### 7.4 Disponibilidade (RNF-AVAIL)

| ID | Requisito | Meta |
|----|-----------|------|
| RNF-AVAIL-001 | Uptime do sistema | > 99.5% |
| RNF-AVAIL-002 | RTO (Recovery Time Objective) | < 4h |
| RNF-AVAIL-003 | RPO (Recovery Point Objective) | < 1h |
| RNF-AVAIL-004 | Backup de banco de dados | Diário (3 copies) |

### 7.5 Usabilidade (RNF-UX)

| ID | Requisito | Meta |
|----|-----------|------|
| RNF-UX-001 | Sistema deve ser responsivo (mobile, tablet, desktop) | Sim |
| RNF-UX-002 | Sistema deve suportar PT-BR (idioma primário) | Sim |
| RNF-UX-003 | Sistema deve ter onboarding para novos usuários | < 5min |
| RNF-UX-004 | Sistema deve ter tooltips contextuais | Sim |
| RNF-UX-005 | Sistema deve ter atalhos de teclado | Sim |
| RNF-UX-006 | Sistema deve seguir WCAG 2.1 AA (acessibilidade) | Sim |

### 7.6 Manutenibilidade (RNF-MAINT)

| ID | Requisito | Meta |
|----|-----------|------|
| RNF-MAINT-001 | Cobertura de testes unitários | > 70% |
| RNF-MAINT-002 | Documentação de APIs | OpenAPI 3.0 |
| RNF-MAINT-003 | Logs estruturados | JSON (Winston) |
| RNF-MAINT-004 | Monitoramento de erros | Sentry |

---

## 8. Arquitetura e Stack Técnico

### 8.1 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                           FRONTEND                              │
│  Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui │
│             PWA (Service Workers + Offline Mode)                │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / WebSocket
┌────────────────────────┴────────────────────────────────────────┐
│                         API LAYER                               │
│            Next.js API Routes + tRPC (type-safe APIs)           │
│                    NextAuth.js (autenticação)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬───────────────────┐
        │                │                │                   │
┌───────▼──────┐ ┌───────▼──────┐ ┌──────▼───────┐ ┌─────────▼──────┐
│   DATABASE   │ │  FILE STORAGE│ │  TTS APIS    │ │ 3D RENDERING   │
│  PostgreSQL  │ │   AWS S3     │ │ ElevenLabs   │ │  Blender API   │
│   (Prisma)   │ │ (CloudFront) │ │  Azure TTS   │ │  Three.js      │
│              │ │              │ │  Google TTS  │ │                │
└──────────────┘ └──────────────┘ └──────────────┘ └────────────────┘
        │                │                │                   │
        └────────────────┴────────────────┴───────────────────┘
                         │
                ┌────────▼──────────┐
                │   VIDEO PIPELINE  │
                │   FFmpeg (Cloud)  │
                │   Lambda Workers  │
                └───────────────────┘
```

### 8.2 Stack Tecnológico

#### Frontend
- **Framework:** Next.js 14.2.28 (App Router, Server Components)
- **UI Library:** React 18.2.0
- **Language:** TypeScript 5.2.2
- **Styling:** Tailwind CSS 3.3.3 + shadcn/ui (Radix UI)
- **State Management:** Zustand 5.0.3 + Jotai 2.6.0
- **Data Fetching:** TanStack Query 5.0.0 + SWR 2.2.4
- **Forms:** React Hook Form 7.53.0 + Zod 3.23.8
- **Canvas Editor:** Fabric.js / Konva.js
- **3D Rendering:** Three.js + React Three Fiber
- **Charts:** Recharts 2.15.3 + Plotly.js 2.35.3

#### Backend
- **Runtime:** Node.js 20.6.2
- **API:** Next.js API Routes (serverless)
- **Authentication:** NextAuth.js 4.24.11
- **ORM:** Prisma 6.7.0
- **Database:** PostgreSQL 15
- **File Storage:** AWS S3 + CloudFront (CDN)
- **Queue:** BullMQ (Redis)
- **Cache:** Redis 7

#### Integrações Externas
- **TTS:** ElevenLabs API, Azure Cognitive Services, Google Cloud TTS
- **3D:** Blender Python API (headless rendering)
- **Video:** FFmpeg (libx264, libvpx-vp9)
- **PPTX:** PptxGenJS (Node.js library)
- **IA:** Trae.ai API (GPT-4, Claude 3)

#### DevOps
- **Hosting:** Vercel (frontend) + AWS Lambda (workers)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + Datadog
- **Logs:** Winston + Papertrail
- **CDN:** CloudFront
- **DNS:** Cloudflare

### 8.3 Estrutura de Pastas

```
estudio_ia_videos/
├── app/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx             # Dashboard principal
│   │   │   ├── projects/            # Listagem de projetos
│   │   │   ├── templates/           # Biblioteca de templates
│   │   │   └── analytics/           # Analytics
│   │   ├── (editor)/
│   │   │   └── editor/[projectId]/  # Editor visual
│   │   ├── api/
│   │   │   ├── auth/                # NextAuth endpoints
│   │   │   ├── projects/            # CRUD de projetos
│   │   │   ├── pptx/                # Upload e processamento PPTX
│   │   │   ├── tts/                 # Text-to-Speech
│   │   │   ├── render/              # Renderização de vídeos
│   │   │   └── assets/              # Upload de imagens/áudios
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── dashboard/               # Componentes do dashboard
│   │   ├── editor/                  # Componentes do editor
│   │   ├── templates/               # Componentes de templates
│   │   └── shared/                  # Componentes compartilhados
│   ├── lib/
│   │   ├── db/                      # Prisma client
│   │   ├── aws-config.ts            # AWS S3 config
│   │   ├── s3.ts                    # S3 helpers
│   │   ├── tts/                     # TTS providers
│   │   ├── pptx/                    # PPTX processing
│   │   ├── render/                  # Video rendering
│   │   └── utils.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   │   ├── avatars/                 # Avatar 3D assets
│   │   ├── templates/               # Template thumbnails
│   │   └── icons/
│   ├── package.json
│   └── tsconfig.json
└── docs/
    ├── PRD_COMPLETO_ESTUDIO_IA_VIDEOS.md  # Este documento
    └── ...
```

### 8.4 Banco de Dados (Schema Prisma)

```prisma
// User
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  avatar        String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  projects      Project[]
  sessions      Session[]
}

enum Role {
  USER
  ADMIN
  EDITOR
}

// Project
model Project {
  id            String    @id @default(cuid())
  name          String
  description   String?
  userId        String
  templateId    String?
  status        ProjectStatus @default(DRAFT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  scenes        Scene[]
  renders       Render[]
  analytics     Analytics[]
}

enum ProjectStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

// Scene
model Scene {
  id            String    @id @default(cuid())
  projectId     String
  order         Int
  duration      Int       @default(10) // segundos
  transition    String?   @default("fade")
  narrationText String?
  narrationAudio String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  project       Project   @relation(fields: [projectId], references: [id])
  elements      Element[]
}

// Element (avatar, texto, imagem, etc.)
model Element {
  id            String    @id @default(cuid())
  sceneId       String
  type          ElementType
  data          Json      // Propriedades específicas (posição, tamanho, cor, etc.)
  order         Int
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  scene         Scene     @relation(fields: [sceneId], references: [id])
}

enum ElementType {
  AVATAR
  TEXT
  IMAGE
  SHAPE
  AUDIO
}

// Render
model Render {
  id            String    @id @default(cuid())
  projectId     String
  status        RenderStatus @default(QUEUED)
  quality       Quality   @default(MEDIUM)
  format        Format    @default(MP4)
  outputUrl     String?
  progress      Int       @default(0)
  errorMessage  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  project       Project   @relation(fields: [projectId], references: [id])
}

enum RenderStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}

enum Quality {
  LOW    // 720p
  MEDIUM // 1080p
  HIGH   // 1080p alta bitrate
}

enum Format {
  MP4
  WEBM
  GIF
}

// Analytics
model Analytics {
  id            String    @id @default(cuid())
  projectId     String
  videoId       String
  userId        String?
  event         AnalyticsEvent
  timestamp     DateTime  @default(now())
  metadata      Json?
  
  project       Project   @relation(fields: [projectId], references: [id])
}

enum AnalyticsEvent {
  VIEW_START
  VIEW_COMPLETE
  VIEW_25
  VIEW_50
  VIEW_75
  PAUSE
  RESUME
  SEEK
}
```

---

## 9. User Stories e Casos de Uso

### 9.1 User Stories (Épicos Principais)

#### Épico 1: Onboarding e Autenticação

**US-1.1:** Como um novo usuário, quero me cadastrar com email e senha para acessar a plataforma.

**Critérios de Aceite:**
- ✅ Formulário de cadastro com email, senha e confirmação de senha
- ✅ Validação de formato de email
- ✅ Validação de senha (mínimo 8 caracteres, 1 maiúscula, 1 número)
- ✅ Mensagem de erro clara em caso de falha
- ✅ Redirecionamento para dashboard após cadastro bem-sucedido

**US-1.2:** Como um usuário recorrente, quero fazer login com minha conta para acessar meus projetos.

**Critérios de Aceite:**
- ✅ Formulário de login com email e senha
- ✅ Opção "Lembrar-me" (sessão de 7 dias)
- ✅ Link para recuperação de senha
- ✅ Mensagem de erro clara em caso de credenciais inválidas

**US-1.3:** Como um novo usuário, quero um tour guiado para entender as funcionalidades principais.

**Critérios de Aceite:**
- ✅ Tour interativo em 5 etapas (dashboard → criar projeto → editor → renderizar → compartilhar)
- ✅ Opção de pular tour
- ✅ Marcação de tour como concluído (não exibir novamente)

---

#### Épico 2: Criação de Projetos

**US-2.1:** Como usuário, quero criar um projeto importando um arquivo PPTX para aproveitar conteúdo existente.

**Critérios de Aceite:**
- ✅ Botão "Importar PPTX" visível no dashboard
- ✅ Upload via drag-and-drop ou seleção de arquivo
- ✅ Validação de formato (.pptx) e tamanho (máx. 50MB)
- ✅ Processamento automático de slides (1 slide = 1 cena)
- ✅ Extração de textos, imagens e notas
- ✅ Preview de cenas geradas antes de salvar
- ✅ Progress bar durante processamento

**US-2.2:** Como usuário, quero criar um projeto a partir de um template NR para economizar tempo.

**Critérios de Aceite:**
- ✅ Biblioteca de templates com filtro por NR
- ✅ Preview de template (thumbnail + descrição)
- ✅ Customização de cores e logo antes de criar
- ✅ Projeto criado com cenas pré-configuradas

**US-2.3:** Como usuário, quero criar um projeto do zero para ter controle total.

**Critérios de Aceite:**
- ✅ Opção "Criar do Zero" no modal de criação
- ✅ Redirecionamento para editor com canvas em branco
- ✅ Primeira cena criada automaticamente

---

#### Épico 3: Edição de Vídeos

**US-3.1:** Como usuário, quero editar textos das cenas para personalizar o conteúdo.

**Critérios de Aceite:**
- ✅ Seleção de elemento de texto no canvas
- ✅ Painel de edição com opções (fonte, tamanho, cor, alinhamento)
- ✅ Preview em tempo real
- ✅ Undo/Redo funcional

**US-3.2:** Como usuário, quero adicionar um avatar 3D para tornar o vídeo mais dinâmico.

**Critérios de Aceite:**
- ✅ Biblioteca de avatares com preview
- ✅ Filtro por gênero e estilo
- ✅ Drag-and-drop para adicionar ao canvas
- ✅ Posicionamento e escala ajustáveis
- ✅ Sincronização labial automática com narração

**US-3.3:** Como usuário, quero gerar narração com IA para não precisar gravar áudio.

**Critérios de Aceite:**
- ✅ Input de texto para narração
- ✅ Seleção de voz (lista de 50+ vozes)
- ✅ Preview de voz (sample de 5s)
- ✅ Controles de velocidade e pitch
- ✅ Geração de áudio em até 30s

**US-3.4:** Como usuário, quero ajustar a duração de cada cena para controlar o ritmo do vídeo.

**Critérios de Aceite:**
- ✅ Input numérico ou slider para duração (5s-60s)
- ✅ Botões rápidos (5s, 10s, 15s)
- ✅ Indicação visual no timeline
- ✅ Atualização automática da duração total do vídeo

---

#### Épico 4: Renderização e Exportação

**US-4.1:** Como usuário, quero renderizar meu projeto em vídeo MP4 para distribuir.

**Critérios de Aceite:**
- ✅ Botão "Renderizar Vídeo" no editor
- ✅ Seleção de qualidade (720p, 1080p)
- ✅ Estimativa de tempo de renderização
- ✅ Progress bar em tempo real
- ✅ Notificação quando vídeo estiver pronto

**US-4.2:** Como usuário, quero baixar o vídeo renderizado para usar offline.

**Critérios de Aceite:**
- ✅ Botão "Download" visível após renderização completa
- ✅ Download direto (sem redirecionamentos)
- ✅ Nome de arquivo descritivo (projeto_data.mp4)

**US-4.3:** Como usuário, quero gerar legendas automáticas para acessibilidade.

**Critérios de Aceite:**
- ✅ Checkbox "Gerar legendas" durante renderização
- ✅ Arquivo SRT gerado automaticamente
- ✅ Download de legendas separado do vídeo

---

#### Épico 5: Colaboração

**US-5.1:** Como usuário, quero compartilhar meu projeto com colegas para receber feedback.

**Critérios de Aceite:**
- ✅ Botão "Compartilhar" no editor
- ✅ Opção de link público (visualização) ou privado (edição)
- ✅ Cópia de link para clipboard
- ✅ Expiração de link configurável (24h, 7 dias, ilimitado)

**US-5.2:** Como usuário, quero adicionar comentários em cenas específicas para comunicar mudanças.

**Critérios de Aceite:**
- ✅ Botão "Comentar" em cada cena
- ✅ Input de texto para comentário
- ✅ Marcação de usuários (@menção)
- ✅ Notificação para usuário mencionado
- ✅ Resolução de comentários (marcar como resolvido)

---

#### Épico 6: Analytics

**US-6.1:** Como gestor, quero visualizar quantas pessoas assistiram meu vídeo de treinamento.

**Critérios de Aceite:**
- ✅ Dashboard de analytics com métricas principais
- ✅ Total de visualizações (únicas e totais)
- ✅ Taxa de conclusão (% que assistiram até o final)
- ✅ Gráfico de visualizações ao longo do tempo

**US-6.2:** Como gestor, quero gerar certificados de conclusão para comprovar treinamento.

**Critérios de Aceite:**
- ✅ Certificado gerado automaticamente após conclusão
- ✅ Dados do certificado (nome, NR, data, assinatura digital)
- ✅ Download em PDF
- ✅ Validação de autenticidade via QR Code

---

### 9.2 Casos de Uso Detalhados

#### Caso de Uso 1: Importar PPTX e Criar Vídeo

**Ator Principal:** Coordenadora de Segurança do Trabalho (Maria Silva)

**Pré-condições:**
- Maria está logada na plataforma
- Maria tem um arquivo PPTX de NR35 pronto

**Fluxo Principal:**

1. Maria acessa o dashboard e clica em "Novo Projeto"
2. Sistema exibe modal com 3 opções: PPTX, Template, Do Zero
3. Maria seleciona "Importar PPTX"
4. Maria faz upload do arquivo "NR35_Trabalho_em_Altura.pptx" (12 slides, 8MB)
5. Sistema valida arquivo (formato e tamanho OK)
6. Sistema inicia processamento:
   - Extrai textos de cada slide
   - Extrai 15 imagens embutidas
   - Detecta idioma (PT-BR)
   - Cria 12 cenas (1 por slide)
7. Sistema exibe progress bar: "Processando slide 5 de 12..."
8. Após 1 minuto, processamento completa
9. Sistema redireciona para editor com 12 cenas carregadas
10. Maria visualiza timeline com miniaturas das cenas
11. Maria clica na Cena 1 para editar
12. Maria adiciona avatar "Técnico de Segurança" (homem com capacete)
13. Maria gera narração com voz "Bruno (PT-BR, masculino, grave)"
14. Sistema gera áudio TTS em 20s
15. Maria ajusta duração da cena para 15s
16. Maria repete processo para cenas 2-12
17. Maria clica em "Renderizar Vídeo"
18. Sistema exibe modal de configuração:
    - Qualidade: 1080p
    - Legendas: Sim
    - Estimativa: 8 minutos
19. Maria confirma renderização
20. Sistema enfileira job de renderização
21. Sistema envia notificação por email após 8 minutos
22. Maria retorna à plataforma e baixa o vídeo (45MB, MP4)

**Pós-condições:**
- Projeto "NR35 - Trabalho em Altura" criado com 12 cenas
- Vídeo renderizado em 1080p com 3 minutos de duração
- Arquivo de legendas (SRT) disponível para download

**Fluxos Alternativos:**

**4a.** Arquivo PPTX corrompido:
- Sistema detecta erro de leitura
- Sistema exibe mensagem: "Arquivo inválido ou corrompido. Tente outro arquivo."
- Maria faz upload de arquivo correto

**6a.** Slide sem texto:
- Sistema cria cena em branco
- Sistema adiciona placeholder "Adicione texto aqui"

**17a.** Renderização falha por timeout:
- Sistema exibe mensagem: "Erro na renderização. Tente novamente."
- Sistema reenfileira job automaticamente
- Sistema notifica equipe de suporte

---

#### Caso de Uso 2: Criar Vídeo de NR12 com Template

**Ator Principal:** Consultor de Segurança (João Oliveira)

**Pré-condições:**
- João está logado na plataforma
- João precisa criar vídeo de NR12 para cliente

**Fluxo Principal:**

1. João acessa o dashboard e clica em "Novo Projeto"
2. Sistema exibe modal com 3 opções
3. João seleciona "Usar Template"
4. Sistema exibe biblioteca de templates com 12 opções
5. João filtra por "NR12"
6. Sistema exibe 1 template: "NR12 - Segurança em Máquinas"
7. João clica em "Preview" para visualizar
8. Sistema exibe descrição do template:
   - 8 cenas pré-configuradas
   - Estrutura: Intro → Riscos → Proteções → Procedimentos → Conclusão
   - Avatar padrão: Técnico com EPI
9. João clica em "Usar Este Template"
10. Sistema exibe modal de customização:
    - Nome do projeto: "NR12 - Cliente ABC Ltda"
    - Cor primária: #FF5733 (laranja)
    - Logo da empresa: [Upload de logo do cliente]
11. João faz upload do logo (logo_abc.png, 200KB)
12. João confirma customização
13. Sistema cria projeto com 8 cenas baseadas no template
14. Sistema aplica cor laranja nos elementos visuais
15. Sistema adiciona logo no canto superior direito de cada cena
16. Sistema redireciona para editor
17. João edita textos da Cena 1 para incluir nome do cliente
18. João mantém avatar padrão (já adequado)
19. João gera narração com voz "Mariana (PT-BR, feminino, neutra)"
20. João repete para cenas 2-8
21. João clica em "Renderizar Vídeo"
22. Sistema renderiza em 6 minutos
23. João baixa vídeo e envia para cliente

**Pós-condições:**
- Projeto criado com 8 cenas customizadas
- Vídeo renderizado em 1080p com 2:30 minutos

---

## 10. Fluxo do Usuário (User Flow)

### 10.1 Fluxo Completo: Da Criação ao Compartilhamento

```
┌─────────────────────────────────────────────────────────────────┐
│                         INÍCIO                                  │
│                    (Usuário não logado)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   ┌────────▼─────────┐
                   │   Página Inicial │
                   │   (Marketing)    │
                   └────────┬─────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
    ┌─────────▼────────┐      ┌──────────▼─────────┐
    │   Fazer Login    │      │   Criar Conta      │
    │  (Email + Senha) │      │  (Email + Senha)   │
    └─────────┬────────┘      └──────────┬─────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                   ┌────────▼─────────┐
                   │    Dashboard     │
                   │  (Lista Projetos)│
                   └────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────▼─────┐ ┌────▼─────┐ ┌────▼──────┐
    │ Importar PPTX │ │ Template │ │ Do Zero   │
    └─────────┬─────┘ └────┬─────┘ └────┬──────┘
              │             │             │
              └─────────────┼─────────────┘
                            │
                   ┌────────▼─────────┐
                   │  Editor Visual   │
                   │  (Canvas + Timeline)│
                   └────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────▼─────┐ ┌────▼─────┐ ┌────▼──────┐
    │ Editar Cenas  │ │ Adicionar│ │ Gerar TTS │
    │ (Texto, Imagem│ │ Avatares │ │ (Narração)│
    └─────────┬─────┘ └────┬─────┘ └────┬──────┘
              │             │             │
              └─────────────┼─────────────┘
                            │
                   ┌────────▼─────────┐
                   │ Renderizar Vídeo │
                   │  (Fila de Jobs)  │
                   └────────┬─────────┘
                            │
                   ┌────────▼─────────┐
                   │ Vídeo Renderizado│
                   │  (Download/Share)│
                   └────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────▼─────┐ ┌────▼─────┐ ┌────▼──────┐
    │  Baixar MP4   │ │ Compartilhar│ │ Analytics│
    │  (+ Legendas) │ │ (Link/Email)│ │(Métricas)│
    └───────────────┘ └──────────┘ └───────────┘
```

### 10.2 Fluxo do Editor (Detalhado)

```
┌───────────────────────────────────────────────────────────────┐
│                      EDITOR VISUAL                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              TOOLBAR (Topo)                             │ │
│  │  [Voltar] [Salvar] [Compartilhar] [Renderizar]         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────┐ ┌────────────────────────┐ ┌──────────────┐   │
│  │  PAINEL  │ │       CANVAS           │ │   PAINEL     │   │
│  │   DE     │ │  (Área de Edição)      │ │     DE       │   │
│  │ ELEMENTOS│ │                        │ │ PROPRIEDADES │   │
│  │          │ │  ┌──────────────────┐  │ │              │   │
│  │ □ Avatar │ │  │                  │  │ │ • Posição X  │   │
│  │ T Texto  │ │  │    [Avatar 3D]   │  │ │ • Posição Y  │   │
│  │ 🖼 Imagem │ │  │                  │  │ │ • Escala     │   │
│  │ ⬜ Forma  │ │  │  "Texto de Cena" │  │ │ • Rotação    │   │
│  │ 🎵 Áudio │ │  │                  │  │ │ • Cor        │   │
│  │          │ │  └──────────────────┘  │ │ • Fonte      │   │
│  └──────────┘ └────────────────────────┘ └──────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  TIMELINE                                │ │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │ │
│  │  │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │ │ 6  │  [+ Nova]  │ │
│  │  │10s │ │15s │ │12s │ │8s  │ │10s │ │20s │            │ │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘            │ │
│  │  ◄─────────────────────────────────────────────►        │ │
│  │          Total: 1min 15s                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 11. Roadmap e Priorização

### 11.1 Roadmap Geral (2025-2026)

```
Q4 2025          │ Q1 2026          │ Q2 2026          │ Q3 2026
─────────────────┼──────────────────┼──────────────────┼──────────────────
MVP Launch       │ Growth Features  │ Enterprise       │ Scale
• Dashboard      │ • Mobile PWA     │ • White-label    │ • API pública
• PPTX import    │ • Collaboration  │ • SSO (SAML)     │ • Marketplace
• Editor básico  │ • Templates NR   │ • Advanced AI    │ • Intl (EN/ES)
• TTS 3 providers│ • Analytics      │ • Video library  │ • 50+ templates
• Renderização   │ • Voice cloning  │ • LMS integrations│• Compliance audit
• 10 templates NR│ • Compliance auto│ • ERP connectors │ • 100K users
─────────────────┼──────────────────┼──────────────────┼──────────────────
```

### 11.2 Sprints Detalhados (Q4 2025)

#### Sprint 17 (Atual): Foundation & PPTX Pipeline
**Duração:** 2 semanas  
**Objetivo:** Completar fluxo PPTX → Vídeo end-to-end

**Entregas:**
- ✅ Dashboard unificado (feito)
- ✅ Modal de criação de projeto (feito)
- ✅ Página de listagem de projetos (feito)
- 🔨 Pipeline de processamento PPTX (em andamento)
- 🔨 Editor básico funcional (em andamento)
- 🔨 Integração TTS real (em andamento)

**Métricas de Sucesso:**
- Upload PPTX funciona 95% das vezes
- Processamento completa em < 5s/slide
- TTS gera áudio em < 30s

---

#### Sprint 18: Editor Pro + Templates NR
**Duração:** 2 semanas  
**Objetivo:** Editor profissional + 10 templates NR

**Entregas:**
- Editor canvas com Fabric.js/Konva
- Sistema de layers (z-index)
- Biblioteca de assets (500+ ícones)
- 10 templates NR certificados (NR12, NR33, NR35, etc.)
- Validação de compliance automática

**Métricas de Sucesso:**
- Editor funciona sem lag (60fps)
- Templates reduzem tempo de criação em 80%
- 90% dos vídeos passam validação de compliance

---

#### Sprint 19: Analytics + AI Intelligence
**Duração:** 2 semanas  
**Objetivo:** Analytics real + IA Assistant

**Entregas:**
- Dashboard de analytics (visualizações, conclusão, drop-off)
- Certificados de conclusão automáticos
- IA Assistant (geração de roteiro, sugestões)
- Validação de compliance por IA (Trae.ai)

**Métricas de Sucesso:**
- Analytics rastreia 100% das visualizações
- Certificados gerados em < 5s
- IA gera roteiros em < 30s

---

#### Sprint 20: Mobile PWA + Collaboration
**Duração:** 2 semanas  
**Objetivo:** Mobile 100% funcional + colaboração básica

**Entregas:**
- PWA instalável (iOS + Android)
- Offline mode (cache inteligente)
- Sistema de comentários em cenas
- Compartilhamento via link
- Histórico de versões

**Métricas de Sucesso:**
- PWA funciona offline
- 50% dos usuários usam mobile
- 80% dos projetos têm colaboradores

---

### 11.3 Priorização (MoSCoW)

#### Must Have (P0) - MVP Essencial
- ✅ Autenticação (login/signup)
- ✅ Dashboard de projetos
- 🔨 Upload e processamento PPTX
- 🔨 Editor visual (adicionar elementos, editar textos)
- 🔨 Avatares 3D (biblioteca + sincronização labial)
- 🔨 TTS multi-provider (ElevenLabs, Azure, Google)
- 🔨 Renderização de vídeo (MP4, 1080p)
- 🔨 Download de vídeo

#### Should Have (P1) - Important
- Templates NR certificados (10+)
- Biblioteca de assets (ícones, backgrounds)
- Analytics básico (visualizações, conclusão)
- Compartilhamento via link
- Legendas automáticas (SRT)
- Voice cloning (premium)

#### Could Have (P2) - Nice to Have
- Mobile PWA
- Colaboração (comentários, versões)
- IA Assistant (geração de roteiro)
- Validação de compliance automática
- Integração com LMS
- Certificados de conclusão

#### Won't Have (P3) - Future
- API pública
- Marketplace de templates
- White-label (rebrand)
- SSO (SAML/LDAP)
- Internacionalização (EN/ES)
- Advanced analytics (heatmaps, A/B testing)

---

## 12. Métricas de Sucesso

### 12.1 Métricas de Produto (OKRs)

#### Objetivo 1: Adoção e Engajamento

| KR (Key Result) | Meta Q4 2025 | Meta Q2 2026 | Como Medir |
|-----------------|--------------|--------------|------------|
| Usuários ativos mensais (MAU) | 1.000 | 5.000 | Google Analytics |
| Projetos criados/mês | 200 | 1.500 | Database query |
| Vídeos renderizados/mês | 150 | 1.200 | Database query |
| Taxa de retenção (D7) | 40% | 60% | Cohort analysis |
| Taxa de retenção (D30) | 20% | 35% | Cohort analysis |

#### Objetivo 2: Qualidade e Performance

| KR (Key Result) | Meta Q4 2025 | Meta Q2 2026 | Como Medir |
|-----------------|--------------|--------------|------------|
| Time to First Video | < 15min | < 10min | Analytics events |
| Success Rate (renderização) | 90% | 98% | Render logs |
| Crash-free sessions | 98% | 99.5% | Sentry |
| Page load time (p95) | < 3s | < 2s | Lighthouse |
| NPS (Net Promoter Score) | 40 | 60 | Surveys |

#### Objetivo 3: Revenue e Growth

| KR (Key Result) | Meta Q4 2025 | Meta Q2 2026 | Como Medir |
|-----------------|--------------|--------------|------------|
| MRR (Monthly Recurring Revenue) | R$ 50K | R$ 500K | Stripe dashboard |
| Conversion Rate (trial → paid) | 10% | 25% | Funnel analysis |
| CAC (Customer Acquisition Cost) | R$ 300 | R$ 150 | Marketing spend / new users |
| LTV (Lifetime Value) | R$ 600 | R$ 1.800 | Revenue / churn rate |
| Churn Rate (mensal) | 10% | 5% | Subscription cancellations |

### 12.2 Métricas por Feature

#### PPTX Upload
- **Taxa de sucesso:** > 95%
- **Tempo médio de processamento:** < 5s/slide
- **Taxa de erro:** < 5%

#### TTS (Text-to-Speech)
- **Taxa de sucesso:** > 98%
- **Tempo médio de geração:** < 30s/min de áudio
- **Qualidade percebida (NPS):** > 8/10

#### Renderização
- **Taxa de sucesso:** > 95%
- **Tempo médio:** < 5min/min de vídeo
- **Taxa de falha por timeout:** < 3%

#### Editor
- **Latência de interação:** < 200ms
- **FPS (frames per second):** > 60fps
- **Taxa de crash:** < 1%

---

## 13. Riscos e Mitigações

### 13.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Renderização falha em escala** (1.000+ jobs simultâneos) | Média | Alto | Implementar auto-scaling (AWS Lambda), monitoramento em tempo real (Datadog), queue management (BullMQ) |
| **TTS API down** (ElevenLabs, Azure, Google indisponíveis) | Baixa | Alto | Fallback em cascata (ElevenLabs → Azure → Google), cache de áudios gerados, notificação proativa |
| **PPTX corrompidos** causam crash no parser | Alta | Médio | Validação de arquivo antes de processar, try-catch robusto, logs detalhados, limite de tentativas |
| **3D avatares** não renderizam em mobile | Média | Médio | Fallback para imagens estáticas em mobile, detecção de device, progressivo enhancement |
| **Storage S3** atinge limite de custo | Baixa | Alto | Política de lifecycle (deletar vídeos antigos após 90 dias), compressão de vídeos, monitoramento de custos |

### 13.2 Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Concorrentes** lançam produto similar | Alta | Alto | Diferenciais: templates NR certificados, compliance automático, integração Trae.ai, velocidade de inovação (sprints quinzenais) |
| **Baixa adoção** (usuários não entendem valor) | Média | Alto | Onboarding interativo, marketing educativo (vídeos demo), pricing agressivo (freemium), parcerias com consultorias |
| **Mudanças nas NRs** (legislação muda) | Média | Médio | Time dedicado a compliance, alertas automáticos de mudanças, atualização de templates em < 7 dias |
| **Custo de TTS** inviável (escala 10x) | Média | Alto | Negociação com provedores (volume discount), cache agressivo (reuso de narrações), modelo freemium (limita TTS para free) |

### 13.3 Riscos Legais e Compliance

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **LGPD** (vazamento de dados de usuários) | Baixa | Crítico | Criptografia end-to-end, auditorias regulares, ISO 27001, DPO (Data Protection Officer) |
| **Propriedade intelectual** (vídeos usam imagens protegidas) | Média | Alto | Biblioteca própria de assets (licensed), validação de uploads (watermark detection), termos de uso claros |
| **Certificações NR** não são aceitas em auditorias | Média | Alto | Parceria com FUNDACENTRO, consultoria jurídica especializada, certificação de templates por especialistas |

---

## 14. Dependências e Integrações

### 14.1 APIs Externas

| Serviço | Uso | Plano Contratado | Custo Mensal | Fallback |
|---------|-----|------------------|--------------|----------|
| **ElevenLabs** | TTS Premium | Creator (30K chars/mês) | $22 | Azure TTS |
| **Azure TTS** | TTS Standard | S0 (5M chars/mês) | $16 | Google TTS |
| **Google TTS** | TTS Fallback | Standard (4M chars/mês) | $16 | - |
| **AWS S3** | Storage | Standard | ~$50 (1TB) | - |
| **Trae.ai** | IA Assistant | Enterprise | Custom | - |
| **Blender Cloud** | 3D Rendering | Pro | €9.90 | Local Blender |

### 14.2 Infraestrutura

| Componente | Provider | Configuração | Custo Mensal |
|------------|----------|--------------|--------------|
| **Frontend** | Vercel | Pro Plan | $20 |
| **Backend** | AWS Lambda | 10M invocations/mês | ~$80 |
| **Database** | AWS RDS (PostgreSQL) | db.t3.medium | $70 |
| **Cache** | Redis Cloud | 1GB | $10 |
| **CDN** | CloudFront | 1TB transfer | $85 |
| **Monitoring** | Datadog | Pro Plan (10 hosts) | $150 |

**Total Estimado:** ~$500/mês (base) + variável por uso

### 14.3 Integrações Planejadas (Roadmap)

#### Q1 2026
- **LMS:** Moodle, Totara, Canvas (SCORM 1.2/2004)
- **Communication:** Slack, Microsoft Teams (webhooks)

#### Q2 2026
- **ERP:** TOTVS, SAP, Senior (APIs REST)
- **Analytics:** Google Analytics 4, Mixpanel

#### Q3 2026
- **Payment:** Stripe, Mercado Pago, PagSeguro
- **Auth:** Okta, Auth0 (SSO/SAML)

---

## 15. Compliance e Regulamentações

### 15.1 Normas Regulamentadoras (NRs) Cobertas

A plataforma foca inicialmente nas **10 NRs mais demandadas** no Brasil:

| NR | Título | Templates | Status |
|----|--------|-----------|--------|
| **NR10** | Segurança em Instalações e Serviços em Eletricidade | 1 | ✅ Pronto |
| **NR11** | Transporte, Movimentação, Armazenagem e Manuseio de Materiais | 1 | ✅ Pronto |
| **NR12** | Segurança no Trabalho em Máquinas e Equipamentos | 2 | ✅ Pronto |
| **NR17** | Ergonomia | 1 | 🔨 Em desenvolvimento |
| **NR18** | Condições e Meio Ambiente de Trabalho na Indústria da Construção | 1 | 🔨 Em desenvolvimento |
| **NR20** | Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis | 1 | 📅 Planejado Q1 2026 |
| **NR23** | Proteção Contra Incêndios | 1 | 📅 Planejado Q1 2026 |
| **NR33** | Segurança e Saúde nos Trabalhos em Espaços Confinados | 2 | ✅ Pronto |
| **NR35** | Trabalho em Altura | 2 | ✅ Pronto |
| **NR36** | Segurança e Saúde no Trabalho em Empresas de Abate e Processamento de Carnes | 1 | 📅 Planejado Q2 2026 |

### 15.2 Validação de Compliance

A plataforma implementa **validação automática de compliance** para garantir que os vídeos atendam aos requisitos mínimos das NRs:

#### Checklist de Validação (Exemplo NR35)

- ✅ **Legislação:** Menciona NR35 e data da última atualização
- ✅ **Responsabilidades:** Define papel do empregador e empregado
- ✅ **Capacitação:** Carga horária mínima (8h teórico + 8h prático)
- ✅ **Equipamentos:** Lista EPIs obrigatórios (cinto, trava-quedas, capacete)
- ✅ **Procedimentos:** Permissão de trabalho (PT), análise de risco
- ✅ **Resgate:** Procedimentos de emergência e resgate
- ✅ **Certificado:** Emissão de certificado de conclusão

**Implementação:**
- IA (Trae.ai) analisa roteiro e identifica lacunas
- Alertas em tempo real durante edição
- Relatório de conformidade antes de renderização

### 15.3 LGPD (Lei Geral de Proteção de Dados)

A plataforma está em conformidade com a **LGPD (Lei nº 13.709/2018)**:

#### Medidas Implementadas

1. **Consentimento explícito:**
   - Checkbox obrigatório no cadastro
   - Política de privacidade clara e acessível
   - Opt-in para emails marketing

2. **Direitos do titular:**
   - Acesso aos dados (export JSON)
   - Retificação (editar perfil)
   - Exclusão (right to be forgotten)
   - Portabilidade (download de todos os projetos)

3. **Segurança:**
   - Criptografia TLS 1.3 (em trânsito)
   - Criptografia AES-256 (em repouso)
   - Logs de acesso (auditoria)
   - Backups diários (retenção de 30 dias)

4. **DPO (Data Protection Officer):**
   - Email: dpo@estudio-ia-videos.com.br
   - Resposta em até 5 dias úteis

---

## 16. Conclusão

### 16.1 Resumo Executivo

O **Estúdio IA de Vídeos** é uma plataforma inovadora que democratiza a criação de vídeos de treinamento de segurança do trabalho no Brasil. Com uma infraestrutura técnica robusta (92% funcional), avatares 3D hiper-realistas, TTS multi-provider e integração com Trae.ai, a plataforma está pronta para atender PMEs, grandes empresas e consultorias.

### 16.2 Próximos Passos

1. **Completar Sprint 17** (Pipeline PPTX + Editor básico) - 2 semanas
2. **Lançar MVP em Q4 2025** com 10 templates NR certificados
3. **Atingir 1.000 usuários ativos** até fim de 2025
4. **Expandir para 50+ templates NR** em Q2 2026
5. **Integrar com ERPs** (TOTVS, SAP) em Q2 2026

### 16.3 Contato

**Equipe de Produto:**  
📧 produto@estudio-ia-videos.com.br  
🌐 https://estudio-ia-videos.com.br  
📱 WhatsApp: +55 11 99999-9999

---

**Versão do Documento:** 2.0  
**Última Atualização:** 02 de Outubro de 2025  
**Próxima Revisão:** Sprint 18 (16 de Outubro de 2025)

---

## Apêndices

### A. Glossário

- **NR:** Norma Regulamentadora (legislação brasileira de segurança do trabalho)
- **TTS:** Text-to-Speech (conversão de texto em áudio)
- **PWA:** Progressive Web App (aplicativo web instalável)
- **LGPD:** Lei Geral de Proteção de Dados
- **LMS:** Learning Management System (plataforma de ensino)
- **ERP:** Enterprise Resource Planning (sistema de gestão empresarial)
- **SCORM:** Sharable Content Object Reference Model (padrão de e-learning)
- **SSO:** Single Sign-On (autenticação única)
- **SAML:** Security Assertion Markup Language (protocolo de autenticação)
- **CAC:** Customer Acquisition Cost (custo de aquisição de cliente)
- **LTV:** Lifetime Value (valor vitalício do cliente)
- **MRR:** Monthly Recurring Revenue (receita recorrente mensal)
- **NPS:** Net Promoter Score (índice de satisfação do cliente)

### B. Referências

1. **NRs Brasileiras:** https://www.gov.br/trabalho-e-previdencia/pt-br/composicao/orgaos-especificos/secretaria-de-trabalho/inspecao/seguranca-e-saude-no-trabalho/normas-regulamentadoras
2. **LGPD:** https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
3. **Next.js Docs:** https://nextjs.org/docs
4. **Prisma Docs:** https://www.prisma.io/docs
5. **ElevenLabs API:** https://elevenlabs.io/docs
6. **Azure TTS:** https://learn.microsoft.com/azure/cognitive-services/speech-service/
7. **FFmpeg:** https://ffmpeg.org/documentation.html

---

**FIM DO PRD**
