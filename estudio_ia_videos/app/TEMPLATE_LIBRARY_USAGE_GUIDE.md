# 📚 Template Library - Guia Rápido de Uso

## 🚀 Início Rápido

### Importação
```typescript
import { VideoTemplateLibrary } from '@/lib/video/template-library';
```

### Inicialização
```typescript
// Inicialização padrão
const library = new VideoTemplateLibrary();

// Com configuração personalizada
const library = new VideoTemplateLibrary({
  maxTemplates: 500,
  enableFavorites: true,
  enableHistory: true,
  enableAnalytics: true,
  cacheEnabled: true,
});
```

---

## 📖 Exemplos de Uso

### 1. Listar Templates

#### Obter todos os templates
```typescript
const templates = library.getAllTemplates();
console.log(`Total de templates: ${templates.length}`);
```

#### Obter template específico
```typescript
const template = library.getTemplate('lib-template-1');
if (template) {
  console.log(`Template: ${template.name}`);
  console.log(`Categoria: ${template.category}`);
  console.log(`Rating: ${template.rating}`);
}
```

### 2. Buscar e Filtrar

#### Busca por texto
```typescript
const results = library.search('tutorial');
console.log(`Encontrados: ${results.total} templates`);
results.templates.forEach(t => console.log(t.name));
```

#### Filtrar por categoria
```typescript
const educational = library.search('', { 
  category: 'educational' 
});
```

#### Filtrar por tamanho
```typescript
const youtubeVideos = library.search('', { 
  size: 'youtube' // 1920x1080
});
```

#### Filtrar por rating mínimo
```typescript
const highQuality = library.search('', { 
  minRating: 4.5 
});
```

#### Filtros combinados
```typescript
const results = library.search('curso', {
  category: 'educational',
  size: 'youtube',
  minRating: 4.0,
  featured: true,
});
```

#### Métodos diretos de filtro
```typescript
// Por categoria
const educational = library.getByCategory('educational');

// Por tamanho
const youtube = library.getBySize('youtube');

// Por tags
const tagged = library.getByTags(['intro', 'curso']);

// Templates em destaque
const featured = library.getFeatured();

// Templates populares (top 10)
const popular = library.getPopular(10);

// Templates recentes (últimos 10)
const recent = library.getRecent(10);
```

### 3. Sistema de Favoritos

#### Adicionar aos favoritos
```typescript
const success = library.addToFavorites('lib-template-1');
if (success) {
  console.log('✅ Template adicionado aos favoritos');
}
```

#### Remover dos favoritos
```typescript
library.removeFromFavorites('lib-template-1');
```

#### Alternar favorito (toggle)
```typescript
const isFavorite = library.toggleFavorite('lib-template-1');
console.log(isFavorite ? '❤️ Favoritado' : '🤍 Não favoritado');
```

#### Verificar se é favorito
```typescript
if (library.isFavorite('lib-template-1')) {
  console.log('❤️ Este template é um favorito');
}
```

#### Listar todos os favoritos
```typescript
const favorites = library.getFavorites();
favorites.forEach(template => {
  console.log(`❤️ ${template.name}`);
});
```

#### Ouvir eventos de favoritos
```typescript
library.on('favorite:added', (data) => {
  console.log(`Template ${data.templateId} adicionado aos favoritos`);
});

library.on('favorite:removed', (data) => {
  console.log(`Template ${data.templateId} removido dos favoritos`);
});
```

### 4. Histórico e Uso

#### Marcar template como usado
```typescript
library.markAsUsed('lib-template-1');
```

#### Obter histórico completo
```typescript
const history = library.getHistory();
history.forEach(item => {
  console.log(`${item.action}: ${item.templateId} em ${item.timestamp}`);
});
```

#### Obter histórico limitado (últimos 10)
```typescript
const recent = library.getHistory(10);
```

#### Limpar histórico
```typescript
library.clearHistory();
```

### 5. Ratings e Reviews

