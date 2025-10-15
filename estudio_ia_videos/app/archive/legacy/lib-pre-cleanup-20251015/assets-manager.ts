
'use client'

/**
 * 🎨 ASSETS MANAGER - Sistema de Gerenciamento de Assets
 * Integração com provedores de mídia premium
 */

export interface Asset {
  id: string
  type: 'image' | 'video' | 'audio' | 'font' | 'template'
  url: string
  thumbnail?: string
  thumbnailUrl?: string // Alias para compatibilidade
  title: string
  description?: string
  tags: string[]
  license: 'free' | 'premium'
  provider: 'unsplash' | 'pexels' | 'pixabay' | 'freepik' | 'local'
  downloads?: number
  width?: number
  height?: number
  duration?: number
  size?: number
  userId?: string
  createdAt: string
  updatedAt: string
  source?: string // Origem do asset
  favorites?: number // Número de favoritos
  metadata?: {
    keywords?: string[]
    category?: string
    subcategory?: string
    style?: string
    mood?: string
    colors?: string[]
    orientation?: 'landscape' | 'portrait' | 'square'
    location?: string
    photographer?: string
    downloadUrl?: string
  }
}

export interface SearchFilters {
  category: string
  type?: Asset['type']
  license: string
  orientation?: 'landscape' | 'portrait' | 'square'
  color?: string
  duration?: {
    min: number
    max: number
  }
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  safeSearch: boolean
}

export interface SearchOptions {
  query: string
  filters: SearchFilters
  page: number
  perPage: number
}

export interface SearchResult {
  assets: Asset[]
  total: number
  page: number
  perPage: number
  hasMore: boolean
}

// Mock data para desenvolvimento
const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    type: 'image',
    url: '/nr12-intro.jpg',
    thumbnail: '/nr12-intro-thumb.jpg',
    title: 'NR-12 Introdução',
    description: 'Imagem de abertura para treinamento NR-12',
    tags: ['segurança', 'nr-12', 'máquinas', 'treinamento'],
    license: 'free',
    provider: 'local',
    downloads: 234,
    width: 1920,
    height: 1080,
    size: 1024000,
    createdAt: '2024-09-20T10:00:00Z',
    updatedAt: '2024-09-20T10:00:00Z'
  },
  {
    id: 'asset-2',
    type: 'video',
    url: '/samples/manufacturing-safety.mp4',
    thumbnail: '/samples/manufacturing-safety-thumb.jpg',
    title: 'Segurança na Manufatura',
    description: 'Vídeo sobre práticas seguras na indústria',
    tags: ['segurança', 'indústria', 'manufatura', 'epi'],
    license: 'premium',
    provider: 'pexels',
    downloads: 156,
    width: 1920,
    height: 1080,
    duration: 180,
    size: 50000000,
    createdAt: '2024-09-22T14:30:00Z',
    updatedAt: '2024-09-22T14:30:00Z'
  }
]

class AssetsManager {
  private apiKey: string | null = null
  private cache = new Map<string, SearchResult>()

  constructor() {
    // Inicializar com chaves de API se disponíveis
    this.apiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || null
  }

