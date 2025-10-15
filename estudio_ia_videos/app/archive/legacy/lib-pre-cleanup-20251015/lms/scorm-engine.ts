

// SCORM 2004 Compliant Engine para LMS Integration
export interface SCORMPackage {
  identifier: string
  title: string
  description: string
  version: '1.2' | '2004'
  launch_url: string
  completion_threshold?: number
  mastery_score?: number
  max_time_allowed?: string
  time_limit_action?: 'continue' | 'exit' | 'logout'
  data_from_lms?: string
  prerequisites?: string[]
  objectives: SCORMObjective[]
  interactions: SCORMInteraction[]
  resources: SCORMResource[]
}

export interface SCORMObjective {
  id: string
  description: string
  success_status: 'passed' | 'failed' | 'unknown'
  completion_status: 'completed' | 'incomplete' | 'not_attempted' | 'unknown'
  progress_measure?: number
  score_raw?: number
  score_min?: number
  score_max?: number
}

export interface SCORMInteraction {
  id: string
  type: 'choice' | 'fill-in' | 'long-fill-in' | 'matching' | 'performance' | 'sequencing' | 'likert' | 'numeric' | 'other'
  objectives: string[]
  timestamp: string
  correct_responses: string[]
  weighting?: number
  student_response?: string
  result: 'correct' | 'incorrect' | 'unanticipated' | 'neutral'
  latency?: string
  description?: string
}

export interface SCORMResource {
  identifier: string
  type: 'webcontent' | 'sco' | 'asset'
  href: string
  metadata?: {
    schema: string
    schemaversion: string
    location?: string
  }
  files: {
    href: string
    metadata?: any
  }[]
  dependencies?: string[]
}

export interface xAPIStatement {
  id?: string
  actor: {
    name?: string
    mbox?: string
    account?: {
      homePage: string
      name: string
    }
  }
  verb: {
    id: string
    display: {
      [language: string]: string
    }
  }
  object: {
    id: string
    definition?: {
      name?: { [language: string]: string }
      description?: { [language: string]: string }
      type?: string
      moreInfo?: string
      extensions?: { [key: string]: any }
    }
  }
  result?: {
    score?: {
      scaled?: number
      raw?: number
      min?: number
      max?: number
    }
    success?: boolean
    completion?: boolean
    response?: string
    duration?: string
    extensions?: { [key: string]: any }
  }
  context?: {
    registration?: string
    instructor?: any
    team?: any
    contextActivities?: {
      parent?: any[]
      grouping?: any[]
      category?: any[]
      other?: any[]
    }
    revision?: string
    platform?: string
    language?: string
    statement?: any
    extensions?: { [key: string]: any }
  }
  timestamp?: string
  stored?: string
  authority?: any
  version?: string
  attachments?: any[]
}

export class SCORMEngine {
  
  // Gerador de pacote SCORM completo
  static async generateSCORMPackage(
    videoProject: {
      id: string
      title: string
      description: string
      duration_minutes: number
      scenes: any[]
      quiz_questions: any[]
      completion_criteria: {
        min_score?: number
        min_time_spent?: number
        required_interactions?: string[]
      }
    },
    lms_config: {
      version: '1.2' | '2004'
      launch_data?: string
      mastery_score?: number
      max_time_allowed?: number
    }
  ): Promise<{
    package: SCORMPackage
    manifest_xml: string
    content_files: { path: string, content: string }[]
    zip_blob: Blob
  }> {
    
    const package_id = `estudio-ia-${videoProject.id}-${Date.now()}`
    
    // Criar objetivos baseados no projeto
    const objectives: SCORMObjective[] = [
      {
        id: 'primary_objective',
        description: `Completar treinamento: ${videoProject.title}`,
        success_status: 'unknown',
        completion_status: 'not_attempted',
        score_min: 0,
        score_max: 100
      }
    ]

    // Criar interações baseadas no quiz
    const interactions: SCORMInteraction[] = videoProject.quiz_questions.map((question, index) => ({
      id: `question_${index + 1}`,
      type: 'choice',
      objectives: ['primary_objective'],
      timestamp: new Date().toISOString(),
      correct_responses: [question.correct_answer.toString()],
      weighting: 1.0,
      result: 'neutral',
      description: question.question
    }))

    const scorm_package: SCORMPackage = {
      identifier: package_id,
      title: videoProject.title,
      description: videoProject.description,
      version: lms_config.version,
      launch_url: 'index.html',
      completion_threshold: lms_config.mastery_score || 70,
      mastery_score: lms_config.mastery_score || 70,
      max_time_allowed: lms_config.max_time_allowed?.toString(),
      time_limit_action: 'continue',
      objectives,
      interactions,
      resources: [
        {
          identifier: 'main_content',
          type: 'sco',
          href: 'index.html',
          files: [
            { href: 'index.html' },
            { href: 'video.mp4' },
            { href: 'scorm_api.js' },
            { href: 'content.js' },
            { href: 'styles.css' }
          ]
        }
      ]
    }

    // Gerar Manifest XML
    const manifest_xml = this.generateManifestXML(scorm_package)
    
    // Gerar arquivos de conteúdo
    const content_files = await this.generateContentFiles(scorm_package, videoProject)
    
    // Criar ZIP
    const zip_blob = await this.createZipPackage(manifest_xml, content_files)

    return {
      package: scorm_package,
      manifest_xml,
      content_files,
      zip_blob
    }
  }

