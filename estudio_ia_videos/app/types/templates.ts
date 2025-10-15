export interface Template {
  id: string;
  name: string;
  description: string;
  category: NRCategory;
  thumbnail: string;
  preview: string;
  tags: string[];
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  content: TemplateContent;
  metadata: TemplateMetadata;
}

export interface TemplateContent {
  slides: SlideTemplate[];
  assets: AssetTemplate[];
  animations: AnimationTemplate[];
  interactions: InteractionTemplate[];
  compliance: ComplianceTemplate;
}

export interface SlideTemplate {
  id: string;
  type: 'intro' | 'content' | 'quiz' | 'summary' | 'compliance';
  title: string;
  layout: string;
  elements: ElementTemplate[];
  duration: number;
  transitions: TransitionTemplate[];
}

export interface ComplianceRule {
  id: string;
  requirementId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  remediation?: string;
}

export interface ElementTemplate {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'avatar' | 'chart' | 'interactive';
  position: { x: number; y: number; z?: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
  animations: AnimationTemplate[];
  compliance?: ComplianceRule[];
}

export interface AssetTemplate {
  id: string;
  type: 'image' | 'video' | 'audio' | 'model' | 'texture';
  url: string;
  name: string;
  size: number;
  format: string;
  metadata: Record<string, any>;
}

export interface AnimationTemplate {
  id: string;
  name: string;
  type: 'entrance' | 'emphasis' | 'exit' | 'motion';
  duration: number;
  easing: string;
  properties: Record<string, any>;
  triggers: AnimationTrigger[];
}

export interface AnimationTrigger {
  type: 'click' | 'hover' | 'time' | 'scroll' | 'voice';
  delay: number;
  conditions: Record<string, any>;
}

export interface InteractionTemplate {
  id: string;
  type: 'quiz' | 'survey' | 'simulation' | 'game' | 'assessment';
  title: string;
  description: string;
  questions: QuestionTemplate[];
  scoring: ScoringTemplate;
  feedback: FeedbackTemplate;
}

export interface QuestionTemplate {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'drag-drop' | 'hotspot';
  question: string;
  options: OptionTemplate[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  timeLimit?: number;
}

export interface OptionTemplate {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface ScoringTemplate {
  type: 'percentage' | 'points' | 'grade';
  passingScore: number;
  maxScore: number;
  weightings: Record<string, number>;
}

export interface FeedbackTemplate {
  correct: string;
  incorrect: string;
  partial: string;
  final: string;
}

export interface ComplianceTemplate {
  nrCategory: NRCategory;
  requirements: ComplianceRequirement[];
  checkpoints: ComplianceCheckpoint[];
  certifications: CertificationTemplate[];
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  category: string;
  validation: ValidationRule[];
}

export interface ComplianceCheckpoint {
  id: string;
  title: string;
  description: string;
  type: 'automatic' | 'manual' | 'interactive';
  criteria: CheckpointCriteria[];
}

export interface CheckpointCriteria {
  id: string;
  description: string;
  weight: number;
  validation: ValidationRule[];
}

export interface ValidationRule {
  type: 'content' | 'duration' | 'interaction' | 'assessment' | 'accessibility';
  rule: string;
  parameters: Record<string, any>;
  errorMessage: string;
}


export interface CertificationTemplate {
  id: string;
  name: string;
  authority: string;
  validityPeriod: number;
  requirements: string[];
  template: string;
}

export interface TransitionTemplate {
  id: string;
  type: 'fade' | 'slide' | 'zoom' | 'flip' | 'dissolve';
  duration: number;
  easing: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface TemplateMetadata {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  targetAudience: string[];
  learningObjectives: string[];
  prerequisites: string[];
  language: string;
  accessibility: AccessibilityFeatures;
  compliance: ComplianceMetadata;
}

export interface AccessibilityFeatures {
  screenReader: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  closedCaptions: boolean;
  audioDescription: boolean;
  signLanguage: boolean;
}

export interface ComplianceMetadata {
  nrCategories: NRCategory[];
  lastAudit: Date;
  auditScore: number;
  certifications: string[];
  expiryDate?: Date;
}

export type NRCategory = 
  | 'NR-01' // Disposições Gerais
  | 'NR-02' // Inspeção Prévia
  | 'NR-03' // Embargo ou Interdição
  | 'NR-04' // Serviços Especializados em Engenharia de Segurança e em Medicina do Trabalho
  | 'NR-05' // Comissão Interna de Prevenção de Acidentes
  | 'NR-06' // Equipamento de Proteção Individual
  | 'NR-07' // Programas de Controle Médico de Saúde Ocupacional
  | 'NR-08' // Edificações
  | 'NR-09' // Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos
  | 'NR-10' // Segurança em Instalações e Serviços em Eletricidade
  | 'NR-11' // Transporte, Movimentação, Armazenagem e Manuseio de Materiais
  | 'NR-12' // Segurança no Trabalho em Máquinas e Equipamentos
  | 'NR-13' // Caldeiras, Vasos de Pressão e Tubulações
  | 'NR-14' // Fornos
  | 'NR-15' // Atividades e Operações Insalubres
  | 'NR-16' // Atividades e Operações Perigosas
  | 'NR-17' // Ergonomia
  | 'NR-18' // Condições e Meio Ambiente de Trabalho na Indústria da Construção
  | 'NR-19' // Explosivos
  | 'NR-20' // Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis
  | 'NR-21' // Trabalhos a Céu Aberto
  | 'NR-22' // Segurança e Saúde Ocupacional na Mineração
  | 'NR-23' // Proteção Contra Incêndios
  | 'NR-24' // Condições Sanitárias e de Conforto nos Locais de Trabalho
  | 'NR-25' // Resíduos Industriais
  | 'NR-26' // Sinalização de Segurança
  | 'NR-27' // Registro Profissional do Técnico de Segurança do Trabalho
  | 'NR-28' // Fiscalização e Penalidades
  | 'NR-29' // Norma Regulamentadora de Segurança e Saúde no Trabalho Portuário
  | 'NR-30' // Segurança e Saúde no Trabalho Aquaviário
  | 'NR-31' // Segurança e Saúde no Trabalho na Agricultura, Pecuária, Silvicultura, Exploração Florestal e Aquicultura
  | 'NR-32' // Segurança e Saúde no Trabalho em Serviços de Saúde
  | 'NR-33' // Segurança e Saúde nos Trabalhos em Espaços Confinados
  | 'NR-34' // Condições e Meio Ambiente de Trabalho na Indústria da Construção, Reparação e Desmonte Naval
  | 'NR-35' // Trabalho em Altura
  | 'NR-36' // Segurança e Saúde no Trabalho em Empresas de Abate e Processamento de Carnes e Derivados
  | 'NR-37' // Segurança e Saúde em Plataformas de Petróleo;

export interface TemplateFilter {
  category?: NRCategory[];
  tags?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  isFavorite?: boolean;
  isCustom?: boolean;
  author?: string;
  rating?: number;
  search?: string;
}

export interface TemplateSort {
  field: 'name' | 'createdAt' | 'updatedAt' | 'downloads' | 'rating';
  direction: 'asc' | 'desc';
}

export interface TemplateImportExport {
  format: 'json' | 'zip' | 'scorm' | 'xapi';
  includeAssets: boolean;
  compression: boolean;
  metadata: boolean;
}