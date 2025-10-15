
// Sistema de Integração LMS com SCORM e xAPI
import { SlideData, VideoConfig } from './ai-services'

export interface LMSPackage {
  id: string
  title: string
  description: string
  version: string
  standard: 'SCORM_1_2' | 'SCORM_2004' | 'xAPI' | 'AICC'
  duration_minutes: number
  completion_threshold: number
  passing_score: number
  max_attempts: number
  created_at: Date
  metadata: LMSMetadata
}

export interface LMSMetadata {
  identifier: string
  title: string
  description: string
  keywords: string[]
  language: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  typical_learning_time: string
  target_audience: string
  learning_objectives: string[]
  prerequisites: string[]
  certification: {
    available: boolean
    hours: number
    authority: string
  }
}

export interface SCORMManifest {
  identifier: string
  version: string
  title: string
  description: string
  organizations: SCORMOrganization[]
  resources: SCORMResource[]
  metadata: LMSMetadata
}

export interface SCORMOrganization {
  identifier: string
  title: string
  items: SCORMItem[]
}

export interface SCORMItem {
  identifier: string
  title: string
  identifierref: string
  prerequisites?: string
  maxtimeallowed?: string
  timelimitaction?: string
  masteryScore?: number
}

export interface SCORMResource {
  identifier: string
  type: 'webcontent' | 'sco' | 'asset'
  href: string
  files: string[]
  dependencies?: string[]
}

export interface xAPIStatement {
  actor: {
    name: string
    mbox?: string
    account?: {
      homePage: string
      name: string
    }
  }
  verb: {
    id: string
    display: Record<string, string>
  }
  object: {
    id: string
    definition: {
      name: Record<string, string>
      description?: Record<string, string>
      type?: string
    }
  }
  result?: {
    score?: {
      scaled: number
      raw: number
      min: number
      max: number
    }
    completion: boolean
    success: boolean
    duration?: string
  }
  context?: {
    instructor?: any
    team?: any
    contextActivities?: any
  }
  timestamp: string
  stored?: string
  authority?: any
}

export interface CompletionCertificate {
  id: string
  user_name: string
  user_email: string
  course_title: string
  completion_date: Date
  score: number
  duration_minutes: number
  certificate_url: string
  verification_code: string
  issuing_authority: string
}

export class LMSIntegrationService {
  
  // Gerar pacote SCORM 1.2
  static generateSCORM12Package(
    slides: SlideData[], 
    config: VideoConfig, 
    metadata: LMSMetadata
  ): SCORMManifest {
    const packageId = `scorm_${Date.now()}`
    const resourceId = `resource_${packageId}`
    
    const manifest: SCORMManifest = {
      identifier: packageId,
      version: '1.2',
      title: metadata.title,
      description: metadata.description,
      metadata: metadata,
      organizations: [{
        identifier: `org_${packageId}`,
        title: metadata.title,
        items: [{
          identifier: `item_${packageId}`,
          title: metadata.title,
          identifierref: resourceId,
          masteryScore: 80,
          timelimitaction: 'continue,no message',
          maxtimeallowed: this.formatDuration(metadata.typical_learning_time)
        }]
      }],
      resources: [{
        identifier: resourceId,
        type: 'sco',
        href: 'index.html',
        files: [
          'index.html',
          'video.mp4',
          'scormdriver.js',
          'scormapi.js',
          'content.json',
          ...this.generateAssetFiles(slides)
        ]
      }]
    }

    return manifest
  }

  // Gerar pacote SCORM 2004
  static generateSCORM2004Package(
    slides: SlideData[], 
    config: VideoConfig, 
    metadata: LMSMetadata
  ): SCORMManifest {
    const packageId = `scorm2004_${Date.now()}`
    
    return {
      ...this.generateSCORM12Package(slides, config, metadata),
      identifier: packageId,
      version: '2004 4th Edition',
      organizations: [{
        identifier: `org_${packageId}`,
        title: metadata.title,
        items: slides.map((slide, index) => ({
          identifier: `item_${index}`,
          title: slide.title,
          identifierref: `resource_${index}`,
          prerequisites: index > 0 ? `item_${index - 1}` : undefined
        }))
      }]
    }
  }

  // Gerar statements xAPI
  static generatexAPIStatements(
    userId: string,
    userName: string,
    userEmail: string,
    courseId: string,
    courseTitle: string,
    slides: SlideData[],
    progress: { completed_slides: number; score: number; duration_minutes: number }
  ): xAPIStatement[] {
    const baseActor = {
      name: userName,
      mbox: `mailto:${userEmail}`
    }

    const statements: xAPIStatement[] = []

    // Statement de início do curso
    statements.push({
      actor: baseActor,
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/attempted',
        display: { 'pt-BR': 'iniciou' }
      },
      object: {
        id: `https://estudio-ia.com/courses/${courseId}`,
        definition: {
          name: { 'pt-BR': courseTitle },
          type: 'http://adlnet.gov/expapi/activities/course'
        }
      },
      timestamp: new Date().toISOString()
    })

