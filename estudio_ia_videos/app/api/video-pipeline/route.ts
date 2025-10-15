/**
 * GET/POST /api/video-pipeline
 * Video pipeline endpoint for render engine
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Video pipeline endpoint working!",
    endpoint: "/api/video-pipeline",
    methods: ["GET", "POST"],
    timestamp: new Date().toISOString(),
    status: "operational"
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, preset_id } = body;

    if (!project_id || !preset_id) {
      return NextResponse.json(
        { error: "project_id and preset_id are required" },
        { status: 400 }
      );
    }

    // Generate job ID
    const job_id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      job_id,
      status: "queued",
      project_id,
      preset_id,
      message: "Video pipeline render job created successfully",
      created_at: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}