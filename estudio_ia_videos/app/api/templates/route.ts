import { NextRequest, NextResponse } from 'next/server';
import { Template } from '@/types/templates';

// In-memory storage for demo purposes
// In production, this would be replaced with a database
let templates: Template[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const tags = searchParams.get('tags')?.split(',');
    const search = searchParams.get('search');
    const isFavorite = searchParams.get('isFavorite');
    const isCustom = searchParams.get('isCustom');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredTemplates = [...templates];

    // Apply filters
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    if (difficulty) {
      filteredTemplates = filteredTemplates.filter(t => t.metadata.difficulty === difficulty);
    }

    if (tags && tags.length > 0) {
      filteredTemplates = filteredTemplates.filter(t => 
        tags.some(tag => t.tags.includes(tag))
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (isFavorite !== null) {
      filteredTemplates = filteredTemplates.filter(t => t.isFavorite === (isFavorite === 'true'));
    }

    if (isCustom !== null) {
      filteredTemplates = filteredTemplates.filter(t => t.isCustom === (isCustom === 'true'));
    }

    // Apply pagination
    const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);

    return NextResponse.json({
      templates: paginatedTemplates,
      total: filteredTemplates.length,
      offset,
      limit,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();

    // Validate required fields
    if (!templateData.name || !templateData.category || !templateData.content) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, content' },
        { status: 400 }
      );
    }

    // Create new template
    const newTemplate: Template = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: templateData.name,
      description: templateData.description || '',
      category: templateData.category,
      thumbnail: templateData.thumbnail || generateDefaultThumbnail(templateData.category),
      preview: templateData.preview || generateDefaultPreview(templateData.category),
      tags: templateData.tags || [],
      isFavorite: false,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: templateData.author || 'User',
      version: templateData.version || '1.0',
      downloads: 0,
      rating: 0,
      content: templateData.content,
      metadata: {
        difficulty: templateData.metadata?.difficulty || 'beginner',
        estimatedDuration: templateData.metadata?.estimatedDuration || 30,
        targetAudience: templateData.metadata?.targetAudience || [],
        learningObjectives: templateData.metadata?.learningObjectives || [],
        prerequisites: templateData.metadata?.prerequisites || [],
        language: templateData.metadata?.language || 'pt-BR',
        accessibility: templateData.metadata?.accessibility || {
          screenReader: false,
          highContrast: false,
          keyboardNavigation: false,
          closedCaptions: false,
          audioDescription: false,
          signLanguage: false,
        },
        compliance: templateData.metadata?.compliance || {
          nrCategories: [templateData.category],
          lastAudit: new Date(),
          auditScore: 0,
          certifications: [],
        },
      },
    };

    // Add to templates array
    templates.push(newTemplate);

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const templateIndex = templates.findIndex(t => t.id === id);

    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Update template
    templates[templateIndex] = {
      ...templates[templateIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return NextResponse.json(templates[templateIndex]);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateIndex = templates.findIndex(t => t.id === id);

    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Remove template
    templates.splice(templateIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateDefaultThumbnail(category: string): string {
  const prompts: Record<string, string> = {
    'NR-12': 'safety training machines equipment industrial workplace',
    'NR-35': 'height work safety training construction harness',
    'NR-33': 'confined spaces safety training industrial tank',
    'NR-10': 'electrical safety training power lines equipment',
    'NR-06': 'personal protective equipment safety training',
    'NR-18': 'construction safety training building site',
    'NR-20': 'flammable combustible safety training industrial',
    'NR-23': 'fire protection safety training emergency',
  };

  const prompt = prompts[category] || 'safety training workplace industrial';
  return `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square`;
}

function generateDefaultPreview(category: string): string {
  const prompts: Record<string, string> = {
    'NR-12': 'safety training preview machines industrial',
    'NR-35': 'height safety training preview construction',
    'NR-33': 'confined spaces safety preview industrial',
    'NR-10': 'electrical safety training preview power',
    'NR-06': 'ppe safety training preview equipment',
    'NR-18': 'construction safety preview building',
    'NR-20': 'flammable safety training preview industrial',
    'NR-23': 'fire protection preview emergency training',
  };

  const prompt = prompts[category] || 'safety training preview workplace';
  return `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`;
}