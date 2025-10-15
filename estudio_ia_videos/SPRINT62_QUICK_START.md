# Sprint 62 - Advanced Video Effects System
## Guia Rápido (Quick Start)

### 🚀 Instalação Rápida (5 minutos)

```typescript
import {
  AdvancedVideoEffects,
  createBasicEffectsSystem,
  createProEffectsSystem,
} from './lib/effects/advanced-effects';

// Opção 1: Sistema básico
const effects = createBasicEffectsSystem();

// Opção 2: Sistema profissional
const effectsPro = createProEffectsSystem();

// Opção 3: Custom configuration
const effectsCustom = new AdvancedVideoEffects({
  maxEffectsPerLayer: 15,
  maxLayers: 8,
  enableGPUAcceleration: true,
  cacheSize: 750,
  previewQuality: 'high',
  realTimePreview: true,
  autoSaveInterval: 45000,
});
```

---

## 📚 Exemplos Práticos

### 1. Particle Systems (3 minutos)

#### Neve Caindo
```typescript
// Criar efeito de neve
const snowId = effects.createParticleEffect('snow', 0, 10);

// Customizar neve
effects.updateParticleEffect(snowId, {
  count: 150,
  size: { min: 3, max: 6 },
  wind: { x: 15, y: 0 },
  intensity: 0.8,
});

// Escutar eventos
effects.on('effect:created', (effect) => {
  console.log(`Effect ${effect.name} created!`);
});
```

#### Chuva
```typescript
const rainId = effects.createParticleEffect('rain', 5, 8, {
  count: 300,
  velocity: { x: 10, y: 400 },
  intensity: 1.0,
});
```

#### Fogo
```typescript
const fireId = effects.createParticleEffect('fire', 0, 5, {
  count: 75,
  color: '#ff4400',
  size: { min: 15, max: 40 },
});
```

#### Confetti
```typescript
const confettiId = effects.createParticleEffect('confetti', 10, 4, {
  count: 200,
  rotation: true,
  color: '#ff00ff',
});
```

### 2. Advanced Transitions (4 minutos)

#### Wipe Transition
```typescript
const wipeId = effects.createTransition('wipe', 0, 1, {
  direction: 'right',
  feather: 0.2,
  easing: 'ease-in-out',
});
```

#### Zoom Transition
```typescript
const zoomId = effects.createTransition('zoom', 0, 1.5, {
  direction: 'in',
  feather: 0.3,
  easing: 'ease-out',
});
```

#### Page Turn
```typescript
const pageTurnId = effects.createTransition('page-turn', 0, 2);
```

#### Transition com Borda
```typescript
const borderedId = effects.createTransition('wipe', 0, 1, {
  direction: 'left',
  borderWidth: 5,
  borderColor: '#ffaa00',
  feather: 0.1,
});
```

### 3. Motion Tracking (5 minutos)

#### Object Tracking
```typescript
// Criar tracking
const trackingId = effects.createTracking('object', 0, 20, {
  target: {
    x: 100,
    y: 200,
    width: 50,
    height: 50,
  },
  smoothing: 0.7,
  confidence: 0.85,
});

// Atualizar path de tracking
effects.updateTrackingPath(trackingId, {
  x: 120,
  y: 210,
  timestamp: 0.5,
});

effects.updateTrackingPath(trackingId, {
  x: 140,
  y: 220,
  timestamp: 1.0,
});

// Escutar updates
effects.on('tracking:updated', ({ effectId, point }) => {
  console.log(`Tracking ${effectId} at (${point.x}, ${point.y})`);
});
```

#### Face Tracking
```typescript
const faceTrackingId = effects.createTracking('face', 0, 30, {
  confidence: 0.9,
  smoothing: 0.6,
});
```

#### Stabilization
```typescript
const stabilizationId = effects.createTracking('stabilization', 0, 60);

// Aplicar análise de estabilização
const analysisData = {
  frames: 1800,
  motionVectors: [...],
};

effects.applyStabilization(stabilizationId, analysisData);

effects.on('stabilization:applied', (effect) => {
  console.log('Stabilization applied successfully!');
});
```

### 4. Chroma Key (Green Screen) (4 minutos)

