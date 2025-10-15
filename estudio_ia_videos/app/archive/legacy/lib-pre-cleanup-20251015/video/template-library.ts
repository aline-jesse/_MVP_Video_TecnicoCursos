/**
 * Video Template Library System
 * 
 * Biblioteca de templates pré-configurados para uso rápido
 * 
 * Features:
 * - Templates pré-definidos por categoria
 * - Customização rápida de templates
 * - Previews de templates
 * - Tags e busca
 * - Favoritos
 * - Histórico de uso
 * - Analytics de popularidade
 * 
 * @module VideoTemplateLibrary
 */

import { EventEmitter } from 'events';
import type {
  VideoTemplate,
  TemplatePlaceholder,
  AnimationType,
  PlaceholderType,
} from './template-engine';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Categoria de template
 */
export type TemplateCategory =
  | 'marketing'
  | 'educational'
  | 'corporate'
  | 'social-media'
  | 'presentation'
  | 'tutorial'
  | 'promotion'
  | 'announcement'
  | 'event';

/**
 * Tamanho de template
 */
export type TemplateSize =
  | 'youtube' // 1920x1080
  | 'instagram-square' // 1080x1080
  | 'instagram-story' // 1080x1920
  | 'facebook' // 1200x628
  | 'twitter' // 1200x675
  | 'linkedin' // 1200x627
  | 'tiktok' // 1080x1920
  | '4k' // 3840x2160
  | 'fullhd' // 1920x1080
  | 'hd' // 1280x720
  | 'custom';

/**
 * Template da biblioteca
 */
export interface LibraryTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  size: TemplateSize;
  tags: string[];
  thumbnail?: string;
  previewUrl?: string;
  template: VideoTemplate;
  popularity: number;
  usageCount: number;
  rating: number;
  reviews: number;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  premium: boolean;
}

/**
 * Filtro de busca
 */
export interface LibraryFilter {
  category?: TemplateCategory;
  size?: TemplateSize;
  tags?: string[];
  featured?: boolean;
  premium?: boolean;
  minRating?: number;
}

/**
 * Resultado de busca
 */
export interface SearchResult {
  templates: LibraryTemplate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Configuração da biblioteca
 */
export interface LibraryConfig {
  maxTemplates: number;
  enableFavorites: boolean;
  enableHistory: boolean;
  enableAnalytics: boolean;
  cacheEnabled: boolean;
}

/**
 * Estatísticas da biblioteca
 */
export interface LibraryStats {
  totalTemplates: number;
  templatesByCategory: Record<TemplateCategory, number>;
  totalUsage: number;
  averageRating: number;
  popularTemplates: LibraryTemplate[];
  recentlyAdded: LibraryTemplate[];
}

/**
 * Item de histórico
 */
export interface HistoryItem {
  templateId: string;
  timestamp: Date;
  action: 'viewed' | 'used' | 'customized' | 'downloaded';
}

// =============================================================================
// TEMPLATE LIBRARY CLASS
// =============================================================================

/**
 * Sistema de biblioteca de templates
 */
export class VideoTemplateLibrary extends EventEmitter {
  private templates: Map<string, LibraryTemplate> = new Map();
  private favorites: Set<string> = new Set();
  private history: HistoryItem[] = [];
  private config: LibraryConfig;
  private nextId: number = 1;

  constructor(config?: Partial<LibraryConfig>) {
    super();
    this.config = {
      maxTemplates: 1000,
      enableFavorites: true,
      enableHistory: true,
      enableAnalytics: true,
      cacheEnabled: true,
      ...config,
    };

    // Inicializar com templates padrão
    this.initializeDefaultTemplates();
  }

  // ===========================================================================
  // TEMPLATE MANAGEMENT
  // ===========================================================================

  /**
   * Adiciona template à biblioteca
   */
  addTemplate(template: Omit<LibraryTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    if (this.templates.size >= this.config.maxTemplates) {
      throw new Error(`Limite de ${this.config.maxTemplates} templates atingido`);
    }

    const id = `lib-template-${this.nextId++}`;
    const libraryTemplate: LibraryTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(id, libraryTemplate);
    this.emit('template:added', libraryTemplate);

    return id;
  }

