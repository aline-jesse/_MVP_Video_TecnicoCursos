
const fs = require('fs');
const path = require('path');

// Lista de APIs que precisam de configuração dinâmica
const apiFiles = [
  '/home/ubuntu/estudio_ia_videos/app/app/api/v2/video-effects/advanced/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v2/enterprise/analytics/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v2/collaboration/rooms/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/pptx/assets/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/pptx/editor/timeline/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/pptx/templates/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v4/avatars/ready-player-me/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v4/avatars/tts-generate/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v4/avatars/lip-sync/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v3/analytics/behavioral/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v3/gamification/leaderboard/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v1/render/start/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v1/avatars/3d/hyperreal/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v1/avatars/3d/lipsync/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v1/avatars/3d/render-pipeline/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v1/projects/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v1/upload/route.ts',
  '/home/ubuntu/estudio_ia_videos/app/app/api/v1/tts/voices/route.ts'
];

// Função para adicionar configuração dinâmica
function addDynamicConfig(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar se já tem a configuração
    if (content.includes("export const dynamic = 'force-dynamic'")) {
      console.log(`Already configured: ${filePath}`);
      return true;
    }
    
    // Procurar a primeira função export
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('export async function')) {
        insertIndex = i;
        break;
      }
    }
    
    if (insertIndex > -1) {
      // Inserir a configuração antes da primeira função export
      lines.splice(insertIndex, 0, '', "// Force dynamic rendering to avoid build-time errors", "export const dynamic = 'force-dynamic'");
      
      const newContent = lines.join('\n');
      fs.writeFileSync(filePath, newContent);
      console.log(`Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`No export function found in: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Processar todos os arquivos
let fixed = 0;
let failed = 0;

apiFiles.forEach(filePath => {
  const result = addDynamicConfig(filePath);
  if (result) {
    fixed++;
  } else {
    failed++;
  }
});

console.log(`\nSummary: ${fixed} fixed, ${failed} failed`);
