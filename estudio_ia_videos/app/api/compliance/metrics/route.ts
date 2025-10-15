import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user's projects
    const userProjects = await prisma.project.findMany({
      where: { userId },
      select: { id: true }
    });

    const projectIds = userProjects.map(p => p.id);

    // Get compliance validations
    const validations = await prisma.complianceValidation.findMany({
      where: {
        projectId: { in: projectIds },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get NR compliance records
    const nrRecords = await prisma.nRComplianceRecord.findMany({
      where: {
        projectId: { in: projectIds },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate metrics
    const totalValidations = validations.length;
    const averageScore = validations.length > 0 
      ? validations.reduce((sum, v) => sum + v.score, 0) / validations.length 
      : 0;

    // Compliance by NR type
    const complianceByNR = validations.reduce((acc, validation) => {
      const nr = validation.nrType;
      if (!acc[nr]) {
        acc[nr] = { total: 0, scores: [] };
      }
      acc[nr].total++;
      acc[nr].scores.push(validation.score);
      return acc;
    }, {} as Record<string, { total: number; scores: number[] }>);

    const nrMetrics = Object.entries(complianceByNR).map(([nr, data]) => ({
      nr,
      total: data.total,
      averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      lastValidation: validations.find(v => v.nrType === nr)?.createdAt
    }));

    // Trend data (last 7 days)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayValidations = validations.filter(v => 
        v.createdAt >= dayStart && v.createdAt <= dayEnd
      );

      trendData.push({
        date: dayStart.toISOString().split('T')[0],
        validations: dayValidations.length,
        averageScore: dayValidations.length > 0 
          ? dayValidations.reduce((sum, v) => sum + v.score, 0) / dayValidations.length 
          : 0
      });
    }

    // Critical issues (scores below 70)
    const criticalIssues = validations.filter(v => v.score < 70).length;

    // Recent validations
    const recentValidations = validations.slice(0, 10).map(v => ({
      id: v.id,
      projectId: v.projectId,
      nrType: v.nrType,
      score: v.score,
      createdAt: v.createdAt,
      suggestions: v.suggestions ? JSON.parse(v.suggestions) : []
    }));

    return NextResponse.json({
      summary: {
        totalValidations,
        averageScore: Math.round(averageScore),
        criticalIssues,
        complianceRate: Math.round((validations.filter(v => v.score >= 80).length / Math.max(totalValidations, 1)) * 100)
      },
      nrMetrics,
      trendData,
      recentValidations
    });

  } catch (error) {
    console.error('Error fetching compliance metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}