    // Statements para cada slide completado
    slides.slice(0, progress.completed_slides).forEach((slide, index) => {
      statements.push({
        actor: baseActor,
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/completed',
          display: { 'pt-BR': 'completou' }
        },
        object: {
          id: `https://estudio-ia.com/courses/${courseId}/slides/${slide.id}`,
          definition: {
            name: { 'pt-BR': slide.title },
            type: 'http://adlnet.gov/expapi/activities/lesson'
          }
        },
        result: {
          completion: true,
          success: true,
          duration: this.formatISO8601Duration(slide.duration * 1000)
        },
        timestamp: new Date().toISOString()
      })
    })

    // Statement de conclusão do curso (se completado)
    if (progress.completed_slides >= slides.length) {
      statements.push({
        actor: baseActor,
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/completed',
          display: { 'pt-BR': 'completou' }
        },
        object: {
          id: `https://estudio-ia.com/courses/${courseId}`,
          definition: {
            name: { 'pt-BR': courseTitle },
            type: 'http://adlnet.gov/expapi/activities/course'
          }
        },
        result: {
          score: {
            scaled: progress.score / 100,
            raw: progress.score,
            min: 0,
            max: 100
          },
          completion: true,
          success: progress.score >= 70,
          duration: this.formatISO8601Duration(progress.duration_minutes * 60 * 1000)
        },
        timestamp: new Date().toISOString()
      })
    }

    return statements
  }

  // Gerar arquivo imsmanifest.xml para SCORM
  static generateIMSManifestXML(manifest: SCORMManifest): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifest.identifier}" 
          version="1.0"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                              http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
                              http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>${manifest.version}</schemaversion>
    <adlcp:location>metadata.xml</adlcp:location>
  </metadata>
  
  <organizations default="${manifest.organizations[0].identifier}">
    ${manifest.organizations.map(org => `
    <organization identifier="${org.identifier}">
      <title>${org.title}</title>
      ${org.items.map(item => `
      <item identifier="${item.identifier}" identifierref="${item.identifierref}">
        <title>${item.title}</title>
        ${item.masteryScore ? `<adlcp:masteryscore>${item.masteryScore}</adlcp:masteryscore>` : ''}
        ${item.maxtimeallowed ? `<adlcp:maxtimeallowed>${item.maxtimeallowed}</adlcp:maxtimeallowed>` : ''}
      </item>`).join('')}
    </organization>`).join('')}
  </organizations>
  
  <resources>
    ${manifest.resources.map(resource => `
    <resource identifier="${resource.identifier}" type="${resource.type}" href="${resource.href}" adlcp:scormtype="sco">
      ${resource.files.map(file => `<file href="${file}"/>`).join('')}
    </resource>`).join('')}
  </resources>
  
