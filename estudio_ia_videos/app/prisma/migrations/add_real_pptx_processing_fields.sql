-- Migration: Add Real PPTX Processing Fields
-- This migration adds new fields to support real PPTX processing instead of mocks

-- Add new fields to Project table for real PPTX processing
ALTER TABLE "Project" ADD COLUMN "pptxMetadata" JSONB;
ALTER TABLE "Project" ADD COLUMN "pptxAssets" JSONB;
ALTER TABLE "Project" ADD COLUMN "pptxTimeline" JSONB;
ALTER TABLE "Project" ADD COLUMN "pptxStats" JSONB;
ALTER TABLE "Project" ADD COLUMN "imagesExtracted" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN "processingTime" DOUBLE PRECISION;
ALTER TABLE "Project" ADD COLUMN "phase" TEXT;
ALTER TABLE "Project" ADD COLUMN "failedAt" TEXT;

-- Add new fields to Slide table for real PPTX data
ALTER TABLE "Slide" ADD COLUMN "extractedText" TEXT;
ALTER TABLE "Slide" ADD COLUMN "slideNotes" TEXT;
ALTER TABLE "Slide" ADD COLUMN "slideLayout" JSONB;
ALTER TABLE "Slide" ADD COLUMN "slideImages" JSONB;
ALTER TABLE "Slide" ADD COLUMN "slideElements" JSONB;
ALTER TABLE "Slide" ADD COLUMN "slideMetrics" JSONB;

-- Add comments for documentation
COMMENT ON COLUMN "Project"."pptxMetadata" IS 'Real PPTX metadata (title, author, dimensions, etc.)';
COMMENT ON COLUMN "Project"."pptxAssets" IS 'Extracted assets (images, videos, audio, fonts, themes)';
COMMENT ON COLUMN "Project"."pptxTimeline" IS 'Timeline with scenes and transitions';
COMMENT ON COLUMN "Project"."pptxStats" IS 'Extraction statistics (textBlocks, images, shapes, etc.)';
COMMENT ON COLUMN "Project"."imagesExtracted" IS 'Number of images extracted from PPTX';
COMMENT ON COLUMN "Project"."processingTime" IS 'Processing time in seconds';
COMMENT ON COLUMN "Project"."phase" IS 'Current processing phase';
COMMENT ON COLUMN "Project"."failedAt" IS 'Phase where processing failed';

COMMENT ON COLUMN "Slide"."extractedText" IS 'Raw extracted text from PPTX';
COMMENT ON COLUMN "Slide"."slideNotes" IS 'Speaker notes from PPTX';
COMMENT ON COLUMN "Slide"."slideLayout" IS 'Detected layout information';
COMMENT ON COLUMN "Slide"."slideImages" IS 'Array of extracted image URLs';
COMMENT ON COLUMN "Slide"."slideElements" IS 'Detailed slide elements (shapes, textboxes, etc.)';
COMMENT ON COLUMN "Slide"."slideMetrics" IS 'Slide-specific metrics (word count, element count, etc.)';