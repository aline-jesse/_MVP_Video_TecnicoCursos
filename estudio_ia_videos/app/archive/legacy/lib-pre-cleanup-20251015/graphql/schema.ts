

export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String
    role: String
    createdAt: String!
    projects: [Project!]!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: ProjectStatus!
    createdAt: String!
    updatedAt: String!
    userId: ID!
    user: User!
    scenes: [Scene!]!
    settings: ProjectSettings
    analytics: ProjectAnalytics
  }

  type Scene {
    id: ID!
    title: String!
    content: String!
    duration: Int!
    order: Int!
    projectId: ID!
    project: Project!
    avatar: AvatarConfig
    voiceSettings: VoiceConfig
    visualElements: [VisualElement!]!
  }

  type AvatarConfig {
    id: String!
    name: String!
    personality: String
    tone: String
    gestures: [String!]!
    instructions: String
  }

  type VoiceConfig {
    provider: String!
    voice: String!
    language: String!
    speed: Float
    pitch: Float
    emotion: String
  }

  type VisualElement {
    id: ID!
    type: VisualElementType!
    content: String!
    position: Position!
    timing: Timing!
    sceneId: ID!
  }

  type Position {
    x: Float!
    y: Float!
    width: Float!
    height: Float!
  }

  type Timing {
    start: Float!
    end: Float!
    transition: String
  }

  type ProjectSettings {
    resolution: String!
    framerate: Int!
    aspectRatio: String!
    watermark: WatermarkConfig
    exportFormats: [String!]!
    aiOptimizations: AIOptimizationSettings
  }

  type WatermarkConfig {
    enabled: Boolean!
    type: WatermarkType!
    content: String
    position: String!
    opacity: Float!
    style: WatermarkStyle
  }

  type WatermarkStyle {
    fontSize: String
    fontFamily: String
    color: String
    backgroundColor: String
  }

  type AIOptimizationSettings {
    autoScript: Boolean!
    contentOptimization: Boolean!
    complianceCheck: Boolean!
    engagementBoost: Boolean!
    targetNR: String
  }

  type ProjectAnalytics {
    views: Int!
    completionRate: Float!
    engagementScore: Float!
    averageWatchTime: Float!
    feedback: [Feedback!]!
    performanceMetrics: PerformanceMetrics!
  }

  type Feedback {
    id: ID!
    rating: Int!
    comment: String
    userId: ID
    createdAt: String!
  }

  type PerformanceMetrics {
    renderTime: Float!
    fileSize: Float!
    loadTime: Float!
    qualityScore: Float!
  }

  type AIGeneration {
    id: ID!
    type: AIGenerationType!
    input: String!
    output: String!
    status: AIGenerationStatus!
    createdAt: String!
    userId: ID!
    metadata: AIGenerationMetadata
  }

  type AIGenerationMetadata {
    nr: String
    audience: String
    duration: Int
    quality: Float
    suggestions: [String!]!
  }

  type NRTemplate {
    id: ID!
    nr: String!
    title: String!
    description: String!
    version: String!
    topics: [String!]!
    requiredSections: [String!]!
    compliance: ComplianceInfo!
    template: ProjectTemplate!
  }

  type ComplianceInfo {
    score: Float!
    checklist: [ComplianceItem!]!
    lastUpdated: String!
  }

  type ComplianceItem {
    id: ID!
    requirement: String!
    covered: Boolean!
    notes: String
  }

  type ProjectTemplate {
    scenes: [SceneTemplate!]!
    defaultSettings: ProjectSettings!
    estimatedDuration: Int!
  }

  type SceneTemplate {
    title: String!
    content: String!
    duration: Int!
    avatarSuggestions: [String!]!
    visualCues: [String!]!
  }

  type CloudStorage {
    id: ID!
    provider: CloudProvider!
    connected: Boolean!
    usage: StorageUsage!
    settings: CloudStorageSettings!
  }

  type StorageUsage {
    used: Float!
    limit: Float!
    files: Int!
  }

  type CloudStorageSettings {
    autoSync: Boolean!
    backupEnabled: Boolean!
    compressionLevel: Int!
  }

  enum ProjectStatus {
    DRAFT
    PROCESSING
    COMPLETED
    ERROR
    ARCHIVED
  }

  enum VisualElementType {
    TEXT
    IMAGE
    VIDEO
    CHART
    INFOGRAPHIC
    ANIMATION
  }

  enum WatermarkType {
    TEXT
    IMAGE
    LOGO
  }

  enum AIGenerationType {
    SCRIPT
    OPTIMIZATION
    AVATAR_INSTRUCTIONS
    COMPLIANCE_ANALYSIS
    QUIZ
  }

  enum AIGenerationStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
  }

  enum CloudProvider {
    GOOGLE_DRIVE
    DROPBOX
    ONEDRIVE
    AWS_S3
  }

  # Queries
  type Query {
    # User queries
    me: User
    users: [User!]!
    user(id: ID!): User

    # Project queries
    projects(
      status: ProjectStatus
      limit: Int
      offset: Int
      search: String
    ): [Project!]!
    project(id: ID!): Project
    myProjects: [Project!]!

    # AI queries
    aiGenerations(
      type: AIGenerationType
      status: AIGenerationStatus
      limit: Int
    ): [AIGeneration!]!
    aiGeneration(id: ID!): AIGeneration

    # NR Template queries
    nrTemplates(nr: String): [NRTemplate!]!
    nrTemplate(id: ID!): NRTemplate

    # Analytics queries
    projectAnalytics(projectId: ID!): ProjectAnalytics
    userAnalytics: UserAnalytics
    systemAnalytics: SystemAnalytics

    # Cloud Storage queries
    cloudStorages: [CloudStorage!]!
    storageUsage: StorageUsage!
  }

  type UserAnalytics {
    totalProjects: Int!
    completedProjects: Int!
    totalViewTime: Float!
    averageRating: Float!
    topNRs: [String!]!
    productivityMetrics: ProductivityMetrics!
  }

  type ProductivityMetrics {
    videosCreatedPerWeek: Float!
    averageCreationTime: Float!
    timeSaved: Float!
    aiUsageStats: AIUsageStats!
  }

  type AIUsageStats {
    scriptsGenerated: Int!
    contentOptimized: Int!
    complianceChecks: Int!
    timeSaved: Float!
  }

  type SystemAnalytics {
    totalUsers: Int!
    totalProjects: Int!
    averageEngagement: Float!
    topPerformingContent: [Project!]!
    systemHealth: SystemHealth!
  }

  type SystemHealth {
    uptime: Float!
    responseTime: Float!
    errorRate: Float!
    activeUsers: Int!
  }

  # Mutations
  type Mutation {
    # User mutations
    updateProfile(input: UpdateProfileInput!): User!
    deleteAccount: Boolean!

    # Project mutations
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    duplicateProject(id: ID!): Project!
    archiveProject(id: ID!): Project!

    # Scene mutations
    createScene(input: CreateSceneInput!): Scene!
    updateScene(id: ID!, input: UpdateSceneInput!): Scene!
    deleteScene(id: ID!): Boolean!
    reorderScenes(projectId: ID!, sceneIds: [ID!]!): [Scene!]!

    # AI mutations
    generateScript(input: GenerateScriptInput!): AIGeneration!
    optimizeContent(input: OptimizeContentInput!): AIGeneration!
    generateAvatarInstructions(input: AvatarInstructionsInput!): AIGeneration!
    analyzeCompliance(input: ComplianceAnalysisInput!): AIGeneration!
    generateQuiz(input: GenerateQuizInput!): AIGeneration!

    # Cloud Storage mutations
    connectCloudStorage(input: ConnectCloudStorageInput!): CloudStorage!
    disconnectCloudStorage(provider: CloudProvider!): Boolean!
    syncToCloud(projectId: ID!): Boolean!

    # Analytics mutations
    trackEvent(input: TrackEventInput!): Boolean!
    submitFeedback(input: FeedbackInput!): Feedback!
  }

  # Input types
  input UpdateProfileInput {
    name: String
    email: String
  }

  input CreateProjectInput {
    name: String!
    description: String
    templateId: ID
    aiOptimizations: AIOptimizationSettingsInput
  }

  input UpdateProjectInput {
    name: String
    description: String
    status: ProjectStatus
    settings: ProjectSettingsInput
  }

  input ProjectSettingsInput {
    resolution: String
    framerate: Int
    aspectRatio: String
    watermark: WatermarkConfigInput
    exportFormats: [String!]
    aiOptimizations: AIOptimizationSettingsInput
  }

  input WatermarkConfigInput {
    enabled: Boolean!
    type: WatermarkType!
    content: String
    position: String!
    opacity: Float!
    style: WatermarkStyleInput
  }

  input WatermarkStyleInput {
    fontSize: String
    fontFamily: String
    color: String
    backgroundColor: String
  }

  input AIOptimizationSettingsInput {
    autoScript: Boolean
    contentOptimization: Boolean
    complianceCheck: Boolean
    engagementBoost: Boolean
    targetNR: String
  }

  input CreateSceneInput {
    title: String!
    content: String!
    duration: Int!
    order: Int!
    projectId: ID!
    avatar: AvatarConfigInput
    voiceSettings: VoiceConfigInput
  }

  input UpdateSceneInput {
    title: String
    content: String
    duration: Int
    order: Int
    avatar: AvatarConfigInput
    voiceSettings: VoiceConfigInput
  }

  input AvatarConfigInput {
    id: String!
    name: String!
    personality: String
    tone: String
    gestures: [String!]
    instructions: String
  }

  input VoiceConfigInput {
    provider: String!
    voice: String!
    language: String!
    speed: Float
    pitch: Float
    emotion: String
  }

  input GenerateScriptInput {
    nr: String!
    topics: [String!]!
    duration: Int!
    audience: String!
    companyContext: String
  }

  input OptimizeContentInput {
    content: String!
    nr: String
    targetAudience: String
    currentEngagement: Float
  }

  input AvatarInstructionsInput {
    content: String!
    sceneContext: String
    avatarType: String
  }

  input ComplianceAnalysisInput {
    content: String!
    nr: String!
    strictMode: Boolean
  }

  input GenerateQuizInput {
    content: String!
    difficulty: String!
    questionCount: Int
  }

  input ConnectCloudStorageInput {
    provider: CloudProvider!
    credentials: String!
    settings: CloudStorageSettingsInput
  }

  input CloudStorageSettingsInput {
    autoSync: Boolean
    backupEnabled: Boolean
    compressionLevel: Int
  }

  input TrackEventInput {
    event: String!
    properties: String
    userId: ID
  }

  input FeedbackInput {
    projectId: ID!
    rating: Int!
    comment: String
  }

  # Subscriptions
  type Subscription {
    projectUpdated(id: ID!): Project!
    aiGenerationCompleted(userId: ID!): AIGeneration!
    renderProgress(projectId: ID!): RenderProgress!
    systemNotification: SystemNotification!
  }

  type RenderProgress {
    projectId: ID!
    progress: Float!
    stage: String!
    eta: Float
    error: String
  }

  type SystemNotification {
    id: ID!
    type: NotificationType!
    title: String!
    message: String!
    createdAt: String!
    userId: ID
  }

  enum NotificationType {
    INFO
    WARNING
    ERROR
    SUCCESS
  }
`