</manifest>`
  }

  // Gerar arquivo de conteúdo HTML principal
  static generateSCORMContent(slides: SlideData[], videoUrl: string): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Treinamento de Segurança</title>
    <script src="scormapi.js"></script>
    <script src="scormdriver.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .video-container { text-align: center; margin: 20px 0; }
        video { width: 100%; max-width: 800px; }
        .progress-bar { 
            width: 100%; 
            height: 20px; 
            background: #f0f0f0; 
            border-radius: 10px;
            margin: 20px 0;
        }
        .progress-fill { 
            height: 100%; 
            background: #4CAF50; 
            border-radius: 10px;
            transition: width 0.3s;
        }
        .slide-info { 
            background: #f9f9f9; 
            padding: 15px; 
            border-radius: 8px;
            margin: 10px 0;
        }
        .controls { text-align: center; margin: 20px 0; }
        button {
            background: #007cba;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 5px;
        }
        button:hover { background: #005a87; }
        button:disabled { background: #ccc; cursor: not-allowed; }
    </style>
</head>
<body>
    <h1>Treinamento de Segurança do Trabalho</h1>
    
    <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
    </div>
    
    <div class="video-container">
        <video id="mainVideo" controls>
            <source src="${videoUrl}" type="video/mp4">
            Seu navegador não suporta o elemento de vídeo.
        </video>
    </div>
    
    <div class="slide-info" id="slideInfo">
        <h3 id="slideTitle">Carregando...</h3>
        <p id="slideContent">Aguarde...</p>
    </div>
    
    <div class="controls">
        <button id="prevBtn" onclick="previousSlide()">« Anterior</button>
        <button id="nextBtn" onclick="nextSlide()">Próximo »</button>
        <button id="completeBtn" onclick="completeCourse()" style="display:none;">Finalizar Curso</button>
    </div>
    
    <script>
        // Dados do curso
        const slides = ${JSON.stringify(slides)};
        let currentSlide = 0;
        let completedSlides = 0;
        let startTime = new Date();
        
        // Inicializar SCORM
        window.onload = function() {
            if (typeof scormAPI !== 'undefined') {
                scormAPI.initialize();
                scormAPI.setValue('cmi.core.lesson_status', 'incomplete');
                scormAPI.setValue('cmi.core.entry', 'ab-initio');
                scormAPI.commit();
                updateProgress();
                loadSlide(0);
            }
        };
        
        window.onbeforeunload = function() {
            if (typeof scormAPI !== 'undefined') {
                const duration = new Date() - startTime;
                scormAPI.setValue('cmi.core.session_time', formatDuration(duration));
                scormAPI.setValue('cmi.core.exit', 'suspend');
                scormAPI.commit();
                scormAPI.terminate();
            }
        };
        
        function loadSlide(index) {
            if (index >= 0 && index < slides.length) {
                currentSlide = index;
                document.getElementById('slideTitle').textContent = slides[index].title;
                document.getElementById('slideContent').textContent = slides[index].content;
                
                // Atualizar botões
                document.getElementById('prevBtn').disabled = index === 0;
                document.getElementById('nextBtn').disabled = index === slides.length - 1;
                
                if (index === slides.length - 1) {
                    document.getElementById('completeBtn').style.display = 'inline-block';
                }
                
                // Marcar slide como visitado
                if (index > completedSlides) {
                    completedSlides = index;
                    updateProgress();
                    
                    if (typeof scormAPI !== 'undefined') {
                        scormAPI.setValue('cmi.core.lesson_location', index.toString());
                        scormAPI.commit();
                    }
                }
            }
        }
        
        function nextSlide() {
            if (currentSlide < slides.length - 1) {
                loadSlide(currentSlide + 1);
            }
        }
        
        function previousSlide() {
            if (currentSlide > 0) {
                loadSlide(currentSlide - 1);
            }
        }
        
        function updateProgress() {
            const progress = ((completedSlides + 1) / slides.length) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            
            if (typeof scormAPI !== 'undefined') {
                scormAPI.setValue('cmi.core.score.raw', Math.round(progress));
                scormAPI.setValue('cmi.core.score.max', '100');
                scormAPI.setValue('cmi.core.score.min', '0');
                scormAPI.commit();
            }
        }
        
        function completeCourse() {
            const finalScore = 100;
            const duration = new Date() - startTime;
            
            if (typeof scormAPI !== 'undefined') {
                scormAPI.setValue('cmi.core.lesson_status', 'completed');
                scormAPI.setValue('cmi.core.score.raw', finalScore.toString());
                scormAPI.setValue('cmi.core.session_time', formatDuration(duration));
                scormAPI.setValue('cmi.core.exit', 'logout');
                scormAPI.commit();
            }
            
            alert('Parabéns! Você completou o treinamento com sucesso!');
        }
        
        function formatDuration(milliseconds) {
            const seconds = Math.floor(milliseconds / 1000);
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            return hours.toString().padStart(2, '0') + ':' +
                   minutes.toString().padStart(2, '0') + ':' +
                   secs.toString().padStart(2, '0');
        }
    </script>
</body>
</html>`
  }

  // Gerar certificado de conclusão
  static async generateCompletionCertificate(
    userName: string,
    userEmail: string,
    courseTitle: string,
    completionDate: Date,
    score: number,
    duration: number
  ): Promise<CompletionCertificate> {
    const certificateId = `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase()
    
    return {
      id: certificateId,
      user_name: userName,
      user_email: userEmail,
      course_title: courseTitle,
      completion_date: completionDate,
      score: score,
      duration_minutes: duration,
      certificate_url: `/api/certificates/${certificateId}.pdf`,
      verification_code: verificationCode,
      issuing_authority: 'Estúdio IA de Vídeos - Treinamentos Corporativos'
    }
  }

  // Utilitários
  private static formatDuration(timeString: string): string {
    // Converter para formato SCORM (HH:MM:SS)
    const minutes = parseInt(timeString)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
  }

  private static formatISO8601Duration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return `PT${hours}H${minutes}M${secs}S`
  }

  private static generateAssetFiles(slides: SlideData[]): string[] {
    return slides.map((slide, index) => `slide_${index}_image.jpg`)
  }

  // Validar compatibilidade com LMS
  static validateLMSCompatibility(lmsType: string): boolean {
    const supportedLMS = [
      'moodle', 'blackboard', 'canvas', 'brightspace', 
      'docebo', 'cornerstone', 'absorb', 'totara'
    ]
    return supportedLMS.includes(lmsType.toLowerCase())
  }

  // Estatísticas de uso para admin
  static generateUsageStats(completions: CompletionCertificate[]) {
    const total = completions.length
    const avgScore = total > 0 ? completions.reduce((sum, c) => sum + c.score, 0) / total : 0
    const avgDuration = total > 0 ? completions.reduce((sum, c) => sum + c.duration_minutes, 0) / total : 0
    
    return {
      total_completions: total,
      average_score: Math.round(avgScore * 100) / 100,
      average_duration_minutes: Math.round(avgDuration * 100) / 100,
      completion_rate: total > 0 ? 100 : 0 // Seria calculado baseado em tentativas vs conclusões
    }
  }
}