#### Green Screen Básico
```typescript
const chromaKeyId = effects.createChromaKey('#00ff00', 0, 30);
```

#### Blue Screen
```typescript
const blueScreenId = effects.createChromaKey('#0000ff', 0, 30, {
  tolerance: 0.4,
  softness: 0.3,
  despill: 0.6,
  edgeBlur: 2,
});
```

#### Auto-detect Key Color
```typescript
const chromaId = effects.createChromaKey('#ff0000', 0, 30);

// Detectar cor automaticamente de uma área da imagem
const detectedColor = effects.autoDetectChromaKey(chromaId, {
  x: 10,
  y: 10,
  width: 100,
  height: 100,
});

console.log(`Detected color: ${detectedColor}`);

effects.on('chromakey:detected', ({ effectId, color }) => {
  console.log(`Chroma key color detected: ${color}`);
});
```

#### Chroma Key Avançado
```typescript
const advancedChromaId = effects.createChromaKey('#00ff00', 0, 60, {
  tolerance: 0.35,
  softness: 0.25,
  despill: 0.7,
  edgeBlur: 1.5,
  shadows: true,
  highlights: true,
});
```

### 5. Color Grading (6 minutos)

#### Color Grading Básico
```typescript
const colorGradeId = effects.createColorGrade(0, 30, {
  temperature: 15,
  tint: -5,
  exposure: 0.3,
  contrast: 10,
  saturation: 8,
});
```

#### Aplicar LUT (Look-Up Table)
```typescript
const lutGradeId = effects.createColorGrade(0, 60);

effects.applyLUT(lutGradeId, '/assets/luts/cinematic.cube');

effects.on('lut:applied', ({ effectId, lutPath }) => {
  console.log(`LUT ${lutPath} applied!`);
});
```

#### Ajustar Curves
```typescript
const curvesGradeId = effects.createColorGrade(0, 30);

// RGB curve (todas as cores)
effects.updateCurves(curvesGradeId, 'rgb', [0, 0.2, 0.5, 0.8, 1]);

// Red channel
effects.updateCurves(curvesGradeId, 'red', [0, 0.3, 0.6, 0.9, 1]);

// Green channel
effects.updateCurves(curvesGradeId, 'green', [0, 0.25, 0.5, 0.75, 1]);

// Blue channel
effects.updateCurves(curvesGradeId, 'blue', [0, 0.35, 0.55, 0.85, 1]);

effects.on('curves:updated', ({ effectId, channel, points }) => {
  console.log(`${channel} curve updated with ${points.length} points`);
});
```

#### Color Grading Completo
```typescript
const fullGradeId = effects.createColorGrade(0, 120, {
  temperature: 10,
  tint: -3,
  exposure: 0.5,
  contrast: 15,
  highlights: -10,
  shadows: 20,
  whites: 5,
  blacks: -5,
  saturation: 12,
  vibrance: 8,
  hue: 5,
});

// Aplicar LUT também
effects.applyLUT(fullGradeId, '/assets/luts/film-look.cube');
```

### 6. Blur Effects (3 minutos)

#### Gaussian Blur
```typescript
const gaussianId = effects.createBlur('gaussian', 0, 5, 20, {
  quality: 'high',
});
```

#### Motion Blur
```typescript
const motionBlurId = effects.createBlur('motion', 0, 3, 30, {
  angle: 45,
  quality: 'ultra',
});
```

#### Radial Blur
```typescript
const radialBlurId = effects.createBlur('radial', 0, 4, 40, {
  center: { x: 0.5, y: 0.5 },
  falloff: 0.7,
  quality: 'high',
});
```

#### Tilt-Shift
```typescript
const tiltShiftId = effects.createBlur('tilt-shift', 0, 5, 25, {
  quality: 'medium',
});
```

#### Bokeh
```typescript
const bokehId = effects.createBlur('bokeh', 0, 5, 50, {
  quality: 'ultra',
});
```

### 7. Distortion Effects (3 minutos)

#### Fisheye
```typescript
const fisheyeId = effects.createDistortion('fisheye', 0, 5, {
  amount: 0.6,
});
```

#### Lens Correction
```typescript
const lensId = effects.createDistortion('lens', 0, 10, {
  amount: 0.3,
});
```

