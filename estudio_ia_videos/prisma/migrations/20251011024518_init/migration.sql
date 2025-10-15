-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "currentOrgId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "organizationId" TEXT,
    "userId" TEXT NOT NULL,
    "originalFileName" TEXT,
    "pptxUrl" TEXT,
    "slidesData" JSONB,
    "totalSlides" INTEGER NOT NULL DEFAULT 0,
    "pptxMetadata" JSONB,
    "pptxAssets" JSONB,
    "pptxTimeline" JSONB,
    "pptxStats" JSONB,
    "imagesExtracted" INTEGER NOT NULL DEFAULT 0,
    "processingTime" REAL,
    "phase" TEXT,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "processingLog" JSONB,
    "errorMessage" TEXT,
    "failedAt" TEXT,
    "audioUrl" TEXT,
    "ttsProvider" TEXT,
    "voiceId" TEXT,
    "autoNarration" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slideNumber" INTEGER NOT NULL,
    "extractedText" TEXT,
    "slideNotes" TEXT,
    "slideLayout" JSONB,
    "slideImages" JSONB,
    "slideElements" JSONB,
    "slideMetrics" JSONB,
    "backgroundType" TEXT,
    "backgroundColor" TEXT,
    "backgroundImage" TEXT,
    "duration" REAL NOT NULL DEFAULT 5.0,
    "transition" TEXT DEFAULT 'fade',
    "animationIn" TEXT,
    "animationOut" TEXT,
    "audioUrl" TEXT,
    "audioText" TEXT,
    "ttsGenerated" BOOLEAN NOT NULL DEFAULT false,
    "elements" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Slide_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "device" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Analytics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalProjects" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "processingQueue" INTEGER NOT NULL DEFAULT 0,
    "totalStorage" BIGINT NOT NULL DEFAULT 0,
    "videoStorage" BIGINT NOT NULL DEFAULT 0,
    "audioStorage" BIGINT NOT NULL DEFAULT 0,
    "ttsCallsElevenlabs" INTEGER NOT NULL DEFAULT 0,
    "ttsCallsAzure" INTEGER NOT NULL DEFAULT 0,
    "ttsCallsGoogle" INTEGER NOT NULL DEFAULT 0,
    "cacheHitRate" REAL NOT NULL DEFAULT 0.0,
    "avgProcessTime" REAL NOT NULL DEFAULT 0.0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VideoExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoExport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessingQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobType" TEXT NOT NULL,
    "jobData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "scheduledFor" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentStep" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "result" JSONB,
    "workerId" TEXT,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VoiceProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'pt-BR',
    "gender" TEXT NOT NULL,
    "age" TEXT NOT NULL DEFAULT 'adult',
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "trainingStatus" TEXT NOT NULL DEFAULT 'ready',
    "quality" REAL DEFAULT 1.0,
    "style" TEXT,
    "stability" REAL DEFAULT 0.5,
    "similarityBoost" REAL DEFAULT 0.75,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" DATETIME,
    "sampleUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "duration" REAL,
    "cost" REAL,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIGeneration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "processedData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RenderBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectIds" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "batchSettings" JSONB,
    "outputUrls" TEXT NOT NULL DEFAULT '[]',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "estimatedTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "position" TEXT,
    "parentId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProjectComment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "versionNumber" INTEGER NOT NULL,
    "projectData" JSONB NOT NULL,
    "canvasData" JSONB,
    "settings" JSONB,
    "fileSize" BIGINT,
    "checksum" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NRTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nr" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "slides" JSONB NOT NULL,
    "duration" REAL NOT NULL DEFAULT 0,
    "thumbnailUrl" TEXT,
    "certification" TEXT,
    "validUntil" DATETIME,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "maxMembers" INTEGER NOT NULL DEFAULT 5,
    "maxProjects" INTEGER NOT NULL DEFAULT 10,
    "maxStorage" BIGINT NOT NULL DEFAULT 1073741824,
    "currentMembers" INTEGER NOT NULL DEFAULT 0,
    "currentProjects" INTEGER NOT NULL DEFAULT 0,
    "currentStorage" BIGINT NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "alertSettings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "permissions" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "invitedBy" TEXT,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCustomerId" TEXT,
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "trialStart" DATETIME,
    "trialEnd" DATETIME,
    "cancelAt" DATETIME,
    "canceledAt" DATETIME,
    "cancelReason" TEXT,
    "paymentMethod" TEXT,
    "lastPaymentDate" DATETIME,
    "nextPaymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhiteLabelSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "companyName" TEXT,
    "tagline" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0066cc',
    "secondaryColor" TEXT NOT NULL DEFAULT '#f0f0f0',
    "accentColor" TEXT NOT NULL DEFAULT '#ff6b35',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#333333',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "fontUrl" TEXT,
    "customDomain" TEXT,
    "domainVerified" BOOLEAN NOT NULL DEFAULT false,
    "domainVerifiedAt" DATETIME,
    "welcomeMessage" TEXT,
    "footerText" TEXT,
    "privacyPolicyUrl" TEXT,
    "termsOfServiceUrl" TEXT,
    "supportEmail" TEXT,
    "supportUrl" TEXT,
    "customCSS" TEXT,
    "customJS" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WhiteLabelSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganizationSSO" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "samlEntryPoint" TEXT,
    "samlIssuer" TEXT,
    "samlCert" TEXT,
    "samlMetadataXML" TEXT,
    "oauthClientId" TEXT,
    "oauthClientSecret" TEXT,
    "oauthAuthUrl" TEXT,
    "oauthTokenUrl" TEXT,
    "oauthUserInfoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "enforceSSO" BOOLEAN NOT NULL DEFAULT false,
    "attributeMapping" JSONB,
    "lastTestedAt" DATETIME,
    "testStatus" TEXT,
    "testError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrganizationSSO_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Alert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "category" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "label" TEXT,
    "metadata" JSONB,
    "duration" INTEGER,
    "fileSize" INTEGER,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "projectId" TEXT,
    "templateId" TEXT,
    "provider" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "tracks" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "totalDuration" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Timeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoiceClone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'elevenlabs',
    "voiceId" TEXT NOT NULL,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "trainingStatus" TEXT NOT NULL DEFAULT 'pending',
    "qualityScore" REAL,
    "samplesS3Keys" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "NRComplianceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "nr" TEXT NOT NULL,
    "nrName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "finalScore" REAL,
    "aiAnalysis" JSONB,
    "aiScore" REAL,
    "confidence" REAL,
    "requirementsMet" INTEGER NOT NULL DEFAULT 0,
    "requirementsTotal" INTEGER NOT NULL DEFAULT 0,
    "validatedAt" DATETIME,
    "validatedBy" TEXT,
    "reportUrl" TEXT,
    "recommendations" JSONB,
    "criticalPoints" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NRComplianceRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "signatureHash" TEXT,
    "issuedBy" TEXT,
    "issuedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "reviewers" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'review',
    "comments" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT
);

