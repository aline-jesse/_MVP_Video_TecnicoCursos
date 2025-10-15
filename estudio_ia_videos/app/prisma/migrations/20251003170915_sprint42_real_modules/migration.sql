-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'LEFT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'UNPAID');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "SSOProvider" AS ENUM ('SAML', 'OAUTH_GOOGLE', 'OAUTH_MICROSOFT', 'OAUTH_OKTA', 'OAUTH_CUSTOM');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentOrgId" TEXT;

-- CreateTable
CREATE TABLE "ProjectComment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "position" TEXT,
    "parentId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NRTemplate" (
    "id" TEXT NOT NULL,
    "nr" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "slides" JSONB NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thumbnailUrl" TEXT,
    "certification" TEXT,
    "validUntil" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NRTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "maxMembers" INTEGER NOT NULL DEFAULT 5,
    "maxProjects" INTEGER NOT NULL DEFAULT 10,
    "maxStorage" BIGINT NOT NULL DEFAULT 1073741824,
    "currentMembers" INTEGER NOT NULL DEFAULT 0,
    "currentProjects" INTEGER NOT NULL DEFAULT 0,
    "currentStorage" BIGINT NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "alertSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    "permissions" JSONB,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCustomerId" TEXT,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "paymentMethod" TEXT,
    "lastPaymentDate" TIMESTAMP(3),
    "nextPaymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteLabelSettings" (
    "id" TEXT NOT NULL,
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
    "domainVerifiedAt" TIMESTAMP(3),
    "welcomeMessage" TEXT,
    "footerText" TEXT,
    "privacyPolicyUrl" TEXT,
    "termsOfServiceUrl" TEXT,
    "supportEmail" TEXT,
    "supportUrl" TEXT,
    "customCSS" TEXT,
    "customJS" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhiteLabelSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSSO" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "SSOProvider" NOT NULL,
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
    "lastTestedAt" TIMESTAMP(3),
    "testStatus" TEXT,
    "testError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSSO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
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
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeline" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tracks" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "totalDuration" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceClone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'elevenlabs',
    "voiceId" TEXT NOT NULL,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "trainingStatus" TEXT NOT NULL DEFAULT 'pending',
    "qualityScore" DOUBLE PRECISION,
    "samplesS3Keys" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "VoiceClone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NRComplianceRecord" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "nr" TEXT NOT NULL,
    "nrName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "requirementsMet" INTEGER NOT NULL DEFAULT 0,
    "requirementsTotal" INTEGER NOT NULL DEFAULT 0,
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "reportUrl" TEXT,
    "recommendations" JSONB,
    "criticalPoints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NRComplianceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainCertificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "completionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" DOUBLE PRECISION,
    "skills" JSONB,
    "network" TEXT NOT NULL DEFAULT 'polygon',
    "contractAddress" TEXT,
    "tokenId" TEXT,
    "blockchainHash" TEXT,
    "ipfsHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verificationUrl" TEXT,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mintedAt" TIMESTAMP(3),

    CONSTRAINT "BlockchainCertificate_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "BlockchainCertificate_userId_createdAt_idx" ON "BlockchainCertificate"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BlockchainCertificate_blockchainHash_idx" ON "BlockchainCertificate"("blockchainHash");

-- CreateIndex
CREATE INDEX "BlockchainCertificate_status_idx" ON "BlockchainCertificate"("status");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProjectComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteLabelSettings" ADD CONSTRAINT "WhiteLabelSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSSO" ADD CONSTRAINT "OrganizationSSO_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timeline" ADD CONSTRAINT "Timeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NRComplianceRecord" ADD CONSTRAINT "NRComplianceRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