#### Wave Distortion
```typescript
const waveId = effects.createDistortion('wave', 0, 8, {
  wavelength: 150,
  frequency: 3,
  amount: 0.5,
});
```

#### Perspective
```typescript
const perspectiveId = effects.createDistortion('perspective', 0, 5, {
  corners: [
    { x: 0.1, y: 0.1 },
    { x: 0.9, y: 0.05 },
    { x: 0.95, y: 0.95 },
    { x: 0.05, y: 0.9 },
  ],
});
```

### 8. Time Effects (4 minutos)

#### Slow Motion
```typescript
const slowMoId = effects.createTimeEffect('slow', 10, 5, 0.5, {
  interpolation: 'optical-flow',
});
```

#### Fast Motion (Time-lapse)
```typescript
const fastId = effects.createTimeEffect('fast', 0, 10, 3, {
  interpolation: 'frame-blend',
});
```

#### Reverse
```typescript
const reverseId = effects.createTimeEffect('reverse', 0, 5, 1);
```

#### Freeze Frame
```typescript
const freezeId = effects.createTimeEffect('freeze', 15, 3, 0, {
  freezeFrame: 450, // Frame 450
});
```

#### Time Ramp
```typescript
const rampId = effects.createTimeEffect('ramp', 0, 10, 0.5, {
  interpolation: 'optical-flow',
});
```

### 9. Layer System (5 minutos)

#### Criar Layers
```typescript
// Layer principal
const mainLayerId = effects.createLayer('Main Effects');

// Layer de overlay
const overlayLayerId = effects.createLayer('Overlay', 'overlay');

// Layer de screen
const screenLayerId = effects.createLayer('Screen Blend', 'screen');
```

#### Adicionar Efeitos a Layers
```typescript
// Criar efeitos
const blurId = effects.createBlur('gaussian', 0, 10, 15);
const colorId = effects.createColorGrade(0, 10);
const particlesId = effects.createParticleEffect('snow', 0, 10);

// Adicionar a layers
effects.addEffectToLayer(mainLayerId, blurId);
effects.addEffectToLayer(mainLayerId, colorId);
effects.addEffectToLayer(overlayLayerId, particlesId);
```

#### Remover Efeito de Layer
```typescript
effects.removeEffectFromLayer(mainLayerId, blurId);
```

#### Reordenar Layers
```typescript
const layer1 = effects.createLayer('Layer 1');
const layer2 = effects.createLayer('Layer 2');
const layer3 = effects.createLayer('Layer 3');

// Nova ordem: 3, 1, 2
effects.reorderLayers([layer3, layer1, layer2]);

effects.on('layers:reordered', (layerIds) => {
  console.log('Layers reordered:', layerIds);
});
```

#### Blend Modes Disponíveis
```typescript
effects.createLayer('Normal', 'normal');
effects.createLayer('Multiply', 'multiply');
effects.createLayer('Screen', 'screen');
effects.createLayer('Overlay', 'overlay');
effects.createLayer('Add', 'add');
effects.createLayer('Subtract', 'subtract');
```

### 10. Presets (4 minutos)

#### Listar Presets Padrão
```typescript
const cinematic = effects.getPresetsByCategory('cinematic');
const vintage = effects.getPresetsByCategory('vintage');
const horror = effects.getPresetsByCategory('horror');
const sciFi = effects.getPresetsByCategory('sci-fi');

console.log('Cinematic presets:', cinematic);
```

#### Criar Preset Customizado
```typescript
// Criar efeitos individuais
const colorGradeId = effects.createColorGrade(0, 10, {
  temperature: 15,
  saturation: 10,
});

const blurId = effects.createBlur('bokeh', 0, 10, 30);

// Obter configurações dos efeitos
const colorEffect = effects.getEffect(colorGradeId)!;
const blurEffect = effects.getEffect(blurId)!;

// Criar preset
const customPresetId = effects.createPreset(
  'My Cinematic Look',
  'Warm tones with soft bokeh',
  'custom',
  [colorEffect, blurEffect]
);

console.log('Custom preset created:', customPresetId);
```