  async searchAssets(options: SearchOptions): Promise<SearchResult> {
    try {
      const cacheKey = JSON.stringify(options)
      
      // Verificar cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!
        return cached
      }

      // Simular busca em provedores externos
      let assets: Asset[] = []

      if (options.query) {
        assets = mockAssets.filter(asset =>
          asset.title.toLowerCase().includes(options.query.toLowerCase()) ||
          asset.tags.some(tag => tag.toLowerCase().includes(options.query.toLowerCase()))
        )
      } else {
        assets = mockAssets
      }

      // Aplicar filtros
      if (options.filters.type) {
        assets = assets.filter(asset => asset.type === options.filters.type)
      }

      if (options.filters.license && options.filters.license !== 'all') {
        assets = assets.filter(asset => asset.license === options.filters.license)
      }

      // Paginação
      const startIndex = (options.page - 1) * options.perPage
      const endIndex = startIndex + options.perPage
      const paginatedAssets = assets.slice(startIndex, endIndex)

      const result: SearchResult = {
        assets: paginatedAssets,
        total: assets.length,
        page: options.page,
        perPage: options.perPage,
        hasMore: endIndex < assets.length
      }

      // Cache do resultado
      this.cache.set(cacheKey, result)

      return result
    } catch (error) {
      console.error('Erro ao buscar assets:', error)
      throw new Error('Falha ao buscar assets')
    }
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const asset = mockAssets.find(a => a.id === id)
    return asset || null
  }

  async uploadAsset(file: File, metadata: Partial<Asset>): Promise<Asset> {
    try {
      // Simular upload
      const asset: Asset = {
        id: `asset-${Date.now()}`,
        type: this.getAssetTypeFromFile(file),
        url: URL.createObjectURL(file),
        title: metadata.title || file.name,
        description: metadata.description,
        tags: metadata.tags || [],
        license: 'free',
        provider: 'local',
        downloads: 0,
        size: file.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockAssets.push(asset)
      return asset
    } catch (error) {
      console.error('Erro ao fazer upload do asset:', error)
      throw new Error('Falha no upload do asset')
    }
  }

  async deleteAsset(id: string): Promise<boolean> {
    try {
      const index = mockAssets.findIndex(a => a.id === id)
      if (index !== -1) {
        mockAssets.splice(index, 1)
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao deletar asset:', error)
      return false
    }
  }

  async getFavorites(userId: string): Promise<Asset[]> {
    // Implementar sistema de favoritos
    return mockAssets.filter(asset => asset.userId === userId)
  }

  async addToFavorites(assetId: string, userId: string): Promise<boolean> {
    try {
      // Implementar lógica de favoritos
      return true
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error)
      return false
    }
  }

  async removeFromFavorites(assetId: string, userId: string): Promise<boolean> {
    try {
      // Implementar lógica de remoção de favoritos
      return true
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error)
      return false
    }
  }

  async getAllCollections(): Promise<Asset[]> {
    try {
      // Retorna todas as coleções de assets
      return mockAssets
    } catch (error) {
      console.error('Erro ao obter todas as coleções:', error)
      return []
    }
  }

  async searchAll(query: string, options?: Partial<SearchOptions>): Promise<Asset[]> {
    try {
      const searchOptions: SearchOptions = {
        query,
        filters: {
          category: 'all',
          license: 'all',
          safeSearch: true,
          ...options?.filters
        },
        page: 1,
        perPage: 50,
        ...options
      }

      const result = await this.searchAssets(searchOptions)
      return result.assets
    } catch (error) {
      console.error('Erro na busca geral:', error)
      return []
    }
  }

  async uploadCustomAsset(file: File, customData: Partial<Asset>): Promise<Asset> {
    try {
      const asset: Asset = {
        id: `custom-${Date.now()}`,
        type: this.getAssetTypeFromFile(file),
        url: URL.createObjectURL(file),
        thumbnail: URL.createObjectURL(file),
        thumbnailUrl: URL.createObjectURL(file),
        title: customData.title || file.name,
        description: customData.description || 'Asset personalizado',
        tags: customData.tags || ['personalizado', 'upload'],
        license: 'free',
        provider: 'local',
        downloads: 0,
        size: file.size,
        width: customData.width,
        height: customData.height,
        duration: customData.duration,
        userId: customData.userId,
        source: customData.source || 'upload-local',
        favorites: 0,
        metadata: customData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...customData
      }

      mockAssets.push(asset)
      return asset
    } catch (error) {
      console.error('Erro ao fazer upload personalizado:', error)
      throw new Error('Falha no upload personalizado')
    }
  }

  private getAssetTypeFromFile(file: File): Asset['type'] {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    return 'template'
  }

  // Integração com Unsplash
  private async searchUnsplash(query: string, page: number = 1): Promise<Asset[]> {
    if (!this.apiKey) return []

    try {
      const response = await fetch(
        `https://images.unsplash.com/photo-1508921108053-9f757ead871c?auto=format%2Ccompress&fm=webp&fit=crop&crop=faces%2Cedges&w=1200&h=675&q=60&cs=tinysrgb`,
        {
          headers: {
            'Authorization': `Client-ID ${this.apiKey}`
          }
        }
      )

      if (!response.ok) throw new Error('Falha na API do Unsplash')

      const data = await response.json()
      
      return data.results.map((photo: any) => ({
        id: `unsplash-${photo.id}`,
        type: 'image' as const,
        url: photo.urls.regular,
        thumbnail: photo.urls.thumb,
        title: photo.description || photo.alt_description || 'Imagem do Unsplash',
        description: photo.description,
        tags: photo.tags?.map((tag: any) => tag.title) || [],
        license: 'free' as const,
        provider: 'unsplash' as const,
        downloads: photo.downloads,
        width: photo.width,
        height: photo.height,
        createdAt: photo.created_at,
        updatedAt: photo.updated_at
      }))
    } catch (error) {
      console.error('Erro na busca do Unsplash:', error)
      return []
    }
  }
}

// Aliases para compatibilidade
export type AssetItem = Asset
export interface AssetCollection {
  assets: Asset[]
  total: number
  page: number
}

export const SEARCH_PRESETS = {
  'seguranca-trabalho': {
    query: 'segurança trabalho',
    filters: {
      category: 'safety',
      type: 'image' as Asset['type'],
      license: 'all',
      safeSearch: true
    }
  },
  'nr-templates': {
    query: 'normas regulamentadoras',
    filters: {
      category: 'training',
      type: 'template' as Asset['type'],
      license: 'premium',
      safeSearch: true
    }
  },
  'avatares': {
    query: 'pessoas profissionais',
    filters: {
      category: 'people',
      type: 'image' as Asset['type'],
      license: 'all',
      safeSearch: true
    }
  }
}

const assetsManager = new AssetsManager()
export { assetsManager }
export default assetsManager
