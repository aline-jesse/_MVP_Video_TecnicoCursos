
# 📖 Guia do Usuário - Estúdio IA de Vídeos

## Bem-vindo ao Estúdio IA de Vídeos! 🎬

Este é o guia completo para criar vídeos profissionais de treinamento usando inteligência artificial.

---

## Índice
1. [Primeiros Passos](#primeiros-passos)
2. [Criar Seu Primeiro Vídeo](#criar-seu-primeiro-vídeo)
3. [Editor Canvas](#editor-canvas)
4. [Templates NR](#templates-nr)
5. [Text-to-Speech (TTS)](#text-to-speech)
6. [Avatares 3D](#avatares-3d)
7. [Exportar e Compartilhar](#exportar-e-compartilhar)
8. [Dicas e Truques](#dicas-e-truques)
9. [FAQ](#faq)

---

## Primeiros Passos

### 1. Criar uma Conta

1. Acesse: https://treinx.abacusai.app
2. Clique em **"Criar Conta"**
3. Preencha seus dados:
   - Nome
   - Email
   - Senha (mínimo 8 caracteres)
4. Confirme seu email
5. Faça login

### 2. Dashboard Principal

Após o login, você verá:
- **Meus Projetos**: Todos os seus vídeos
- **Templates**: Modelos prontos de NRs
- **Biblioteca de Mídia**: Seus uploads
- **Analytics**: Estatísticas de uso

---

## Criar Seu Primeiro Vídeo

### Método 1: A partir de Template

1. Clique em **"Novo Projeto"**
2. Escolha **"Templates NR"**
3. Selecione o template (ex: NR 12 - Segurança em Máquinas)
4. Clique em **"Usar Template"**
5. O editor abrirá com o template pré-configurado

### Método 2: Upload de PowerPoint

1. Clique em **"Novo Projeto"**
2. Escolha **"Upload PPTX"**
3. Selecione seu arquivo (.pptx)
4. Aguarde o processamento (1-2 minutos)
5. O editor abrirá com seus slides importados

### Método 3: Começar do Zero

1. Clique em **"Novo Projeto"**
2. Escolha **"Canvas em Branco"**
3. Comece a criar no editor

---

## Editor Canvas

### Interface do Editor

```
┌─────────────────────────────────────────────────┐
│ [Arquivo] [Editar] [Inserir] [Visualizar]      │
├──────────┬──────────────────────────┬───────────┤
│          │                          │           │
│  Layers  │      Canvas              │  Propri-  │
│          │                          │  edades   │
│  📄 Slide│      🎨 Seu Conteúdo     │           │
│  🎤 Audio│                          │  Cor:     │
│  🎬 Video│                          │  Tamanho: │
│  📝 Texto│                          │  Posição: │
│          │                          │           │
└──────────┴──────────────────────────┴───────────┘
│            Timeline                              │
│  ▶ 00:00 ━━━━━━━━━●━━━━━━━━ 02:30              │
└─────────────────────────────────────────────────┘
```

### Ferramentas Principais

#### Adicionar Elementos

**Texto**
1. Clique em **"Inserir"** → **"Texto"**
2. Digite seu texto
3. Ajuste fonte, tamanho, cor no painel direito

**Imagens**
1. Clique em **"Inserir"** → **"Imagem"**
2. Upload ou escolha da biblioteca
3. Redimensione e posicione

**Vídeo**
1. Clique em **"Inserir"** → **"Vídeo"**
2. Upload seu vídeo (MP4, WebM)
3. Ajuste na timeline

**Avatar 3D**
1. Clique em **"Inserir"** → **"Avatar"**
2. Escolha o modelo
3. Configure no painel direito

#### Animações

1. Selecione o elemento
2. Clique em **"Animações"**
3. Escolha o tipo:
   - Entrada (fade in, slide, zoom)
   - Saída (fade out, slide out)
   - Ênfase (pulse, shake, glow)
4. Ajuste duração e timing

#### Transições

1. Vá para a **Timeline**
2. Clique entre dois slides
3. Escolha a transição:
   - Fade
   - Slide
   - Zoom
   - Dissolve
4. Ajuste duração (recomendado: 0.5-1s)

---

## Templates NR

### Templates Disponíveis

- **NR 5**: CIPA
- **NR 6**: EPI
- **NR 10**: Segurança em Eletricidade
- **NR 11**: Empilhadeiras
- **NR 12**: Máquinas e Equipamentos
- **NR 17**: Ergonomia
- **NR 33**: Espaços Confinados
- **NR 35**: Trabalho em Altura

### Como Usar

1. **Selecione o Template**
   - Dashboard → Templates → Escolha sua NR

2. **Personalize**
   - Troque logo da empresa
   - Ajuste cores corporativas
   - Adicione exemplos específicos

3. **Configure Áudio**
   - Texto já está pronto
   - Escolha a voz (masculina/feminina)
   - Gere o áudio com TTS

4. **Exporte**
   - Clique em **"Exportar"**
   - Escolha resolução (720p, 1080p, 4K)
   - Aguarde renderização

---

## Text-to-Speech (TTS)

### Gerar Áudio

1. **No Editor**:
   - Selecione o slide
   - Clique em **"Adicionar Narração"**

2. **Configurar TTS**:
   ```
   ┌─────────────────────────────────────┐
   │ 🎤 Text-to-Speech                   │
   ├─────────────────────────────────────┤
   │ Texto:                              │
   │ [Digite ou cole seu texto aqui]     │
   │                                     │
   │ Provider:                           │
   │ ○ Azure    ● ElevenLabs  ○ Google  │
   │                                     │
   │ Voz:                                │
   │ [Selecione ▼]                       │
   │ - pt-BR-Francisca (Feminino)        │
   │ - pt-BR-Antonio (Masculino)         │
   │                                     │
   │ Velocidade: [━━━●━━━] 1.0x          │
   │                                     │
   │ [❌ Cancelar]      [✅ Gerar Áudio] │
   └─────────────────────────────────────┘
   ```

3. **Clique em "Gerar Áudio"**
   - Aguarde 5-10 segundos
   - Ouça o preview
   - Se gostar, clique em **"Adicionar ao Projeto"**

### Providers Recomendados

| Provider | Qualidade | Velocidade | Idiomas | Preço |
|----------|-----------|------------|---------|-------|
| ElevenLabs | ⭐⭐⭐⭐⭐ | Rápido | 29 | $$ |
| Azure | ⭐⭐⭐⭐ | Muito rápido | 100+ | $ |
| Google | ⭐⭐⭐⭐ | Rápido | 40+ | $ |

**Recomendação**: Use **ElevenLabs** para qualidade premium, **Azure** para custo-benefício.

---

## Avatares 3D

### Tipos de Avatares

1. **Avatar Executivo**
   - Terno formal
   - Ideal para treinamentos corporativos

2. **Avatar Técnico**
   - Uniforme/EPI
   - Ideal para NRs de segurança

3. **Avatar Casual**
   - Roupa casual
   - Ideal para onboarding

### Como Adicionar

1. **Inserir Avatar**:
   - Editor → **"Inserir"** → **"Avatar 3D"**

2. **Configurar**:
   ```
   ┌─────────────────────────────────────┐
   │ 👤 Configurar Avatar                │
   ├─────────────────────────────────────┤
   │ Modelo: [Executivo ▼]               │
   │                                     │
   │ Posição:                            │
   │ ○ Esquerda  ● Centro  ○ Direita    │
   │                                     │
   │ Tamanho:                            │
   │ [━━━━●━] 80%                        │
   │                                     │
   │ Animação:                           │
   │ □ Gestos ao falar                   │
   │ □ Expressões faciais                │
   │ □ Piscar olhos                      │
   │                                     │
   │ [Aplicar]                           │
   └─────────────────────────────────────┘
   ```

3. **Sincronizar com Áudio**:
   - Avatar sincroniza automaticamente com TTS
   - Lábios movem-se com a fala (lip-sync)

---

## Exportar e Compartilhar

### Exportar Vídeo

1. **Clique em "Exportar"**:
   ```
   ┌─────────────────────────────────────┐
   │ 📤 Exportar Vídeo                   │
   ├─────────────────────────────────────┤
   │ Resolução:                          │
   │ ○ 720p (HD)                         │
   │ ● 1080p (Full HD) [Recomendado]    │
   │ ○ 4K (Ultra HD)                     │
   │                                     │
   │ Formato:                            │
   │ ● MP4    ○ WebM    ○ MOV           │
   │                                     │
   │ Qualidade:                          │
   │ [━━━━━━●━] Alta                     │
   │                                     │
   │ Estimativa: ~50 MB, 2 minutos       │
   │                                     │
   │ [Exportar]                          │
   └─────────────────────────────────────┘
   ```

2. **Aguarde Renderização**:
   - 720p: ~1 minuto de render por minuto de vídeo
   - 1080p: ~2 minutos de render por minuto de vídeo
   - 4K: ~5 minutos de render por minuto de vídeo

3. **Download**:
   - Quando pronto, clique em **"Download"**
   - Vídeo salvo na pasta Downloads

### Compartilhar

**Opção 1: Link Público**
1. Clique em **"Compartilhar"**
2. Ative **"Link Público"**
3. Copie o link
4. Compartilhe via email, WhatsApp, etc.

**Opção 2: Embed**
1. Clique em **"Compartilhar"** → **"Embed"**
2. Copie o código HTML
3. Cole no seu site/LMS

**Opção 3: Exportar para YouTube**
1. Clique em **"Compartilhar"** → **"YouTube"**
2. Faça login no YouTube
3. Configure título, descrição, privacidade
4. Clique em **"Publicar"**

---

## Dicas e Truques

### Performance

✅ **Use templates prontos** para economizar tempo
✅ **Reutilize elementos** (biblioteca de mídia)
✅ **Otimize imagens** antes do upload (max 2MB)
✅ **Use TTS** em vez de gravar áudio manualmente

### Qualidade

✅ **Resolução recomendada**: 1920x1080 (Full HD)
✅ **Fontes legíveis**: Tamanho mínimo 24pt
✅ **Alto contraste**: Texto escuro em fundo claro
✅ **Narração clara**: ElevenLabs para melhor qualidade

### Produtividade

✅ **Atalhos do teclado**:
- `Ctrl+S`: Salvar
- `Ctrl+Z`: Desfazer
- `Ctrl+Y`: Refazer
- `Ctrl+C`: Copiar
- `Ctrl+V`: Colar
- `Ctrl+D`: Duplicar
- `Del`: Excluir
- `Space`: Play/Pause

✅ **Templates personalizados**:
- Salve projetos como templates
- Reutilize em novos vídeos

✅ **Biblioteca de mídia**:
- Organize em pastas
- Use tags para busca rápida

---

## FAQ

### Posso importar PowerPoint?
**Sim!** Clique em "Upload PPTX" e selecione seu arquivo. O sistema converte automaticamente para o editor.

### Quantos vídeos posso criar?
**Ilimitados** no plano Pro. Veja nossos planos em: [Pricing]

### Posso usar minhas próprias imagens/vídeos?
**Sim!** Faça upload na biblioteca de mídia e use em seus projetos.

### O TTS funciona em português?
**Sim!** Suportamos português brasileiro com vozes masculinas e femininas de alta qualidade.

### Posso editar depois de exportar?
**Sim!** Seu projeto fica salvo. Basta abrir e fazer alterações quando quiser.

### Há marca d'água?
**Não** nos planos pagos. Plano Free inclui marca d'água discreta.

### Posso colaborar com minha equipe?
**Sim!** Compartilhe projetos com sua equipe. Todos podem editar em tempo real.

### Quanto tempo leva para renderizar?
Depende da duração e qualidade:
- **720p**: ~1 minuto por minuto de vídeo
- **1080p**: ~2 minutos por minuto de vídeo
- **4K**: ~5 minutos por minuto de vídeo

### Preciso de conhecimento técnico?
**Não!** A interface é intuitiva e feita para usuários leigos.

### Há suporte em português?
**Sim!** Suporte completo em português via email e chat.

---

## Tutoriais em Vídeo

🎥 **Playlist Completa**: [Ver no YouTube]

1. **Primeiros Passos** (3 min)
2. **Criar Vídeo do Zero** (10 min)
3. **Usar Templates NR** (5 min)
4. **Text-to-Speech Avançado** (7 min)
5. **Avatares 3D** (8 min)
6. **Animações e Transições** (12 min)
7. **Exportar e Compartilhar** (5 min)

---

## Suporte

Precisa de ajuda?

- 📧 **Email**: suporte@estudioiavideos.com.br
- 💬 **Chat**: Disponível no canto inferior direito
- 📚 **Base de Conhecimento**: [Acessar]
- 🎥 **Tutoriais**: [Ver Vídeos]

---

**Criado com ❤️ pelo time do Estúdio IA de Vídeos**

*Última atualização: Sprint 30 - Outubro 2025*
