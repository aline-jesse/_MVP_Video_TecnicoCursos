
/**
 * SPRINT 34 - AI RECOMMENDATIONS API
 * Endpoint for AI-powered template and compliance recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  recommendTemplates,
  checkCompliance,
  generateContentSuggestions,
} from '@/lib/ai/template-recommendation';
import {
  generateTrainingContent,
  generateContentSummary,
  generateScriptFromPoints,
} from '@/lib/ai/smart-content-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, context, topic, targetAudience, duration } = body;

    switch (type) {
      case 'template':
        // Recommend templates based on content
        const templateRecommendations = await recommendTemplates(content, context);
        return NextResponse.json({
          success: true,
          recommendations: templateRecommendations,
        });

      case 'compliance':
        // Check compliance requirements
        const complianceChecks = await checkCompliance(content);
        return NextResponse.json({
          success: true,
          checks: complianceChecks,
        });

      case 'content-suggestions':
        // Generate content suggestions
        const suggestions = await generateContentSuggestions(topic, content);
        return NextResponse.json({
          success: true,
          suggestions,
        });

      case 'generate-training':
        // Generate complete training content
        const trainingContent = await generateTrainingContent({
          topic,
          targetAudience,
          duration,
          language: 'pt-BR',
          tone: 'conversational',
        });
        return NextResponse.json({
          success: true,
          content: trainingContent,
        });

      case 'summarize':
        // Summarize content
        const summary = await generateContentSummary(content);
        return NextResponse.json({
          success: true,
          summary,
        });

      case 'script-from-points':
        // Generate script from bullet points
        const script = await generateScriptFromPoints(content.split('\n'));
        return NextResponse.json({
          success: true,
          script,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid recommendation type',
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('AI Recommendations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for quick template recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const industry = searchParams.get('industry');

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter required',
        },
        { status: 400 }
      );
    }

    const recommendations = await recommendTemplates(query, {
      industry: industry || undefined,
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error: any) {
    console.error('AI Recommendations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}
