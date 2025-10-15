import React from 'react'
import { FileText } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
}

interface TemplateLibraryProps {
  onTemplateSelect: (template: Template) => void
}

export const TemplateLibrary = ({ onTemplateSelect }: TemplateLibraryProps) => {
  const mockTemplates: Template[] = [
    { id: '1', name: 'Business Professional', description: 'Template corporativo moderno', category: 'Business' },
    { id: '2', name: 'Educational', description: 'Para apresentações educacionais', category: 'Education' },
    { id: '3', name: 'Marketing', description: 'Template para campanhas de marketing', category: 'Marketing' }
  ]

  return (
    <div className="space-y-4">
      <div className="text-center p-8">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Biblioteca de Templates</h3>
        <p className="text-sm text-gray-500 mb-4">Escolha um template para começar</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockTemplates.map((template) => (
          <div 
            key={template.id}
            className="border rounded-lg p-4 hover:shadow-md cursor-pointer"
            onClick={() => onTemplateSelect(template)}
          >
            <h4 className="font-medium">{template.name}</h4>
            <p className="text-sm text-gray-500">{template.description}</p>
            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {template.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}