-- CreateTable
CREATE TABLE "Avatar3DProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatarId" TEXT NOT NULL,
    "avatarName" TEXT NOT NULL,
    "resolution" TEXT NOT NULL DEFAULT 'HD',
    "fps" INTEGER NOT NULL DEFAULT 30,
    "background" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "progress" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "RenderJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceFile" TEXT NOT NULL,
    "outputFormat" TEXT NOT NULL,
    "quality" TEXT NOT NULL,
    "settings" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "processingLog" JSONB,
    "outputUrl" TEXT,
    "fileSize" BIGINT,
    "duration" INTEGER,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastAttempt" DATETIME,
    "processingTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RenderJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avatar3DClip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "avatarId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "startTime" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "positionX" REAL NOT NULL DEFAULT 0,
    "positionY" REAL NOT NULL DEFAULT 0,
    "scale" REAL NOT NULL DEFAULT 1,
    "lipSyncFrames" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Avatar3DClip_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Avatar3DProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avatar3DRenderJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "clipId" TEXT,
    "userId" TEXT NOT NULL,
    "avatarId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "resolution" TEXT NOT NULL DEFAULT 'HD',
    "fps" INTEGER NOT NULL DEFAULT 30,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" REAL NOT NULL DEFAULT 0,
    "currentStage" TEXT,
    "estimatedTime" INTEGER,
    "videoUrl" TEXT,
    "thumbnail" TEXT,
    "fileSize" INTEGER,
    "error" TEXT,
    "errorDetails" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "renderTime" INTEGER,
    "lipSyncFrames" INTEGER,
    "qualityScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ComplianceValidation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "nrType" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "topicsCovered" TEXT NOT NULL,
    "topicsMissing" TEXT NOT NULL,
    "criticalPointsCovered" TEXT NOT NULL,
    "criticalPointsMissing" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "validatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "slack" BOOLEAN NOT NULL DEFAULT false,
    "teams" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "events" JSONB NOT NULL,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryInterval" INTEGER NOT NULL DEFAULT 60,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "successfulDeliveries" INTEGER NOT NULL DEFAULT 0,
    "failedDeliveries" INTEGER NOT NULL DEFAULT 0,
    "lastDeliveryAt" DATETIME,
    "avgResponseTime" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "responseCode" INTEGER,
    "responseBody" TEXT,
    "responseTime" INTEGER,
    "error" TEXT,
    "scheduledFor" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    "nextRetryAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

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

-- CreateIndex
CREATE INDEX "ProjectComment_projectId_createdAt_idx" ON "ProjectComment"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectComment_userId_idx" ON "ProjectComment"("userId");

-- CreateIndex
CREATE INDEX "ProjectComment_isResolved_idx" ON "ProjectComment"("isResolved");

-- CreateIndex
CREATE INDEX "ProjectVersion_projectId_createdAt_idx" ON "ProjectVersion"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectVersion_userId_idx" ON "ProjectVersion"("userId");