#### Aplicar Preset
```typescript
const presetId = cinematic[0].id;

// Aplicar preset a partir do timestamp 5
const appliedEffectIds = effects.applyPreset(presetId, 5);

console.log('Applied effects:', appliedEffectIds);

effects.on('preset:applied', ({ presetId, effectIds }) => {
  console.log(`Preset ${presetId} applied with ${effectIds.length} effects`);
});
```

### 11. Effect Management (4 minutos)

#### Obter Efeito
```typescript
const effectId = effects.createBlur('gaussian', 0, 5, 10);
const effect = effects.getEffect(effectId);

console.log(effect);
```

#### Listar Todos os Efeitos
```typescript
const allEffects = effects.getAllEffects();
console.log(`Total effects: ${allEffects.length}`);
```

#### Filtrar por Tipo
```typescript
const blurs = effects.getEffectsByType('blur');
const colorGrades = effects.getEffectsByType('colorgrade');
const particles = effects.getEffectsByType('particle');

console.log('Blur effects:', blurs.length);
```

#### Filtrar por Time Range
```typescript
effects.createBlur('gaussian', 0, 5, 10); // 0-5
effects.createColorGrade(5, 5); // 5-10
effects.createParticleEffect('snow', 10, 5); // 10-15

const effectsInRange = effects.getEffectsInTimeRange(4, 11);

console.log('Effects in range [4, 11]:', effectsInRange.length);
```

#### Toggle Effect
```typescript
const effectId = effects.createBlur('gaussian', 0, 10, 20);

// Desabilitar
effects.toggleEffect(effectId, false);

// Habilitar
effects.toggleEffect(effectId, true);

// Toggle (inverter estado atual)
effects.toggleEffect(effectId);
```

#### Deletar Efeito
```typescript
const effectId = effects.createBlur('gaussian', 0, 5, 10);

effects.deleteEffect(effectId);

effects.on('effect:deleted', (deletedId) => {
  console.log(`Effect ${deletedId} deleted`);
});
```

#### Duplicar Efeito
```typescript
const originalId = effects.createBlur('gaussian', 0, 5, 10);

const duplicateId = effects.duplicateEffect(originalId);

console.log(`Original: ${originalId}, Duplicate: ${duplicateId}`);

effects.on('effect:duplicated', ({ originalId, newId }) => {
  console.log(`Effect duplicated: ${originalId} → ${newId}`);
});
```

### 12. Rendering (3 minutos)

#### Renderizar Frame
```typescript
const effectId1 = effects.createBlur('gaussian', 0, 30, 15);
const effectId2 = effects.createColorGrade(0, 30, { temperature: 10 });

// Renderizar frame 60 no timestamp 2 segundos
const result = await effects.renderFrame(60, 2, {
  quality: 'final',
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  format: 'rgba',
  antialiasing: true,
  motionBlur: true,
});

console.log('Render result:', result);
console.log('Effects applied:', result.effectsApplied);

effects.on('frame:rendered', (renderResult) => {
  console.log(`Frame ${renderResult.frameNumber} rendered!`);
});
```

#### Limpar Cache
```typescript
effects.clearRenderCache();

effects.on('cache:cleared', () => {
  console.log('Render cache cleared');
});
```

### 13. Activities & Stats (3 minutos)

#### Obter Atividades
```typescript
// Últimas 50 atividades
const activities = effects.getActivities();

activities.forEach(activity => {
  console.log(`[${activity.type}] ${activity.description} at ${activity.timestamp}`);
});

// Últimas 10 atividades
const recentActivities = effects.getActivities(10);
```

#### Estatísticas
```typescript
const stats = effects.getStats();

console.log('Total effects:', stats.totalEffects);
console.log('Active effects:', stats.activeEffects);
console.log('Render time:', stats.renderTime, 'ms');
console.log('Cache hit rate:', stats.cacheHitRate);
console.log('Memory usage:', stats.memoryUsage, 'MB');
console.log('GPU usage:', stats.gpuUsage, '%');
```

#### Configuração
```typescript
// Obter config
const config = effects.getConfig();
console.log(config);

// Atualizar config
effects.updateConfig({
  previewQuality: 'high',
  cacheSize: 1000,
  realTimePreview: true,
});

effects.on('config:updated', (newConfig) => {
  console.log('Config updated:', newConfig);
});
```

#### Reset Sistema
```typescript
effects.reset();

effects.on('system:reset', () => {
  console.log('System reset complete');
});
```

