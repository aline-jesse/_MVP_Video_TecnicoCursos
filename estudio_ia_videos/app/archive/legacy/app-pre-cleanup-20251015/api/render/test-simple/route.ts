import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Simple test endpoint working! (GET)',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Simple test endpoint working! (POST)',
    timestamp: new Date().toISOString()
  });
}