-- CreateIndex
CREATE INDEX "ProjectVersion_isCurrent_idx" ON "ProjectVersion"("isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVersion_projectId_versionNumber_key" ON "ProjectVersion"("projectId", "versionNumber");

-- CreateIndex
CREATE INDEX "NRTemplate_nr_idx" ON "NRTemplate"("nr");

-- CreateIndex
CREATE INDEX "NRTemplate_category_idx" ON "NRTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_domain_key" ON "Organization"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeSubscriptionId_key" ON "Organization"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "Organization_tier_idx" ON "Organization"("tier");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_role_idx" ON "OrganizationMember"("organizationId", "role");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_idx" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabelSettings_organizationId_key" ON "WhiteLabelSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabelSettings_customDomain_key" ON "WhiteLabelSettings"("customDomain");

-- CreateIndex
CREATE INDEX "WhiteLabelSettings_organizationId_idx" ON "WhiteLabelSettings"("organizationId");

-- CreateIndex
CREATE INDEX "WhiteLabelSettings_customDomain_idx" ON "WhiteLabelSettings"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSSO_organizationId_key" ON "OrganizationSSO"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationSSO_organizationId_idx" ON "OrganizationSSO"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationSSO_provider_idx" ON "OrganizationSSO"("provider");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_timestamp_idx" ON "AuditLog"("organizationId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_userId_timestamp_idx" ON "AuditLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_action_timestamp_idx" ON "AuditLog"("action", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "Alert_organizationId_severity_createdAt_idx" ON "Alert"("organizationId", "severity", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_type_createdAt_idx" ON "Alert"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_userId_endpoint_key" ON "PushSubscription"("userId", "endpoint");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_organizationId_createdAt_idx" ON "AnalyticsEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_category_action_createdAt_idx" ON "AnalyticsEvent"("category", "action", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_projectId_createdAt_idx" ON "AnalyticsEvent"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_status_createdAt_idx" ON "AnalyticsEvent"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Timeline_projectId_key" ON "Timeline"("projectId");

-- CreateIndex
CREATE INDEX "Timeline_projectId_idx" ON "Timeline"("projectId");

-- CreateIndex
CREATE INDEX "Timeline_updatedAt_idx" ON "Timeline"("updatedAt");

-- CreateIndex
CREATE INDEX "VoiceClone_userId_createdAt_idx" ON "VoiceClone"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "VoiceClone_provider_voiceId_idx" ON "VoiceClone"("provider", "voiceId");

-- CreateIndex
CREATE INDEX "VoiceClone_trainingStatus_idx" ON "VoiceClone"("trainingStatus");

-- CreateIndex
CREATE INDEX "NRComplianceRecord_projectId_nr_idx" ON "NRComplianceRecord"("projectId", "nr");

-- CreateIndex
CREATE INDEX "NRComplianceRecord_status_createdAt_idx" ON "NRComplianceRecord"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateId_key" ON "Certificate"("certificateId");

-- CreateIndex
CREATE INDEX "Certificate_projectId_idx" ON "Certificate"("projectId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_certificateId_idx" ON "Certificate"("certificateId");

-- CreateIndex
CREATE INDEX "ReviewRequest_projectId_idx" ON "ReviewRequest"("projectId");

-- CreateIndex
CREATE INDEX "ReviewRequest_status_idx" ON "ReviewRequest"("status");

-- CreateIndex
CREATE INDEX "ReviewRequest_requestedBy_idx" ON "ReviewRequest"("requestedBy");

-- CreateIndex
CREATE INDEX "RenderJob_status_createdAt_idx" ON "RenderJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RenderJob_userId_idx" ON "RenderJob"("userId");

-- CreateIndex
CREATE INDEX "RenderJob_projectId_idx" ON "RenderJob"("projectId");

-- CreateIndex
CREATE INDEX "RenderJob_userId_createdAt_idx" ON "RenderJob"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RenderJob_status_idx" ON "RenderJob"("status");

-- CreateIndex
CREATE INDEX "Avatar3DClip_projectId_startTime_idx" ON "Avatar3DClip"("projectId", "startTime");

-- CreateIndex
CREATE INDEX "Avatar3DClip_status_idx" ON "Avatar3DClip"("status");

-- CreateIndex
CREATE INDEX "Avatar3DRenderJob_userId_createdAt_idx" ON "Avatar3DRenderJob"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Avatar3DRenderJob_status_createdAt_idx" ON "Avatar3DRenderJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Avatar3DRenderJob_projectId_idx" ON "Avatar3DRenderJob"("projectId");

-- CreateIndex
CREATE INDEX "ComplianceValidation_projectId_idx" ON "ComplianceValidation"("projectId");

-- CreateIndex
CREATE INDEX "ComplianceValidation_nrType_idx" ON "ComplianceValidation"("nrType");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_type_createdAt_idx" ON "Notification"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Webhook_userId_active_idx" ON "Webhook"("userId", "active");

-- CreateIndex
CREATE INDEX "Webhook_active_idx" ON "Webhook"("active");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_status_idx" ON "WebhookDelivery"("webhookId", "status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_scheduledFor_idx" ON "WebhookDelivery"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");
