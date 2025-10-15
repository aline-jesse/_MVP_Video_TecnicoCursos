
import { NextRequest, NextResponse } from 'next/server'
import { LMSIntegrationService, LMSMetadata } from '../../../../lib/lms-integration'
import { Analytics } from '../../../../lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const { 
      slides, 
      config, 
      metadata, 
      format, 
      video_url 
    } = await request.json()

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { error: 'Slides são obrigatórios' },
        { status: 400 }
      )
    }

    if (!format || !['SCORM_1_2', 'SCORM_2004', 'xAPI'].includes(format)) {
      return NextResponse.json(
        { error: 'Formato LMS inválido' },
        { status: 400 }
      )
    }

    const lmsMetadata: LMSMetadata = {
      identifier: `course_${Date.now()}`,
      title: metadata.title || 'Treinamento de Segurança',
      description: metadata.description || 'Curso de segurança do trabalho',
      keywords: metadata.keywords || ['segurança', 'trabalho', 'treinamento'],
      language: 'pt-BR',
      difficulty: metadata.difficulty || 'intermediate',
      typical_learning_time: `${metadata.duration_minutes || 40} minutos`,
      target_audience: metadata.target_audience || 'Trabalhadores em geral',
      learning_objectives: metadata.learning_objectives || [
        'Compreender os principais riscos de segurança',
        'Aplicar medidas preventivas adequadas',
        'Seguir procedimentos de segurança estabelecidos'
      ],
      prerequisites: metadata.prerequisites || [],
      certification: {
        available: metadata.certification_available || true,
        hours: metadata.certification_hours || 8,
        authority: 'Estúdio IA de Vídeos'
      }
    }

    let exportResult: any

    // Gerar pacote baseado no formato
    switch (format) {
      case 'SCORM_1_2':
        const scorm12Manifest = LMSIntegrationService.generateSCORM12Package(
          slides, config, lmsMetadata
        )
        const manifestXML = LMSIntegrationService.generateIMSManifestXML(scorm12Manifest)
        const contentHTML = LMSIntegrationService.generateSCORMContent(slides, video_url)
        
        exportResult = {
          manifest: scorm12Manifest,
          files: {
            'imsmanifest.xml': manifestXML,
            'index.html': contentHTML,
            'scormapi.js': generateSCORMAPI(),
            'scormdriver.js': generateSCORMDriver(),
            'content.json': JSON.stringify({ slides, config })
          }
        }
        break

      case 'SCORM_2004':
        const scorm2004Manifest = LMSIntegrationService.generateSCORM2004Package(
          slides, config, lmsMetadata
        )
        exportResult = {
          manifest: scorm2004Manifest,
          files: {
            'imsmanifest.xml': LMSIntegrationService.generateIMSManifestXML(scorm2004Manifest),
            'index.html': LMSIntegrationService.generateSCORMContent(slides, video_url),
            'scormapi.js': generateSCORMAPI(),
            'scormdriver.js': generateSCORMDriver()
          }
        }
        break

      case 'xAPI':
        const sampleStatements = LMSIntegrationService.generatexAPIStatements(
          'sample_user',
          'Usuário de Teste',
          'teste@exemplo.com',
          lmsMetadata.identifier,
          lmsMetadata.title,
          slides,
          { completed_slides: slides.length, score: 85, duration_minutes: 45 }
        )
        
        exportResult = {
          statements: sampleStatements,
          metadata: lmsMetadata,
          files: {
            'tincan.xml': generateTinCanXML(lmsMetadata),
            'index.html': generatexAPIContent(slides, video_url, lmsMetadata)
          }
        }
        break
    }

    // Gerar URL de download do pacote
    const packageId = `${format.toLowerCase()}_${Date.now()}`
    const downloadUrl = `/api/lms/download/${packageId}`

    Analytics.track('lms_package_generated', {
      format,
      slides_count: slides.length,
      package_id: packageId,
      certification_hours: lmsMetadata.certification.hours
    })

    return NextResponse.json({
      success: true,
      format,
      package_id: packageId,
      download_url: downloadUrl,
      metadata: lmsMetadata,
      export_result: exportResult,
      instructions: getInstructionForFormat(format)
    })

  } catch (error) {
    console.error('LMS Export Error:', error)
    
    Analytics.track('lms_export_failed', {
      error_message: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Erro na exportação para LMS' },
      { status: 500 }
    )
  }
}

