'use client';

import React from 'react';
import { TemplateLibrary } from '@/components/templates/template-library';
import { Template } from '@/types/templates';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TemplatesPage() {
  const router = useRouter();

  const handleSelectTemplate = (template: Template) => {
    // Store selected template in localStorage for the editor
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    
    // Navigate to editor with template
    router.push(`/editor?template=${template.id}`);
    
    toast.success(`Template "${template.name}" selecionado!`);
  };

  const handleCreateNew = () => {
    // Navigate to template creator
    router.push('/templates/create');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onCreateNew={handleCreateNew}
        />
      </div>
    </div>
  );
}