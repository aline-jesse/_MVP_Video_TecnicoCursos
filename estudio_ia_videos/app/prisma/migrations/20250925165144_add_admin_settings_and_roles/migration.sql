-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PROCESSING', 'COMPLETED', 'ERROR', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,
    "originalFileName" TEXT,
    "pptxUrl" TEXT,
    "slidesData" JSONB,
    "totalSlides" INTEGER NOT NULL DEFAULT 0,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "processingLog" JSONB,
    "errorMessage" TEXT,
    "audioUrl" TEXT,
    "ttsProvider" TEXT,
    "voiceId" TEXT,
    "settings" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slideNumber" INTEGER NOT NULL,
    "backgroundType" TEXT,
    "backgroundColor" TEXT,
    "backgroundImage" TEXT,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "transition" TEXT DEFAULT 'fade',
    "animationIn" TEXT,
    "animationOut" TEXT,
    "audioUrl" TEXT,
    "audioText" TEXT,
    "ttsGenerated" BOOLEAN NOT NULL DEFAULT false,
    "elements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "device" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemMetrics" (
    "id" TEXT NOT NULL,
    "totalProjects" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "processingQueue" INTEGER NOT NULL DEFAULT 0,
    "totalStorage" BIGINT NOT NULL DEFAULT 0,
    "videoStorage" BIGINT NOT NULL DEFAULT 0,
    "audioStorage" BIGINT NOT NULL DEFAULT 0,
    "ttsCallsElevenlabs" INTEGER NOT NULL DEFAULT 0,
    "ttsCallsAzure" INTEGER NOT NULL DEFAULT 0,
    "ttsCallsGoogle" INTEGER NOT NULL DEFAULT 0,
    "cacheHitRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgProcessTime" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL,

    CONSTRAINT "SystemMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoExport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "format" TEXT NOT NULL DEFAULT 'mp4',
    "quality" TEXT NOT NULL DEFAULT 'hd',
    "resolution" TEXT NOT NULL DEFAULT '1920x1080',
    "fps" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "videoUrl" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" BIGINT,
    "duration" INTEGER,
    "renderJobId" TEXT,
    "errorMessage" TEXT,
    "processingLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentStep" TEXT,
    "totalSteps" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "processingTime" INTEGER,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "workerId" TEXT,
    "workerNode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenderJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingQueue" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "jobData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentStep" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "result" JSONB,
    "workerId" TEXT,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessingQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'pt-BR',
    "gender" TEXT NOT NULL,
    "age" TEXT NOT NULL DEFAULT 'adult',
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "trainingStatus" TEXT NOT NULL DEFAULT 'ready',
    "quality" DOUBLE PRECISION DEFAULT 1.0,
    "style" TEXT,
    "stability" DOUBLE PRECISION DEFAULT 0.5,
    "similarityBoost" DOUBLE PRECISION DEFAULT 0.75,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "sampleUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGeneration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "inputText" TEXT,
    "inputData" JSONB,
    "outputData" JSONB,
    "outputUrl" TEXT,
    "settings" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "tokens" INTEGER,
    "characters" INTEGER,
    "duration" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "processedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderBatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "batchSettings" JSONB,
    "outputUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenderBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0066cc',
    "secondaryColor" TEXT NOT NULL DEFAULT '#f0f0f0',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#333333',
    "companyName" TEXT NOT NULL DEFAULT 'Estúdio IA de Vídeos',
    "subtitle" TEXT NOT NULL DEFAULT 'Transforme apresentações em vídeos inteligentes',
    "websiteUrl" TEXT,
    "supportEmail" TEXT,
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "documentTitle" TEXT NOT NULL DEFAULT 'Estúdio IA de Vídeos',
    "privacyPolicyUrl" TEXT,
    "termsOfServiceUrl" TEXT,
    "customSettings" JSONB,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Project_userId_status_idx" ON "Project"("userId", "status");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "Slide_projectId_slideNumber_idx" ON "Slide"("projectId", "slideNumber");

-- CreateIndex
CREATE INDEX "Analytics_userId_timestamp_idx" ON "Analytics"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "Analytics_eventType_timestamp_idx" ON "Analytics"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "SystemMetrics_date_idx" ON "SystemMetrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SystemMetrics_date_period_key" ON "SystemMetrics"("date", "period");

-- CreateIndex
CREATE INDEX "VideoExport_projectId_status_idx" ON "VideoExport"("projectId", "status");

-- CreateIndex
CREATE INDEX "VideoExport_status_createdAt_idx" ON "VideoExport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RenderJob_status_priority_idx" ON "RenderJob"("status", "priority");

-- CreateIndex
CREATE INDEX "RenderJob_type_status_idx" ON "RenderJob"("type", "status");

-- CreateIndex
CREATE INDEX "RenderJob_userId_idx" ON "RenderJob"("userId");

-- CreateIndex
CREATE INDEX "RenderJob_createdAt_idx" ON "RenderJob"("createdAt");

-- CreateIndex
CREATE INDEX "ProcessingQueue_status_priority_scheduledFor_idx" ON "ProcessingQueue"("status", "priority", "scheduledFor");

-- CreateIndex
CREATE INDEX "ProcessingQueue_jobType_status_idx" ON "ProcessingQueue"("jobType", "status");

-- CreateIndex
CREATE INDEX "ProcessingQueue_workerId_lockedUntil_idx" ON "ProcessingQueue"("workerId", "lockedUntil");

-- CreateIndex
CREATE INDEX "VoiceProfile_language_isActive_idx" ON "VoiceProfile"("language", "isActive");

-- CreateIndex
CREATE INDEX "VoiceProfile_provider_isActive_idx" ON "VoiceProfile"("provider", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceProfile_provider_providerId_key" ON "VoiceProfile"("provider", "providerId");

-- CreateIndex
CREATE INDEX "AIGeneration_projectId_type_idx" ON "AIGeneration"("projectId", "type");

-- CreateIndex
CREATE INDEX "AIGeneration_provider_status_idx" ON "AIGeneration"("provider", "status");

-- CreateIndex
CREATE INDEX "AIGeneration_createdAt_idx" ON "AIGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "FileUpload_userId_idx" ON "FileUpload"("userId");

-- CreateIndex
CREATE INDEX "FileUpload_status_idx" ON "FileUpload"("status");

-- CreateIndex
CREATE INDEX "FileUpload_uploadedAt_idx" ON "FileUpload"("uploadedAt");

-- CreateIndex
CREATE INDEX "RenderBatch_userId_idx" ON "RenderBatch"("userId");

-- CreateIndex
CREATE INDEX "RenderBatch_status_idx" ON "RenderBatch"("status");

-- CreateIndex
CREATE INDEX "RenderBatch_createdAt_idx" ON "RenderBatch"("createdAt");

-- CreateIndex
CREATE INDEX "SystemSettings_isActive_updatedAt_idx" ON "SystemSettings"("isActive", "updatedAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoExport" ADD CONSTRAINT "VideoExport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGeneration" ADD CONSTRAINT "AIGeneration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