#### Adicionar rating
```typescript
const success = library.addRating('lib-template-1', 5);
```

#### Adicionar rating com review
```typescript
library.addRating('lib-template-1', 5, 'Excelente template!');
```

#### Validação automática (lança exceção se inválido)
```typescript
try {
  library.addRating('lib-template-1', 6); // Erro: rating > 5
} catch (error) {
  console.error('Rating deve estar entre 1 e 5');
}
```

### 6. Gerenciamento de Templates

#### Adicionar novo template
```typescript
const templateId = library.addTemplate({
  name: 'Meu Template Customizado',
  description: 'Template para vídeos educacionais',
  category: 'educational',
  size: 'youtube',
  tags: ['curso', 'educação', 'tutorial'],
  template: {
    id: 'custom-001',
    name: 'Custom',
    description: 'Custom template',
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 120,
    backgroundColor: '#000000',
    placeholders: [],
    variables: {},
    status: 'draft',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  popularity: 0,
  usageCount: 0,
  rating: 0,
  reviews: 0,
  featured: false,
  premium: false,
});

console.log(`Novo template criado: ${templateId}`);
```

#### Atualizar template
```typescript
library.updateTemplate('lib-template-1', {
  name: 'Nome Atualizado',
  description: 'Descrição atualizada',
  featured: true,
});
```

#### Remover template
```typescript
const success = library.removeTemplate('lib-template-1');
if (success) {
  console.log('Template removido com sucesso');
}
```

#### Criar template customizado a partir de existente
```typescript
const customId = library.createCustomFromTemplate('lib-template-1', {
  name: 'Minha Versão Customizada',
  description: 'Baseado no template original',
  tags: ['custom', 'personalizado'],
});
```

### 7. Estatísticas

#### Obter estatísticas gerais
```typescript
const stats = library.getStatistics();

console.log(`Total de templates: ${stats.totalTemplates}`);
console.log(`Total de usos: ${stats.totalUsage}`);
console.log(`Rating médio: ${stats.averageRating}`);

console.log('\nTemplates por categoria:');
Object.entries(stats.templatesByCategory).forEach(([category, count]) => {
  console.log(`  ${category}: ${count}`);
});

console.log('\nTop 5 templates populares:');
stats.popularTemplates.slice(0, 5).forEach(t => {
  console.log(`  ${t.name} (${t.usageCount} usos)`);
});

console.log('\nTemplates recém-adicionados:');
stats.recentlyAdded.forEach(t => {
  console.log(`  ${t.name} (${t.createdAt.toLocaleDateString()})`);
});
```

### 8. Import/Export

#### Exportar biblioteca
```typescript
const json = library.exportLibrary();

// Salvar em arquivo
import fs from 'fs';
fs.writeFileSync('template-library-backup.json', json);
```

#### Importar biblioteca
```typescript
import fs from 'fs';

const json = fs.readFileSync('template-library-backup.json', 'utf-8');
const newLibrary = new VideoTemplateLibrary();
newLibrary.importLibrary(json);

console.log(`Importados ${newLibrary.getAllTemplates().length} templates`);
```

### 9. Configuração

#### Obter configuração atual
```typescript
const config = library.getConfig();
console.log('Configuração:', config);
```

#### Atualizar configuração
```typescript
library.updateConfig({
  maxTemplates: 1000,
  enableFavorites: false,
});
```

#### Resetar biblioteca
```typescript
// Remove favoritos e histórico, mantém templates
library.reset();
```

---

## 📋 Categorias Disponíveis

- `marketing` - Templates de marketing
- `educational` - Templates educacionais
- `corporate` - Templates corporativos
- `social-media` - Templates para redes sociais
- `presentation` - Templates de apresentação
- `tutorial` - Templates de tutorial
- `promotion` - Templates promocionais
- `announcement` - Templates de anúncio
- `event` - Templates de eventos

---

## 📐 Tamanhos Disponíveis

