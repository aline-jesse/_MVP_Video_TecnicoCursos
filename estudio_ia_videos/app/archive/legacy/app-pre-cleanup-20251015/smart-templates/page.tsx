
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Search, 
  Filter,
  Download,
  Eye,
  Star,
  Zap,
  Award,
  Briefcase,
  Shield,
  Wrench,
  HardHat,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

const smartTemplates = [
  {
    id: "nr06-smart",
    title: "NR-06 Smart EPI",
    category: "Equipamentos",
    description: "Template inteligente para treinamento em Equipamentos de Proteção Individual",
    rating: 4.9,
    downloads: 2847,
    compliance: 98,
    icon: Shield,
    color: "bg-green-500",
    tags: ["EPI", "NR-06", "IA", "Smart"]
  },
  {
    id: "nr12-machines",
    title: "NR-12 Máquinas IA",
    category: "Máquinas",
    description: "Sistema inteligente para segurança em máquinas e equipamentos",
    rating: 4.8,
    downloads: 1956,
    compliance: 96,
    icon: Wrench,
    color: "bg-blue-500",
    tags: ["Máquinas", "NR-12", "Automação", "IA"]
  },
  {
    id: "nr33-confined",
    title: "NR-33 Espaços Confinados Smart",
    category: "Espaços Confinados",
    description: "Template avançado com simulação IA para espaços confinados",
    rating: 4.9,
    downloads: 1743,
    compliance: 99,
    icon: AlertTriangle,
    color: "bg-orange-500",
    tags: ["Confinados", "NR-33", "Simulação", "IA"]
  },
  {
    id: "nr35-height",
    title: "NR-35 Trabalho em Altura IA",
    category: "Altura",
    description: "Sistema inteligente para treinamentos em trabalho em altura",
    rating: 4.7,
    downloads: 2134,
    compliance: 97,
    icon: HardHat,
    color: "bg-purple-500",
    tags: ["Altura", "NR-35", "3D", "IA"]
  },
  {
    id: "nr18-construction",
    title: "NR-18 Construção Civil Smart",
    category: "Construção",
    description: "Template avançado para segurança na construção civil",
    rating: 4.8,
    downloads: 3021,
    compliance: 95,
    icon: Briefcase,
    color: "bg-amber-500",
    tags: ["Construção", "NR-18", "Civil", "IA"]
  },
  {
    id: "nr10-electrical",
    title: "NR-10 Elétrica IA Advanced",
    category: "Elétrica",
    description: "Sistema inteligente para segurança em instalações elétricas",
    rating: 4.9,
    downloads: 2698,
    compliance: 99,
    icon: Zap,
    color: "bg-yellow-500",
    tags: ["Elétrica", "NR-10", "Energia", "IA"]
  }
];

const categories = ["Todos", "Equipamentos", "Máquinas", "Espaços Confinados", "Altura", "Construção", "Elétrica"];

export default function SmartTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("rating");

  const filteredTemplates = smartTemplates
    .filter(template => 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(template => selectedCategory === "Todos" || template.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "downloads": return b.downloads - a.downloads;
        case "compliance": return b.compliance - a.compliance;
        default: return 0;
      }
    });

  const handleDownload = (template: any) => {
    toast.success(`Baixando template: ${template.title}`);
    // Simular download
    setTimeout(() => {
      toast.success("Download concluído!");
    }, 2000);
  };

  const handlePreview = (template: any) => {
    toast.success(`Abrindo preview: ${template.title}`);
    // Redirecionar para preview
  };

  const handleUseTemplate = (template: any) => {
    toast.success(`Iniciando projeto com: ${template.title}`);
    // Redirecionar para editor com template
    setTimeout(() => {
      window.location.href = `/pptx-studio-enhanced?template=${template.id}`;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-purple-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Smart Templates
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Templates inteligentes com IA para Normas Regulamentadoras
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">127</div>
              <div className="text-sm text-gray-600">Templates IA</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">97.2%</div>
              <div className="text-sm text-gray-600">Compliance Médio</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">15,249</div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">4.8★</div>
              <div className="text-sm text-gray-600">Avaliação</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar templates inteligentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="rating">Melhor Avaliados</option>
                <option value="downloads">Mais Baixados</option>
                <option value="compliance">Maior Compliance</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card key={template.id} className="hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 ${template.color} rounded-xl`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {template.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-amber-500">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        {template.rating}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-gray-500">Downloads</div>
                      <div className="font-semibold">{template.downloads.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Compliance</div>
                      <div className="font-semibold text-green-600">{template.compliance}%</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Usar Template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum template encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou termos de busca
              </p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Todos");
                }}
              >
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-purple-500 to-blue-500 border-0">
          <CardContent className="p-8 text-center text-white">
            <Award className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Precisa de um Template Personalizado?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Nossa IA pode criar templates customizados para suas necessidades específicas
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => {
                toast.success('Redirecionando para criação personalizada...')
                window.location.href = '/ia-assistant-studio?tab=smart-templates'
              }}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Criar Template Personalizado
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
