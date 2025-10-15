

/**
 * API: NR Templates
 * Get all NR templates or specific template
 */

import { NextRequest, NextResponse } from 'next/server'
import { NR_TEMPLATES, getTemplateById, getTemplateByNR } from '@/lib/templates/nr-templates-complete'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const nr = searchParams.get('nr')

    if (id) {
      const template = getTemplateById(id)
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, template })
    }

    if (nr) {
      const template = getTemplateByNR(nr)
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, template })
    }

    // Return all templates
    return NextResponse.json({
      success: true,
      templates: NR_TEMPLATES,
      count: NR_TEMPLATES.length
    })

  } catch (error: any) {
    console.error('[NR Templates] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get templates' },
      { status: 500 }
    )
  }
}
