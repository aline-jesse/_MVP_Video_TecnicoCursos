'use client';

import React from 'react';
import { Template } from '@/types/templates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Download, 
  Eye, 
  Copy, 
  MoreHorizontal,
  Clock,
  Users,
  Star,
  Play,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: Template;
  viewMode: 'grid' | 'list';
  onSelect?: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onFavorite?: (templateId: string) => void;
  onDuplicate?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (templateId: string) => void;
  onExport?: (template: Template) => void;
  isFavorite?: boolean;
  isSelected?: boolean;
  showActions?: boolean;
}

export function TemplateCard({
  template,
  viewMode,
  onSelect,
  onPreview,
  onFavorite,
  onDuplicate,
  onEdit,
  onDelete,
  onExport,
  isFavorite = false,
  isSelected = false,
  showActions = true,
}: TemplateCardProps) {
  const handleSelect = () => {
    onSelect?.(template);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(template);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(template.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Básico';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return difficulty;
    }
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-blue-500"
        )}
        onClick={handleSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('safety training ' + template.category)}&image_size=square`;
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/50 text-white border-0"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {template.metadata.estimatedDuration}min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {template.metadata.targetAudience.length} públicos
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {template.downloads}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {template.rating.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleFavorite}
                      className={cn(
                        "p-2",
                        isFavorite && "text-red-500"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="p-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onPreview?.(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate?.(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onExport?.(template)}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete?.(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-2 items-end">
              <Badge variant="outline">{template.category}</Badge>
              <Badge className={getDifficultyColor(template.metadata.difficulty)}>
                {getDifficultyLabel(template.metadata.difficulty)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg group",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={handleSelect}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('safety training ' + template.category)}&image_size=landscape_16_9`;
            }}
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePreview}
              className="bg-white/90 text-black hover:bg-white"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSelect}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Usar
            </Button>
          </div>

          {/* Favorite Button */}
          {showActions && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFavorite}
              className={cn(
                "absolute top-2 right-2 p-2 bg-white/80 hover:bg-white",
                isFavorite && "text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
          )}

          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-white/90 text-black"
          >
            {template.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {template.description}
            </CardDescription>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {template.metadata.estimatedDuration}min
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {template.rating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {template.downloads}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge className={getDifficultyColor(template.metadata.difficulty)}>
              {getDifficultyLabel(template.metadata.difficulty)}
            </Badge>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="p-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPreview?.(template)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(template)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(template)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.(template)}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(template.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}