- `youtube` - 1920x1080
- `instagram-square` - 1080x1080
- `instagram-story` - 1080x1920
- `facebook` - 1200x628
- `twitter` - 1200x675
- `linkedin` - 1200x627
- `tiktok` - 1080x1920
- `4k` - 3840x2160
- `fullhd` - 1920x1080
- `hd` - 1280x720
- `custom` - Tamanho personalizado

---

## 🎯 Templates Pré-Configurados

A biblioteca vem com 5 templates pré-configurados:

1. **YouTube Intro** (`lib-template-1`)
   - Categoria: `social-media`
   - Tamanho: `youtube`
   - Tags: `['intro', 'youtube', 'professional']`

2. **Instagram Story** (`lib-template-2`)
   - Categoria: `social-media`
   - Tamanho: `instagram-story`
   - Tags: `['instagram', 'story', 'mobile']`

3. **Educational Course** (`lib-template-3`)
   - Categoria: `educational`
   - Tamanho: `fullhd`
   - Tags: `['curso', 'educação', 'tutorial']`

4. **Corporate Presentation** (`lib-template-4`)
   - Categoria: `corporate`
   - Tamanho: `fullhd`
   - Tags: `['corporate', 'business', 'professional']`

5. **Promotion** (`lib-template-5`)
   - Categoria: `promotion`
   - Tamanho: `youtube`
   - Tags: `['promo', 'marketing', 'sale']`

---

## 🔔 Eventos Disponíveis

```typescript
// Template adicionado
library.on('template:added', (template) => {
  console.log('Novo template:', template.name);
});

// Template atualizado
library.on('template:updated', (template) => {
  console.log('Template atualizado:', template.name);
});

// Template removido
library.on('template:removed', (data) => {
  console.log('Template removido:', data.id);
});

// Template adicionado aos favoritos
library.on('favorite:added', (data) => {
  console.log('Favorito adicionado:', data.templateId);
});

// Template removido dos favoritos
library.on('favorite:removed', (data) => {
  console.log('Favorito removido:', data.templateId);
});

// Template usado
library.on('template:used', (data) => {
  console.log('Template usado:', data.templateId);
});
```

---

## ⚠️ Tratamento de Erros

### Limite de templates
```typescript
try {
  library.addTemplate(templateData);
} catch (error) {
  if (error.message.includes('Limite')) {
    console.error('Limite de templates atingido');
  }
}
```

### Rating inválido
```typescript
try {
  library.addRating(templateId, 10);
} catch (error) {
  console.error('Rating deve estar entre 1 e 5');
}
```

### Template não encontrado
```typescript
const template = library.getTemplate('id-inexistente');
if (!template) {
  console.log('Template não encontrado');
}
```

---

## 💡 Dicas de Uso

### 1. Performance
```typescript
// ✅ BOM: Usar métodos específicos
const educational = library.getByCategory('educational');

// ❌ EVITAR: Filtrar manualmente todos os templates
const all = library.getAllTemplates();
const educational = all.filter(t => t.category === 'educational');
```

### 2. Paginação
```typescript
// Para grandes conjuntos de resultados, use paginação
const pageSize = 20;
const page = 1;

const results = library.search('', { category: 'educational' });
const paginatedResults = results.templates.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

### 3. Caching
```typescript
// A biblioteca já tem cache interno ativado por padrão
// Para desabilitar:
library.updateConfig({ cacheEnabled: false });
```

### 4. Backup Regular
```typescript
// Faça backup da biblioteca regularmente
setInterval(() => {
  const backup = library.exportLibrary();
  saveBackup(backup);
}, 24 * 60 * 60 * 1000); // Diariamente
```

---

## 📚 Recursos Adicionais

- **Testes**: Ver `__tests__/lib/video/template-library-complete.test.ts`
- **Documentação**: Ver `TEMPLATE_LIBRARY_IMPLEMENTATION_COMPLETE.md`
- **Integração**: Ver documentação do Template Engine

---

**Desenvolvido com ❤️ para o Estúdio IA Vídeos**
