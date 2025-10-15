import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Test basic import
    const { getServerSession } = await import('next-auth');
    
    return NextResponse.json({
      success: true,
      message: 'next-auth import successful',
      hasGetServerSession: typeof getServerSession === 'function'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