  /**
   * Obtém template por ID
   */
  getTemplate(id: string): LibraryTemplate | undefined {
    const template = this.templates.get(id);
    
    if (template && this.config.enableHistory) {
      this.addToHistory(id, 'viewed');
    }

    return template;
  }

  /**
   * Obtém todos os templates
   */
  getAllTemplates(): LibraryTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Atualiza template
   */
  updateTemplate(id: string, updates: Partial<LibraryTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    Object.assign(template, updates, { updatedAt: new Date() });
    this.emit('template:updated', template);

    return true;
  }

  /**
   * Remove template
   */
  removeTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    
    if (deleted) {
      this.favorites.delete(id);
      this.emit('template:removed', { id });
    }

    return deleted;
  }

  // ===========================================================================
  // SEARCH & FILTERING
  // ===========================================================================

  /**
   * Busca templates
   */
  search(
    query: string,
    filter?: LibraryFilter,
    page: number = 1,
    pageSize: number = 20
  ): SearchResult {
    let results = this.getAllTemplates();

    // Aplicar filtros
    if (filter) {
      if (filter.category) {
        results = results.filter((t) => t.category === filter.category);
      }

      if (filter.size) {
        results = results.filter((t) => t.size === filter.size);
      }

      if (filter.tags && filter.tags.length > 0) {
        results = results.filter((t) =>
          filter.tags!.some((tag) => t.tags.includes(tag))
        );
      }

      if (filter.featured !== undefined) {
        results = results.filter((t) => t.featured === filter.featured);
      }

      if (filter.premium !== undefined) {
        results = results.filter((t) => t.premium === filter.premium);
      }

      if (filter.minRating !== undefined) {
        results = results.filter((t) => t.rating >= filter.minRating!);
      }
    }

    // Busca por texto
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.description.toLowerCase().includes(lowerQuery) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Ordenar por popularidade
    results.sort((a, b) => b.popularity - a.popularity);

    // Paginação
    const total = results.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = results.slice(startIndex, startIndex + pageSize);

    return {
      templates: paginatedResults,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Obtém templates por categoria
   */
  getByCategory(category: TemplateCategory): LibraryTemplate[] {
    return this.getAllTemplates().filter((t) => t.category === category);
  }

  /**
   * Obtém templates por tamanho
   */
  getBySize(size: TemplateSize): LibraryTemplate[] {
    return this.getAllTemplates().filter((t) => t.size === size);
  }

  /**
   * Obtém templates por tags
   */
  getByTags(tags: string[]): LibraryTemplate[] {
    return this.getAllTemplates().filter((t) =>
      tags.some((tag) => t.tags.includes(tag))
    );
  }

  /**
   * Obtém templates em destaque
   */
  getFeatured(): LibraryTemplate[] {
    return this.getAllTemplates()
      .filter((t) => t.featured)
      .sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Obtém templates mais populares
   */
  getPopular(limit: number = 10): LibraryTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  /**
   * Obtém templates recentes
   */
  getRecent(limit: number = 10): LibraryTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // ===========================================================================
  // FAVORITES
  // ===========================================================================

  /**
   * Adiciona aos favoritos
   */
  addToFavorites(templateId: string): boolean {
    if (!this.config.enableFavorites) return false;
    if (!this.templates.has(templateId)) return false;

    this.favorites.add(templateId);
    this.emit('favorite:added', { templateId });

    return true;
  }

  /**
   * Remove dos favoritos
   */
  removeFromFavorites(templateId: string): boolean {
    if (!this.config.enableFavorites) return false;

    const removed = this.favorites.delete(templateId);
    
    if (removed) {
      this.emit('favorite:removed', { templateId });
    }

    return removed;
  }

  /**
   * Toggle favorito
   */
  toggleFavorite(templateId: string): boolean {
    if (this.favorites.has(templateId)) {
      return !this.removeFromFavorites(templateId);
    } else {
      return this.addToFavorites(templateId);
    }
  }

  /**
   * Verifica se é favorito
   */
  isFavorite(templateId: string): boolean {
    return this.favorites.has(templateId);
  }

  /**
   * Obtém favoritos
   */
  getFavorites(): LibraryTemplate[] {
    return Array.from(this.favorites)
      .map((id) => this.templates.get(id))
      .filter((t): t is LibraryTemplate => t !== undefined);
  }

  // ===========================================================================
  // HISTORY & ANALYTICS
  // ===========================================================================

  /**
   * Adiciona ao histórico
   */
  private addToHistory(templateId: string, action: HistoryItem['action']): void {
    if (!this.config.enableHistory) return;

    this.history.push({
      templateId,
      timestamp: new Date(),
      action,
    });

    // Limitar histórico a 1000 itens
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }

    // Incrementar contador de uso
    if (this.config.enableAnalytics && action === 'used') {
      const template = this.templates.get(templateId);
      if (template) {
        template.usageCount++;
        template.popularity = this.calculatePopularity(template);
        this.emit('analytics:usage', { templateId, usageCount: template.usageCount });
      }
    }
  }

  /**
   * Marca template como usado
   */
  markAsUsed(templateId: string): void {
    this.addToHistory(templateId, 'used');
  }

  /**
   * Obtém histórico
   */
  getHistory(limit?: number): HistoryItem[] {
    if (!this.config.enableHistory) return [];

    const history = [...this.history].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Limpa histórico
   */
  clearHistory(): void {
    this.history = [];
    this.emit('history:cleared');
  }

  /**
   * Calcula popularidade
   */
  private calculatePopularity(template: LibraryTemplate): number {
    // Fórmula: (usageCount * 10) + (rating * 20) + (reviews * 5)
    return (
      template.usageCount * 10 +
      template.rating * 20 +
      template.reviews * 5
    );
  }

  // ===========================================================================
  // RATING & REVIEWS
  // ===========================================================================

  /**
   * Adiciona avaliação
   */
  addRating(templateId: string, rating: number, review?: string): boolean {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating deve estar entre 1 e 5');
    }

    const template = this.templates.get(templateId);
    if (!template) return false;

    // Recalcular rating médio
    const totalRating = template.rating * template.reviews;
    template.reviews++;
    template.rating = (totalRating + rating) / template.reviews;
    template.popularity = this.calculatePopularity(template);
    template.updatedAt = new Date();

    this.emit('rating:added', { templateId, rating, review });

    return true;
  }

  // ===========================================================================
  // CUSTOMIZATION
  // ===========================================================================

  /**
   * Cria template customizado baseado em existente
   */
  createCustomFromTemplate(templateId: string, customizations: Partial<LibraryTemplate>): string {
    const original = this.templates.get(templateId);
    if (!original) {
      throw new Error('Template não encontrado');
    }

    // Clonar template
    const cloned: LibraryTemplate = JSON.parse(JSON.stringify(original));
    
    // Aplicar customizações
    const customTemplate: Omit<LibraryTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      ...cloned,
      ...customizations,
      name: customizations.name || `${original.name} (Custom)`,
      usageCount: 0,
      popularity: 0,
      rating: 0,
      reviews: 0,
      featured: false,
    };

    const newId = this.addTemplate(customTemplate);
    this.addToHistory(templateId, 'customized');
    this.emit('template:customized', { originalId: templateId, newId });

    return newId;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Obtém estatísticas
   */
  getStatistics(): LibraryStats {
    const templates = this.getAllTemplates();
    
    const templatesByCategory: Record<TemplateCategory, number> = {
      marketing: 0,
      educational: 0,
      corporate: 0,
      'social-media': 0,
      presentation: 0,
      tutorial: 0,
      promotion: 0,
      announcement: 0,
      event: 0,
    };

    let totalUsage = 0;
    let totalRating = 0;
    let totalReviews = 0;

    templates.forEach((template) => {
      templatesByCategory[template.category]++;
      totalUsage += template.usageCount;
      totalRating += template.rating * template.reviews;
      totalReviews += template.reviews;
    });

    return {
      totalTemplates: templates.length,
      templatesByCategory,
      totalUsage,
      averageRating: totalReviews > 0 ? totalRating / totalReviews : 0,
      popularTemplates: this.getPopular(5),
      recentlyAdded: this.getRecent(5),
    };
  }

  // ===========================================================================
  // EXPORT/IMPORT
  // ===========================================================================

  /**
   * Exporta biblioteca
   */
  exportLibrary(): string {
    return JSON.stringify({
      templates: Array.from(this.templates.values()),
      favorites: Array.from(this.favorites),
      config: this.config,
    }, null, 2);
  }

  /**
   * Importa biblioteca
   */
  importLibrary(json: string): void {
    try {
      const data = JSON.parse(json);
      
      data.templates.forEach((t: LibraryTemplate) => {
        this.templates.set(t.id, t);
      });

      if (data.favorites) {
        data.favorites.forEach((id: string) => {
          this.favorites.add(id);
        });
      }

      this.emit('library:imported', { count: data.templates.length });
    } catch (error) {
      throw new Error('Falha ao importar biblioteca');
    }
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  /**
   * Reseta biblioteca
   */
  reset(): void {
    this.templates.clear();
    this.favorites.clear();
    this.history = [];
    this.nextId = 1;
    this.initializeDefaultTemplates();
    this.emit('library:reset');
  }

  /**
   * Obtém configuração
   */
  getConfig(): LibraryConfig {
    return { ...this.config };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(updates: Partial<LibraryConfig>): void {
    Object.assign(this.config, updates);
    this.emit('config:updated', this.config);
  }

  // ===========================================================================
  // DEFAULT TEMPLATES
  // ===========================================================================

  /**
   * Inicializa templates padrão
   */
  private initializeDefaultTemplates(): void {
    // Template 1: YouTube Intro
    this.addTemplate({
      name: 'YouTube Intro Profissional',
      description: 'Intro animado para vídeos do YouTube',
      category: 'marketing',
      size: 'youtube',
      tags: ['intro', 'youtube', 'profissional', 'animado'],
      template: this.createYouTubeIntroTemplate(),
      popularity: 100,
      usageCount: 50,
      rating: 4.5,
      reviews: 20,
      featured: true,
      premium: false,
    });

    // Template 2: Instagram Story
    this.addTemplate({
      name: 'Instagram Story Moderno',
      description: 'Template moderno para stories do Instagram',
      category: 'social-media',
      size: 'instagram-story',
      tags: ['instagram', 'story', 'moderno', 'social'],
      template: this.createInstagramStoryTemplate(),
      popularity: 150,
      usageCount: 75,
      rating: 4.8,
      reviews: 35,
      featured: true,
      premium: false,
    });

    // Template 3: Aula Online
    this.addTemplate({
      name: 'Aula Online Educacional',
      description: 'Template para aulas e tutoriais online',
      category: 'educational',
      size: 'fullhd',
      tags: ['aula', 'educacional', 'tutorial', 'ensino'],
      template: this.createEducationalTemplate(),
      popularity: 120,
      usageCount: 60,
      rating: 4.6,
      reviews: 25,
      featured: true,
      premium: false,
    });

    // Template 4: Apresentação Corporativa
    this.addTemplate({
      name: 'Apresentação Corporativa',
      description: 'Template profissional para apresentações corporativas',
      category: 'corporate',
      size: 'fullhd',
      tags: ['corporativo', 'apresentação', 'profissional', 'negócios'],
      template: this.createCorporateTemplate(),
      popularity: 90,
      usageCount: 45,
      rating: 4.4,
      reviews: 18,
      featured: false,
      premium: true,
    });

    // Template 5: Promoção de Produto
    this.addTemplate({
      name: 'Promoção de Produto',
      description: 'Template para vídeos promocionais de produtos',
      category: 'promotion',
      size: 'facebook',
      tags: ['promoção', 'produto', 'vendas', 'marketing'],
      template: this.createPromotionTemplate(),
      popularity: 110,
      usageCount: 55,
      rating: 4.7,
      reviews: 30,
      featured: true,
      premium: false,
    });
  }

  /**
   * Cria template de YouTube Intro
   */
  private createYouTubeIntroTemplate(): VideoTemplate {
    return {
      id: 'youtube-intro',
      name: 'YouTube Intro',
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 5,
      backgroundColor: '#000000',
      placeholders: [
        {
          id: 'logo',
          name: 'Logo',
          type: 'image',
          required: true,
          x: 760,
          y: 340,
          width: 400,
          height: 400,
          startTime: 0,
          duration: 5,
          animation: 'zoom-in',
          animationDuration: 1,
        },
        {
          id: 'channel-name',
          name: 'Nome do Canal',
          type: 'text',
          required: true,
          x: 460,
          y: 800,
          width: 1000,
          height: 100,
          startTime: 1,
          duration: 4,
          animation: 'fade-in',
          animationDuration: 0.5,
          style: {
            fontSize: 60,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
          },
        },
      ],
      variables: {},
      status: 'valid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Cria template de Instagram Story
   */
  private createInstagramStoryTemplate(): VideoTemplate {
    return {
      id: 'instagram-story',
      name: 'Instagram Story',
      width: 1080,
      height: 1920,
      fps: 30,
      duration: 15,
      backgroundColor: '#E1306C',
      placeholders: [
        {
          id: 'background-image',
          name: 'Imagem de Fundo',
          type: 'image',
          required: false,
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          startTime: 0,
          duration: 15,
        },
        {
          id: 'title',
          name: 'Título',
          type: 'text',
          required: true,
          x: 90,
          y: 400,
          width: 900,
          height: 200,
          startTime: 0.5,
          duration: 14.5,
          animation: 'slide-up',
          animationDuration: 0.8,
          style: {
            fontSize: 80,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
          },
        },
        {
          id: 'cta-button',
          name: 'Botão CTA',
          type: 'text',
          required: false,
          x: 340,
          y: 1600,
          width: 400,
          height: 80,
          startTime: 2,
          duration: 13,
          animation: 'fade-in',
          animationDuration: 0.5,
          style: {
            fontSize: 40,
            color: '#FFFFFF',
            backgroundColor: '#000000',
            borderRadius: 40,
            textAlign: 'center',
          },
        },
      ],
      variables: {},
      status: 'valid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Cria template educacional
   */
  private createEducationalTemplate(): VideoTemplate {
    return {
      id: 'educational',
      name: 'Aula Online',
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 30,
      backgroundColor: '#F5F5F5',
      placeholders: [
        {
          id: 'title',
          name: 'Título da Aula',
          type: 'text',
          required: true,
          x: 100,
          y: 50,
          width: 1720,
          height: 150,
          startTime: 0,
          duration: 30,
          style: {
            fontSize: 72,
            fontWeight: 'bold',
            color: '#2C3E50',
            textAlign: 'center',
          },
        },
        {
          id: 'content-area',
          name: 'Área de Conteúdo',
          type: 'image',
          required: false,
          x: 100,
          y: 250,
          width: 1720,
          height: 700,
          startTime: 0,
          duration: 30,
        },
        {
          id: 'instructor-name',
          name: 'Nome do Instrutor',
          type: 'text',
          required: true,
          x: 100,
          y: 980,
          width: 600,
          height: 60,
          startTime: 0,
          duration: 30,
          style: {
            fontSize: 36,
            color: '#7F8C8D',
          },
        },
      ],
      variables: {},
      status: 'valid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Cria template corporativo
   */
  private createCorporateTemplate(): VideoTemplate {
    return {
      id: 'corporate',
      name: 'Apresentação Corporativa',
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 20,
      backgroundColor: '#1E3A8A',
      placeholders: [
        {
          id: 'company-logo',
          name: 'Logo da Empresa',
          type: 'image',
          required: true,
          x: 100,
          y: 50,
          width: 300,
          height: 100,
          startTime: 0,
          duration: 20,
        },
        {
          id: 'slide-title',
          name: 'Título do Slide',
          type: 'text',
          required: true,
          x: 100,
          y: 200,
          width: 1720,
          height: 150,
          startTime: 0,
          duration: 20,
          style: {
            fontSize: 64,
            fontWeight: 'bold',
            color: '#FFFFFF',
          },
        },
        {
          id: 'content',
          name: 'Conteúdo',
          type: 'text',
          required: true,
          x: 100,
          y: 400,
          width: 1720,
          height: 500,
          startTime: 0,
          duration: 20,
          style: {
            fontSize: 32,
            color: '#E5E7EB',
          },
        },
      ],
      variables: {},
      status: 'valid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Cria template promocional
   */
  private createPromotionTemplate(): VideoTemplate {
    return {
      id: 'promotion',
      name: 'Promoção de Produto',
      width: 1200,
      height: 628,
      fps: 30,
      duration: 10,
      backgroundColor: '#FF6B6B',
      placeholders: [
        {
          id: 'product-image',
          name: 'Imagem do Produto',
          type: 'image',
          required: true,
          x: 50,
          y: 114,
          width: 500,
          height: 400,
          startTime: 0,
          duration: 10,
          animation: 'zoom-in',
          animationDuration: 1,
        },
        {
          id: 'offer-title',
          name: 'Título da Oferta',
          type: 'text',
          required: true,
          x: 600,
          y: 100,
          width: 550,
          height: 150,
          startTime: 0.5,
          duration: 9.5,
          animation: 'slide-right',
          animationDuration: 0.8,
          style: {
            fontSize: 56,
            fontWeight: 'bold',
            color: '#FFFFFF',
          },
        },
        {
          id: 'price',
          name: 'Preço',
          type: 'text',
          required: true,
          x: 600,
          y: 280,
          width: 550,
          height: 120,
          startTime: 1,
          duration: 9,
          animation: 'fade-in',
          animationDuration: 0.5,
          style: {
            fontSize: 72,
            fontWeight: 'bold',
            color: '#FFD700',
          },
        },
        {
          id: 'cta',
          name: 'Chamada para Ação',
          type: 'text',
          required: false,
          defaultValue: 'COMPRE AGORA!',
          x: 600,
          y: 450,
          width: 550,
          height: 80,
          startTime: 1.5,
          duration: 8.5,
          animation: 'bounce',
          animationDuration: 1,
          style: {
            fontSize: 40,
            fontWeight: 'bold',
            color: '#000000',
            backgroundColor: '#FFD700',
            borderRadius: 40,
            textAlign: 'center',
          },
        },
      ],
      variables: {},
      status: 'valid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Cria biblioteca básica
 */
export function createBasicLibrary(): VideoTemplateLibrary {
  return new VideoTemplateLibrary({
    maxTemplates: 500,
    enableFavorites: true,
    enableHistory: true,
    enableAnalytics: true,
    cacheEnabled: false,
  });
}

/**
 * Cria biblioteca premium
 */
export function createPremiumLibrary(): VideoTemplateLibrary {
  return new VideoTemplateLibrary({
    maxTemplates: 2000,
    enableFavorites: true,
    enableHistory: true,
    enableAnalytics: true,
    cacheEnabled: true,
  });
}

/**
 * Cria biblioteca de desenvolvimento
 */
export function createDevLibrary(): VideoTemplateLibrary {
  return new VideoTemplateLibrary({
    maxTemplates: 100,
    enableFavorites: false,
    enableHistory: false,
    enableAnalytics: false,
    cacheEnabled: false,
  });
}