  // Gerador de declarações xAPI
  static generatexAPIStatements(
    user_id: string,
    video_project: any,
    session_data: {
      start_time: string
      end_time: string
      interactions: Array<{
        scene_id: string
        action: 'started' | 'paused' | 'completed' | 'answered'
        timestamp: string
        data?: any
      }>
      quiz_results?: Array<{
        question_id: string
        answer: string
        correct: boolean
        timestamp: string
      }>
      completion_status: 'completed' | 'incomplete' | 'passed' | 'failed'
      score?: number
    }
  ): xAPIStatement[] {
    
    const statements: xAPIStatement[] = []
    const base_actor = {
      account: {
        homePage: 'https://estudio-ia.com',
        name: user_id
      }
    }

    // Statement de início do treinamento
    statements.push({
      actor: base_actor,
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/experienced',
        display: { 'pt-BR': 'experienciou', 'en': 'experienced' }
      },
      object: {
        id: `https://estudio-ia.com/training/${video_project.id}`,
        definition: {
          name: { 'pt-BR': video_project.title },
          description: { 'pt-BR': video_project.description },
          type: 'http://adlnet.gov/expapi/activities/course'
        }
      },
      timestamp: session_data.start_time,
      context: {
        registration: `session-${Date.now()}`,
        platform: 'Estúdio IA de Vídeos',
        language: 'pt-BR'
      }
    })

    // Statements para cada interação
    session_data.interactions.forEach(interaction => {
      statements.push({
        actor: base_actor,
        verb: {
          id: this.getVerbForAction(interaction.action),
          display: this.getVerbDisplay(interaction.action)
        },
        object: {
          id: `https://estudio-ia.com/scene/${interaction.scene_id}`,
          definition: {
            type: 'http://adlnet.gov/expapi/activities/lesson'
          }
        },
        timestamp: interaction.timestamp,
        result: interaction.data ? {
          extensions: {
            'https://estudio-ia.com/extensions/interaction-data': interaction.data
          }
        } : undefined
      })
    })

    // Statements para resultados do quiz
    if (session_data.quiz_results) {
      session_data.quiz_results.forEach(quiz => {
        statements.push({
          actor: base_actor,
          verb: {
            id: 'http://adlnet.gov/expapi/verbs/answered',
            display: { 'pt-BR': 'respondeu', 'en': 'answered' }
          },
          object: {
            id: `https://estudio-ia.com/question/${quiz.question_id}`,
            definition: {
              type: 'http://adlnet.gov/expapi/activities/cmi.interaction'
            }
          },
          result: {
            success: quiz.correct,
            response: quiz.answer,
            score: quiz.correct ? { raw: 1, min: 0, max: 1 } : { raw: 0, min: 0, max: 1 }
          },
          timestamp: quiz.timestamp
        })
      })
    }