// Funções auxiliares para gerar arquivos necessários
function generateSCORMAPI(): string {
  return `
// SCORM API Wrapper
var scormAPI = {
  initialized: false,
  
  initialize: function() {
    var API = this.findAPI(window);
    if (API) {
      var result = API.LMSInitialize("");
      this.initialized = (result === "true");
      return this.initialized;
    }
    return false;
  },
  
  findAPI: function(win) {
    var attempts = 0;
    while ((win.API == null) && (win.parent != null) && (win.parent != win) && (attempts < 7)) {
      attempts++;
      win = win.parent;
    }
    return win.API;
  },
  
  setValue: function(name, value) {
    if (this.initialized) {
      var API = this.findAPI(window);
      return API ? API.LMSSetValue(name, value) : false;
    }
    return false;
  },
  
  getValue: function(name) {
    if (this.initialized) {
      var API = this.findAPI(window);
      return API ? API.LMSGetValue(name) : "";
    }
    return "";
  },
  
  commit: function() {
    if (this.initialized) {
      var API = this.findAPI(window);
      return API ? API.LMSCommit("") : false;
    }
    return false;
  },
  
  terminate: function() {
    if (this.initialized) {
      var API = this.findAPI(window);
      var result = API ? API.LMSFinish("") : false;
      this.initialized = false;
      return result;
    }
    return false;
  }
};
`
}

function generateSCORMDriver(): string {
  return `
// SCORM Driver Functions
function initializeSCORM() {
  if (scormAPI.initialize()) {
    var lessonStatus = scormAPI.getValue("cmi.core.lesson_status");
    if (lessonStatus === "not attempted") {
      scormAPI.setValue("cmi.core.lesson_status", "incomplete");
    }
    scormAPI.setValue("cmi.core.score.min", "0");
    scormAPI.setValue("cmi.core.score.max", "100");
    return true;
  }
  return false;
}

function setSCORMScore(score) {
  scormAPI.setValue("cmi.core.score.raw", score.toString());
  if (score >= 70) {
    scormAPI.setValue("cmi.core.lesson_status", "passed");
  } else {
    scormAPI.setValue("cmi.core.lesson_status", "failed");
  }
  scormAPI.commit();
}

function setSCORMCompleted() {
  scormAPI.setValue("cmi.core.lesson_status", "completed");
  scormAPI.commit();
}

function setSCORMProgress(progressMeasure) {
  scormAPI.setValue("cmi.progress_measure", progressMeasure.toString());
  scormAPI.commit();
}
`
}

function generateTinCanXML(metadata: LMSMetadata): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<tincan xmlns="http://projecttincan.com/tincan.xsd">
  <activities>
    <activity type="http://adlnet.gov/expapi/activities/course" id="https://estudio-ia.com/courses/${metadata.identifier}">
      <name lang="pt-BR">${metadata.title}</name>
      <description lang="pt-BR">${metadata.description}</description>
      <launch lang="pt-BR">index.html</launch>
    </activity>
  </activities>
</tincan>`
}

function generatexAPIContent(slides: any[], videoUrl: string, metadata: LMSMetadata): string {
  return `<!DOCTYPE html>
<html>
<head>
    <title>${metadata.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/tincanjs@latest/build/tincan-min.js"></script>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        video { width: 100%; max-width: 800px; }
        .progress { background: #f0f0f0; height: 20px; border-radius: 10px; }
        .progress-bar { background: #4CAF50; height: 100%; border-radius: 10px; }
    </style>
</head>
<body>
    <h1>${metadata.title}</h1>
    <div class="progress">
        <div class="progress-bar" id="progress" style="width: 0%"></div>
    </div>
    <video controls src="${videoUrl}"></video>
    
    <script>
        var tincan = new TinCan({
            recordStores: [{
                endpoint: "https://cloud.scorm.com/tc/public/",
                username: "test",
                password: "test"
            }]
        });
        
        // Send attempted statement
        tincan.sendStatement({
            verb: {
                id: "http://adlnet.gov/expapi/verbs/attempted",
                display: {"pt-BR": "iniciou"}
            },
            object: {
                id: "https://estudio-ia.com/courses/${metadata.identifier}",
                definition: {
                    name: {"pt-BR": "${metadata.title}"}
                }
            }
        });
    </script>
</body>
</html>`
}

function getInstructionForFormat(format: string): string {
  const instructions: Record<string, string> = {
    'SCORM_1_2': 'Upload do arquivo ZIP para LMS compatível com SCORM 1.2',
    'SCORM_2004': 'Upload do arquivo ZIP para LMS compatível com SCORM 2004',
    'xAPI': 'Configurar endpoint xAPI no LRS (Learning Record Store)'
  }
  return instructions[format] || 'Instruções não disponíveis'
}