---

## 🎬 Caso de Uso Completo: Vídeo Promocional

```typescript
// 1. Criar sistema
const effects = createProEffectsSystem();

// 2. Intro com particles (0-5s)
const confettiId = effects.createParticleEffect('confetti', 0, 5, {
  count: 200,
  intensity: 1.0,
});

// 3. Color grading geral (0-30s)
const colorId = effects.createColorGrade(0, 30, {
  temperature: 12,
  contrast: 15,
  saturation: 10,
  vibrance: 8,
});

// 4. Transição para segundo plano (5s)
const wipeId = effects.createTransition('wipe', 5, 1, {
  direction: 'right',
  feather: 0.3,
});

// 5. Green screen produto (6-20s)
const chromaId = effects.createChromaKey('#00ff00', 6, 14, {
  tolerance: 0.35,
  despill: 0.7,
});

// 6. Slow motion destaque (15-18s)
const slowMoId = effects.createTimeEffect('slow', 15, 3, 0.4, {
  interpolation: 'optical-flow',
});

// 7. Blur de fundo (6-20s)
const blurId = effects.createBlur('bokeh', 6, 14, 40, {
  quality: 'ultra',
});

// 8. Transição de saída (20s)
const zoomOutId = effects.createTransition('zoom', 20, 1.5, {
  direction: 'out',
  easing: 'ease-in',
});

// 9. Aplicar preset cinematic
const cinematicPresets = effects.getPresetsByCategory('cinematic');
effects.applyPreset(cinematicPresets[0].id, 0);

// 10. Organizar em layers
const bgLayer = effects.createLayer('Background');
const fgLayer = effects.createLayer('Foreground', 'normal');
const effectsLayer = effects.createLayer('Effects', 'overlay');

effects.addEffectToLayer(bgLayer, blurId);
effects.addEffectToLayer(fgLayer, chromaId);
effects.addEffectToLayer(effectsLayer, confettiId);
effects.addEffectToLayer(effectsLayer, colorId);

// 11. Renderizar
for (let frame = 0; frame < 900; frame++) {
  const timestamp = frame / 30;
  
  const result = await effects.renderFrame(frame, timestamp, {
    quality: 'final',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    format: 'rgba',
    antialiasing: true,
    motionBlur: true,
  });
  
  console.log(`Frame ${frame} rendered (${result.effectsApplied} effects)`);
}

// 12. Limpar
effects.reset();
```

---

## 📖 Event Listeners

```typescript
// Effect events
effects.on('effect:created', (effect) => { });
effects.on('effect:updated', (effect) => { });
effects.on('effect:deleted', (effectId) => { });
effects.on('effect:toggled', ({ effectId, enabled }) => { });
effects.on('effect:duplicated', ({ originalId, newId }) => { });

// Tracking events
effects.on('tracking:updated', ({ effectId, point }) => { });
effects.on('stabilization:applied', (effect) => { });

// Chroma key events
effects.on('chromakey:detected', ({ effectId, color }) => { });

// Color grading events
effects.on('lut:applied', ({ effectId, lutPath }) => { });
effects.on('curves:updated', ({ effectId, channel, points }) => { });

// Layer events
effects.on('layer:created', (layer) => { });
effects.on('layer:updated', (layer) => { });
effects.on('layers:reordered', (layerIds) => { });

// Preset events
effects.on('preset:created', (preset) => { });
effects.on('preset:applied', ({ presetId, effectIds }) => { });

// Rendering events
effects.on('frame:rendered', (result) => { });
effects.on('cache:cleared', () => { });

// System events
effects.on('config:updated', (config) => { });
effects.on('system:reset', () => { });
effects.on('activity:logged', (activity) => { });

// Error events
effects.on('error', (error) => {
  console.error('Error:', error);
});
```

---

## 🎓 Próximos Passos

1. **Explorar Presets**: Teste todos os presets disponíveis
2. **Combinar Efeitos**: Crie composições complexas com layers
3. **Performance**: Ajuste configurações para seu hardware
4. **Customização**: Crie seus próprios presets
5. **Integração**: Integre com seu pipeline de vídeo

---

**Sistema completo e pronto para uso profissional! 🚀**