    // Statement de conclusão
    statements.push({
      actor: base_actor,
      verb: {
        id: session_data.completion_status.includes('completed') ? 
             'http://adlnet.gov/expapi/verbs/completed' : 
             'http://adlnet.gov/expapi/verbs/terminated',
        display: session_data.completion_status.includes('completed') ? 
                { 'pt-BR': 'completou', 'en': 'completed' } :
                { 'pt-BR': 'terminou', 'en': 'terminated' }
      },
      object: {
        id: `https://estudio-ia.com/training/${video_project.id}`,
        definition: {
          name: { 'pt-BR': video_project.title },
          type: 'http://adlnet.gov/expapi/activities/course'
        }
      },
      result: {
        completion: session_data.completion_status.includes('completed'),
        success: session_data.completion_status === 'passed',
        score: session_data.score ? {
          raw: session_data.score,
          min: 0,
          max: 100,
          scaled: session_data.score / 100
        } : undefined,
        duration: this.calculateDuration(session_data.start_time, session_data.end_time)
      },
      timestamp: session_data.end_time
    })

    return statements
  }

  // Helper methods
  private static generateManifestXML(package_data: SCORMPackage): string {
    if (package_data.version === '2004') {
      return this.generateSCORM2004Manifest(package_data)
    } else {
      return this.generateSCORM12Manifest(package_data)
    }
  }

  private static generateSCORM2004Manifest(package_data: SCORMPackage): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${package_data.identifier}" version="1.0" 
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" 
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
    <adlcp:location>metadata.xml</adlcp:location>
  </metadata>
  
  <organizations default="default_org">
    <organization identifier="default_org">
      <title>${package_data.title}</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>${package_data.title}</title>
        <adlcp:timeLimitAction>${package_data.time_limit_action}</adlcp:timeLimitAction>
        <adlcp:completionThreshold>${package_data.completion_threshold}</adlcp:completionThreshold>
      </item>
    </organization>
  </organizations>
  
  <resources>
    <resource identifier="resource_1" type="webcontent" adlcp:scormType="sco" href="${package_data.launch_url}">
      ${package_data.resources[0].files.map(file => `<file href="${file.href}"/>`).join('\n      ')}
    </resource>
  </resources>
</manifest>`
  }

  private static generateSCORM12Manifest(package_data: SCORMPackage): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${package_data.identifier}" version="1.0" 
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" 
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  
  <organizations default="default_org">
    <organization identifier="default_org">
      <title>${package_data.title}</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>${package_data.title}</title>
        <adlcp:masteryscore>${package_data.mastery_score}</adlcp:masteryscore>
        <adlcp:maxtimeallowed>${package_data.max_time_allowed}</adlcp:maxtimeallowed>
      </item>
    </organization>
  </organizations>
  
  <resources>
    <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="${package_data.launch_url}">
      ${package_data.resources[0].files.map(file => `<file href="${file.href}"/>`).join('\n      ')}
    </resource>
  </resources>
</manifest>`
  }

  private static async generateContentFiles(
    package_data: SCORMPackage, 
    video_project: any
  ): Promise<{ path: string, content: string }[]> {
    
    const files = [
      {
        path: 'index.html',
        content: this.generateSCORMPlayerHTML(package_data, video_project)
      },
      {
        path: 'scorm_api.js',
        content: this.generateSCORMAPIWrapper(package_data.version)
      },
      {
        path: 'content.js',
        content: this.generateContentScript(video_project)
      },
      {
        path: 'styles.css',
        content: this.generateSCORMStyles()
      },
      {
        path: 'metadata.xml',
        content: this.generateMetadataXML(package_data)
      }
    ]

    return files
  }

  private static generateSCORMPlayerHTML(package_data: SCORMPackage, video_project: any): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${package_data.title}</title>
  <link rel="stylesheet" href="styles.css">
  <script src="scorm_api.js"></script>
</head>
<body>
  <div id="scorm-player">
    <header>
      <h1>${package_data.title}</h1>
      <div id="progress-bar">
        <div id="progress-fill"></div>
      </div>
    </header>
    
    <main>
      <div id="video-container">
        <video id="training-video" controls>
          <source src="video.mp4" type="video/mp4">
          <p>Seu navegador não suporta vídeo HTML5.</p>
        </video>
      </div>
      
      <div id="quiz-container" style="display: none;">
        <div id="quiz-questions"></div>
        <button id="submit-quiz">Finalizar Quiz</button>
      </div>
      
      <div id="completion-screen" style="display: none;">
        <h2>Treinamento Concluído!</h2>
        <p>Parabéns! Você concluiu o treinamento com sucesso.</p>
        <div id="final-score"></div>
        <button id="close-content">Fechar</button>
      </div>
    </main>
  </div>
  
  <script src="content.js"></script>
  <script>
    // Dados do projeto injetados
    window.PROJECT_DATA = ${JSON.stringify(video_project)};
    window.SCORM_CONFIG = ${JSON.stringify(package_data)};
  </script>
