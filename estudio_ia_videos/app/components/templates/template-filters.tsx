'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Filter } from 'lucide-react';
import { TemplateFilter, NRCategory } from '@/types/templates';

interface TemplateFiltersProps {
  filter: TemplateFilter;
  onFilterChange: (filter: Partial<TemplateFilter>) => void;
  onClearFilters: () => void;
  categoryStats: Record<NRCategory, number>;
}

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  filter,
  onFilterChange,
  onClearFilters,
  categoryStats,
}) => {
  const nrCategories: NRCategory[] = [
    'NR-01', 'NR-02', 'NR-03', 'NR-04', 'NR-05',
    'NR-06', 'NR-07', 'NR-08', 'NR-09', 'NR-10',
    'NR-11', 'NR-12', 'NR-13', 'NR-14', 'NR-15',
    'NR-16', 'NR-17', 'NR-18', 'NR-19', 'NR-20',
    'NR-21', 'NR-22', 'NR-23', 'NR-24', 'NR-25',
    'NR-26', 'NR-27', 'NR-28', 'NR-29', 'NR-30',
    'NR-31', 'NR-32', 'NR-33', 'NR-34', 'NR-35',
    'NR-36', 'NR-37', 'CUSTOM'
  ];

  const popularTags = [
    'Segurança', 'Treinamento', 'EPI', 'Procedimento',
    'Emergência', 'Prevenção', 'Inspeção', 'Manutenção',
    'Operação', 'Compliance', 'Auditoria', 'Certificação'
  ];

  const handleCategoryChange = (category: NRCategory, checked: boolean) => {
    const currentCategories = filter.category || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    
    onFilterChange({ category: newCategories });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const currentTags = filter.tags || [];
    const newTags = checked
      ? [...currentTags, tag]
      : currentTags.filter(t => t !== tag);
    
    onFilterChange({ tags: newTags });
  };

  const handleRatingChange = (rating: number[]) => {
    onFilterChange({ rating: rating[0] });
  };

  const hasActiveFilters = () => {
    return (
      (filter.category && filter.category.length > 0) ||
      (filter.tags && filter.tags.length > 0) ||
      filter.author ||
      filter.rating ||
      filter.isFavorite !== undefined ||
      filter.isCustom !== undefined
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
          {hasActiveFilters() && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Categorias NR</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {nrCategories.map((category) => {
              const count = categoryStats[category] || 0;
              if (count === 0) return null;
              
              return (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filter.category?.includes(category) || false}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category} ({count})
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Tags Populares</h4>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={filter.tags?.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => handleTagChange(tag, !filter.tags?.includes(tag))}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Avaliação Mínima: {filter.rating || 0} estrelas
          </h4>
          <Slider
            value={[filter.rating || 0]}
            onValueChange={handleRatingChange}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Type Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Tipo</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorites"
                  checked={filter.isFavorite === true}
                  onCheckedChange={(checked) => 
                    onFilterChange({ 
                      isFavorite: checked ? true : undefined 
                    })
                  }
                />
                <label htmlFor="favorites" className="text-sm cursor-pointer">
                  Apenas Favoritos
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom"
                  checked={filter.isCustom === true}
                  onCheckedChange={(checked) => 
                    onFilterChange({ 
                      isCustom: checked ? true : undefined 
                    })
                  }
                />
                <label htmlFor="custom" className="text-sm cursor-pointer">
                  Apenas Personalizados
                </label>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Ordenar Por</h4>
            <Select
              value={filter.sortBy || 'name'}
              onValueChange={(value) => 
                onFilterChange({ sortBy: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="date">Data de Atualização</SelectItem>
                <SelectItem value="rating">Avaliação</SelectItem>
                <SelectItem value="downloads">Downloads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Ordem</h4>
            <Select
              value={filter.sortOrder || 'asc'}
              onValueChange={(value) => 
                onFilterChange({ sortOrder: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Crescente</SelectItem>
                <SelectItem value="desc">Decrescente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Filtros Ativos</h4>
            <div className="flex flex-wrap gap-2">
              {filter.category?.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleCategoryChange(category, false)}
                  />
                </Badge>
              ))}
              {filter.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleTagChange(tag, false)}
                  />
                </Badge>
              ))}
              {filter.rating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ≥ {filter.rating} estrelas
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFilterChange({ rating: undefined })}
                  />
                </Badge>
              )}
              {filter.isFavorite && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Favoritos
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFilterChange({ isFavorite: undefined })}
                  />
                </Badge>
              )}
              {filter.isCustom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Personalizados
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => onFilterChange({ isCustom: undefined })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};