</body>
</html>`
  }

  private static generateSCORMAPIWrapper(version: '1.2' | '2004'): string {
    if (version === '2004') {
      return `
// SCORM 2004 API Wrapper
var API_1484_11 = {
  initialized: false,
  terminated: false,
  
  Initialize: function(parameter) {
    if (this.initialized) return 'false';
    this.initialized = true;
    this.SetValue('cmi.completion_status', 'incomplete');
    this.SetValue('cmi.success_status', 'unknown');
    this.SetValue('cmi.entry', 'ab-initio');
    this.SetValue('cmi.mode', 'normal');
    return 'true';
  },
  
  Terminate: function(parameter) {
    if (!this.initialized || this.terminated) return 'false';
    this.terminated = true;
    return 'true';
  },
  
  GetValue: function(element) {
    return localStorage.getItem('scorm_' + element) || '';
  },
  
  SetValue: function(element, value) {
    localStorage.setItem('scorm_' + element, value);
    return 'true';
  },
  
  Commit: function(parameter) {
    return 'true';
  },
  
  GetLastError: function() {
    return '0';
  },
  
  GetErrorString: function(errorCode) {
    return 'No error';
  },
  
  GetDiagnostic: function(parameter) {
    return '';
  }
};

// Fazer disponível globalmente
window.API_1484_11 = API_1484_11;
      `
    } else {
      return `
// SCORM 1.2 API Wrapper  
var API = {
  initialized: false,
  terminated: false,
  
  LMSInitialize: function(parameter) {
    if (this.initialized) return 'false';
    this.initialized = true;
    this.LMSSetValue('cmi.core.lesson_status', 'incomplete');
    this.LMSSetValue('cmi.core.entry', 'ab-initio');
    this.LMSSetValue('cmi.core.lesson_mode', 'normal');
    return 'true';
  },
  
  LMSFinish: function(parameter) {
    if (!this.initialized || this.terminated) return 'false';
    this.terminated = true;
    return 'true';
  },
  
  LMSGetValue: function(element) {
    return localStorage.getItem('scorm_' + element) || '';
  },
  
  LMSSetValue: function(element, value) {
    localStorage.setItem('scorm_' + element, value);
    return 'true';
  },
  
  LMSCommit: function(parameter) {
    return 'true';
  },
  
  LMSGetLastError: function() {
    return '0';
  },
  
  LMSGetErrorString: function(errorCode) {
    return 'No error';
  },
  
  LMSGetDiagnostic: function(parameter) {
    return '';
  }
};

// Fazer disponível globalmente
window.API = API;
      `
    }
  }

  private static generateContentScript(video_project: any): string {
    return `
// SCORM Content Controller
class SCORMContentController {
  constructor() {
    this.api = null;
    this.currentScene = 0;
    this.quizScore = 0;
    this.startTime = new Date();
    
    this.initializeSCORM();
    this.setupEventListeners();
  }
  
  initializeSCORM() {
    // Detectar versão e API
    if (window.API_1484_11) {
      this.api = window.API_1484_11;
      this.scormVersion = '2004';
    } else if (window.API) {
      this.api = window.API;
      this.scormVersion = '1.2';
    } else {
      console.warn('SCORM API não encontrada');
      return;
    }
    
    // Inicializar
    const initialized = this.scormVersion === '2004' ? 
      this.api.Initialize('') : 
      this.api.LMSInitialize('');
    
    if (initialized === 'true') {
      console.log('SCORM inicializado com sucesso');
      this.reportProgress('started');
    }
  }
  
  setupEventListeners() {
    const video = document.getElementById('training-video');
    const quizContainer = document.getElementById('quiz-container');
    const submitQuiz = document.getElementById('submit-quiz');
    
    // Eventos do vídeo
    video.addEventListener('play', () => this.reportProgress('video_started'));
    video.addEventListener('pause', () => this.reportProgress('video_paused'));
    video.addEventListener('ended', () => {
      this.reportProgress('video_completed');
      this.showQuiz();
    });
    
    // Atualizar progresso baseado no tempo do vídeo
    video.addEventListener('timeupdate', () => {
      const progress = (video.currentTime / video.duration) * 100;
      this.updateProgressBar(progress);
      this.reportProgress('video_progress', { progress: progress });
    });
    
    // Quiz
    submitQuiz.addEventListener('click', () => this.submitQuiz());
  }
  
  showQuiz() {
    document.getElementById('video-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    
    this.renderQuiz();
    this.reportProgress('quiz_started');
  }
  
  renderQuiz() {
    const questionsContainer = document.getElementById('quiz-questions');
    const questions = window.PROJECT_DATA.quiz_questions || [];
    
    questionsContainer.innerHTML = questions.map((question, index) => \`
      <div class="quiz-question">
        <h3>Pergunta \${index + 1}</h3>
        <p>\${question.question}</p>
        <div class="quiz-options">
          \${question.options.map((option, optIndex) => \`
            <label>
              <input type="radio" name="question_\${index}" value="\${optIndex}">
              \${option}
            </label>
          \`).join('')}
        </div>
      </div>
    \`).join('');
  }
  
  submitQuiz() {
    const questions = window.PROJECT_DATA.quiz_questions || [];
    let correctAnswers = 0;
    
    questions.forEach((question, index) => {
      const selected = document.querySelector(\`input[name="question_\${index}"]:checked\`);
      if (selected && parseInt(selected.value) === question.correct_answer) {
        correctAnswers++;
      }
    });
    
    this.quizScore = Math.round((correctAnswers / questions.length) * 100);
    this.completeTraining();
  }
  
  completeTraining() {
    const passed = this.quizScore >= (window.SCORM_CONFIG.mastery_score || 70);
    
    // Reportar conclusão
    if (this.scormVersion === '2004') {
      this.api.SetValue('cmi.completion_status', 'completed');
      this.api.SetValue('cmi.success_status', passed ? 'passed' : 'failed');
      this.api.SetValue('cmi.score.raw', this.quizScore.toString());
      this.api.SetValue('cmi.score.min', '0');
      this.api.SetValue('cmi.score.max', '100');
    } else {
      this.api.LMSSetValue('cmi.core.lesson_status', passed ? 'passed' : 'failed');
      this.api.LMSSetValue('cmi.core.score.raw', this.quizScore.toString());
      this.api.LMSSetValue('cmi.core.score.min', '0');
      this.api.LMSSetValue('cmi.core.score.max', '100');
    }
    
    // Commit dados
    this.scormVersion === '2004' ? this.api.Commit('') : this.api.LMSCommit('');
    
    this.showCompletionScreen(passed);
  }
  
  showCompletionScreen(passed) {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('completion-screen').style.display = 'block';
    
    document.getElementById('final-score').innerHTML = \`
      <p>Pontuação Final: \${this.quizScore}%</p>
      <p>Status: \${passed ? 'Aprovado' : 'Reprovado'}</p>
    \`;
    
    document.getElementById('close-content').addEventListener('click', () => {
      this.scormVersion === '2004' ? 
        this.api.Terminate('') : 
        this.api.LMSFinish('');
      window.close();
    });
  }
  
  reportProgress(action, data = {}) {
    console.log('SCORM Progress:', action, data);
    
    // Reportar interação
    if (this.api && this.scormVersion === '2004') {
      const interactionIndex = this.api.GetValue('cmi.interactions._count') || '0';
      this.api.SetValue(\`cmi.interactions.\${interactionIndex}.id\`, action);
      this.api.SetValue(\`cmi.interactions.\${interactionIndex}.type\`, 'other');
      this.api.SetValue(\`cmi.interactions.\${interactionIndex}.timestamp\`, new Date().toISOString());
      this.api.SetValue(\`cmi.interactions.\${interactionIndex}.description\`, JSON.stringify(data));
      this.api.SetValue('cmi.interactions._count', (parseInt(interactionIndex) + 1).toString());
    }
  }
  
  updateProgressBar(progress) {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      progressFill.style.width = progress + '%';
    }
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new SCORMContentController();
});
    `
  }

  private static generateSCORMStyles(): string {
    return `
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f5f5f5;
  color: #333;
}

#scorm-player {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

header {
  background: #2563eb;
  color: white;
  padding: 20px;
}

header h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

#progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

#progress-fill {
  height: 100%;
  background: #10b981;
  width: 0%;
  transition: width 0.3s ease;
}

main {
  padding: 30px;
}

#video-container {
  text-align: center;
  margin-bottom: 30px;
}

#training-video {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 8px;
}

.quiz-question {
  background: #f8fafc;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  border-left: 4px solid #2563eb;
}

.quiz-question h3 {
  margin: 0 0 10px 0;
  color: #1e40af;
}

.quiz-options {
  margin-top: 15px;
}

.quiz-options label {
  display: block;
  padding: 10px;
  margin: 5px 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.quiz-options label:hover {
  border-color: #2563eb;
  background: #f0f9ff;
}

.quiz-options input[type="radio"] {
  margin-right: 10px;
}

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

button:hover {
  background: #1d4ed8;
}

#completion-screen {
  text-align: center;
  padding: 40px 20px;
}

#completion-screen h2 {
  color: #10b981;
  margin-bottom: 20px;
}

#final-score {
  background: #f0fdf4;
  border: 2px solid #10b981;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

#final-score p {
  margin: 5px 0;
  font-weight: bold;
}

@media (max-width: 768px) {
  body {
    padding: 10px;
  }
  
  header, main {
    padding: 20px;
  }
  
  .quiz-question {
    padding: 15px;
  }
}
    `
  }

  private static generateMetadataXML(package_data: SCORMPackage): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<lom xmlns="http://ltsc.ieee.org/xsd/LOM">
  <general>
    <identifier>
      <catalog>URI</catalog>
      <entry>${package_data.identifier}</entry>
    </identifier>
    <title>
      <string language="pt-BR">${package_data.title}</string>
    </title>
    <language>pt-BR</language>
    <description>
      <string language="pt-BR">${package_data.description}</string>
    </description>
    <keyword>
      <string language="pt-BR">treinamento</string>
    </keyword>
    <keyword>
      <string language="pt-BR">segurança</string>
    </keyword>
    <keyword>
      <string language="pt-BR">NR</string>
    </keyword>
  </general>
  <technical>
    <format>text/html</format>
    <size>0</size>
    <location>${package_data.launch_url}</location>
    <requirement>
      <orComposite>
        <type>
          <source>LOMv1.0</source>
          <value>browser</value>
        </type>
        <name>
          <source>LOMv1.0</source>
          <value>any</value>
        </name>
      </orComposite>
    </requirement>
  </technical>
  <educational>
    <learningResourceType>
      <source>LOMv1.0</source>
      <value>exercise</value>
    </learningResourceType>
    <intendedEndUserRole>
      <source>LOMv1.0</source>
      <value>learner</value>
    </intendedEndUserRole>
    <context>
      <source>LOMv1.0</source>
      <value>training</value>
    </context>
  </educational>
</lom>`
  }

  private static async createZipPackage(
    manifest_xml: string, 
    content_files: { path: string, content: string }[]
  ): Promise<Blob> {
    // Simular criação de ZIP - em produção usaria JSZip
    const zip_content = {
      'imsmanifest.xml': manifest_xml,
      ...Object.fromEntries(content_files.map(file => [file.path, file.content]))
    }
    
    // Retornar blob simulado
    return new Blob([JSON.stringify(zip_content)], { type: 'application/zip' })
  }

  private static getVerbForAction(action: string): string {
    const verbs: Record<string, string> = {
      'started': 'http://adlnet.gov/expapi/verbs/experienced',
      'paused': 'http://adlnet.gov/expapi/verbs/suspended',
      'completed': 'http://adlnet.gov/expapi/verbs/completed',
      'answered': 'http://adlnet.gov/expapi/verbs/answered'
    }
    return verbs[action] || 'http://adlnet.gov/expapi/verbs/interacted'
  }

  private static getVerbDisplay(action: string): { [key: string]: string } {
    const displays: Record<string, { [key: string]: string }> = {
      'started': { 'pt-BR': 'iniciou', 'en': 'started' },
      'paused': { 'pt-BR': 'pausou', 'en': 'paused' },
      'completed': { 'pt-BR': 'completou', 'en': 'completed' },
      'answered': { 'pt-BR': 'respondeu', 'en': 'answered' }
    }
    return displays[action] || { 'pt-BR': 'interagiu', 'en': 'interacted' }
  }

  private static calculateDuration(start_time: string, end_time: string): string {
    const start = new Date(start_time).getTime()
    const end = new Date(end_time).getTime()
    const duration_ms = end - start
    
    const hours = Math.floor(duration_ms / (1000 * 60 * 60))
    const minutes = Math.floor((duration_ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((duration_ms % (1000 * 60)) / 1000)
    
    return `PT${hours}H${minutes}M${seconds}S`
  }
}

